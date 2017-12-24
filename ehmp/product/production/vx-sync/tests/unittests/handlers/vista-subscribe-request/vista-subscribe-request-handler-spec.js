'use strict';

//--------------------------------------------------------------------------------------------------
// Overall plan on this class is to test each individual step and make sure that the appropriate
// JDS functions are called as well as the RPC functions are called with the appropriate values.
// One final test verifies that the entire set of steps all make the appropriate calls.
//-------------------------------------------------------------------------------------------------


require('../../../../env-setup');
var VistaSubscribeRequestHandler = require(global.VX_HANDLERS + 'vista-subscribe-request/vista-subscribe-request-handler');
var VistaClientDummy = require(global.VX_DUMMIES + 'vista-client-dummy');
var HdrClientDummy = require(global.VX_DUMMIES + 'hdr-client-dummy');
var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
var jobStatusUpdaterDummy = require(global.VX_DUMMIES + '/JobStatusUpdaterDummy');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var jobUtil = require(global.VX_UTILS + 'job-utils');

var config = {
    'vistaSites': {
        'SITE': {
            'name': 'panorama',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'localIP': '127.0.0.1',
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 10000
        },
        'SITE': {
            'name': 'kodak',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'localIP': '127.0.0.1',
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 10000
        }
    },
    'vista': {
        domains: [
            'allergy',
            'auxiliary',
            'appointment',
            'diagnosis',
            'document',
            'immunization',
            'lab',
            'med',
            'obs',
            'order',
            'problem',
            'procedure',
            'consult',
            'image',
            'surgery',
            'task',
            'visit',
            'vital',
            'ptf',
            'exam',
            'cpt',
            'education',
            'pov',
            'skin',
            'treatment',
            'roadtrip',
            'patient'
        ]
    }
};

var vistaId = 'SITE';
var pidSite = 'SITE';
var pid = pidSite + ';3';
var patientIdentifier = idUtil.create('pid', pid);
var jobId = '2';
var rootJobId = '1';
var pollerJobId = '3';
var jobPriority = 55;
var meta = {
    jobId: jobId,
    rootJobId: rootJobId,
    priority: jobPriority,
    jpid: '21EC2020-3AEA-4069-A2DD-FFFFFFFFFFFF',
    referenceInfo: {
        requestId: 'vista-subscribe-request-requestId',
        sessionId: 'vista-subscribe-request-sessionId'
    }
};
var job = jobUtil.createVistaSubscribeRequest(vistaId, patientIdentifier, meta);
var hdrId = '84F0';
var hdrPidSite = '84F0';
var hdrPid = hdrPidSite + ';3';
var hdrPatientIdentifier = idUtil.create('pid', hdrPid);
var hdrJob = jobUtil.createVistaHdrSubscribeRequest(hdrId, hdrPatientIdentifier, meta);

function createEnvironment(config) {
    var environment = {
        vistaClient: new VistaClientDummy(dummyLogger, config, null),
        jobStatusUpdater: jobStatusUpdaterDummy,
        hdrClient: new HdrClientDummy(dummyLogger, config, null),
    };

    // Underlying JDS and RPC calls to monitor and make sure that they are made.
    //---------------------------------------------------------------------------
    spyOn(jobStatusUpdaterDummy, 'startJobStatus').andCallThrough();
    spyOn(jobStatusUpdaterDummy, 'createJobStatus').andCallThrough();
    spyOn(jobStatusUpdaterDummy, 'completeJobStatus').andCallThrough();
    spyOn(environment.vistaClient, 'subscribe').andCallThrough();
    spyOn(environment.hdrClient, 'subscribe').andCallThrough();

    return environment;
}

