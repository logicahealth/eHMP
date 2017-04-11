'use strict';

var resource = require('./orders-common-action-valid-vista-writer');

describe('write-back orders common action valid vista writer', function() {

    it('tests that getParameters returns correct parameters array', function() {
        var expectedArray = ['34567;1', 'ES', '1000000271'];
        var parameters = resource._getParameters('34567;1', 'ES', '1000000271');
        expect(parameters).to.eql(expectedArray);
    });

});
