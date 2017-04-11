/*global describe, it, beforeEach, afterEach, expect, runs, waitsFor */
/*jslint node: true */
'use strict';

var _ = require('underscore');

require('../../../env-setup');
var UnSyncRulesEngine = require(global.VX_UNSYNCRULES + '/rules-engine');
var wConfig = require(global.VX_ROOT + 'worker-config');

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

var thirtyDaysAgo = 30 * 24 * 60 * 60 * 1000;

var patientIds = [
    {value:'9E7A;3', type:'PID', 'inpatient':true, 'dischargeDate': 'Wed Sep 24 2014 14:58:49 GMT-0600 (MDT)'},
    {value:'10107V395912', type:'icn', 'inpatient':true, 'dischargeDate': 'Wed Sep 24 2014 14:58:49 GMT-0600 (MDT)'},
    {value:'302394234V323425', type:'ICN', 'inpatient':true, 'dischargeDate': 'Wed Sep 24 2014 14:58:49 GMT-0600 (MDT)'},
    {value:'DOD;0000000003',type:'PID', 'inpatient':true},
];

var inpatientsJob = {
    'type': 'inpatient',
    'patientIdentifier': patientIdentifiers[2],
    'rootJobId': '1',
    'jobId': '5'
};

var log = require(global.VX_DUMMIES + 'dummy-logger');
var config = {
    unsync: {
        vistaSites: {
            'AAAA': {},
            'BBBB': {}
        },
        jds: _.defaults(wConfig.jds, {
            protocol: 'http',
            host: 'IPADDRESS ',
            port: 9080
        }),
        rules: {
            'inpatient': {
                'default': 60000
            }
        }
    }
};
var environment = {
    'metrics': log
};

var engine = new UnSyncRulesEngine(log, config, environment);
var jpid;

describe('inpatient', function() {


    //it('lets all identifiers through when unsynced', function() {
    //    var finished = false;
    //    runs(function() {
    //        engine.processUnSyncRules(patientIds, function(error, ids) {
    //            expect(val(ids, 'length')).toBe(4);
    //            finished = true;
    //        });
    //    });
    //
    //    waitsFor(function() {
    //        return finished;
    //    });
    //});

});
