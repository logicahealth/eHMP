'use strict';
var userResource = require('./user-resource');

describe('User resource', function() {
    var index = 0;
    it('tests that getResourceConfig() is setup correctly for user info', function() {
        var resources = userResource.getResourceConfig()[index++];

        expect(resources.name).to.equal('user-service-userinfo');
        expect(resources.path).to.equal('/info');
        expect(resources.healthcheck).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for user info by uid', function() {
        var resources = userResource.getResourceConfig()[index++];

        expect(resources.name).to.equal('user-service-userinfo-byUid');
        expect(resources.path).to.equal('/info/byUid');
        expect(resources.healthcheck).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for get user list', function() {
        var resources = userResource.getResourceConfig()[index++];

        expect(resources.name).to.equal('user-service-userlist');
        expect(resources.path).to.equal('/list');
        expect(resources.healthcheck).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });
    it('tests that getResourceConfig() is setup correctly for get user context', function() {
        var resources = userResource.getResourceConfig()[index++];

        expect(resources.name).to.equal('set-recent-patients');
        expect(resources.path).to.equal('/set-recent-patients');
        expect(resources.healthcheck).not.to.be.undefined();
        expect(resources.put).not.to.be.undefined();
    });
    it('tests that getResourceConfig() is setup correctly for set user context', function() {
        var resources = userResource.getResourceConfig()[index++];

        expect(resources.name).to.equal('get-recent-patients');
        expect(resources.path).to.equal('/get-recent-patients');
        expect(resources.healthcheck).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });
    it('tests that getResourceConfig() is setup correctly for set user context', function() {
            var resources = userResource.getResourceConfig()[index++];
            expect(resources.name).to.equal('set-preferences');
            expect(resources.path).to.equal('/set-preferences');
            expect(resources.healthcheck).not.to.be.undefined();
            expect(resources.put).not.to.be.undefined();
    });
});
