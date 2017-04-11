'use strict';

var versionResource = require('./version-resource');

describe('version resource\'s', function () {
    var app = {config: {version: 'abc'}};
    var resourceConfig = versionResource.getResourceConfig(app);

    describe('getResourceConfig', function () {
        it('should return only 1 object', function () {
            expect(resourceConfig).to.be.an.array();
            expect(resourceConfig).to.have.length(1);
        });
        it('should be properly configured', function () {
            var resourceObject = resourceConfig[0];

            expect(resourceObject.name).to.equal('version');
            expect(resourceObject.path).to.equal('');
            expect(resourceObject.interceptors).to.eql({
                authentication: false,
                convertPid: false,
                synchronize: false,
                operationalDataCheck: false
            });
            expect(resourceObject.requiredPermissions).to.eql([]);
            expect(resourceObject.isPatientCentric).to.be.false();
            expect(resourceObject.bypassCsrf).to.be.true();
        });
    });

    describe('getVersion', function () {
        it('should return the function to get the version response', function () {
            var app = {config: {version: '0.1.2'}};
            expect(versionResource._getVersion(app)).to.be.a.function();
        });
    });

    describe('version response handler', function () {
        var app = {config: {version: '0.1.2'}};
        var versionResponseHandler = versionResource._getVersion(app);

        var req = null;
        var res = {
            rdkSend: function (response) {
                expect(response).to.eql({version: app.config.version});
            }
        };
        versionResponseHandler(req, res);
    });

});
