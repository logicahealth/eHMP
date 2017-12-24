'use strict';
var patientProfile = require('./patient-profile-service');
var _ = require('lodash');
var bunyan = require('bunyan');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var videoVisitUtils = require('./utils');
var async = require('async');

describe('Patient Profile Service', function() {
    var logger = sinon.stub(bunyan.createLogger({
        name: 'test-logger'
    }));
    it('Processes a GET request', function() {
        var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(config, callback) {
            var httpResponse = {};
            httpResponse.statusCode = 200;
            var body = 'get response body';
            return callback(null, httpResponse, body);
        });
        var req = {
            body: {
                pid: 'SITE;3'
            }
        };
        var id = {
            type: 'sample',
            value: 'sample2'
        };
        _.set(req, 'logger', logger);
        _.set(req, 'session.user.division', 'SITE');
        _.set(req, 'app.config.videoVisit.pvPatientProfileService', {
            baseURL: 'sampleBaseURL'
        });

        patientProfile.processRequest(req, id, 'get', function(err, response, data) {
            expect(err).to.be.null();
            expect(response).to.eql({
                statusCode: 200
            });
            expect(data).to.eql('get response body');
        });
        httpStub.restore();
    });
    it('Processes a PUT request', function() {
        var httpPutStub = sinon.stub(httpUtil, 'put').callsFake(function(config, callback) {
            var httpResponse = {};
            httpResponse.statusCode = 200;
            var body = 'get response body';
            return callback(null, httpResponse, body);
        });
        var req = {
            body: {
                _id: '123'
            },
            param: function(param) {
                return null;
            }
        };
        var id = {
            type: 'sample',
            value: 'sample2'
        };
        _.set(req, 'logger', logger);
        _.set(req, 'session.user.division', 'SITE');
        _.set(req, 'app.config.videoVisit.pvPatientProfileService', {
            baseURL: 'sampleBaseURL'
        });

        patientProfile.processRequest(req, id, 'put', function(err, response, data) {
            expect(err).to.be.null();
            expect(response).to.eql({
                statusCode: 200
            });
            expect(data).to.eql('get response body');
        });
        httpPutStub.restore();
    });
    it('returns patient profile service results', function() {
        var asyncStub = sinon.stub(async, 'waterfall').callsFake(function(functions, callback) {
            return callback(null, 'response', 'results');
        });
        var utilStub = sinon.stub(videoVisitUtils, 'buildResponse').callsFake(function(req, res, err, response, result, errorCode) {
            return res.rdkSend({
                data: {
                    items: [1, 2, 3]
                }
            });
        });
        var req = {
            body: {
                pid: 'SITE;3'
            },
            param: function(param) {
                return null;
            }
        };
        _.set(req, 'logger', logger);
        var res = {
            rdkSend: function(body) {
                expect(body).to.eql({
                    data: {
                        items: [1, 2, 3]
                    }
                });
                return this;
            }
        };

        patientProfile.invokePatientProfileServiceResource(req, res, 'get');
        asyncStub.restore();
        utilStub.restore();
    });
});
