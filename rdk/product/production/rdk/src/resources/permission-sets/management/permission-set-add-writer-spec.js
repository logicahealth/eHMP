'use strict';

var createPermissionSet = require('./permission-set-add-writer');
var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');

describe('Create permission sets', function() {
    var req, res;
    var logger = sinon.stub(require('bunyan').createLogger({
        name: 'add-permission-sets'
    }));
    beforeEach(function() {
        req = httpMocks.createRequest({
            method: 'POST',
            url: 'resource/permission-sets'
        });
        _.set(req, 'app.config.generalPurposeJdsServer', {
            baseUrl: 'http://IP             ',
            urlLengthLimit: 120
        });
        _.set(req, 'audit', {});
        _.set(req, 'logger', logger);
        res = httpMocks.createResponse();
    });

    afterEach(function() {
        nock.cleanAll();
    });

    it('fails when validation fails', function(done) {
        var body = {
            label: 'Test permission set'
        };
        _.set(req, 'body', body);

        res.status = function(statusCode) {
            expect(statusCode).to.equal(400);
            return this;
        };
        res.rdkSend = function(body) {
            expect(body).to.equal('status is a required parameter');
            done();
        };
        createPermissionSet(req, res);
    });

    it('fails when pjds permission lookup fails', function(done) {
        var requestBody = {
            label: 'Test permission set',
            status: 'active',
            version: '1.7.3',
            description: 'Test description',
            'sub-sets': ['Test category'],
            permissions: ['add-vital', 'read-vital']
        };

        _.set(req, 'body', requestBody);

        nock('http://IP             ')
            .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
            .reply(500, 'Failed to retrieve permissions');

        res.status = function(statusCode) {
            expect(statusCode).to.equal(500);
            return this;
        };

        res.rdkSend = function(response) {
            done();
        };
        createPermissionSet(req, res);
    });

    it('fails when pjds post fails', function(done) {
        var requestBody = {
            label: 'Test permission set',
            status: 'active',
            version: '1.7.3',
            description: 'Test description',
            'sub-sets': ['Test category'],
            permissions: ['add-vital', 'read-vital']
        };

        _.set(req, 'body', requestBody);

        nock('http://IP             ')
            .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
            .reply(200, {
                items: []
            });

        nock('http://IP             ')
            .put('/permset/')
            .reply(500, 'Failed to save to pjds');

        res.status = function(statusCode) {
            expect(statusCode).to.equal(500);
            return this;
        };
        res.rdkSend = function(response) {
            expect(response.status).to.equal(500);
            done();
        };

        createPermissionSet(req, res);
    });

    it('sends back success when saved', function(done) {
        var requestBody = {
            label: 'Test permission set',
            status: 'active',
            version: '1.7.3',
            description: 'Test description',
            'sub-sets': ['Test category'],
            permissions: ['add-vital', 'read-vital']
        };

        _.set(req, 'body', requestBody);

        nock('http://IP             ')
            .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
            .reply(200, {
                items: [{
                    uid: 'add-vital'
                }]
            });

        nock('http://IP             ')
            .put('/permset/')
            .reply(201, {}, { location: 'http://IP             /permset/urn:va:permset:1234' });

        res.status = function(statusCode) {
            expect(statusCode).to.equal(201);
            return this;
        };
        res.rdkSend = function(response) {
            expect(response.uid).to.equal('urn:va:permset:1234');
            done();
        };

        createPermissionSet(req, res);
    });
});
