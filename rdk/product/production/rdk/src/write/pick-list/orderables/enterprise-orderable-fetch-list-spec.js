'use strict';

var _ = require('lodash');
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var fetch = require('./enterprise-orderable-fetch-list').fetch;

var dummyLogger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

var DUMMY_SEARCHSTRING = 'dummySearch';
var DUMMY_CONFIG = 'dummyConfig';

describe('Enterprise orderable pick-list resource', function() {
    var pjdsGetReq = undefined;
    var pjdsGetOptions = undefined;
    var params = undefined;

    beforeEach(function() {
        params = {
            searchString: DUMMY_SEARCHSTRING
        };

        sinon.stub(pjds, 'get', function(req, res, opt, cb) {
            pjdsGetOptions = opt;
            pjdsGetReq = req;
            cb();
        });
    });

    afterEach(function() {
        pjds.get.restore();
        pjdsGetOptions = undefined;
        pjdsGetReq = undefined;
        params = undefined;
    });

    it('searches for enterprise orderables', function(done) {
        fetch(dummyLogger, DUMMY_CONFIG, function(err, result) {
            expect(pjds.get.calledOnce).to.be.true();

            expect(pjdsGetOptions).to.be.truthy();
            expect(pjdsGetOptions.store).to.be('entordrbls');

            expect(pjdsGetReq).to.be.truthy();
            expect(pjdsGetReq.app.config).to.be(DUMMY_CONFIG);

            done();
        }, params);
    });
});
