'use strict';

var editPermissions = require('./permission-set-edit-permissions');
var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');

describe('Bulk add and remove permissions to sets ', function() {
    var req, res;
    var logger = sinon.stub(require('bunyan').createLogger({
        name: 'permission-sets'
    }));

    beforeEach(function() {
        req = httpMocks.createRequest({
            method: 'PUT',
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
            addSets: [],
            removeSets: []
        };
        _.set(req, 'body', body);

        res.status = function(statusCode) {
            expect(statusCode).to.equal(400);
            return this;
        };
        res.rdkSend = function(body) {
            expect(body).to.equal('permission is a required parameter');
            done();
        };
        editPermissions(req, res);
    });

    it('fails when permission set retrieval errors', function(done) {
        var requestBody = {
            permission: 'test-permission',
            addSets: ['1234']
        };

        _.set(req, 'body', requestBody);

        nock('http://IP             ')
            .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
            .reply(200, {
                items: []
            });

        nock('http://IP             ')
            .get('/permset/1234')
            .reply(404, 'could not find object');

        res.status = function(statusCode) {
            expect(statusCode).to.equal(400);
            return this;
        };
        res.rdkSend = function(response) {
            expect(response).to.equal('Failed to find permission set with uid: 1234');
            done();
        };

        editPermissions(req, res);
    });

    it('fails when individual permission lookup fails' ,function(done) {
        var requestBody = {
            permission: 'test-permission',
            addSets: ['1234']
        };

            _.set(req, 'body', requestBody);

            nock('http://IP             ')
                .get('/permset/1234')
                .reply(200, {
                    uid: '1234',
                    label: 'Test set 1234',
                    permissions: ['add-vital']
                });

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

        editPermissions(req, res);
    });

    it('sends back successful response with valid request', function(done) {
        var requestBody = {
            permission: 'test-permission',
            addSets: ['1234', '1111'],
            removeSets: ['5678']
        };

        _.set(req, 'body', requestBody);

        nock('http://IP             ')
            .get('/permset/1234')
            .reply(200, {
                uid: '1234',
                label: 'Test set 1234',
                permissions: ['add-vital']
            });

        nock('http://IP             ')
            .get('/permset/1111')
            .reply(200, {
                uid: '1111',
                label: 'Test set 1111',
                permissions: ['read-condition']
            });

        nock('http://IP             ')
            .get('/permset/5678')
            .reply(200, {
                uid: '1111',
                label: 'Test set 5678',
                permissions: ['read-condition', 'test-permission']
            });

        nock('http://IP             ')
            .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
            .reply(200, {
                items: [{
                    uid: 'test-permission',
                    nationalAccess: true
                }]
            });

        nock('http://IP             ')
            .put('/permset/1234', function(value) {
                console.log(value);
                return _.isEqual(['add-vital', 'test-permission'], value.permissions) && value.nationalAccess;
            })
            .reply(200, 'success');

        nock('http://IP             ')
            .put('/permset/1111', function(value) {
                console.log(value);
                return _.isEqual(['read-condition', 'test-permission'], value.permissions) && value.nationalAccess;
            })
            .reply(200, 'success');

        nock('http://IP             ')
            .put('/permset/5678', function(value) {
                console.log(value);
                return _.isEqual(['read-condition'], value.permissions);
            })
            .reply(200, 'success');

        res.status = function(statusCode) {
            expect(statusCode).to.equal(200);
            return this;
        };
        res.rdkSend = function(response) {
            expect(response).to.be.undefined();
            done();
        };

        editPermissions(req, res);
    });

});
