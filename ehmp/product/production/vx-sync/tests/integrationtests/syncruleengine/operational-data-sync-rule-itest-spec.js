'use strict';

var _ = require('underscore');

require('../../../env-setup');
var SyncRulesEngine = require(global.VX_SYNCRULES + '/rules-engine');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var realConfig = require(global.VX_ROOT + 'worker-config');
var wConfig = JSON.parse(JSON.stringify(realConfig)); // Make sure we have a clean copy of wConfig
var log = require(global.VX_DUMMIES + 'dummy-logger');
var async = require('async');
var pidUtils = require(global.VX_UTILS + 'patient-identifier-utils');
// log = require('bunyan').createLogger({
//     name: 'operational-sync-endpoint-handler-spec',
//     level: 'debug'
// });

function createTestOpdStamp(siteHash, pid, stampTime) {
    var opdStamp = {
        'stampTime': stampTime,
        'sourceMetaStamp': {}
    };

    var site = siteHash || pidUtils.extractSiteFromPid(pid);

    opdStamp.sourceMetaStamp[site] = {
        'stampTime': stampTime,
        'domainMetaStamp': {}
    };

    if (siteHash) {
        opdStamp.sourceMetaStamp[site].domainMetaStamp['doc-def'] = {
            'domain': 'doc-def',
            'stampTime': stampTime,
            'itemMetaStamp': {}
        };

        opdStamp.sourceMetaStamp[site].domainMetaStamp['doc-def'].itemMetaStamp['urn:va:doc-def:' + site + ':1001'] = {
            'stampTime': stampTime
        };
    }

    if (pid) {
        var dfn = pidUtils.extractDfnFromPid(pid);
        opdStamp.sourceMetaStamp[site].domainMetaStamp['pt-select'] = {
            'domain': 'pt-select',
            'stampTime': stampTime,
            'itemMetaStamp': {}
        };
        opdStamp.sourceMetaStamp[site].domainMetaStamp['pt-select'].itemMetaStamp['urn:va:pt-select:' + site + ':' + dfn + ':' + dfn] = {
            'stampTime': stampTime
        };
    }

    return opdStamp;
}

function createStorageMetaData(site, domain, uid, stampTime) {
    return {
        'source': site,
        'uid': uid,
        'domain': domain,
        'itemStamp': stampTime
    };
}

function createMockPatientIds(testSitePid1, testSitePid2) {
    return [{
        type: 'icn',
        value: '111111V22222'
    }, {
        type: 'pid',
        value: testSitePid1
    }, {
        type: 'pid',
        value: testSitePid2
    }, {
        type: 'pid',
        value: 'DOD;000000180'
    }, {
        type: 'pid',
        value: 'HDR;111111V22222'
    }, {
        type: 'pid',
        value: 'VLER;111111V22222'
    }];
}

var config = {
    vistaSites: {
        'AAAA': {},
        'BBBB': {},
        'CCCC': {},
        'DDDD': {},
        'EEEE': {},
        'FFFF': {},
        'ABBB': {},
        'BCCC': {},
        'CDDD': {},
        'DEEE': {}
    },
    jds: _.defaults(wConfig.jds, {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    }),
    rules: {
        'operational-data-sync': {}
    },
    'hdr': {
        'operationMode': 'REQ/RES'
    }
};

function clearOperationalDataSyncStatusForSites(sites, callback) {
    var jdsClient = new JdsClient(log, log, config);

    async.eachSeries(sites, function(site, asyncCallback) {
        jdsClient.deleteOperationalSyncStatus(site, function() {
            asyncCallback();
        });
    }, function() {
        callback();
    });
}

