'use strict';

require('../../../../env-setup');

var handle = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler');
var wConfig = require(global.VX_ROOT + 'worker-config');

var solrSmartClient = require('solr-smart-client');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var log = require(global.VX_DUMMIES + 'dummy-logger');
// log = require('bunyan').createLogger({
//     name: 'store-record-request-handler',
//     level: 'debug'
// });

var solrTestClient = solrSmartClient.initClient(wConfig.solrClient.core, wConfig.solrClient.zooKeeperConnection, log);

describe('solr-record-storage-handler.js', function() {

    var testEnvironment = {
        metrics: log,
        solr: solrTestClient
    };

    function tearDownAfterTest(patientIdentifier) {
        var finished = false;
        runs(function() {
            testEnvironment.solr.deleteByQuery('pid:'+patientIdentifier.value, function() {
                testEnvironment.solr.commit(function() {
                    finished = true;
                });
            });
        });
        waitsFor(function() {
            return finished;
        }, 'tearDownAfterTest to complete', 60000);
    }

    describe('handle()', function() {

        it('handles a solr-record-storage job', function() {

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
                handle(log, {}, testEnvironment, storageJob, function(error) {
                    expect(error).toBeNull();
                    testEnvironment.solr.commit(function() {
                        var hash = patientIdentifier.value.split(';').join('%3B');
                        testEnvironment.solr.search('q=(pid%3A'+hash+')', function(error, response) {
                            expect(response.response.numFound).toEqual(1);
                            finished = true;
                        });
                    });
                }, function() {});
            });

            waitsFor(function() {
                return finished;
            }, 'the job to complete and be verified', 60000);

            tearDownAfterTest(patientIdentifier);
        });

        it('handles an unsolicited update marking a record as deleted', function() {

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
            var environment = {
                metrics: log,
                solr: solrTestClient
            };

            //store new allergy record
            var finished = false;
            runs(function() {
                handle(log, {}, testEnvironment, storageJob, function(error) {
                    expect(error).toBeNull();
                    testEnvironment.solr.commit(function() {
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
                handle(log, {}, environment, storageJob2, function(error) {
                    expect(error).toBeNull();
                    testEnvironment.solr.commit(function() {
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
                solrTestClient.search('q=(uid%3A*0654321)', function(error, response) {
                    expect(val(response, ['response','numFound'])).toEqual(1);
                    expect(val(response, ['response', 'docs', '0', 'removed'])).toBe(true);
                    finished7 = true;
                });
            });
            waitsFor(function() {
                return finished7;
            }, 'the verification check for the removed flag', 60000);

            tearDownAfterTest(patientIdentifier);
        });
    });
});