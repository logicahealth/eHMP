'use strict';

var _ = require('lodash');
var getEhmpUserContext = require('./get-recent-patients');
var bunyan = require('bunyan');
var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;

describe('getEhmpUserContext', function() {
    var req;
    var res;
    beforeEach(function() {
        res = {};
        req = {};
        req.logger = sinon.stub(bunyan.createLogger({name: 'get-recent-patients-spec'}));
        _.set(req, 'session.user.uid', 'urn:va:user:12345');
    });
    it('ensures that a uid is on the session', function(done) {
        delete req.session.user.uid;
        res.status = function(status) {
            expect(status).to.equal(400);
            return this;
        };
        res.rdkSend = function rdkSend(body) {
            expect(body).to.match(/Missing uid/);
            done();
        };
        getEhmpUserContext(req, res);
    });
    it('handles pjds errors', function(done) {
        sinon.stub(pjds, 'get', function(req, res, pjdsOptions, callback) {
            return callback(new Error('unit test error'));
        });
        res.status = function(status) {
            expect(status).to.equal(500);
            return this;
        };
        res.rdkSend = function rdkSend(body) {
            expect(body).to.equal('unit test error');
            done();
        };
        getEhmpUserContext(req, res);
    });
    it('includes an empty data array when no results are found in pJDS', function(done) {
        var pjdsResponse = {
            data: {
                eHMPUIContext: []
            },
            statusCode: 200
        };
        sinon.stub(pjds, 'get', function(req, res, pjdsOptions, callback) {
            return callback(null, pjdsResponse);
        });
        res.status = function(status) {
            expect(status).to.equal(200);
            return this;
        };
        res.rdkSend = function rdkSend(body) {
            expect(body).to.eql({
                message: 'No results found.',
                data: []
            });
            done();
        };
        getEhmpUserContext(req, res);
    });
});
