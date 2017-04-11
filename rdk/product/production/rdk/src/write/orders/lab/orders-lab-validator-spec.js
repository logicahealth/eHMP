'use strict';

var validator = require('./orders-lab-validator');

describe('write-back orders lab validator', function() {
    var createLabWritebackContext;
    var updateLabWritebackContext;
    var discontinueLabWritebackContext;

    beforeEach(function() {
        createLabWritebackContext = {};
        createLabWritebackContext.interceptorResults = {
            patientIdentifiers: {
                'dfn': '100615',
            }
        };
        createLabWritebackContext.model = {
            'dfn': '100615',
            'provider': '10000000231',
            'location': '285',
            'orderDialog': 'LR OTHER LAB TESTS',
            'displayGroup': '6',
            'quickOrderDialog': '2',
            'inputList': [{
                'inputKey': '4',
                'inputValue': '350'
            }, {
                'inputKey': '126',
                'inputValue': '1'
            }, {
                'inputKey': '127',
                'inputValue': '72'
            }, {
                'inputKey': '180',
                'inputValue': '9'
            }, {
                'inputKey': '28',
                'inputValue': 'SP'
            }, {
                'inputKey': '6',
                'inputValue': 'TODAY'
            }, {
                'inputKey': '29',
                'inputValue': '28'
            }],
            'localId': '12519',
            'uid': 'urn:va:order:9E7A:100615:12519',
            'kind': 'Laboratory',
            'clinicalObject': {
                'patientUid': '9E7A;100615',
                'authorUid': 'urn:va:user:9E7A:10000000238',
                'domain': 'ehmp-order',
                'subDomain': 'laboratory',
                'visit': {
                    'location': '285',
                    'serviceCategory': 'PSB',
                    'dateTime': '20160102123040'
                },
                'data': {
                    'pastDueDate': '20160101'
                }
            }
        };
        updateLabWritebackContext = {};
        updateLabWritebackContext.interceptorResults = {
            patientIdentifiers: {
                'dfn': '100615',
            }
        };
        updateLabWritebackContext.model = {
            'provider': '10000000231',
            'location': '285',
            'orderDialog': 'LR OTHER LAB TESTS',
            'displayGroup': '6',
            'quickOrderDialog': '2',
            'orderId': '38479;1',
            'inputList': [{
                'inputKey': '4',
                'inputValue': '350'
            }, {
                'inputKey': '126',
                'inputValue': '1'
            }, {
                'inputKey': '127',
                'inputValue': '72'
            }, {
                'inputKey': '180',
                'inputValue': '2'
            }, {
                'inputKey': '28',
                'inputValue': 'SP'
            }, {
                'inputKey': '6',
                'inputValue': 'TODAY'
            }, {
                'inputKey': '29',
                'inputValue': '28'
            }],
            'orderCheckList': [{
                'orderCheck': 'NEW^11^2^Duplicate order: 11-DEOXYCORTISOL BLOOD   SERUM SP *UNSIGNED*  [UNRELEASED]'
            }],
            'localId': '12519',
            'uid': 'urn:va:order:9E7A:100615:12519',
            'kind': 'Laboratory',
            'clinicalObject': {
                'uid': 'urn:va:ehmp:9E7A:100615:foobar',
                'patientUid': '9E7A;100615',
                'authorUid': 'urn:va:user:9E7A:10000000238',
                'domain': 'ehmp-order',
                'subDomain': 'laboratory',
                'visit': {
                    'location': '285',
                    'serviceCategory': 'PSB',
                    'dateTime': '20160102123040'
                },
                'data': {
                    'pastDueDate': '20160101'
                }
            }
        };
        discontinueLabWritebackContext = {};
        discontinueLabWritebackContext.interceptorResults = {
            patientIdentifiers: {
                'dfn': '100615',
            }
        };
        discontinueLabWritebackContext.model = {
            'orderId': '38479;1',
            'provider': '10000000231',
            'location': '285',
            'orderList': [{
                'orderId': '12519',
                'hash': 'foo'
            }],
            'kind': 'Laboratory'
        };
    });

    it('identifies good creates', function(done) {
        validator.create(createLabWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad creates', function(done) {
        delete createLabWritebackContext.interceptorResults.patientIdentifiers.dfn;
        validator.create(createLabWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good updates', function(done) {
        validator.update(updateLabWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad updates', function(done) {
        delete updateLabWritebackContext.model.orderId;
        validator.update(updateLabWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good discontinue', function(done) {
        validator.discontinueLab(discontinueLabWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad discontinue', function(done) {
        delete discontinueLabWritebackContext.interceptorResults.patientIdentifiers.dfn;
        validator.discontinueLab(discontinueLabWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

});
