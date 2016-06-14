/*jslint browser: false */
/*global angular */

(function () {
    'use strict';
    //YAML Title, YAML Description, JSDoc Heading
    /**
     * DataMart API
     * API module for NPI DataMart UX
     * @module npi-datamart.api
     */
    angular.module('npi-datamart.api', ['npi-datamart.authentication'])
        .factory('BBDataMartAPI', ['$q', '$timeout', '$http', function ($q, $timeout, $http) {
            /**
             * An object for interacting with the DataMart APIs
             * @method BBDataMartAPI
             * @param {Object} options Object containing the information for the authentication and datamart
             * @param {BBDataMartAuthentication} options.authentication A BBDataMartAuthentication object
             * @param {string} [options.dataMartId] ID of the datamart
             * @param {Function} [options.getDataMartId] A promise to return the DataMart ID as a string. Required if dataMartId not provided.
             * @param {Function} [options.translateObjectIdentifier] A funtion returning a promise that returns a data mart identifier based on a provided identifier.  This is a hook to allow custom identifier translation.
             * @param {Function} [options.translateFilters] A funtion returning a promise that returns a filters object based on a provided filters object.  This is a hook to allow custom filters translation. 
             * @param {Function} [options.translateAttributeName] A function that returns a translated attribute name based on a provided attribute name.
             * @return {BBDataMartAPI} A class containing methods to handle interactions with the DataMart APIs
             */
            var BBDataMartAPI = function (options) {
                var apiContextPromise,
                    authentication,
                    objectUriPromises = {},
                    self = this;

                options = options || {};
                authentication = options.authentication;

                if (!authentication) {
                    throw 'An option for authentication must be provided.  This should be a BBDataMartAuthentication used to authenticate with the data mart API.';
                }

                if (!options.dataMartId && !options.getDataMartId) {
                    throw 'An option for dataMartId or getDataMartId must be provided';
                }

                /**
                 * Gets the datamart ID
                 * @method getDataMartId
                 * @return {CallExpression} A promise to return the datamart ID as a string
                 */
                self.getDataMartId = function getDataMartId() {
                    return $q(function (resolve, reject) {
                        if (options.dataMartId) {
                            resolve(options.dataMartId);
                        } else {
                            options.getDataMartId().then(resolve).catch(reject);
                        }
                    });
                };

                /**
                 * Get the root of the API
                 * @method getApiRoot
                 * @return {CallExpression} A promise to return the root URL of the API as a string
                 */
                self.getApiRoot = function getApiRoot() {
                    return authentication.getDomain();
                };

                function getAPIContext() {
                    if (!apiContextPromise) {
                        apiContextPromise = $q(function (resolve, reject) {
                            self.getApiRoot().then(function (apiRoot) {
                                self.getDataMartId().then(function (dataMartId) {
                                    resolve({
                                        apiRoot: apiRoot,
                                        dataMartId: dataMartId
                                    });
                                }).catch(reject);
                            }).catch(reject);
                        });
                    }
                    return apiContextPromise;
                }

                function ensureAuthenticatedContext() {
                    return $q(function (resolve, reject) {
                        authentication.ensureAuthenticated().then(function () {
                            getAPIContext().then(function (context) {
                                resolve(context);
                            }).catch(reject);
                        }).catch(reject);
                    });
                }

                function getObjectUriFromIdentifier(context, objectIdentifier) {
                    if (!objectUriPromises[objectIdentifier]) {
                        objectUriPromises[objectIdentifier] = $q(function (resolve, reject) {
                            function lookupUriForObjectId(id) {
                                var postData = {
                                    identifierToUri: [id]
                                };

                                $http.post(context.apiRoot + '/gdc/md/' + context.dataMartId + '/identifiers', postData, {
                                    withCredentials: true
                                }).then(function (result) {
                                    if (result.data && result.data.identifiers && result.data.identifiers[0] && result.data.identifiers[0].uri) {
                                        resolve(result.data.identifiers[0].uri);
                                    } else {
                                        reject();
                                    }
                                }).catch(reject);
                            }

                            if (options.translateObjectIdentifier) {
                                options.translateObjectIdentifier(objectIdentifier).then(function (id) {
                                    lookupUriForObjectId(id);
                                }).catch(reject);
                            } else {
                                lookupUriForObjectId(objectIdentifier);
                            }
                        });
                    }

                    return objectUriPromises[objectIdentifier];
                }

                function getObjectDefinitionByUri(context, objectUri) {
                    return $q(function (resolve, reject) {
                        $http.get(context.apiRoot + objectUri, {
                            withCredentials: true
                        }).then(function (result) {
                            if (result.data) {
                                resolve(result.data);
                            } else {
                                reject();
                            }
                        }).catch(reject);
                    });
                }

                function getSingleElementUri(context, elementsUri, elementValue) {
                    var i,
                        el,
                        elementUri = null;

                    return $q(function (resolve, reject) {
                        $http.get(context.apiRoot + elementsUri + '?filter=' + elementValue, {
                            withCredentials: true
                        }).then(function (result) {
                            if (result.data && result.data.attributeElements && result.data.attributeElements.elements) {
                                for (i = 0; i < result.data.attributeElements.elements.length; i += 1) {
                                    el = result.data.attributeElements.elements[i];
                                    if (el.title.toString() === elementValue.toString()) {
                                        elementUri = el.uri;
                                        break;
                                    }
                                }

                                resolve(elementUri);
                            }
                            resolve(null);
                        }).catch(reject);
                    });
                }

                function getAttributeName(attribute) {
                    if (options.translateAttributeName) {
                        return options.translateAttributeName(attribute);
                    }

                    return attribute;
                }

                function getObjectIdentifierDisplayForm(attribute) {
                    var identifier = null;

                    if (attribute) {
                        if (attribute.lastIndexOf('attr.', 0) === 0) {
                            identifier = attribute.replace('attr.', 'label.');
                        } else {
                            identifier = 'label.' + attribute;
                        }
                    }

                    return identifier;
                }

                function getDataResults(context, dataResultsUri, skipRetry) {
                    return $q(function (resolve, reject) {
                        $http.get(context.apiRoot + dataResultsUri, {
                            withCredentials: true
                        }).then(function (result) {
                            if (!skipRetry && result.data && !result.data.xtab_data) {
                                $timeout(function () {
                                    resolve(getDataResults(context, dataResultsUri, false));
                                }, 3000);
                            } else {
                                resolve(result);
                            }
                        }).catch(reject);
                    });
                }

                function executeReportByPostData(context, postData) {
                    return $q(function (resolve, reject) {
                        $http.post(context.apiRoot + '/gdc/app/projects/' + context.dataMartId + '/execute', postData, {
                            withCredentials: true
                        }).then(function (result) {
                            if (result.data && result.data.execResult && result.data.execResult.dataResult) {
                                resolve(getDataResults(context, result.data.execResult.dataResult));
                            } else {
                                reject();
                            }
                        }).catch(reject);
                    });
                }

                function buildElementFilter(context, filter, objectDisplayFormUri) {
                    var filterObj = {
                        uri: objectDisplayFormUri,
                        constraint: {
                            type: 'list'
                        }
                    },
                        i,
                        tasks = [],
                        values;

                    return $q(function (resolve) {
                        if (filter.value) {
                            if (!Array.isArray(filter.value)) {
                                values = [filter.value];
                            } else {
                                values = filter.value;
                            }

                            for (i = 0; i < values.length; i += 1) {
                                tasks.push(getSingleElementUri(context, objectDisplayFormUri + '/elements', values[i]));
                            }
                            if (tasks.length > 0) {
                                $q.all(tasks).then(function (objectElements) {
                                    filterObj.constraint.elements = objectElements;
                                    resolve(filterObj);
                                });
                            } else {
                                resolve(null);
                            }
                        } else {
                            resolve(null);
                        }
                    });
                }

                function buildReportRequestContext(context, filters) {
                    return $q(function (resolve, reject) {
                        var attributeDisplayForm,
                            i,
                            tasks = [];

                        function buildContext(filters) {
                            var reportRequestContext = {};

                            for (i = 0; i < filters.length; i += 1) {
                                if (filters[i].attribute) {
                                    attributeDisplayForm = getObjectIdentifierDisplayForm(getAttributeName(filters[i].attribute));
                                } else {
                                    attributeDisplayForm = filters[i].attributeDisplayForm;
                                }

                                if (attributeDisplayForm) {
                                    tasks.push(getObjectUriFromIdentifier(context, attributeDisplayForm));
                                } else {
                                    throw new Error('Filter must have an attribute or attribute display form specified');
                                }
                            }

                            //resolve display form uri for all filters
                            $q.all(tasks).then(function (objectDisplayFormUriValues) {
                                tasks = [];
                                for (i = 0; i < filters.length; i += 1) {
                                    if (filters[i].value) {
                                        tasks.push(buildElementFilter(context, filters[i], objectDisplayFormUriValues[i]));
                                    }
                                }
                                if (tasks.length > 0) {
                                    $q.all(tasks).then(function (contextFilters) {
                                        if (contextFilters.length > 0) {
                                            reportRequestContext = {
                                                filters: contextFilters
                                            };
                                        }
                                        resolve(reportRequestContext);
                                    });
                                } else {
                                    resolve(null);
                                }
                            }).catch(reject);
                        }

                        if (filters) {
                            if (options.translateFilters) {
                                options.translateFilters(filters).then(buildContext);
                            } else {
                                buildContext(filters);
                            }
                        } else {
                            resolve(null);
                        }
                    });
                }

                function executeReport(context, reportIdentifier, filters) {
                    return $q(function (resolve, reject) {
                        $q.all([getObjectUriFromIdentifier(context, reportIdentifier), buildReportRequestContext(context, filters)]).then(function (taskResults) {
                            var postData = {},
                                reportRequest = {},
                                reportPath = taskResults[0],
                                contextFilters = taskResults[1];

                            reportRequest.report = reportPath;
                            if (contextFilters) {
                                reportRequest.context = contextFilters;
                            }
                            postData.report_req = reportRequest;

                            executeReportByPostData(context, postData).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                }

                function executeReportRaw(context, postData) {
                    return $q(function (resolve, reject) {
                        function loadReport(uri) {
                            $http.get(uri, {
                                withCredentials: true
                            }).then(function (result) {
                                if (result.data && result.data.uri) {
                                    loadReport(context.apiRoot + result.data.uri);
                                } else {
                                    resolve(result);
                                }
                            }).catch(reject);
                        }

                        $http.post(context.apiRoot + '/gdc/app/projects/' + context.dataMartId + '/execute/raw', postData, {
                            withCredentials: true
                        }).then(function (result) {
                            if (result.data && result.data.uri) {
                                loadReport(context.apiRoot + result.data.uri);
                            } else {
                                resolve(result);
                            }
                        }).catch(reject);
                    });
                }

                function getHeadlineDataResults(result) {
                    var reportData = null,
                        xtabData;

                    if (result.data && result.data.xtab_data && result.data.xtab_data.data) {
                        xtabData = result.data.xtab_data.data;
                        if (xtabData[0] && xtabData[0][0]) {
                            reportData = xtabData[0][0];
                        }
                    }

                    return reportData;
                }

                function getLatestReportDefinition(context, reportIdentifier) {
                    return $q(function (resolve, reject) {
                        getObjectUriFromIdentifier(context, reportIdentifier).then(function (reportUri) {
                            getObjectDefinitionByUri(context, reportUri).then(function (reportObject) {
                                if (reportObject && reportObject.report && reportObject.report.content && reportObject.report.content.definitions) {
                                    getObjectDefinitionByUri(context, reportObject.report.content.definitions.pop()).then(function (reportDefinition) {
                                        resolve(reportDefinition);
                                    }).catch(reject);
                                } else {
                                    reject();
                                }
                            }).catch(reject);
                        }).catch(reject);
                    });
                }

                function getHeadlineReportDrillContext(context, reportIdentifier, filters) {
                    return $q(function (resolve, reject) {
                        var drillAttribute,
                            drillContext,
                            metricUri,
                            response,
                            tasks = [getLatestReportDefinition(context, reportIdentifier),
                                getObjectUriFromIdentifier(context, reportIdentifier)];

                        if (filters) {
                            tasks.push(buildReportRequestContext(context, filters));
                        }

                        $q.all(tasks).then(function (taskResults) {
                            response = taskResults[0];

                            if (response &&
                                    response.reportDefinition &&
                                    response.reportDefinition.content &&
                                    response.reportDefinition.content.grid &&
                                    response.reportDefinition.content.grid.metrics &&
                                    response.reportDefinition.content.grid.metrics[0] &&
                                    response.reportDefinition.content.grid.metrics[0].uri
                                    ) {
                                metricUri = response.reportDefinition.content.grid.metrics[0].uri;
                                drillAttribute = response.reportDefinition.content.grid.metrics[0].drillAcrossStepAttributeDF;
                            }

                            drillContext = {
                                reportUri: taskResults[1],
                                executionContext: {
                                    drillInto: {
                                        locators: [
                                            {
                                                metricLocator: {
                                                    uri: metricUri
                                                }
                                            }
                                        ],
                                        target: drillAttribute,
                                        targetType: "attributeDisplayForm"
                                    },
                                    filters: (filters && taskResults[2] ? taskResults[2].filters : null)
                                }
                            };

                            resolve(drillContext);
                        }).catch(reject);
                    });
                }

                function loadDrillInRecordIds(context, drillContext) {
                    return $q(function (resolve, reject) {
                        var postData = {
                            report_req: {
                                context: drillContext.executionContext,
                                report: drillContext.reportUri
                            }
                        };

                        executeReportRaw(context, postData).then(function (result) {
                            var ids = [],
                                rows;

                            if (result.data) {
                                //Break the CSV into an array or lines, removing the quotes around each field
                                rows = result.data.replace(/"/g, '').split("\n");

                                //Drop the header row
                                rows.shift();

                                angular.forEach(rows, function (row) {
                                    //Take the first column from the row and add it as the ID.  Check to make sure it isn't an empty string or 0 ID
                                    var id = row.split(',')[0];
                                    if (id) {
                                        ids.push(id);
                                    }
                                });

                                resolve(ids);
                            } else {
                                reject();
                            }
                        }).catch(reject);
                    });
                }

                /**
                 * Check if the platform is available.
                 * @method platformIsAvailable
                 * @return {CallExpression} A promise for if the platform is available as a boolean
                 */
                self.platformIsAvailable = function platformIsAvailable() {
                    return $q(function (resolve) {
                        self.getApiRoot().then(function (apiRoot) {
                            $http.get(apiRoot + '/gdc/ping', {
                                withCredentials: true
                            }).then(function () {
                                resolve(true);
                            }).catch(function () {
                                resolve(false);
                            });
                        });
                    });
                };

                /**
                 * Gets the object URI from an identifier
                 * @method getObjectUriFromIdentifier
                 * @param {string} identifier Identifier for a datamart report or dashboard
                 * @return {CallExpression} A promise to return the relative URI for the datamart report or dashboard
                 */
                self.getObjectUriFromIdentifier = function (identifier) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            getObjectUriFromIdentifier(context, identifier).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };

                /**
                 * Execites a report based on an identifier and filters
                 * @method executeReport
                 * @param {string} reportIdentifier Identifier for the report
                 * @param {Object[]} filters Filters for the report
                 * @param {string} [filters[].attribute] The name of the attribute to be filtered
                 * @param {string} [filters[].attributeDisplayForm] The display form of the attribute that will be filtered. This is required if you do not provide attribute
                 * @param {string} filters[].value The filter value
                 * @return {CallExpression} A promise to return the result of the report as an Object
                 */
                self.executeReport = function (reportIdentifier, filters) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            executeReport(context, reportIdentifier, filters).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };

                /**
                 * Executes a report that returns a single data value
                 * @method getHeadlineReportData
                 * @param {string} reportIdentifier Identifier for the report
                 * @param {Object[]} filters Filters for the report
                 * @param {string} [filters[].attribute] The name of the attribute to be filtered
                 * @param {string} [filters[].attributeDisplayForm] The display form of the attribute that will be filtered. This is required if you do not provide attribute
                 * @param {string} filters[].value The filter value
                 * @return {CallExpression} A promise to return the result of the report as a single string
                 */
                self.getHeadlineReportData = function (reportIdentifier, filters) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            executeReport(context, reportIdentifier, filters).then(function (data) {
                                resolve(getHeadlineDataResults(data));
                            }).catch(reject);
                        }).catch(reject);
                    });
                };

                /**
                 * Gets an object that can be used to drill into the context of a headline report
                 * @method getHeadlineReportDrillContext
                 * @param {string} reportIdentifier Identifier for the report
                 * @param {Object[]} filters Filters for the report
                 * @param {string} [filters[].attribute] The name of the attribute to be filtered
                 * @param {string} [filters[].attributeDisplayForm] The display form of the attribute that will be filtered. This is required if you do not provide attribute
                 * @param {string} filters[].value The filter value
                 * @return {CallExpression} A promise that will return an object to be used to drill into the context of a headline report
                 */
                self.getHeadlineReportDrillContext = function (reportIdentifier, filters) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            getHeadlineReportDrillContext(context, reportIdentifier, filters).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };

                /**
                 * Load the drilled in records from a context
                 * @method loadDrillInRecordIds
                 * @param {Object} drillContext Context from the getHeadlineReportDrillContext or from a datamart directive
                 * @return {CallExpression} A promise to return the drilled in records object
                 */
                self.loadDrillInRecordIds = function (drillContext) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            loadDrillInRecordIds(context, drillContext).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };

                /**
                 * Gets the latest report definition
                 * @method getLatestReportDefinition
                 * @param {string} reportIdentifier Identifier for the report
                 * @return {CallExpression} A promise to return the most recent definition of the report as an object
                 */
                self.getLatestReportDefinition = function (reportIdentifier) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            getLatestReportDefinition(context, reportIdentifier).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };

                /**
                 * Get an object definition by a URI
                 * @method getObjectDefinitionByUri
                 * @param {string} objectUri URI of the object
                 * @return {CallExpression} A promise to return the object based on a URI
                 */
                self.getObjectDefinitionByUri = function (objectUri) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            getObjectDefinitionByUri(context, objectUri).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };
                
                /**
                 * Maintains the authentication
                 * @method maintainAuthentication
                 * @param {Object} scope
                 * @return {CallExpression} A promise to let you know when the authentication is maintained
                 */
                self.maintainAuthentication = function (scope) {
                    return authentication.maintainAuthentication(scope);
                };

            };

            return BBDataMartAPI;
        }]);
}());
/*jslint browser: false */
/*global angular, setInterval, clearInterval */

