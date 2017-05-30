'use strict';

var _ = require('underscore');
var errorBuilder = require('../../../src/error-builder');
var jobProcessor = require('../../../src/process-job-strategies/job-processor');

describe('job-processor.JS', function() {
    function createDummyLogger(){
        return {
                fields: {
                    name: 'dummy-log'
                },
                child: function(dataToLog) {
                    //Note: unlike the actual log.child function,
                    //      this will assign the referenceInfo to
                    //      the original logger object
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
    }

    describe('createChildEnvironment', function() {
        var logger = createDummyLogger();
        var childLog = logger.child(referenceInfo);

        var referenceInfo = {
            jobId: 'test job id',
            rootJobId: 'test rootJobId',
            sessionId: 'test sessionId',
            requestId: 'test requestId',
            utilityType: 'test utilityType'
        };

        it('returns null with null environment', function() {
            var environment = null;
            var childEnv = jobProcessor._steps.createChildEnvironment(childLog, environment);

            expect(childEnv).toBe(null);
        });
        it('returns environment when no childInstances need to be created', function() {
            var environment = {
                dummy1: {
                    dummyProperty: 'test'
                },
                dummy2: {
                    dummyProperty: 'test2'
                }
            };

            var childEnv = jobProcessor._steps.createChildEnvironment(childLog, environment);

            expect(childEnv).toEqual(jasmine.objectContaining(environment));
        });
        it('returns environment with childInstances when appropriate', function() {
            var environment = {
                dummy1: {
                    dummyProperty: 'test'
                },
                dummy2: {
                    dummyProperty: 'test2'
                },
                jds: {
                    log: logger,
                    childInstance: function(log){
                        this.log = log;
                        return this;
                    }
                },
                solr: {
                    log: logger,
                    childInstance: function(log){
                        this.log = log;
                        return this;
                    }
                },
                vistaClient: {
                    log: logger,
                    childInstance: function(log){
                        this.log = log;
                        return this;
                    }
                },
                mvi: {
                    log: logger,
                    childInstance: function(log){
                        this.log = log;
                        return this;
                    }
                },
                jobStatusUpdater: {
                    log: logger,
                    childInstance: function(log){
                        this.log = log;
                        return this;
                    }
                },
                publisherRouter: {
                    log: logger,
                    childInstance: function(log){
                        this.log = log;
                        return this;
                    }
                }
            };

            spyOn(environment.jds,'childInstance');
            spyOn(environment.solr, 'childInstance');
            spyOn(environment.vistaClient, 'childInstance');
            spyOn(environment.mvi, 'childInstance');
            spyOn(environment.jobStatusUpdater, 'childInstance');
            spyOn(environment.publisherRouter, 'childInstance');

            var childEnv = jobProcessor._steps.createChildEnvironment(childLog, environment);

            expect(childEnv).toBeTruthy();
            expect(environment.jds.childInstance).toHaveBeenCalledWith(logger);
            expect(environment.solr.childInstance).toHaveBeenCalledWith(logger);
            expect(environment.vistaClient.childInstance).toHaveBeenCalledWith(logger);
            expect(environment.mvi.childInstance).toHaveBeenCalledWith(logger);
            expect(environment.jobStatusUpdater.childInstance).toHaveBeenCalledWith(logger);
            expect(environment.publisherRouter.childInstance).toHaveBeenCalledWith(logger);
        });
    });
    describe('processJob()', function() {
        var called, worker, callback;
        var tubeName = 'test-tube';
        var logger;

        beforeEach(function() {
            logger = createDummyLogger();

            called = false;

            worker = {
                logger: logger,
                metrics: logger,
                client: {
                    destroy: jasmine.createSpy().andCallFake(function(jobId, callback) {
                        callback();
                    }),
                    release: jasmine.createSpy().andCallFake(function(jobId, priority, delay, callback) {
                        callback();
                    })
                },
                handlerRegistry: {
                    get: function() {},
                    environment: {}
                },
                jobStatusUpdater: {
                    startJobStatus: function(job, callback) {
                        callback(null, {}, job);
                    },
                    completeJobStatus: function(job, callback) {
                        callback(null, {}, job);
                    },
                    errorJobStatus: jasmine.createSpy().andCallFake(function(job, error, callback) {
                        callback(null, {}, job);
                    })
                },
                errorPublisher: {
                    publishHandlerError: jasmine.createSpy().andCallFake(function(job, error, type, callback) {
                        callback(null, {}, job);
                    })
                }
            };

            callback = function() {
                called = true;
            };
        });

        it('verify destroy() called for invalid job format', function() {
            var jobId = 1;
            var payload = 'invalid JSON';

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called for undefined or null job.type', function() {
            var jobId = 1;
            var payload = '{}';

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called for no handler', function() {
            var jobId = 1;
            var payload = '{ "type": "invalid" }';

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called for transient error', function() {
            var jobId = 1;
            var payload = '{ "type": "valid" }';
            worker.handlerRegistry.get = function() {
                return function(logger, childEnv, job, callback) {
                    callback(errorBuilder.createTransient());
                };
            };
            spyOn(worker.metrics, 'info');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.metrics.info.callCount).toEqual(3);
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called other error types', function() {
            var jobId = 1;
            var payload = '{ "type": "invalid" }';
            worker.handlerRegistry.get = function() {
                return function(logger, childEnv, job, callback) {
                    callback(errorBuilder.createFatal());
                };
            };

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called for exceptions', function() {
            var jobId = 1;
            var payload = '{ "type": "invalid" }';
            worker.handlerRegistry.get = function() {
                return function(logger, childEnv, job, callback) {
                    throw "This is an exception";
                };
            };
            spyOn(worker.logger, 'error');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(worker.errorPublisher.publishHandlerError).toHaveBeenCalled();
                expect(worker.logger.error).toHaveBeenCalled();
                expect(worker.jobStatusUpdater.errorJobStatus).toHaveBeenCalled();
            });
        });

        it('verify destroy() called for successful job process', function() {
            var jobId = 1;
            var payload = '{ "type": "valid" }';
            worker.handlerRegistry.get = function() {
                return function(logger, childEnv, job, callback) {
                    callback();
                };
            };
            spyOn(worker.metrics, 'info');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(worker.errorPublisher.publishHandlerError).not.toHaveBeenCalled();
                expect(worker.metrics.info.callCount).toEqual(3);
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
            });
        });

        it('verify release() called when start job not updated', function() {
            var jobId = 1;
            var payload = '{ "type": "valid" }';
            worker.handlerRegistry.get = function() {
                return function(logger, childEnv, job, callback) {
                    callback();
                };
            };
            worker.jobStatusUpdater = {
                startJobStatus: function(job, callback) {
                    callback(errorBuilder.createFatal());
                }
            };

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(worker.errorPublisher.publishHandlerError).not.toHaveBeenCalled();
                expect(worker.client.destroy).not.toHaveBeenCalledWith(jobId);
                expect(worker.client.release).toHaveBeenCalledWith(jobId, 1, 30, jasmine.any(Function));
            });
        });
        it('verify child logger not created when there is no referenceInfo data in the job', function() {
            var jobId = 1;
            var payload = '{ "type": "valid" }';
            worker.handlerRegistry.get = function() {
                return function(logger, childEnv, job, callback) {
                    callback();
                };
            };
            spyOn(worker.metrics, 'info');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(worker.errorPublisher.publishHandlerError).not.toHaveBeenCalled();
                expect(worker.metrics.info.callCount).toEqual(3);
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(logger.fields.referenceInfo).toBeUndefined();
            });
        });
        it('verify child logger created when there is jobId, rootJobId, and priority but no referenceInfo data in the job', function() {
            var jobId = 1;
            var payload = '{ "type": "valid", "jobId": "1111", "rootJobId": "2222", "priority": "20" }';
            worker.handlerRegistry.get = function() {
                return function(logger, childEnv, job, callback) {
                    callback();
                };
            };
            spyOn(worker.metrics, 'info');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(worker.errorPublisher.publishHandlerError).not.toHaveBeenCalled();
                expect(worker.metrics.info.callCount).toEqual(3);
                expect(worker.client.destroy).toHaveBeenCalledWith(jobId, jasmine.any(Function));
                expect(logger.fields.referenceInfo).toBeTruthy();
                expect(logger.fields.referenceInfo.jobId).toBe('1111');
                expect(logger.fields.referenceInfo.rootJobId).toBe('2222');
                expect(logger.fields.referenceInfo.priority).toBe('20');
            });
        });
        it('verify child logger created when there is jobId, rootJobId, and priority and referenceInfo data in the job', function() {
            var jobId = 1;
            var payload = '{ "type": "valid", "jobId": "1111", "rootJobId": "2222", "priority": "20", "referenceInfo": { "sessionId": "3333", "requestId": "4444"}}';
            worker.handlerRegistry.get = function() {
                return function(logger, childEnv, job, callback) {
                    callback();
                };
            };
            spyOn(worker.metrics, 'info');

            jobProcessor.processJob.call(worker, jobId, tubeName, payload, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
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