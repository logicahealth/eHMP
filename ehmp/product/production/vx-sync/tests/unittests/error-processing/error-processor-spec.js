'use strict';

require('../../../env-setup');

var ErrorProcessor = require(global.VX_ERROR_PROCESSING + 'error-processor');
var logger = require(global.VX_DUMMIES + 'dummy-logger');

describe('error-finder.js', function() {
    describe('buildFilter()', function() {
        it('verify no job types', function() {
            var filter = 'eq("severity","transient-exception"),eq("classification","job")&limit=1000';

            expect(ErrorProcessor._buildFilter()).toEqual(filter);
            expect(ErrorProcessor._buildFilter(null)).toEqual(filter);
            expect(ErrorProcessor._buildFilter([])).toEqual(filter);
        });

        it('verify with job type', function() {
            var filter = 'eq("severity","transient-exception"),eq("classification","job"),eq("jobType","test")&limit=1000';
            expect(ErrorProcessor._buildFilter('test')).toEqual(filter);
        });
    });

    describe('fetchAndProcessErrors()', function() {
        var config = {};
        var environment = {};

        beforeEach(function() {
            environment.publisherRouter = {
                'publish': function(jobsToPublish, callback) {
                    callback(null, [1]);
                }
            };
            environment.metrics = logger;
            environment.jds = {
                'deleteErrorRecordById': jasmine.createSpy().andCallFake(function(id, callback) {
                    callback(null, {'statusCode': 201});
                })
            };

            spyOn(environment.publisherRouter, 'publish').andCallThrough();
        });

        afterEach(function() {
            environment.publisherRouter.publish.reset();
        });

        it('no processing when no error jobs found', function() {
            environment.jds.findErrorRecordsByFilter = jasmine.createSpy().andCallFake(function(filter, callback) {
                callback(null, {"totalItems": 0});
            });

            ErrorProcessor._fetchAndProcessErrors(logger, config, environment, true, 1, 'jmeadows-sync-request', function(error, result) {
                expect(error).toBeFalsy();
                expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
                expect(environment.jds.deleteErrorRecordById).not.toHaveBeenCalled();
                expect(environment.jds.findErrorRecordsByFilter.callCount).toBe(1);
            });
        });

        it('process all error jobs when error jobs found', function() {
            var finishedCallback = false;

            environment.jds.findErrorRecordsByFilter = jasmine.createSpy().andCallFake(function(filter, callback) {
                if (finishedCallback) {
                    return callback(null, {"totalItems": 0});
                }

                finishedCallback = true;
                callback(null, [
                        {
                            "classification": "job",
                            "error": {
                                "data": "jmeadows-sync-request",
                                "message": "jmeadows-sync-request.handle: Unable to retrieve via Soap Handler.",
                                "type": "transient-exception"
                            },
                            "id": 1,
                            "job": {
                                "jobId": "9ffc8024-2f52-4798-b9c7-2c601773bbee"
                            },
                            "jobJpid": "3275e1ad-1530-4eec-ab20-4ffef2f20182",
                            "jobType": "jmeadows-sync-request",
                            "jpid": "a5873f3d-9c4d-43a1-99be-ffb68cf39b78",
                            "severity": "transient-exception",
                            "status": "started",
                            "timestamp": "1466521761693",
                            "type": "error-request"
                        }
                    ]);
            });

            ErrorProcessor._fetchAndProcessErrors(logger, config, environment, true, 1, 'jmeadows-sync-request', function(error, result) {
                expect(error).toBeFalsy();
                expect(environment.publisherRouter.publish.callCount).toBe(1);
                expect(environment.jds.deleteErrorRecordById.callCount).toBe(1);
                expect(environment.jds.findErrorRecordsByFilter.callCount).toBe(2);
             });
        });
    });
});
