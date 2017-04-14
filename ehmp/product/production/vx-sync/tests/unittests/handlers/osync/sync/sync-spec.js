'use strict';

require('../../../../../env-setup');

var request = require('request');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var resultsLog = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/sync/sync');
var storePatientInfoToResultsLog = require(global.VX_HANDLERS + 'osync/sync/sync')._storePatientInfoToResultsLog;
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var PublisherDummy = require(global.VX_DUMMIES + 'publisherDummy');
var shouldSyncPatient = require(global.VX_HANDLERS + 'osync/sync/sync')._shouldSyncPatient;
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var blacklistUtils = require(global.OSYNC_UTILS + 'blacklist-utils');
var _ = require('underscore');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'sync-spec',
//     level: 'debug'
// });

//---------------------------------------------------------------------------------
// This method creates an instance of the config.osync section of the config file.
//
// returns: The config.osync settings to be used in the tests.
//---------------------------------------------------------------------------------
function createoSyncConfig() {
    var osyncConfig = {
        syncUrl: 'http://10.3.3.6:8080/sync/doLoad',
        statusUrl: 'http://10.3.3.6:8080/sync/status'
    };

    return osyncConfig;
}

//----------------------------------------------------------------------------------
// This method creates an instance of the environment variable.
//
// osyncConfig: The osync section of the config (worker-config.json)
// returns: The environment variable.
//----------------------------------------------------------------------------------
function createEnvironment(osyncConfig) {
    var environment = {
        metrics: log,
        resultsLog: resultsLog,
        publisherRouter: new PublisherRouterDummy(log, osyncConfig, PublisherDummy),
        jds: new JdsClientDummy(log, osyncConfig),
        validPatientsLog: {
            info: jasmine.createSpy()
        }
    };

    spyOn(environment.resultsLog, 'info').andCallThrough();

    return environment;
}

