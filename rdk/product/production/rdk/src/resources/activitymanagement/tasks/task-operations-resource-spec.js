'use strict';
var generateRouteQuery = require('./task-operations-resource').generateRouteQuery;
var buildTasksResponse = require('./task-operations-resource').buildTasksResponse;
var _ = require('lodash');
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
    describe('Route query generator', function() {
        it('generates the correct query with default params', function() {
            var input = ['1'];
            var expectedOutput = 'SELECT * FROM activitydb.Am_TaskRoute WHERE taskInstanceId IN (1) order by taskInstanceId,id';
            var logger = {
                debug: function() {}
            };
            var actualOutput = generateRouteQuery(logger, input);

            expect(actualOutput).to.eql(expectedOutput);
        });

        it('generates the correct query with artificial limit', function() {
            var input = ['test0', 'test1', 'test2'];
            var expectedOutput = 'SELECT * FROM activitydb.Am_TaskRoute WHERE taskInstanceId IN (test0,test1) OR taskInstanceId IN (test2) order by taskInstanceId,id';
            var logger = {
                debug: function() {}
            };
            var actualOutput = generateRouteQuery(logger, input, 2);

            expect(actualOutput).to.eql(expectedOutput);
        });

        it('generates the correct query with artificial limit and integers', function() {
            var input = [0, 1, 2, 3];
            var expectedOutput = 'SELECT * FROM activitydb.Am_TaskRoute WHERE taskInstanceId IN (0,1) OR taskInstanceId IN (2,3) order by taskInstanceId,id';
            var logger = {
                debug: function() {}
            };
            var actualOutput = generateRouteQuery(logger, input, 2);
            var actualOutput2 = generateRouteQuery(logger, input);

            expect(actualOutput).to.eql(expectedOutput);
            expect(actualOutput2).not.to.eql(expectedOutput);
        });
    });

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
            buildTasksResponse(null, null, dummyRequest, null, function(formattedResponse) {}, function(err) {
                expect(err).to.be.falsy();
                done();
            });
        });
    });
});
