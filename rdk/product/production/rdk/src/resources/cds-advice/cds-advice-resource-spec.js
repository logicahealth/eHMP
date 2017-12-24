'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var cdsAdviceResource = require('./cds-advice-resource');
var cdsAdviceList = require('./get-cds-advice-list');
var async = require('async');

var cdsAdviceDetail = require('./get-cds-advice-detail');
var RpcClient = require('vista-js').RpcClient;

var cdsWorkProduct = require('../cds-work-product/cds-work-product');

var mockReqResUtil = (function() {
    var logger = {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {},
        fatal: function() {}
    };

    var res = {
        status: function() {
            return this;
        },
        rdkSend: function() {
            return this;
        },
        end: function() {
            return this;
        }
    };

    function createReqWithParam(map) {
        map = map || {};
        var req = {
            param: (function param(map, name, defaultValue) {
                if (_.has(map, name)) {
                    return map[name] !== null ? String(map[name]) : null;
                }

                if (defaultValue !== undefined && defaultValue !== null) {
                    String(defaultValue);
                }

                return defaultValue;
            }).bind(null, map),

            query: map,
            logger: logger,
            audit: {},
            app: {
                config: {
                    rpcConfig: {
                        context: 'HMP UI CONTEXT',
                        siteHash: 'SITE'
                    },
                    vistaSites: {}
                }
            },
            session: {
                user: {
                    site: 'SITE'
                }
            },
            interceptorResults: {
                patientIdentifiers: {
                    dfn: '3',
                    icn: '1000V1065',
                    siteDfn: 'SITE;3',
                    site: 'SITE'
                }
            }
        };
        return req;
    }

    return {
        createRequestWithParam: createReqWithParam,
        response: res
    };
})();

