'use strict';
var _ = require('lodash');
var httpMocks = require('node-mocks-http');
var patientSearchUtil = require('./patient-search-util');
var searchMaskSsn = require('./search-mask-ssn');
var fullName = require('./full-name');
var fullNameData = require('./full-name-spec-data');

describe('Full Name Search Resource', function() {
    describe('jdsNameWorkaround', function() {
        var testOutput;
        beforeEach(function() {
            testOutput = 'Kung,Fu';
        });
        it('removes whitespace before and after a fullName input', function() {
            var name = fullName._jdsNameWorkaround('   ' + testOutput + '   ');
            expect(name).to.be.equal(testOutput);
        });
        it('removes whitespace after a comma for a fullName input', function() {
            var name = fullName._jdsNameWorkaround('Kung, Fu');
            expect(name).to.be.equal(testOutput);
        });
        it('removes asterisks in a fullName input', function() {
            var name = fullName._jdsNameWorkaround('*' + testOutput + '*');
            expect(name).to.be.equal(testOutput);
        });
    });

    describe('performPatientSearch', function() {
        var req = {};
        var res = {};
        var callPatientSearch;
        var getLoc;
        var TEST_SITE = 'SITE';
        beforeEach(function() {
            req = httpMocks.createRequest();
            req.logger = sinon.stub(require('bunyan').createLogger({
                name: 'full-name-spec.js'
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
            fullName(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1003/);
        });
        it('errors when the site is null', function() {
            _.set(req, 'session.user.site', null);
            _.set(req, 'params.site', null);
            fullName(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1003/);
        });
        it('errors when the full.name param is not set', function() {
            _.set(req, 'params.site', TEST_SITE);
            fullName(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0].code).match(/200.400.1004/);
        });
        it('passes the error on when the internal call errors', function() {
            _.set(req, 'params.site', TEST_SITE);
            _.set(req, 'params.[\'name.full\']', fullNameData.eightCommaO.searchString);
            callPatientSearch.callsArgWith(4, new Error('testing'), null);
            fullName(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0]).match(/testing/);
        });
        it('returns proper data', function() {
            _.set(req, 'params.site', TEST_SITE);
            _.set(req, 'params.[\'name.full\']', fullNameData.eightCommaO.searchString);
            callPatientSearch.callsArgWith(4, null, fullNameData.eightCommaO.filteredResourceResponse);
            getLoc.callsArgWith(2, null, fullNameData.eightCommaO.finalResourceResponse);
            fullName(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.getCall(0).args[0]).to.be.an(Object);
            expect(_.get(res.rdkSend.getCall(0).args[0], ['data', 'items', 0, 'fullName'])).to.match(new RegExp(fullNameData.eightCommaO.searchString, 'ig'));
        });
        it('sends a "No results found. Verify search criteria" message on empty results', function() {
            var emptyItems = {
                data: {
                    items: []
                }
            };
            _.set(req, 'params.site', TEST_SITE);
            _.set(req, ['params', 'name.full'], 'asdfasdfasdf');
            callPatientSearch.callsArgWith(4, null, emptyItems);
            getLoc.callsArgWith(2, null, emptyItems);
            fullName(req, res);
            expect(res.rdkSend.called).to.be.true();
            expect(res.rdkSend.calledWith({
                message: sinon.match(/No results found. Verify search criteria./),
                data: {
                    items: []
                }
            })).to.be.true();
        });
    });
});
