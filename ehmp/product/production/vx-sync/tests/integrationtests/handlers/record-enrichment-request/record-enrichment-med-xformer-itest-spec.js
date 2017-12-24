'use strict';
//------------------------------------------------------------------------------------
// This contains a set of integration tests for record-enrichment-med-xformer.js.
//
// Author: Les Westberg
//------------------------------------------------------------------------------------

require('../../../../env-setup');

var _ = require('underscore');

var testConfig = require(global.VX_INTTESTS + 'test-config');
var vx_sync_ip = testConfig.vxsyncIP;
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var xformer = require(global.VX_HANDLERS + 'record-enrichment-request/record-enrichment-med-xformer');
var log = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'record-enrichment-allergy-xformer-spec',
//     level: 'debug'
// });
var TerminologyUtil = require(global.VX_SUBSYSTEMS + 'terminology/terminology-utils');
var wConfig = require(global.VX_ROOT + 'worker-config');
var config = JSON.parse(JSON.stringify(wConfig));            // Make sure we are not using a shared copy of this so we can make changes later and not side effect some other test.
config.terminology.host = vx_sync_ip;

var originalVaMedRecord = {
    'dosages': [{
        'amount': 1,
        'dose': 40,
        'instructions': '40MG',
        'noun': 'TABLET',
        'relativeStart': 0,
        'relativeStop': 527040,
        'routeName': 'PO',
        'scheduleFreq': 1440,
        'scheduleName': 'QPM',
        'scheduleType': 'CONTINUOUS',
        'start': 20020305,
        'stop': 20030306,
        'units': 'MG',
        'ivRate': 100, // Added in for testing purposes.
        'routeCode': 102, // Added in for testing purposes.
        'timingExpression': 103, // Added in for testing purposes.
        'restriction': 104, // Added in for testing purposes.
        'relatedOrder': 105, // Added in for testing purposes.
        'complexDuration': 106, // Added in for testing purposes.
        'duration': 101 // Added in for testing purposes.
    }],
    'facilityCode': 500,
    'facilityName': 'CAMP MASTER',
    'fills': [{
        'daysSupplyDispensed': 90,
        'dispenseDate': 20020305,
        'quantityDispensed': 90,
        'releaseDate': 20020305,
        'routing': 'W'
    }],
    'lastFilled': 20020305,
    'lastUpdateTime': 20030306000000,
    'localId': '402189;O',
    'medStatus': 'urn:sct:392521001',
    'medStatusName': 'historical',
    'medType': 'urn:sct:73639000',
    'name': 'SIMVASTATIN TAB',
    'orders': [{
        'daysSupply': 90,
        'fillCost': 72,
        'fillsAllowed': 3,
        'fillsRemaining': 3,
        'orderUid': 'urn:va:order:SITE:3:12727',
        'ordered': 200203051344,
        'pharmacistName': 'TDPHARMACIST,ONE',
        'pharmacistUid': 'urn:va:user:SITE:10000000019',
        'prescriptionId': 800013,
        'providerName': 'VEHU,ONE',
        'providerUid': 'urn:va:user:SITE:20001',
        'quantityOrdered': 90,
        'vaRouting': 'W',
        'expiration': 106 // Added in for testing purposes.
    }],
    'overallStart': 20020305,
    'overallStop': 20030306,
    'patientInstruction': '',
    'pid': 'SITE;3',
    'productFormName': 'TAB',
    'products': [{
        'drugClassCode': 'urn:vadc:CV350',
        'drugClassName': 'ANTILIPEMIC AGENTS',
        'ingredientCode': 'urn:va:vuid:4020400',
        'ingredientCodeName': 'SIMVASTATIN',
        'ingredientName': 'SIMVASTATIN TAB',
        'ingredientRole': 'urn:sct:410942007',
        'strength': '40 MG',
        'suppliedCode': 'urn:va:vuid:4010153',
        'suppliedName': 'SIMVASTATIN 40MG TAB',
        'volume': 106, // Added in for testing purposes.
        'ivBag': 107, // Added in for testing purposes.
        'relatedOrder': 108 // Added in for testing purposes.
    }],
    'administrations': [{
        'dateTime': 20030305101112,
        'status': 'GIVEN'
    }],
    'indications': [{
        'narrative': 'SomeNarrativeGoesHere',
        'code': 123
    }],
    'qualifiedName': 'SIMVASTATIN TAB',
    'sig': 'TAKE ONE TABLET BY BY MOUTH EVERY EVENING',
    'stampTime': 20030306000000,
    'stopped': 20030306,
    'type': 'Prescription',
    'uid': 'urn:va:med:SITE:3:12727',
    'vaStatus': 'EXPIRED',
    'vaType': 'O'
};
var originalVaMedJob = {
    record: originalVaMedRecord
};

