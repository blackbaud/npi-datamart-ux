/*jslint browser: false */
/*global angular, setInterval, clearInterval */

(function () {
    'use strict';
    /**
     * @module npi-datamart.authentication
     * @description Authentication module for NPI Datamart
     */
    angular.module('npi-datamart.authentication', [])
        .factory('BBDataMartAuthentication', ['$q', '$http', '$rootScope', function ($q, $http, $rootScope) {
            var BBDataMartAuthentication = function (options) {
                var ensureAuthenticatedPromise,
                    initialAuthPerformed,
                    maintainAuthScopeCount = 0,
                    self = this;

                options = options || {};

                if (!options.domain && !options.getDomain) {
                    throw 'An option for domain or getDomain must be provided';
                }

                if (!options.ssoProvider && !options.getSSOProvider) {
                    throw 'An option for ssoProvider or getSSOProvider must be provided';
                }

                if (!options.getSSOToken) {
                    throw 'An option for getSSOToken must be provided.  This should be a function returning a promise for an SSO token to be used to authenticate with the data mart API.';
                }
                /**
                 * @function getDomain
                 * @description Gets the domain of the environment
                 * 
                 * @return {string} Domain
                 */
                function getDomain() {
                    return $q(function (resolve, reject) {
                        if (options.domain) {
                            resolve(options.domain);
                        } else {
                            options.getDomain().then(resolve).catch(reject);
                        }
                    });
                }
                
                /**
                 * @function getSSOProvider
                 * @description Gets the SSO Provider
                 * 
                 * @return {string} SSO Provider
                 */
                function getSSOProvider() {
                    return $q(function (resolve, reject) {
                        if (options.ssoProvider) {
                            resolve(options.ssoProvider);
                        } else {
                            options.getSSOProvider().then(resolve).catch(reject);
                        }
                    });
                }

                /**
                 * @function getSSOUrl
                 * @description Gets the SSO URL based on the Provider and the Domain
                 * 
                 * @param {string} targetUrl Url of the target for SSO
                 * @return {string} SSO URL
                 */
                function getSSOUrl(targetUrl) {
                    return $q(function (resolve, reject) {
                        var tasks = [
                            options.getSSOToken(),
                            getDomain(),
                            getSSOProvider()
                        ];

                        $q.all(tasks).then(function (values) {
                            var iFrameUrl,
                                reportRootPath,
                                ssoToken,
                                ssoProvider;

                            ssoToken = values[0];
                            reportRootPath = values[1];
                            ssoProvider = values[2];

                            if (ssoToken && ssoProvider) {
                                iFrameUrl = reportRootPath;
                                iFrameUrl += "/gdc/account/customerlogin?sessionId=";
                                iFrameUrl += encodeURIComponent(ssoToken);
                                iFrameUrl += "&serverURL=";
                                iFrameUrl += encodeURIComponent(ssoProvider);
                                iFrameUrl += "&targetURL=";
                                iFrameUrl += encodeURIComponent(targetUrl);

                                resolve(iFrameUrl);
                            }
                        }).catch(reject);
                    });
                }

                /**
                 * @function isUnauthorizedFailure
                 * @description Checks if a failure reason corresponds to a 401 unauthorized response
                 *
                 * @param reason Reason for failure
                 * @return {boolean} Unauthorized Failure
                 */
                function isUnauthorizedFailure(reason) {
                    return reason && reason.status === 401;
                }

                /**
                 * @function getTemporaryToken
                 * @description Requests a temporary token for use with the API
                 *
                 * @return {string} token
                 */
                function getTemporaryToken() {
                    return $q(function (resolve, reject) {
                        getDomain().then(function (domain) {
                            var getTokenUrl = domain + '/gdc/account/token';
                            $http.get(getTokenUrl, { withCredentials: true }).then(function () {
                                resolve();
                            }).catch(reject);
                        }).catch(reject);
                    });
                }

                /**
                 * @function authenticate
                 * @description Performs an SSO with the API, retreiving both a long lived authentication token and a temporary token
                 *
                 * @return {string[]} [Authentication Token, Temporary Token]
                 */
                function authenticate() {
                    return $q(function (resolve, reject) {
                        getSSOUrl('/gdc/account/token').then(function (ssoUrl) {
                            $http.get(ssoUrl, { withCredentials: true }).then(function () {
                                resolve();
                            }).catch(function () {
                                //The request for single sign on failed.  In some cases, such as Google Chrome on iOS, this request
                                //may have actually succesfully logged the user in but the load request goes to the catch block because
                                //of CORS issues.  While not confirmed, this seems to possibly be due to an issue with the fact that
                                //the SSO request returns a 302 to a separate route that then returns a 200.  Due to a browser bug,
                                //the request to the second route may not be including the origin header resulting in a CORS failure.
                                //To better handle that scenario, make a separate call to get an Temporary Token which will either
                                //fail with a 401 or return with a 200 (no 302 redirect needed).  If this succeeds, the SSO was a success.
                                //Otherwise it was a failure.
                                getTemporaryToken().then(function () {
                                    resolve();
                                }).catch(reject);
                            });
                        }).catch(reject);
                    });
                }

                /**
                 * @function ensureTemporaryToken
                 * @description Ensures that the browser has a temporary token by requesting one, and then authenticating if the request fails with a 401
                 * 
                 * @return {string} Temporary token
                 */
                function ensureTemporaryToken() {
                    return $q(function (resolve, reject) {
                        getTemporaryToken().then(function () {
                            resolve();
                        }).catch(function (reason) {
                            if (isUnauthorizedFailure(reason)) {
                                authenticate().then(function () {
                                    resolve();
                                }).catch(reject);
                            } else {
                                reject(reason);
                            }
                        });
                    });
                }
                
                /**
                 * @function ensureAuthenticated
                 * @description Ensures that the client maintains an authenticated token
                 * 
                 * @return {Promise} 
                 */
                function ensureAuthenticated() {
                    if (!ensureAuthenticatedPromise) {
                        ensureAuthenticatedPromise = $q(function (resolve, reject) {
                            var getTokenPromise;

                            if (initialAuthPerformed) {
                                getTokenPromise = ensureTemporaryToken();
                            } else {
                                initialAuthPerformed = true;
                                getTokenPromise = authenticate();
                            }

                            getTokenPromise.then(function () {
                                //The token will expire after 10 minutes.  Clear the promise after 8 minutes to ensure any request after that
                                //will force the token to be renewed.
                                var intervalHandle,
                                    promiseClearTime = (new Date()).getTime() + 480000;

                                //Check back every second to compare current time to the clear time.  Using a frequent interval with a time check
                                //instead of a timeout because timeout is not reliable in scenarios such as hibernation.  This is needed to ensure
                                //we will try to authenticate ASAP after the token has expired.
                                //NOTE: This intentionally uses setInterval instead of $Interval to avoid a digest cycle every second
                                intervalHandle = setInterval(function () {
                                    if ((new Date()).getTime() > promiseClearTime) {
                                        clearInterval(intervalHandle);
                                        ensureAuthenticatedPromise = null;
                                        if (maintainAuthScopeCount > 0) {
                                            $rootScope.$apply(function () {
                                                ensureAuthenticated();
                                            });
                                        }
                                    }
                                }, 1000);
                                resolve();
                            }).catch(function (reason) {
                                //Remove the cached ensureAuthenticatedPromise since it failed.  That way it will
                                //be executed again at the next request.
                                ensureAuthenticatedPromise = null;
                                reject(reason);
                            });
                        });
                    }

                    return ensureAuthenticatedPromise;
                }

                /**
                 * @function maintainAuthentication
                 * @description Ensures that the API is currently authenticated and will ensure the API maintains authentication tokens until the specified scope is destroyed
                 *
                 * @param scope Scope of the authentication
                 * @return {Promise} 
                 */
                function maintainAuthentication($scope) {
                    //Increment the number of scopes requesting that authentication be maintained.
                    maintainAuthScopeCount += 1;

                    //When the scope is destroyed, decrement the count.
                    $scope.$on('$destroy', function () {
                        maintainAuthScopeCount -= 1;
                    });

                    //Return a promise once authentication has been ensured.
                    return $q(function (resolve, reject) {
                        ensureAuthenticated().then(function () {
                            resolve();
                        }).catch(reject);
                    });
                }

                self.getDomain = getDomain;
                self.ensureAuthenticated = ensureAuthenticated;
                self.maintainAuthentication = maintainAuthentication;
            };

            return BBDataMartAuthentication;
        }]);
}());