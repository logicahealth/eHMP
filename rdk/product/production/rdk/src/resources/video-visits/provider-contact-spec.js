'use strict';
var providerContact = require('./provider-contact');
var _ = require('lodash');
var bunyan = require('bunyan');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;

describe('Provider Contact', function() {
    var logger = sinon.stub(bunyan.createLogger({
        name: 'test-logger'
    }));
    var req;
    beforeEach(function() {
        req = {
            body: {
                pid: 'SITE;3'
            },
            param: function(param) {
                return null;
            },
            audit: {
                dataDomain: null,
                logCategory: null
            }
        };
        _.set(req, 'logger', logger);
        _.set(req, 'session.user.division', '500');
        _.set(req, 'session.user.duz', 'SITE');
        _.set(req, 'session.user.site', 'SITE');
        _.set(req, 'app.config.videoVisit.vvService', {
            baseURL: 'sampleBaseURL'
        });
    });
    it('Processes a GET request', function() {
        var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(config, callback) {
            var httpResponse = {};
            httpResponse.statusCode = 200;
            var body = 1;
            return callback(null, httpResponse, body);
        });
        var res = {
            rdkSend: function(body) {
                expect(body).to.eql({
                    data: {
                        items: [1]
                    }
                });
                return this;
            }
        };

        providerContact.getProviderContactInfo(req, res);
        expect(req.audit.logCategory).to.eql('GET_PROVIDER_CONTACT');
        httpStub.restore();
    });
    it('post Provider Contact Info', function() {
        var httpStub = sinon.stub(httpUtil, 'post').callsFake(function(config, callback) {
            var httpResponse = {};
            httpResponse.statusCode = 200;
            var body = 'post response';
            return callback(null, httpResponse, body);
        });
        var res = {
            rdkSend: function(body) {
                expect(body).to.eql({
                    data: {
                        items: ['post response']
                    }
                });
                return this;
            }
        };
        providerContact.createProviderContactInfo(req, res);
        expect(req.audit.logCategory).to.eql('CREATE_PROVIDER_CONTACT');
        httpStub.restore();
    });
    it('put Provider Contact Info', function() {
        var httpStub = sinon.stub(httpUtil, 'put').callsFake(function(config, callback) {
            var httpResponse = {};
            httpResponse.statusCode = 200;
            var body = 'put response';
            return callback(null, httpResponse, body);
        });

        var res = {
            rdkSend: function(body) {
                expect(body).to.eql({
                    data: {
                        items: ['put response']
                    }
                });
                return this;
            }
        };

        providerContact.updateProviderContactInfo(req, res);
        expect(req.audit.logCategory).to.eql('UPDATE_PROVIDER_CONTACT');
        httpStub.restore();
    });
    it('delete Provider Contact Info', function() {
        var httpStub = sinon.stub(httpUtil, 'delete').callsFake(function(config, callback) {
            var httpResponse = {};
            httpResponse.statusCode = 200;
            var body = 'delete response';
            return callback(null, httpResponse, body);
        });

        var res = {
            rdkSend: function(body) {
                expect(body).to.eql({
                    data: {
                        items: ['delete response']
                    }
                });
                return this;
            }
        };

        providerContact.deleteProviderContactInfo(req, res);
        expect(req.audit.logCategory).to.eql('DELETE_PROVIDER_CONTACT');
        httpStub.restore();
    });

});
