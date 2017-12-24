'use strict';

var resourceConfig = require('./allergies-resources').getResourceConfig;

describe('write-back allergies Resources', function() {
    it('test getResourceConfig() is setup correctly', function() {
        var resources = resourceConfig();
        expect(resources.length).to.equal(2);
        var addResource = resources[0];
        var eieResource = resources[1];

        expect(addResource.name).to.equal('allergies-add');
        expect(addResource.path).to.equal('');
        expect(addResource.interceptors).to.eql({
            convertPid: true,
            synchronize: false
        });
        expect(addResource.requiredPermissions).not.to.be.undefined();
        expect(addResource.requiredPermissions[0]).to.eql('add-allergy');
        expect(addResource.post).not.to.be.undefined();

        expect(eieResource.name).to.equal('allergies-eie');
        expect(eieResource.path).to.equal('/:resourceId');
        expect(eieResource.interceptors).to.eql({
            convertPid: true,
            synchronize: false
        });
        expect(eieResource.requiredPermissions).not.to.be.undefined();
        expect(eieResource.requiredPermissions[0]).to.eql('eie-allergy');
        expect(eieResource.put).not.to.be.undefined();
    });
});
