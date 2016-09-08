/*jslint browser: false */
/*global angular */

(function () {
    'use strict';

    var DASHBOARD_STYLES = {
        "dashboardStylist": {
            "skin": {
                //Hide lock button on embedded dashboards for users in Editor role.
                ".dashboardHeader .yui3-lockbutton": {
                    "display": "none"
                },
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
    //JSDoc Module Heading, YAML Title, YAML Description
    /**
     * @module npi-datamart.report
     * @title Data Mart Report
     * @description Module for embedding dashboards and reports on a page
     */
    angular.module('npi-datamart.report', ['npi-datamart.templates', 'npi-datamart.api', 'sky'])
        /**
         * @name bbDataMartReportConfiguration
         * @description Constant used to configure application-wide behavior for the directives in the  `npi-datamart.report` module. Some options must be specified in order to use the directives, while others are optional.
         * @param {Object} api Must be set to an instance of `BBDataMartAPI` that directives should use to work with the Data Mart API in order to authenticate and display reports and dashboards.
         * @param {function} [linkHandler] A function that will handle links clicked in a report or dashboard. When a link is clicked, the function will be called and provided the link's targe URL.
         * @param {function} [drillHandler] A function that will handle drill operations in a report or dashboard. When a drill event is triggered, the function will be called and provided the drill context from the event.
         * @param {Object} [processFilters] Hook for pre-processing filters provided to a report or dashboard directive. This can be used to have more product-friendly naming of filters within the product code that supplies filters to the directives.  This hook allows these filters to be translated into the names expected by the data mart project before being used.
         */
        .constant('bbDataMartReportConfiguration', {
            api: null, //Set to an instance of BBDataMartAPI to use by default for all directives it not otherwise specified                        
            linkHandler: null, //Optionally set to function to handle when links are clicked in the dashboards and reports
            drillHandler: null, //Optionally set to function to handle drill events from reports
            processFilters: null //Optional hook for preprocessing of filters
        })
        .service('bbDataMartReportService', ['bbDataMartReportConfiguration', '$sce', '$window', '$q', '$timeout', 'bbHelp', function (bbDataMartReportConfiguration, $sce, $window, $q, $timeout, bbHelp) {
            var windowIsiOS;

            function isiOS() {
                if (windowIsiOS === undefined) {
                    windowIsiOS = (/iPad|iPod|iPhone/i.test($window.navigator.userAgent));
                }

                return windowIsiOS;
            }

            function getAPI($scope) {
                return $scope.api || bbDataMartReportConfiguration.api;
            }

            function emeddedObjectController($scope, isDashboard) {
                var api = getAPI($scope);

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

                                    if ($scope.noChrome) {
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

                    $scope.$watch('embeddedObjectId', resetiFrameUrl);

                    $scope.$watch('filters', resetiFrameUrl, true);

                    setiFrameUrl();
                    
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
                    });
                });
            }

            function designerController($scope) {
                var api = getAPI($scope);

                api.maintainAuthentication($scope).then(function () {
                    function getEmbedUrl() {
                        return $q(function (resolve) {
                            var tasks = [
                                api.getDataMartId(),
                                api.getApiRoot()
                            ];

                            $q.all(tasks).then(function (values) {
                                var projectId,
                                    reportUrl,
                                    domain;

                                projectId = values[0];
                                domain = values[1];

                                if (projectId && domain) {
                                    reportUrl = domain + '/analyze/embedded/#/';
                                    reportUrl += projectId;
                                    reportUrl += '/reportId/edit';
                                    resolve(reportUrl);
                                }
                            });
                        });
                    }

                    function setiFrameUrl() {
                        $scope.frameUrl = null;
                        getEmbedUrl().then(function (url) {
                            $scope.frameUrl = $sce.trustAsResourceUrl(url);
                        });
                    }

                    setiFrameUrl();
                });
            }

            function link($scope, el) {
                $scope.windowEventCallback = function (e) {
                    var message;

                    //If the message doesn't target the iFrame in this element, then exit
                    if (!(el.find('iframe')[0] && el.find('iframe')[0].contentWindow === e.source)) {
                        if (e.origin === 'https://www.blackbaud.com' && e.data.indexOf('bbHelpKey') > 0) {
                            message = angular.isString(e.data) ? JSON.parse(e.data) : e.data;
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

                    message = angular.isString(e.data) ? JSON.parse(e.data) : e.data;
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
                designerController: ['$scope', function ($scope) {
                    designerController($scope);
                }],
                reportLink: link,
                dashboardLink: link
            };
        }])
        /**
         * @name bbDataMartReport
         * @description Directive for displaying a single data mart report on a page. When loaded, the directive will authenticate with the Data Mart API (if not already authenticated) and ensure authentication is maintained until the directive is destroyed. It will show the specified report as an embedded iFrame on the page.
         * @param {directive} bb-data-mart-report Displays a report as an embedded iFrame.
         * @param {directive} bb-data-mart-report.bb-data-mart-report-id The report ID of the report to be displayed.
         * @param {directive} [bb-data-mart-report.bb-data-mart-report-filters] An object describing filters to be applied to the report using the querystring URL filters feature of reports. The keys and values of this object will be applied as filters.  The `bbDataMartReportConfiguration.processFilters` function, if defined, will be executed on the filters object before it is used.
         * @param {directive} [bb-data-mart-report.bb-data-mart-report-drill-header] Overrides the `bbDataMartReportConfiguration.processFilters` function for a specific directive.
         * @param {directive} [bb-data-mart-report.height] Sets the height attribute of the iFrame.
         * @param {directive} [bb-data-mart-report.width] Sets the width attribute of the iFrame.
         * @param {directive} [bb-data-mart-report.bb-data-mart-report-api] Overrides the default BBDataMartAPI used by the directive.
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
                    frameWidth: '@width',
                    api: '=bbDataMartReportApi'
                },
                link: bbDataMartReportService.reportLink,
                controller: bbDataMartReportService.controller
            };
        }])
        /**
         * Directive for displaying a report dashboard on a page. When loaded, the directive will authenticate with the Data Mart API (if not already authenticated) and ensure authentication is maintained until the directive is destroyed. It will show the specified dashboard as an embedded iFrame on the page. The height of the iFrame will be set automatically based on the height of the dashboard.
         * The embedded dashboard will have Sky NPI CSS styles injected to use a Sky look and feel.
         * The directive also supports embedding help links directly in the dashboards. Clicking these links will cause the Help flyout to open to a specified topic. To embed a help link, use the "Add Web Content" feature in the dashboard designer.  For the url, use `https://www.blackbaud.com/files/support/helpfiles/npi/npi_help.html?helpkey=<<INSERT HELP KEY>>.html`. 
         * @name bbDataMartDashboard
         * @param {directive} bb-data-mart-dashboard
         * @param {directive} bb-data-mart-dashboard.bb-data-mart-dashboard-id The report ID of the dashboard to be displayed.
         * @param {directive} [bb-data-mart-dashboard.bb-data-mart-dashboard-filters] An object describing filters to be applied to the dashboard using the querystring URL filters feature of dahboards. The keys and values of this object will be applied as filters.  The `bbDataMartReportConfiguration.processFilters` function, if defined, will be executed on the filters object before it is used.
         * @param {directive} [bb-data-mart-dashboard.bb-data-mart-dashboard-drill-handler] Overrides the `bbDataMartReportConfiguration.processFilters` function for a specific directive.
         * @param {directive} [bb-data-mart-dashboard.bb-data-mart-dashboard-no-chrome] If true, does not include the dashboard chrome for saving filters and exporting as PDF.
         * @param {directive} [bb-data-mart-dashboard.width] Sets the width attribute of the iFrame.
         * @param {directive} [bb-data-mart-dashboard.bb-data-mart-dashboard-api] Overrides the default BBDataMartAPI used by the directive.
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
                    noChrome: '=bbDataMartDashboardNoChrome',
                    frameWidth: '@width',
                    api: '=bbDataMartDashboardApi'
                },
                link: bbDataMartReportService.dashboardLink,
                controller: bbDataMartReportService.dashboardController
            };
        }])
        /**
         * Directive for creating the effect of reponsive design for dashboards. Data Mart dashboards currently have a fixed width design. This directive provides responsive design by allowing different dashboards to be used at different breakpoints.  A collection of dashboards can be designed to show the same or similar reports in different layouts for the different breakpoints, and this directive will display the correct dashboard based on the size of the device.  If the device width changes (for example, due to changing orientation) the dashboard can change as well.
         * Note that when using a responsive dashboard, the `bb-data-mart-dashboard-no-chrome` option is used to hide the chrome when not viewing on a large (desktop) device.
         * @name bbDataMartResponsiveDashboard
         * @param {directive} bb-data-mart-responsive-dashboard
         * @param {directive} [bb-data-mart-responsive-dashboard.bb-data-mart-responsive-dashboard-xs The dashboard id of the dashboard to display on extra small devices (phone).
         * @param {directive} [bb-data-mart-responsive-dashboard.bb-data-mart-responsive-dashboard-sm The dashboard id of the dashboard to display on small devices (portait tablets).
         * @param {directive} [bb-data-mart-responsive-dashboard.bb-data-mart-responsive-dashboard-lg The dashboard id of the dashboard to display on medium (landscape tablets) and large devices (desktop).  There is no distinction between medium and large devices because the maximum size of a dashboard already fits on the medium device width.
         * @param {directive} [bb-data-mart-responsive-dashboard.bb-data-mart-responsive-dashboard-drill-handler] Overrides the `bbDataMartReportConfiguration.processFilters` function for a specific directive.
         * @param {directive} [bb-data-mart-responsive-dashboard.bb-data-mart-responsive-dashboard-api] Overrides the default BBDataMartAPI used by the directive. 
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
                    drillHandler: '=bbDataMartResponsiveDashboardDrillHandler',
                    api: '=bbDataMartResponsiveDashboardApi'
                },
                controller: bbDataMartReportService.responsiveDashboardController
            };
        }])
        /**
         * Directive for displaying the analytical designer. 
        * @description Directive for displaying the analytical designer on a page. When loaded, the directive will authenticate with the Data Mart API (if not already authenticated) and ensure authentication is maintained until the directive is destroyed. It will show the analytical designer
        as an embedded iFrame on the page.
         * @name bbDataMartDesigner
         * @param {directive} bb-data-mart-designer
         * @param {directive} [bb-data-mart-designer.height] Sets the height attribute of the iFrame.
         * @param {directive} [bb-data-mart-designer.width] Sets the width attribute of the iFrame.
         * @param {directive} [bb-data-mart-designer.bb-data-mart-designer-api] Overrides the default BBDataMartAPI used by the directive.
         */
        .directive('bbDataMartDesigner', ['bbDataMartReportService', function (bbDataMartReportService) {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: 'templates/datamartreport/embedtemplate.html',
                scope: {
                    frameHeight: '@height',
                    frameWidth: '@width',
                    api: '=bbDataMartDesignerApi'
                },
                controller: bbDataMartReportService.designerController
            };
        }]);
}());