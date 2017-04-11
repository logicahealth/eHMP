'use strict';

var errorBuilder = require('../../../src/error-builder');
var jobProcessor = require('../../../src/process-job-strategies/job-processor');

describe('job-processor.JS', function() {
    describe('processJob()', function () {
        var called, worker, callback;
        var tubeName = 'test-tube';
        var logger;

        beforeEach(function () {
            logger = {
                fields: {
                    name: 'dummy-log'
                },
                child: function(dataToLog) {
                    this.fields.referenceInfo = dataToLog;
                    return this;
                },
                trace: function() {},
                debug: function() {},
                info: function() {},
                warn: function() {},
                error: function() {},
                fatal: function() {},
                console: {
                    trace: console.log,
                    debug: console.log,
                    info: console.log,
                    warn: console.log,
                    error: console.log,
                    fatal: console.log
                }
            };

            called = false;

            worker = {
                logger: logger,
                metrics: logger,
                client: {
                    destroy: jasmine.createSpy().andCallFake(function(jobId, callback) {
                        callback();
                    }),
                    release: jasmine.createSpy().andCallFake(function(jobId, priority, delay, callback){
                        callback();
                    })},
                handlerRegistry: {
                    get: function () {
                    }
                },
                jobStatusUpdater: {
                    startJobStatus: function (job, callback) {
                        callback(null, {}, job);
                    },
                    completeJobStatus: function (job, callback) {
                        callback(null, {}, job);
                    },
                    errorJobStatus: jasmine.createSpy().andCallFake(function (job, error, callback) {
                        callback(null, {}, job);
                    })
                },
                errorPublisher: {
                    publishHandlerError: jasmine.createSpy().andCallFake(function (job, error, type, callback) {
                        callback(null, {}, job);
                    })
                }
            };

            callback = function () {
                called = true;
            };
        });

        it('verify destroy() called for invalid job format', function () {
            var jobId = 1;
            var payload = 'invalid JSON';

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called for undefined or null job.type', function () {
            var jobId = 1;
            var payload = '{}';

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called for no handler', function () {
            var jobId = 1;
            var payload = '{ "type": "invalid" }';

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called for transient error', function () {
            var jobId = 1;
            var payload = '{ "type": "valid" }';
            worker.handlerRegistry.get = function () {
                return function (logger, job, callback) {
                    callback(errorBuilder.createTransient());
                };
            };
            spyOn(worker.metrics, 'info');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.metrics.info.callCount).toEqual(3);
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called other error types', function () {
            var jobId = 1;
            var payload = '{ "type": "invalid" }';
            worker.handlerRegistry.get = function () {
                return function (logger, job, callback) {
                    callback(errorBuilder.createFatal());
                };
            };

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called for exceptions', function () {
            var jobId = 1;
            var payload = '{ "type": "invalid" }';
            worker.handlerRegistry.get = function () {
                return function (logger, job, callback) {
                    throw "This is an exception";
                };
            };
            spyOn(worker.logger, 'error');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.logger.error).toHaveBeenCalled();
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called for successful job process', function () {
            var jobId = 1;
            var payload = '{ "type": "valid" }';
            worker.handlerRegistry.get = function () {
                return function (logger, job, callback) {
                    callback();
                };
            };
            spyOn(worker.metrics, 'info');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.errorPublisher.publishHandlerError).not.toHaveBeenCalled();
                expect(worker.metrics.info.callCount).toEqual(3);
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
            });
        });

        it('verify release() called when start job not updated', function () {
            var jobId = 1;
            var payload = '{ "type": "valid" }';
            worker.handlerRegistry.get = function () {
                return function (logger, job, callback) {
                    callback();
                };
            };
            worker.jobStatusUpdater = {
                startJobStatus: function (job, callback) {
                    callback(errorBuilder.createFatal());
                }
            };

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.errorPublisher.publishHandlerError).not.toHaveBeenCalled();
                expect(worker.client.destroy).not.toHaveBeenCalledWith(jobId);
                expect(worker.client.release).toHaveBeenCalledWith(jobId, 1, 30, jasmine.any(Function));
            });
        });
        it('verify child logger not created when there is no referenceInfo data in the job', function () {
            var jobId = 1;
            var payload = '{ "type": "valid" }';
            worker.handlerRegistry.get = function () {
                return function (logger, job, callback) {
                    callback();
                };
            };
            spyOn(worker.metrics, 'info');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.errorPublisher.publishHandlerError).not.toHaveBeenCalled();
                expect(worker.metrics.info.callCount).toEqual(3);
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(logger.fields.referenceInfo).toBeUndefined();
            });
        });
        it('verify child logger created when there is jobId, rootJobId, and priority but no referenceInfo data in the job', function () {
            var jobId = 1;
            var payload = '{ "type": "valid", "jobId": "1111", "rootJobId": "2222", "priority": "20" }';
            worker.handlerRegistry.get = function () {
                return function (logger, job, callback) {
                    callback();
                };
            };
            spyOn(worker.metrics, 'info');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.errorPublisher.publishHandlerError).not.toHaveBeenCalled();
                expect(worker.metrics.info.callCount).toEqual(3);
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(logger.fields.referenceInfo).toBeTruthy();
                expect(logger.fields.referenceInfo.jobId).toBe('1111');
                expect(logger.fields.referenceInfo.rootJobId).toBe('2222');
                expect(logger.fields.referenceInfo.priority).toBe('20');
            });
        });
        it('verify child logger created when there is jobId, rootJobId, and priority and referenceInfo data in the job', function () {
            var jobId = 1;
            var payload = '{ "type": "valid", "jobId": "1111", "rootJobId": "2222", "priority": "20", "referenceInfo": { "sessionId": "3333", "requestId": "4444"}}';
            worker.handlerRegistry.get = function () {
                return function (logger, job, callback) {
                    callback();
                };
            };
            spyOn(worker.metrics, 'info');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function () { return called; }, 'should be called', 100);

            runs(function () {
                expect(worker.errorPublisher.publishHandlerError).not.toHaveBeenCalled();
                expect(worker.metrics.info.callCount).toEqual(3);
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(logger.fields.referenceInfo).toBeTruthy();
                expect(logger.fields.referenceInfo.jobId).toBe('1111');
                expect(logger.fields.referenceInfo.rootJobId).toBe('2222');
                expect(logger.fields.referenceInfo.priority).toBe('20');
                expect(logger.fields.referenceInfo.sessionId).toBe('3333');
                expect(logger.fields.referenceInfo.requestId).toBe('4444');
            });
        });

    });
});
