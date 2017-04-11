'use strict';

var patientLock = require('./orders-common-patient-lock');

describe('Checks the patient lock parameters', function() {

    it('tests that getParameters returns correct parameters array', function(done) {
        var model = {
            "dfn": "100615",
            "provider": "10000000231",
            "location": "285",
            "orderDialog": "LR OTHER LAB TESTS",
            "displayGroup": "6",
            "quickOrderDialog": "2",
            "orderId": "38479;1",
            "inputList": [{
                "inputKey": "4",
                "inputValue": "350"
            }, {
                "inputKey": "126",
                "inputValue": "1"
            }, {
                "inputKey": "127",
                "inputValue": "72"
            }, {
                "inputKey": "180",
                "inputValue": "2"
            }, {
                "inputKey": "28",
                "inputValue": "SP"
            }, {
                "inputKey": "6",
                "inputValue": "TODAY"
            }, {
                "inputKey": "29",
                "inputValue": "28"
            }],
            "orderCheckList": [{
                "orderCheck": "NEW^11^2^Duplicate order: 11-DEOXYCORTISOL BLOOD   SERUM SP *UNSIGNED*  [UNRELEASED]"
            }],
            "localId": "12519",
            "uid": "urn:va:order:9E7A:100615:12519",
            "kind": "Laboratory"
        };
        var expectedArray = ['100615'];
        var parameters = patientLock._getParameters(model);
        expect(parameters).to.eql(expectedArray);
        done(); 
    });

});