describe('vista-subscribe-request-handler.js', function () {
    describe('_validateParameters()', function () {
        it('Happy Path', function () {
            var actualError;
            var actualResponse;
            var called = false;
            VistaSubscribeRequestHandler._validateParameters(vistaId, pidSite, pid, dummyLogger, function (error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function () {
                return called;
            }, 'Call to _setJobStatusToStarted failed to return in time.', 500);

            runs(function () {
                expect(actualError).toBeNull();
                expect(actualResponse).toBeTruthy();
            });
        });

        it('Error Path', function () {
            var actualError;
            var actualResponse;
            var called = false;
            VistaSubscribeRequestHandler._validateParameters('SITE', pidSite, pid, dummyLogger, function (error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function () {
                return called;
            }, 'Call to _setJobStatusToStarted failed to return in time.', 500);

            runs(function () {
                expect(actualError).toBeTruthy();
                expect(actualResponse).toBeNull();
            });
        });
    });

    describe('_createNewJobStatus()', function () {
        it('Happy Path - with job status = "create"', function () {
            var actualError;
            var actualResponse;
            var called = false;
            var environment = createEnvironment(config);
            VistaSubscribeRequestHandler._createJobStatus(vistaId, 'allergy', pidSite, pid, job, pollerJobId, environment.jobStatusUpdater.createJobStatus, dummyLogger, function (error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function () {
                return called;
            }, 'Call to _setJobStatusToStarted failed to return in time.', 500);

            runs(function () {
                expect(actualError).toBeNull();
                expect(jobStatusUpdaterDummy.createJobStatus.calls.length).toEqual(1);
                expect(jobStatusUpdaterDummy.createJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'vista-SITE-data-allergy-poller',
                    patientIdentifier: {type: 'pid', value: pid},
                    jpid: meta.jpid,
                    rootJobId: rootJobId,
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));
                expect(job.referenceInfo).toBeDefined();
                expect(job.referenceInfo.requestId).toBe('vista-subscribe-request-requestId');
                expect(job.referenceInfo.sessionId).toBe('vista-subscribe-request-sessionId');
            });
        });
        it('Happy Path For VistA HDR - with job status = "create"', function () {
            var actualError;
            var actualResponse;
            var called = false;
            var hdrId = '84F0';
            var environment = createEnvironment(config);
            VistaSubscribeRequestHandler._createJobStatus(hdrId, 'allergy', hdrPidSite, hdrPid, hdrJob, pollerJobId, environment.jobStatusUpdater.createJobStatus, dummyLogger, function (error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function () {
                return called;
            }, 'Call to _setJobStatusToStarted failed to return in time.', 500);

            runs(function () {
                expect(actualError).toBeNull();
                expect(jobStatusUpdaterDummy.createJobStatus.calls.length).toEqual(1);
                expect(jobStatusUpdaterDummy.createJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'vistahdr-84F0-data-allergy-poller',
                    patientIdentifier: {type: 'pid', value: hdrPid},
                    jpid: meta.jpid,
                    rootJobId: rootJobId,
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));
                expect(job.referenceInfo).toBeDefined();
                expect(job.referenceInfo.requestId).toBe('vista-subscribe-request-requestId');
                expect(job.referenceInfo.sessionId).toBe('vista-subscribe-request-sessionId');
            });
        });
        it('Happy Path - with job status = "complete"', function () {
            var actualError;
            var actualResponse;
            var called = false;
            var environment = createEnvironment(config);
            VistaSubscribeRequestHandler._createJobStatus(vistaId, 'allergy', pidSite, pid, job, pollerJobId, environment.jobStatusUpdater.completeJobStatus, dummyLogger, function (error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function () {
                return called;
            }, 'Call to _setJobStatusToStarted failed to return in time.', 500);

            runs(function () {
                expect(actualError).toBeNull();
                expect(jobStatusUpdaterDummy.completeJobStatus.calls.length).toEqual(1);
                expect(jobStatusUpdaterDummy.completeJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'vista-SITE-data-allergy-poller',
                    patientIdentifier: {type: 'pid', value: pid},
                    jpid: meta.jpid,
                    rootJobId: rootJobId,
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));
                expect(job.referenceInfo).toBeDefined();
                expect(job.referenceInfo.requestId).toBe('vista-subscribe-request-requestId');
                expect(job.referenceInfo.sessionId).toBe('vista-subscribe-request-sessionId');
            });
        });
    });

    describe('_subscribePatientToVistA()', function () {
        it('Happy Path', function () {
            var actualError;
            var actualResponse;
            var called = false;
            var environment = createEnvironment(config);
            VistaSubscribeRequestHandler._subscribePatientToVistA(vistaId, pidSite, pid, job, pollerJobId, environment.vistaClient, dummyLogger, function (error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function () {
                return called;
            }, 'Call to _setJobStatusToStarted failed to return in time.', 500);

            runs(function () {
                expect(actualError).toBeNull();
                expect(environment.vistaClient.subscribe.calls.length).toEqual(1);
                expect(environment.vistaClient.subscribe).toHaveBeenCalledWith(vistaId, {
                    type: 'pid',
                    value: pid
                }, rootJobId, pollerJobId, jobPriority, {
                    requestId: 'vista-subscribe-request-requestId',
                    sessionId: 'vista-subscribe-request-sessionId'
                }, jasmine.any(Function));
                expect(job.referenceInfo).toBeDefined();
                expect(job.referenceInfo.requestId).toBe('vista-subscribe-request-requestId');
                expect(job.referenceInfo.sessionId).toBe('vista-subscribe-request-sessionId');
            });
        });
    });

    describe('_subscribePatientToVistAHdr()', function () {
        it('Happy Path', function () {
            var actualError;
            var actualResponse;
            var called = false;
            var environment = createEnvironment(config);
            VistaSubscribeRequestHandler._subscribePatientToVistAHdr(hdrId, hdrPidSite, hdrPid, hdrJob, pollerJobId, environment.hdrClient, dummyLogger, function (error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function () {
                return called;
            }, 'Call to _setJobStatusToStarted failed to return in time.', 500);

            runs(function () {
                expect(actualError).toBeNull();
                expect(environment.hdrClient.subscribe.calls.length).toEqual(1);
                expect(environment.hdrClient.subscribe).toHaveBeenCalledWith(hdrId, {
                    type: 'pid',
                    value: hdrPid
                }, rootJobId, pollerJobId, jobPriority, jasmine.any(Function));
                expect(job.referenceInfo).toBeDefined();
                expect(job.referenceInfo.requestId).toBe('vista-subscribe-request-requestId');
                expect(job.referenceInfo.sessionId).toBe('vista-subscribe-request-sessionId');
            });
        });
    });

    describe('handle()', function () {
        it('Happy Path', function () {
            var actualError;
            var actualResponse;
            var called = false;
            var environment = createEnvironment(config);
            VistaSubscribeRequestHandler.handle(vistaId, dummyLogger, config, environment, job, function (error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function () {
                return called;
            }, 'Call to handle failed to return in time.', 500);

            runs(function () {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();


                // _createNewJobStatus was called
                //--------------------------------
                expect(jobStatusUpdaterDummy.createJobStatus.calls.length).toEqual(27);
                expect(jobStatusUpdaterDummy.createJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'vista-SITE-data-allergy-poller',
                    patientIdentifier: {type: 'pid', value: pid},
                    jpid: meta.jpid,
                    rootJobId: rootJobId,
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));

                // _subscribePatientToVistA was called
                //-------------------------------------
                expect(environment.vistaClient.subscribe.calls.length).toEqual(1);
                expect(environment.vistaClient.subscribe).toHaveBeenCalledWith(vistaId, {
                        type: 'pid',
                        value: pid
                    }, rootJobId, jasmine.any(Array), jobPriority,
                    {requestId: 'vista-subscribe-request-requestId', sessionId: 'vista-subscribe-request-sessionId'},
                    jasmine.any(Function));
                expect(job.referenceInfo).toBeDefined();
                expect(job.referenceInfo.requestId).toBe('vista-subscribe-request-requestId');
                expect(job.referenceInfo.sessionId).toBe('vista-subscribe-request-sessionId');

            });
        });
        it('"Duplicate Subscribe" Path', function () {
            var actualError;
            var actualResponse;
            var called = false;
            var environment = createEnvironment(config);
            var vistaResponse = {
                'apiVersion': '1.0',
                'error': {'message': 'Duplicate sync request for - HMPFX~hmp-development-box~100599'}
            };
            environment.vistaClient._setSubscribeResponseData('Duplicate sync request for - HMPFX~hmp-development-box~100599', vistaResponse);
            VistaSubscribeRequestHandler.handle(vistaId, dummyLogger, config, environment, job, function (error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function () {
                return called;
            }, 'Call to handle failed to return in time.', 500);

            runs(function () {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();


                // createJobStatus was called
                //--------------------------------
                expect(jobStatusUpdaterDummy.createJobStatus.calls.length).toEqual(27);
                expect(jobStatusUpdaterDummy.createJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'vista-SITE-data-allergy-poller',
                    patientIdentifier: {type: 'pid', value: pid},
                    jpid: meta.jpid,
                    rootJobId: rootJobId,
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));

                // _subscribePatientToVistA was called
                //-------------------------------------
                expect(environment.vistaClient.subscribe.calls.length).toEqual(1);
                expect(environment.vistaClient.subscribe).toHaveBeenCalledWith(vistaId, {
                        type: 'pid',
                        value: pid
                    }, rootJobId, jasmine.any(Array), jobPriority,
                    {requestId: 'vista-subscribe-request-requestId', sessionId: 'vista-subscribe-request-sessionId'},
                    jasmine.any(Function));
                expect(job.referenceInfo).toBeDefined();
                expect(job.referenceInfo.requestId).toBe('vista-subscribe-request-requestId');
                expect(job.referenceInfo.sessionId).toBe('vista-subscribe-request-sessionId');

                // completeJobStatus was called
                //--------------------------------
                expect(jobStatusUpdaterDummy.completeJobStatus.calls.length).toEqual(27);
                expect(jobStatusUpdaterDummy.completeJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'vista-SITE-data-allergy-poller',
                    patientIdentifier: {type: 'pid', value: pid},
                    jpid: meta.jpid,
                    rootJobId: rootJobId,
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));
            });
        });
        it('Happy Path For VistA HDR', function () {
            var actualError;
            var actualResponse;
            var called = false;
            var environment = createEnvironment(config);
            VistaSubscribeRequestHandler.handle(hdrId, dummyLogger, config, environment, hdrJob, function (error, response) {
                actualError = error;
                actualResponse = response;
                called = true;
            });

            waitsFor(function () {
                return called;
            }, 'Call to handle failed to return in time.', 500);

            runs(function () {
                expect(actualError).toBeFalsy();
                expect(actualResponse).toBeTruthy();


                // _createNewJobStatus was called
                //--------------------------------
                expect(jobStatusUpdaterDummy.createJobStatus.calls.length).toEqual(27);
                expect(jobStatusUpdaterDummy.createJobStatus).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'vistahdr-84F0-data-allergy-poller',
                    patientIdentifier: {type: 'pid', value: hdrPid},
                    jpid: meta.jpid,
                    rootJobId: rootJobId,
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));

                // _subscribePatientToVistA was called
                //-------------------------------------
                expect(environment.hdrClient.subscribe.calls.length).toEqual(1);
                expect(environment.hdrClient.subscribe).toHaveBeenCalledWith(hdrId, {
                    type: 'pid',
                    value: hdrPid
                }, rootJobId, jasmine.any(Array), jobPriority, jasmine.any(Function));
                expect(job.referenceInfo).toBeDefined();
                expect(job.referenceInfo.requestId).toBe('vista-subscribe-request-requestId');
                expect(job.referenceInfo.sessionId).toBe('vista-subscribe-request-sessionId');

            });
        });
    });
});
