'use strict';
var userResource = require('./user-resource');
var rdk = require('../../core/rdk');
var httpMocks = require('node-mocks-http');
var _ = require('lodash');
var querystring = require('querystring');
var nock = require('nock');

describe('User resource', function() {
    it('tests that getResourceConfig() is setup correctly for user info', function() {
        var resources = userResource.getResourceConfig()[0];

        expect(resources.name).to.equal('user-service-userinfo');
        expect(resources.path).to.equal('/info');
        expect(resources.healthcheck).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for get user list', function() {
        var resources = userResource.getResourceConfig()[1];

        expect(resources.name).to.equal('user-service-userlist');
        expect(resources.path).to.equal('/list');
        expect(resources.healthcheck).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });
    it('tests that getResourceConfig() is setup correctly for get user context', function() {
        var resources = userResource.getResourceConfig()[2];

        expect(resources.name).to.equal('set-recent-patients');
        expect(resources.path).to.equal('/set-recent-patients');
        expect(resources.healthcheck).not.to.be.undefined();
        expect(resources.put).not.to.be.undefined();
    });
    it('tests that getResourceConfig() is setup correctly for set user context', function() {
        var resources = userResource.getResourceConfig()[3];

        expect(resources.name).to.equal('get-recent-patients');
        expect(resources.path).to.equal('/get-recent-patients');
        expect(resources.healthcheck).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });
});
