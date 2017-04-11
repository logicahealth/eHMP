/*jslint node: true*/
'use strict';

var _ = require('lodash');
var PatientImmunizationDupes = require('./patient-record-immunization-dupes');

        var vistaSites =
{
    C877: {
        name: 'KODAK',
                division: '500',
                host: 'IP        ',
                localIP: 'IP      ',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'PW    ',
                verifyCode: 'PW    !!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A': {
        name: 'PANORAMA',
                division: '500',
                host: 'IP        ',
                localIP: 'IP      ',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'PW    ',
                verifyCode: 'PW    !!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    }
        };

var fluDOD = {
    "administeredDateTime": "20001204103149",
    "facilityCode": "DOD",
    "name": "INFLUENZA"
};

var rubellaVista = {
    "administeredDateTime": "201531204103114",
    "facilityCode": "500",
    "name": "RUBELLA"
};

var mumpsSecondary = {
    "administeredDateTime": "20100404105506",
    "facilityCode": "561",
    "name": "MUMPS"
};

var removed = {
    "removed": "true"
};

describe('Verify duplicates are removed', function() {

    it('Correct immunization records are obtained with no duplication, all have valid dates', function() {

        var input = [fluDOD, rubellaVista, mumpsSecondary];
        var expectedOutput = [fluDOD, rubellaVista, mumpsSecondary];
        PatientImmunizationDupes.removeDuplicateImmunizations(vistaSites, input).items;

        expect(expectedOutput.length).to.be.equal(input.length);
    });

});
