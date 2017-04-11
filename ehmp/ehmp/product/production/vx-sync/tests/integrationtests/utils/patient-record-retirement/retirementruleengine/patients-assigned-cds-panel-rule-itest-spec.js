/*global describe, it, beforeEach, afterEach, expect, runs, waitsFor */
/*jslint node: true */
'use strict';

var _ = require('underscore');

require('../../../../../env-setup');
var RetirementRulesEngine = require(global.VX_RETIREMENTRULES + '/rules-engine');
var wConfig = require(global.VX_ROOT + 'worker-config');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

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

var oneDayAgo = new Date();
var overAYearAgo = new Date();
oneDayAgo.setDate(oneDayAgo.getDate() - 1);
overAYearAgo.setDate(overAYearAgo.getDate() - 370);

var patientIds = [{
    value: '9E7A;3',
    type: 'PID',
    cdsPanel: true,
    lastAccessed: overAYearAgo
}, {
    type: 'icn',
    value: '10107V395912'
}, {
    value: '302394234V323425',
    type: 'ICN',
    cdsPanel: true,
    lastAccessed: overAYearAgo
}, {
    value: 'DOD;0000000003',
    type: 'PID',
    cdsPanel: true,
    lastAccessed: overAYearAgo
}];

var patientsAssignedCdsPanelJob = {
    'type': 'patients-assigned-cds-panel',
    'patientIdentifier': patientIdentifiers[2],
    'rootJobId': '1',
    'jobId': '5'
};

var log = require(global.VX_DUMMIES + 'dummy-logger');
var config = {
    vistaSites: {
        'AAAA': {},
        'BBBB': {}
    },
    jds: _.defaults(wConfig.jds, {
        protocol: 'http',
        host: '10.2.2.110',
        port: 9080
    }),
    recordRetirement: {
        rules: {
            'patients-assigned-cds-panel': {
                'default': 60000
            }
        }
    }
};
var environment = {
    'jds': new JdsClient(log, log, config),
    'metrics': log
};

var engine = new RetirementRulesEngine(log, config, environment);
var jpid;

describe('patients-assigned-cds-panel', function() {
    beforeEach(function() {
        var finished = false;
        runs(function() {
            environment.jds.storePatientIdentifier({
                'patientIdentifiers': _.pluck(patientIdentifiers, 'value')
            }, function() {
                environment.jds.getPatientIdentifier({
                    'patientIdentifier': patientIdentifiers[0]
                }, function(error, response, result) {
                    if (error) {
                        console.log(error);
                    }
                    //jpid = result.jpid;
                    //patientsAssignedCdsPanelJob.jpid = jpid;
                    var startedState = _.clone(patientsAssignedCdsPanelJob);
                    startedState.status = 'started';
                    startedState.timestamp = Date.now().toString();
                    environment.jds.saveJobState(startedState, function() {
                        finished = true;
                    });
                });
            });
        });

        waitsFor(function() {
            return finished;
        });
    });

    it('lets all identifiers through when unsynced', function() {
        var finished = false;
        runs(function() {
            engine.processRetirementRules(patientIds, function(error, ids) {
                expect(val(ids, 'length')).toBe(4);
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });
    });

    it('intercepts identifiers for non-expired data when not forced', function() {
        var finished = false;
        runs(function() {
            var completedEnterpriseJob = _.clone(patientsAssignedCdsPanelJob);
            completedEnterpriseJob.status = 'completed';
            completedEnterpriseJob.timestamp = (Date.now() - 10000).toString();

            //var completedDodJob = _.clone(jmeadowsJob);
            //completedDodJob.status = 'completed';
            //completedDodJob.timestamp = (Date.now() - 9000).toString();

            environment.jds.saveJobState(completedEnterpriseJob, function() {
                //environment.jds.saveJobState(completedDodJob, function() {
                engine.processRetirementRules(patientIds, function(error, ids) {
                    expect(val(ids, 'length')).toBe(4);
                    finished = true;
                });
                //});
            });
        });

        waitsFor(function() {
            return finished;
        });
    });

    afterEach(function() {
        var finished = false;
        runs(function() {
            environment.jds.deletePatientByPid(patientIdentifiers[0].value, function() {
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        }, 10000);
    });
});