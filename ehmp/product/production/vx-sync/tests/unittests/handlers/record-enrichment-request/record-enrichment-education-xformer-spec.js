'use strict';


require('../../../../env-setup');

var xformer = require(global.VX_HANDLERS + 'record-enrichment-request/record-enrichment-education-xformer');
var log = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'record-enrichment-vital-xformer-spec',
//     level: 'debug'
// });
var educationTransformedRecord = {
        encounterName: '0Apr 17, 2000',
        encounterUid: 'urn:va:visit:SITE:237:2056',
        entered: '20000417000000',
        facilityCode: '500',
        facilityName: 'CAMP MASTER',
        lastUpdateTime: '20000417000000',
        localId: '42',
        name: 'SMOKING CESSATION',
        pid: 'SITE;237',
        stampTime: '20000417000000',
        uid: 'urn:va:education:SITE:237:42'
      };

var educationRecord = {
        encounterName: '0Apr 17, 2000',
        encounterUid: 'urn:va:visit:SITE:237:2056',
        entered: 20000417000000,
        facilityCode: 500,
        facilityName: 'CAMP MASTER',
        lastUpdateTime: 20000417000000,
        localId: 42,
        name: 'SMOKING CESSATION',
        pid: 'SITE;237',
        stampTime: 20000417000000,
        uid: 'urn:va:education:SITE:237:42'
      };

describe('record-enrichment-education-xformer.js', function(){
    it('transform education record',function(){
        var finished = false;
        var environment = {};
        var config = {};
        runs(function() {
            xformer(log, config, environment, educationRecord, function(error, record){
                expect(error).toBeFalsy();
                expect(record).toBeTruthy();
                expect(record.encounterName).toBe(educationTransformedRecord.encounterName);
                expect(record.encounterUid).toBe(educationTransformedRecord.encounterUid);
                expect(record.entered).toBe(educationTransformedRecord.entered);
                expect(record.facilityCode).toBe(educationTransformedRecord.facilityCode);
                expect(record.facilityName).toBe(educationTransformedRecord.facilityName);
                expect(record.lastUpdateTime).toBe(educationTransformedRecord.lastUpdateTime);
                expect(record.localId).toBe(educationTransformedRecord.localId);
                expect(record.name).toBe(educationTransformedRecord.name);
                expect(record.pid).toBe(educationTransformedRecord.pid);
                expect(record.stampTime).toBe(educationTransformedRecord.stampTime);
                expect(record.uid).toBe(educationTransformedRecord.uid);
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'Call failed to return in time.', 500);
    });

});