describe('operational-data-sync-rule integration test', function() {
    var mockPatientIds = [{
        type: 'icn',
        value: '111111V22222'
    }, {
        type: 'pid',
        value: 'AAAA;3'
    }, {
        type: 'pid',
        value: 'BBBB;3'
    }, {
        type: 'pid',
        value: 'DOD;000000180'
    }, {
        type: 'pid',
        value: 'HDR;111111V22222'
    }, {
        type: 'pid',
        value: 'VLER;111111V22222'
    }];

    it('Normal path: no primary sites associated with patient have completed OPD sync', function() {
        var done = false;
        var jdsClient = new JdsClient(log, log, config);
        var environment = {
            jds: jdsClient,
            metrics: log
        };
        var mockPatientIds = [{
            type: 'icn',
            value: '111111V22222'
        }, {
            type: 'pid',
            value: 'CDDD;3'
        }, {
            type: 'pid',
            value: 'DEEE;3'
        }, {
            type: 'pid',
            value: 'DOD;000000180'
        }, {
            type: 'pid',
            value: 'HDR;111111V22222'
        }, {
            type: 'pid',
            value: 'VLER;111111V22222'
        }];
        //No metastamp in JDS
        var engine = new SyncRulesEngine(log, config, environment);
        // engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                //console.log(result);
                expect(err).toEqual('NO_OPDATA');
                done = true;
            });
        });
        waitsFor(function() {
            return done;
        });
    });

    //AAAA, BBBB
    it('Normal path: some primary sites associated with patient have completed OPD sync', function() {
        var opdStampAAAA = createTestOpdStamp('AAAA', 'AAAA;3', 20141031094920);
        var opdStampBBBB = createTestOpdStamp(null, 'BBBB;3', 20141031094920);
        var storePtSelectMetadataBBBB = createStorageMetaData('BBBB', 'pt-select', 'urn:va:pt-select:BBBB:3:3', 20141031094920);

        var setUpDone, cleanUpDone;
        runs(function() {
            clearOperationalDataSyncStatusForSites(['AAAA', 'BBBB'], function() {
                setUpDone = true;
            });
        });
        waitsFor(function() {
            return setUpDone;
        });

        var done1, done2, done3, done4 = false;
        var jdsClient = new JdsClient(log, log, config);
        var environment = {
            jds: jdsClient,
            metrics: log
        };

        //Send operational metastamps to JDS
        runs(function() {
            environment.jds.saveOperationalSyncStatus(opdStampAAAA, 'AAAA', function() {
                done1 = true;
            });
            environment.jds.saveOperationalSyncStatus(opdStampBBBB, 'BBBB', function() {
                done2 = true;
            });
        });
        waitsFor(function() {
            return done1 && done2;
        });
        //Mark all items for BBBB as stored
        runs(function() {
            environment.jds._markOperationalItemAsStored(storePtSelectMetadataBBBB, function() {
                done3 = true;
            });
        });
        waitsFor(function() {
            return done3;
        });

        var engine = new SyncRulesEngine(log, config, environment);
        // engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                //console.log(result);
                expect(val(result, 'length')).toEqual(5);
                done4 = true;
            });
        });
        waitsFor(function() {
            return done4;
        });

        runs(function() {
            clearOperationalDataSyncStatusForSites(['AAAA', 'BBBB'], function() {
                cleanUpDone = true;
            });
        });
        waitsFor(function() {
            return cleanUpDone;
        });
    });

    //CCCC, DDDD
    it('Normal path: all primary sites associated with patient have completed OPD sync', function() {
        var setUpDone, cleanUpDone;
        runs(function() {
            clearOperationalDataSyncStatusForSites(['CCCC', 'DDDD'], function() {
                setUpDone = true;
            });
        });
        waitsFor(function() {
            return setUpDone;
        });

        var mockPatientIds = createMockPatientIds('CCCC;3', 'DDDD;3');
        var opdStampCCCC = createTestOpdStamp('CCCC', 'CCCC;3', 20141031094920);
        var opdStampDDDD = createTestOpdStamp(null, 'DDDD;3', 20141031094920);

        var storeDocDefMetadataCCCC = createStorageMetaData('CCCC', 'doc-def', 'urn:va:doc-def:CCCC:1001', 20141031094920);
        var storePtSelectMetadataCCCC = createStorageMetaData('CCCC', 'pt-select', 'urn:va:pt-select:CCCC:3:3', 20141031094920);
        var storePtSelectMetadataDDDD = createStorageMetaData('DDDD', 'pt-select', 'urn:va:pt-select:DDDD:3:3', 20141031094920);

        var done1, done2, done3, done4, done5, done6 = false;
        var jdsClient = new JdsClient(log, log, config);
        var environment = {
            jds: jdsClient,
            metrics: log
        };
        //Send operational metastamps to JDS
        runs(function() {
            environment.jds.saveOperationalSyncStatus(opdStampCCCC, 'CCCC', function() {
                done1 = true;
            });
            environment.jds.saveOperationalSyncStatus(opdStampDDDD, 'DDDD', function() {
                done2 = true;
            });
        });
        waitsFor(function() {
            return done1 && done2;
        });
        //Mark all items for AAAA and BBBB as stored
        runs(function() {
            environment.jds._markOperationalItemAsStored(storeDocDefMetadataCCCC, function(error, response) {
                done3 = true;
            });
            environment.jds._markOperationalItemAsStored(storePtSelectMetadataCCCC, function(error, response) {
                done4 = true;
            });
            environment.jds._markOperationalItemAsStored(storePtSelectMetadataDDDD, function(error, response) {
                done5 = true;
            });
        });
        waitsFor(function() {
            return done3 && done4 && done5;
        });

        var engine = new SyncRulesEngine(log, config, environment);
        // engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                // console.log('mockPatientIds: %j', mockPatientIds);
                // console.log('result        : %j', result);
                expect(val(result, 'length')).toEqual(6);
                done6 = true;
            });
        });
        waitsFor(function() {
            return done6;
        });

        runs(function() {
            clearOperationalDataSyncStatusForSites(['CCCC', 'DDDD'], function() {
                cleanUpDone = true;
            });
        });
        waitsFor(function() {
            return cleanUpDone;
        });
    });

    //EEEE, FFFF
    it('Normal path: primary site complete once, but pt-select for patient is not', function() {
        var setUpDone, cleanUpDone;
        runs(function() {
            clearOperationalDataSyncStatusForSites(['EEEE', 'FFFF'], function() {
                setUpDone = true;
            });
        });
        waitsFor(function() {
            return setUpDone;
        });

        var mockPatientIds = createMockPatientIds('EEEE;3', 'FFFF;3');
        var opdStampEEEE = createTestOpdStamp('EEEE', 'EEEE;3', 20141031094920);
        var opdStampFFFF = createTestOpdStamp(null, 'FFFF;3', 20141031094920);

        var storeDocDefMetadataEEEE = createStorageMetaData('EEEE', 'doc-def', 'urn:va:doc-def:EEEE:1001', 20141031094920);
        var storePtSelectMetadataEEEE = createStorageMetaData('EEEE', 'pt-select', 'urn:va:pt-select:EEEE:3:3', 20141031094920);
        var storePtSelectMetadataFFFF = createStorageMetaData('FFFF', 'pt-select', 'urn:va:pt-select:FFFF:3:3', 20141031094920);

        var opdStampEEEEnewStampTime = createTestOpdStamp(null, 'EEEE;3', 20151031094920);

        var done1, done2, done3, done4, done5, done6, done7 = false;
        var jdsClient = new JdsClient(log, log, config);
        var environment = {
            jds: jdsClient,
            metrics: log
        };

        //Send operational metastamps to JDS
        runs(function() {
            environment.jds.saveOperationalSyncStatus(opdStampEEEE, 'EEEE', function() {
                done1 = true;
            });
            environment.jds.saveOperationalSyncStatus(opdStampFFFF, 'FFFF', function() {
                done2 = true;
            });
        });
        waitsFor(function() {
            return done1 && done2;
        });

        //Mark all items for AAAA and BBBB as stored
        runs(function() {
            environment.jds._markOperationalItemAsStored(storeDocDefMetadataEEEE, function(error, response) {
                done3 = true;
            });
            environment.jds._markOperationalItemAsStored(storePtSelectMetadataEEEE, function(error, response) {
                done4 = true;
            });
            environment.jds._markOperationalItemAsStored(storePtSelectMetadataFFFF, function(error, response) {
                done5 = true;
            });
        });
        waitsFor(function() {
            return done3 && done4 && done5;
        });

        //Store new operational data metastamp to JDS to simulate pt-select update
        runs(function() {
            environment.jds.saveOperationalSyncStatus(opdStampEEEEnewStampTime, 'EEEE', function() {
                done6 = true;
            });
        });
        waitsFor(function() {
            return done6;
        });
        var engine = new SyncRulesEngine(log, config, environment);
        // engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                // console.log('mockPatientIds: %j', mockPatientIds);
                // console.log('result        : %j', result);
                expect(val(result, 'length')).toEqual(5);
                done7 = true;
            });
        });
        waitsFor(function() {
            return done7;
        });

        runs(function() {
            clearOperationalDataSyncStatusForSites(['EEEE', 'FFFF'], function() {
                cleanUpDone = true;
            });
        });
        waitsFor(function() {
            return cleanUpDone;
        });
    });

    //ABBB, BCCC
    it('Normal path: primary site complete once, but pt-select for different patient is not', function() {
        var setUpDone, cleanUpDone;
        runs(function() {
            clearOperationalDataSyncStatusForSites(['ABBB', 'BCCC'], function() {
                setUpDone = true;
            });
        });
        waitsFor(function() {
            return setUpDone;
        });

        var mockPatientIds = createMockPatientIds('ABBB;3', 'BCCC;3');

        var opdStampABBB = createTestOpdStamp('ABBB', 'ABBB;3', 20141031094920);
        var opdStampABBBnewPatient = createTestOpdStamp(null, 'ABBB;4', 20151031094920);
        var opdStampBCCC = createTestOpdStamp(null, 'BCCC;3', 20141031094920);

        var storeDocDefMetadataABBB = createStorageMetaData('ABBB', 'doc-def', 'urn:va:doc-def:ABBB:1001', 20141031094920);
        var storePtSelectMetadataABBB = createStorageMetaData('ABBB', 'pt-select', 'urn:va:pt-select:ABBB:3:3', 20141031094920);
        var storePtSelectMetadataBCCC = createStorageMetaData('BCCC', 'pt-select', 'urn:va:pt-select:BCCC:3:3', 20141031094920);

        var done1, done2, done3, done4, done5, done6 = false;
        var jdsClient = new JdsClient(log, log, config);
        var environment = {
            jds: jdsClient,
            metrics: log
        };

        //Send operational metastamps to JDS
        runs(function() {
            environment.jds.saveOperationalSyncStatus(opdStampABBB, 'ABBB', function() {
                done1 = true;
            });
            environment.jds.saveOperationalSyncStatus(opdStampBCCC, 'BCCC', function() {
                done2 = true;
            });
        });
        waitsFor(function() {
            return done1 && done2;
        });

        //Mark all items for AAAA and BBBB as stored
        runs(function() {
            environment.jds._markOperationalItemAsStored(storeDocDefMetadataABBB, function(error, response) {
                expect(error).toBeFalsy();
                done3 = true;
            });
            environment.jds._markOperationalItemAsStored(storePtSelectMetadataABBB, function(error, response) {
                expect(error).toBeFalsy();
                done4 = true;
            });
            environment.jds._markOperationalItemAsStored(storePtSelectMetadataBCCC, function(error, response) {
                expect(error).toBeFalsy();
                done5 = true;
            });
        });
        waitsFor(function() {
            return done3 && done4 && done5;
        });

        var storeNewABBBoperationalMetastampDone = false;

        runs(function() {
            //Store new operational data metastamp to JDS to simulate pt-select update
            //Must retrieve sync status now to signal syncCompleteAsOf Flag
            environment.jds.getOperationalSyncStatus('ABBB', function(error, response) {
                expect(error).toBeFalsy();
                environment.jds.saveOperationalSyncStatus(opdStampABBBnewPatient, 'ABBB', function(error, response) {
                    expect(error).toBeFalsy();
                    storeNewABBBoperationalMetastampDone = true;
                });
            });
        });
        waitsFor(function() {
            return storeNewABBBoperationalMetastampDone;
        });


        var engine = new SyncRulesEngine(log, config, environment);
        // engine.rules = [rule];
        runs(function() {
            engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
                expect(err).toBeFalsy();
                expect(val(result, 'length')).toEqual(6);
                done6 = true;
            });
        });
        waitsFor(function() {
            return done6;
        });

        runs(function() {
            clearOperationalDataSyncStatusForSites(['ABBB', 'BCCC'], function() {
                cleanUpDone = true;
            });
        });
        waitsFor(function() {
            return cleanUpDone;
        });
    });
});