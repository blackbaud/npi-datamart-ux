/*global jasmine, describe, afterEach, beforeEach, it, module, inject, expect */
/*jslint nomen: true */

(function () {
    'use strict';
    describe('BBDataMartAuthentication', function () {
        var auth,
            BBDataMartAuthentication,
            sampleSSOToken = "some token",
            sampleDomain = "http://sampledomain.com",
            sampleSSOProvider = "sampleSSOProvider",
            $httpBackend,
            $q;

        function getAuthOptions() {
            return {
                domain: sampleDomain,
                ssoProvider: sampleSSOProvider,
                getSSOToken: function () {
                    var deferred = $q.defer();
                    deferred.resolve(sampleSSOToken);
                    return deferred.promise;
                }
            };
        }

        beforeEach(function () {
            module('npi-datamart.authentication');
        });

        beforeEach(inject(['BBDataMartAuthentication', '$q', '$httpBackend', function ($BBDataMartAuthentication, q, httpBackend) {
            BBDataMartAuthentication = $BBDataMartAuthentication;
            $q = q;
            $httpBackend = httpBackend;
            auth = new BBDataMartAuthentication(getAuthOptions());
        }]));

        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        function expectAuthenticateRequest() {
            return $httpBackend.expect('GET', sampleDomain + '/gdc/account/customerlogin?sessionId=' + encodeURIComponent(sampleSSOToken) + '&serverURL=' + sampleSSOProvider + '&targetURL=%2Fgdc%2Faccount%2Ftoken').respond();
        }

        function expectTemporaryTokenRequest() {
            return $httpBackend.expect('GET', sampleDomain + '/gdc/account/token').respond();
        }

        describe('constructor', function () {
            it('requires domain or getDomain', function () {
                var error,
                    options;
                try {
                    options = getAuthOptions();
                    options.domain = null;
                    options.getDomain = null;
                    auth = new BBDataMartAuthentication(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe('An option for domain or getDomain must be provided');

                error = null;
                try {
                    options = getAuthOptions();
                    options.domain = 'foo';
                    options.getDomain = null;
                    auth = new BBDataMartAuthentication(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe(null);

                error = null;
                try {
                    options = getAuthOptions();
                    options.domain = null;
                    options.getDomain = function () {
                        return false;
                    };
                    auth = new BBDataMartAuthentication(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe(null);
            });

            it('requires ssoProvider or getSSOProvider', function () {
                var error,
                    options;
                try {
                    options = getAuthOptions();
                    options.ssoProvider = null;
                    options.getSSOProvider = null;
                    auth = new BBDataMartAuthentication(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe('An option for ssoProvider or getSSOProvider must be provided');

                error = null;
                try {
                    options = getAuthOptions();
                    options.ssoProvider = 'foo';
                    options.getSSOProvider = null;
                    auth = new BBDataMartAuthentication(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe(null);

                error = null;
                try {
                    options = getAuthOptions();
                    options.ssoProvider = null;
                    options.getSSOProvider = function () {
                        return false;
                    };
                    auth = new BBDataMartAuthentication(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe(null);
            });

            it('requires getSSOToken', function () {
                var error,
                    options;
                try {
                    options = getAuthOptions();
                    options.getSSOToken = null;
                    auth = new BBDataMartAuthentication(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe('An option for getSSOToken must be provided.  This should be a function returning a promise for an SSO token to be used to authenticate with the data mart API.');
            });
        });

        describe('ensureAuthenticated', function () {

            it('will authenticate when it is first called', function () {
                var resolved = false;

                expectAuthenticateRequest();
                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                //The first time you ensureAuthenticated it should do a full authentication
                expect(resolved).toBe(true);
            });

            it('works with getDomain and getSSOProvider', function () {
                var resolved = false,
                    options;

                options = getAuthOptions();
                options.domain = null;
                options.ssoProvider = null;
                options.getDomain = function () {
                    var deferred = $q.defer();
                    deferred.resolve(sampleDomain);
                    return deferred.promise;
                };
                options.getSSOProvider = function () {
                    var deferred = $q.defer();
                    deferred.resolve(sampleSSOProvider);
                    return deferred.promise;
                };
                auth = new BBDataMartAuthentication(options);

                expectAuthenticateRequest();
                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                //The first time you ensureAuthenticated it should do a full authentication
                expect(resolved).toBe(true);
            });

            it('will try to get a temporary token if authentication fails', function () {
                var resolved;

                expectAuthenticateRequest().respond(401);
                expectTemporaryTokenRequest().respond(); //Expect a Temporary token request after the initial auth fails
                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });

                $httpBackend.flush();

                expect(resolved).toBe(true);
            });

            it('will raise error if authentication fails and temporary token fails', function () {
                var rejected;

                expectAuthenticateRequest().respond(401);
                expectTemporaryTokenRequest().respond(401); //Expect a Temporary token request after the initial auth fails
                auth.ensureAuthenticated().catch(function () {
                    rejected = true;
                });

                $httpBackend.flush();

                expect(rejected).toBe(true);
            });

            it('will try again to authenticate when requested after a failure', function () {
                var resolved = false,
                    rejected = false;

                ///////////////////////////////////////////////////////
                //Call ensureAuthenticated initially and have it fail
                expectAuthenticateRequest().respond(401);
                expectTemporaryTokenRequest().respond(401); //Expect a Temporary token request after the initial auth fails
                auth.ensureAuthenticated().catch(function () {
                    rejected = true;
                });
                $httpBackend.flush();

                expect(rejected).toBe(true);
                ///////////////////////////////////////////////////////

                ///////////////////////////////////////////////////////
                //Call ensureAuthenticated again and ensure it authenticates a second time
                expectTemporaryTokenRequest().respond(401);
                expectAuthenticateRequest();

                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                expect(resolved).toBe(true);
                ///////////////////////////////////////////////////////
            });

            it('will not authenticate if called soon after the first call', inject(function ($rootScope, $interval) {
                var baseTime,
                    resolved = false;

                baseTime = new Date();
                jasmine.clock().mockDate(baseTime);

                ///////////////////////////////////////////////////////
                //Call ensureAuthenticated initially and have it succeed
                expectAuthenticateRequest();
                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                expect(resolved).toBe(true);
                ///////////////////////////////////////////////////////

                resolved = false;

                ///////////////////////////////////////////////////////
                //Call ensureAuthenticated again, shortly after first request, and ensure it does not authenticate again
                //Wait less than the 8 minute cutoff
                jasmine.clock().tick(400000);
                $interval.flush(1001);

                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });

                //No requests to flush, so force a digest
                $rootScope.$apply();

                expect(resolved).toBe(true);
            }));

            it('will request temporary token if called long after the first call', inject(function ($interval) {
                var baseTime,
                    resolved = false;

                baseTime = new Date();
                jasmine.clock().mockDate(baseTime);

                ///////////////////////////////////////////////////////
                //Call ensureAuthenticated initially and have it succeed
                expectAuthenticateRequest();
                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                expect(resolved).toBe(true);
                ///////////////////////////////////////////////////////

                resolved = false;

                ///////////////////////////////////////////////////////
                //Call ensureAuthenticated again, long after first request, and ensure it requests a new temporary token
                //Wait less than the 8 minute cutoff
                jasmine.clock().tick(481000);
                $interval.flush(1001);

                expectTemporaryTokenRequest();
                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                expect(resolved).toBe(true);
            }));

            it('will do full authenticaiton if temporary token fails with unauthorized when called long after the first call', inject(function ($interval) {
                var baseTime,
                    resolved = false;

                baseTime = new Date();
                jasmine.clock().mockDate(baseTime);

                ///////////////////////////////////////////////////////
                //Call ensureAuthenticated initially and have it succeed
                expectAuthenticateRequest();
                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                expect(resolved).toBe(true);
                ///////////////////////////////////////////////////////

                resolved = false;

                ///////////////////////////////////////////////////////
                //Call ensureAuthenticated again, long after first request, and ensure it requests a new temporary token
                //Wait less than the 8 minute cutoff
                jasmine.clock().tick(481000);
                $interval.flush(1001);

                expectTemporaryTokenRequest().respond(401);
                expectAuthenticateRequest().respond();
                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                expect(resolved).toBe(true);
            }));

            it('will fail instead of doing full authenticaiton if temporary token fails with unexpected error when called long after the first call', inject(function ($interval) {
                var baseTime,
                    rejected = false,
                    resolved = false;

                baseTime = new Date();
                jasmine.clock().mockDate(baseTime);

                ///////////////////////////////////////////////////////
                //Call ensureAuthenticated initially and have it succeed
                expectAuthenticateRequest();
                auth.ensureAuthenticated().then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                expect(resolved).toBe(true);
                ///////////////////////////////////////////////////////

                resolved = false;

                ///////////////////////////////////////////////////////
                //Call ensureAuthenticated again, long after first request, and ensure it requests a new temporary token
                //Wait less than the 8 minute cutoff
                jasmine.clock().tick(481000);
                $interval.flush(1001);

                expectTemporaryTokenRequest().respond(400);
                auth.ensureAuthenticated().catch(function () {
                    rejected = true;
                });
                $httpBackend.flush();

                expect(rejected).toBe(true);
            }));
        });

        describe('maintainAuthentication', function () {

            it('will cause an immediate re-authentication after a long wait if scope is stil alive', inject(function ($rootScope, $interval) {
                var $scope = $rootScope.$new(),
                    baseTime,
                    resolved = false;

                baseTime = new Date();
                jasmine.clock().mockDate(baseTime);

                ///////////////////////////////////////////////////////
                //Maintain auth for a scope
                expectAuthenticateRequest();
                auth.maintainAuthentication($scope).then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                expect(resolved).toBe(true);
                ///////////////////////////////////////////////////////

                ///////////////////////////////////////////////////////
                //Wait a long time, and verify that authentication is renewed
                expectTemporaryTokenRequest();

                jasmine.clock().tick(481000);
                $interval.flush(1001);

                $httpBackend.flush();
            }));

            it('will not cause an immediate re-authentication after a long wait if scope has been destroyed', inject(function ($rootScope, $interval) {
                var $scope = $rootScope.$new(),
                    baseTime,
                    resolved = false;

                baseTime = new Date();
                jasmine.clock().mockDate(baseTime);

                ///////////////////////////////////////////////////////
                //Maintain auth for a scope
                expectAuthenticateRequest();
                auth.maintainAuthentication($scope).then(function () {
                    resolved = true;
                });
                $httpBackend.flush();

                expect(resolved).toBe(true);
                ///////////////////////////////////////////////////////


                ///////////////////////////////////////////////////////
                //Wait a long time, and verify that authentication is not renewed because scope was destroyed
                $scope.$destroy();

                jasmine.clock().tick(481000);
                $interval.flush(1001);
            }));

        });
    });
}());
