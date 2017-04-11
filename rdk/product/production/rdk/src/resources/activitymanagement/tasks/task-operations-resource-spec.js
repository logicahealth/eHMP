'use strict';
var buildTasksResponse = require('./task-operations-resource').buildTasksResponse;
var rdk = require('../../../core/rdk');
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
    logger: dummyLogger
};

describe('Task Operations Resource', function() {
    describe('Tasks response generator', function() {
        beforeEach(function() {
            sinon.stub(httpUtil, 'get', function(options, callback) {
                callback(null);
            });
        });

        afterEach(function() {
            httpUtil.get.restore();
        });

        it('doesn\'t crash if passed null parameters', function(done) {
            buildTasksResponse(null, null, dummyRequest, null, null, function(formattedResponse) {}, function(err) {
                expect(err).to.be.falsy();
                done();
            });
        });
    });
});
