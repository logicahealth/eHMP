'use strict';

require('../../../../env-setup');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'poller-utils-spec',
//     level: 'debug'
// });

var errorProcessingApi = require(global.VX_UTILS + 'error-processing/error-processing-api');
var errorProcessingAlgorithm = require(global.VX_UTILS + 'error-processing/error-processing-algorithm');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;

var environment = {metrics: {}, jobStatusUpdater: {}};

var config = {
    jds: {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    },
    vxsyncEnvironments: {
        'vxsync-unit-test': {
            vxsync: {
                beanstalk: {
                    jobTypes: {
                        'unit-test': {}
                    }
                }
            }
        }
    }

};

describe('error-processing-algorithm', function() {

    describe('deleteLock', function() {
        var context, called;

        var errorRecord = {uid: '1'};

        beforeEach(function() {
            environment.jds = new JdsClientDummy(logger, config);
            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});

            called = false;
        });

        it('error unlocking record', function() {
            environment.jds._setResponseData(['Connection Error'], [null], null);

            runs(function() {
                errorProcessingAlgorithm._deleteLock(context, errorRecord, function(error) {
                    expect(error).toBeTruthy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('jds error unlocking record', function() {
            environment.jds._setResponseData([null], [{statusCode: 500}], {error: 'error'});

            runs(function() {
                errorProcessingAlgorithm._deleteLock(context, errorRecord, function(error) {
                    expect(error).toBeTruthy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('unlocking record successful', function() {
            environment.jds._setResponseData([null], [{statusCode: 200}], [null]);

            runs(function() {
                errorProcessingAlgorithm._deleteLock(context, errorRecord, function(error) {
                    expect(error).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });
    });

    describe('deleteErrorJob', function() {
        var context, called;

        var errorRecord = {uid: '1'};

        beforeEach(function() {
            environment.jds = new JdsClientDummy(logger, config);
            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});

            called = false;
        });

        it('error deleting error record', function() {
            environment.jds._setResponseData(['Connection Error'], [null], null);

            runs(function() {
                errorProcessingAlgorithm._deleteErrorJob(context, errorRecord, function(error) {
                    expect(error).toBeTruthy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('jds error deleting error record', function() {
            environment.jds._setResponseData([null], [{statusCode: 500}], {error: 'error'});

            runs(function() {
                errorProcessingAlgorithm._deleteErrorJob(context, errorRecord, function(error) {
                    expect(error).toBeTruthy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('unlocking record successful', function() {
            environment.jds._setResponseData([null], [{statusCode: 200}], [null]);

            runs(function() {
                errorProcessingAlgorithm._deleteErrorJob(context, errorRecord, function(error) {
                    expect(error).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });
    });

    describe('getPublishConfiguration', function() {
        var context;

        var errorRecord = {
            uid: '1',
            jobType: 'unit-test',
            vxsyncEnvironmentName: 'vxsync-unit-test'
        };

        beforeEach(function() {
            var configCopy = JSON.parse(JSON.stringify(config));
            context = errorProcessingApi.ErrorProcessingContext(logger, configCopy, environment, {});
        });

        it('vxsyncEnvironments not found in config', function() {
            context.config.vxsyncEnvironments = undefined;

            expect(function() { errorProcessingAlgorithm._getPublishConfiguration(context, errorRecord); }).toThrow();
        });

        it('vxsyncEnvironmentName not found on job', function() {
            var configErrorRecord = JSON.parse(JSON.stringify(errorRecord));
            configErrorRecord.vxsyncEnvironmentName = undefined;

            expect(function() { errorProcessingAlgorithm._getPublishConfiguration(context, configErrorRecord); }).toThrow();
        });

        it('config deep copy failed', function() {
            context.config.vxsyncEnvironments = '\"\"fsdfs\"';

            expect(function() { errorProcessingAlgorithm._getPublishConfiguration(context, errorRecord); }).toThrow();

        });

        it('job vxsync environment not found in config', function() {
            var configErrorRecord = JSON.parse(JSON.stringify(errorRecord));
            configErrorRecord.vxsyncEnvironmentName = 'unit-test';

            expect(function() { errorProcessingAlgorithm._getPublishConfiguration(context, configErrorRecord); }).toThrow();
        });

        it('job type not found in environment config', function() {
            var configErrorRecord = JSON.parse(JSON.stringify(errorRecord));
            configErrorRecord.jobType = 'failed-test';

            expect(function() { errorProcessingAlgorithm._getPublishConfiguration(context, configErrorRecord); }).toThrow();
        });

        it('returns valid config for job', function() {
            var publishConfig = errorProcessingAlgorithm._getPublishConfiguration(context, errorRecord);

            expect(publishConfig.beanstalk.jobTypes['unit-test']).toBeDefined();
        });
    });

    describe('incrementRetryCount', function() {
        it('job retryCount not defined', function() {
            var errorRecord = {job: {}};

            errorProcessingAlgorithm._incrementRetryCount(errorRecord);
            expect(errorRecord.job.retryCount).toBe(1);
        });

        it('job retryCount exists', function() {
            var errorRecord = {job: {retryCount: 4}};

            errorProcessingAlgorithm._incrementRetryCount(errorRecord);
            expect(errorRecord.job.retryCount).toBe(5);
        });
    });

    describe('publishErrorJob', function() {
        var context, called, errorRecord, publishSpy;

        beforeEach(function() {
            errorRecord = {uid: '1'};
            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});

            called = false;

            publishSpy = spyOn(PublisherRouter.prototype, 'publish').andCallFake(function(job, callback) {
                setTimeout(callback, 0, null, 'success');
            });
        });

        it('do not publish if the error record is not a job error', function() {
            runs(function() {
                errorProcessingAlgorithm._publishErrorJob(context, errorRecord, function(error, results) {
                    expect(error).toBeFalsy();
                    expect(results).toBeFalsy();

                    expect(publishSpy).not.toHaveBeenCalled();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('do not publish if the deleteOnly flag is true in the processing context', function() {
            context.deleteOnly = true;

            runs(function() {
                errorProcessingAlgorithm._publishErrorJob(context, errorRecord, function(error, results) {
                    expect(error).toBeFalsy();
                    expect(results).toBeFalsy();

                    expect(publishSpy).not.toHaveBeenCalled();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('error thrown trying to get publisher configuration', function() {
            errorRecord.job = {};

            runs(function() {
                errorProcessingAlgorithm._publishErrorJob(context, errorRecord, function(error, results) {
                    expect(error).toBeTruthy();
                    expect(results).toBeFalsy();

                    expect(publishSpy).not.toHaveBeenCalled();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('successfully published the job from the error record', function() {
            errorRecord.job = {};
            errorRecord.jobType = 'unit-test';
            errorRecord.vxsyncEnvironmentName = 'vxsync-unit-test';

            runs(function() {
                errorProcessingAlgorithm._publishErrorJob(context, errorRecord, function(error, results) {
                    expect(error).toBeFalsy();
                    expect(results).toBeFalsy();

                    expect(publishSpy).toHaveBeenCalled();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });
    });

    describe('lockErrorJob', function() {
        var context, called;

        var errorRecord = {uid: '1'};

        beforeEach(function() {
            environment.jds = new JdsClientDummy(logger, config);
            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});

            called = false;
        });

        it('error locking record', function() {
            environment.jds._setResponseData(['Connection Error'], [null], null);

            runs(function() {
                errorProcessingAlgorithm._lockErrorJob(context, errorRecord, function(error, results) {
                    expect(error).toBeTruthy();
                    expect(results).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('jds error locking record', function() {
            environment.jds._setResponseData([
                {type:'transient-exception',message:'{\\\"error\\\":{\\\"code\\\":500,\\\"errors\\\":[{\\\"message\\\":\\\"Record already locked\\\",\\\"reason\\\":272}],\\\"message\\\":\\\"Bad Request\\\",\\\"request\\\":\\\"PUT \\\\/vxsyncerr\\\\/lock\\\\/urn:va:vxsyncerr:TEST5 \\\"}}\"}'
                }], [{statusCode: 500}], [null]);

            runs(function() {
                errorProcessingAlgorithm._lockErrorJob(context, errorRecord, function(error, results) {
                    expect(error).toBeTruthy();
                    expect(error).toBe('SKIP');
                    expect(results).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('locking record successful', function() {
            environment.jds._setResponseData([null], [{statusCode: 201}], [null]);

            runs(function() {
                errorProcessingAlgorithm._lockErrorJob(context, errorRecord, function(error) {
                    expect(error).toBeFalsy();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });
    });

    describe('maxRetriesReached', function() {
        var context, errorRecord;

        beforeEach(function() {
            errorRecord = {uid: '1'};
            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});
        });

        it('max retries ignored because ignoreRetry flag is true in processing context', function() {
            context.ignoreRetry = true;

            expect(errorProcessingAlgorithm._maxRetriesReached(context, errorRecord)).toBe(false);
        });

        it('use default max retries of 3 if errorRetryLimit not found in config', function() {
            errorRecord.job = {retryCount: 3};

            expect(errorProcessingAlgorithm._maxRetriesReached(context, errorRecord)).toBe(true);
        });

        it('retry count is zero if the error record job does not have a retryCount property', function() {
            expect(errorProcessingAlgorithm._maxRetriesReached(context, errorRecord)).toBe(false);
        });

        it('retry count has reached the maximum', function() {
            errorRecord.job = {retryCount: 4};

            expect(errorProcessingAlgorithm._maxRetriesReached(context, errorRecord)).toBe(true);
        });

        it('retry count has NOT reached the maximum', function() {
            errorRecord.job = {retryCount: 2};

            expect(errorProcessingAlgorithm._maxRetriesReached(context, errorRecord)).toBe(false);
        });
    });

    describe('processErrorRecord', function() {
        var context, called, errorRecord, publishSpy;

        beforeEach(function() {
            environment.jds = new JdsClientDummy(logger, config);
            errorRecord = {uid: '1'};

            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});

            called = false;

            publishSpy = spyOn(PublisherRouter.prototype, 'publish').andCallFake(function(job, callback) {
                setTimeout(callback, 0, null, 'success');
            });
        });

        it('max retries reached for error record', function() {
            errorRecord.job = {retryCount: 4};

            runs(function() {
                errorProcessingAlgorithm._processErrorRecord(context, errorRecord, function() {
                    expect(context.errors.length).toBe(0);
                    expect(context.results.length).toBe(1);
                    expect(context.results[0]).toBe('Successfully processed error record 1 with status: Max retries reached.');

                    expect(publishSpy).not.toHaveBeenCalled();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('keepRecord flag is true during error process then unlock record instead of deleting it', function() {
            spyOn(context.jdsClient, 'deleteErrorRecordByUid');
            spyOn(context.jdsClient, 'unlockErrorRecord').andCallThrough();

            environment.jds._setResponseData(
                [null, null],
                [{statusCode: 201}, {statusCode: 200}],
                [null, null]);

            errorRecord.job = {};
            errorRecord.jobType = 'unit-test';
            errorRecord.vxsyncEnvironmentName = 'vxsync-unit-test';

            context.keepRecord = true;

            runs(function() {
                errorProcessingAlgorithm._processErrorRecord(context, errorRecord, function(error, results) {
                    expect(error).toBeFalsy();
                    expect(results).toBeFalsy();

                    expect(context.jdsClient.unlockErrorRecord).toHaveBeenCalled();
                    expect(context.jdsClient.deleteErrorRecordByUid).not.toHaveBeenCalled();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('an error occurred locking error record during record processing', function() {
            environment.jds._setResponseData(
                ['Connection Error', null],
                [null, {statusCode: 200}],
                [null, null]);

            errorRecord.job = {retryCount: 1};

            runs(function() {
                errorProcessingAlgorithm._processErrorRecord(context, errorRecord, function() {
                    expect(context.errors.length).toBe(1);
                    expect(context.errors[0]).toBe('Error processing record 1 with error: "Connection Error"');
                    expect(context.results.length).toBe(0);

                    expect(publishSpy).not.toHaveBeenCalled();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('the error record is being processed by another process so it is skipped', function() {
            environment.jds._setResponseData(
                [{type:'transient-exception',message:'{\\\"error\\\":{\\\"code\\\":500,\\\"errors\\\":[{\\\"message\\\":\\\"Record already locked\\\",\\\"reason\\\":272}],\\\"message\\\":\\\"Bad Request\\\",\\\"request\\\":\\\"PUT \\\\/vxsyncerr\\\\/lock\\\\/urn:va:vxsyncerr:TEST5 \\\"}}\"}'
                }, null],
                [{statusCode: 500}, {statusCode: 200}],
                [null, null]);

            errorRecord.job = {retryCount: 1};

            runs(function() {
                errorProcessingAlgorithm._processErrorRecord(context, errorRecord, function() {
                    expect(context.errors.length).toBe(0);
                    expect(context.results.length).toBe(1);
                    expect(context.results[0]).toBe('Successfully processed error record 1 with status: Skipped.');

                    expect(publishSpy).not.toHaveBeenCalled();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });

        it('the error record was successfully processed', function() {
            environment.jds._setResponseData(
                [null, null],
                [{statusCode: 201}, {statusCode: 200}],
                [null, null]);

            errorRecord.job = {};
            errorRecord.jobType = 'unit-test';
            errorRecord.vxsyncEnvironmentName = 'vxsync-unit-test';

            runs(function() {
                errorProcessingAlgorithm._processErrorRecord(context, errorRecord, function() {
                    expect(context.errors.length).toBe(0);
                    expect(context.results.length).toBe(1);
                    expect(context.results[0]).toBe('Successfully processed error record 1 with status: Processing complete.');

                    expect(publishSpy).toHaveBeenCalled();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);
        });
    });

    describe('processErrorRecords', function() {
        var context, called, errorRecord, publishSpy;

        beforeEach(function() {
            environment.jds = new JdsClientDummy(logger, config);
            errorRecord = {uid: '1'};

            context = errorProcessingApi.ErrorProcessingContext(logger, config, environment, {});

            called = false;

            publishSpy = spyOn(PublisherRouter.prototype, 'publish').andCallFake(function(job, callback) {
                setTimeout(callback, 0, null, 'success');
            });
        });

        it('error record processing completed successfully', function() {
            environment.jds._setResponseData(
                [null, null],
                [{statusCode: 201}, {statusCode: 200}],
                [null, null]);

            errorRecord.job = {};
            errorRecord.jobType = 'unit-test';
            errorRecord.vxsyncEnvironmentName = 'vxsync-unit-test';

            runs(function() {
                errorProcessingAlgorithm._processErrorRecords([errorRecord], context, function() {
                    expect(context.errors.length).toBe(0);
                    expect(context.results.length).toBe(1);
                    expect(context.results[0]).toBe('Successfully processed error record 1 with status: Processing complete.');

                    expect(publishSpy).toHaveBeenCalled();

                    called = true;
                });
            });

            waitsFor(function() {return called;}, 'should be called', 500);

        });
    });
});
