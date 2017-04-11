/*global describe, it, expect, runs, waitsFor */
'use strict';
require('../../../env-setup');
var UnSyncRulesEngine =   require(global.VX_UNSYNCRULES + '/rules-engine');
var nock = require('nock');
var _ = require('underscore');
var moment = require('moment');

var log = require(global.VX_DUMMIES + 'dummy-logger');

var config = {
    unsync: {
        rules: {
            'largePatientRecord': {
                'patientTotalSizeLimit': 0,
                'avgSizePerEvent': 100
            }
        },
        "vxsync": {
            "protocol": "http",
            "host": "IPADDRES",
            "port": "8080",
            "timeout": 300000
        },
        'lastAccessed':10

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

var vprDateFormat = 'YYYYMMDDHHmmss';
describe('large-patient-record-rule', function(){

    beforeEach(function() {
        nock.cleanAll();
        nock.disableNetConnect();
        nock('http://IPADDRESS:POR')
            .get('/sync/status?pid=9E7A;10&docStatus=true')
            .reply(200, '{"jpid":"215c2ab2-cfe2-4702-9395-949e32f6d3e4","identifierDocSizes":{"totalSize":10,"9E7A;10":"NO_DOCUMENTS"},"syncStatus":{"completedStamp":{"sourceMetaStamp":{"9E7A":{"domainMetaStamp":{"allergy":{"domain":"allergy","eventCount":3}}}}}}}');
        nock('http://IPADDRESS:POR')
            .get('/sync/status?icn=10108V420871&docStatus=true')
            .reply(200, '{"jpid":"215c2ab2-cfe2-4702-9395-949e32f6d3e4","identifierDocSizes":{"totalSize":100,"9E7A;3":"NO_DOCUMENTS"},"syncStatus":{"completedStamp":{"sourceMetaStamp":{"9E7A":{"domainMetaStamp":{"allergy":{"domain":"allergy","eventCount":3}}}}}}}');

        nock('http://IPADDRESS:POR')
            .get('/sync/status?icn=10110V004877&docStatus=true')
            .reply(200, '{"jpid":"215c2ab2-cfe2-4702-9395-949e32f6d3e4","identifierDocSizes":{"totalSize":200,"9E7A:8":"NO_DOCUMENTS"},"syncStatus":{"completedStamp":{"sourceMetaStamp":{"9E7A":{"domainMetaStamp":{"allergy":{"domain":"allergy","eventCount":3}}}}}}}');

    });

    it('all large patients', function() {
        var done = false;
        var date = moment().subtract(20, 'days').format('YYYYMMDDHHmmss');
        var items = [{"jpid":"215c2ab2-cfe2-4702-9395-949e32f6d3e4","lastAccessTime":date,"patientIdentifiers":["9E7A;10"]},
            {"jpid":"516c44cc-a87a-4822-b2eb-979e8324505e","lastAccessTime":date,"patientIdentifiers":["10108V420871","9E7A;3","C877;3","DOD;0000000003","HDR;10108V420871","VLER;10108V420871"]},
            {"jpid":"5888e969-110c-4d97-8f56-10652ffee070","lastAccessTime":date,"patientIdentifiers":["10110V004877","9E7A;8","C877;8","DOD;0000000008","HDR;10110V004877","VLER;10110V004877"]} ];
        var engine = new UnSyncRulesEngine(log, config, environment);
        runs(function() {
            engine.processUnSyncRules(items, function(err, result) {
                expect(result.length).toEqual(3);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });

    it('mix of large and not large patients', function() {
        config = {
            unsync: {
                rules: {
                    'largePatientRecord': {
                        'largePatientLastAccessed': 10,
                        'patientTotalSizeLimit': 100,
                        'avgSizePerEvent': 0
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
        var done = false;
        var date = moment().subtract(20, 'days').format('YYYYMMDDHHmmss');
        var items = [{"jpid":"215c2ab2-cfe2-4702-9395-949e32f6d3e4","lastAccessTime":date,"patientIdentifiers":["9E7A;10"]},
            {"jpid":"516c44cc-a87a-4822-b2eb-979e8324505e","lastAccessTime":date,"patientIdentifiers":["10108V420871","9E7A;3","C877;3","DOD;0000000003","HDR;10108V420871","VLER;10108V420871"]},
            {"jpid":"5888e969-110c-4d97-8f56-10652ffee070","lastAccessTime":date,"patientIdentifiers":["10110V004877","9E7A;8","C877;8","DOD;0000000008","HDR;10110V004877","VLER;10110V004877"]} ];


        var engine = new UnSyncRulesEngine(log, config, environment);
        runs(function() {
            engine.processUnSyncRules(items, function(err, result) {
                expect(result.length).toEqual(1);
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });
});