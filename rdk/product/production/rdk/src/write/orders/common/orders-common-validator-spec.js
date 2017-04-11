'use strict';

var validator = require('./orders-common-validator');

describe('write-back orders common validator', function() {
    var editWritebackContext;
    var detailWritebackContext;
    var discontinueDetailsWritebackContext;
    var signDetailsWritebackContext;
    var signWritebackContext;
    var draftWritebackContext;
    var findDraftWritebackContext;

    beforeEach(function() {
        editWritebackContext = {};
        editWritebackContext.resourceId = 12345;
        detailWritebackContext = {};
        detailWritebackContext.resourceId = 45678;
        discontinueDetailsWritebackContext = {
            model: {
                'dfn': '100716',
                'provider': '1000000000',
                'orderIds': [
                    '38965;1',
                    '38966;1'
                ]
            }
        };
        signDetailsWritebackContext = {};
        var signDetailsModel = {};
        signDetailsModel.dfn = '100716';
        signDetailsModel.provider = '1000000000';
        var orderIds = ['12345;1', '12346;1'];
        signDetailsModel.orderIds = orderIds;
        signDetailsWritebackContext.model = signDetailsModel;

        signWritebackContext = {
            model: {
                'dfn': '100716',
                'provider': '1000000000',
                'location': '285',
                'eSig': 'PW    !!',
                'orderList': [{
                    'orderId': '38989;1',
                    'orderDetailHash': 'some hash value'
                }],
                overrideReason: 'override reason',
                orderCheckList: [{
                    orderCheck: '38989;1^11^2^Duplicate order: HEMOGLOBIN A1C BLOOD   SP LB #18535 9/29/15 [UNCOLLECTED]'
                }, {
                    orderCheck: '38989;1^24^2^Max lab test order freq exceeded for: HEMOGLOBIN A1C'
                }]
            }
        };

        draftWritebackContext = {
            model: {
                uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
                patientUid: '9E7A;3',
                ehmpState: 'draft',
                authorUid: 'urn:va:user:9E7A:123',
                domain: 'order',
                subDomain: 'laboratory',
                visit: {
                    location: 'urn:va:location:9E7A:1',
                    serviceCategory: 'PSB',
                    dateTime: '20160101120000'
                },
                referenceId: '',
                data: {
                    labTestText: 'Gas Panel - Arterial Cord',
                    labCollSamp: '999',
                    location: '32',
                    specimen: '8759'
                }
            }
        };

        findDraftWritebackContext = {
            model: {
                patientUid: '9E7A;100716',
                authorUid: 'Something',
                domain: 'order',
                ehmpState: 'draft'
            }
        };
    });

    it('identifies good edit request', function(done) {
        validator.edit(editWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad edit request', function(done) {
        delete editWritebackContext.resourceId;
        validator.edit(editWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good detail request', function(done) {
        validator.detail(detailWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad detail request', function(done) {
        delete detailWritebackContext.resourceId;
        validator.detail(detailWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good discontinue details request', function(done) {
        validator.discontinueDetails(discontinueDetailsWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad discontinue details request', function(done) {
        discontinueDetailsWritebackContext.model.orderIds = [];
        validator.discontinueDetails(discontinueDetailsWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good sign details request', function(done) {
        validator.signDetails(signDetailsWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad sign details request', function(done) {
        signDetailsWritebackContext.model.orderIds = [];
        validator.signDetails(signDetailsWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good sign request', function(done) {
        validator.signOrders(signWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad sign request', function(done) {
        signWritebackContext.model.orderList = [];
        validator.signOrders(signWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good draft request', function(done) {
        validator.saveDraftOrder(draftWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad draft request', function(done) {
        draftWritebackContext.model.authorUid = null;
        validator.saveDraftOrder(draftWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good find draft request', function(done) {
        validator.findDraftOrders(findDraftWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad find draft request', function(done) {
        findDraftWritebackContext.model.patientUid = null;
        validator.findDraftOrders(findDraftWritebackContext, function(err) {
            console.log(err);
            expect(err).to.be.truthy();
            done();
        });
    });
});