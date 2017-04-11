'use strict';

var handler = require('./pick-list-direct-rpc-call');
var fetchModule = require('./medications/medication-list-fetch-list');

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
        var req = {
            param: function() {
                return null;
            }
        };

        handler.directRpcCall(req, null, 'medication-list', function(err) {
            expect(err).to.be('Parameter \'searchString\' cannot be null or empty');
            expect(fetchModule.fetch.called).to.be.false();
            done();
        });
    });

    it('responds with the correct error for an empty required parameter', function(done) {
        var req = {
            param: function() {
                return '';
            }
        };

        handler.directRpcCall(req, null, 'medication-list', function(err) {
            expect(err).to.be('Parameter \'searchString\' cannot be null or empty');
            expect(fetchModule.fetch.called).to.be.false();
            done();
        });
    });

    it('responds with the correct error for an empty required parameter', function(done) {
        var req = {
            app: {
                config: {
                    vxSyncServer: null,
                    generalPurposeJdsServer: null,
                    rootPath: null,
                    vistaSites: {
                        'site': {}
                    }
                }
            },
            param: function(x) {
                if (x === 'searchString') {
                    return 'dummySearchString';
                }
                return '';
            }
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
