/*global describe, it, expect, runs, waitsFor */
'use strict';
require('../../../../../env-setup');
var RetirementRulesEngine = require(global.VX_RETIREMENTRULES + '/rules-engine');

var _ = require('underscore');
var log = {
    debug: function() {},
    warn: function() {},
    trace: function() {},
    info: function() {}
};

var config = {
    recordRetirement: {
        rules: {
            outpatient: {}
        }
    }
};
var environment = {
    metrics: log
};

describe('outpatient-rule', function() {
    var currentDate = new Date();
    var dateOld = new Date(1970, 1, 1);
    it('Normal path: all patients are outpatient ', function() {
        var done = false;
        var patientIds = [{
            value: 'SITE;3',
            type: 'PID',
            'lastAccessed': currentDate
        }, {
            value: '10107V395912',
            type: 'icn',
            'lastAccessed': dateOld
        }, {
            value: '302394234V323425',
            type: 'ICN',
            'lastAccessed': dateOld
        }, {
            value: 'DOD;0000000003',
            type: 'PID',
            'lastAccessed': currentDate
        }, ];

        var engine = new RetirementRulesEngine(log, config, environment);
        runs(function() {
            engine.processRetirementRules(patientIds, function(err, result) {
                expect(result.length).toEqual(2);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });

    it('some are inpatient and some outpatient', function() {
        var done = false;
        config = {
            recordRetirement: {
                rules: {
                    'inpatient': {},
                    'outpatient': {}
                }
            }
        };
        var patientIds = [{
            value: 'SITE;3',
            type: 'PID',
            inpatient: true,
            'lastAccessed': currentDate,
            'dischargeDate': currentDate
        }, {
            value: '10107V395912',
            type: 'icn',
            inpatient: true,
            'lastAccessed': dateOld,
            'dischargeDate': currentDate
        }, {
            value: '302394234V323425',
            type: 'ICN',
            lastAccessed: dateOld
        }, {
            value: 'DOD;0000000003',
            type: 'PID',
            lastAccessed: currentDate
        }, ];

        var engine = new RetirementRulesEngine(log, config, environment);
        runs(function() {
            engine.processRetirementRules(patientIds, function(err, result) {
                expect(result.length).toEqual(1);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
});