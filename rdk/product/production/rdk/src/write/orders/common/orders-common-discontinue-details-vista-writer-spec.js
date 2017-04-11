'use strict';

var resource = require('./orders-common-discontinue-details-vista-writer');

describe('write-back orders common discontinue details vista writer', function() {
    it('tests that getDiscontinueDetails returns correct discontinue details object', function() {
        var orderId = '12345;1';
        var expectedObj = {};
        expectedObj.orderId = '12345;1';
        expectedObj.detail = 'detail data string';
        expectedObj.hash = '8dcdcea8294e70b408b1156db185e730';

        var discontinueDetails = resource._getDiscontinueDetails(orderId, 'detail data string');
        expect(discontinueDetails).to.eql(expectedObj);
    });
});
