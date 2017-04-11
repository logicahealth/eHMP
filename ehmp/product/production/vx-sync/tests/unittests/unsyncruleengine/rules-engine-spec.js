'use strict';
require('../../../env-setup');
var UnsyncRulesEngine =  require(global.VX_UNSYNCRULES + '/rules-engine');

var _ = require('underscore');
var log = {
    debug: function() {},
    warn: function(){},
    trace: function(){},
    info: function(){}
};
var config = {
    unsync: {
        rules: {
            'largePatientRecord': {
                'largePatientLastAccessed': 10,
                'patientDocumentSizeLimit': 0,
                'avgSizePerEvent': 100
            }
        },
        "vxsync": {
            "protocol": "http",
            "host": "IPADDRES",
            "port": "8080",
            "timeout": 300000
        }
    },
    "vistaSites": {
        "C877": {
            "name": "KODAK"
        },
        "9E7A": {
            "name": "PANORAMA"
        }
    }
};
var environment = {
    metrics: log
};
var inpatient = require(global.VX_UNSYNCRULES + '/inpatient-rule');

describe('rules-engine.js', function(){
    var engine = new UnsyncRulesEngine(log, config, environment);
    var patientIds = [{value:'9E7A;3', type:'PID'},{value:'302394234V323425', type:'ICN'},{value:'DOD;0000000003',type:'PID'}];
    it('inpatient', function(){
        engine.rules = [inpatient];
        engine.processUnSyncRules(patientIds, function(err, result) {
            expect(result).toBe(patientIds);
        });
    });
});