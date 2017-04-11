'use strict';

var _ = require('lodash');

var getResourceConfig = require('./vitals-resources').getResourceConfig;

describe('write-back vitals Resources', function() {

    var logger = sinon.stub(require('bunyan').createLogger({
            name: 'vitala-resourcespec.js'
        }));
        var req = {};
        req.logger = logger;
        req.app = {};
        req.app.config = {};
        req.session = {};
        req.session.user = {};
        req.body = {};
        req.param = _.identity;


    it('test getResourceConfig() is setup correctly', function() {
        var resources = getResourceConfig();
        expect(resources.length).to.equal(2);
        var addResource = resources[0];
        var eieResource = resources[1];

        expect(addResource.name).to.equal('vitals-add');
        expect(addResource.path).to.equal('');
        expect(addResource.interceptors).to.eql({
            convertPid: true
        });
        expect(addResource.requiredPermissions).not.to.be.undefined();
        expect(addResource.requiredPermissions[0]).to.eql('add-vital');
        expect(addResource.post).not.to.be.undefined();

        expect(eieResource.name).to.equal('vitals-update');
        expect(eieResource.path).to.equal('/:resourceId');
        expect(eieResource.interceptors).to.eql({
            convertPid: true
        });
        expect(eieResource.requiredPermissions).not.to.be.undefined();
        expect(eieResource.requiredPermissions[0]).to.eql('eie-vital');
        expect(eieResource.put).not.to.be.undefined();
    });
});
