'use strict';

require('../../../env-setup');

var HDRClient = require(global.VX_SUBSYSTEMS + 'hdr/hdr-client');
var config = require(global.VX_ROOT + 'worker-config');
var _ = require('underscore');
var logger = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// logger = require('bunyan').createLogger({
//     name: 'jmeadows-xform-domain-vpr-handler-spec',
//     level: 'debug'
// });

var testSampleData = {
    siteId: '76C6', /* This site is currently not being used by VxSync Poller.*/
    rootJobId: 22394,
    jobPriority: 5,
    jobId: [
        {domain: 'allergy', jobId:'123'},
        {domain: 'auxilary', jobId:'345'},
        {domain: 'appointment', jobId:'456'},
    ],
    patientIdentifier: {
        value: '2939;5',
        type: 'pid'
    },
    stationNumber: 547
};

var invalidSiteId = 'DSSS-----';
var invalidPatientId = '76C6:5';

// test suite disabled. enable if hdr pub/sub functionality is required
xdescribe('hdr-client.js', function() {
    config.hdr.hdrSites[testSampleData.siteId] = {stationNumber: testSampleData.stationNumber};
    var hdrClient = new HDRClient(logger, logger, config);
    beforeEach(function(){
        config.hdr.hdrSites[testSampleData.siteId] = {stationNumber: testSampleData.stationNumber};
    });
    afterEach(function() {
        delete config.hdr.hdrSites[testSampleData.siteId];
    });
    describe('HDR Subscribe', function (){
        it('HDR Subscribe: Happy Path', function() {
            var finished = false;
            runs(function() {
                hdrClient.subscribe(testSampleData.siteId, testSampleData.patientIdentifier,
                testSampleData.rootJobId, testSampleData.jobId, testSampleData.jobPriority, function(err, result) {
                    expect(err).toBeFalsy();
                    expect(result).toBeTruthy();
                    expect(result).toEqual('success');
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
        it('HDR Subscribe: Happy Path - resubscribe with patientIdentifier\'value', function() {
            var finished = false;
            runs(function() {
                hdrClient.subscribe(testSampleData.siteId, testSampleData.patientIdentifier.value,
                testSampleData.rootJobId, testSampleData.jobId, testSampleData.jobPriority, function(err, result) {
                    expect(err).toBeFalsy();
                    expect(result).toBeTruthy();
                    expect(result).toEqual('success');
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
        it('HDR Subscribe: Invalid Site Id', function() {
            var finished = false;
            runs(function() {
                hdrClient.subscribe(invalidSiteId, testSampleData.patientIdentifier,
                testSampleData.rootJobId, testSampleData.jobId, testSampleData.jobPriority, function(err, result) {
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
        it('HDR Subscribe: Invalid Site Id: change config', function() {
            var finished = false;
            runs(function() {
                config.hdr.hdrSites[invalidSiteId] = {stationNumber: '999999'};
                hdrClient.subscribe(invalidSiteId, testSampleData.patientIdentifier,
                testSampleData.rootJobId, testSampleData.jobId, testSampleData.jobPriority, function(err, result) {
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();
                    delete config.hdr.hdrSites[invalidSiteId];
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
        it('HDR Subscribe: PatientIdentifier is Null', function() {
            var finished = false;
            runs(function() {
                hdrClient.subscribe(testSampleData.siteId, null,
                testSampleData.rootJobId, testSampleData.jobId, testSampleData.jobPriority, function(err, result) {
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
        it('HDR Subscribe: Invalid PatientIdentifier', function() {
            var finished = false;
            runs(function() {
                hdrClient.subscribe(testSampleData.siteId, invalidPatientId,
                testSampleData.rootJobId, testSampleData.jobId, testSampleData.jobPriority, function(err, result) {
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
        it('HDR Subscribe: No rootJobId', function() {
            var finished = false;
            runs(function() {
                hdrClient.subscribe(testSampleData.siteId, testSampleData.patientIdentifier,
                null, testSampleData.jobId, testSampleData.jobPriority, function(err, result) {
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
        it('HDR Subscribe: No jobId', function() {
            var finished = false;
            runs(function() {
                hdrClient.subscribe(testSampleData.siteId, testSampleData.patientIdentifier,
                testSampleData.rootJobId, null, testSampleData.jobPriority, function(err, result) {
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
    });

    describe('HDR fetchNextBatch', function (){
        it('HDR fetchNextBatch Happy Path', function() {
            var finished = false;
            runs(function() {
                hdrClient.fetchNextBatch(testSampleData.siteId, '3150120-500', 500,
                function(err, wrappedResponse) {
                    expect(err).toBeFalsy();
                    expect(wrappedResponse).toBeTruthy();
                    expect(wrappedResponse.rawResponse).toBeFalsy();
                    expect(wrappedResponse.hmpBatchSize).toBeTruthy();
                    expect(wrappedResponse.data).toBeTruthy();
                    expect(wrappedResponse.data.totalItems).toBeTruthy();
                    expect(wrappedResponse.data.lastUpdate).toBeTruthy();
                    expect(wrappedResponse.data.items).toBeTruthy();
                    expect(wrappedResponse.data.items.length).toEqual(wrappedResponse.data.totalItems);

                    var jobIdsReceived = _.pluck(wrappedResponse.data.items, 'jobId');
                    expect(jobIdsReceived).toContain(testSampleData.jobId[0].jobId);
                    expect(jobIdsReceived).toContain(testSampleData.jobId[1].jobId);
                    expect(jobIdsReceived).toContain(testSampleData.jobId[2].jobId);

                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 20000);
        });
        it('HDR fetchNextBatch: Invalid Site Id', function() {
            var finished = false;
            runs(function() {
                var invalidSiteId = 'DSSS-----';
                hdrClient.fetchNextBatch(invalidSiteId, '3150120-500', 500,
                function(err, wrappedResponse) {
                    expect(err).toBeTruthy();
                    expect(wrappedResponse).toBeFalsy();
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 20000);
        });
        it('HDR fetchNextBatch: Invalid Site Id, change config', function() {
            var finished = false;
            runs(function() {
                config.hdr.hdrSites[invalidSiteId] = {stationNumber: '999999'};
                hdrClient.fetchNextBatch(invalidSiteId, '3150120-500', 500,
                function(err, wrappedResponse) {
                    expect(err).toBeTruthy();
                    expect(wrappedResponse).toBeTruthy();
                    expect(wrappedResponse.data).toBeFalsy();
                    expect(wrappedResponse.hmpBatchSize).toBeTruthy();
                    expect(wrappedResponse.rawResponse).toBeFalsy();
                    delete config.hdr.hdrSites[invalidSiteId];
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 20000);
        });
    });

    describe ('HDR Unsubscribe', function() {
        it('HDR Unsubscribe: happy Path', function() {
            var finished = false;
            runs(function() {
                hdrClient.unsubscribe(testSampleData.siteId, testSampleData.patientIdentifier,
                function(err, result) {
                    expect(err).toBeFalsy();
                    expect(result).toBeTruthy();
                    expect(result).toEqual('success');
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 20000);
        });
        it('HDR Unsubscribe: Happy Path - re-unsubscribe with patientIdentifier\'value', function() {
            var finished = false;
            runs(function() {
                hdrClient.unsubscribe(testSampleData.siteId, testSampleData.patientIdentifier.value,
                function(err, result) {
                    expect(err).toBeFalsy();
                    expect(result).toBeTruthy();
                    expect(result).toEqual('success');
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
        it('HDR Unsubscribe: Invalid Site id', function() {
            var finished = false;
            runs(function() {
                hdrClient.unsubscribe(invalidSiteId, testSampleData.patientIdentifier,
                function(err, result) {
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 20000);
        });
        it('HDR Unsubscribe: Invalid Site id, change config', function() {
            var finished = false;
            runs(function() {
                config.hdr.hdrSites[invalidSiteId] = {stationNumber: '999999'};
                hdrClient.unsubscribe(invalidSiteId, testSampleData.patientIdentifier,
                function(err, result) {
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();
                    delete config.hdr.hdrSites[invalidSiteId];
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 20000);
        });
        it('HDR Unsubscribe: PatientIdentifier is Null', function() {
            var finished = false;
            runs(function() {
                hdrClient.unsubscribe(testSampleData.siteId, null,
                function(err, result) {
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
        it('HDR Unsubscribe: Invalid PatientIdentifier', function() {
            var finished = false;
            runs(function() {
                hdrClient.unsubscribe(testSampleData.siteId, invalidPatientId,
                function(err, result) {
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            }, 'HDR call', 6000);
        });
    });
});