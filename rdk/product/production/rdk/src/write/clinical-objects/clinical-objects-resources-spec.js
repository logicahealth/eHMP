'use strict';

var clinicalObjectsResources = require('./clinical-objects-resources');

describe('Unit tests for write-back clinical object resources', function() {

    var resources = clinicalObjectsResources.getResourceConfig();

    it('should show that getResourceConfig() is functioning correctly', function() {
        expect(resources.length).to.equal(5);
        var findResource = resources[0];
        var getListResource = resources[1];
        var createResource = resources[2];
        var updateResource = resources[3];
        var readResource = resources[4];

        expect(findResource.name).to.be('clinical-object-find');
        expect(findResource.path).to.be('/find-clinical-object');
        expect(findResource.interceptors).to.eql({
            operationalDataCheck: false,
            synchronize: false
        });

        expect(findResource.requiredPermissions).to.be.an.array();
        expect(findResource.requiredPermissions).to.be.empty();
        expect(findResource.post).not.to.be.undefined();

        expect(getListResource.name).to.be('clinical-object-list-get');
        expect(getListResource.path).to.be('/get-clinical-object-list');
        expect(getListResource.interceptors).to.eql({
            operationalDataCheck: false,
            synchronize: false
        });

        expect(getListResource.requiredPermissions).to.be.an.array();
        expect(getListResource.requiredPermissions).to.be.empty();
        expect(getListResource.get).not.to.be.undefined();

        expect(createResource.name).to.be('clinical-object-add');
        expect(createResource.path).to.be.empty();
        expect(createResource.interceptors).to.eql({
            operationalDataCheck: false,
            synchronize: false
        });
        expect(createResource.requiredPermissions).to.be.an.array();
        expect(createResource.requiredPermissions).to.be.empty();
        expect(createResource.post).not.to.be.undefined();

        expect(readResource.name).to.be('clinical-object-read');
        expect(readResource.path).to.be('/:resourceId');
        expect(readResource.interceptors).to.eql({
            operationalDataCheck: false,
            synchronize: false
        });
        expect(readResource.requiredPermissions).to.be.an.array();
        expect(readResource.requiredPermissions).to.be.empty();
        expect(readResource.get).not.to.be.undefined();
    });
});