// What it should be when the terminology translations are real...
//-----------------------------------------------------------------
// var jdsCodedVaValue = {
// 	code: 'C0220892',
// 	system: terminologyUtil.CODE_SYSTEMS.CODE_SYSTEM_UMLS_CUI,
// 	display: 'Penicillin'
// };
// What it is with the mock terminology translations.
//-----------------------------------------------------------------
var jdsCodedVaValue = {
    system: 'urn:oid:2.16.840.1.113883.6.88',
    code: '198211',
    display: 'Simvastatin 40 MG Oral Tablet'
};

var originalDodMedRecord = {
    'codes': [{
            'code': '3000257828',
            'display': '',
            'system': 'DOD_NCID'
        }
        // , {
        //     'code': '905225',
        //     'display': 'Hydralazine Hydrochloride 25 MG Oral Tablet',
        //     'system': 'urn:oid:2.16.840.1.113883.6.88'
        // }
    ],
    'facilityCode': 'DOD',
    'facilityName': 'DOD',
    'fills': [{
        'dispenseDate': '20131025124400',
        'dispensingPharmacy': 'MAIN PHARMACY',
        'quantityDispensed': '1'
    }],
    'medStatus': 'Active',
    'medType': 'O',
    'name': 'HYDRALAZINE HCL, 25 MG, TABLET, ORAL',
    'orders': [{
        'daysSupply': '30',
        'fillsRemaining': '0',
        'providerName': 'AHLTADTE, ATTEND B',
        'quantityOrdered': '1'
    }],
    'overallStart': '20131025020100',
    'overallStop': '20131124134400',
    'patientInstruction': '\nNONE',
    'pid': 'DOD;0000000003',
    'productFormCode': '2165347221',
    'productFormName': 'HYDRALAZINE HCL, 25 MG, TABLET, ORAL',
    'products': [{
        'suppliedName': 'HYDRALAZINE HCL, 25 MG, TABLET, ORAL'
    }],
    'sig': '',
    'stampTime': '20150305091425',
    'uid': 'urn:va:med:DOD:0000000003:1000000474',
    'vaStatus': 'Active',
    'vaType': 'O'
};
var originalDodMedJob = {
    record: originalDodMedRecord
};
// What it should be when the terminology translations are real...
//-----------------------------------------------------------------
// var jdsCodedDodValue = {
// 	code: 'C0220892',
// 	system: terminologyUtil.CODE_SYSTEMS.CODE_SYSTEM_UMLS_CUI,
// 	display: 'Penicillin'
// };
// What it is with the mock terminology translations.
//-----------------------------------------------------------------
var jdsCodedDodValue = {
    code: '905225',
    display: 'Hydralazine Hydrochloride 25 MG Oral Tablet',
    system: 'urn:oid:2.16.840.1.113883.6.88'
};

//-----------------------------------------------------------------------------
// This is a stub method that simulates the VA terminology database.  It behaves
// like no code was found in the database.
//
// conceptId: The URN of the concept.
// callback: The callback handler.  function(error, concept)
//-----------------------------------------------------------------------------
function getVADrugConcept_ReturnNoCode(conceptId, callback) {
    return callback(null, null);
}

