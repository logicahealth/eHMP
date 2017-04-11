'use strict';

require('../../../../env-setup');

var handle = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler');
var wConfig = require(global.VX_ROOT + 'worker-config');

var solrSmartClient = require('solr-smart-client');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var metastampUtil = require(global.VX_UTILS + 'metastamp-utils');
var pidUtil = require(global.VX_UTILS + 'patient-identifier-utils');


var log = require(global.VX_DUMMIES + 'dummy-logger');
// log = require('bunyan').createLogger({
//     name: 'solr-record-storage-request-handler-itest-spec',
//     level: 'debug'
// });

//---------------------------------------------------------------------------------------------------------------
// This method deletes the patient identifier association in jDS.
//
// pid: The pid to be deleted.
// environment: The environment containing the handles needed by this routine.
// callback:  The callback handler to call when this is done.
//---------------------------------------------------------------------------------------------------------------
function deletePatientFromJds(pid, environment, callback) {
    var deleteFinished;
    runs(function() {
        environment.jds.deletePatientByPid(pid, function(error, response) {
            expect(error).toBeNull();
            expect(val(response, 'statusCode')).toBe(200);
            deleteFinished = true;
            callback();
        });
    });
    waitsFor(function() {
        return deleteFinished;
    });
}

//---------------------------------------------------------------------------------------------------------------
// This method resets the patient identifiers that are going to be used for the test.
//
// pid: The pid to be deleted.
// environment: The environment containing the handles needed by this routine.
// callback: The callback handler to call when this is done.
//---------------------------------------------------------------------------------------------------------------
function resetPatientIdentifiers(pid, environment, callback) {
    var storeFinished;
    runs(function() {
        environment.jds.storePatientIdentifier({
            'patientIdentifiers': [pid]
        }, function(error, response) {
            expect(error).toBeNull();
            expect(val(response, 'statusCode')).toBe(201);
            storeFinished = true;
            callback();
        });
    });

    waitsFor(function() {
        return storeFinished;
    });
}

//-----------------------------------------------------------------------------------------------
// Create an instance of the environment variable to be used in the test.
//
// config: The config settings to be used.
// returns: The environment variable.
//-----------------------------------------------------------------------------------------------
function createEnvironment(config) {
    var solrTestClient = solrSmartClient.initClient(config.solrClient.core, config.solrClient.zooKeeperConnection, log);
    var jdsClient = new JdsClient(log, log, config);

    var environment = {
        metrics: log,
        solr: solrTestClient,
        jds: jdsClient
    };

    spyOn(environment.jds, 'setEventStoreStatus').andCallThrough();
    spyOn(environment.solr, 'add').andCallThrough();

    return environment;
}

//-----------------------------------------------------------------------------------------------
// Create an allergy event with the given pid and uid.
//
// pid: The pid of the patient.
// uid: The UID of the allergy event.
// returns: The allergy event.
//-----------------------------------------------------------------------------------------------
function createAllergyEvent(pid, uid) {
    var allergyEvent = {
        'codes': [{
            'code': 'C0008299',
            'display': 'Chocolate',
            'system': 'urn:oid:2.16.840.1.113883.6.86'
        }],
        'entered': '20071217151300',
        'facilityCode': '500',
        'facilityName': 'CAMP MASTER',
        'historical': true,
        'kind': 'Allergy/Adverse Reaction',
        'lastUpdateTime': '20071217151354',
        'localId': '874',
        'mechanism': 'ALLERGY',
        'originatorName': 'PROVIDER,ONE',
        'pid': pid,
        'products': [{
            'name': 'CHOCOLATE',
            'summary': 'AllergyProduct{uid=\'\'}',
            'vuid': 'urn:va:vuid:4636681'
        }],
        'reactions': [{
            'name': 'DIARRHEA',
            'summary': 'AllergyReaction{uid=\'\'}',
            'vuid': 'urn:va:vuid:4637011'
        }],
        'reference': '3;GMRD(120.82,',
        'stampTime': '20071217151354',
        'summary': 'CHOCOLATE',
        'typeName': 'DRUG, FOOD',
        'uid': uid,
        'verified': '20071217151354',
        'verifierName': '<auto-verified>'
    };

    return allergyEvent;
}

