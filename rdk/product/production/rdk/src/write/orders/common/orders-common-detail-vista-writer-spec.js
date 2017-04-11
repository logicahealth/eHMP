'use strict';

var resource = require('./orders-common-detail-vista-writer');

describe('write-back orders common detail vista writer', function() {
    it('tests that getParameters returns correct parameters array', function() {
        var resourceId = '12345;1';
        var expectedArray = ['12345;1', '3'];
        var dfn = '3';
        var parameters = resource._getParameters(resourceId, dfn);
        expect(parameters).to.eql(expectedArray);
    });
});
