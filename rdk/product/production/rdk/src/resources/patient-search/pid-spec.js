'use strict';
var _ = require('lodash');
var httpMocks = require('node-mocks-http');
var pid = require('./pid');
var TEST_SITE = '9E7A';
var INVALID_PID = 'N0T!T';
var ICN = '5000000116V912836';

describe('Pid Search Resource', function() {
    describe('performPatientSearch', function() {
        var req = {};
        var res = {};
        beforeEach(function() {
            req = httpMocks.createRequest();
            req.logger = sinon.stub(require('bunyan').createLogger({
                name: 'pid-spec.js'
            }));
            _.set(req, 'audit', {});
            _.set(req, 'session._id', 'opiuy243qyhsddasfop87asg');
            _.set(req, 'app.config.jdsServer', {});

            _.set(req, 'session.user.consumerType', 'user');

            res = httpMocks.createResponse();
            res.rdkSend = sinon.spy();
        });
        afterEach(function() {
            res.rdkSend.reset();
            req = {};
            res = {};
        });
        it('errors when the pid param is not set', function() {
            pid.performPatientSearch(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1006/);
        });
        it('errors when the pid param is not properly formatted', function() {
            _.set(req, 'params.pid', INVALID_PID);
            _.set(req, 'session.user.site', TEST_SITE);
            _.set(req, 'params.site', TEST_SITE);
            pid.performPatientSearch(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1007/);
        });
        it('errors when the site is missing from params.site & user.site', function() {
            _.set(req, 'params.pid', ICN); //required to get past the pid check but can't be a siteHashDfn
            pid.performPatientSearch(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1003/);
        });
        it('errors when the site is null', function() {
            _.set(req, 'params.pid', ICN); //required to get past the pid check but can't be a siteHashDfn
            _.set(req, 'session.user.site', null);
            _.set(req, 'params.site', null);
            pid.performPatientSearch(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1003/);
        });
    });

    describe('performPatientSearchWithCallBack', function() {
        var req = {};
        var res = {};
        beforeEach(function() {
            req = httpMocks.createRequest();
            req.logger = sinon.stub(require('bunyan').createLogger({
                name: 'pid-spec.js'
            }));
            _.set(req, 'audit', {});
            _.set(req, 'session._id', 'opiuy243qyhsddasfop87asg');
            _.set(req, 'app.config.jdsServer', {});

            _.set(req, 'session.user.consumerType', 'user');

            res = httpMocks.createResponse();
            res.rdkSend = sinon.spy();
        });
        afterEach(function() {
            res.rdkSend.reset();
            req = {};
            res = {};
        });
        it('errors when the pid param is not set', function() {
            _.set(req, 'session.user.site', TEST_SITE);
            _.set(req, 'params.site', TEST_SITE);
            pid.performPatientSearchWithCallback(req, res, undefined, undefined, false);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1006/);
        });
        it('errors when the pid param is not properly formatted', function() {
            _.set(req, 'session.user.site', TEST_SITE);
            _.set(req, 'params.site', TEST_SITE);
            pid.performPatientSearchWithCallback(req, res, INVALID_PID, undefined, false);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1007/);
        });
        it('errors when the site is missing from params.site & user.site', function() {
            pid.performPatientSearchWithCallback(req, res, ICN, undefined, false);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1003/);
        });
        it('errors when the site is null', function() {
            _.set(req, 'session.user.site', null);
            _.set(req, 'params.site', null);
            pid.performPatientSearchWithCallback(req, res, ICN, undefined, false);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1003/);
        });
    });
});
