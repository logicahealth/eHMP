'use strict';
var utils = require('./utils');
var _ = require('lodash');
var bunyan = require('bunyan');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;

var dummyLogger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

var dummyRequest = {
    logger: dummyLogger,
    app: {
        config: {
            jdsServer: {

            }
        }
    }
};

var sampleIdsWithEdipi = {
    'jpid': '796ee471-4d91-4e90-ab72-94ae4822808c',
    'patientIdentifiers': [
        '11111V222222',
        'SITE;1',
        'SITE;1',
        'DOD;0000000008',
        'HDR;11111V222222',
        'JPID;796ee471-4d91-4e90-ab72-94ae4822808c',
        'VLER;11111V222222'
    ]
};

var sampleIdsWithNoEdipi = {
    'jpid': '796ee471-4d91-4e90-ab72-94ae4822808c',
    'patientIdentifiers': [
        '11111V222222',
        'SITE;1',
        'SITE;1',
        'HDR;11111V222222',
        'JPID;796ee471-4d91-4e90-ab72-94ae4822808c',
        'VLER;11111V222222'
    ]
};

describe('Video Visit Utils', function() {
    describe('when patient has edipi', function() {
        beforeEach(function() {
            sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                callback(null, {}, sampleIdsWithEdipi);
            });
        });

        afterEach(function() {
            httpUtil.get.restore();
        });

        it('getEdipiOrIcn returns correct edipi', function() {
            var expectedOutput = {
                'type': 'EDIPI',
                'value': '0000000008'
            };

            var errObj;
            var result;
            var cb = function(err, id) {
                errObj = err;
                result = id;
            };

            utils.getEdipiOrIcn(dummyRequest, 'SITE;1', cb);
            expect(errObj).to.be.null();
            expect(result).to.eql(expectedOutput);
        });
    });

    describe('when patient does not have edipi but has icn', function() {
        beforeEach(function() {
            sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                callback(null, {}, sampleIdsWithNoEdipi);
            });
        });

        afterEach(function() {
            httpUtil.get.restore();
        });

        it('getEdipiOrIcn returns icn', function() {
            var expectedOutput = {
                'type': 'ICN',
                'value': '11111V222222'
            };

            var result;
            var errObj;
            var cb = function(err, id) {
                errObj = err;
                result = id;
            };

            utils.getEdipiOrIcn(dummyRequest, 'SITE;1', cb);
            expect(errObj).to.be.null();
            expect(result).to.eql(expectedOutput);
        });
    });

    describe('when patient has neither edipi nor icn', function() {
        beforeEach(function() {
            sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                callback(null, {}, {});
            });
        });

        afterEach(function() {
            httpUtil.get.restore();
        });

        it('getEdipiOrIcn returns error', function() {
            var result;
            var errObj;
            var cb = function(err, id) {
                errObj = err;
                result = id;
            };

            utils.getEdipiOrIcn(dummyRequest, 'SITE;1', cb);
            expect(errObj).not.to.be.null();
            expect(result).to.be.undefined();
        });
    });
    describe('get ICN', function() {
        var req;
        beforeEach(function() {
            var logger = sinon.stub(bunyan.createLogger({
                name: 'test-logger'
            }));
            req = {};
            _.set(req, 'app.config.jdsServer', {
                baseURL: 'baseurl'
            });
            _.set(req, 'logger', logger);
        });
        it('does a successful JPID lookup returning an ICN', function() {
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                var httpResponse = {};
                var result = {
                    patientIdentifiers: ['1V1', '1', 'SITE;1']
                };
                return callback(null, httpResponse, result);
            });
            utils.getIcn(req, 'SITE;3', function(err, icn) {
                expect(err).to.be.null();
                expect(icn).to.eql('1V1');
            });
            httpStub.restore();
        });
        it('returns an error not finding an ICN', function() {
            var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(options, callback) {
                var httpResponse = {};
                var result = {
                    patientIdentifiers: ['1', 'SITE;1']
                };
                return callback(null, httpResponse, result);
            });
            utils.getIcn(req, 'SITE;3', function(err, icn) {
                expect(err).to.eql('jpid did not find an icn');
            });
            httpStub.restore();
        });
    });

});
