'use strict';
var permissionSetsResource = require('./permission-sets-resource');
var _ = require('lodash');

describe('Permission Sets resources', function() {
    it('tests that getResourceConfig() is setup correctly for edit permission sets', function() {
        var resources = permissionSetsResource.getResourceConfig()[0];

        expect(resources.name).to.equal('permission-sets-edit');
        expect(resources.path).to.equal('/edit');
        expect(resources.subsystems).not.to.be.undefined();
        expect(resources.put).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for get user permission sets', function() {
        var resources = permissionSetsResource.getResourceConfig()[1];

        expect(resources.name).to.equal('permission-sets-getUserPermissionSets');
        expect(resources.path).to.equal('/getUserPermissionSets');
        expect(resources.subsystems).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for list permission sets', function() {
        var resources = permissionSetsResource.getResourceConfig()[2];

        expect(resources.name).to.equal('permission-sets-list');
        expect(resources.path).to.equal('/list');
        expect(resources.subsystems).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });

    it('tests that getResourceConfig is setup correctly for user permission set features', function() {
        var resources = permissionSetsResource.getResourceConfig()[4];

        expect(resources.name).to.equal('permission-sets-features');
        expect(resources.path).to.equal('/features-list');
        expect(resources.get).not.to.be.undefined();
    });
    it('tests that getResourceConfig is setup correctly for persission sets categories', function() {
        var resource = _.findWhere(permissionSetsResource.getResourceConfig(), {
            name: 'permission-sets-categories'
        });
        expect(resource).not.to.be.undefined();
        expect(resource.path).to.equal('/categories');
        expect(resource.get).not.to.be.undefined();
    });
});
