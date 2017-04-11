'use strict';

var resource = require('./orders-common-check-session-vista-writer');

describe('write-back orders common check session vista writer', function() {

    it('tests that getParameters returns correct parameters array', function() {
        var expectedArray = ['3', {'1': '34567;1^^1'}];
        var parameters = resource._getParameters('3', '34567;1');
        expect(parameters).to.eql(expectedArray);
    });

});
