'use strict';

//---------------------------------------------------------------------------------------------------
// Unit tests for vler-das-sync-request-handler.
//
// @Author: Les Westberg
//---------------------------------------------------------------------------------------------------

require('../../../../env-setup');

let log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'vler-das-sync-request-handler-spec',
//     level: 'debug'
// });
let handle = require(global.VX_HANDLERS + 'vler-das-sync-request/vler-das-sync-request-handler');
let errorUtil = require(global.VX_UTILS + 'error');
let jobUtil = require(global.VX_UTILS + 'job-utils');
let timeUtil = require(global.VX_UTILS + 'time-utils');

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
// jobStatusErrorReturnValue: The value to return in the error field for JobStatusUpdater method.
// returns: The environment object.
//------------------------------------------------------------------------------------------------------
function getEnvironment(log, jobStatusErrorReturnValue) {
    let environment = {
        jobStatusUpdater: {
            createJobStatus: function (job, callback) {
                return setTimeout(callback, 0, jobStatusErrorReturnValue);
            }
        },
        metrics: log
    };

    spyOn(environment.jobStatusUpdater, 'createJobStatus').andCallThrough();

    return environment;
}

//----------------------------------------------------------------------------------------------------
// Returns an instance of a syncRequestJob.
//
// returns: The syncRequestJob.
//----------------------------------------------------------------------------------------------------
function getSyncRequestJob() {
    return {
        type: 'vler-das-sync-request',
        patientIdentifier: {
            type: 'pid',
            value: 'VLER;10108V420871'
        },
        jpid: 'b2f63ba4-98dc-4d4a-b46e-df5e73d4c6eb',
        rootJobId: '1',
        priority: 1,
        jobId: '5',
        referenceInfo: {
            'x-test-value': 2,
            'x-test-value-2': 'test'
        }
    };

}

