/*jslint browser: false */
/*global angular */

(function () {
    'use strict';

    var DASHBOARD_STYLES = {
        "dashboardStylist": {
            "skin": {
                "body.white": {
                    "background": "#f3f3f4"
                },
                ".yui3-c-textdashboardwidget-middleText .yui3-c-textdashboardwidget-ipe, .yui3-c-textdashboardwidget-middleText .yui3-c-textdashboardwidget-label": {
                    "font-size": "22px",
                    "color": "#292a2b",
                    "font-family": "Oswald",
                    "font-weight": "100",
                    "height": "40px"
                },
                ".yui3-c-textdashboardwidget-smallText .yui3-c-textdashboardwidget-ipe, .yui3-c-textdashboardwidget-smallText .yui3-c-textdashboardwidget-label": {
                    "font-size": "14px",
                    "color": "#292a2b",
                    "font-weight": "600"
                },
                ".yui3-c-onenumberreport .description": {
                    "font-size": "13px !important",
                    "line-height": "normal",
                    "color": "#292a2b"
                },
                ".yui3-c-onenumberreport .number": {
                    "font-size": "26px !important",
                    "font-family": "Oswald",
                    "line-height": "normal",
                    "color": "#292a2b"
                },
                ".yui3-c-tabfilteritem .filterItemTitle, .yui3-c-dashboardwidget-editMode .yui3-c-tabfilteritem .titleContainer input": {
                    "text-transform": "none",
                    "font-size": "12px",
                    "color": "#292a2b"
                },
                "body": {
                    "font-family": "Open Sans"
                },
                "text": {
                    "font-family": "Open Sans"
                },
                ".yui3-c-linedashboardwidget .lineContent": {
                    "background": "#e7eaec",
                    "left": "0px"
                }
            },
            "extraFonts": { 'googlefonts': ['Oswald', 'Open Sans'] }
        }
    };
    //YAML Title, YAML Description, JSDoc Heading
    /**
     * DataMart Report
     * Authentication module for NPI DataMart UX  
     * @module npi-datamart.report
     */
    angular.module('npi-datamart.report', ['npi-datamart.templates', 'npi-datamart.api', 'sky'])
        .constant('bbDataMartReportConfiguration', {
            processFilters: null, //Optional hook for preprocessing of filters
            api: null, //Set to an instance of BBDataMartAPI to use by default for all directives it not otherwise specified
            linkHandler: null, //Optionally set to function to handle when links are clicked in the dashboards and reports
            drillHandler: null //Optionally set to function to handle drill events from reports
        })
        .service('bbDataMartReportService', ['bbDataMartReportConfiguration', '$sce', '$window', '$q', '$timeout', 'bbMediaBreakpoints', 'bbHelp', function (bbDataMartReportConfiguration, $sce, $window, $q, $timeout, bbMediaBreakpoints, bbHelp) {
            var windowIsiOS;

            function isiOS() {
                if (windowIsiOS === undefined) {
                    windowIsiOS = (/iPad|iPod|iPhone/i.test($window.navigator.userAgent));
                }

                return windowIsiOS;
            }

            function getAPI() {
                return bbDataMartReportConfiguration.api;
            }

            function emeddedObjectController($scope, isDashboard, isResponsive) {
                var api = getAPI();

                api.maintainAuthentication($scope).then(function () {
                    var windowEl = angular.element($window),
                        windowEventId = $scope.$id;

                    function getEmbedUrl(objectId, filters, isDashboard, handleDrill) {
                        return $q(function (resolve) {
                            var tasks = [
                                api.getDataMartId(),
                                api.getObjectUriFromIdentifier(objectId),
                                api.getApiRoot()
                            ];

                            if (filters && bbDataMartReportConfiguration.processFilters) {
                                tasks.push(bbDataMartReportConfiguration.processFilters(filters));
                            }

                            $q.all(tasks).then(function (values) {
                                var projectId,
                                    objectPath,
                                    reportUrl,
                                    domain;

                                projectId = values[0];
                                objectPath = values[1];
                                domain = values[2];

                                if (values[3]) {
                                    filters = values[3];
                                }

                                if (projectId && objectPath && domain) {
                                    if (isDashboard) {
                                        reportUrl = '/dashboard.html?';
                                    } else {
                                        reportUrl = '/reportWidget.html?';
                                    }

                                    if (filters) {
                                        angular.forEach(filters, function (value, key) {
                                            reportUrl += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
                                        });
                                    }

                                    reportUrl += '#project=/gdc/projects/';
                                    reportUrl += projectId;

                                    if (isDashboard) {
                                        reportUrl += '&dashboard=';
                                    } else {
                                        reportUrl += '&report=';
                                    }

                                    reportUrl += objectPath;
                                    reportUrl += "&title=no&override=ui.frameinfo";

                                    if (bbDataMartReportConfiguration.linkHandler) {
                                        reportUrl += ",ui.link";
                                    }

                                    if (handleDrill) {
                                        reportUrl += ",ui.drill";
                                    }

                                    if (isResponsive && isDashboard && !bbMediaBreakpoints.getCurrent().lg) {
                                        reportUrl += "&nochrome=true";
                                    }

                                    if (isDashboard) {
                                        reportUrl = domain + '/labs/apps/dashboard_stylist/embed.html?width=100%25&src=' + encodeURIComponent(reportUrl);
                                    } else {
                                        reportUrl = domain + reportUrl;
                                    }

                                    resolve(reportUrl);
                                }
                            });
                        });
                    }

                    function setiFrameUrl() {
                        $scope.frameUrl = null;
                        getEmbedUrl($scope.embeddedObjectId, $scope.filters, isDashboard, $scope.drillHandler || bbDataMartReportConfiguration.drillHandler).then(function (url) {
                            $scope.frameUrl = $sce.trustAsResourceUrl(url);
                        });
                    }

                    function resetiFrameUrl() {
                        $scope.frameUrl = null;
                        $timeout(function () {
                            setiFrameUrl();
                        });
                    }

                    $scope.$watch('embeddedObjectId', setiFrameUrl);

                    $scope.$watch('filters', setiFrameUrl, true);

                    function handleMediaBreakpoint() {
                        setiFrameUrl();
                    }

                    if (isResponsive) {
                        bbMediaBreakpoints.register(handleMediaBreakpoint);
                    } else {
                        setiFrameUrl();
                    }
                    
                    if (isiOS()) {
                        //When the orientation changes on iOS, there is a GoodData bug that causes the report to not be resized correctly.  Reset
                        //the iFrame URL to force it to refresh.
                        windowEl.on('orientationchange.' + windowEventId, resetiFrameUrl);
                    }

                    $scope.handleFrameEvent = function (message) {
                        if (message.type === 'app.ok' && message.name === 'ui.frameinfo') {
                            if (isDashboard && message.data && message.data.height) {
                                //Adding an additional buffer to the height to account for height addd by the dashboard stylist wrapper.
                                $scope.frameHeight = (message.data.height + 20) + 'px';
                            }
                        } else if (message.type === 'app.event') {
                            if (message.name === 'ui.drill') {
                                if ($scope.drillHandler) {
                                    $scope.drillHandler(message.data);
                                } else if (bbDataMartReportConfiguration.drillHandler) {
                                    bbDataMartReportConfiguration.drillHandler(message.data);
                                }
                            } else if (message.name === 'ui.link' && message.data && message.data.uri) {
                                bbDataMartReportConfiguration.linkHandler(message.data.uri);
                            }
                        }
                    };

                    $scope.$on('$destroy', function () {
                        windowEl.off('orientationchange.' + windowEventId);
                        bbMediaBreakpoints.unregister(handleMediaBreakpoint);
                    });
                });
            }

            function link($scope, el) {
                $scope.windowEventCallback = function (e) {
                    var message;

                    //If the message doesn't target the iFrame in this element, then exit
                    if (!(el.find('iframe')[0] && el.find('iframe')[0].contentWindow === e.source)) {
                        if (e.origin === 'https://www.blackbaud.com' && e.data.indexOf('bbHelpKey') > 0) {
                            message = JSON.parse(e.data);
                            if (message.bbHelpKey) {
                                bbHelp.open(message.bbHelpKey);
                            }
                        }
                        return;
                    }

                    if (!$scope.stylesInjected) {
                        if (e.source) {
                            $scope.stylesInjected = true;
                            e.source.postMessage(JSON.stringify(DASHBOARD_STYLES), '*');
                        }
                    }

                    message = JSON.parse(e.data);
                    if (message.gdc) {
                        message = message.gdc;

                        $scope.$apply(function () {
                            $scope.handleFrameEvent(message);
                        });
                    }
                };

                function windowEventCallback(e) {
                    $scope.windowEventCallback(e);
                }

                $window.addEventListener('message', windowEventCallback, false);
                $scope.$on('$destroy', function () {
                    $window.removeEventListener('message', windowEventCallback, false);
                });
            }

            return {
                controller: ['$scope', function ($scope) {
                    emeddedObjectController($scope, false);
                }],
                reportController: ['$scope', function ($scope) {
                    emeddedObjectController($scope, false);
                }],
                dashboardController: ['$scope', function ($scope) {
                    emeddedObjectController($scope, true);
                }],
                responsiveDashboardController: ['$scope', 'bbMediaBreakpoints', function ($scope, bbMediaBreakpoints) {
                    function handleMediaBreakpoint(breakPoints) {
                        $scope.breakPoints = breakPoints;
                    }

                    bbMediaBreakpoints.register(handleMediaBreakpoint);

                    $scope.$on('$destroy', function () {
                        bbMediaBreakpoints.unregister(handleMediaBreakpoint);
                    });
                }],
                reportLink: link,
                dashboardLink: link
            };
        }])
        /**
         * The DataMart Report directive
         * @name bbDataMartReport
         */
        .directive('bbDataMartReport', ['bbDataMartReportService', function (bbDataMartReportService) {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: 'templates/datamartreport/embedtemplate.html',
                scope: {
                    embeddedObjectId: '=bbDataMartReportId',
                    filters: '=bbDataMartReportFilters',
                    drillHandler: '=bbDataMartReportDrillHandler',
                    frameHeight: '@height',
                    frameWidth: '@width'
                },
                link: bbDataMartReportService.reportLink,
                controller: bbDataMartReportService.controller
            };
        }])
        /**
         * The DataMart Dashboard directive
         * @name bbDataMartDashboard
         */
        .directive('bbDataMartDashboard', ['bbDataMartReportService', function (bbDataMartReportService) {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: 'templates/datamartreport/embedtemplate.html',
                scope: {
                    embeddedObjectId: '=bbDataMartDashboardId',
                    filters: '=bbDataMartDashboardFilters',
                    drillHandler: '=bbDataMartDashboardDrillHandler',
                    frameWidth: '@width'
                },
                link: bbDataMartReportService.dashboardLink,
                controller: bbDataMartReportService.dashboardController
            };
        }])
        /**
         * The directive that handles dynamic page events
         * @name bbDataMartResponsiveDashboard
         */
        .directive('bbDataMartResponsiveDashboard', ['bbDataMartReportService', function (bbDataMartReportService) {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: 'templates/datamartreport/responsivedashboard.html',
                scope: {
                    xsId: '=bbDataMartResponsiveDashboardXs',
                    smId: '=bbDataMartResponsiveDashboardSm',
                    lgId: '=bbDataMartResponsiveDashboardLg',
                    drillHandler: '=bbDataMartResponsiveDashboardDrillHandler'
                },
                controller: bbDataMartReportService.responsiveDashboardController
            };
        }]);
}());