'use strict';

var vprOrder = require('./orders-common-vpr-order');

var writebackContext = {
    pid: '9E7A;3',
    siteHash:'9E7A',
    model: {
        'dfn': '3',
        'provider': '10000000238',
        "location": "285",
    }
};

describe('vpr order tests', function() {

    it('produces a valid uid using orderId', function(done) {

        var uid = vprOrder.toUid(writebackContext, "39072");

        expect(uid).to.be.truthy();
        expect(uid).to.be.equal('urn:va:order:9E7A:3:39072');
        done();
    });

    it('produces a valid uid from legacy order data', function(done) {
        var vistaSaveOrderResp = "~39072;1^6^3151109.2014^TODAY^^11^2^^^10000000271^XIU,MARGARET^^0^^^^^^CARDIOLOGY:195^^0^0^0^0\\r\\ntHEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\\r\\n";

        var uid = vprOrder.toUidFromLegacyOrderData(writebackContext, vistaSaveOrderResp);

        expect(uid).to.be.truthy();
        expect(uid).to.be.equal('urn:va:order:9E7A:3:39072');
        done();
    });
});
