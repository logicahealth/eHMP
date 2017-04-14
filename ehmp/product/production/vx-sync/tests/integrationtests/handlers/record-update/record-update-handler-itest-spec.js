'use strict';

require('../../../../env-setup');

var handler = require(global.VX_HANDLERS + 'record-update/record-update-handler');
var log = require(global.VX_DUMMIES + '/dummy-logger');
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var jobUtil = require(global.VX_UTILS + 'job-utils');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'record-update-spec',
//     level: 'debug'
// });

var _ = require('underscore');

var vx_sync_ip = require(global.VX_INTTESTS + 'test-config');
var config = require(global.VX_ROOT + 'worker-config');
config.terminology.host = vx_sync_ip;
//Needed to test record-enrichment
var TerminologyUtil = require(global.VX_SUBSYSTEMS + 'terminology/terminology-utils');
var jdsCodedVaValue = {
    system: 'urn:oid:2.16.840.1.113883.6.86',
    code: 'C0220892',
    display: 'Penicillin'
};
//Needed to test store-record
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
//Needed to test solr-storage
var solrSmartClient = require('solr-smart-client');
var SolrClient = solrSmartClient.initClient(config.solrClient.core, config.solrClient.zooKeeperConnection, log);


var patientIdentifier = {
    'type': 'pid',
    'value': 'XABY;17'
};
var uid = 'urn:va:allergy:XABY:17:751';
var originalVaAllergyRecord = {
    'drugClasses': [{
        'code': 'AM114',
        'name': 'PENICILLINS AND BETA-LACTAM ANTIMICROBIALS'
    }],
    'entered': 200503172009,
    'facilityCode': 500,
    'facilityName': 'CAMP MASTER',
    'historical': true,
    'kind': 'Allergy / Adverse Reaction',
    'lastUpdateTime': 20050317200936,
    'localId': 751,
    'mechanism': 'PHARMACOLOGIC',
    'originatorName': 'VEHU,EIGHT',
    'products': [{
        'name': 'PENICILLIN',
        'vuid': 'urn:va:vuid:4019880'
    }],
    'reactions': [{
        'name': 'ITCHING,WATERING EYES',
        'vuid': 'urn:va:vuid:'
    }],
    'reference': '125;GMRD(120.82,',
    'stampTime': 20050317200936,
    'summary': 'PENICILLIN',
    'typeName': 'DRUG',
    'pid': patientIdentifier.value,
    'uid': uid,
    'verified': 20050317200936,
    'verifierName': '<auto-verified>'
};

var allergyMetaStamp = {
    'stampTime': '20160506143549',
    'sourceMetaStamp': {
        'XABY': {
            'pid': 'XABY;17',
            'localId': '17',
            'stampTime': '20160506143549',
            'domainMetaStamp': {
                'allergy': {
                    'domain': 'allergy',
                    'stampTime': '20160506143549',
                    'eventMetaStamp': {
                        'urn:va:allergy:XABY:17:751': {
                            'stampTime': 20050317200936
                        }
                    }
                }
            }
        }
    },
    'icn': null
};

