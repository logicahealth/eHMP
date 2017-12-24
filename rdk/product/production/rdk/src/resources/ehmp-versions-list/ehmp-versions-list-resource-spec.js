'use strict';

var ehmpVersionsResource = require('./ehmp-versions-list-resource');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'ehmp-versions-list-resource'
}));
var fs = require('fs');
var versionsFile = __dirname + '/../../../config/ehmp-versions.json';

describe('Unit tests for ehmp versions list resource', function() {
    var resources = ehmpVersionsResource.getResourceConfig();

    it('should show that getResourceConfig() is functioning correctly', function() {
        expect(resources.length).to.equal(1);
        var getListResource = resources[0];

        expect(getListResource.name).to.be('ehmp-versions-list');
        expect(getListResource.path).to.be('');
        expect(getListResource.interceptors).to.eql({});

        expect(getListResource.requiredPermissions).to.be.an.array();
        expect(getListResource.isPatientCentric).to.be(false);
        expect(getListResource.get).not.to.be.undefined();
    });
});

describe('eHMP versions list resource getVersions', function() {
    it('tests that versions are returned', function(done) {
        var req = {
            logger: logger
        };
        var res = {
            status: function(status) {
                res.status = status;
                return this;
            },
            rdkSend: function(result) {
                expect(result.versions[0].id).not.to.be.undefined();
                done();
            }
        };
        // only test if versions file has been deployed.
        if (fs.existsSync(versionsFile)) {
            ehmpVersionsResource._getVersions(req, res);
        } else {
            done();
        }
    });
});
