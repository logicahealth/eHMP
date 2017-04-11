'use strict';

var resource = require('./orders-common-discontinue-vista-writer');

describe('write-back orders common discontinue vista writer', function() {
    it('tests that getParameters returns correct parameters array', function() {
        var model = {
            'dfn': '100716',
            'provider': '10000000231',
            'location': '285',
            'reason': 'foobar',
            'kind': 'Laboratory'
        };
        var expectedArray = ['38479;1', '10000000231', '285', 'foobar', '0', '0'];
        var parameters = resource._getParameters(model, '38479;1');
        expect(parameters).to.eql(expectedArray);
    });
});
