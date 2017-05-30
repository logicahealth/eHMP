'use strict';

require('../../../../env-setup');

var uuid = require('node-uuid');

var handle = require(global.VX_HANDLERS + 'vler-sync-request/vler-sync-request-handler');

var _ = require('underscore');
var errorUtil = require(global.VX_UTILS + 'error');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'vler-sync-request-handler-spec',
//     level: 'debug'
// });

var jobUtil = require(global.VX_UTILS + 'job-utils');
var patientIdUtil = require(global.VX_UTILS + 'patient-identifier-utils');

var patientIdentifier = patientIdUtil.create('pid', 'VLER;10110V004877');
var rootJob = jobUtil.createEnterpriseSyncRequest(patientIdentifier, uuid.v4(), false);
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');

var referenceInfo = {
    requestId: 'vler-sync-request-requestId',
    sessionId: 'vler-sync-request-sessionId'
};

var vlerRecord1 = {
    icn: '10110V004877',
    document: {
        homeCommunityId: 'urn:oid:2.16.840.1.113883.3.42.10001.100001.18',
        repositoryUniqueId: '2.16.840.1.113883.3.198',
        documentUniqueId: '5a31395c-b245-4333-b62f-e94fb0c7ae5d',
        mimeType: null,
        name: 'Summarization of episode note',
        authorList: [{
            name: '7.9^Epic - Version 7.9^^^^^^^&1.2.840.114350.1.1&ISO',
            institution: 'HEALTHeLINK'
        }],
        creationTime: '20140616213908',
        sourcePatientId: '1666000001^^^&2.16.840.1.113883.3.42.10001.100001.18&ISO',
        localId: 'urn.oid.2.16.840.1.113883.3.42.10001.100001.18_2.16.840.1.113883.3.198_5a31395c-b245-4333-b62f-e94fb0c7ae5d',
        uid: 'urn:va:vlerdocument:VLER:10110V004877:urn.oid.2.16.840.1.113883.3.42.10001.100001.18_2.16.840.1.113883.3.198_5a31395c-b245-4333-b62f-e94fb0c7ae5d',
        pid: 'VLER;10110V004877'
    },
    uid: 'urn:va:vlerdocument:VLER:10110V004877:urn.oid.2.16.840.1.113883.3.42.10001.100001.18_2.16.840.1.113883.3.198_5a31395c-b245-4333-b62f-e94fb0c7ae5d',
    stampTime: jasmine.any(String),
    pid: 'VLER;10110V004877'
};

function getConfig() {
    var config = {
        'vler': {
            'domains': [],
            'defaults': {
                'host': 'localhost',
                'port': 5400,
                'method': 'GET'
            },
            'vlerdocument': {
                'documentListPath': '/vler/documentList'
            }
        }
    };
    return config;
}

function getEnvironment(log, config) {
    var environment = {
        publisherRouter: {
            publish: function(jobsToPublish, handlerCallback) {
                handlerCallback(null, jobsToPublish);
            }
        },
        jds: new JdsClientDummy(log, config),
        metrics: log
    };

    spyOn(environment.publisherRouter, 'publish').andCallThrough();
    spyOn(environment.jds, 'saveSyncStatus').andCallThrough();

    return environment;
}

