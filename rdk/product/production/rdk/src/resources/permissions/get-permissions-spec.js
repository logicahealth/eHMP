'use strict';

var _ = require('lodash');
var nock = require('nock');
var httpMocks = require('node-mocks-http');
var getPermissions = require('./get-permissions');
var testData = require('./permissions-test-data.json');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'get-permissions'
}));

var permissions = {
    items: testData.permissions
};

describe('Get Permissions', function() {
    var req;
    var res;

    beforeEach(function() {
        req = httpMocks.createRequest({
            method: 'PUT',
            url: 'resource/permission-sets/edit'
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

    it('returns data successfully', function(done) {
        nock('http://IP             ')
            .get('/permission/?filter=eq(%22status%22%2C%22active%22)')
            .reply(200, permissions);

        res.rdkSend = function(response) {
            expect(_.size(response)).to.be(2);
            expect(_.get(response, [0, 'uid'])).to.match(/one-solo-per-song/);
            expect(_.get(response, [1, 'uid'])).to.match(/fills-as-needed/);
            done();
        };

        getPermissions(req, res);
    });

    it('returns an error when an error occurs', function(done) {
        nock('http://IP             ')
            .get('/permission/?filter=eq(%22status%22%2C%22active%22)')
            .replyWithError('Sometimes the servers are angry');

        res.rdkSend = function(response) {
            expect(response).to.match(/Error/);
            done();
        };

        getPermissions(req, res);
    });
});
