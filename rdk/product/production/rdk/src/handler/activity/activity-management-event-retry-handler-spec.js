'use strict';
var _ = require('lodash');
var bunyan = require('bunyan');
var activityRetry = require('./activity-management-event-retry-handler');

var log = sinon.stub(bunyan.createLogger({
    name: 'activity-management-event-retry-handler-spec'
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

describe('activity-management-event-retry-handler-spec.js', function() {
    describe('check', function() {
        it('Should add activityRetry key to job object', function() {
            activityRetry.check(log, config, job, function(error, response) {
                expect(error).to.be(null);
                expect(response.record.activityRetry).to.be(-1);
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
    });

    describe('validateResponse', function() {
        beforeEach(function() {
            log = sinon.stub(bunyan.createLogger({
                name: 'activity-management-event-retry-handler-spec'
            }));
        });
        afterEach(function() {
            log.debug.restore();
        });

        it('Should return a fatal error that the error is not a string', function() {
            var errorCode = activityRetry.validateResponse(log, {
                string: 'no its an object'
            });
            expect(errorCode).to.be(0);
            expect(log.debug.callCount).to.equal(1);
            expect(log.debug.calledWith('Fatal Retry Validation Error - Error response was not a string.')).to.be.true();
        });

        it('Should return a fatal error that there is no error code', function() {
            var errorCode = activityRetry.validateResponse(log, 'no error code');
            expect(errorCode).to.be(0);
            expect(log.debug.callCount).to.equal(1);
            expect(log.debug.calledWith('Fatal Retry Validation Error - Error response does not have an error code.')).to.be.true();
        });

        it('Should return a transient error because the first digit is 1 and the 4th is -', function() {
            var errorCode = activityRetry.validateResponse(log, '101 - transient error');
            expect(errorCode).to.be(1);
            expect(log.debug.callCount).to.equal(1);
            expect(log.debug.calledWith('Transient Retry Validation Error - Error response returned an error with a transient code.')).to.be.true();
        });

        it('Should return a fatal error because the first digit is 2 and the 4th is -', function() {
            var errorCode = activityRetry.validateResponse(log, '201 - fatal error');
            expect(errorCode).to.be(2);
            expect(log.debug.callCount).to.equal(1);
            expect(log.debug.calledWith('Fatal Retry Validation Error - Error response returned an error with a fatal code.')).to.be.true();
        });
    });
});
