'use strict';

require('../../../env-setup');

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var MVIClient = require(global.VX_SUBSYSTEMS + 'mvi/mvi-client');
var wConfig = require(global.VX_ROOT + 'worker-config');
var config = JSON.parse(JSON.stringify(wConfig));            // Make sure we are not using a shared copy of this so we can make changes later and not side effect some other test.
var _ = require('underscore');
var logger = require(global.VX_DUMMIES + '/dummy-logger');
//--------------------------------------------------------------
// Uncomment the following to see the logging out on the screen.
//--------------------------------------------------------------
// var logUtil = require(global.VX_UTILS + 'log');
// logUtil.initialize([{
//     name: 'root',
//     stream: process.stdout,
//     level: 'debug'
// }]);
// logger = logUtil.get('test', 'debug');
//------------------------------------------
// End of logging stuff to comment out....
//------------------------------------------
var testConfig = require(global.VX_INTTESTS + 'test-config');
var vx_sync_ip = testConfig.vxsyncIP;
var val = require(global.VX_UTILS + 'object-utils').getProperty;

config.mvi.host = vx_sync_ip;
var jdsCli = new JdsClient(logger, logger, config);

// At one point this test used its own internal patient.   But now it has been
// moved to use an existing one.  Leaving this here in case we want to go back.
//-----------------------------------------------------------------------------
// var ptSelect = [{
//     'birthDate': 19350407,
//     'familyName': 'ZZZRETFIVEFIFTYONE',
//     'fullName': 'ZZZRETFIVEFIFTYONE,PATIENT',
//     'genderCode': 'urn:va:pat-gender:M',
//     'genderName': 'Male',
//     'givenNames': 'PATIENT',
//     'localId': 1,
//     'icn': '888V12887',
//     'pid': 'SITE;3333',
//     'sensitive': true,
//     'ssn': 666223456,
//     'stampTime': '1234',
//     'uid': 'urn:va:pt-select:SITE:3333:3333'
// }, {
//     'birthDate': 19350407,
//     'familyName': 'ZZZRETFIVEFIFTYONE',
//     'fullName': 'ZZZRETFIVEFIFTYONE,PATIENT',
//     'genderCode': 'urn:va:pat-gender:M',
//     'genderName': 'Male',
//     'givenNames': 'PATIENT',
//     'localId': 1,
//     'icn': '888V12887',
//     'pid': 'ASDF;13',
//     'sensitive': true,
//     'ssn': 666223456,
//     'stampTime': '1234',
//     'uid': 'urn:va:pt-select:ASDF;13:13'
// }];

// var storeIdentifiers = function() {
//     var finished = 0;
//     runs(function() {
//         jdsCli.storeOperationalData(ptSelect[0], function() {
//             finished++;
//         });
//         jdsCli.storeOperationalData(ptSelect[1], function() {
//             finished++;
//         });
//     });

//     waitsFor(function() {
//         return finished === 2;
//     });
// };
// var clearPatientIdentifiers = function() {
//     var finished = 0;
//     runs(function() {
//         jdsCli.deleteOperationalDataByUid(ptSelect[0].uid, function() {
//             finished++;
//         });
//         jdsCli.deleteOperationalDataByUid(ptSelect[1].uid, function() {
//             finished++;
//         });
//     });

//     waitsFor(function() {
//         return finished === 2;
//     });
// };

var nf_patient_demographics = {
    givenNames: 'PATIENT',
    familyName: 'DOD_NO_VA',
    genderCode: 'M',
    ssn: '432233234',
    birthDate: '19670909',
    address:[
        {
            city: 'Norfolk',
            line1: 'Lost Street',
            state: 'VA',
            use: 'H',
            zip: '20152'

        }
    ],
    telecom:[
        {
            use: 'H',
            value: '301-222-3333'
        }
    ],
    fullName: 'EDIPIONLY,PATIENT',
    displayName : 'EDIPIONLY,PATIENT',
    age: 48,
    genderName: 'Male',
    sensitive: false,
    ageYears: 'Unk',
    dob: '19670909'
};