var terminologyUtil = new TerminologyUtil(log, log, config);

//-----------------------------------------------------------------------------
// This is a stub method that simulates the VA terminology database.  It behaves
// like no code was found in the database.
//
// conceptId: The URN of the concept.
// callback: The callback handler.  function(error, concept)
//-----------------------------------------------------------------------------
function getVAConceptMappingTo_ReturnNoCode(concept, targetCodeSystem, callback) {
    return callback(null, null);
}
function OverrideTerminologyUtil(log, metrics, config){
    this.log = log;
    this.metrics = metrics;
    this.config = config;
}
// OverrideTerminologyUtil.prototype.config = config;
OverrideTerminologyUtil.prototype.CODE_SYSTEMS = terminologyUtil.CODE_SYSTEMS;
OverrideTerminologyUtil.prototype.getJlvMappedCode = terminologyUtil.getJlvMappedCode;
OverrideTerminologyUtil.prototype.getJlvMappedCodeList = terminologyUtil.getJlvMappedCodeList;
OverrideTerminologyUtil.prototype.getVADrugConcept = getVADrugConcept_ReturnNoCode;
OverrideTerminologyUtil.prototype.getVAConceptMappingTo = getVAConceptMappingTo_ReturnNoCode;
OverrideTerminologyUtil.prototype._isMappingTypeValid = terminologyUtil._isMappingTypeValid;
var overrideTerminologyUtil = new OverrideTerminologyUtil(log, log, config);

describe('record-enrichment-med-xformer.js', function() {
    describe('transformAndEnrichRecord()', function() {
        it('Happy Path with VA Med', function() {
            var finished = false;
            var environment = {
                terminologyUtils: terminologyUtil
            };
            var config = {};

            runs(function() {
                xformer(log, config, environment, originalVaMedJob.record, function(error, record) {
                    expect(error).toBeNull();
                    expect(_.isObject(record)).toBe(true);
                    // Verify that the code was inserted.
                    //-----------------------------------
                    expect(_.isArray(val(record, 'codes'))).toBe(true);
                    expect(val(record, 'codes', 'length')).toBeGreaterThan(0);
                    expect(val(record, 'codes')).toContain(jasmine.objectContaining(jdsCodedVaValue));
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call failed to return in time.', 10000);
        });

        it('Happy Path with VA Med - Force translation through JLV database.', function() {
            var finished = false;
            var environment = {
                terminologyUtils: overrideTerminologyUtil
            };
            var config = {};

            runs(function() {
                xformer(log, config, environment, originalVaMedJob.record, function(error, record) {
                    expect(error).toBeNull();
                    expect(_.isObject(record)).toBe(true);
                    // Verify that the code was inserted.
                    //-----------------------------------
                    expect(_.isArray(val(record, 'codes'))).toBe(true);
                    expect(val(record, 'codes', 'length')).toBeGreaterThan(0);
                    expect(val(record, 'codes')).toContain(jasmine.objectContaining(jdsCodedVaValue));
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call failed to return in time.', 10000);
        });

        it('Happy Path with Dod Medication', function() {
            var finished = false;
            var environment = {
                terminologyUtils: terminologyUtil
            };
            var config = {};

            runs(function() {
                xformer(log, config, environment, originalDodMedJob.record, function(error, record) {
                    expect(error).toBeNull();
                    expect(_.isObject(record)).toBe(true);
                    // Verify that the code was inserted.
                    //-----------------------------------
                    expect(_.isArray(val(record, 'codes'))).toBe(true);
                    expect(val(record, 'codes', 'length')).toBeGreaterThan(0);
                    expect(val(record, 'codes')).toContain(jasmine.objectContaining(jdsCodedDodValue));
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'Call failed to return in time.', 10000);
        });
    });
});