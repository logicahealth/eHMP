'use strict';

var _ = require('lodash');
var pjds = require('./pjds-store');
var rdk = require('../core/rdk');
var httpUtil = rdk.utils.http;

var dummyLogger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

var THE_BASE_URL = 'http://IP_ADDRESS:PORT';
var dummyApp = {
    config: {
        generalPurposeJdsServer: {
            baseUrl: THE_BASE_URL
        }
    },
    logger: dummyLogger
};

var THE_STORENAME = 'teststore';
var dummyResponse = {
    statusCode: 200,
    body: '{\"db_name\":\"' + THE_STORENAME + '\"}'
};

describe('pjds utility', function() {
    var optionsPassedToGet = undefined;

    beforeEach(function() {
        sinon.stub(httpUtil, 'get', function(options, callback) {
            optionsPassedToGet = options;
            callback(null, dummyResponse);
        });
    });

    afterEach(function() {
        httpUtil.get.restore();
        optionsPassedToGet = undefined;
    });

    it('can create a healthcheck for a datastore', function(done) {
        var healthcheck = pjds.createHealthcheck(THE_STORENAME, dummyApp);

        expect(healthcheck).to.be.truthy();

        expect(healthcheck.name).to.be.truthy();
        expect(healthcheck.name).to.be('pjds_' + THE_STORENAME);
        expect(healthcheck.check).to.be.truthy();

        healthcheck.check(function(result) {
            expect(optionsPassedToGet).to.be.truthy();

            expect(optionsPassedToGet.url).to.be.truthy();
            expect(optionsPassedToGet.url).to.be('/' + THE_STORENAME);

            expect(result).to.be(true);

            done();
        });
    });
});
