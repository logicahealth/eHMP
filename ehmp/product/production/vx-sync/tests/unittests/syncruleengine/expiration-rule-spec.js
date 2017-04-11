'use strict';

var _ = require('underscore');

require('../../../env-setup');
var SyncRulesEngine = require(global.VX_SYNCRULES + 'rules-engine');
var JdsClient = require(global.VX_DUMMIES + 'jds-client-dummy');
var expirationRule = require(global.VX_SYNCRULES + 'expiration-rule');

var patientIdentifiers = [{
    'type': 'pid',
    'value': 'AAAA;1'
}, {
    'type': 'pid',
    'value': 'BBBB;1'
}, {
    'type': 'pid',
    'value': 'DOD;1111111'
}];
var patientIdentifiersVistaHdr = [{
    'type': 'pid',
    'value': 'AAAA;1'
}, {
    'type': 'pid',
    'value': 'BBBB;1'
}, {
    'type': 'pid',
    'value': 'DOD;1111111'
}, {
    'type': 'pid',
    'value': '3A8B;2'
}];
var patientIdentifiersSecondaryHdr = [{
    'type': 'pid',
    'value': 'AAAA;1'
}, {
    'type': 'pid',
    'value': 'BBBB;1'
}, {
    'type': 'pid',
    'value': 'DOD;1111111'
}, {
    'type': 'pid',
    'value': 'HDR;2222222'
}];
var enterpriseSyncJob = {
    'type': 'enterprise-sync-request',
    'patientIdentifier': patientIdentifiers[0],
    'rootJobId': '1',
    'jobId': '1'
};
var vistaAAAAjob = {
    'type': 'vista-AAAA-subscribe-request',
    'patientIdentifier': patientIdentifiers[0],
    'rootJobId': '1',
    'jobId': '2'
};
var vistaBBBBjob = {
    'type': 'vista-BBBB-subscribe-request',
    'patientIdentifier': patientIdentifiers[1],
    'rootJobId': '1',
    'jobId': '3'
};
var jmeadowsJob = {
    'type': 'jmeadows-sync-request',
    'patientIdentifier': patientIdentifiers[2],
    'rootJobId': '1',
    'jobId': '4'
};
var jmeadowsDomainSyncJob = {
    'type': 'jmeadows-sync-allergy-request',
    'patientIdentifier': patientIdentifiers[2],
    'rootJobId': '1',
    'jobId': '5'
};
var vistaHdr3A8Bjob = {
    'type': 'vistahdr-3A8B-subscribe-request',
    'patientIdentifier': patientIdentifiersVistaHdr[3],
    'rootJobId': '1',
    'jobId': '6'
};

var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'expiration-rule-spec',
//     level: 'debug'
// });
var config = {
    vistaSites: {
        'AAAA': {},
        'BBBB': {}
    },
    jds: {
        protocol: 'http',
        host: 'IPADDRESS ',
        port: 9080
    },
    rules: {
        'expiration': {
            'default': 60000
        }
    },
    'hdr': {
        'operationMode': 'REQ/RES'
    }
};
var environment = {
    'jds': new JdsClient(log, config),
    'metrics': log
};

var vistaHdrConfig = {
    vistaSites: {
        'AAAA': {},
        'BBBB': {}
    },
    jds: {
        protocol: 'http',
        host: 'IPADDRESS ',
        port: 9080
    },
    rules: {
        'expiration': {
            'default': 60000
        }
    },
    'hdr': {
        'operationMode': 'PUB/SUB',
        'hdrSites': {
            '3A8B': {
                'stationNumber': 42
            },
            'CF2A': {
                'stationNumber': 101
            },
            '72A0': {
                'stationNumber': 13
            },
            '8211': {
                'stationNumber': 1337
            },
            '84F0': {
                'stationNumber': 578
            }
        }
    }
};

var vistaHdrEnvironment = {
    'jds': new JdsClient(log, config),
    'metrics': log
};

