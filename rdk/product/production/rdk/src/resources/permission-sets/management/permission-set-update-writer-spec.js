'use strict';

var updatePermissionSet = require('./permission-set-update-writer');
var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');

var req, res;
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'permission-sets'
}));

beforeEach(function() {
    req = httpMocks.createRequest({
        method: 'PUT',
        url: 'resource/permission-sets',
        session: {
            user: {
                site: 'SITE',
                duz: {
                    'SITE': '1234'
                }
            }
        }
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

describe('Update permission sets', function() {
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
            expect(body).to.equal('uid is a required parameter');
            done();
        };
        updatePermissionSet(req, res);
    });

    it('fails when pjds permission set retrieval fails', function(done) {
        var requestBody = {
            uid: '1234',
            label: 'Test permission set',
            status: 'active',
            version: '1.1.1',
            'sub-sets': [],
            addPermissions: ['add-vital'],
            description: 'A test description'
        };

        _.set(req, 'body', requestBody);

        nock('http://IP             ')
            .get('/permset/1234')
            .reply(404, 'could not find object');

        res.status = function(statusCode) {
            expect(statusCode).to.equal(404);
            return this;
        };
        res.rdkSend = function(response) {
            expect(response.statusCode).to.equal(404);
            done();
        };

        updatePermissionSet(req, res);
    });

    it('fails when individual permission retrieval fails', function(done) {
        var requestBody = {
            uid: '1234',
            label: 'Test permission set',
            status: 'active',
            version: '1.1.1',
            'sub-sets': [],
            addPermissions: ['add-vital'],
            removePermissions: ['read-vital'],
            description: 'A test description',
            note: 'Test note',
            example: 'Test example',
            nationalAccess: true
        };

        _.set(req, 'body', requestBody);

        var existingSet = {
            uid: '1234',
            label: 'Test permission',
            status: 'inactive',
            version: {
                deprecated: null,
                introduced: '1.1.1'
            },
            'sub-sets': ['Category 1'],
            permissions: ['read-vital']
        };

        nock('http://IP             ')
            .get('/permset/1234')
            .reply(200, existingSet);

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

        updatePermissionSet(req, res);
    });

    it('sends back successful response with valid request', function(done) {
        var requestBody = {
            uid: '1234',
            label: 'Test permission set',
            status: 'active',
            version: '1.1.1',
            'sub-sets': [],
            addPermissions: ['add-vital'],
            removePermissions: ['read-vital'],
            description: 'A test description',
            note: 'Test note',
            example: 'Test example',
            nationalAccess: true
        };

        _.set(req, 'body', requestBody);

        var existingSet = {
            uid: '1234',
            label: 'Test permission',
            status: 'inactive',
            version: {
                deprecated: null,
                introduced: '1.1.1'
            },
            'sub-sets': ['Category 1'],
            permissions: ['read-vital']
        };

        nock('http://IP             ')
            .get('/permset/1234')
            .reply(200, existingSet);

        var updateSet = {
            uid: '1234',
            label: 'Test permission set',
            status: 'active',
            version: {
                deprecated: null,
                introduced: '1.1.1'
            },
            'sub-sets': [],
            permissions: ['add-vital'],
            lastUpdatedUid: 'urn:va:user:SITE:1234',
            lastUpdatedDateTime: '',
            description: 'A test description',
            example: 'Test example',
            note: 'Test note',
            nationalAccess: true
        };

        nock('http://IP             ')
                .get('/permission/?filter=eq(%22nationalAccess%22%2C%22true%22)')
                .reply(200, {
                    items: [{
                        uid: 'add-vital',
                        nationalAccess: true
                    }]
                });

        nock('http://IP             ')
            .put('/permset/1234', function(value) {
                // Update the date/time so it matches correctly
                updateSet.lastUpdatedDateTime = value.lastUpdatedDateTime;
                return _.isEqual(updateSet, value);
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

        updatePermissionSet(req, res);
    });

});

describe('Deprecate permission sets', function() {
    it('fails when validation fails', function(done) {
        var body = {
            deprecate: true,
            uid: '1234'
        };
        _.set(req, 'body', body);

        res.status = function(statusCode) {
            expect(statusCode).to.equal(400);
            return this;
        };
        res.rdkSend = function(body) {
            expect(body).to.equal('deprecatedVersion is a required parameter');
            done();
        };
        updatePermissionSet(req, res);
    });

    it('fails when pjds permission set retrieval fails', function(done) {
        var requestBody = {
            uid: '1234',
            deprecate: true,
            deprecatedVersion: '1.1.1'
        };

        _.set(req, 'body', requestBody);

        nock('http://IP             ')
            .get('/permset/1234')
            .reply(404, 'could not find object');

        res.status = function(statusCode) {
            expect(statusCode).to.equal(404);
            return this;
        };
        res.rdkSend = function(response) {
            expect(response.statusCode).to.equal(404);
            done();
        };

        updatePermissionSet(req, res);
    });

    it('sends back successful response with valid request', function(done) {
        var requestBody = {
            uid: '1234',
            deprecate: true,
            deprecatedVersion: '9.9.9'
        };

        _.set(req, 'body', requestBody);

        var existingSet = {
            uid: '1234',
            label: 'Test permission',
            status: 'inactive',
            version: {
                deprecated: null,
                introduced: '1.1.1'
            },
            permissions: []
        };

        nock('http://IP             ')
            .get('/permset/1234')
            .reply(200, existingSet);

        nock('http://IP             ')
            .put('/permset/1234', function(value) {
                return _.isEqual('9.9.9', _.get(value, 'version.deprecated'));
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

        updatePermissionSet(req, res);
    });

});