//-----------------------------------------------------------------------------------------------
// Create an ptf event with the given pid and uid.
//
// pid: The pid of the patient.
// uid: The UID of the ptf event.
// returns: The allergy event.
//-----------------------------------------------------------------------------------------------
function createPtfEvent(pid, uid) {
    var ptfEvent = {
        'admissionUid': 'urn:va:visit:9E7A:8:H493',
        'arrivalDateTime': '19910904094159',
        'dischargeDateTime': '19920128160000',
        'drg': '999',
        'facilityCode': '515.6',
        'facilityName': 'TROY',
        'icdCode': 'urn:icd:305.02',
        'icdName': 'ALCOHOL ABUSE-EPISODIC',
        'lastUpdateTime': '19920128160000',
        'localId': '130;70;DXLS',
        'pid': pid,
        'principalDx': 'true',
        'stampTime': '19920128160000',
        'uid': uid
    };

    return ptfEvent;
}

//-------------------------------------------------------------------------------------------
// Create the SOLR handler job containing the allergy record.
//
// pid: The pid for this patient.
// dataDomain: The data domain of this record.
// jpid: The jpid to put in the job.
// record: The event to put in the job.
// returns: The job containing the given record.
//-------------------------------------------------------------------------------------------
function createSolrJob(pid, dataDomain, jpid, record) {
    var job = {
        'type': 'solr-record-storage',
        'patientIdentifier': {
            'type': 'pid',
            'value': pid
        },
        'jpid': jpid,
        'rootJobId': '1',
        'dataDomain': dataDomain,
        'record': record,
        'jobId': '30'
    };
    return job;
}


