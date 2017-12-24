'use strict';
var _ = require('lodash');
var httpMocks = require('node-mocks-http');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'jdsUserData'
}));
var jdsUserData = require('./jds-user-data');

describe('JDS User Data module', function() {
    var req;
    var res;
    var cb;
    var getStub;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/authenticate'
        });
        req.logger = logger;
        _.set(req, ['audit', 'sensitive'], false);
        _.set(req, ['session', 'user', ], {});
        _.set(req, ['_resourceConfigItem', 'permissions'], []);
        _.set(req, 'app.config.jdsServer.basePath', '/jdsbase');

        cb = sinon.spy();
        getStub = sinon.stub(require('../../../core/rdk').utils.http, 'get');
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        cb.reset();
        getStub.reset();
        done();
    });

    it('just makes the callback early with error status code and message if the duz is blank', function() {
        var data = {
            duz: {
                'C778': '14563'
            }
        };
        var params = {
            site: 'SITE',
            data: data
        };
        jdsUserData(req, res, cb, params);
        expect(cb.called).to.be.true();
        expect(cb.getCall(0).args[0].code).match(/201.412.1001/);
        expect(cb.getCall(0).args[1]).not.to.be(data);
    });
    it('just makes the callback early with error status code and message if the site is blank', function() {
        var data = {
            duz: {
                'C778': '14563'
            }
        };
        var params = {
            site: '',
            data: data
        };
        jdsUserData(req, res, cb, params);
        expect(cb.called).to.be.true();
        expect(cb.getCall(0).args[0].code).match(/201.412.1001/);
        expect(cb.getCall(0).args[1]).not.to.be(data);
    });
    it('makes the callback with error information if an error is returned from JDS', function() {
        var data = {
            duz: {
                'SITE': '14563'
            }
        };
        var params = {
            site: 'SITE',
            data: data
        };
        getStub.callsArgWith(1, new Error('This is just an error'), null, null);
        jdsUserData(req, res, cb, params);
        expect(cb.called).to.be.true();
        expect(cb.getCall(0).args[0].code).match(/201.401.1001/);
        expect(cb.getCall(0).args[1]).to.be.null();
    });
    it('makes the callback with user information if a user is returned from JDS', function() {
        var data = {
            duz: {
                'SITE': '14563'
            }
        };
        var params = {
            site: 'SITE',
            data: data
        };
        var body = {
            ssn: '563967858',
            title: 'Faker',
            uid: 'urn:va:user:SITE:14563',
            firstname: 'Arcane',
            lastname: 'Trickster'
        };
        var response = {
            status: 200,
            body: body
        };
        getStub.callsArgWith(1, null, response, body);
        jdsUserData(req, res, cb, params);
        expect(cb.called).to.be.true();
        expect(cb.getCall(0).args[0]).to.be.null();
        expect(cb.getCall(0).args[1]).to.have.keys(['ssn', 'title', 'firstname', 'lastname', 'uid']);
    });
});