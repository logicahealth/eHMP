'use strict';

require('../../../../../env-setup');
var xformer = require(global.VX_HANDLERS + 'jmeadows-xform-domain-vpr/v2_3_3_0_2/jmeadows-demographics-xformer');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// Be sure next lines are commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'jmeadows-xform-domain-vpr-handler-spec',
//     level: 'debug'
// });

var mockEdipi = '00001';

var sampleDodDemographics = {
    'address1': 'Any Street',
    'address2': '',
    'admissionDate': null,
    'admissionId': null,
    'cdrEventId': null,
    'city': 'Any Town',
    'clinic': null,
    'codeGreen': '0',
    'eligibility': null,
    'eligibilityStatus': null,
    'emergencyContact': null,
    'ethnicity': null,
    'flags': null,
    'labId': null,
    'languages': null,
    'maritialStatus': null,
    'nextOfKin': null,
    'pcAssigned': null,
    'pcProvider': null,
    'pcTeam': null,
    'pcmClinic': null,
    'pcmDates': null,
    'pcmPhone': null,
    'percentServiceConnected': null,
    'phone1': '(555)505-9776',
    'phone2': null,
    'primaryProvider': null,
    'race': null,
    'rank': 'Specialist',
    'religion': null,
    'site': {
        'agency': 'DOD',
        'container': null,
        'dmisId': null,
        'endpoints': null,
        'id': null,
        'moniker': 'PDWS',
        'name': 'PDWS',
        'permissions': null,
        'region': null,
        'siteCode': '',
        'status': null
    },
    'sourceProtocol': 'DODADAPTER',
    'sponsorName': 'EIGHT,PATIENT',
    'state': 'LA',
    'ward': null,
    'wardId': null,
    'zipCode': '70131',
    'age': null,
    'ahltaUnitNumber': null,
    'dob': '19450309',
    'edipi': '0000000003',
    'fmp': '',
    'gender': 'M',
    'icn': null,
    'name': 'EIGHT,PATIENT',
    'patientIens': null,
    'ssn': '666000808',
    'sensitive': false,
    'sponsorSSN': '666000808',
    'vistaSites': null

};

var sampleVprDemographics = {
    fullName: 'EIGHT,PATIENT',
    displayName: 'EIGHT,PATIENT',
    ssn: '666000808',
    genderName: 'Male',
    genderCode: 'urn:va:pat-gender:M',
    birthDate: '19450309',
    address: [{
        city: 'Any Town',
        line1: 'Any Street',
        line2: '',
        zip: '70131',
        state: 'LA',
        use: 'H',
        summary: 'Address{uid=\' \'}'
    }],
    telecom: [{
        value: '(555)505-9776',
        use: 'H',
        summary: 'Telecom{uid=\' \'}'
    }],
    uid: 'urn:va:patient:DOD:00001:00001',
    pid: 'DOD;00001'
};

describe('dodDemographicsToVPR()', function(){
    it('verify transform sample dod demographics to vpr', function(){
        var result = xformer(log, sampleDodDemographics, mockEdipi);
        // console.log(result.address, sampleVprDemographics.address);

        expect(result.fullName).toEqual(sampleVprDemographics.fullName);
        expect(result.displayName).toEqual(sampleVprDemographics.displayName);
        expect(result.ssn).toEqual(sampleVprDemographics.ssn);
        expect(result.genderName).toEqual(sampleVprDemographics.genderName);
        expect(result.birthDate).toEqual(sampleVprDemographics.birthDate);
        expect(result.address).toEqual(sampleVprDemographics.address);
        expect(result.uid).toEqual(sampleVprDemographics.uid);
        expect(result.pid).toEqual(sampleVprDemographics.pid);
    });
});

/*
19:44:44.208Z DEBUG jmeadows-xform-demographics-vpr: jmeadows-xform-domain-vpr-handler.handle: Transforming data for domain: demographics to VPR
19:44:44.208Z DEBUG jmeadows-xform-demographics-vpr: jmeadows-xform-domain-vpr-handler.handle: Transformed VPR records: {"data":{"items":[]}}
19:44:44.208Z DEBUG jmeadows-xform-demographics-vpr: jmeadows-xform-domain-vpr-handler.handle: metastamp created: {"stampTime":"20150130144403","sourceMetaStamp":{},"icn":null}
19:44:44.208Z DEBUG subscriberHost.jds-client: JdsClient.saveSyncStatus()
19:44:44.208Z DEBUG subscriberHost.jds-client: { stampTime: '20150130144403', sourceMetaStamp: {}, icn: null }
19:44:44.208Z DEBUG subscriberHost.jds-client: /status/DOD;0000000003
19:44:44.208Z DEBUG subscriberHost.jds-client: { stampTime: '20150130144403', sourceMetaStamp: {}, icn: null }
19:44:44.214Z ERROR subscriberHost.jds-client: Unable to access JDS endpoint: POST http://IP             /status/DOD;0000000003
19:44:44.215Z ERROR subscriberHost.jds-client: null {"apiVersion":"1.0","error":{"code":500,"errors":[{"domain":"Log ID:93","message":"M execution error","reason":501}],"message":"Internal Server Error","request":"POST /status/DOD;0000000003 "}}
19:44:44.215Z DEBUG jmeadows-xform-demographics-vpr: jmeadows-xform-domain-vpr-handler.handle: saveSyncStatus returned.  error: [object Object]; response: {"statusCode":500,"body":{"apiVersion":"1.0","error":{"code":500,"errors":[{"domain":"Log ID:93","message":"M execution error","reason":501}],"message":"Internal Server Error","request":"POST /status/DOD;0000000003 "}},"headers":{"date":"Fri, 30 Jan 2015 19:44:46 GMT","content-type":"application/json","content-length":"195"},"request":{"uri":{"protocol":"http:","slashes":true,"auth":null,"host":"IP             ","port":"PORT","hostname":"IP        ","hash":null,"search":null,"query":null,"pathname":"/status/DOD;0000000003","path":"/status/DOD;0000000003","href":"http://IP             /status/DOD;0000000003"},"method":"POST","headers":{"accept":"application/json","content-type":"application/json","content-length":62}}}
19:44:44.215Z ERROR jmeadows-xform-demographics-vpr: jmeadows-xform-domain-vpr-handler.handle: Received error while attempting to store metaStamp for pid: DOD;0000000003.  Error: [object Object];  Response: {"statusCode":500,"body":{"apiVersion":"1.0","error":{"code":500,"errors":[{"domain":"Log ID:93","message":"M execution error","reason":501}],"message":"Internal Server Error","request":"POST /status/DOD;0000000003 "}},"headers":{"date":"Fri, 30 Jan 2015 19:44:46 GMT","content-type":"application/json","content-length":"195"},"request":{"uri":{"protocol":"http:","slashes":true,"auth":null,"host":"IP             ","port":"PORT","hostname":"IP        ","hash":null,"search":null,"query":null,"pathname":"/status/DOD;0000000003","path":"/status/DOD;0000000003","href":"http://IP             /status/DOD;0000000003"},"method":"POST","headers":{"accept":"application/json","content-type":"application/json","content-length":62}}}; metaStamp:[{"stampTime":"20150130144403","sourceMetaStamp":{},"icn":null}]
19:44:44.215Z DEBUG worker.worker-1: Destroy job: 727 (jmeadows-xform-demographics-vpr)
19:44:44.215Z DEBUG worker.worker-1: Worker._destroy() jobId: 727
*/
