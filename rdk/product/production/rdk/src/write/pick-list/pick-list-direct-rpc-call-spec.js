'use strict';

var handler = require('./pick-list-direct-rpc-call');
var fetchModule = require('./medications/medication-list-fetch-list');
var bunyan = require('bunyan');
var req = {
    app: require('./pick-list-config-mock'),
    param: null
};
req.app.logger = sinon.stub(bunyan.createLogger({
    name: 'test-logger'
}));

describe('direct rpc call pick-list handler', function() {
    beforeEach(function() {
        sinon.stub(fetchModule, 'fetch', function(logger, siteConfig, cb) {
            cb(null, 'OK');
        });
    });

    afterEach(function() {
        fetchModule.fetch.restore();
    });

    it('responds with the correct error for a missing required parameter', function(done) {
        req.param = function() {
            return null;
        };

        handler.directRpcCall(req, null, 'medication-list', function(err) {
            expect(err).to.be('Parameter \'searchString\' cannot be null or empty');
            expect(fetchModule.fetch.called).to.be.false();
            done();
        });
    });

    it('responds with the correct error for an empty required parameter', function(done) {
        req.param = function() {
            return '';
        };

        handler.directRpcCall(req, null, 'medication-list', function(err) {
            expect(err).to.be('Parameter \'searchString\' cannot be null or empty');
            expect(fetchModule.fetch.called).to.be.false();
            done();
        });
    });

    it('responds with the correct error when database configuration is required but unavailable', function(done) {
        req.param = function(x) {
            if (x === 'staffIEN') {
                return '123';
            }
            return '';
        };
        req.app.config.vistaSites = {
            'site': {}
        };

        handler.directRpcCall(req, 'site', 'teams-for-user', function(err, result) {
            expect(err).to.be('Activity/PCMM database was not found in the configuration');
            expect(fetchModule.fetch.called).to.be.false();
            done();
        });
    });

    it('calls fetch when the required configuration is in place', function(done) {
        req.param = function(x) {
            if (x === 'searchString') {
                return 'dummySearchString';
            }
            return '';
        };
        req.app.config.vxSyncServer = null;
        req.app.config.generalPurposeJdsServer = null;
        req.app.config.rootPath = null;
        req.app.config.vistaSites = {
            'site': {}
        };

        handler.directRpcCall(req, 'site', 'medication-list', function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            expect(result).to.be('OK');
            expect(fetchModule.fetch.calledOnce).to.be.true();
            done();
        });
    });
});
