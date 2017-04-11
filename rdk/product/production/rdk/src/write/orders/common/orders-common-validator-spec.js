'use strict';

var validator = require('./orders-common-validator');

describe('write-back orders common validator', function() {
    var editLabWritebackContext;
    var detailLabWritebackContext;
    var discontinueDetailsLabWritebackContext;
    var signDetailsLabWritebackContext;
    var signLabWritebackContext;
    var draftLabWritebackContext;
    var findDraftLabWritebackContext;

    beforeEach(function() {
        editLabWritebackContext = {};
        editLabWritebackContext.resourceId = '12345';
        detailLabWritebackContext = {};
        detailLabWritebackContext.resourceId = '45678';
        detailLabWritebackContext.siteParam = '9E7A'
        discontinueDetailsLabWritebackContext = {
            model: {
                'dfn': '100716',
                'provider': '1000000000',
                'orderIds': [
                    '38965;1',
                    '38966;1'
                ]
            }
        };
        signDetailsLabWritebackContext = {};
        var signDetailsLabModel = {};
        signDetailsLabModel.dfn = '100716';
        signDetailsLabModel.provider = '1000000000';
        var orderIds = ['12345;1', '12346;1'];
        signDetailsLabModel.orderIds = orderIds;
        signDetailsLabWritebackContext.model = signDetailsLabModel;

        signLabWritebackContext = {
            model: {
                'dfn': '100716',
                'provider': '1000000000',
               'location': '285',
                'eSig': 'mx1234!!',
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

        draftLabWritebackContext = {
            model: {
                uid: 'urn:va:ehmp-order:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
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

        findDraftLabWritebackContext = {
            model: {
                patientUid: '9E7A;100716',
                authorUid: 'Something',
                domain: 'order',
                ehmpState: 'draft'
            }
        };
    });

    it('identifies good edit request', function(done) {
        validator.editLab(editLabWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad edit request', function(done) {
        delete editLabWritebackContext.resourceId;
        validator.editLab(editLabWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good detail request', function(done) {
        validator.detailLab(detailLabWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad detail request', function(done) {
        delete detailLabWritebackContext.resourceId;
        validator.detailLab(detailLabWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good discontinue details request', function(done) {
        validator.discontinueDetailsLab(discontinueDetailsLabWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad discontinue details request', function(done) {
        discontinueDetailsLabWritebackContext.model.orderIds = [];
        validator.discontinueDetailsLab(discontinueDetailsLabWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good sign details request', function(done) {
        validator.signDetailsLab(signDetailsLabWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad sign details request', function(done) {
        signDetailsLabWritebackContext.model.orderIds = [];
        validator.signDetailsLab(signDetailsLabWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good sign request', function(done) {
        validator.signOrdersLab(signLabWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad sign request', function(done) {
        signLabWritebackContext.model.orderList = [];
        validator.signOrdersLab(signLabWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good draft request', function(done) {
        validator.saveDraftLabOrder(draftLabWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad draft request', function(done) {
        draftLabWritebackContext.model.authorUid = null;
        validator.saveDraftLabOrder(draftLabWritebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });

    it('identifies good find draft request', function(done) {
        validator.findDraftLabOrders(findDraftLabWritebackContext, function(err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('identifies bad find draft request', function(done) {
        findDraftLabWritebackContext.model.patientUid = null;
        validator.findDraftLabOrders(findDraftLabWritebackContext, function(err) {
            console.log(err);
            expect(err).to.be.truthy();
            done();
        });
    });
});
