/*global sinon, describe, it, expect */
'use strict';

require('../../../../env-setup');

var parse = require(global.VX_ENDPOINTS + '/patient-select/patient-select-parser').parse;

var log = require(global.VX_DUMMIES + 'dummy-logger');

describe('unit test to validate patient-select', function() {
    it('can parse the RPC data correctly', function () {
        /* jshint -W109 */
        var result = parse(log, 'BCMA,EIGHT^BCMA^EIGHT^Bcma,Eight^urn:va:pat-gender:M^MALE^*****0008^0008^B0008^19450407^false^100022^9E7A;100022^5000000341V359724^Bcma,Eight' + '\r\n'); 

        expect(result).toEqual([
            {
                "fullName": "BCMA,EIGHT",
                "familyName": "BCMA",
                "givenNames": "EIGHT",
                "displayName": "Bcma,Eight",
                "genderCode": "urn:va:pat-gender:M",
                "genderName": "MALE",
                "ssn": "*****0008",
                "last4": "0008",
                "last5": "B0008",
                "birthDate": "19450407",
                "sensitive": false,
                "localId": "100022",
                "pid": "9E7A;100022",
                "icn": "5000000341V359724",
                "summary": "Bcma,Eight"
            }
        ]);
        /* jshint +W109 */
    });
});
