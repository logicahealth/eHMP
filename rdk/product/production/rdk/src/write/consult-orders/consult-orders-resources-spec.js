'use strict';

var resource = require('./consult-orders-resources');

describe('write-back consult orders Resources', function() {
    it('tests that getResourceConfig() is setup correctly for sign order', function() {
        var resources = resource.getResourceConfig();
        expect(resources.length).to.equal(1);

        expect(resources[0].name).to.equal('consult-orders-sign');
        expect(resources[0].path).to.equal('/consult-sign');
        expect(resources[0].interceptors).to.eql({
            operationalDataCheck: false,
            synchronize: false
        });
        expect(resources[0].requiredPermissions).not.to.be.undefined();
        expect(resources[0].post).not.to.be.undefined();
    });
});
