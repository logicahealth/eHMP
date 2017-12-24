'use strict';

var PatientImmunizationDupes = require('./patient-record-immunization-dupes');

        var vistaSites =
{
    SITE: {
        name: 'KODAK',
                division: '500',
                host: 'IP        ',
                localIP: 'IP      ',
                localAddress: 'localhost',
                port: PORT,
                production: false,
                accessCode: 'USER  ',
                verifyCode: 'PW      ',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    'SITE': {
        name: 'PANORAMA',
                division: '500',
                host: 'IP        ',
                localIP: 'IP      ',
                localAddress: 'localhost',
                port: PORT,
                production: false,
                accessCode: 'USER  ',
                verifyCode: 'PW      ',
        infoButtonOid: '1.3.6.1.4.1.3768'
    }
        };

var fluDOD = {
    'administeredDateTime': '20001204103149',
    'facilityCode': 'DOD',
    'name': 'INFLUENZA'
};

var rubellaVista = {
    'administeredDateTime': '201531204103114',
    'facilityCode': '500',
    'name': 'RUBELLA'
};

var mumpsSecondary = {
    'administeredDateTime': '20100404105506',
    'facilityCode': '561',
    'name': 'MUMPS'
};

describe('Verify duplicates are removed', function() {

    it('Correct immunization records are obtained with no duplication, all have valid dates', function() {

        var input = [fluDOD, rubellaVista, mumpsSecondary];
        var expectedOutput = [fluDOD, rubellaVista, mumpsSecondary];
        PatientImmunizationDupes.removeDuplicateImmunizations(vistaSites, input);

        expect(expectedOutput.length).to.be.equal(input.length);
    });

});