describe('vler-sync-request-handler.js', function() {
    describe('handle()', function() {
        it('verify valid job format is accepted', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);

            var config = getConfig();
            var environment = getEnvironment(log, config);
            environment.request = function(queryObj, callback) {
                return callback(null, {
                    'statusCode': 200
                }, {});
            };

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(calledError).toBeNull();
            });
        });

        it('verify missing job is rejected', function() {
            var job = jobUtil.createEnterpriseSyncRequest(patientIdentifier, uuid.v4(), false);

            var config = getConfig();
            var environment = getEnvironment(log, config);

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, null, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(errorUtil.isFatal(calledError)).toBe(true);
                expect(calledError.message).toBe('No job given to handle');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
                expect(job.referenceInfo).toBeUndefined();
            });
        });

        it('verify invalid job type is rejected', function() {
            var job = jobUtil.createEnterpriseSyncRequest(patientIdentifier, uuid.v4(), false);
            var config = getConfig();
            var environment = getEnvironment(log, config);

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(errorUtil.isFatal(calledError)).toBe(true);
                expect(calledError.message).toBe('Incorrect job type');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
                expect(job.referenceInfo).toBeUndefined();
            });
        });

        it('verify invalid job format is rejected', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);
            job.jpid = null; // jpid is required field for this job

            var config = getConfig();
            var environment = getEnvironment(log, config);

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(errorUtil.isFatal(calledError)).toBe(true);
                expect(calledError.message).toBe('Invalid job');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });

        it('verify invalid VLER config', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);

            var environment = getEnvironment(log, {});

            var called;
            var calledError;
            var calledResult;
            handle(log, {}, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(errorUtil.isFatal(calledError)).toBe(true);
                expect(calledError.message).toBe('VLER has no configuration');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });


        it('verify VLER service returns error.', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);

            var config = getConfig();
            var environment = getEnvironment(log, config);
            environment.request = function(queryObj, callback) {
                return callback('Simulated error occurred', null, null);
            };

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(errorUtil.isTransient(calledError)).toBe(true);
                expect(calledError.message).toContain('Unable to retrieve VLER document list via Soap Handler');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });

        it('verify VLER service returns no response.', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);

            var config = getConfig();
            var environment = getEnvironment(log, config);
            environment.request = function(queryObj, callback) {
                return callback(null, null, null);
            };

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(errorUtil.isTransient(calledError)).toBe(true);
                expect(calledError.message).toContain('Unable to retrieve VLER document list via Soap Handler');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });

        it('verify VLER service returns response with status code that is not 200.', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);

            var config = getConfig();
            var environment = getEnvironment(log, config);
            environment.request = function(queryObj, callback) {
                return callback(null, {
                    'statusCode': 500
                }, null);
            };

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(errorUtil.isTransient(calledError)).toBe(true);
                expect(calledError.message).toContain('Unable to retrieve VLER document list via Soap Handler');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });

        it('verify VLER service returns valid response - but body is null.', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);

            var config = getConfig();
            var environment = getEnvironment(log, config);
            environment.request = function(queryObj, callback) {
                return callback(null, {
                    'statusCode': 200
                }, null);
            };

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(errorUtil.isTransient(calledError)).toBe(true);
                expect(calledError.message).toContain('Unable to retrieve VLER document list via Soap Handler');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });

        it('verify VLER service returns valid response - but body is undefined.', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);

            var config = getConfig();
            var environment = getEnvironment(log, config);
            environment.request = function(queryObj, callback) {
                return callback(null, {
                    'statusCode': 200
                });
            };

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(errorUtil.isTransient(calledError)).toBe(true);
                expect(calledError.message).toContain('Unable to retrieve VLER document list via Soap Handler');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });

        it('verify VLER service returns valid response - body contains null documentList.', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);

            var config = getConfig();
            var environment = getEnvironment(log, config);
            environment.request = function(queryObj, callback) {
                return callback(null, {
                    'statusCode': 200
                }, {});
            };

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(calledError).toBeNull();
                expect(calledResult).toBe('NoDataReceived');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });

        it('verify VLER service returns valid response - body contains empty documentList.', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);

            var config = getConfig();
            var environment = getEnvironment(log, config);
            environment.request = function(queryObj, callback) {
                return callback(null, {
                    'statusCode': 200
                }, {
                    'documentList': []
                });
            };

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(calledError).toBeNull();
                expect(calledResult).toBe('NoDataReceived');
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            });
        });

        it('verify VLER service returns valid response - body contains valid documents in object form.', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);
            job.referenceInfo = referenceInfo;

            var config = getConfig();
            var environment = getEnvironment(log, config);
            environment.request = function(queryObj, callback) {
                var body = {
                    'documentList': [{
                        'homeCommunityId': 'urn:oid:2.16.840.1.113883.3.42.10001.100001.18',
                        'repositoryUniqueId': '2.16.840.1.113883.3.198',
                        'documentUniqueId': '5a31395c-b245-4333-b62f-e94fb0c7ae5d',
                        'mimeType': null,
                        'name': 'Summarization of episode note',
                        'authorList': [{
                            'name': '7.9^Epic - Version 7.9^^^^^^^&1.2.840.114350.1.1&ISO',
                            'institution': 'HEALTHeLINK'
                        }],
                        'creationTime': '20140616213908',
                        'sourcePatientId': '1666000001^^^&2.16.840.1.113883.3.42.10001.100001.18&ISO'
                    }, {
                        'homeCommunityId': 'urn:oid:1.3.6.1.4.1.26580.10',
                        'repositoryUniqueId': '1.2.840.114350.1.13.111.3.7.2.688879',
                        'documentUniqueId': '54639790-a2ad-463c-8e7a-9b014eed917b',
                        'mimeType': null,
                        'name': 'Continuity of Care Document',
                        'authorList': [{
                            'name': '7.9^Epic - Version 7.9^^^^^^^&1.2.840.114350.1.1&ISO',
                            'institution': 'Kaiser Permanente Mid-Atlantic STSTMA2'
                        }],
                        'creationTime': '20140617014043',
                        'sourcePatientId': '\'8394^^^&1.3.6.1.4.1.26580.10.1.100&ISO\''
                    }]
                };
                var response = {
                    'statusCode': 200
                };
                return callback(null, response, body);
            };
            var expectedJdsResponse = {
                statusCode: 200
            };
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(calledError).toBeNull();
                expect(calledResult).toBeTruthy();
                expect(_.isArray(calledResult)).toBe(true);
                expect(calledResult.length).toBe(2);
                expect(environment.publisherRouter.publish).toHaveBeenCalled();
                expect(calledResult[0].jobId).not.toEqual(calledResult[1].jobId);

                expect(environment.publisherRouter.publish).toHaveBeenCalledWith([jasmine.objectContaining({
                    type: 'vler-xform-vpr',
                    timestamp: jasmine.any(String),
                    patientIdentifier: patientIdentifier,
                    jpid: jasmine.any(String),
                    referenceInfo: referenceInfo,
                    dataDomain: 'vlerdocument',
                    record: vlerRecord1,
                    requestStampTime: jasmine.any(String),
                    jobId: jasmine.any(String)
                }), jasmine.objectContaining({
                    referenceInfo: referenceInfo,
                })], jasmine.any(Function));
            });
        });

        it('verify VLER service returns valid response - body contains valid documents in string form.', function() {
            var job = jobUtil.createVlerSyncRequest(patientIdentifier, rootJob);
            job.referenceInfo = referenceInfo;

            var config = getConfig();
            var environment = getEnvironment(log, config);
            environment.request = function(queryObj, callback) {
                var body = '{' +
                    '\"documentList\": [{' +
                    '\"homeCommunityId\": \"urn:oid:2.16.840.1.113883.3.42.10001.100001.18\",' +
                    '\"repositoryUniqueId\": \"2.16.840.1.113883.3.198\",' +
                    '\"documentUniqueId\": \"5a31395c-b245-4333-b62f-e94fb0c7ae5d\",' +
                    '\"mimeType\": null,' +
                    '\"name\": \"Summarization of episode note\",' +
                    '\"authorList\": [{' +
                    '\"name\": \"7.9^Epic - Version 7.9^^^^^^^&1.2.840.114350.1.1&ISO\",' +
                    '\"institution\": \"HEALTHeLINK\"' +
                    '}],' +
                    '\"creationTime\": \"20140616213908\",' +
                    '\"sourcePatientId\": \"1666000001^^^&2.16.840.1.113883.3.42.10001.100001.18&ISO\"' +
                    '}, {' +
                    '\"homeCommunityId\": \"urn:oid:1.3.6.1.4.1.26580.10\",' +
                    '\"repositoryUniqueId\": \"1.2.840.114350.1.13.111.3.7.2.688879\",' +
                    '\"documentUniqueId\": \"54639790-a2ad-463c-8e7a-9b014eed917b\",' +
                    '\"mimeType\": null,' +
                    '\"name\": \"Continuity of Care Document\",' +
                    '\"authorList\": [{' +
                    '\"name\": \"7.9^Epic - Version 7.9^^^^^^^&1.2.840.114350.1.1&ISO\",' +
                    '\"institution\": \"Kaiser Permanente Mid-Atlantic STSTMA2\"' +
                    '}],' +
                    '\"creationTime\": \"20140617014043\",' +
                    '\"sourcePatientId\": \"\'8394^^^&1.3.6.1.4.1.26580.10.1.100&ISO\'\"' +
                    '}]' +
                    '}';
                var response = {
                    'statusCode': 200
                };
                return callback(null, response, body);
            };
            var expectedJdsResponse = {
                statusCode: 200
            };
            environment.jds._setResponseData(null, expectedJdsResponse, undefined);

            var called;
            var calledError;
            var calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(calledError).toBeNull();
                expect(calledResult).toBeTruthy();
                expect(_.isArray(calledResult)).toBe(true);
                expect(calledResult.length).toBe(2);
                expect(environment.publisherRouter.publish).toHaveBeenCalled();
                expect(calledResult[0].jobId).not.toEqual(calledResult[1].jobId);
                expect(environment.publisherRouter.publish).toHaveBeenCalledWith([jasmine.objectContaining({
                    type: 'vler-xform-vpr',
                    timestamp: jasmine.any(String),
                    patientIdentifier: patientIdentifier,
                    jpid: jasmine.any(String),
                    referenceInfo: referenceInfo,
                    dataDomain: 'vlerdocument',
                    record: vlerRecord1,
                    requestStampTime: jasmine.any(String),
                    jobId: jasmine.any(String)
                }), jasmine.objectContaining({
                    referenceInfo: referenceInfo,
                })], jasmine.any(Function));
            });
        });
    });
});