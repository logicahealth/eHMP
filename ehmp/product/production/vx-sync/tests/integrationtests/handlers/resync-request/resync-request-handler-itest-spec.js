'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var request = require('request');
var handle = require(global.VX_HANDLERS + 'resync-request/resync-request-handler');

var testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
var jobUtil = require(global.VX_UTILS + 'job-utils');
var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
var wConfig = require(global.VX_ROOT + 'worker-config');
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');

var host = require(global.VX_INTTESTS + 'test-config');
var PORT       ;
var tubename = 'vx-resync-test';

function clearTestPatient(config, patientIdentifierValue) {
    var completed = false;
    var actualError, actualResponse;

    runs(function() {
        var options = {
            url: config.protocol + '://' + config.host + ':' + config.port + config.patientUnsyncPath,
            method: 'POST',
            qs: {pid: patientIdentifierValue}};

        request.post(options, function(error, response) {
            actualError = error;
            actualResponse = response;
            completed = true;
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for clear patient REST call.', 20000);

    runs(function() {
        expect(actualError).toBeFalsy();
        expect(actualResponse).toBeTruthy();
    });
}

function retrieveSyncStatus(patientIdentifier, environment, callback) {
    var completed = false;
    var actualError, actualResponse, actualResult;

    runs(function() {
        environment.jds.getSyncStatus(patientIdentifier, function(error, response, result) {
            actualError = error;
            actualResponse = response;
            actualResult = result;
            completed = true;
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for jds.getSyncStatus.', 20000);

    runs(function() {
        expect(actualError).toBeNull();
        expect(actualResponse).toBeTruthy();
        expect(_.result(actualResponse, 'statusCode')).toEqual(200);
        callback(null, actualResponse.statusCode);
    });
}
describe('resync-request-handler', function() {
    describe('When a resync handler processes a resync request', function() {
        var config, environment;

        beforeEach(function() {
            config = {
                retrySync: {maxRetries: 3},
                syncRequestApi: {
                    protocol: 'http',
                    host: host,
                    port: 8080,
                    patientSyncPath: '/sync/doLoad',
                    patientUnsyncPath: '/sync/clearPatient',
                    patientStatusPath: '/sync/status',
                    patientDemoSyncPath: '/sync/demographicSync',
                    method: 'POST'
                },
                vistaSites: {
                    '9E7A': {},
                    'C877': {}
                },
                jds: _.defaults(wConfig.jds, {
                    protocol: 'http',
                    host: 'IP_ADDRESS',
                    port: 9080
                })
            };

            environment = {
                vistaClient: new VistaClient(dummyLogger, dummyLogger, config),
                jobStatusUpdater: {},
                publisherRouter: {},
                metrics: dummyLogger,
                jds: new JdsClient(dummyLogger, dummyLogger, config)
            };

            environment.jobStatusUpdater = new JobStatusUpdater(dummyLogger, config, environment.jds);
            environment.publisherRouter = new PublisherRouter(dummyLogger, config, dummyLogger, environment.jobStatusUpdater);

            clearTestPatient(config.syncRequestApi, '9E7A;1');
        });

        afterEach(function() {
            environment.publisherRouter.close();
        });

        it('then the patient is resynced', function() {
            var job = {
                type: 'resync-request',
                patientIdentifier: {
                    type: 'pid',
                    value: '9E7A;1'
                },
                rootJobId: '1',
                jobId: '1'
            };
            var completed = false;
            var actualError, actualSyncStatus;

            testHandler(handle, dummyLogger, config, environment, host, port, tubename, job, [], null, function (error, response) {
                actualError = error;
                retrieveSyncStatus(job.patientIdentifier, environment, function(error, syncStatus) {
                    actualError = error;
                    actualSyncStatus = syncStatus;
                    completed = true;
                });
            });

            waitsFor(function () {
                return completed;
            }, 'response from resync test handler timed out.', 10000);

            runs(function () {
                expect(actualError).toBeFalsy();
                expect(actualSyncStatus).toBe(200);
            });
        });

        it('and the sync is still in process then a new job is put back on the queue for the patient', function() {
            config.syncRequestApi.patientStatusPath='/sync/invalid';

            var job = {
                type: 'resync-request',
                patientIdentifier: {
                    type: 'pid',
                    value: '9E7A;1'
                },
                rootJobId: '2',
                jobId: '2'
            };

            var matchingJobTypes = [jobUtil.resyncRequestType()];

            testHandler(handle, dummyLogger, config, environment, host, port, tubename, job, matchingJobTypes);
        });
    });
});
