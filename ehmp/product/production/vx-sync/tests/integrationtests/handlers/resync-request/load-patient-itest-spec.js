'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var request = require('request');
var loadPatient = require(global.VX_HANDLERS + 'resync-request/load-patient');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');

// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// dummyLogger = logUtil._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var wConfig = require(global.VX_ROOT + 'worker-config');

var testConfig = require(global.VX_INTTESTS + 'test-config');
var host = testConfig.vxsyncIP;
var hostPort = testConfig.vxsyncPort;

function clearTestPatient(config, patientIdentifierValue) {
    var completed = false;
    var actualError, actualResponse;

    runs(function() {
        var options = {
            url: config.protocol + '://' + config.host + ':' + config.port + config.patientUnsyncPath,
            method: 'POST',
            qs: {
                pid: patientIdentifierValue
            }
        };

        request.post(options, function(error, response) {
            actualError = error;
            actualResponse = response;
            completed = true;
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for patient to clear.', 20000);

    runs(function() {
        expect(actualError).toBeFalsy();
        expect(actualResponse).toBeTruthy();
    });
}

function retrieveSyncStatus(patientIdentifier, environment, callback) {
    environment.jds.getSyncStatus(patientIdentifier, function(error, response) {
        callback(error, response.statusCode);
    });
}

function retrieveEnterpriseSyncJobHistory(patientIdentifier, environment, callback) {
    var job = {
        patientIdentifier: patientIdentifier
    };

    var filter = {
        filter: '?filter=eq(\"type\",\"enterprise-sync-request\")'
    };

    environment.jds.getJobStatus(job, filter, function(error, response, result) {
        callback(error, response, result);
    });
}

describe('load-patient', function() {
    describe('When load-patient is called', function() {
        var config, environment;

        beforeEach(function() {
            config = {
                retrySync: {
                    maxRetries: 3
                },
                syncRequestApi: {
                    protocol: 'http',
                    host: host,
                    port: hostPort,
                    patientSyncPath: '/sync/doLoad',
                    patientUnsyncPath: '/sync/clearPatient',
                    patientStatusPath: '/sync/status',
                    patientSyncDemoPath: '/sync/demographicSync',
                    method: 'POST'
                },
                vistaSites: {
                    'SITE': {},
                    'SITE': {}
                },
                jds: _.defaults(wConfig.jds, {
                    protocol: 'http',
                    host: 'IP        ',
                    port: PORT
                })
            };

            environment = {
                metrics: dummyLogger,
                jds: new JdsClient(dummyLogger, dummyLogger, config)
            };

            clearTestPatient(config.syncRequestApi, 'SITE;23');
        });


        it('then a sync request is sent', function() {
            var job = {
                type: 'resync-request',
                patientIdentifier: {
                    type: 'pid',
                    value: 'SITE;23'
                },
                rootJobId: '1',
                jobId: '1',
                referenceInfo: {
                    'sessionId': 'Test session',
                    'requestId': 'Test request'
                }
            };
            var completed = false;
            var actualError, actualSyncStatus;

            loadPatient(dummyLogger, config.syncRequestApi, job, function(error) {
                actualError = error;
                retrieveSyncStatus(job.patientIdentifier, environment, function(error, syncStatus) {
                    actualError = error;
                    actualSyncStatus = syncStatus;
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'response from demographics sync timed out.', 20000);

            var getJobComplete = false;

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualSyncStatus).toBe(200);

                //Verify referenceInfo was passed into enterprise-sync-request
                retrieveEnterpriseSyncJobHistory(job.patientIdentifier, environment, function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(response).toBeTruthy();
                    expect(response.message).toBeFalsy();
                    expect(val(result, ['items', '0', 'referenceInfo'])).toEqual(jasmine.objectContaining({
                        'sessionId': 'Test session',
                        'requestId': 'Test request'
                    }));
                    getJobComplete = true;
                });
            });

            waitsFor(function() {
                return getJobComplete;
            }, 'waiting for enterprise sync job', 20000);

        });
    });
});