'use strict';

function dodDemographicsToVPR(logger, dodDemographics, edipi, patientIcn){
    var genderNameMap = {
        'M': 'Male',
        'F': 'Female',
        'UNK': 'Unknown'
    };

    return {
        fullName: dodDemographics.name,
        displayName: dodDemographics.name,
        ssn: dodDemographics.ssn,
        genderCode: 'urn:va:pat-gender:'+dodDemographics.gender,
        genderName: genderNameMap[dodDemographics.gender],
        icn: patientIcn,
        birthDate: dodDemographics.dob,
        address: [{
            city: dodDemographics.city,
            line1: dodDemographics.address1,
            line2: dodDemographics.address2,
            zip: dodDemographics.zipCode,
            state: dodDemographics.state,
            use: 'H',
            summary: 'Address{uid=\' \'}'
        }],
        uid: 'urn:va:patient:DOD:' + edipi + ':' + edipi, //uidUtils.getUidForDomain('patient', 'DOD', edipi),
        pid: 'DOD;' + edipi,
        telecom: [{
            use: 'H',
            value: dodDemographics.phone1,
            summary: 'Telecom{uid=\' \'}'
        }]
    };
}

module.exports = dodDemographicsToVPR;
