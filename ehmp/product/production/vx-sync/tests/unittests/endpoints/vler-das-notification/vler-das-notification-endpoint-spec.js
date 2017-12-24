'use strict';

//---------------------------------------------------------------------------------------------------
// Unit tests for vler-das-notification-endpoint.
//
// @Author: Les Westberg
//---------------------------------------------------------------------------------------------------

require('../../../../env-setup');

let log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'vler-das-notification-endpoint-spec',
//     level: 'debug'
// });
const registerVlerDasNotifyAPI = require(global.VX_ENDPOINTS + 'vler-das-notification/vler-das-notification-endpoint');
const JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
const PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
const DummyRequest = require(global.VX_ROOT + 'tests/frames/dummy-request');
const DummyResponse = require(global.VX_ROOT + 'tests/frames/dummy-response');

const icn = '10108V420871';

//------------------------------------------------------------------------------------------------------
// This function returns an instance of worker-config.json with the settings we need for our unit tests.
//
// returns: The worker-config settings.
//------------------------------------------------------------------------------------------------------
function getConfig() {
    let config = {
        'handlerMaxSockets': 10,
        'vlerdas': {
            'domains': [
                'vlerdocument'
            ],
            'disabled': false,
            'defaults': {
                'host': 'IP        ',
                'port': 'PORT',
                'protocol': 'http',
                'timeout': 60000
            },
            'vlerdocument': {
                'subscribe': '/HealthData/v1/Subscribe',
                'readDocPath': '/HealthData/v1/readDocument/DocumentReference',
                'ping': '/ping'
            },
            'vlerFormData': {
                'org': 'eHMP',
                'roleCode': '112247003',
                'purposeCode': 'TREATMENT',
                'vaFacilityCode': '459CH',
                'familyName': 'May',
                'givenName': 'John'
            },
            'notificationCallback': {
                'protocol': 'http',
                'host': 'IP      ',
                'port': 'PORT',
                'path': '/vlerdas/notification'
            },
            'queryDurationDays': 180
        }
    };
    return config;
}

//------------------------------------------------------------------------------------------------------
// This function returns an instance of the environment with the settings we need for our unit tests.
//
// log: The logger to use for log messages.
// config: The worker-config settings.
// jobStatusErrorReturnValue: The value to return in the error field for JobStatusUpdater method.
// returns: The environment object.
//------------------------------------------------------------------------------------------------------
function getEnvironment(log, config, jobStatusErrorReturnValue) {
    let environment = {
        jobStatusUpdater: {
            completeJobStatus: function (job, callback) {
                return setTimeout(callback, 0, jobStatusErrorReturnValue);
            },
            childInstance: function(log) {
                return environment.jobStatusUpdater;
            }
        },
        jds: new JdsClientDummy(log, config),
        publisherRouter: new PublisherRouterDummy(),
        metrics: log
    };

    spyOn(environment.jobStatusUpdater, 'completeJobStatus').andCallThrough();
    spyOn(environment.jds, 'getJobStatus').andCallThrough();
    spyOn(environment.publisherRouter, 'publish').andCallThrough();

    return environment;
}

//--------------------------------------------------------------------
// Create an instance of the job status and return it.
//
// status:  The value of status (i.e. created, started, completed)
// returns: The created job status
//--------------------------------------------------------------------
function createJobStatus(status) {
    var jobStatus = {
        'jobId': '4bbb4574-68ab-4fd0-9aaf-5abf75765449',
        'jpid': '15fbef90-aed2-4267-9f8b-980ad62c2a00',
        'patientIdentifier': {
            'type': 'pid',
            value: 'VLER;' + icn
        },
        'priority': 1,
        'rootJobId': '4bbb4574-68ab-4fd0-9aaf-5abf75765449',
        'status': status,
        'timestamp': '1458680891151',
        'type': 'vler-das-subscribe-request',
        'requestStampTime': '20170705150722',
        'referenceInfo': {
            'initialSyncId': icn,
            'requestId': 'Test request',
            'sessionId': 'Test session'
        },
    };

    return jobStatus;

}

