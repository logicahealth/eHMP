'use strict';

require('../../../../env-setup');

var _ = require('underscore');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
var patientIdUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var handler = require(global.VX_HANDLERS + 'event-prioritization-request/event-prioritization-request-handler');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var vx_sync_ip = require(global.VX_INTTESTS + 'test-config');

var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var wConfig = require(global.VX_ROOT + 'worker-config');

var host = vx_sync_ip;
var PORT       ;
var tubename = 'vx-sync-test';

// logger = require('bunyan').createLogger({
//     name: 'enterprise-sync-request-handler',
//     level: 'debug'
// });

function getConfiguration() {
    var beanstalkConfig = ({
        repoUniversal: {
            priority: 10,
            delay: 0,
            ttr: 60,
            timeout: 10,
            initMillis: 1000,
            maxMillis: 15000,
            incMillis: 1000
        },
        repoDefaults: {
            host: host,
            port: port,
            tubename: tubename,
            tubePrefix: 'vxs-',
            jobTypeForTube: true
        },
        jobTypes: {
            'enterprise-sync-request': {},

            'record-enrichment': {
                "tubeDetails": [{"ratio": 5000, "priority": {"startValue": 1, "endValue": 20}}, {"ratio": 3000, "priority": {"startValue": 21, "endValue": 40}}, {"ratio": 2000, "priority": {"startValue": 41, "endValue": 60}}, {"ratio": 1000, "priority": {"startValue": 61, "endValue": 80}}, {"ratio": 500, "priority": {"startValue": 81, "endValue": 100}}]
            },
            'store-record': {},
            'event-prioritization-request': {},
            'operational-store-record': {},
            'publish-data-change-event': {},
            'patient-data-state-checker': {}
        }
    });

    return {
        "eventPrioritizationRules": {
            "site-type": {},
            "domain-type": {
                "consult": 20,
                "allergy": -20,
                "order": 40
            }
        },
        'vistaSites': {
            'AEDD': _.defaults(wConfig.vistaSites['9E7A'], {
                'name': 'panorama',
                'host': 'IP_ADDRESS',
                'port': 9210,
                'accessCode': 'PW',
                'verifyCode': 'PW',
                'localIP': '127.0.0.1',
                'localAddress': 'localhost',
                'connectTimeout': 3000,
                'sendTimeout': 10000
            }),
            'ABCD': _.defaults(wConfig.vistaSites.C877, {
                'name': 'kodak',
                'host': 'IP_ADDRESS',
                'port': 9210,
                'accessCode': 'PW',
                'verifyCode': 'PW',
                'localIP': '127.0.0.1',
                'localAddress': 'localhost',
                'connectTimeout': 3000,
                'sendTimeout': 10000
            })
        },
        beanstalkConfig: beanstalkConfig,
        jds: _.defaults(wConfig.jds, {
            protocol: 'http',
            host: 'IP_ADDRESS',
            port: 9080
        })
    };
}

function getEnvironment(config) {
    var environment = {
        jds: new JdsClient(logger, logger, config),
        metrics: logger
    };
    environment.jobStatusUpdater = new JobStatusUpdater(logger, config, environment.jds);
    environment.publisherRouter = new PublisherRouter(logger, config, environment.metrics, environment.jobStatusUpdater);

    return environment;
}

function getTubeWithJob(results, tubeNumber) {
    return _.find(results, function(result) {
        return result.tubename.slice(-1) === tubeNumber;
    });
}

function saveJobStatus(jdsClient, startedEnterpriseSyncRequestState) {
    var finished;
    runs(function() {
        jdsClient.saveJobState(startedEnterpriseSyncRequestState, function(error, response) {
            expect(error).toBeNull();
            finished = true;
        });
    });

    waitsFor(function() { return finished; }, 20000);
}

function storePatient(jdsClient, patientIds) {
    var jdsSave = {
        'patientIdentifiers': patientIds
    };

    var finished;
    runs(function() {
        jdsClient.storePatientIdentifier(jdsSave, function(error, response) {
            expect(error).toBeNull();
            finished = true;
        });
    });

    waitsFor(function() { return finished; }, 20000);
}

function clearJobStatus(jdsClient, patientIdentifier) {
    var finished;
    runs(function() {
        jdsClient.clearJobStatesByPatientIdentifier(patientIdentifier, function(error, response) {
            expect(error).toBeNull();
            finished = true;
        });
    });

    waitsFor(function() { return finished; }, 20000);
}

