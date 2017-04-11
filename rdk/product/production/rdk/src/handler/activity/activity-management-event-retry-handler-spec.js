'use strict';
var _ = require('lodash');
var bunyan = require('bunyan');
var log = sinon.stub(bunyan.createLogger({
    name: 'test-logger'
}));
var job = {
    record: {
        test: 'key',
        foo: 'bar'
    }
};

var config = {
    'activityManagementJobRetryLimit': 5,
    'log-level': 'warn'
};

var activityRetry = require('./activity-management-event-retry-handler');

describe('activity-management-event-retry-handler-spec.js', function() {
    beforeEach(function() {});
    afterEach(function() {});

    describe('check', function() {
        it('Should add activityRetry key to job object', function() {
            activityRetry.check(log, config, job, function(error, response) {
                expect(error).to.be(null);
                expect(response.record.activityRetry).to.be(0);
            });
        });

        it('Should return a fatal error because the activityRetry key equals activityManagementJobRetryLimit of 5', function() {
            var equalLimitJob = _.cloneDeep(job);
            equalLimitJob.record.activityRetry = 5;
            activityRetry.check(log, config, equalLimitJob, function(error, response) {
                expect(error).to.be('Fatal - Retry Check Error Job Retry count is greater than or equal to config limit.');
            });
        });

        it('Should return a fatal error because the activityRetry key is greater than the activityManagementJobRetryLimit of 5', function() {
            var gtLimitJob = _.cloneDeep(job);
            gtLimitJob.record.activityRetry = 6;
            activityRetry.check(log, config, gtLimitJob, function(error, response) {
                expect(error).to.be('Fatal - Retry Check Error Job Retry count is greater than or equal to config limit.');
            });
        });

        it('Should add one to the activityRetry key', function() {
            var ltLimitJob = _.cloneDeep(job);
            ltLimitJob.record.activityRetry = 3;
            activityRetry.check(log, config, ltLimitJob, function(error, response) {
                expect(response.record.activityRetry).to.be(4);
            });
        });
    });

    describe('validateResponse', function() {
        it('Should return a fatal error that the error is not an object', function() {
            activityRetry.validateResponse(log, 'not an object', function(errorCode) {
                expect(errorCode).to.be('Fatal - Error from Activity Event Processor was not an object.');
            });
        });

        it('Should return a fatal error that the error does not have a message key', function() {
            activityRetry.validateResponse(log, {
                data: 'no message key'
            }, function(errorCode) {
                expect(errorCode).to.be('Fatal - Error from Activity Event Processor does not have a message to validate.');
            });
        });

        it('Should return a fatal error that there is no error code', function() {
            activityRetry.validateResponse(log, {
                message: 'no error code'
            }, function(errorCode) {
                expect(errorCode).to.be('0');
            });
        });

        it('Should return a transient error because the first digit is 1 and the 4th is -', function() {
            activityRetry.validateResponse(log, {
                message: '101 - transient error'
            }, function(errorCode) {
                expect(errorCode).to.be('1');
            });
        });

        it('Should return a fatal error because the first digit is 2 and the 4th is -', function() {
            activityRetry.validateResponse(log, {
                message: '201 - fatal error'
            }, function(errorCode) {
                expect(errorCode).to.be('2');
            });
        });
    });
});