// var engine = new SyncRulesEngine(log, config, environment);

describe('expiration-rule-unittest', function() {

    it('lets all identifiers through when unsynced', function() {
        var engine = new SyncRulesEngine(log, config, environment);
        var finished = false;
        var startedState = _.clone(enterpriseSyncJob);
        startedState.jpid = 'JPID';
        startedState.status = 'started';
        startedState.timestamp = Date.now().toString();
        environment.jds._setResponseData([null, null], ['', {
            'statusCode': 200
        }], [{
            'items': [startedState]
        }, {}]);
        runs(function() {
            engine.getSyncPatientIdentifiers(patientIdentifiers, [], function(error, ids) {
                expect(ids.length).toBe(3);
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });
    });

    it('intercepts identifiers for non-expired data when not forced', function() {
        var engine = new SyncRulesEngine(log, config, environment);
        var finished = false;

        var completedEnterpriseJob = _.clone(enterpriseSyncJob);
        completedEnterpriseJob.status = 'completed';
        completedEnterpriseJob.timestamp = (Date.now() - 10000).toString();

        var completedDodJob = _.clone(jmeadowsJob);
        completedDodJob.status = 'completed';
        completedDodJob.timestamp = (Date.now() - 9000).toString();

        environment.jds._setResponseData([null, null], ['', {
            'statusCode': 200
        }], [{
            'items': [completedEnterpriseJob, completedDodJob]
        }, {}]);
        runs(function() {
            engine.getSyncPatientIdentifiers(patientIdentifiers, [], function(error, ids) {
                expect(ids.length).toBe(2);
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });
    });

    it('lets identifiers through for forced jobs on non-expired data', function() {
        var engine = new SyncRulesEngine(log, config, environment);
        var finished = false;

        var completedEnterpriseJob = _.clone(enterpriseSyncJob);
        completedEnterpriseJob.status = 'completed';
        completedEnterpriseJob.timestamp = (Date.now() - 10000).toString();

        var completedDodJob = _.clone(jmeadowsJob);
        completedDodJob.status = 'completed';
        completedDodJob.timestamp = (Date.now() - 9000).toString();

        environment.jds._setResponseData([null, null], ['', {
            'statusCode': 200
        }], [{
            'items': [completedEnterpriseJob, completedDodJob]
        }, {}]);
        runs(function() {
            engine.getSyncPatientIdentifiers(patientIdentifiers, true, function(error, ids) {
                expect(ids.length).toBe(3);
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });
    });

    it('lets identifiers through for a forced site on non-expired data', function() {
        var engine = new SyncRulesEngine(log, config, environment);
        var finished = false;

        var completedEnterpriseJob = _.clone(enterpriseSyncJob);
        completedEnterpriseJob.status = 'completed';
        completedEnterpriseJob.timestamp = (Date.now() - 10000).toString();

        var completedDodJob = _.clone(jmeadowsJob);
        completedDodJob.status = 'completed';
        completedDodJob.timestamp = (Date.now() - 9000).toString();

        environment.jds._setResponseData([null, null], ['', {
            'statusCode': 200
        }], [{
            'items': [completedEnterpriseJob, completedDodJob]
        }, {}]);
        runs(function() {
            engine.getSyncPatientIdentifiers(patientIdentifiers, ['dod'], function(error, ids) {
                expect(ids.length).toBe(3);
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });
    });

    it('lets identifiers through on expired data', function() {
        var engine = new SyncRulesEngine(log, config, environment);
        var finished = false;

        var completedEnterpriseJob = _.clone(enterpriseSyncJob);
        completedEnterpriseJob.status = 'completed';
        completedEnterpriseJob.timestamp = (Date.now() - 10000000).toString();

        var completedDodJob = _.clone(jmeadowsJob);
        completedDodJob.status = 'completed';
        completedDodJob.timestamp = (Date.now() - 90000000).toString();

        environment.jds._setResponseData([null, null], ['', {
            'statusCode': 200
        }], [{
            'items': [completedEnterpriseJob, completedDodJob]
        }, {}]);
        runs(function() {
            engine.getSyncPatientIdentifiers(patientIdentifiers, [], function(error, ids) {
                expect(ids.length).toBe(3);
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });
    });

    it('lets identifiers through for secondary sites with error jobs', function() {
        var engine = new SyncRulesEngine(log, config, environment);
        var finished = false;

        var completedEnterpriseJob = _.clone(enterpriseSyncJob);
        completedEnterpriseJob.status = 'completed';
        completedEnterpriseJob.timestamp = (Date.now() - 10000).toString();

        var completedDodJob = _.clone(jmeadowsJob);
        completedDodJob.status = 'completed';
        completedDodJob.timestamp = (Date.now() - 9000).toString();

        var errorDodJob = _.clone(jmeadowsDomainSyncJob);
        errorDodJob.status = 'error';
        completedDodJob.timestamp = (Date.now() - 9000).toString();

        environment.jds._setResponseData([null, null], ['', {
            'statusCode': 200
        }], [{
            'items': [completedEnterpriseJob, completedDodJob, errorDodJob]
        }, {}]);
        runs(function() {
            engine.getSyncPatientIdentifiers(patientIdentifiers, [], function(error, ids) {
                expect(ids.length).toBe(3);
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });
    });

    it('lets identifiers through for vistaHdr site that has not been synced yet.', function() {
        var engine = new SyncRulesEngine(log, vistaHdrConfig, vistaHdrEnvironment);
        var finished = false;

        var completedEnterpriseJob = _.clone(enterpriseSyncJob);
        completedEnterpriseJob.status = 'completed';
        completedEnterpriseJob.timestamp = (Date.now() - 10000).toString();

        var completedDodJob = _.clone(jmeadowsJob);
        completedDodJob.status = 'completed';
        completedDodJob.timestamp = (Date.now() - 9000).toString();

        var completedAAAAJob = _.clone(vistaAAAAjob);
        completedAAAAJob.status = 'completed';
        completedAAAAJob.timestamp = (Date.now() - 9500).toString();

        var completedBBBBJob = _.clone(vistaBBBBjob);
        completedBBBBJob.status = 'completed';
        completedBBBBJob.timestamp = (Date.now() - 9500).toString();

        vistaHdrEnvironment.jds._setResponseData([null, null], ['', {
            'statusCode': 200
        }], [{
            'items': [completedEnterpriseJob, completedDodJob, completedAAAAJob, completedBBBBJob]
        }, {}]);
        runs(function() {
            engine.getSyncPatientIdentifiers(patientIdentifiersVistaHdr, [], function(error, ids) {
                expect(ids.length).toBe(1);
                expect(ids[0].value).toEqual('3A8B;2');
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });

    });

    it('lets identifiers through for a secondary HDR when in REQ/RES mode', function() {
        var engine = new SyncRulesEngine(log, config, environment);
        var finished = false;

        var completedEnterpriseJob = _.clone(enterpriseSyncJob);
        completedEnterpriseJob.status = 'completed';
        completedEnterpriseJob.timestamp = (Date.now() - 10000).toString();

        var completedDodJob = _.clone(jmeadowsJob);
        completedDodJob.status = 'completed';
        completedDodJob.timestamp = (Date.now() - 9000).toString();

        var completedAAAAJob = _.clone(vistaAAAAjob);
        completedAAAAJob.status = 'completed';
        completedAAAAJob.timestamp = (Date.now() - 9500).toString();

        var completedBBBBJob = _.clone(vistaBBBBjob);
        completedBBBBJob.status = 'completed';
        completedBBBBJob.timestamp = (Date.now() - 9500).toString();

        environment.jds._setResponseData([null, null], ['', {
            'statusCode': 200
        }], [{
            'items': [completedEnterpriseJob, completedDodJob, completedAAAAJob, completedBBBBJob]
        }, {}]);
        runs(function() {
            engine.getSyncPatientIdentifiers(patientIdentifiersSecondaryHdr, [], function(error, ids) {
                expect(ids.length).toBe(1);
                expect(ids[0].value).toEqual('HDR;2222222');
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });
    });


    describe('getSecondaryPidsWithErrorJobs', function() {
        it('returns pids that correspond to errored secondary jobs', function() {
            var secondaryPids = ['DOD;1111', 'HDR;2222', 'YYY;3333'];
            var jobs = [{
                patientIdentifier: {
                    type: 'pid',
                    value: 'DOD;1111'
                },
                type: 'jmeadows-sync-allergy-request',
                status: 'error'
            }, {
                patientIdentifier: {
                    type: 'pid',
                    value: 'DOD;1111'
                },
                type: 'jmeadows-sync-progressNote-request',
                status: 'completed'
            }, {
                patientIdentifier: {
                    type: 'pid',
                    value: 'HDR;2222'
                },
                type: 'hdr-sync-allergy-request',
                status: 'error'
            }, {
                patientIdentifier: {
                    type: 'pid',
                    value: 'AAAA;0000'
                },
                type: 'vista-AAAA-subscribe-request',
                status: 'completed'
            }];
            var errorPids = expirationRule._steps._getSecondaryPidsWithErrorJobs(secondaryPids, jobs, log);
            expect(errorPids).toContain('DOD;1111');
            expect(errorPids).toContain('HDR;2222');
            //console.log(errorPids);
        });
        it('does not return pids for secondary site where all jobs are completed', function() {
            var secondaryPids = ['DOD;1111', 'HDR;2222', 'YYY;3333'];
            var jobs = [{
                patientIdentifier: {
                    type: 'pid',
                    value: 'DOD;1111'
                },
                type: 'jmeadows-sync-allergy-request',
                status: 'completed'
            }, {
                patientIdentifier: {
                    type: 'pid',
                    value: 'DOD;1111'
                },
                type: 'jmeadows-sync-progressNote-request',
                status: 'completed'
            }, {
                patientIdentifier: {
                    type: 'pid',
                    value: 'HDR;2222'
                },
                type: 'hdr-sync-allergy-request',
                status: 'error'
            }, {
                patientIdentifier: {
                    type: 'pid',
                    value: 'AAAA;0000'
                },
                type: 'vista-AAAA-subscribe-request',
                status: 'completed'
            }];
            var errorPids = expirationRule._steps._getSecondaryPidsWithErrorJobs(secondaryPids, jobs, log);
            expect(errorPids).toContain('HDR;2222');
            //console.log(errorPids);
        });
        it('does not return any pids when all secondary jobs are successfully completed', function() {
            var secondaryPids = ['DOD;1111', 'HDR;2222', 'YYY;3333'];
            var jobs = [{
                patientIdentifier: {
                    type: 'pid',
                    value: 'DOD;1111'
                },
                type: 'jmeadows-sync-allergy-request',
                status: 'completed'
            }, {
                patientIdentifier: {
                    type: 'pid',
                    value: 'DOD;1111'
                },
                type: 'jmeadows-sync-progressNote-request',
                status: 'completed'
            }, {
                patientIdentifier: {
                    type: 'pid',
                    value: 'HDR;2222'
                },
                type: 'hdr-sync-allergy-request',
                status: 'completed'
            }, {
                patientIdentifier: {
                    type: 'pid',
                    value: 'AAAA;0000'
                },
                type: 'vista-AAAA-subscribe-request',
                status: 'completed'
            }];
            var errorPids = expirationRule._steps._getSecondaryPidsWithErrorJobs(secondaryPids, jobs, log);
            expect(errorPids).toEqual([]);
            //console.log(errorPids);
        });
    });
});