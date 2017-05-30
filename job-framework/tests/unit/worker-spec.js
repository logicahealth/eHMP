'use strict';

var _ = require('underscore');

var Worker = require('../../src/worker');
var Delay = require('../../src/delay');
var strategy = require('../../src/process-job-strategies/process-single-tube-strategy');

var logger = {
    trace: _.noop,
    debug: _.noop,
    info: _.noop,
    warn: _.noop,
    error: _.noop,
    fatal: _.noop
};

var metrics = {
    trace: _.noop,
    debug: _.noop,
    info: _.noop,
    warn: _.noop,
    error: _.noop,
    fatal: _.noop
};

var beanstalkJobTypeConfig = {
    host: '192.168.0.2',
    port: 6000,
    tubename: 'vxs-enterprise-sync-request',
    tubePrefix: 'vxs-',
    jobTypeForTube: true,
    priority: 5,
    delay: 0,
    ttr: 0,
    timeout: 10,
    initMillis: 1000,
    maxMillis: 5000,
    incMillis: 1000
};


var testErrorPublisher = {
    publishHandlerError: Worker._noop
};

var testJobStatusUpdater = {
    createJobStatus: Worker._noop,
    completeJobStatus: Worker._noop,
    startJobStatus: Worker._noop,
    errorJobStatus: Worker._noop
};


var handlerRegistry = {};

describe('worker.js', function() {
    var originalStrategy;

    beforeEach(function () {
        originalStrategy = strategy.processQueue;

        strategy.processQueue = function(jobProcessor, callback) {
            callback();
        };
    });

    afterEach(function () {
        strategy.processQueue = originalStrategy;
    });

    describe('Worker()', function() {
        describe('test constructor with new and as function', function() {
            it('call with new', function() {
                var worker = new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
            });

            it('call as function', function() {
                /* jshint ignore:start */
                var worker = Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
                /* jshint ignore:end */
            });
        });

        describe('test with "start" param "false"', function() {
            it('call without jobStatusUpdater and without errorPublisher', function() {
                var worker = new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, false);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
                expect(worker.jobStatusUpdater).toBe(Worker._noopJobStatusUpdater);
                expect(worker.paused).toBe(true);
                expect(worker.errorPublisher).toBe(Worker._noopErrorPublisher);
            });

            it('call without errorPublisher', function() {
                var worker = new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, testJobStatusUpdater, false);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
                expect(worker.jobStatusUpdater).toBe(testJobStatusUpdater);
                expect(worker.errorPublisher).toBe(Worker._noopErrorPublisher);
                expect(worker.paused).toBe(true);
            });

            it('call without jobStatusUpdater', function() {
                var worker = new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, testErrorPublisher, false);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
                expect(worker.jobStatusUpdater).toBe(Worker._noopJobStatusUpdater);
                expect(worker.errorPublisher).toBe(testErrorPublisher);
                expect(worker.paused).toBe(true);
            });
        });

        describe('test with "start" param "true"', function() {
            it('call without jobStatusUpdater and without errorPublisher', function() {
                var worker = new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, true);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
                expect(worker.jobStatusUpdater).toBe(Worker._noopJobStatusUpdater);
                expect(worker.paused).toBe(false);
                expect(worker.errorPublisher).toBe(Worker._noopErrorPublisher);
            });

            it('call without errorPublisher', function() {
                var worker = new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, testJobStatusUpdater, true);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
                expect(worker.jobStatusUpdater).toBe(testJobStatusUpdater);
                expect(worker.errorPublisher).toBe(Worker._noopErrorPublisher);
                expect(worker.paused).toBe(false);
            });

            it('call without jobStatusUpdater', function() {
                var worker = new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, testErrorPublisher, true);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
                expect(worker.jobStatusUpdater).toBe(Worker._noopJobStatusUpdater);
                expect(worker.errorPublisher).toBe(testErrorPublisher);
                expect(worker.paused).toBe(false);
            });
        });

        describe('test without "start" param', function() {
            it('call without jobStatusUpdater and without errorPublisher', function() {
                var worker = new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
                expect(worker.jobStatusUpdater).toBe(Worker._noopJobStatusUpdater);
                expect(worker.errorPublisher).toBe(Worker._noopErrorPublisher);
                expect(worker.paused).toBe(true);
            });

            it('call without errorPublisher', function() {
                var worker = new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, testJobStatusUpdater);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
                expect(worker.jobStatusUpdater).toBe(testJobStatusUpdater);
                expect(worker.errorPublisher).toBe(Worker._noopErrorPublisher);
                expect(worker.paused).toBe(true);
            });

            it('call without jobStatusUpdater', function() {
                var worker = new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, testErrorPublisher);
                expect(worker.logger).toBe(logger);
                expect(worker.beanstalkJobTypeConfig).toEqual(beanstalkJobTypeConfig);
                expect(worker.handlerRegistry).toBe(handlerRegistry);
                expect(worker.client).toBeUndefined();
                expect(worker.delay).toEqual(new Delay(beanstalkJobTypeConfig.delay));
                expect(worker.jobStatusUpdater).toBe(Worker._noopJobStatusUpdater);
                expect(worker.errorPublisher).toBe(testErrorPublisher);
                expect(worker.paused).toBe(true);
            });
        });
    });

    describe('start()', function() {
        var called = false;
        var instance = {
            logger: logger,
            beanstalkJobTypeConfig: beanstalkJobTypeConfig,
            paused: true,
            _connect: function() {
                called = true;
            }
        };

        it('verify paused to true and _connect() called', function() {
            Worker.prototype.start.call(instance);
            expect(instance.paused).toBe(true);
            expect(called).toBe(true);
        });

        it('verify paused to false and _connect() called', function() {
            called = false;
            instance.paused = false;
            Worker.prototype.start.call(instance);
            expect(instance.paused).toBe(false);
            expect(called).toBe(true);
        });
    });

    describe('stop()', function() {
        var _clearClientCalled = false;
        var callbackCalled = false;
        var instance = {
            logger: logger,
            beanstalkJobTypeConfig: beanstalkJobTypeConfig,
            paused: false,
            _clearClient: function() {
                _clearClientCalled = true;
            }
        };
        var callback = function() {
            callbackCalled = true;
        };

        it('verify paused to true', function() {
            Worker.prototype.stop.call(instance, callback);

            waitsFor(function() {
                return callbackCalled;
            }, 'should be called', 100);

            runs(function() {
                expect(instance.paused).toBe(true);
                expect(_clearClientCalled).toBe(true);
                expect(callbackCalled).toBe(true);
            });
        });
    });

    describe('pause()', function() {
        var worker = new Worker(logger, beanstalkJobTypeConfig, /*metrics*/logger, handlerRegistry);

        worker.pause();

        var status = worker.getStatus();
        expect(status.status).toEqual('paused');

        worker.resume();

        status = worker.getStatus();
        expect(status.status).toEqual('running');

    });

    describe('_clearClient()', function() {
        var removeAllListenersCalled = false;
        var endCalled = false;
        var instance = {
            logger: logger,
            client: {
                removeAllListeners: function() {
                    removeAllListenersCalled = true;
                },
                end: function() {
                    endCalled = true;
                }
            },
            getTubeName : function(){}
        };

        it('verify listeners removed and client ended', function() {
            Worker.prototype._clearClient.call(instance);
            expect(removeAllListenersCalled).toBe(true);
            expect(endCalled).toBe(true);
        });
    });
});
