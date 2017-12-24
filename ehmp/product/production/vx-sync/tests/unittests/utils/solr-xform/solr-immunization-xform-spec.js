'use strict';

//-----------------------------------------------------------------
// This will test the solr-immunization-xform.js functions.
//
// Author: Khurram Lone
//-----------------------------------------------------------------

require('../../../../env-setup');

var _ = require('underscore');
var xformer = require(global.VX_UTILS + 'solr-xform/solr-immunization-xform');
var log = require(global.VX_DUMMIES + 'dummy-logger');

describe('solr-immunization-xform.js', function() {
    describe('Transformer', function () {
        var vprRecord;

        beforeEach(function () {
            vprRecord = {
                'codes': [
                    {
                        'code': 'C0008299',
                        'display': 'Chocolate',
                        'system': 'urn:oid:2.16.840.1.113883.6.86'
                    }
                ],
                'drugClasses': [{
                    'code': 'CHOCO100',
                    'name': 'CHOCOLATE'
                }],
                'entered': '200712171515',
                'enteredByUid': 'urn:va:user:SITE:100',
                'verifiedByUid': 'urn:va:user:SITE:101',
                'facilityCode': '500',
                'facilityName': 'CAMP MASTER',
                'historical': true,
                'kind': 'Immunization',
                'lastUpdateTime': '20071217151553',
                'localId': '876',
                'mechanism': 'ALLERGY',
                'originatorName': 'PROVIDER,ONE',
                'pid': 'SITE;8',
                'reference': '3;GMRD(120.82,',
                'stampTime': '20071217151553',
                'summary': 'CHOCOLATE',
                'typeName': 'DRUG, FOOD',
                'uid': 'urn:va:immunization:SITE:8:876',
                'verified': '20071217151553',
                'verifierName': '<auto-verified>',
                'comments': [{
                    'entered': 200503172009,
                    'comment': 'The immunization comment.'
                }],
                'name':'INFLUENZA, UNSPECIFIED FORMULATION',
                'cptCode':'urn:cpt:90658',
                'cptName':'FLU VACCINE 3 YRS & > IM',
                'performerUid':'urn:va:user:SITE:1',
                'performerName':'PROGRAMMER,ONE',
                'locationUid':'urn:va:location:SITE:32',
                'locationName':'PRIMARY CARE',
                'encounterUid':'urn:va:visit:SITE:8:10579',
                'encounterName':'PRIMARY CARE May 16, 2014',

                'severityName': 'SEVERE'

            };
        });

        it('Happy Path', function() {
            var solrRecord = xformer(vprRecord, log);

            // Verify Common Fields
            //---------------------
            expect(solrRecord.uid).toBe(vprRecord.uid);
            expect(solrRecord.pid).toBe(vprRecord.pid);
            expect(solrRecord.facility_code).toBe(vprRecord.facilityCode);
            expect(solrRecord.facility_name).toBe(vprRecord.facilityName);
            expect(solrRecord.kind).toBe(vprRecord.kind);
            expect(solrRecord.summary).toBe(vprRecord.summary);
            expect(solrRecord.codes_code).toEqual([vprRecord.codes[0].code]);
            expect(solrRecord.codes_system).toEqual([vprRecord.codes[0].system]);
            expect(solrRecord.codes_display).toEqual([vprRecord.codes[0].display]);
            expect(solrRecord.entered).toBe(vprRecord.entered);
            expect(solrRecord.verified).toBe(vprRecord.verified);

            // Verify immunization Specific Fields
            //-------------------------------
            expect(solrRecord.domain).toBe('immunization');
            expect(solrRecord.immunization_name).toBe(vprRecord.name);
            expect(solrRecord.cpt_code).toBe(vprRecord.cptCode);
            expect(solrRecord.cpt_name).toBe(vprRecord.cptName);
            expect(solrRecord.performer_uid).toEqual([vprRecord.performerUid]);
            expect(solrRecord.performer_name).toEqual([vprRecord.performerName]);
            expect(solrRecord.location_uid).toBe(vprRecord.locationUid);
            expect(solrRecord.location_name).toBe(vprRecord.locationName);
            expect(solrRecord.encounter_uid).toEqual([vprRecord.encounterUid]);
            expect(solrRecord.encounter_name).toEqual([vprRecord.encounterName]);
            expect(solrRecord.removed).toBeUndefined();
        });

        it('Removed', function () {
            vprRecord.removed = true;
            var solrRecord = xformer(vprRecord, log);
            expect(solrRecord.removed).toBe('true');
        });
    });
});