/*global describe, it, expect, runs, waitsFor */
'use strict';
require('../../../env-setup');
var UnSyncRulesEngine =  require(global.VX_UNSYNCRULES + '/rules-engine');

var _ = require('underscore');
var log = {
    debug: function() {},
    warn: function(){},
    trace: function(){},
    info: function(){}
};

var config = {
    vistaSites: {
        '9E7A': {},
        'C877': {}
    },
    unsync: {
        jds: {
            protocol: 'http',
            host: 'IP        ',
            port: 9080
        },
        rules: {
            'patients-assigned-cds-panel': {}
        },
        'hdr': {
            'operationMode': 'REQ/RES'
        }
    }
};
var environment = {
    metrics: log
};

describe('patients-assigned-cds-panel-rule', function(){
    var oneDayAgo = new Date();
    var overAYearAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate()-1);
    overAYearAgo.setDate(overAYearAgo.getDate()-370);

    it('Normal path: all patients have expired and all patients exist in CDS panel', function() {
        var done = false;
        var patientIds = [
            {value:'9E7A;3', type:'PID', cdsPanel: true, lastAccessed: overAYearAgo},
            {value:'10107V395912', type:'icn'},
            {value:'302394234V323425', type:'ICN', cdsPanel: true, lastAccessed: overAYearAgo},
            {value:'DOD;0000000003',type:'PID', cdsPanel: true, lastAccessed: overAYearAgo}
        ];

        var engine = new UnSyncRulesEngine(log, config, environment);
        runs(function() {
            engine.processUnSyncRules(patientIds, function(err, result) {
                expect(result.length).toEqual(4);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });

    it('Normal path: one patient has expired and all patients exist in CDS panel', function() {
        var done = false;
        var patientIds = [
            {value:'9E7A;3', type:'PID', cdsPanel: true, lastAccessed: oneDayAgo},
            {value:'10107V395912', type:'icn'},
            {value:'302394234V323425', type:'ICN', cdsPanel: true, lastAccessed: overAYearAgo},
            {value:'DOD;0000000003',type:'PID', cdsPanel: true, lastAccessed: oneDayAgo}
        ];

        var engine = new UnSyncRulesEngine(log, config, environment);
        runs(function() {
            engine.processUnSyncRules(patientIds, function(err, result) {
                expect(result.length).toEqual(2);
                expect(result[0].value).toEqual('302394234V323425');
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });

    it('Normal path: one patient has expired and only that patient exists in CDS panel', function() {
        var done = false;
        var patientIds = [
            {value:'9E7A;3', type:'PID', cdsPanel: false, lastAccessed: oneDayAgo},
            {value:'10107V395912', type:'icn'},
            {value:'302394234V323425', type:'ICN', cdsPanel: false, lastAccessed: oneDayAgo},
            {value:'DOD;0000000003',type:'PID', cdsPanel: true, lastAccessed: overAYearAgo}
        ];

        var engine = new UnSyncRulesEngine(log, config, environment);
        runs(function() {
            engine.processUnSyncRules(patientIds, function(err, result) {
                expect(result.length).toEqual(4);
                expect(result[0].value).toEqual('DOD;0000000003');
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
});