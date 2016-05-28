/*global describe, beforeEach, it, module, inject, expect */
/*jslint nomen: true */

(function () {
    'use strict';
    describe('BBDataMartAPI', function () {
        var api,
            sampleDomain = 'http://mydomain.com',
            sampleDataMartId = "someDMID",
            BBDataMartAPI,
            $httpBackend,
            $q;

        function getAPIOptions() {
            return {
                authentication: {
                    getDomain: function () {
                        return $q(function (resolve) {
                            resolve(sampleDomain);
                        });
                    },
                    ensureAuthenticated: function () {
                        return $q(function (resolve) { resolve(); });
                    }
                },
                dataMartId: sampleDataMartId
            };
        }

        function expectObjectUriRequest(id, uri) {
            function validatePost(body) {
                body = JSON.parse(body);
                return body.identifierToUri.length === 1 && body.identifierToUri[0] === id;
            }
            return $httpBackend.expect('POST', sampleDomain + '/gdc/md/' + sampleDataMartId + '/identifiers', validatePost).respond({
                identifiers: [{
                    uri: uri
                }]
            });
        }

        function expectObjectDefinitionRequest(uri, object) {
            return $httpBackend.expect('GET', sampleDomain + uri).respond(object);
        }

        function expectElementsRequest(attributeURI, elementValue, elementUri) {
            return $httpBackend.expect('GET', sampleDomain + attributeURI + '/elements?filter=' + elementValue).respond({
                attributeElements: {
                    elements: [{
                        title: elementValue,
                        uri: elementUri
                    }]
                }
            });
        }

        function expectStartReportExecutionRequest(reportUri, resultUri, context) {
            function validatePost(body) {
                var contextMatch = true;

                body = JSON.parse(body);

                if (context) {
                    contextMatch = JSON.stringify(context) === JSON.stringify(body.report_req.context);
                }

                return body.report_req && body.report_req.report === reportUri && contextMatch;
            }

            return $httpBackend.expect('POST', sampleDomain + '/gdc/app/projects/' + sampleDataMartId + '/execute', validatePost).respond({
                execResult: {
                    dataResult: resultUri
                }
            });
        }

        function expectStartRawReportExecutionRequest(reportUri, resultUri, context) {
            function validatePost(body) {
                var contextMatch = true;

                body = JSON.parse(body);

                if (context) {
                    contextMatch = JSON.stringify(context) === JSON.stringify(body.report_req.context);
                }

                return body.report_req && body.report_req.report === reportUri && contextMatch;
            }

            return $httpBackend.expect('POST', sampleDomain + '/gdc/app/projects/' + sampleDataMartId + '/execute/raw', validatePost).respond({
                execResult: {
                    dataResult: resultUri
                }
            });
        }

        function expectCompleteReportExecutionRequest(resultUri) {
            return $httpBackend.expect('GET', sampleDomain + resultUri).respond();
        }

        function expectReportExecutionRequest(reportUri, context) {
            var resultUri = '/' + new Date().getTime() + '/';

            expectStartReportExecutionRequest(reportUri, resultUri, context);

            return $httpBackend.expect('GET', sampleDomain + resultUri).respond();
        }

        beforeEach(function () {
            module('npi-datamart.api');
        });

        beforeEach(inject(['BBDataMartAPI', '$httpBackend', '$q', function ($BBDataMartAPI, httpBackend, q) {
            BBDataMartAPI = $BBDataMartAPI;
            $q = q;
            $httpBackend = httpBackend;
            api = new BBDataMartAPI(getAPIOptions());
        }]));

        describe('constructor', function () {
            it('requires dataMartId or getDataMartId', function () {
                var error,
                    options;
                try {
                    options = getAPIOptions();
                    options.dataMartId = null;
                    options.getDataMartId = null;
                    api = new BBDataMartAPI(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe('An option for dataMartId or getDataMartId must be provided');

                error = null;
                try {
                    options = getAPIOptions();
                    options.dataMartId = 'foo';
                    options.getDataMartId = null;
                    api = new BBDataMartAPI(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe(null);

                error = null;
                try {
                    options = getAPIOptions();
                    options.dataMartId = null;
                    options.getDataMartId = function () { return false; };
                    api = new BBDataMartAPI(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe(null);
            });

            it('requires authentication', function () {
                var error,
                    options;
                try {
                    options = getAPIOptions();
                    options.authentication = null;
                    api = new BBDataMartAPI(options);
                } catch (err) {
                    error = err;
                }
                expect(error).toBe('An option for authentication must be provided.  This should be a BBDataMartAuthentication used to authenticate with the data mart API.');
            });
        });

        describe('platformIsAvailable', function () {
            it('returns true on success', function () {
                var platformAvailable = false;

                $httpBackend.expect('GET', sampleDomain + '/gdc/ping').respond();

                api.platformIsAvailable().then(function (result) {
                    platformAvailable = result;
                });

                $httpBackend.flush();

                expect(platformAvailable).toBe(true);
            });
        });

        describe('getHeadlineReportData', function () {

            it('returns the requested headline value', function () {
                var actualReportValue,
                    reportId = "asdfsadf",
                    reportUri = '/foo/bar',
                    expectedReportValue = 2002;

                expectObjectUriRequest(reportId, reportUri);

                expectReportExecutionRequest(reportUri).respond({
                    xtab_data: {
                        data: [[expectedReportValue]]
                    }
                });

                api.getHeadlineReportData(reportId).then(function (result) {
                    actualReportValue = result;
                });

                $httpBackend.flush();

                expect(actualReportValue).toBe(expectedReportValue);
            });

            it('applies the specified filters', function () {
                var actualReportValue,
                    attribute = 'attribute1',
                    attributeUri = '/foo/myattribute',
                    attributeValue = 'abc',
                    attributeElementUri = "/uriformyelement",
                    expectedContext,
                    reportId = "asdfsadf",
                    reportUri = '/foo/bar',
                    filters = [{
                        attribute: attribute,
                        value: attributeValue
                    }],
                    expectedReportValue = 2002;

                expectObjectUriRequest(reportId, reportUri);

                expectObjectUriRequest('label.' + attribute, attributeUri);

                expectElementsRequest(attributeUri, attributeValue, attributeElementUri);

                expectedContext = {
                    filters: [{
                        uri: attributeUri,
                        constraint: {
                            type: 'list',
                            elements: [attributeElementUri]
                        }
                    }]
                };

                expectReportExecutionRequest(reportUri, expectedContext).respond({
                    xtab_data: {
                        data: [[expectedReportValue]]
                    }
                });

                api.getHeadlineReportData(reportId, filters).then(function (result) {
                    actualReportValue = result;
                });

                $httpBackend.flush();

                expect(actualReportValue).toBe(expectedReportValue);
            });

            it('will retry fetching the data results if the expected result is not returned', inject(function ($timeout) {
                var actualReportValue = null,
                    reportResultUri = "/somereporturi",
                    reportId = "asdfsadf",
                    reportUri = '/foo/bar',
                    expectedReportValue = 2002;

                expectObjectUriRequest(reportId, reportUri);

                expectStartReportExecutionRequest(reportUri, reportResultUri);
                expectCompleteReportExecutionRequest(reportResultUri).respond(201, { data: {} });

                api.getHeadlineReportData(reportId).then(function (result) {
                    actualReportValue = result;
                });

                $httpBackend.flush();

                expect(actualReportValue).toBe(null);

                expectCompleteReportExecutionRequest(reportResultUri).respond({
                    xtab_data: {
                        data: [[expectedReportValue]]
                    }
                });

                $timeout.flush();

                $httpBackend.flush();

                expect(actualReportValue).toBe(expectedReportValue);
            }));
        });

        describe('getHeadlineReportDrillContext', function () {
            function validateDrillContext(reportUri, drillContext, drillAttribute, drillMetricUri) {
                expect(drillContext).toBeDefined();
                expect(drillContext.reportUri).toBe(reportUri);
                expect(drillContext.executionContext).toBeDefined();
                expect(drillContext.executionContext.drillInto).toBeDefined();
                expect(drillContext.executionContext.drillInto.target).toBe(drillAttribute);
                expect(drillContext.executionContext.drillInto.targetType).toBe('attributeDisplayForm');
                expect(drillContext.executionContext.drillInto.locators).toBeDefined();
                expect(drillContext.executionContext.drillInto.locators.length).toBe(1);
                expect(drillContext.executionContext.drillInto.locators[0].metricLocator).toBeDefined();
                expect(drillContext.executionContext.drillInto.locators[0].metricLocator.uri).toBe(drillMetricUri);
            }

            it('returns a valid drill context for the given report id', function () {
                var drillAttributeDF = 'drillAttributeDF',
                    drillMetricUri = '/drillMetricUri',
                    drillContext,
                    reportId = "asdfsadf",
                    reportUri = '/foo/bar',
                    reportDefinitionPath = '/myreportdefpath',
                    reportDefinitionResult = {
                        reportDefinition: {
                            content: {
                                grid: {
                                    metrics: [
                                        {
                                            drillAcrossStepAttributeDF: drillAttributeDF,
                                            uri: drillMetricUri
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    reportObject = {
                        report: {
                            content: {
                                definitions: [reportDefinitionPath]
                            }
                        }
                    };

                expectObjectUriRequest(reportId, reportUri);
                expectObjectDefinitionRequest(reportUri, reportObject);
                expectObjectDefinitionRequest(reportDefinitionPath, reportDefinitionResult);

                api.getHeadlineReportDrillContext(reportId).then(function (result) {
                    drillContext = result;
                });

                $httpBackend.flush();

                expect(drillContext).toBeDefined();
                expect(drillContext.executionContext.filters).toBeNull();
                validateDrillContext(reportUri, drillContext, drillAttributeDF, drillMetricUri);
            });

            it('returns a valid drill context with filters for the given report id', function () {
                var attribute = 'attribute1',
                    attributeUri = '/foo/myattribute',
                    attributeValue = 'abc',
                    attributeElementUri = "/uriformyelement",
                    drillAttributeDF = 'drillAttributeDF',
                    drillMetricUri = '/drillMetricUri',
                    drillContext,
                    filters = [{
                        attribute: attribute,
                        value: attributeValue
                    }],
                    reportId = "asdfsadf",
                    reportUri = '/foo/bar',
                    reportDefinitionPath = '/myreportdefpath',
                    reportDefinitionResult = {
                        reportDefinition: {
                            content: {
                                grid: {
                                    metrics: [
                                        {
                                            drillAcrossStepAttributeDF: drillAttributeDF,
                                            uri: drillMetricUri
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    reportObject = {
                        report: {
                            content: {
                                definitions: [reportDefinitionPath]
                            }
                        }
                    };

                expectObjectUriRequest(reportId, reportUri);
                expectObjectUriRequest('label.' + attribute, attributeUri);
                expectObjectDefinitionRequest(reportUri, reportObject);
                expectElementsRequest(attributeUri, attributeValue, attributeElementUri);
                expectObjectDefinitionRequest(reportDefinitionPath, reportDefinitionResult);

                api.getHeadlineReportDrillContext(reportId, filters).then(function (result) {
                    drillContext = result;
                });


                $httpBackend.flush();

                expect(drillContext).toBeDefined();
                expect(drillContext.executionContext.filters).toBeDefined();
                expect(drillContext.executionContext.filters[0].uri).toBe(attributeUri);
                expect(drillContext.executionContext.filters[0].constraint.type).toBe('list');
                expect(drillContext.executionContext.filters[0].constraint.elements[0]).toBe(attributeElementUri);
                validateDrillContext(reportUri, drillContext, drillAttributeDF, drillMetricUri);
            });

        });

        describe('loadDrillInRecordIds', function () {
            it('returns record ids for the specified drill in', function () {
                var actualRecordIds,
                    i,
                    reportUri = 'myReportUri',
                    reportResultUri = '/resulturi',
                    drillContext = { executionContext: 'ec', reportUri: reportUri },
                    expectedRecordIds = ['1', '3', '5'];

                expectStartRawReportExecutionRequest(reportUri, reportResultUri).respond({
                    uri: reportResultUri
                });

                $httpBackend.expect('GET', sampleDomain + reportResultUri).respond('"id", "other data"\n"1","foo"\n"3","bar"\n"5","more"');

                api.loadDrillInRecordIds(drillContext).then(function (result) {
                    actualRecordIds = result;
                });

                $httpBackend.flush();

                expect(actualRecordIds.length).toBe(expectedRecordIds.length);
                for (i = 0; i < actualRecordIds.length; i += 1) {
                    expect(actualRecordIds[i]).toBe(expectedRecordIds[i]);
                }
            });
        });

    });
}());