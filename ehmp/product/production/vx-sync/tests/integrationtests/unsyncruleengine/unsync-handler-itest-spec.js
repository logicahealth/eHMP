'use strict';
/*global describe, it, before, beforeEach, after, afterEach, spyOn, expect, runs, waitsFor */

require('../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var UnSyncRulesEngine = require(global.VX_UNSYNCRULES + '/rules-engine');
var wConfig = require(global.VX_ROOT + 'worker-config');
var format = require('util').format;
var nullUtil = require(global.VX_UTILS + '/null-utils');
var request = require('request');

var config = {
    unsync: {
        rules: {
            'largePatientRecord': {
                'largePatientLastAccessed': 0,
                'patientDocumentSizeLimit': 0
            }
        },
        "vxsync": {
            "protocol": "http",
            "host": "IPADDRES",
            "port": "8080",
            "timeout": 300000
        }
    }
};
var environment = {
    metrics: log
};

var mockHandlerCallback = {
    callback: function(error, response) {
    }
};

describe('unsync handler integration test', function() {
    beforeEach(function() {
        //sync patient
        var done1 = false, done2 = false;
        runs(function() {
            var statusUrl = format('%s://%s:%s%s', config.unsync.vxsync.protocol, config.unsync.vxsync.host, config.unsync.vxsync.port, "/sync/doLoad?pid=9E7A;3");
            request.get(statusUrl, function(error, response) {
                if (error || (nullUtil.isNullish(response) === false && ( response.statusCode !== 200 && response.statusCode !== 202))) {
                    log.debug('error in sync: ');
                    return false;
                }
                done1 = true;
            });
        });

        //check status
        runs(function() {
            var syncUrl = format('%s://%s:%s%s', config.unsync.vxsync.protocol, config.unsync.vxsync.host, config.unsync.vxsync.port, "/status?pid=9E7A;3");
            request.get(syncUrl, function(error, response, body) {
                if (error || (nullUtil.isNullish(response) === false && ( response.statusCode !== 200 && response.statusCode !== 202))) {
                    return false;
                }
                if(JSON.parse(body).syncStatus.completedStamp !== undefined) {
                    done2 = true;
                }
                return done2;
            });
        });

        waitsFor(function() {
            console.log("done1 and done2 ", done1);
            console.log("done1 and done2 ", done2);
            return done1 && done2;;
        });
    });

    //it('unsync patient', function() {
    //    var done = false;
    //    var items = [{"jpid":"0ff3c0f2-51d8-4bfd-a93a-311b321346ab","lastAccessTime":20151029111706,"patientIdentifiers":["10108V420871","9E7A;3","C877;3","DOD;0000000003","HDR;10108V420871","VLER;10108V420871"]} ];
    //    var engine = new UnSyncRulesEngine(log, config, environment);
    //    runs(function() {
    //        engine.processUnSyncRules(items, function(err, result) {
    //            expect(result.length).toEqual(0);
    //            done = true;
    //        });
    //    });
    //    waitsFor(function() {
    //        return done;
    //    });
    //});

});