describe('vler-das-sync-request-handler.js', function () {
    describe('handle()', function () {
        it('verify missing job is rejected', function () {
            let config = getConfig();
            let environment = getEnvironment(log, null);

            let called;
            let calledError;
            let calledResult;
            handle(log, config, environment, null, function (error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function () {
                return called;
            }, 'calling handle method', 100);

            runs(function () {
                expect(errorUtil.isFatal(calledError)).toBe(true);
                expect(calledError.message).toBe('No job given to handle');
                expect(environment.jobStatusUpdater.createJobStatus).not.toHaveBeenCalled();
            });
        });
        it('verify invalid job type is rejected', function () {
            let job = jobUtil.createEnterpriseSyncRequest(getSyncRequestJob().patientIdentifier, '100-11-11', false);
            let config = getConfig();
            let environment = getEnvironment(log, null);

            let called;
            let calledError;
            let calledResult;
            handle(log, config, environment, job, function (error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function () {
                return called;
            }, 'calling handle method', 100);

            runs(function () {
                expect(errorUtil.isFatal(calledError)).toBe(true);
                expect(calledError.message).toBe('Incorrect job type');
                expect(environment.jobStatusUpdater.createJobStatus).not.toHaveBeenCalled();
            });
        });
        it('verify valid job format is accepted', function() {
            let config = getConfig();
            let environment = getEnvironment(log, null);
            let job = getSyncRequestJob();
            delete job.jpid;
            delete job.patientIdentifier;

            let called;
            let calledError;
            let calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'calling handle method', 100);

            runs(function () {
                expect(errorUtil.isFatal(calledError)).toBe(true);
                expect(calledError.message).toBe('Invalid job');
                expect(environment.jobStatusUpdater.createJobStatus).not.toHaveBeenCalled();
            });
        });
        it('verify failure to receive valid subscribeServiceConfig', function() {
            let config = null;
            let environment = getEnvironment(log, null);
            let job = getSyncRequestJob();

            let called;
            let calledError;
            let calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'calling handle method', 100);

            runs(function () {
                expect(errorUtil.isFatal(calledError)).toBe(true);
                expect(calledError.message).toBe('VLER DAS has no configuration');
                expect(environment.jobStatusUpdater.createJobStatus).not.toHaveBeenCalled();
            });
        });
        it('verify valid job format is accepted', function() {
            let config = getConfig();
            let environment = getEnvironment(log, null);
            environment.request = {};
            environment.request.post = function(queryObj, callback) {
                return callback(null, {
                    'statusCode': 200
                }, {});
            };
            let job = getSyncRequestJob();


            let called;
            let calledError;
            let calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'calling handle method', 100);

            runs(function() {
                expect(calledError).toBeNull();
                expect(environment.jobStatusUpdater.createJobStatus).toHaveBeenCalled();
            });
        });
        it('verify handling when DAS returns error condition', function() {
            let config = getConfig();
            let environment = getEnvironment(log, null);
            environment.request = {};
            environment.request.post = function(queryObj, callback) {
                return callback(null, {
                    'statusCode': 500
                }, {});
            };
            let job = getSyncRequestJob();


            let called;
            let calledError;
            let calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'calling handle method', 100);

            runs(function() {
                expect(errorUtil.isTransient(calledError)).toBe(true);
                expect(calledError.message).toContain('Failed to subscribe to VLERDAS documents.');
            });
        });
        it('verify handling when JDS returns error condition', function() {
            let config = getConfig();
            let environment = getEnvironment(log, 'jds error');
            environment.request = {};
            environment.request.post = function(queryObj, callback) {
                return callback(null, {
                    'statusCode': 200
                }, {});
            };
            spyOn(environment.request, 'post');
            let job = getSyncRequestJob();


            let called;
            let calledError;
            let calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'calling handle method', 100);

            runs(function() {
                expect(errorUtil.isTransient(calledError)).toBe(true);
                expect(calledError.message).toContain('Failed to store vler-das-subscribe-request job');
                expect(environment.request.post).not.toHaveBeenCalled();
            });
        });
        it('verify happy path', function() {
            let config = getConfig();
            let environment = getEnvironment(log, 200);
            environment.request = {};
            environment.request.post = function(queryObj, callback) {
                return callback(null, {
                    'statusCode': 200
                }, {});
            };
            let job = getSyncRequestJob();


            let called;
            let calledError;
            let calledResult;
            handle(log, config, environment, job, function(error, result) {
                called = true;
                calledError = error;
                calledResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'calling handle method', 100);

            runs(function() {
                expect(calledError).toBeFalsy();
                expect(calledResult).toBeTruthy();
                expect(calledResult).toEqual('success');
            });
        });
    });
    describe('createSubscribeJobStatus()', function () {
        it('Verify happy path.', function () {
            let environment = getEnvironment(log, '200');
            let syncRequestJob = getSyncRequestJob();
            const requestStampTime = timeUtil.createStampTime();

            let finished = false;
            runs(function () {
                handle._createSubscribeJobStatus(syncRequestJob, '10', environment.jobStatusUpdater.createJobStatus, requestStampTime, log, function (error) {
                    expect(error).toBeFalsy();
                    expect(environment.jobStatusUpdater.createJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'vler-das-subscribe-request',
                        rootJobId: syncRequestJob.rootJobId,
                        jobId: '10',
                        patientIdentifier: syncRequestJob.patientIdentifier,
                        jpid: syncRequestJob.jpid,
                        priority: syncRequestJob.priority,
                        requestStampTime: requestStampTime,
                        referenceInfo: syncRequestJob.referenceInfo
                    }), jasmine.any(Function));

                    finished = true;
                });
            });
            waitsFor(function () {
                return finished;
            });

        });
        it('Verify jobStatusData error path.', function () {
            let environment = getEnvironment(log, 'ErrorOccurred');
            let syncRequestJob = getSyncRequestJob();
            const requestStampTime = timeUtil.createStampTime();

            let finished = false;
            runs(function () {
                handle._createSubscribeJobStatus(syncRequestJob, '10', environment.jobStatusUpdater.createJobStatus, requestStampTime, log, function (error) {
                    expect(error).toBe('ErrorOccurred');
                    expect(environment.jobStatusUpdater.createJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'vler-das-subscribe-request',
                        rootJobId: syncRequestJob.rootJobId,
                        jobId: '10',
                        patientIdentifier: syncRequestJob.patientIdentifier,
                        jpid: syncRequestJob.jpid,
                        priority: syncRequestJob.priority,
                        requestStampTime: requestStampTime,
                        referenceInfo: syncRequestJob.referenceInfo
                    }), jasmine.any(Function));

                    finished = true;
                });
            });
            waitsFor(function () {
                return finished;
            });

        });
    });
    describe('getVlerDasSubscribeFormData()', function () {
        it('Verify happy path.', function () {
            let config = getConfig();
            let syncRequestJob = getSyncRequestJob();

            let formData = handle._getVlerDasSubscribeFormData(log, config, syncRequestJob);
            expect(formData).toEqual(jasmine.objectContaining({
                id: jasmine.any(String),
                resourceType: 'Subscription',
                criteria: jasmine.any(String),
                reason: 'Subscription?Org=eHMP&RoleCode=112247003&PurposeCode=TREATMENT&VaFacilityCode=459CH&FamilyName=May&GivenName=John',
                status: 'Active',
                text: {
                    status: 'Active',
                    div: '<documents>Null</documents>'
                },
                channel: {
                    type: 'rest-hook',
                    endpoint: 'http://IP           /vlerdas/notification',
                    payload: 'application/json+fhir'
                }
            }));
            expect(formData.criteria).toMatch('^DocumentReference\\?subject:Patient\\.identifier=\\d+V\\d+&startDate=\\d{14}&endDate=\\d{14}&_format=application\\/json\\+fhir$');
        });
        it('Verify no vlerdas config.', function () {
            let config = {};
            let syncRequestJob = getSyncRequestJob();

            let formData = handle._getVlerDasSubscribeFormData(log, config, syncRequestJob);
            expect(formData).toBeNull();
        });
    });
    describe('getVlerDasSubscribeConfiguration()', function () {
        it('Verify happy path.', function () {
            let config = getConfig();
            let syncRequestJob = getSyncRequestJob();

            let requestConfig = handle._getVlerDasSubscribeConfiguration(log, config, syncRequestJob);
            expect(requestConfig).toEqual(jasmine.objectContaining({
                url: 'http://IP             /HealthData/v1/Subscribe',
                forever: true,
                agentOptions: {maxSockets: 10},
                form: {
                    id: jasmine.any(String),
                    resourceType: 'Subscription',
                    criteria: jasmine.any(String),
                    reason: 'Subscription?Org=eHMP&RoleCode=112247003&PurposeCode=TREATMENT&VaFacilityCode=459CH&FamilyName=May&GivenName=John',
                    status: 'Active',
                    text: {
                        status: 'Active',
                        div: '<documents>Null</documents>'
                    },
                    channel: {
                        type: 'rest-hook',
                        endpoint: 'http://IP           /vlerdas/notification',
                        payload: 'application/json+fhir'
                    }
                }
            }));
            expect(requestConfig.form.criteria).toMatch('^DocumentReference\\?subject:Patient\\.identifier=\\d+V\\d+&startDate=\\d{14}&endDate=\\d{14}&_format=application\\/json\\+fhir$');
        });
        it('Verify no vlerdas config.', function () {
            let config = {};
            let syncRequestJob = getSyncRequestJob();

            let requestConfig = handle._getVlerDasSubscribeConfiguration(log, config, syncRequestJob);
            expect(requestConfig).toBeNull();
        });
    });
});
