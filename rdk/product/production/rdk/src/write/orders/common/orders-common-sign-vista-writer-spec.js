'use strict';

var signVistaWriter = require('./orders-common-sign-vista-writer'),
    crypto = require('crypto');

describe('Checks the sign order parameters', function () {

    it('tests that getSignOrderSendParameters returns a valid parameters list', function (done) {
        var model = {
            "dfn": "100615",
            "provider": "10000000231",
            "location": "285",
            "eSig": "mx1234!!",
            "orderList": [{
                'orderId': "38979;1",
                'orderDetailHash': "foobar"
            }, {
                'orderId': "38980;1",
                'orderDetailHash': "foobar"
            }]
        };
        var parameters = signVistaWriter._getSignOrderSendParameters(model);
        expect(parameters).not.to.be.falsy();
        expect(parameters.length).to.equal(5);
        var orderIds = parameters[4];
        expect(orderIds["(1)"]).to.be.equal("38979;1^1^1^E");
        expect(orderIds["(2)"]).to.be.equal("38980;1^1^1^E");
        done();
    });
});

describe('Checks the validate signature parameters', function () {

    it('tests that getParameters returns a parameter array of size 1', function (done) {
        var model = {
            "dfn": "100615",
            "provider": "10000000231",
            "location": "285",
            "eSig": "mx1234!!"
        };
        var parameters = signVistaWriter._getValidateSignatureParameters(model);
        expect(parameters).to.be.truthy();
        expect(parameters.length).to.equal(1);
        done();
    });
});

describe('Checks the order detail comparison functionality', function () {

    var orderDetail = "GLUCOSE BLOOD   SERUM WC LB #1917\r\n   \r\nActivity:\r\n05/21/2000 08:00  New Order entered by PATHOLOGY,ONE (COMPUTER SPECIA)\r\n     Order Text:        GLUCOSE BLOOD   SERUM WC\r\n     Nature of Order:   WRITTEN\r\n     Ordered by:        VEHU,EIGHT (Physician)\r\n        Released:       05/21/2000 08:00\r\n     Signature:         ON CHART WITH WRITTEN ORDERS\r\n   \r\nCurrent Data:\r\nCurrent Primary Provider:     PROVIDER,TWENTY\r\nCurrent Attending Physician:  PROVIDER,THIRTY\r\nTreating Specialty:           \r\nOrdering Location:            ICU/CCU\r\nStart Date/Time:              05/21/2000 08:00\r\nStop Date/Time:               05/21/2000 10:08\r\nCurrent Status:               COMPLETE\r\n  Orders that require no further action by the ancillary service. \r\n   e.g., Lab orders are completed when results are available, \r\n  Radiology orders are complete when results are available.\r\nOrder #12519\r\n   \r\nOrder:\r\nLab Test:                     GLUCOSE \r\nCollected By:                 Ward collect & deliver \r\nCollection Sample:            BLOOD  \r\nSpecimen:                     SERUM \r\nUrgency:                      ROUTINE \r\n   \r\n";

    it('tests that compareOrderDetailsWithHash successfully compares detail data against a hash value', function (done) {
        var hash = crypto.createHash('md5').update(orderDetail).digest('hex');

        expect(signVistaWriter._compareOrderDetailsWithHash(orderDetail, hash)).to.be.truthy();

        done();
    });

    it('tests that compareOrderDetailsWithHash compares detail data against a bad hash value', function () {
        var hash = "badhashvalue";

        expect(signVistaWriter._compareOrderDetailsWithHash(orderDetail, hash)).not.to.be.truthy();
    });
});

describe('Checks the save order check parameters', function () {

    it('tests that getParameters returns a valid parameter array', function (done) {
        var model = {
            "dfn": "100615",
            "provider": "10000000231",
            "location": "285",
            'overrideReason': 'Override reason',
            'orderCheckList': [
                {
                    "orderCheck": "38958;1^11^2^Duplicate order: HEMOGLOBIN A1C BLOOD   SP LB #18532 9/29/15 [UNCOLLECTED]^1"
                },
                {
                    "orderCheck": "38958;1^24^2^Max lab test order freq exceeded for: HEMOGLOBIN A1C^1"
                },
                {
                    "orderCheck": "38959;1^11^2^Duplicate order: GENTAMICIN BLOOD   SERUM SP 9/29/15 [UNCOLLECTED]^1"
                }
            ]
        };

        var parameters = signVistaWriter._getSaveOrderCheckParameters(model);
        expect(parameters).to.be.truthy();
        expect(parameters.length).to.equal(3);

        expect(parameters[0]).to.equal("100615");
        expect(parameters[1]).to.equal("Override reason");
        expect(parameters[2]).to.be.truthy();

        var orderCheckObj = parameters[2];

        expect(orderCheckObj['"ORCHECKS"']).to.equal("3");
        expect(orderCheckObj['"ORCHECKS", 1']).to.equal("38958;1^11^2^Duplicate order: HEMOGLOBIN A1C BLOOD   SP LB #18532 9/29/15 [UNCOLLECTED]^1");
        expect(orderCheckObj['"ORCHECKS", 2']).to.equal("38958;1^24^2^Max lab test order freq exceeded for: HEMOGLOBIN A1C^1");
        expect(orderCheckObj['"ORCHECKS", 3']).to.equal("38959;1^11^2^Duplicate order: GENTAMICIN BLOOD   SERUM SP 9/29/15 [UNCOLLECTED]^1");

        done();
    });
});


