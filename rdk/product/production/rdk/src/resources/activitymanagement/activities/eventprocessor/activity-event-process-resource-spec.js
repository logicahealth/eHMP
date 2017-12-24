'use strict';
var _ = require('lodash');
var bunyan = require('bunyan');
var aep = require('./activity-event-process-resource');
var activityDb = require('../../../../subsystems/jbpm/jbpm-subsystem');
var activitiesResource = require('../activities-operations-resource');

describe('Activity Event Processor', function() {

    describe('applyTemplate', function() {

        it('correctly applies templates when given a valid empty template', function() {
            var inputTemplate = '{"patientName":"Andromeda"}';
            var inputContent = {
                'test': 'test1'
            };
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(inputTemplate);
        });

        it('correctly ignores templates when given an invalid template', function() {
            var inputTemplate = '{"patientName":"{{bad value}"}';
            var inputContent = {
                'bad value': 'dont insert me'
            };
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(inputTemplate);
        });

        it('correctly applies templates when given a valid object', function() {
            var inputTemplate = '{"patientName":"{{content}}"}';
            var inputContent = {
                'content': 'hello'
            };
            var expectedOutput = '{"patientName":"hello"}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly ignores templates when given an invalid object', function() {
            var inputTemplate = '{"patientName":"{{content}}"}';
            var inputContent = {
                'content2': 'hello2'
            };
            var expectedOutput = '{"patientName":""}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly applies nested templates when given a valid object', function() {
            var inputTemplate = '{"patientName":"{{test.content}}"}';
            var inputContent = {
                'test': {
                    'content': 'success'
                }
            };
            var expectedOutput = '{"patientName":"success"}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly applies template value when given special key', function() {
            var inputTemplate = '{"patientName":"stuff","fullBody": {{{obj RAW_REQUEST}}} }';
            var inputContent = {
                'test': {
                    'content': 'success'
                }
            };
            var expectedOutput = '{"patientName":"stuff","fullBody": {"test":{"content":"success"}} }';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly applies full template value when given special key', function() {
            var inputTemplate = '{{{obj RAW_REQUEST}}}';
            var inputContent = {
                'test': {
                    'content': 'success'
                }
            };
            var expectedOutput = '{"test":{"content":"success"}}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });
    });

    describe('startActivityEvent', function() {
        var logger;
        var mockActivityDb;
        var stubConfig;
        var mockActivitiesResource;
        var mockSort;
        var mockInstantiationCheck;

        var rawQueryResponse = [{
            'SIGNAL_NAME': null,
            'SIGNAL_CONTENT': null,
            'EVENT_MTCH_DEF_ID': 'Order.Lab',
            'EVENT_MTCH_VERSION': '1.0',
            'EVENT_MTCH_INST_ID': null,
            'EVENT_ACTION_SCOPE': 'Instantiation',
            'NAME': 'Lab Order Initiation',
            'LISTENER_ID': 104,
            'API_VERSION': '1.0',
            'INSTANCEDEPLOYMENTID': null
        }];

        var formattedResponse = {
            'data': {
                'items': [{
                        'id': 'Activity.Order',
                        'name': 'Order',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:Activity:0.0.0',
                        'deploymentId': 'VistaCore:Activity:0.0.0'
                    },
                    {
                        'id': 'FITLabProject.FITLabActivity',
                        'name': 'FITLabActivity',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:FITLabProject:0.0.0',
                        'deploymentId': 'VistaCore:FITLabProject:0.0.0'
                    },
                    {
                        'id': 'General_Medicine.Note',
                        'name': 'Note',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:General_Medicine:0.0.0',
                        'deploymentId': 'VistaCore:General_Medicine:0.0.0'
                    },
                    {
                        'id': 'Order.Consult',
                        'name': 'Consult',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:Order:0.0.0',
                        'deploymentId': 'VistaCore:Order:0.0.0'
                    },
                    {
                        'id': 'Order.Lab',
                        'name': 'Lab Order Tracking (Generic)',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:Order:0.0.0',
                        'deploymentId': 'VistaCore:Order:0.0.0'
                    },
                    {
                        'id': 'Order.Request',
                        'name': 'Request',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:Order:0.0.0',
                        'deploymentId': 'VistaCore:Order:0.0.0'
                    }
                ]
            }
        };

        beforeEach(function() {
            stubConfig = {
                oracledb: {
                    activityDatabase: {
                        user: 'user',
                        password: 'password',
                        connectString: 'connectString'
                    }
                },
                jbpm: {
                    baseUrl: 'jbpm-url',
                    apiPath: '/jbpm/api/'
                }
            };

            logger = sinon.stub(bunyan.createLogger({
                name: 'activity-event-process-resource-spec'
            }));
        });
        afterEach(function() {
            logger.debug.restore();

            //tests may not have mocked the DB if not required - only restore it if it has been mocked
            if (!_.isUndefined(mockActivityDb) && mockActivityDb.hasOwnProperty('restore')) {
                mockActivityDb.restore();
            }

            if (!_.isUndefined(mockActivitiesResource) && mockActivitiesResource.hasOwnProperty('restore')) {
                mockActivitiesResource.restore();
            }

            if (!_.isUndefined(mockSort) && mockSort.hasOwnProperty('restore')) {
                mockSort.restore();
            }

            if (!_.isUndefined(mockInstantiationCheck) && mockInstantiationCheck.hasOwnProperty('restore')) {
                mockInstantiationCheck.restore();
            }
        });

        it('requires a request body', function(done) {
            var activityEventCallback = function(err, results) {
                expect(err).to.be.equal('201 - Invalid request body');
                done();
            };

            aep.startActivityEvent(null, logger, null, activityEventCallback);
        });

        it('requires a well formed database configuration', function(done) {
            var rawEventRequest = {
                fake: 'body'
            };
            var config = {
                oracledb: {
                    activityDatabase: {
                        userBadKey: '',
                        password: '',
                        connectString: ''
                    }
                }
            };

            var activityEventCallback = function(err, result) {
                expect(err).to.equal('210 - Invalid request configuration');
                done();
            };

            aep.startActivityEvent(rawEventRequest, logger, config, activityEventCallback);
        });

        it('returns an empty result object when unable to find matchable fields to query on', function(done) {
            var rawEventRequest = {};
            var activityEventCallback = function(err, results) {
                expect(err).to.be.null();
                expect(results).to.eql({});
                expect(logger.debug.calledWith('activity-event-process-resource:startActivityEvent After filtering, event processor found no fields to match on. Returning No matches')).to.be.true();
                done();
            };

            aep.startActivityEvent(rawEventRequest, logger, stubConfig, activityEventCallback);
        });

        it('queries for actions when given an input object with fields contained in the matchables array', function(done) {
            var rawEventRequest = {
                domain: 'test-domain',
                subDomain: 'discharge',
                unmatched: 'thrown-away-value'
            };

            //override the default stub with our db test
            mockActivityDb = sinon.stub(activityDb, 'doQueryWithParamsLogger').callsFake(function(logger, activityDatabaseConfig, query, bindVars, cb) {
                expect(bindVars).to.eql(['domain', 'test-domain', 'subdomain', 'discharge']);
                done();
            });

            aep.startActivityEvent(rawEventRequest, logger, stubConfig, function() {});
        });

        it('attempts to find deployments from JBPM when an appropriate match action is retrieved from the database', function(done) {
            var rawEventRequest = {
                domain: 'fake-domain'
            };

            mockActivityDb = sinon.stub(activityDb, 'doQueryWithParamsLogger').callsFake(function(logger, activityDatabaseConfig, query, bindVars, cb) {
                cb(null, rawQueryResponse);
            });

            mockActivitiesResource = sinon.stub(activitiesResource, 'doProcessDefinitionsFetch').callsFake(function(definitionConfig, cb) {
                expect(definitionConfig.url).to.equal('/jbpm/api/deployment/processes?pagesize=2000');
                done();
            });

            aep.startActivityEvent(rawEventRequest, logger, stubConfig, function() {});
        });

        it('attempts to combine DB signal data and deployments info to determine a list of valid deployments', function(done) {
            var rawEventRequest = {
                domain: 'ehmp-activity',
                subDomain: 'order',
                referenceId: 'abc-123'
            };

            mockActivityDb = sinon.stub(activityDb, 'doQueryWithParamsLogger').callsFake(function(logger, activityDatabaseConfig, query, bindVars, cb) {
                return cb(null, rawQueryResponse);
            });

            mockActivitiesResource = sinon.stub(activitiesResource, 'doProcessDefinitionsFetch').callsFake(function(definitionConfig, dpCallback) {
                return dpCallback(null, formattedResponse, rawQueryResponse, logger);
            });

            mockSort = sinon.stub(aep, 'fillInDefinitions').callsFake(function(formattedResponseInput, queryResponseInput, logger, callback) {
                expect(formattedResponseInput).to.eql(formattedResponse);
                expect(queryResponseInput).to.eql(rawQueryResponse);
                done();
            });

            aep.startActivityEvent(rawEventRequest, logger, stubConfig, function() {});
        });

        it('attempts to check if a process has already been instantiated before instantiating', function(done) {
            var testEventRequest = {
                domain: 'ehmp-activity',
                subDomain: 'order',
                referenceId: 'abc-123',
                nope: 'not-here'
            };

            var expectedEventRequest = {
                domain: 'ehmp-activity',
                subDomain: 'order',
                referenceId: 'abc-123'
            };

            mockActivityDb = sinon.stub(activityDb, 'doQueryWithParamsLogger').callsFake(function(logger, activityDatabaseConfig, query, bindVars, cb) {
                return cb(null, rawQueryResponse);
            });

            mockActivitiesResource = sinon.stub(activitiesResource, 'doProcessDefinitionsFetch').callsFake(function(definitionConfig, dpCallback) {
                return dpCallback(null, formattedResponse, rawQueryResponse, logger);
            });

            mockInstantiationCheck = sinon.stub(aep, 'checkIfInstantiated').callsFake(function(listenerId, eventRequest, logger, dbConfig, cb) {
                expect(listenerId).to.equal(104);
                expect(eventRequest).to.eql(expectedEventRequest);
                done();
            });

            aep.startActivityEvent(testEventRequest, logger, stubConfig, function() {});
        });

        it('attempts to instantiate a new activity when one is not instantiated for the corresponding event', function(done) {
            var testEventRequest = {
                domain: 'ehmp-activity',
                subDomain: 'order',
                referenceId: 'abc-123',
                data: {
                    mock: 'data'
                }
            };

            mockActivityDb = sinon.stub(activityDb, 'doQueryWithParamsLogger').callsFake(function(logger, activityDatabaseConfig, query, bindVars, cb) {
                return cb(null, rawQueryResponse);
            });

            mockActivitiesResource = sinon.stub(activitiesResource, 'doProcessDefinitionsFetch').callsFake(function(definitionConfig, dpCallback) {
                return dpCallback(null, formattedResponse, rawQueryResponse, logger);
            });

            mockInstantiationCheck = sinon.stub(aep, 'checkIfInstantiated').callsFake(function(listenerId, eventRequest, logger, dbConfig, cb) {
                cb(null, false);
            });

            var mockStartProcess = sinon.stub(activitiesResource, 'doStartProcess').callsFake(function(jbpmConfig, deploymentId, processDefId, parameters, processCallback) {
                expect(deploymentId).to.equal('VistaCore:Order:0.0.0');
                expect(processDefId).to.equal('Order.Lab');
                expect(parameters).to.eql(aep.wrapEventForInstantiation(deploymentId, processDefId, testEventRequest, logger));
                done();
            });

            aep.startActivityEvent(testEventRequest, logger, stubConfig, function() {});
            mockStartProcess.restore();
        });
    });

    describe('checkIfInstantiated', function() {
        var mockActivityDb;
        var logger;
        var mockDbResult = [];
        var mockDbConfig = {};

        beforeEach(function() {
            mockActivityDb = sinon.stub(activityDb, 'doQueryWithParamsLogger').callsFake(function(logger, activityDatabaseConfig, query, bindVars, cb) {
                cb(null, mockDbResult);
            });

            logger = sinon.stub(bunyan.createLogger({
                name: 'activity-event-process-resource-spec'
            }));
        });

        afterEach(function() {
            mockActivityDb.restore();
            logger.debug.restore();
            mockDbResult = [];
        });

        it('returns false when DB result is empty', function(done) {
            mockDbResult = [];
            var testEventRequest = {
                domain: 'ehmp-activity'
            };
            aep.checkIfInstantiated('1', testEventRequest, logger, mockDbConfig, function(err, result) {
                expect(err).to.be.null();
                expect(result).to.be.false();
                done();
            });
        });

        it('returns true when DB result contains a row', function(done) {
            mockDbResult = ['1'];
            var testEventRequest = {
                domain: 'ehmp-activity'
            };
            aep.checkIfInstantiated('1', testEventRequest, logger, mockDbConfig, function(err, result) {
                expect(err).to.be.null();
                expect(result).to.be.true();
                done();
            });
        });

        it('returns true when DB result contains multiple rows', function(done) {
            mockDbResult = ['1', '1'];
            var testEventRequest = {
                domain: 'ehmp-activity'
            };
            aep.checkIfInstantiated('1', testEventRequest, logger, mockDbConfig, function(err, result) {
                expect(err).to.be.null();
                expect(result).to.be.true();
                done();
            });
        });

        it('returns an error when given no listenerId', function(done) {
            mockDbResult = [];
            var testEventRequest = {
                domain: 'ehmp-activity'
            };
            aep.checkIfInstantiated(null, testEventRequest, logger, mockDbConfig, function(err, result) {
                expect(err).not.to.be.null();
                expect(logger.debug.calledWith('activity-event-process-resource:checkIfInstantiated empty listenerId or event to check - returning error')).to.be.true();
                done();
            });
        });

        it('returns an error when given no eventRequest', function(done) {
            mockDbResult = [];
            aep.checkIfInstantiated('1', null, logger, mockDbConfig, function(err, result) {
                expect(err).not.to.be.null();
                expect(logger.debug.calledWith('activity-event-process-resource:checkIfInstantiated empty listenerId or event to check - returning error')).to.be.true();
                done();
            });
        });
    });

    describe('flattenAndFilter', function() {
        it('flattens', function() {
            var testObject = {
                domain: 'test',
                data: {
                    statusCode: '123'
                }
            };
            var expectedObject = {
                domain: 'test',
                'data.statusCode': '123'
            };
            var result = aep._flattenAndFilter(testObject);
            expect(result).to.eql(expectedObject);
        });
        it('filters based on matchables array', function() {
            var testObject = {
                domain: 'test',
                data: {
                    statusCode: '123',
                    unnecessary: 'totally'
                },
                subDomain: 'test-subdomain',
                irrelevant: 'delete this nephew'
            };
            var expectedObject = {
                domain: 'test',
                'data.statusCode': '123',
                subDomain: 'test-subdomain',
            };
            var result = aep._flattenAndFilter(testObject);
            expect(result).to.eql(expectedObject);
        });
    });

    describe('fillInDefinitions', function() {
        var formattedResponse = {
            'data': {
                'items': [{
                        'id': 'Activity.Order',
                        'name': 'Order',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:Activity:0.0.0',
                        'deploymentId': 'VistaCore:Activity:0.0.0'
                    },
                    {
                        'id': 'FITLabProject.FITLabActivity',
                        'name': 'FITLabActivity',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:FITLabProject:0.0.0',
                        'deploymentId': 'VistaCore:FITLabProject:0.0.0'
                    },
                    {
                        'id': 'General_Medicine.Note',
                        'name': 'Note',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:General_Medicine:0.0.0',
                        'deploymentId': 'VistaCore:General_Medicine:0.0.0'
                    },
                    {
                        'id': 'Order.Consult',
                        'name': 'Consult',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:Order:0.0.0',
                        'deploymentId': 'VistaCore:Order:0.0.0'
                    },
                    {
                        'id': 'Order.Lab',
                        'name': 'Lab Order Tracking (Generic)',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:Order:0.0.0',
                        'deploymentId': 'VistaCore:Order:0.0.0'
                    },
                    {
                        'id': 'Order.Request',
                        'name': 'Request',
                        'version': '1.0',
                        'package-name': 'org.jbpm',
                        'deployment-id': 'VistaCore:Order:0.0.0',
                        'deploymentId': 'VistaCore:Order:0.0.0'
                    }
                ]
            }
        };
        var queryResponse = [{
            'SIGNAL_NAME': null,
            'SIGNAL_CONTENT': null,
            'EVENT_MTCH_DEF_ID': 'Order.Lab',
            'EVENT_MTCH_VERSION': '1.0',
            'EVENT_MTCH_INST_ID': null,
            'EVENT_ACTION_SCOPE': 'Instantiation',
            'NAME': 'Lab Order Initiation',
            'LISTENER_ID': 104,
            'API_VERSION': '1.0',
            'INSTANCEDEPLOYMENTID': null
        }];
        var logger;
        beforeEach(function() {
            logger = sinon.stub(bunyan.createLogger({
                name: 'activity-event-process-resource-spec'
            }));
        });

        afterEach(function() {
            logger.debug.restore();
            logger.warn.restore();
        });

        it('returns an activity definition modified with a list of valid versions', function(done) {
            var expectedResponse = [{
                'SIGNAL_NAME': null,
                'SIGNAL_CONTENT': null,
                'EVENT_MTCH_DEF_ID': 'Order.Lab',
                'EVENT_MTCH_VERSION': '1.0',
                'EVENT_MTCH_INST_ID': null,
                'EVENT_ACTION_SCOPE': 'Instantiation',
                'NAME': 'Lab Order Initiation',
                'LISTENER_ID': 104,
                'API_VERSION': '1.0',
                'INSTANCEDEPLOYMENTID': null,
                'validVersions': ['0.0.0'],
                'DEPLOYMENTID': 'VistaCore:Order:0.0.0',
                'PROCESSDEFINITIONID': 'Order.Lab'
            }];
            aep.fillInDefinitions(formattedResponse, queryResponse, logger, function(err, result) {
                expect(err).to.be.null();
                expect(result).to.eql(expectedResponse);
                done();
            });
        });

        it('logs out warning when mismatch of activity and db results', function(done) {
            var mockQueryResponse = [{
                'SIGNAL_NAME': null,
                'SIGNAL_CONTENT': null,
                'EVENT_MTCH_DEF_ID': 'Order.Medication',
                'EVENT_MTCH_VERSION': '1.0',
                'EVENT_MTCH_INST_ID': null,
                'EVENT_ACTION_SCOPE': 'Instantiation',
                'NAME': 'Med Order Initiation',
                'LISTENER_ID': 104,
                'API_VERSION': '1.0',
                'INSTANCEDEPLOYMENTID': null
            }];
            aep.fillInDefinitions(formattedResponse, mockQueryResponse, logger, function(err, result) {
                expect(err).to.be.null();
                expect(logger.warn.calledOnce).to.be.true();
                done();
            });
        });
    });

    describe('wrapEventForInstantiation', function() {
        var logger = sinon.stub(bunyan.createLogger({
            name: 'activity-event-process-resource-spec'
        }));

        it('sets the deploymentId and processDefId', function() {
            var deploymentId = 'VistaCore:Order:0.0.0';
            var processDefId = 'Order.DischargeFollowup';
            var result = aep.wrapEventForInstantiation(deploymentId, processDefId, {}, logger);
            expect(result.deploymentId).to.equal(deploymentId);
            expect(result.processDefId).to.equal(processDefId);
        });

        it('sets the pid to the pid value of the event object', function() {
            var testPid = 'SITE;9';
            var testObject = {
                subDomain: 'rawrrr',
                pid: testPid
            };
            var result = aep.wrapEventForInstantiation('', '', testObject, logger);
            expect(result.pid).to.equal(testPid);
        });

        it('defaults to setting the subDomain as objectType', function() {
            var subDomainValue = 'notDischarge';
            var testObject = {
                subDomain: subDomainValue
            };
            var result = aep.wrapEventForInstantiation('', '', testObject, logger);
            expect(_.contains(_.keys(result), subDomainValue)).to.be.true();
            expect(result[subDomainValue].objectType).to.eql(subDomainValue);
        });

        it('sets the object type to dischargeFollowup for subdomain discharge', function() {
            var subDomainValue = 'discharge';
            var expectedObjectType = 'dischargeFollowup';
            var testObject = {
                subDomain: subDomainValue
            };
            var result = aep.wrapEventForInstantiation('', '', testObject, logger);
            expect(_.contains(_.keys(result), expectedObjectType)).to.be.true();
            expect(result[expectedObjectType].objectType).to.eql(expectedObjectType);
        });
    });

    describe('generateMatchQuery', function() {
        it('returns an object with the correct expected properties', function() {
            var fields = ['a', 'b'];
            var values = ['1', '2'];
            var returnObject = aep._generateMatchQuery(fields, values);
            expect(_.keys(returnObject)).to.eql(['query', 'bindVars']);
        });

        it('orders fields and values correctly into bindVars', function() {
            var fields = ['field1', 'field2'];
            var values = ['value1', 'value2'];
            var returnObject = aep._generateMatchQuery(fields, values);
            expect(returnObject.bindVars).to.eql(['field1', 'value1', 'field2', 'value2']);
        });
    });

});
