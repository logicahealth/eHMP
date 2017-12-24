'use strict';
var _ = require('lodash');
var httpMocks = require('node-mocks-http');
var patientSearchUtil = require('./patient-search-util');
var searchMaskSsn = require('./search-mask-ssn');
var last5 = require('./last5');
var last5Data = require('./last5-spec-data');

describe('Last5 Search Resource', function() {
    describe('performPatientLast5Search', function() {
        var req = {};
        var res = {};
        var callPatientSearch;
        var getLoc;
        var TEST_SITE = 'SITE';
        beforeEach(function() {
            req = httpMocks.createRequest();
            req.logger = sinon.stub(require('bunyan').createLogger({
                name: 'last5-spec.js'
            }));
            _.set(req, 'audit', {});
            _.set(req, 'session._id', 'opiuy243qyhsddasfop87asg');
            _.set(req, 'app.config.jdsServer', {});

            _.set(req, 'session.user.consumerType', 'user');

            callPatientSearch = sinon.stub(patientSearchUtil, 'callPatientSearch');
            getLoc = sinon.stub(searchMaskSsn, 'getLoc');

            res = httpMocks.createResponse();
            res.rdkSend = sinon.spy();
        });
        afterEach(function() {
            res.rdkSend.reset();
            callPatientSearch.restore();
            getLoc.restore();
            req = {};
            res = {};
        });
        it('errors when the site is missing from params.site & user.site', function() {
            last5(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1003/);
        });
        it('errors when the site is null', function() {
            _.set(req, 'session.user.site', null);
            _.set(req, 'params.site', null);
            last5(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1003/);
        });
        it('errors when the last5 param is not set', function() {
            _.set(req, 'params.site', TEST_SITE);
            last5(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1005/);
        });
        it('returns empty when the last5 param is not properly alphanumeric', function() {
            _.set(req, 'params.site', TEST_SITE);
            _.set(req, 'params.last5', '420N0');
            last5(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].data).to.have.property('items');
            expect(res.rdkSend.getCall(0).args[0].data.items).to.be.empty();
        });
        it('passes the error on when the internal call errors', function() {
            _.set(req, 'params.site', TEST_SITE);
            _.set(req, 'params.last5', last5Data.OOSixOEight.searchString);
            callPatientSearch.callsArgWith(4, new Error('testing'), null);
            last5(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0]).match(/testing/);
        });
        it('returns proper data', function() {
            _.set(req, 'params.site', TEST_SITE);
            _.set(req, 'params.last5', last5Data.OOSixOEight.searchString);
            callPatientSearch.callsArgWith(4, null, last5Data.OOSixOEight.filteredResourceResponse);
            getLoc.callsArgWith(2, null, last5Data.OOSixOEight.getLocResourceResponse);
            last5(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0]).to.be.an(Object);
            expect(_.get(res.rdkSend.getCall(0).args[0], ['data', 'items', 0, 'last4'])).to.be(last5Data.OOSixOEight.searchString.substr(1));
        });
    });
});
