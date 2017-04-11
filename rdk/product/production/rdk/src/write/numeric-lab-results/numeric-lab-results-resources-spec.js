'use strict';

var resource = require('./numeric-lab-results-resources');

describe('Numeric Lab Results Resources', function() {

    it('tests that getResourceConfig() is setup correctly for save note object', function() {
        var resources = resource.getResourceConfig();
        expect(resources.length).to.equal(1);

        expect(resources[0].name).to.equal('numeric-lab-results-save-note-object');
        expect(resources[0].path).to.equal('/save-note-object');
        expect(resources[0].interceptors).to.eql({
            operationalDataCheck: false,
            synchronize: false
        });
        expect(resources[0].requiredPermissions).not.to.be.undefined();
        expect(resources[0].post).not.to.be.undefined();
    });

});