describe('mvi-client.js', function() {

    it('Vista Cache MVI lookup', function() {
        var mvi = new MVIClient(logger, logger, config, jdsCli);
        var finished = false;
        runs(function() {
            mvi.lookup({
                value: 'SITE;3',
                type: 'pid'
            }, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(val(result, 'ids')).toBeDefined();
//                expect(val(result, 'ids', 'length')).toBe(8);
                // The number is now 7 because one of the IDs is purposely not for a site that is in the HDR or VistA - and so we
                // cannot obtain a site hash for that site.   It will not be returned anymore.
                //---------------------------------------------------------------------------------------------------------------
                // For HDR PUB/SUB the length will be 7
                expect(val(result, 'ids', 'length')).toBe(5);
                expect(result.ids).toContain({
                    type: 'vhicid',
                    value: '32758',
                    active: true
                });
                expect(result.ids).toContain({
                    type: 'icn',
                    value: '10108V420871'
                });
                expect(result.ids).toContain({
                    type: 'edipi',
                    value: '0000000003'
                });
                expect(result.ids).toContain({
                    type: 'pid',
                    value: 'SITE;3'
                });
                expect(result.ids).toContain({
                    type: 'pid',
                    value: 'SITE;3'
                });
                // This only exists for HDR PUB/SUB configuration
                // expect(result.ids).toContain({
                //     type: 'pid',
                //     value: '2939;19'
                // });
                // expect(result.ids).toContain({
                //     type: 'pid',
                //     value: 'FFC7;28'
                // });
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI call', 60000);
    });

    it('MVI lookup ICN', function() {
        var mvi = new MVIClient(logger, logger, config, jdsCli);
        var finished = false;
        runs(function() {
            mvi.lookup({
                value: '10108V420871',
                type: 'icn'
            }, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(val(result, 'ids')).toBeDefined();
                // For HDR PUB/SUB this will be 7
                expect(val(result, 'ids', 'length')).toBe(5);
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI call', 60000);
    });

    it('Vista Cache MVI lookup - unknown id', function() {
        var mvi = new MVIClient(logger, logger, config, jdsCli);
        var finished = false;
        runs(function() {
            mvi.lookup({
                value: 'SITE;0',
                type: 'pid'
            }, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(val(result, 'ids')).toBeDefined();
                expect(val(result, 'ids', 'length')).toBe(1);
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI call', 60000);
    });

    it('Vista Cache MVI lookup - invalid site', function() {
        var mvi = new MVIClient(logger, logger, config, jdsCli);
        var finished = false;
        runs(function() {
            mvi.lookup({
                value: '4444;1',
                type: 'pid'
            }, function(err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI call', 60000);
    });


    it('Vista Cache MVI lookup - patient not found', function() {
        var mvi = new MVIClient(logger, logger, config, jdsCli);
        var finished = false;
        runs(function() {
            mvi.lookupWithDemographics({
                value: 'DOD;43215679',
                type: 'pid'
            }, nf_patient_demographics, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(val(result, 'ids')).toBeDefined();
                expect(val(result, 'ids', 'length')).toBe(1);
                expect(result.ids).toContain({
                    type: 'pid',
                    value: 'DOD;43215679'
                });
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI call', 60000);
    });

    it('Mvi Attended Search API - invalid input: Missing givenNames and SSN', function() {
        var mviClient = new MVIClient(logger, logger, config, jdsCli);
        var finished = false;
        runs(function(){
            mviClient.attendedSearch({
                familyName: 'TEST'
            }, function (err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI attend search call', 60000);
    });

    it('Mvi Attended Search API - invalid input: Missing SSN', function() {
        var mviClient = new MVIClient(logger, logger, config, jdsCli);
        var finished = false;
        runs(function(){
            mviClient.attendedSearch({
                familyName: 'TEST',
                givenNames: 'PATIENT'
            }, function (err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI attend search call', 60000);
    });

    it('Mvi Attended Search API - invalid input: Missing familyName', function() {
        var mviClient = new MVIClient(logger, logger, config, jdsCli);
        var finished = false;
        runs(function(){
            mviClient.attendedSearch({
                ssn: '00000000',
                givenNames: 'PATIENT'
            }, function (err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI attend search call', 60000);
    });

    it('Mvi Attended Search API - : EDIPIONLY PATIENT', function() {
        var mviClient = new MVIClient(logger, logger, config, null);
        var finished = false;
        runs(function(){
            mviClient.attendedSearch({
                givenNames: 'PATIENT',
                familyName: 'EDIPIONLY',
                ssn: '111111234'
            }, function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(_.isArray(result)).toBeTruthy();
                expect(result.length).toEqual(1);
                expect(result[0].patientIdentifier).toBeTruthy();
                expect(result[0].patientIdentifier.type).toEqual('edipi');
                expect(result[0].patientIdentifier.value).toEqual('43215678');
                expect(result[0].demographics.familyName).toEqual('EDIPIONLY');
                expect(result[0].demographics.givenNames).toEqual('PATIENT');
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI attend search call', 60000);
    });

    it('Mvi Attended Search API - : SYSTEM ERROR PATIENT', function() {
        var mviClient = new MVIClient(logger, logger, config, null);
        var finished = false;
        runs(function(){
            mviClient.attendedSearch({
                givenNames: 'SYSTEM',
                familyName: 'ERROR',
                ssn: '000000000'
            }, function (err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI attend search call', 60000);
    });

    it('Mvi Attended Search API - : APPLICATION ERROR PATIENT', function() {
        var mviClient = new MVIClient(logger, logger, config, null);
        var finished = false;
        runs(function(){
            mviClient.attendedSearch({
                givenNames: 'APPLICATION',
                familyName: 'ERROR',
                ssn: '000000000'
            }, function (err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI attend search call', 60000);
    });

    it('Mvi Attended Search API - : TOO MANY RECORDS PATIENT', function() {
        var mviClient = new MVIClient(logger, logger, config, null);
        var finished = false;
        runs(function(){
            mviClient.attendedSearch({
                givenNames: 'JOHN',
                familyName: 'SMITH',
                ssn: '000000000'
            }, function (err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI attend search call', 60000);
    });

    it('Mvi Attended Search API - : 10 RESULTS PATIENTS', function() {
        var mviClient = new MVIClient(logger, logger, config, null);
        var finished = false;
        runs(function(){
            mviClient.attendedSearch({
                givenNames: 'FRED',
                familyName: 'JONES',
                ssn: '000000000'
            }, function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(_.isArray(result)).toBeTruthy();
                expect(result.length).toEqual(10);
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI attend search call', 60000);
    });
});
