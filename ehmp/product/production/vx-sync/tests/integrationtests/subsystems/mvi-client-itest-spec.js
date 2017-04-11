'use strict';

require('../../../env-setup');

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var MVIClient = require(global.VX_SUBSYSTEMS + 'mvi/mvi-client');
var config = require(global.VX_ROOT + 'worker-config');

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

var vx_sync_ip = require(global.VX_INTTESTS + 'test-config');
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
//     'pid': '9E7A;3333',
//     'sensitive': true,
//     'ssn': 666223456,
//     'stampTime': '1234',
//     'uid': 'urn:va:pt-select:9E7A:3333:3333'
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

describe('mvi-client.js', function() {

    it('Vista Cache MVI lookup', function() {
        var mvi = new MVIClient(logger, logger, config, jdsCli);
        var finished = false;
        runs(function() {
            mvi.lookup({
                value: '9E7A;3',
                type: 'pid'
            }, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(val(result, 'ids')).toBeDefined();
                expect(val(result, 'ids', 'length')).toBe(8);
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI call', 6000);
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
                expect(val(result, 'ids', 'length')).toBe(7);
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'MVI call', 20000);
    });

    it('Vista Cache MVI lookup - unknown id', function() {
        var mvi = new MVIClient(logger, logger, config, jdsCli);
        var finished = false;
        runs(function() {
            mvi.lookup({
                value: '9E7A;0',
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
        }, 'MVI call', 6000);
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
        }, 'MVI call', 6000);
    });
});