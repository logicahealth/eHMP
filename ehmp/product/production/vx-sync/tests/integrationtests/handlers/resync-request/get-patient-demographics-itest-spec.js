'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var async = require('async');
var request = require('request');
var getDemographics = require(global.VX_HANDLERS + 'resync-request/get-patient-demographics');

var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
var wConfig = require(global.VX_ROOT + 'worker-config');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');

var host = require(global.VX_INTTESTS + 'test-config');
var port = PORT;

function loadTestPatient(config, patientIdentifierValue) {
    var completed = false;
    var actualError, actualResponse;

    runs(function() {
        var options = {
            url: config.protocol + '://' + config.host + ':' + config.port + config.patientSyncPath,
            method: 'GET',
            qs: {pid: patientIdentifierValue}};

        request.get(options, function(error, response) {
            actualError = error;
            actualResponse = response;
            completed = true;
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for load patient.', 20000);

    runs(function() {
        expect(actualError).toBeFalsy();
        expect(actualResponse).toBeTruthy();
    });
}

function waitForDemographicsInJds(environment, pid) {
    var completed = false
    var task = function(callback, results) {
        environment.jds.getPtDemographicsByPid(pid, function(error, response) {
            setTimeout(function(){
                if (error || response.statusCode !== 200) {
                    return callback('error')
                }
                return callback();
            }, 2000);
        });
    }

    runs(function() {
        async.retry(10, task, function(err, result) {
            completed = true
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for load patient.', 20000);
}

describe('get-patient-demographics', function() {
    describe('When a get patient demographics request is made', function() {
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
                    host: 'IP        ',
                    port: PORT
                })
            };

            environment = {
                metrics: dummyLogger,
                jds: new JdsClient(dummyLogger, dummyLogger, config)
            };

            loadTestPatient(config.syncRequestApi, '9E7A;3');
            waitForDemographicsInJds(environment, '9E7A;3')
        });

        it('then demographics are added to the job', function() {
            var job = {
                type: 'resync-request',
                patientIdentifier: {
                    type: 'icn',
                    value: '10108V420871'
                },
                rootJobId: '1',
                jobId: '1'
            };
            var completed = false;
            var actualError;

            getDemographics.loadDemographics(environment, dummyLogger, job, function (error) {
                actualError = error;
                completed = true;
            });

            waitsFor(function () {
                return completed;
            }, 'response from get patient demographics timed out.', 10000);

            runs(function () {
                expect(actualError).toBeFalsy();
                expect(job.demographics).not.toBeFalsy();
            });
        });
    });
});
