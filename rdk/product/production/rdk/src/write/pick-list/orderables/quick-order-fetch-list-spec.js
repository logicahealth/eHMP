'use strict';

var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var fetch = require('./quick-order-fetch-list').fetch;

var dummyLogger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

var DUMMY_SEARCHSTRING = 'dummySearch';
var THE_UID = 'userUid';
var DUMMY_CONFIG = 'dummyConfig';

describe('Quick orders pick-list resource', function() {
    var pjdsGetReq;
    var pjdsGetOptions;
    var params;

    beforeEach(function() {
        params = {
            userId: THE_UID,
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

    it('searches for quick orders', function(done) {
        fetch(dummyLogger, DUMMY_CONFIG, function(err, result) {
            expect(pjds.get.calledOnce).to.be.true();

            expect(pjdsGetOptions).to.be.truthy();
            expect(pjdsGetOptions.store).to.be('quickorder');
            expect(pjdsGetOptions.filterList[2][3][2][0]).to.be('eq');
            expect(pjdsGetOptions.filterList[2][3][2][1]).to.be('createdBy');
            expect(pjdsGetOptions.filterList[2][3][2][2]).to.be(THE_UID);

            expect(pjdsGetReq).to.be.truthy();
            expect(pjdsGetReq.app.config).to.be(DUMMY_CONFIG);

            done();
        }, params);
    });
});