(function () {
    'use strict';
    //YAML Title, YAML Description, JSDoc Heading
    /**
     * DataMart Authentication
     * Authentication module for NPI DataMart UX
     * @module npi-datamart.authentication
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
                };
                
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
                            self.getDomain(),
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
                        self.getDomain().then(function (domain) {
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
                };

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
                        self.ensureAuthenticated().then(function () {
                            resolve();
                        }).catch(reject);
                    });
                };

            };

            return BBDataMartAuthentication;
        }]);
}());
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

            function getAPI() {
                return bbDataMartReportConfiguration.api;
            }

            function emeddedObjectController($scope, isDashboard) {
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

                    $scope.$watch('embeddedObjectId', setiFrameUrl);

                    $scope.$watch('filters', setiFrameUrl, true);

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
                    noChrome: '=bbDataMartDashboardNoChrome',
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
/*jslint browser: false */
/*global angular*/

(function () {
    'use strict';
    
    var modules = [
        //'sky',
        'npi-datamart.authentication',
        'npi-datamart.api',
        'npi-datamart.report',
        'npi-datamart.templates'
    ];

    angular.module('npi-datamart', modules);
}());
angular.module('npi-datamart.templates', []).run(['$templateCache', function($templateCache) {
    $templateCache.put('templates/datamartreport/embedtemplate.html',
        '<div>\n' +
        '  <iframe height="{{frameHeight}}" width="{{frameWidth}}" ng-if="frameUrl" ng-src="{{frameUrl}}" frameborder="0" allowtransparency="false"></iframe>\n' +
        '</div>\n' +
        '');
    $templateCache.put('templates/datamartreport/responsivedashboard.html',
        '<div style="text-align:center">\n' +
        '  <div ng-if="breakPoints.xs">\n' +
        '    <bb-data-mart-dashboard bb-data-mart-dashboard-drill-handler="drillHandler" bb-data-mart-dashboard-id="xsId" width="340px" bb-data-mart-dashboard-no-chrome="true"></bb-data-mart-dashboard>\n' +
        '  </div>\n' +
        '  <div ng-if="breakPoints.sm">\n' +
        '    <bb-data-mart-dashboard bb-data-mart-dashboard-drill-handler="drillHandler" bb-data-mart-dashboard-id="smId" width="776px" bb-data-mart-dashboard-no-chrome="true"></bb-data-mart-dashboard>\n' +
        '  </div>\n' +
        '  <div ng-if="breakPoints.md">\n' +
        '    <bb-data-mart-dashboard bb-data-mart-dashboard-drill-handler="drillHandler" bb-data-mart-dashboard-id="lgId" width="100%"  bb-data-mart-dashboard-no-chrome="true"></bb-data-mart-dashboard>\n' +
        '  </div>\n' +
        '  <div ng-if="breakPoints.lg">\n' +
        '    <bb-data-mart-dashboard bb-data-mart-dashboard-drill-handler="drillHandler" bb-data-mart-dashboard-id="lgId" width="100%"></bb-data-mart-dashboard>\n' +
        '  </div>\n' +
        '</div>\n' +
        '');
}]);

//# sourceMappingURL=npi-datamart.js.map