describe('solr-record-storage-handler.js', function() {

    function tearDownSolrAfterTest(patientIdentifier, environment, callback) {
        var finished = false;
        runs(function() {
            environment.solr.deleteByQuery('pid:' + patientIdentifier.value, function() {
                environment.solr.commit(function() {
                    finished = true;
                    return callback();
                });
            });
        });
        waitsFor(function() {
            return finished;
        }, 'tearDownAfterTest to complete', 60000);
    }

    describe('handle()', function() {

        it('Full test to be sure that SOLR record is written and SOLR status tracking is correctly done.', function() {
            var environment = createEnvironment(wConfig);

            var pid = '9E7A;123456789';
            var uid = 'urn:va:allergy:9E7A:123456789:874';
            var patientIdentifier = pidUtil.create('pid', pid);
            var jpid = '8107cc41-69eb-4060-8813-a82db245a11a'; // Note that we really do not care what this is for this test...

            // Get our patient set up for the test.
            //-------------------------------------
            var resetFinished;
            runs(function() {
                resetPatientIdentifiers(pid, environment, function(error) {
                    expect(error).toBeFalsy();
                    resetFinished = true;
                });
            });

            waitsFor(function() {
                return resetFinished;
            }, 'resetPatientIdentifiers to complete.', 60000);

            // Store the meta-stamp for this test
            //-----------------------------------
            var allergyRecord = createAllergyEvent(pid, uid);
            var metastamp = metastampUtil.metastampDomain({
                'data': {
                    'items': [allergyRecord]
                }
            }, null, null);
            var storeMetastampFinished;
            runs(function() {
                environment.jds.saveSyncStatus(metastamp, patientIdentifier, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(val(response, 'statusCode')).toBe(200);
                    storeMetastampFinished = true;
                });

            });

            waitsFor(function() {
                return storeMetastampFinished;
            }, 'metastamp storage.', 60000);

            // Now call the solr storage handler.
            //------------------------------------
            var allergyJob = createSolrJob(pid, 'allergy', jpid, allergyRecord);
            var solrStoreFinished;
            runs(function() {
                handle(log, wConfig, environment, allergyJob, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response).toBe('success');
                    expect(environment.solr.add).toHaveBeenCalled();
                    expect(environment.jds.setEventStoreStatus).toHaveBeenCalled();
                    solrStoreFinished = true;
                });
            });

            waitsFor(function() {
                return solrStoreFinished;
            }, 'metastamp storage.', 60000);

            // Now retrieve the Sync Status and make sure that the SOLR status has been tracked correctly.
            //--------------------------------------------------------------------------------------------
            var retrieveStatusFinished;
            runs(function() {
                var jdsFilter = {
                    filter: '?detailed=true'
                };
                environment.jds.getSyncStatus(patientIdentifier, jdsFilter, function(error, response, results) {
                    expect(error).toBeNull();
                    expect(val(response, 'statusCode')).toBe(200);

                    expect(results).not.toBeUndefined();

                    var eventMetaStamp = val(results, 'inProgress', 'sourceMetaStamp', '9E7A', 'domainMetaStamp', 'allergy', 'eventMetaStamp');
                    expect(eventMetaStamp).toBeTruthy();
                    expect(eventMetaStamp[uid].solrStored).toBe(true);

                    retrieveStatusFinished = true;
                });

            });

            waitsFor(function() {
                return retrieveStatusFinished;
            }, 'retrieve sync status.', 60000);

            // Clean up what we have created from JDS...
            //-------------------------------------------
            var clearPatientFinished;
            runs(function() {
                runs(function() {
                    deletePatientFromJds(pid, environment, function() {
                        clearPatientFinished = true;

                    });
                });
            });

            waitsFor(function() {
                return clearPatientFinished;
            }, 'delete patient from jds.', 60000);

            // Clean up what we have created from Solr
            //----------------------------------------
            var tearDownSolrFinished;
            runs(function() {
                tearDownSolrAfterTest(patientIdentifier, environment, function() {
                    tearDownSolrFinished = true;
                });
            });

            waitsFor(function() {
                return tearDownSolrFinished;
            }, 'tear down of what we did in SOLR.', 60000);

        });

        it('Test that ptf event stores to SOLR.', function() {
            var environment = createEnvironment(wConfig);

            var pid = '9E7A;111222333';
            var uid = 'urn:va:ptf:9E7A:111222333:874';
            var patientIdentifier = pidUtil.create('pid', pid);
            var jpid = '8107cc41-69eb-4060-8813-a82db245a11a'; // Note that we really do not care what this is for this test...

            // Get our patient set up for the test.
            //-------------------------------------
            var resetFinished;
            runs(function() {
                resetPatientIdentifiers(pid, environment, function(error) {
                    expect(error).toBeFalsy();
                    resetFinished = true;
                });
            });

            waitsFor(function() {
                return resetFinished;
            }, 'resetPatientIdentifiers to complete.', 60000);

            // Store the meta-stamp for this test
            //-----------------------------------
            var ptfRecord = createPtfEvent(pid, uid);
            var metastamp = metastampUtil.metastampDomain({
                'data': {
                    'items': [ptfRecord]
                }
            }, null, null);
            var storeMetastampFinished;
            runs(function() {
                environment.jds.saveSyncStatus(metastamp, patientIdentifier, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(val(response, 'statusCode')).toBe(200);
                    storeMetastampFinished = true;
                });

            });

            waitsFor(function() {
                return storeMetastampFinished;
            }, 'metastamp storage.', 60000);

            // Now call the solr storage handler.
            //------------------------------------
            var ptfJob = createSolrJob(pid, 'ptf', jpid, ptfRecord);
            var solrStoreFinished;
            runs(function() {
                handle(log, wConfig, environment, ptfJob, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response).toBe('success');
                    expect(environment.solr.add).toHaveBeenCalled();
                    expect(environment.jds.setEventStoreStatus).toHaveBeenCalled();
                    solrStoreFinished = true;
                });
            });

            waitsFor(function() {
                return solrStoreFinished;
            }, 'metastamp storage.', 60000);


            // Now retrieve the Sync Status and make sure that the SOLR status has been tracked correctly.
            //--------------------------------------------------------------------------------------------
            var retrieveStatusFinished;
            runs(function() {
                var jdsFilter = {
                    filter: '?detailed=true'
                };
                environment.jds.getSyncStatus(patientIdentifier, jdsFilter, function(error, response, results) {
                    expect(error).toBeNull();
                    expect(val(response, 'statusCode')).toBe(200);

                    expect(results).not.toBeUndefined();

                    var eventMetaStamp = val(results, 'inProgress', 'sourceMetaStamp', '9E7A', 'domainMetaStamp', 'ptf', 'eventMetaStamp');
                    expect(eventMetaStamp).toBeTruthy();
                    expect(eventMetaStamp[uid].solrStored).toBe(true);

                    retrieveStatusFinished = true;
                });

            });

            waitsFor(function() {
                return retrieveStatusFinished;
            }, 'retrieve sync status.', 60000);

            // Verify that SOLR has the record stored...
            //-------------------------------------------
            var solrVerifiedFinished;
            runs(function() {
                environment.solr.commit(function() {
                    var hash = patientIdentifier.value.split(';').join('%3B');
                    environment.solr.search('q=(pid%3A' + hash + ')', function(error, response) {
                        expect(response.response.numFound).toEqual(1);
                        solrVerifiedFinished = true;
                    });
                });
            });

            waitsFor(function() {
                return solrVerifiedFinished;
            }, 'retrieve sync status.', 60000);

            // Clean up what we have created from JDS...
            //-------------------------------------------
            var clearPatientFinished;
            runs(function() {
                runs(function() {
                    deletePatientFromJds(pid, environment, function() {
                        clearPatientFinished = true;

                    });
                });
            });

            waitsFor(function() {
                return clearPatientFinished;
            }, 'delete patient from jds.', 60000);

            // Clean up what we have created from Solr
            //----------------------------------------
            var tearDownSolrFinished;
            runs(function() {
                tearDownSolrAfterTest(patientIdentifier, environment, function() {
                    tearDownSolrFinished = true;
                });
            });

            waitsFor(function() {
                return tearDownSolrFinished;
            }, 'tear down of what we did in SOLR.', 60000);

        });

        it('handles a solr-record-storage job', function() {

            var environment = createEnvironment(wConfig);

            var recordUid = 'urn:va:allergy:9E7A:123456:0654321';
            var allergyRecord = {
                entered: '200712171513',
                facilityCode: '500',
                facilityName: 'CAMP MASTER',
                historical: true,
                kind: 'Allergy/Adverse Reaction',
                lastUpdateTime: 20150119135618,
                localId: '874',
                mechanism: 'ALLERGY',
                originatorName: 'PROVIDER,ONE',
                products: ['CHOCOLATE'],
                reactions: ['DIARRHEA'],
                reference: '3;GMRD(120.82,',
                stampTime: 20150119135618,
                summary: 'CHOCOLATE',
                typeName: 'DRUG, FOOD',
                uid: recordUid,
                verified: '20071217151354',
                verifierName: '<auto-verified>',
                pid: '9E7A;123456',
                codesCode: ['C0008299'],
                codesSystem: ['urn:oid:2.16.840.1.113883.6.86'],
                codesDisplay: ['Chocolate'],
                drugClasses: [],
                comments: []
            };

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;123456'
            };

            var storageJob = {
                'patientIdentifier': patientIdentifier,
                'record': allergyRecord,
                'dataDomain': 'allergy',
                'jpid': '21EC2020-3AEA-4069-A2DD-08002B30309D',
                'type': 'solr-record-storage'
            };

            var finished = false;
            runs(function() {
                handle(log, { 'vista': { 'domainsNoSolrTracking': [] } }, environment, storageJob, function(error) {
                    expect(error).toBeNull();
                    environment.solr.commit(function() {
                        var hash = patientIdentifier.value.split(';').join('%3B');
                        environment.solr.search('q=(pid%3A' + hash + ')', function(error, response) {
                            expect(response.response.numFound).toEqual(1);
                            finished = true;
                        });
                    });
                }, function() {});
            });

            waitsFor(function() {
                return finished;
            }, 'the job to complete and be verified', 60000);

            // Clean up what we have created from Solr
            //----------------------------------------
            var tearDownSolrFinished;
            runs(function() {
                tearDownSolrAfterTest(patientIdentifier, environment, function() {
                    tearDownSolrFinished = true;
                });
            });

            waitsFor(function() {
                return tearDownSolrFinished;
            }, 'tear down of what we did in SOLR.', 60000);
        });

        it('handles an unsolicited update marking a record as deleted', function() {

            var environment = createEnvironment(wConfig);

            var recordUid = 'urn:va:allergy:WXYZ:123456:0654321';
            var allergyRecord = {
                entered: '200712171513',
                facilityCode: '500',
                facilityName: 'CAMP MASTER',
                historical: true,
                kind: 'Allergy/Adverse Reaction',
                lastUpdateTime: 20150119135618,
                localId: '874',
                mechanism: 'ALLERGY',
                originatorName: 'PROVIDER,ONE',
                products: ['CHOCOLATE'],
                reactions: ['DIARRHEA'],
                reference: '3;GMRD(120.82,',
                stampTime: 20150119135618,
                summary: 'CHOCOLATE',
                typeName: 'DRUG, FOOD',
                uid: recordUid,
                verified: '20071217151354',
                verifierName: '<auto-verified>',
                pid: 'WXYZ;123456',
                codesCode: ['C0008299'],
                codesSystem: ['urn:oid:2.16.840.1.113883.6.86'],
                codesDisplay: ['Chocolate'],
                drugClasses: [],
                comments: []
            };

            var patientIdentifier = {
                'type': 'pid',
                'value': 'WXYZ;123456'
            };

            var storageJob = {
                'patientIdentifier': patientIdentifier,
                'record': allergyRecord,
                'jpid': '21EC2020-3AEA-4069-A2DD-08002B30309D',
                'type': 'solr-record-storage'
            };

            // setupForTest(patientIdentifier);

            //store new allergy record
            var finished = false;
            runs(function() {
                handle(log, { 'vista': { 'domainsNoSolrTracking': [] } }, environment, storageJob, function(error) {
                    expect(error).toBeNull();
                    environment.solr.commit(function() {
                        finished = true;
                    });
                }, function() {});
            });

            waitsFor(function() {
                return finished;
            }, 'the initial storage job to complete', 60000);
            var deletedAllergyRecord = {
                'uid': recordUid,
                'stampTime': 20150421126625,
                'pid': patientIdentifier.value,
                'removed': true
            };
            var storageJob2 = {
                'patientIdentifier': patientIdentifier,
                'record': deletedAllergyRecord,
                'jpid': '21EC2020-BEEF-BEEF-BEEF-08002B30309D',
                'type': 'solr-record-storage'
            };

            //Update the record with the deleted record
            var finished5 = false;
            runs(function() {
                handle(log, { 'vista': { 'domainsNoSolrTracking': [] } }, environment, storageJob2, function(error) {
                    expect(error).toBeNull();
                    environment.solr.commit(function() {
                        finished5 = true;
                    });
                }, function() {});
            });

            waitsFor(function() {
                return finished5;
            }, 'the deletion storage job to complete', 60000);

            var finished7 = false;
            //Verify old record was updated with deleted record
            runs(function() {
                environment.solr.search('q=(uid%3A*0654321)', function(error, response) {
                    expect(val(response, ['response', 'numFound'])).toEqual(1);
                    expect(val(response, ['response', 'docs', '0', 'removed'])).toBe(true);
                    finished7 = true;
                });
            });
            waitsFor(function() {
                return finished7;
            }, 'the verification check for the removed flag', 60000);

            // Clean up what we have created from Solr
            //----------------------------------------
            var tearDownSolrFinished;
            runs(function() {
                tearDownSolrAfterTest(patientIdentifier, environment, function() {
                    tearDownSolrFinished = true;
                });
            });

            waitsFor(function() {
                return tearDownSolrFinished;
            }, 'tear down of what we did in SOLR.', 60000);

        });
    });
});