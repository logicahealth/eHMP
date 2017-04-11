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
        expect(resourceConfig).to.have.length(1);
        expect(resourceConfig[0].name).to.equal('resource-directory');
        expect(resourceConfig[0].path).to.equal('');
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
});
