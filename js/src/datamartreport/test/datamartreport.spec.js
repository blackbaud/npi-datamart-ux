/*global angular, describe, afterEach, beforeEach, it, module, inject, expect, spyOn */

(function () {
    'use strict';
    describe('bbDataMartReport', function () {
        var $q,
            bbDataMartReportConfiguration,
            linkHandler,
            REPORT_ID_1 = "report_id_1",
            REPORT_ID_2 = "report_id_2",
            DOMAIN = 'testDomain',
            PROJECTID = 'testProjectId',
            REPORT_PATH_1 = 'testReportPath1',
            REPORT_PATH_2 = 'testReportPath2',
            $compile,
            $window,
            maintaingAuth,
            $rootScope,
            $timeout;

        function formatReportFrameUrl(expectedPath) {
            return DOMAIN + '/reportWidget.html?#project=/gdc/projects/' + PROJECTID + '&report=' + expectedPath + '&title=no&override=ui.frameinfo,ui.link';
        }

        beforeEach(function () {
            module('npi-datamart.report');
        });

        beforeEach(inject(['$rootScope', '$q', '$compile', '$window', 'bbDataMartReportConfiguration', '$timeout', function (rootScope, q, compile, window, $bbDataMartReportConfiguration, timeout) {
            maintaingAuth = false;
            $q = q;
            $rootScope = rootScope;
            $compile = compile;
            $window = window;
            $timeout = timeout;


            bbDataMartReportConfiguration = $bbDataMartReportConfiguration;
            bbDataMartReportConfiguration.api = {
                maintainAuthentication: function () {
                    var deferred = $q.defer();
                    maintaingAuth = true;
                    deferred.resolve();
                    return deferred.promise;
                },
                getObjectUriFromIdentifier: function (reportId) {
                    var deferred = $q.defer(),
                        val;
                    if (reportId === REPORT_ID_1) {
                        val = REPORT_PATH_1;
                    }

                    if (reportId === REPORT_ID_2) {
                        val = REPORT_PATH_2;
                    }
                    deferred.resolve(val);
                    return deferred.promise;
                },
                getDataMartId: function () {
                    return $q(function (resolve) {
                        resolve(PROJECTID);
                    });
                },
                getApiRoot: function () {
                    return $q(function (resolve) {
                        resolve(DOMAIN);
                    });
                }
            };

            bbDataMartReportConfiguration.linkHandler = function (url) {
                if (linkHandler) {
                    linkHandler(url);
                }
            };
        }]));

        afterEach(function () {
            $rootScope.$destroy();
        });

        function setUserAgent(agent) {
            /*jslint nomen: true */
            if ($window.navigator.__defineGetter__) {
                $window.navigator.__defineGetter__("userAgent", function () {
                    return agent;
                });
            }
            try {
                $window.navigator = {
                    userAgent: agent
                };
            } catch (e) {
                //Some browsers fail on setting the navigator above, but others require it.
            }
        }

        it('Data mart reports should maintain authentication with GoodData while it is on the page', function () {
            var $scope = $rootScope.$new();

            expect(maintaingAuth).toBe(false);
            
            $compile('<bb-data-mart-report bb-data-mart-report-id="scopeReportId"></bb-data-mart-report>')($scope);
            $scope.$digest();
            expect(maintaingAuth).toBe(true);
        });

        it('Data mart reports should use the API provided as an override in the directive', function () {
            var $scope = $rootScope.$new(),
                localMaintaingAuth = false;
            
            $scope.localAPI = angular.extend(bbDataMartReportConfiguration.api, {
                maintainAuthentication: function () {
                    var deferred = $q.defer();
                    localMaintaingAuth = true;
                    deferred.resolve();
                    return deferred.promise;
                }
            });

            expect(maintaingAuth).toBe(false);
            expect(localMaintaingAuth).toBe(false);

            $compile('<bb-data-mart-report bb-data-mart-report-api="localAPI" bb-data-mart-report-id="scopeReportId"></bb-data-mart-report>')($scope);
            $scope.$digest();

            expect(maintaingAuth).toBe(false);
            expect(localMaintaingAuth).toBe(true);
        });

        it('Data mart reports should create an iframe with the correct URL', function () {
            var $scope = $rootScope.$new(),
                el = $compile('<bb-data-mart-report bb-data-mart-report-id="scopeReportId"></bb-data-mart-report>')($scope);

            $scope.scopeReportId = REPORT_ID_1;

            $scope.$digest();
            $timeout.flush();

            expect(el.find('iframe').length).toBe(1);
            expect(el.find('iframe').attr('src')).toBe(formatReportFrameUrl(REPORT_PATH_1));

            //Changing the report ID should update the iframe URL
            $scope.scopeReportId = REPORT_ID_2;
            $scope.$digest();
            $timeout.flush();
            $scope.$digest();
            expect(el.find('iframe').attr('src')).toBe(formatReportFrameUrl(REPORT_PATH_2));
        });

        it('Data mart reports refresh the iFrame when rotating the device on iOS to force the report to resize', function () {
            var $scope = $rootScope.$new(),
                el = $compile('<bb-data-mart-report bb-data-mart-report-id="scopeReportId"></bb-data-mart-report>')($scope),
                windowEl = angular.element($window);

            setUserAgent('iPad');
            
            $scope.scopeReportId = REPORT_ID_1;

            $scope.$digest();
            $timeout.flush();

            expect(el.find('iframe').attr('src')).toBe(formatReportFrameUrl(REPORT_PATH_1));

            windowEl.trigger('orientationchange');
            $scope.$digest();
            expect(el.find('iframe').length).toBe(0);
            $timeout.flush();
            expect(el.find('iframe').attr('src')).toBe(formatReportFrameUrl(REPORT_PATH_1));
        });

        it('Data mart reports should listen for events from embedded iframe', function (done) {
            var $scope = $rootScope.$new(),
                reportScope,
                el = $compile('<bb-data-mart-report bb-data-mart-report-id="scopeReportId"></bb-data-mart-report>')($scope);

            $scope.scopeReportId = REPORT_ID_1;

            $scope.$digest();
            $timeout.flush();

            expect(el.find('iframe').length).toBe(1);

            reportScope = el.find('iframe').scope().$parent;

            spyOn(reportScope, 'windowEventCallback').and.callFake(function () {
                done();
            });

            $window.postMessage("message", "*");
        });

        it('Data mart reports should fire link handler when links are clicked', function () {
            var $scope = $rootScope.$new(),
                openedUrl,
                data,
                frame,
                reportScope,
                el = $compile('<bb-data-mart-report bb-data-mart-report-id="scopeReportId"></bb-data-mart-report>')($scope);

            $scope.scopeReportId = REPORT_ID_1;

            $scope.$digest();
            $timeout.flush();
            
            frame = el.find('iframe');

            expect(frame.length).toBe(1);

            reportScope = frame.scope().$parent;

            data = {
                gdc: {
                    type: 'app.event',
                    name: 'ui.link',
                    data: {
                        uri: 'http://blackbaud.com'
                    }
                }
            };

            linkHandler = function (url) {
                openedUrl = url;
            };

            reportScope.windowEventCallback({
                source: null,
                data: JSON.stringify(data)
            });

            expect(openedUrl).toBe(data.gdc.data.uri);
        });

        it('Data mart designer should maintain authentication with GoodData while it is on the page', function () {
            var $scope = $rootScope.$new();

            expect(maintaingAuth).toBe(false);
            
            $compile('<bb-data-mart-designer/>')($scope);
            $scope.$digest();
            expect(maintaingAuth).toBe(true);
        });

        it('Data mart designer should use the API provided as an override in the directive', function () {
            var $scope = $rootScope.$new(),
                localMaintaingAuth = false;
            
            $scope.localAPI = angular.extend(bbDataMartReportConfiguration.api, {
                maintainAuthentication: function () {
                    var deferred = $q.defer();
                    localMaintaingAuth = true;
                    deferred.resolve();
                    return deferred.promise;
                }
            });

            angular.extend($scope.localAPI, bbDataMartReportConfiguration.api);

            expect(maintaingAuth).toBe(false);
            expect(localMaintaingAuth).toBe(false);

            $compile('<bb-data-mart-designer bb-data-mart-designer-api="localAPI" />')($scope);
            $scope.$digest();

            expect(maintaingAuth).toBe(false);
            expect(localMaintaingAuth).toBe(true);
        });

        it('KPI Dashboard should create an iframe with the correct URL', function () {
            var $scope = $rootScope.$new(),
                el = $compile('<bb-data-mart-kpi-dashboard/>')($scope);

            $scope.$digest();

            expect(el.find('iframe').length).toBe(1);
            expect(el.find('iframe').attr('src')).toBe(DOMAIN + '/dashboards/embedded/#/project/' + PROJECTID);
        });

        it('KPI Dashboard supporting multiple dashboards should create an iframe with the correct URL', function () {
            var $scope = $rootScope.$new(),
                el = $compile('<bb-data-mart-kpi-dashboard bb-data-mart-kpi-dashboard-multiple="true"/>')($scope);

            $scope.$digest();

            expect(el.find('iframe').length).toBe(1);
            expect(el.find('iframe').attr('src')).toBe(DOMAIN + '/dashboards/embedded/#/project/' + PROJECTID + '?showNavigation=true');
        });

        it('Data mart designer should maintain authentication with GoodData while it is on the page', function () {
            var $scope = $rootScope.$new();

            expect(maintaingAuth).toBe(false);
            
            $compile('<bb-data-mart-kpi-dashboard/>')($scope);
            $scope.$digest();
            expect(maintaingAuth).toBe(true);
        });

        it('KPI Dashboard should use the API provided as an override in the directive', function () {
            var $scope = $rootScope.$new(),
                localMaintaingAuth = false;
            
            $scope.localAPI = angular.extend(bbDataMartReportConfiguration.api, {
                maintainAuthentication: function () {
                    var deferred = $q.defer();
                    localMaintaingAuth = true;
                    deferred.resolve();
                    return deferred.promise;
                }
            });

            angular.extend($scope.localAPI, bbDataMartReportConfiguration.api);

            expect(maintaingAuth).toBe(false);
            expect(localMaintaingAuth).toBe(false);

            $compile('<bb-data-mart-kpi-dashboard bb-data-mart-designer-api="localAPI" />')($scope);
            $scope.$digest();

            expect(maintaingAuth).toBe(false);
            expect(localMaintaingAuth).toBe(true);
        });

        it('KPI Dashboard should create an iframe with the correct URL', function () {
            var $scope = $rootScope.$new(),
                el = $compile('<bb-data-mart-kpi-dashboard/>')($scope);

            $scope.$digest();

            expect(el.find('iframe').length).toBe(1);
            expect(el.find('iframe').attr('src')).toBe(DOMAIN + '/dashboards/embedded/#/project/' + PROJECTID);
        });
    });
}());