function clearTestPatient(patientIdentifier, environment, callback) {
    var completed = false;
    var actualError;
    var actualResponse;

    runs(function() {
        environment.jds.deletePatientByPid(patientIdentifier.value, function(error, response) {
            actualError = error;
            actualResponse = response;
            completed = true;
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for jds.deletePatientByPid.', 20000);

    runs(function() {
        expect(actualError).toBeFalsy();
        expect(actualResponse).toBeTruthy();
        callback(null, 'success');
    });
}

function createPatientIdentifiers(patientIdentifier, environment, callback) {
    var jdsPatientIdentificationRequest = {
        patientIdentifiers: [patientIdentifier.value]
    };
    var completed3 = false;
    var actualError;
    var actualResponse;

    runs(function() {
        environment.jds.storePatientIdentifier(jdsPatientIdentificationRequest, function(error, response, result) {
            actualError = error;
            actualResponse = response;
            log.debug('createPatientIdentifiers: finished storing patient identifiers.  error: %s; response: %j; result: %j', error, response, result);
            completed3 = true;
        });
    });

    waitsFor(function() {
        return completed3;
    }, 'Timed out waiting for jds.storePatientIdentifier.', 20000);

    runs(function() {
        expect(actualError).toBeNull();
        expect(actualResponse).toBeTruthy();
        //expect(val(actualResponse, 'statusCode')).toEqual(200);
        callback(null, 'success');
    });

}

function clearPatientFromSolr(patientIdentifier, environment, callback) {
    var finished;
    runs(function() {
        environment.solr.deleteByQuery('pid:' + patientIdentifier.value, function() {
            environment.solr.commit(function() {
                finished = true;
            });
        });
    });

    waitsFor(function() {
        return finished;
    }, 'the test patient to be cleared from SOLR', 20000);

    runs(function() {
        callback();
    });
}

/*
 Test disabled because the record-update-handler is not run as part of the
 main VX-Sync processes. It is run on-demand, controlled by a separate bluepill.
 To enable this test, remove the 'x' from the 'xdescribe' below.
*/
xdescribe('record-update-handler', function() {
    beforeEach(function() {
        var done1, done2;

        var jdsClient = new JdsClient(log, log, config);

        var environment = {
            jds: jdsClient,
            metrics: log
        };

        runs(function() {
            clearTestPatient(patientIdentifier, environment, function() {
                done1 = true;
            });
        });

        waitsFor(function() {
            return done1;
        });

        runs(function() {
            createPatientIdentifiers(patientIdentifier, environment, function() {
                done2 = true;
            });
        });

        waitsFor(function() {
            return done2;
        });
    });

    it('Normal path: Verify record was enriched and sent to JDS and SOLR', function() {
        var done1, done2, done3, done4;

        var jdsClient = new JdsClient(log, log, config);
        var solrClient = SolrClient;
        var terminologyUtil = new TerminologyUtil(log, log, config);

        var environment = {
            terminologyUtils: terminologyUtil,
            jds: jdsClient,
            solr: solrClient,
            metrics: log
        };

        var job = jobUtil.createRecordUpdate(patientIdentifier, 'allergy', originalVaAllergyRecord, '123');
        job.metaStamp = allergyMetaStamp;

        runs(function() {
            handler(log, config, environment, job, function(error, result) {
                //Make sure handler ran correctly
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                done1 = true;
            });
        });

        waitsFor(function() {
            return done1;
        }, 'the record-update-handler to complete running');

        runs(function() {
            environment.jds.getPatientDataByUid(uid, function(error, response, result) {
                //Make sure the record was stored in JDS
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(result).toBeTruthy();

                // Verify that record enrichment inserted the terminology code.
                //-----------------------------------
                var record = val(result, ['data', 'items', 0]);
                expect(record).toBeTruthy();
                expect(_.isArray(val(record, 'codes'))).toBe(true);
                expect(val(record, 'codes', 'length')).toBeGreaterThan(0);
                if (val(record, 'codes')) {
                    expect(val(record, 'codes')).toContain(jasmine.objectContaining(jdsCodedVaValue));
                }

                done2 = true;
            });
        });

        waitsFor(function() {
            return done2;
        }, 'retrieving the dummy record from JDS');

        runs(function(){
            environment.jds.getSyncStatus(patientIdentifier, function(error, response, result){
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(val(response, 'statusCode')).toEqual(200);
                expect(result.toBeTruthy);
                expect(val(result, 'completedStamp')).toBeTruthy();

                done4 = true;
            });
        });

        waitsFor(function(){
            return done4;
        }, 'retrieving the metaStamp from JDS');

        runs(function() {
            environment.solr.commit(function() {
                environment.solr.search('q=(pid:' + patientIdentifier.value + ')', function(error, response) {
                    //Make sure the record was stored in SOLR
                    expect(response.response.numFound).toEqual(1);
                    environment = true;
                    done3 = true;
                });
            });
        }, 'retrieving the dummy record from SOLR', 20000);

        waitsFor(function() {
            return done3;
        });
    });

    afterEach(function() {
        var jdsClient = new JdsClient(log, log, config);
        var solrClient = SolrClient;

        var environment = {
            jds: jdsClient,
            solr: solrClient,
            metrics: log
        };

        var done = 0;

        runs(function() {
            clearTestPatient(patientIdentifier, environment, function() {
                done++;
            });
            clearPatientFromSolr(patientIdentifier, environment, function() {
                done++;
            });
        });

        waitsFor(function() {
            return done === 2;
        });
    });
});