describe('event-prioritization-request-handler.js', function() {
    describe('domain rules', function() {
        it('verify handler changes prioritization for order domain and puts job in correct tube', function() {
            var config = getConfiguration();
            var environment = getEnvironment(config);

            var patientIdentifier = patientIdUtil.create('icn', '5000000116V000001');

            var meta = {
                rootJobId: 1,
                priority: 50
            };
            var job = jobUtil.createRecordEnrichment(patientIdentifier, 'order', {data: ''}, meta);

            testHandler(handler, logger, config, environment, host, port, tubename, job, [job.type], 90000, function(result) {
                var tube = getTubeWithJob(result, '5');

                expect(tube).toBeDefined();
                expect(tube.jobs[0].priority).toBe(90);
            });
        });
    });

    describe('site rules', function() {
        describe('synced by icn', function() {
            var startedSyncByIcn  = {
                jobId: 1000002,
                rootJobId: 1000003,
                type: 'enterprise-sync-request',
                timestamp: '1417698653396',
                priority: 30,
                patientIdentifier: {
                    type: 'icn',
                    value: '5111100116V912830'
                },
                status: 'started'
            };

            var config = getConfiguration();
            var environment = getEnvironment(config);
            var patientIdentifier = {type: 'pid', value: 'AEDD;3'};

            it('verify handler changes prioritization for site and puts job in correct tube', function() {
                storePatient(environment.jds, [patientIdentifier.value, startedSyncByIcn.patientIdentifier.value]);
                saveJobStatus(environment.jds, startedSyncByIcn);

                var meta = {
                    rootJobId: startedSyncByIcn.rootJobId,
                    priority: 50
                };
                var job = jobUtil.createRecordEnrichment(patientIdentifier, 'meds', {data: ''}, meta);

                testHandler(handler, logger, config, environment, host, port, tubename, job, [job.type], 90000, function(result) {
                    var tube = getTubeWithJob(result, '3');

                    expect(tube).toBeDefined();
                    expect(tube.jobs[0].priority).toBe(50);
                });
            });

            afterEach(function() {
                clearJobStatus(environment.jds, patientIdentifier);
            });
        });

        describe('synced by my site', function() {
            var startedSyncByPid  = {
                jobId: 1000000,
                rootJobId: 1000001,
                type: 'enterprise-sync-request',
                timestamp: '1417698653396',
                priority: 30,
                patientIdentifier: {
                    type: 'pid',
                    value: 'AEDD;4'
                },
                status: 'started'
            };

            var config = getConfiguration();
            var environment = getEnvironment(config);

            it('verify handler changes prioritization for site and puts job in correct tube', function() {
                storePatient(environment.jds, ['ABCD;4', startedSyncByPid.patientIdentifier.value]);
                saveJobStatus(environment.jds, startedSyncByPid);

                var meta = {
                    rootJobId: startedSyncByPid.rootJobId,
                    priority: 50
                };
                var job = jobUtil.createRecordEnrichment(startedSyncByPid.patientIdentifier, 'meds', {data: ''}, meta);

                testHandler(handler, logger, config, environment, host, port, tubename, job, [job.type], 90000, function(result) {
                    var tube = getTubeWithJob(result, '2');

                    expect(tube).toBeDefined();
                    expect(tube.jobs[0].priority).toBe(30);
                });
            });

            afterEach(function() {
                clearJobStatus(environment.jds, startedSyncByPid.patientIdentifier);
            });
        });

        describe('job for secondary site', function() {
            var startedSyncByPid  = {
                jobId: 1000004,
                rootJobId: 1000005,
                type: 'enterprise-sync-request',
                timestamp: '1417698653396',
                priority: 30,
                patientIdentifier: {
                    type: 'pid',
                    value: 'AEDD;5'
                },
                status: 'started'
            };
            var secondarySitePatientIdentifier = {
                type: 'pid',
                value: 'VLER;6'
            };

            var config = getConfiguration();
            var environment = getEnvironment(config);

            it('verify handler changes prioritization for site and puts job in correct tube when enriching secondary site data', function() {
                storePatient(environment.jds, [secondarySitePatientIdentifier.value, startedSyncByPid.patientIdentifier.value]);
                saveJobStatus(environment.jds, startedSyncByPid);

                var meta = {
                    rootJobId: startedSyncByPid.rootJobId,
                    priority: 50
                };
                var job = jobUtil.createRecordEnrichment(secondarySitePatientIdentifier, 'meds', {data: ''}, meta);

                testHandler(handler, logger, config, environment, host, port, tubename, job, [job.type], 90000, function(result) {
                    var tube = getTubeWithJob(result, '4');

                    expect(tube).toBeDefined();
                    expect(tube.jobs[0].priority).toBe(70);
                });
            });

            afterEach(function() {
                clearJobStatus(environment.jds, startedSyncByPid.patientIdentifier);
            });
        });
    });
});