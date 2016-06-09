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
            /**
             * An class to handle authentication with the DataMart APIs
             * @method BBDataMartAuthentication
             * @param {Object} options Object containing the information for domain and single sign on
             * @param {string} options.domain The domain
             * @param {Function} options.getDomain A promise returning the domain
             * @param {string} options.ssoProvider the SSO provider
             * @param {Function} options.getSSOProvider A promise returning the SSO provider
             * @param {Function} options.getSSOToken A promise returning the SSO token
             * @return {BBDataMartAuthentication} The class containing methods to handle authentication on the DataMart API
             */
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
                 * Gets the domain of the environment 
                 * @method getDomain
                 * @return {CallExpression} A promise to get the domain of the environment
                 */
                self.getDomain = function getDomain() {
                    return $q(function (resolve, reject) {
                        if (options.domain) {
                            resolve(options.domain);
                        } else {
                            options.getDomain().then(resolve).catch(reject);
                        }
                    });
                }
                
                function getSSOProvider() {
                    return $q(function (resolve, reject) {
                        if (options.ssoProvider) {
                            resolve(options.ssoProvider);
                        } else {
                            options.getSSOProvider().then(resolve).catch(reject);
                        }
                    });
                }

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

                function isUnauthorizedFailure(reason) {
                    return reason && reason.status === 401;
                }

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
                 * Ensures that the client maintains an authenticated token 
                 * @method ensureAuthenticated
                 * @return {ensureAuthenticatedPromise} A promise to ensure authentication 
                 */
                self.ensureAuthenticated = function ensureAuthenticated() {
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
                 * Ensures that the API is currently authenticated and will ensure the API maintains authentication tokens until the specified scope is destroyed
                 * @method maintainAuthentication
                 * @param {Object} $scope
                 * @return {CallExpression} A promise to maintain authentication
                 */
                self.maintainAuthentication = function maintainAuthentication($scope) {
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

            };

            return BBDataMartAuthentication;
        }]);
}());