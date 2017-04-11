'use strict';

var resource = require('./orders-common-sign-details-vista-writer');

describe('write-back orders common sign details vista writer', function() {
    it('tests that getSignDetails returns correct sign details object', function() {
        var orderId = '12345;1';
        var expectedObj = {};
        expectedObj.orderId = '12345;1';
        expectedObj.detail = 'detail data string';
        var orderCheckList = [];
        var orderCheck = {};
        orderCheck.orderCheck = 'single order check';
        orderCheckList.push(orderCheck);
        expectedObj.orderCheckList = orderCheckList;
        expectedObj.hash = '8dcdcea8294e70b408b1156db185e730';

        var signDetails = resource._getSignDetails(orderId, 'detail data string', 'single order check');
        expect(signDetails).to.eql(expectedObj);

        orderCheckList = [];
        var orderCheck1 = {};
        var orderCheck2 = {};
        orderCheck1.orderCheck = '39016;1^11^1^Duplicate order: PTT BLOOD   PLASMA WC *UNSIGNED*  [UNRELEASED]^1';
        orderCheck2.orderCheck = '39016;1^11^1^Duplicate order: PTT BLOOD   PLASMA WC LB #18541 9/24/15 7:19 pm [UNCOLLECTED]^1';
        orderCheckList.push(orderCheck1);
        orderCheckList.push(orderCheck2);
        expectedObj.orderCheckList = orderCheckList;
        signDetails = resource._getSignDetails(orderId, 'detail data string', '39016;1^11^1^Duplicate order: PTT BLOOD   PLASMA WC *UNSIGNED*  [UNRELEASED]^1\r\n39016;1^11^1^Duplicate order: PTT BLOOD   PLASMA WC LB #18541 9/24/15 7:19 pm [UNCOLLECTED]^1\r\n');
        expect(signDetails).to.eql(expectedObj);
    });
});