describe('CDS Advice Resource', function() {
    var resources = cdsAdviceResource.getResourceConfig();

    var res = mockReqResUtil.response;

    beforeEach(function() {
        sinon.spy(res, 'status');
        sinon.spy(res, 'rdkSend');
    });

    it('has three endpoints configured', function() {
        expect(resources.length).to.equal(3);
    });

    it('has correct configuration for \'list\' endpoint', function() {
        var r = resources[0];
        expect(r.name).to.equal('cds-advice-list');
        expect(r.path).to.equal('/list');
    });

    it('has correct configuration for \'detail\' endpoint', function() {
        var r = resources[1];
        expect(r.name).to.equal('cds-advice-detail');
        expect(r.path).to.equal('/detail');
        expect(r.get).not.to.be.undefined();
    });
    it('has correct configuration for \'readStatus\' endpoint', function() {
        var r = resources[2];
        expect(r.name).to.equal('cds-advice-read-status');
        expect(r.path).to.equal('/read-status');
        expect(r.put).not.to.be.undefined();
    });

    describe('List endpoint HTTP response codes', function() {
        it('responds HTTP Bad Request when required parameters are missing', function() {
            sinon.stub(async, 'parallel').callsFake(function(fcnArray, callback) {
                callback(null, [
                    [], // cds advice mock empty results
                    [], // clinical reminders mock empty results
                    [] // cds work products mock empty results
                ]);
            });

            cdsAdviceList.getCDSAdviceList(mockReqResUtil.createRequestWithParam({}), res); // missing pid and use params
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            cdsAdviceList.getCDSAdviceList(mockReqResUtil.createRequestWithParam({
                pid: 'SITE;3'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            cdsAdviceList.getCDSAdviceList(mockReqResUtil.createRequestWithParam({
                use: 'someUse'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            cdsAdviceList.getCDSAdviceList(mockReqResUtil.createRequestWithParam({
                pid: 'SITE;3',
                use: 'someUse'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();
        });
    });

    describe('Clinical Reminders List response handling', function() {

        it('responds with empty array to callback when required patient site parameter is missing', function() {
            var callback = function(error, result) {
                expect(error).to.be.null();
                expect(result).to.be.empty();
            };
            var req = mockReqResUtil.createRequestWithParam({});
            req.interceptorResults.patientIdentifiers.site = undefined;
            cdsAdviceList._getClinicalRemindersList(req, res, callback);
        });

        it('responds with empty array to callback when required patient dfn parameter is missing', function() {
            var callback = function(error, result) {
                expect(error).to.be.null();
                expect(result).to.be.empty();
            };
            var req = mockReqResUtil.createRequestWithParam({});
            req.interceptorResults.patientIdentifiers.dfn = undefined;
            cdsAdviceList._getClinicalRemindersList(req, res, callback);
        });
    });

    describe('Detail endpoint HTTP response codes', function() {
        it('responds HTTP Not Found if DFN is empty', function() {
            var req = mockReqResUtil.createRequestWithParam({
                pid: 'SITE;3',
                use: 'someUse',
                id: 'someAdviceId'
            });
            req.interceptorResults.patientIdentifiers.dfn = undefined;
            cdsAdviceDetail.getCDSAdviceDetail(req, res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });

        it('responds HTTP Not Found if Patient Site is empty', function() {
            var req = mockReqResUtil.createRequestWithParam({
                pid: 'SITE;3',
                use: 'someUse',
                id: 'someAdviceId'
            });
            req.interceptorResults.patientIdentifiers.site = undefined;
            cdsAdviceDetail.getCDSAdviceDetail(req, res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });

        it('responds HTTP Not Found if Patient Identifiers is empty', function() {
            var req = mockReqResUtil.createRequestWithParam({
                pid: 'SITE;3',
                use: 'someUse',
                id: 'someAdviceId'
            });
            req.interceptorResults.patientIdentifiers = undefined;
            cdsAdviceDetail.getCDSAdviceDetail(req, res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });

        it('responds HTTP OK if there are no details for a reminder', function() {
            sinon.stub(RpcClient, 'callRpc').callsFake(function(logger, config, rpc, params, callback) {
                return callback(null /*error*/ , null /*result*/ );
            });

            cdsAdviceDetail.getCDSAdviceDetail(mockReqResUtil.createRequestWithParam({
                pid: 'SITE;3',
                use: 'someUse',
                id: 'someAdviceId'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();
        });

        it('responds HTTP Not Found if there are errors retrieving details', function() {
            sinon.stub(RpcClient, 'callRpc').callsFake(function(logger, config, rpc, params, callback) {
                return callback(new Error('something bad happened') /*error*/ , null /*result*/ );
            });

            cdsAdviceDetail.getCDSAdviceDetail(mockReqResUtil.createRequestWithParam({
                pid: 'SITE;3',
                use: 'someUse',
                id: 'someAdviceId'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });

        it('responds HTTP Bad Request when required parameters are missing', function() {
            sinon.stub(RpcClient, 'callRpc').callsFake(function(logger, config, rpc, params, callback) {
                return callback(null /*error*/ , 'some details...' /*result*/ );
            });

            cdsAdviceDetail.getCDSAdviceDetail(mockReqResUtil.createRequestWithParam({
                pid: 'SITE;3',
                use: 'someUse',
                id: 'someAdviceId'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();

            cdsAdviceDetail.getCDSAdviceDetail(mockReqResUtil.createRequestWithParam({
                pid: 'SITE;3',
                use: 'someUse'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            cdsAdviceDetail.getCDSAdviceDetail(mockReqResUtil.createRequestWithParam({
                pid: 'SITE;3',
                id: 'someAdviceId'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            cdsAdviceDetail.getCDSAdviceDetail(mockReqResUtil.createRequestWithParam({
                use: 'someUse',
                id: 'someAdviceId'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            cdsAdviceDetail.getCDSAdviceDetail(mockReqResUtil.createRequestWithParam({}), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
    });

    describe('setReadStatus endpoint HTTP response codes', function() {
        it('responds HTTP Not Found if there is no Work Product with that id', function() {
            sinon.stub(cdsWorkProduct, 'setReadStatus').callsFake(function(logger, id, readStatus, provider, callback) {
                return callback(null /*body*/ , 'Work Product not found!' /*error*/ );
            });

            cdsAdviceList.setReadStatus(mockReqResUtil.createRequestWithParam({
                id: 'someid',
                value: 'true'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });

        it('responds HTTP Bad Request when required parameters are missing', function() {
            sinon.stub(cdsWorkProduct, 'setReadStatus').callsFake(function(logger, id, readStatus, provider, callback) {
                return callback('Read Status updated!' /*body*/ , null /*error*/ );
            });

            cdsAdviceList.setReadStatus(mockReqResUtil.createRequestWithParam({
                id: 'someid',
                value: 'true'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();

            cdsAdviceList.setReadStatus(mockReqResUtil.createRequestWithParam({
                value: 'true'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            cdsAdviceList.setReadStatus(mockReqResUtil.createRequestWithParam({
                id: 'someid'
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            cdsAdviceList.setReadStatus(mockReqResUtil.createRequestWithParam({}), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
    });
});
