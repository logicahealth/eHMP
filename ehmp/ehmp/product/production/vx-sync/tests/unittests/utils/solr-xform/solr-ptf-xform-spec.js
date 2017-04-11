'use strict';

//-----------------------------------------------------------------
// This will test the solr-allergy-xform.js functions.
//
// Author: Les Westberg
//-----------------------------------------------------------------

require('../../../../env-setup');

var xformer = require(global.VX_UTILS + 'solr-xform/solr-ptf-xform');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'record-enrichment-allergy-xformer-spec',
//     level: 'debug'
// });

describe('solr-ptf-xform.js', function() {
    describe('Transformer', function() {
        it('Happy Path', function() {
            var vprRecord = {
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
                'pid': '9E7A;8',
                'principalDx': 'true',
                'stampTime': '19920128160000',
                'uid': 'urn:va:ptf:9E7A:8:130;70;DXLS'
            };
            var solrRecord = xformer(vprRecord, log);

            // Verify Common Fields
            //---------------------
            expect(solrRecord.uid).toBe(vprRecord.uid);
            expect(solrRecord.pid).toBe(vprRecord.pid);
            expect(solrRecord.facility_code).toBe(vprRecord.facilityCode);
            expect(solrRecord.facility_name).toBe(vprRecord.facilityName);

            // Verify PTF Specific Fields
            //-------------------------------
            expect(solrRecord.domain).toBe('ptf');
            expect(solrRecord.admission_uid).toBe(vprRecord.admissionUid);
            expect(solrRecord.arrival_date_time).toEqual(vprRecord.arrivalDateTime);
            expect(solrRecord.discharge_date_time).toEqual(vprRecord.dischargeDateTime);
            expect(solrRecord.drg).toEqual(vprRecord.drg);
            expect(solrRecord.icd_code).toEqual(vprRecord.icdCode);
            expect(solrRecord.icd_name).toBe(vprRecord.icdName);
        });
    });
});