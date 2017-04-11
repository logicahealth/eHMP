'use strict';

var clinicalObjectsResources = require('./order-resource');

describe('Unit tests for order resource', function() {

    var resources = clinicalObjectsResources.getResourceConfig();

    it('should show that getResourceConfig() is functioning correctly', function() {
        expect(resources.length).to.equal(1);
        var getListResource = resources[0];

        expect(getListResource.name).to.be('all-orders');
        expect(getListResource.path).to.be('/all-orders');
        expect(getListResource.interceptors).to.eql({
            authentication: false,
            jdsFilter: true,
            convertPid: true
        });

        expect(getListResource.requiredPermissions).to.be.an.array();
        expect(getListResource.isPatientCentric).to.be(true);
        expect(getListResource.get).not.to.be.undefined();
    });
});