describe('sync handler unit test', function() {
    describe('sync.handle error conditions for jobs passed in', function() {
        it('error condition: incorrect job type (empty)', function() {
            var done = false;

            runs(function() {
                var job = {};
                var config = null;
                var environment = null;
                handler(log, config, environment, job, function(error) {
                    done = true;
                    expect(error).toBe('sync.validate: Could not find job type');
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });

        it('error condition: incorrect job type (wrong type)', function() {
            var done = false;

            runs(function() {
                var job = {
                    'type': 'BOGUS'
                };
                var osyncConfig = null;
                var environment = null;
                handler(log, osyncConfig, environment, job, function(error) {
                    done = true;
                    expect(error).toBe('sync.validate: job type was not sync');
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });

        it('error condition: incorrect job source (empty)', function() {
            var done = false;

            runs(function() {
                var job = {
                    'type': 'sync'
                };
                var osyncConfig = null;
                var environment = null;
                handler(log, osyncConfig, environment, job, function(error) {
                    done = true;
                    expect(error).toBe('sync.validate: Could not find job source');
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });

        it('error condition: incorrect job source (wrong source)', function() {
            var done = false;

            runs(function() {
                var job = {
                    'type': 'sync',
                    'source': 'bogus'
                };
                var osyncConfig = null;
                var environment = null;
                handler(log, osyncConfig, environment, job, function(error) {
                    done = true;
                    expect(error).toBe('sync.validate: job source was not "appointments" , "admissions" or "patient lists"');
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });

        it('error condition: incorrect job patients (empty)', function() {
            var done = false;

            runs(function() {
                var job = {
                    'type': 'sync',
                    'source': 'appointments'
                };
                var osyncConfig = null;
                var environment = null;
                handler(log, osyncConfig, environment, job, function(error) {
                    done = true;
                    expect(error).toBe('sync.validate: Could not find job patient');
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });

        it('error condition: patient missing icn and dfn', function() {
            var done = false;

            runs(function() {
                var job = {
                    'type': 'sync',
                    'source': 'appointments',
                    'patient': {}
                };
                var osyncConfig = null;
                var environment = null;
                handler(log, osyncConfig, environment, job, function(error) {
                    done = true;
                    expect(error).toBe('sync.validate: Missing dfn and icn for patient');
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });
    });

    describe('sync.handle error conditions for configuration passed in', function() {
        it('error condition: config missing', function() {
            var done = false;

            runs(function() {
                var job = {
                    'type': 'sync',
                    'source': 'appointments',
                    'patient': {
                        'ien': '9E7A;1234'
                    }
                };
                var osyncConfig = null;
                var environment = null;
                handler(log, osyncConfig, environment, job, function(error) {
                    done = true;
                    expect(error).toBe('sync.validateConfig: Configuration cannot be null');
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });

        it('error condition: config missing syncUrl', function() {
            var done = false;

            runs(function() {
                var job = {
                    'type': 'sync',
                    'source': 'appointments',
                    'patient': {
                        'ien': '9E7A;1234'
                    }
                };
                var osyncConfig = {};
                var environment = null;
                handler(log, osyncConfig, environment, job, function(error) {
                    done = true;
                    expect(error).toBe('sync.validateConfig: syncUrl cannot be null');
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });
    });

    describe('send sync request', function() {
        beforeEach(function() {
            spyOn(request, 'get').andCallFake(function(syncUrl, callback) {
                callback(null, {
                    statusCode: 200
                }, {
                    syncStatus: {}
                });
                return {
                    on: function() {}
                };
            });
        });

        it('verify pid and priority set correctly when syncPriority is missing from config', function() {
            var done = false;

            runs(function() {
                var job = {
                    type: 'sync',
                    source: 'appointments',
                    siteId: '9E7A',
                    patient: {
                        dfn: '1234'
                    }
                };

                var osyncConfig = createoSyncConfig();
                var environment = createEnvironment(osyncConfig);
                environment.jds._setResponseData([null], [{
                    statusCode: 404
                }], [null]);

                spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                    callback(null, false);
                });

                handler(log, osyncConfig, environment, job, function(error, data) {
                    expect(error).toBeFalsy();
                    expect(data).toBeFalsy();
                    expect(val(environment, ['resultsLog', 'info', 'calls', '0', 'args', '0'])).toContain('{"siteId":"9E7A","patient":{"dfn":"1234"},"source":"appointments","syncDate"');
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'url'])).toBe(osyncConfig.syncUrl);
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'qs', 'pid'])).toBe('9E7A;1234');
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'qs', 'priority'])).toBe(50);
                    expect(val(environment, ['validPatientsLog', 'info', 'calls', '0', 'args', '0'])).toContain(JSON.stringify({
                        'siteId': job.siteId,
                        'patient': job.patient,
                        'source': job.source
                    }));
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });

        it('verify icn and priority set correctly when syncPriority is set in config', function() {
            var done = false;

            runs(function() {
                var job = {
                    type: 'sync',
                    source: 'appointments',
                    patient: {
                        ien: '10110V004877'
                    }
                };
                var osyncConfig = createoSyncConfig();
                osyncConfig.syncPriority = 80;
                var environment = createEnvironment(osyncConfig);
                environment.jds._setResponseData([null], [{
                    statusCode: 404
                }], [null]);

                spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                    callback(null, false);
                });

                handler(log, osyncConfig, environment, job, function(error, data) {
                    expect(error).toBeFalsy();
                    expect(data).toBeFalsy();
                    expect(val(environment, ['resultsLog', 'info', 'calls', '0', 'args', '0'])).toContain('{"patient":{"ien":"10110V004877"},"source":"appointments","syncDate"');
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'url'])).toBe(osyncConfig.syncUrl);
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'qs', 'icn'])).toBe('10110V004877');
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'qs', 'priority'])).toBe(80);
                    expect(val(environment, ['validPatientsLog', 'info', 'calls', '0', 'args', '0'])).toContain(JSON.stringify({
                        'siteId': job.siteId,
                        'patient': job.patient,
                        'source': job.source
                    }));
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });

        it('verify priority set correctly when syncPriority is less than 1 and is set in config', function() {
            var done = false;

            runs(function() {
                var job = {
                    type: 'sync',
                    source: 'appointments',
                    patient: {
                        ien: '10110V004877'
                    }
                };
                var osyncConfig = createoSyncConfig();
                osyncConfig.syncPriority = -10;
                var environment = createEnvironment(osyncConfig);
                environment.jds._setResponseData([null], [{
                    statusCode: 404
                }], [null]);

                spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                    callback(null, false);
                });

                handler(log, osyncConfig, environment, job, function(error, data) {
                    expect(error).toBeFalsy();
                    expect(data).toBeFalsy();
                    expect(val(environment, ['resultsLog', 'info', 'calls', '0', 'args', '0'])).toContain('{"patient":{"ien":"10110V004877"},"source":"appointments","syncDate"');
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'url'])).toBe(osyncConfig.syncUrl);
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'qs', 'icn'])).toBe('10110V004877');
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'qs', 'priority'])).toBe(1);
                    expect(val(environment, ['validPatientsLog', 'info', 'calls', '0', 'args', '0'])).toContain(JSON.stringify({
                        'siteId': job.siteId,
                        'patient': job.patient,
                        'source': job.source
                    }));
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });

        it('verify priority set correctly when syncPriority is greater than 100 and is set in config', function() {
            var done = false;

            runs(function() {
                var job = {
                    type: 'sync',
                    source: 'appointments',
                    patient: {
                        ien: '10110V004877'
                    }
                };
                var osyncConfig = createoSyncConfig();
                osyncConfig.syncPriority = 200;
                var environment = createEnvironment(osyncConfig);
                environment.jds._setResponseData([null], [{
                    statusCode: 404
                }], [null]);

                spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                    callback(null, false);
                });

                handler(log, osyncConfig, environment, job, function(error, data) {
                    expect(error).toBeFalsy();
                    expect(data).toBeFalsy();
                    expect(val(environment, ['resultsLog', 'info', 'calls', '0', 'args', '0'])).toContain('{"patient":{"ien":"10110V004877"},"source":"appointments","syncDate"');
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'url'])).toBe(osyncConfig.syncUrl);
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'qs', 'icn'])).toBe('10110V004877');
                    expect(val(request, ['get', 'calls', '0', 'args', '0', 'qs', 'priority'])).toBe(100);
                    expect(val(environment, ['validPatientsLog', 'info', 'calls', '0', 'args', '0'])).toContain(JSON.stringify({
                        'siteId': job.siteId,
                        'patient': job.patient,
                        'source': job.source
                    }));
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);


        });
    });

    describe('sync.handle: non-sync paths', function() {
        var job = {
            type: 'sync',
            source: 'appointments',
            patient: {
                ien: '10110V004877'
            }
        };

        var done = false;

        it('return error when shouldSyncPatient returns error', function() {
            var osyncConfig = createoSyncConfig();
            var environment = createEnvironment(osyncConfig);
            environment.jds._setResponseData([null], [{
                statusCode: 500
            }], [null]);

            spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                callback(null, false);
            });

            handler(log, osyncConfig, environment, job, function(error, data) {
                expect(error).toBeTruthy();
                expect(data).toBeFalsy();
                expect(_.isEmpty(val(environment, ['resultsLog', 'info', 'calls']))).toBe(true);
                done = true;
            });
        });
        it('does not call sync when shouldSyncPatient returns false', function() {
            var osyncConfig = createoSyncConfig();
            var environment = createEnvironment(osyncConfig);

            spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                callback(null, true);
            });

            handler(log, osyncConfig, environment, job, function(error, data) {
                expect(error).toBeFalsy();
                expect(data).toBeTruthy();
                expect(_.isEmpty(val(environment, ['resultsLog', 'info', 'calls']))).toBe(true);
                done = true;
            });
        });
    });

    describe('Testing: storePatientInfoToResultsLog', function() {
        it('Verify that it correctly writes to resultsLog', function() {
            var done = false;

            runs(function() {
                var job = {
                    type: 'sync',
                    source: 'appointments',
                    siteId: '9E7A',
                    patient: {
                        dfn: '1234'
                    }
                };

                var osyncConfig = createoSyncConfig();
                var environment = createEnvironment(osyncConfig);
                storePatientInfoToResultsLog(log, environment, job, function(error) {
                    expect(error).toBeFalsy();
                    expect(environment.resultsLog.info.calls[0].args[0]).toContain('{"siteId":"9E7A","patient":{"dfn":"1234"},"source":"appointments","syncDate"');
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);
        });
    });

    describe('shouldSyncPatient', function() {
        var job = {
            type: 'sync',
            source: 'appointments',
            siteId: '9E7A',
            patient: {
                dfn: '1234'
            }
        };

        var patientIdentifier = {
            type: 'pid',
            value: '9E7A;1234'
        };

        it('Normal path: sync patient (patient has not been previously synced)', function() {
            var config = createoSyncConfig();
            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [{
                statusCode: 404
            }], [null]);

            spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                callback(null, false);
            });

            var done = false;

            runs(function() {
                shouldSyncPatient(log, config, environment, job, patientIdentifier, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe(true);
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });
        it('Normal path: sync patient (sync status shows previous sync is completed with error', function() {
            var config = createoSyncConfig();
            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                syncCompleted: true,
                hasError: true
            }]);

            spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                callback(null, false);
            });

            var done = false;

            runs(function() {
                shouldSyncPatient(log, config, environment, job, patientIdentifier, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe(true);
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });
        it('Normal path: sync patient (sync status shows previous sync is in progress with error', function() {
            var config = createoSyncConfig();
            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                syncCompleted: false,
                hasError: true
            }]);

            spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                callback(null, false);
            });

            var done = false;

            runs(function() {
                shouldSyncPatient(log, config, environment, job, patientIdentifier, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe(true);
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });
        it('Normal path: don\'t sync patient (sync status shows previous sync was completed and is not in error state)', function() {
            var config = createoSyncConfig();
            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                syncCompleted: true
            }]);

            spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                callback(null, false);
            });

            var done = false;

            runs(function() {
                shouldSyncPatient(log, config, environment, job, patientIdentifier, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe(false);
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });
        it('Normal path: don\'t sync (sync status shows previous sync in progress)', function() {
            var config = createoSyncConfig();
            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [{
                statusCode: 200
            }], [{
                syncCompleted: false
            }]);

            spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                callback(null, false);
            });

            var done = false;

            runs(function() {
                shouldSyncPatient(log, config, environment, job, patientIdentifier, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe(false);
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });
        it('Normal path: don\'t sync (patient is on blacklist)', function() {
            var config = createoSyncConfig();
            var environment = createEnvironment(config);

            spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                callback(null, true);
            });

            var done = false;

            runs(function() {
                shouldSyncPatient(log, config, environment, job, patientIdentifier, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe(false);
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });
        it('Error path: error from jds', function() {
            var config = createoSyncConfig();
            var environment = createEnvironment(config);
            environment.jds._setResponseData(['error'], [null], [null]);

            spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                callback(null, false);
            });

            var done = false;

            runs(function() {
                shouldSyncPatient(log, config, environment, job, patientIdentifier, function(error, result) {
                    expect(error).toBeTruthy();
                    expect(result).toBeFalsy();
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });
        it('Error path: unexpected response from jds', function() {
            var config = createoSyncConfig();
            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [{
                statusCode: 500
            }], [null]);

            spyOn(blacklistUtils, 'isBlackListedPatient').andCallFake(function(log, config, patientId, siteId, callback) {
                callback(null, false);
            });

            var done = false;

            runs(function() {
                shouldSyncPatient(log, config, environment, job, patientIdentifier, function(error, result) {
                    expect(error).toBeTruthy();
                    expect(result).toBeFalsy();
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });
    });
});