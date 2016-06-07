/*jslint browser: false */
/*global angular */

(function () {
    'use strict';

    angular.module('npi-datamart.api', ['npi-datamart.authentication'])
        .factory('BBDataMartAPI', ['$q', '$timeout', '$http', function ($q, $timeout, $http) {
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

                function getDataMartId() {
                    return $q(function (resolve, reject) {
                        if (options.dataMartId) {
                            resolve(options.dataMartId);
                        } else {
                            options.getDataMartId().then(resolve).catch(reject);
                        }
                    });
                }

                function getApiRoot() {
                    return authentication.getDomain();
                }

                function getAPIContext() {
                    if (!apiContextPromise) {
                        apiContextPromise = $q(function (resolve, reject) {
                            getApiRoot().then(function (apiRoot) {
                                getDataMartId().then(function (dataMartId) {
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

                function platformIsAvailable() {
                    return $q(function (resolve) {
                        getApiRoot().then(function (apiRoot) {
                            $http.get(apiRoot + '/gdc/ping', {
                                withCredentials: true
                            }).then(function () {
                                resolve(true);
                            }).catch(function () {
                                resolve(false);
                            });
                        });
                    });
                }

                self.platformIsAvailable = platformIsAvailable;

                self.getObjectUriFromIdentifier = function (identifier) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            getObjectUriFromIdentifier(context, identifier).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };

                self.executeReport = function (reportIdentifier, filters) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            executeReport(context, reportIdentifier, filters).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };

                self.getHeadlineReportData = function (reportIdentifier, filters) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            executeReport(context, reportIdentifier, filters).then(function (data) {
                                resolve(getHeadlineDataResults(data));
                            }).catch(reject);
                        }).catch(reject);
                    });
                };

                self.getHeadlineReportDrillContext = function (reportIdentifier, filters) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            getHeadlineReportDrillContext(context, reportIdentifier, filters).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };

                self.loadDrillInRecordIds = function (drillContext) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            loadDrillInRecordIds(context, drillContext).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };

                self.getLatestReportDefinition = function (reportIdentifier) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            getLatestReportDefinition(context, reportIdentifier).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };

                self.getObjectDefinitionByUri = function (objectUri) {
                    return $q(function (resolve, reject) {
                        ensureAuthenticatedContext().then(function (context) {
                            getObjectDefinitionByUri(context, objectUri).then(resolve).catch(reject);
                        }).catch(reject);
                    });
                };
                
                self.maintainAuthentication = function (scope) {
                    return authentication.maintainAuthentication(scope);
                };

                self.getDataMartId = getDataMartId;

                self.getApiRoot = getApiRoot;
            };

            return BBDataMartAPI;
        }]);
}());