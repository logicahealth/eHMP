'use strict';

var resourceDirectoryResource = require('./resource-directory-resource');
var ResourceRegistry = require('./resource-registry');
var express = require('express');

describe('resourceDirectoryResource', function() {
    var req;
    var resourceConfig;
    beforeEach(function() {
        resourceConfig = resourceDirectoryResource.getResourceConfig();
        req = {};
        req.app = {};
        req.app.resourceRegistry = new ResourceRegistry();
        req.app.resourceRegistry.register({
            title: 'test',
            path: '/test'
        });
        req.audit = {};
        req.get = function() {
            return 'localhost';
        };
    });

    it('has relative and absolute endpoints', function() {
        expect(resourceConfig).to.have.length(2);
        expect(resourceConfig[0].name).to.equal('resource-directory');
        expect(resourceConfig[0].path).to.equal('');
        expect(resourceConfig[1].name).to.equal('resource-directory-cors');
        expect(resourceConfig[1].path).to.equal('cors');
    });

    it('works with relative paths', function(done) {
        req.url = '/resource/resourcedirectory';
        var configItem = resourceConfig[0];
        var res = {};
        res.type = function(type) {
            expect(type).to.equal('application/json');
            return this;
        };
        res.rdkSend = function(resourceDirectory) {
            expect(resourceDirectory).to.be.an.object();
            expect(resourceDirectory.link[0].href).not.to.startWith('http');
            expect(resourceDirectory.link[0].href).to.startWith('/');
            done();
        };
        configItem.get(req, res);
    });
    it('works with cors paths', function(done) {
        req.url = '/resource/resourcedirectory/cors';
        var configItem = resourceConfig[1];
        req.app.config = {};
        req.app.config.externalProtocol = 'hppt';
        var res = {};
        res.type = function(type) {
            expect(type).to.equal('application/json');
            return this;
        };
        res.rdkSend = function(resourceDirectory) {
            expect(resourceDirectory).to.be.an.object();
            expect(resourceDirectory.link[0].href).to.startWith('hppt');
            expect(resourceDirectory.link[0].href).not.to.startWith('/');
            done();
        };
        configItem.get(req, res);
    });
});