//----------------------------------------------------------------------------
// Since we are mocking out JDS - and since each of the calls to JDS for this
// unit test are similar.  This function sets up the jds response that should
// be given when JDS is called.
//
// environment: The environment object containing the handle to JDS
// error: The error result to give back from JDS
// jdsResult: The jdsResult containing the jobStatus that will be returned by JDS.
//----------------------------------------------------------------------------
function setupDummyJds(environment, error, jdsResult) {
    const expectedJdsError = [error];
    const expectedJdsResponse = [{
        statusCode: 200
    }];
    const expectedJdsResult = [jdsResult];
    environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
}


describe('vler-das-notification-endpoint.js', function () {
    describe('retrieveVlerDasSubscribeReqeustJobStatus()', function () {
        it('Verify successful retrieval of job status', function () {
            const config = getConfig();
            const environment = getEnvironment(log, config, null);
            const jobStatus = createJobStatus('created');
            const jdsResult = {
                items: [jobStatus]
            };
            setupDummyJds(environment, null, jdsResult);

            let finished;
            runs(function () {
                registerVlerDasNotifyAPI._retrieveVlerDasSubscribeReqeustJobStatus(icn, log, environment, function (err, vlerDasSubscribeRequestJobStatus) {
                    expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith({
                        patientIdentifier: {
                            type: 'icn',
                            value: icn
                        }
                    }, {
                        filter: '?filter=eq(\"type\",\"vler-das-subscribe-request\")'
                    }, jasmine.any(Function));
                    expect(vlerDasSubscribeRequestJobStatus).toBe(jobStatus);
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            });
        });
        it('Verify when JDS returns an error', function () {
            const config = getConfig();
            const environment = getEnvironment(log, config, null);
            setupDummyJds(environment, 'Error Occurred', null);

            let finished;
            runs(function () {
                registerVlerDasNotifyAPI._retrieveVlerDasSubscribeReqeustJobStatus(icn, log, environment, function (err, vlerDasSubscribeRequestJobStatus) {
                    expect(err).toBeNull();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith({
                        patientIdentifier: {
                            type: 'icn',
                            value: icn
                        }
                    }, {
                        filter: '?filter=eq(\"type\",\"vler-das-subscribe-request\")'
                    }, jasmine.any(Function));
                    expect(vlerDasSubscribeRequestJobStatus).toBeNull();
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            });
        });
        it('Verify when result is null', function () {
            const config = getConfig();
            const environment = getEnvironment(log, config, null);
            setupDummyJds(environment, null, null);

            let finished;
            runs(function () {
                registerVlerDasNotifyAPI._retrieveVlerDasSubscribeReqeustJobStatus(icn, log, environment, function (err, vlerDasSubscribeRequestJobStatus) {
                    expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith({
                        patientIdentifier: {
                            type: 'icn',
                            value: icn
                        }
                    }, {
                        filter: '?filter=eq(\"type\",\"vler-das-subscribe-request\")'
                    }, jasmine.any(Function));
                    expect(vlerDasSubscribeRequestJobStatus).toBeNull();
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            });
        });
        it('Verify result.items is not an array.', function () {
            const config = getConfig();
            const environment = getEnvironment(log, config, null);
            const jobStatus = createJobStatus('created');
            const jdsResult = {
                items: jobStatus
            };
            setupDummyJds(environment, null, jdsResult);

            let finished;
            runs(function () {
                registerVlerDasNotifyAPI._retrieveVlerDasSubscribeReqeustJobStatus(icn, log, environment, function (err, vlerDasSubscribeRequestJobStatus) {
                    expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith({
                        patientIdentifier: {
                            type: 'icn',
                            value: icn
                        }
                    }, {
                        filter: '?filter=eq(\"type\",\"vler-das-subscribe-request\")'
                    }, jasmine.any(Function));
                    expect(vlerDasSubscribeRequestJobStatus).toBeNull();
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            });
        });
        it('Verify result.items is an empty array.', function () {
            const config = getConfig();
            const environment = getEnvironment(log, config, null);
            const jdsResult = {
                items: []
            };
            setupDummyJds(environment, null, jdsResult);

            let finished;
            runs(function () {
                registerVlerDasNotifyAPI._retrieveVlerDasSubscribeReqeustJobStatus(icn, log, environment, function (err, vlerDasSubscribeRequestJobStatus) {
                    expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith({
                        patientIdentifier: {
                            type: 'icn',
                            value: icn
                        }
                    }, {
                        filter: '?filter=eq(\"type\",\"vler-das-subscribe-request\")'
                    }, jasmine.any(Function));
                    expect(vlerDasSubscribeRequestJobStatus).toBeNull();
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            });
        });
    });
    describe('extractIcn()', function () {
        it('Verify when request is null', function () {
            let icn = registerVlerDasNotifyAPI._extractIcn(null);
            expect(icn).toBeFalsy();
        });
        it('Verify when request.body is undefined', function () {
            let icn = registerVlerDasNotifyAPI._extractIcn({});
            expect(icn).toBeFalsy();
        });
        it('Verify when request.body.criteria is undefined', function () {
            let icn = registerVlerDasNotifyAPI._extractIcn({body: {}});
            expect(icn).toBeFalsy();
        });
        it('Verify when request.body.criteria does not contain a patient ID.', function () {
            let icn = registerVlerDasNotifyAPI._extractIcn({
                body: {
                    criteria: 'DocumentReference?_format=application/json+fhir'
                }
            });
            expect(icn).toBeFalsy();
        });
        it('Verify when request.body.criteria contains an empty patient ID.', function () {
            let icn = registerVlerDasNotifyAPI._extractIcn({
                body: {
                    criteria: 'DocumentReference?subject.Patient.identifier=&_format=application/json+fhir'
                }
            });
            expect(icn).toBeFalsy();
        });
        it('Verify when request.body.criteria contains a valid patient ID.', function () {
            let icnResult = registerVlerDasNotifyAPI._extractIcn({
                body: {
                    criteria: 'DocumentReference?subject.Patient.identifier=' + icn + '&_format=application/json+fhir'
                }
            });
            expect(icnResult).toBe(icn);
        });

    });
    describe('createAndPublishVlerDasDocRetrieveJob()', function () {
        it('Verify successful publish of vler-das-doc-retrieve job', function () {
            const config = getConfig();
            const environment = getEnvironment(log, config, null);
            const jobStatus = createJobStatus('created');
            const request = new DummyRequest({});

            let finished;
            runs(function () {
                registerVlerDasNotifyAPI._createAndPublishVlerDasDocRetrieveJob(jobStatus, request, log, environment, function (err) {
                    expect(err).toBeFalsy();
                    expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                    expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'vler-das-doc-retrieve',
                        patientIdentifier: jobStatus.patientIdentifier,
                        requestStampTime: jobStatus.requestStampTime,
                        referenceInfo: jobStatus.referenceInfo,
                        rootJobId: jobStatus.rootJobId,
                        priority: jobStatus.priority,
                        jpid: jobStatus.jpid,
                        jobId: jasmine.any(String),
                        postedData: { demographics : {  } }
                    }), jasmine.any(Function));
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            });
        });
    });
    describe('handleVlerDasNotificationPost()', function () {
        it('Verify no icn in request.', function () {
            const config = getConfig();
            const environment = getEnvironment(log, config, null);
            const request = new DummyRequest({});
            request.body = {};
            const response = new DummyResponse();

            let finished;
            runs(function () {

                // Note that since the _handleVlerDasNotificationPost method does not have a callback - it is done
                // when the express: response.send() method is called, we have to treat that method like our callback.
                // We need to set up our expectations under that method - because that is officially when the express
                // endpoint call is done.
                //----------------------------------------------------------------------------------------------------
                response.send = function (responseText) {
                    this.response = responseText;

                    expect(this.statusCode).toEqual(400);
                    expect(this.response).toEqual('Invalid request.  Criteria should contain a valid patient ID.');

                    finished = true;

                    return this;
                };

                registerVlerDasNotifyAPI._handleVlerDasNotificationPost(log, config, environment, request, response);
            });

            waitsFor(function () {
                return finished;
            });
        });
        it('Verify full happy path.', function () {
            const config = getConfig();
            const environment = getEnvironment(log, config, null);
            const request = new DummyRequest({});
            request.body = {
                criteria: 'DocumentReference?subject.Patient.identifier=' + icn + '&_format=application/json+fhir'
            };
            const response = new DummyResponse();
            const jobStatus = createJobStatus('created');
            const jdsResult = {
                items: [jobStatus]
            };
            setupDummyJds(environment, null, jdsResult);

            let finished;
            runs(function () {

                // Note that since the _handleVlerDasNotificationPost method does not have a callback - it is done
                // when the express: response.send() method is called, we have to treat that method like our callback.
                // We need to set up our expectations under that method - because that is officially when the express
                // endpoint call is done.
                //----------------------------------------------------------------------------------------------------
                response.send = function (responseText) {
                    this.response = responseText;

                    expect(responseText).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith({
                        patientIdentifier: {
                            type: 'icn',
                            value: icn
                        }
                    }, {
                        filter: '?filter=eq(\"type\",\"vler-das-subscribe-request\")'
                    }, jasmine.any(Function));
                    expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                    expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'vler-das-doc-retrieve',
                        patientIdentifier: jobStatus.patientIdentifier,
                        requestStampTime: jobStatus.requestStampTime,
                        referenceInfo: jobStatus.referenceInfo,
                        rootJobId: jobStatus.rootJobId,
                        priority: jobStatus.priority,
                        jpid: jobStatus.jpid,
                        jobId: jasmine.any(String)
                    }), jasmine.any(Function));
                    expect(environment.jobStatusUpdater.completeJobStatus.calls.length).toEqual(1);
                    expect(environment.jobStatusUpdater.completeJobStatus).toHaveBeenCalledWith(jobStatus, jasmine.any(Function));
                    expect(this.statusCode).toEqual(200);

                    finished = true;

                    return this;
                };

                registerVlerDasNotifyAPI._handleVlerDasNotificationPost(log, config, environment, request, response);
            });

            waitsFor(function () {
                return finished;
            });

        });
        it('Verify when job status returns an error.', function () {
            const config = getConfig();
            const environment = getEnvironment(log, config, 'JobStatusUpdaterError');
            const request = new DummyRequest({});
            request.body = {
                criteria: 'DocumentReference?subject.Patient.identifier=' + icn + '&_format=application/json+fhir'
            };
            const response = new DummyResponse();
            const jobStatus = createJobStatus('created');
            const jdsResult = {
                items: [jobStatus]
            };
            setupDummyJds(environment, null, jdsResult);

            let finished;
            runs(function () {

                // Note that since the _handleVlerDasNotificationPost method does not have a callback - it is done
                // when the express: response.send() method is called, we have to treat that method like our callback.
                // We need to set up our expectations under that method - because that is officially when the express
                // endpoint call is done.
                //----------------------------------------------------------------------------------------------------
                response.send = function (responseText) {
                    this.response = responseText;

                    expect(responseText).toEqual('Failed to process request.');
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith({
                        patientIdentifier: {
                            type: 'icn',
                            value: icn
                        }
                    }, {
                        filter: '?filter=eq(\"type\",\"vler-das-subscribe-request\")'
                    }, jasmine.any(Function));
                    expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                    expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'vler-das-doc-retrieve',
                        patientIdentifier: jobStatus.patientIdentifier,
                        requestStampTime: jobStatus.requestStampTime,
                        referenceInfo: jobStatus.referenceInfo,
                        rootJobId: jobStatus.rootJobId,
                        priority: jobStatus.priority,
                        jpid: jobStatus.jpid,
                        jobId: jasmine.any(String)
                    }), jasmine.any(Function));
                    expect(environment.jobStatusUpdater.completeJobStatus.calls.length).toEqual(1);
                    expect(environment.jobStatusUpdater.completeJobStatus).toHaveBeenCalledWith(jobStatus, jasmine.any(Function));
                    expect(this.statusCode).toEqual(400);
                    expect(this.response).toEqual('Failed to process request.');

                    finished = true;
                    return this;
                };

                registerVlerDasNotifyAPI._handleVlerDasNotificationPost(log, config, environment, request, response);
            });

            waitsFor(function () {
                return finished;
            });

        });
    });
});

