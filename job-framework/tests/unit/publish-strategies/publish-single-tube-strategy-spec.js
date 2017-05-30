'use strict';

var _ = require('underscore');

var BeanstalkClient = require('../../../src/beanstalk-client');
var strategy = require('../../../src/publish-strategies/publish-single-tube-strategy');

var jobStatusUpdater = {
    createJobStatus: function(job, callback) { return callback(); },
    completeJobStatus: _.noop,
    startJobStatus: _.noop,
    errorJobStatus: _.noop
};

var logger = {
    fields: {
        name: 'dummy-log'
    },
    child: function() {
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

describe('publish-single-tube-strategy.js', function() {
    describe('publish', function() {
        var beanstalkClient, publisherMockInstance, done;
        var options = {priority: 1, delay: 0, ttr: 120};
        var job = {priority: 60};

        beforeEach(function() {
            beanstalkClient = BeanstalkClient(logger, 'IP      ', PORT);

            publisherMockInstance = {logger: logger,
                metrics: {info: function () {}},
                client: beanstalkClient,
                queue: undefined,
                isConnected: false,
                beanstalkJobTypeConfig: {tubename: 'single-tube'}
            };

            publisherMockInstance.connect = function(callback) {
                strategy.connect.call(publisherMockInstance, callback);
            }
        });

        it('job published successfully', function() {
            spyOn(beanstalkClient, 'connect').andCallFake(function(callback) {
                return callback();
            });
            spyOn(beanstalkClient, 'use').andCallFake(function(tubeName, callback) {
                return callback(null, tubeName);
            });
            spyOn(beanstalkClient, 'put').andCallFake(function(priority, delay, ttr, job, callback) {
                return callback(null, 1);
            });

            runs(function() {
                done = false;

                strategy.publish.call(publisherMockInstance, options, jobStatusUpdater, job, function(err, result) {
                    expect(err).toBeFalsy();
                    expect(result).toBe(1);
                    done = true;
                })
            });

            waitsFor(function() {return done;}, 'Done', 100);

            runs(function() {
                expect(beanstalkClient.connect).toHaveBeenCalled();
                expect(beanstalkClient.use).toHaveBeenCalled();
                expect(beanstalkClient.use.mostRecentCall.args[0]).toBe('single-tube');
                expect(beanstalkClient.put).toHaveBeenCalled();
                expect(beanstalkClient.put.mostRecentCall.args[0]).toBe(1);
                expect(beanstalkClient.put.mostRecentCall.args[1]).toBe(0);
                expect(beanstalkClient.put.mostRecentCall.args[2]).toBe(120);
                expect(beanstalkClient.put.mostRecentCall.args[3]).toEqual(JSON.stringify(job));
            });
        });

        it('job not published because of an error connecting to beanstalk', function() {
            spyOn(beanstalkClient, 'connect').andCallFake(function(callback) {
                return callback('CONNECTION REFUSED.');
            });
            spyOn(beanstalkClient, 'use');
            spyOn(beanstalkClient, 'put');

            runs(function() {
                done = false;

                strategy.publish.call(publisherMockInstance, options, jobStatusUpdater, job, function(err, result) {
                    expect(err).toEqual('CONNECTION REFUSED.');
                    expect(result).toBeFalsy();
                    done = true;
                })
            });

            waitsFor(function() {return done;}, 'Done', 100);

            runs(function() {
                expect(beanstalkClient.connect).toHaveBeenCalled();
                expect(beanstalkClient.use).not.toHaveBeenCalled();
                expect(beanstalkClient.put).not.toHaveBeenCalled();
            });
        });

        it('job not published because of an error selecting the tube in beanstalk', function() {
            spyOn(beanstalkClient, 'connect').andCallFake(function(callback) {
                return callback();
            });
            spyOn(beanstalkClient, 'use').andCallFake(function(tubeName, callback) {
                return callback('INTERNAL ERROR.');
            });
            spyOn(beanstalkClient, 'put');

            runs(function() {
                done = false;

                strategy.publish.call(publisherMockInstance, options, jobStatusUpdater, job, function(err, result) {
                    expect(err).toEqual('INTERNAL ERROR.');
                    expect(result).toBeFalsy();
                    done = true;
                })
            });

            waitsFor(function() {return done;}, 'Done', 100);

            runs(function() {
                expect(beanstalkClient.connect).toHaveBeenCalled();
                expect(beanstalkClient.use).toHaveBeenCalled();
                expect(beanstalkClient.use.mostRecentCall.args[0]).toBe('single-tube');
                expect(beanstalkClient.put).not.toHaveBeenCalled();
            });
        });

        it('job not published because of an error putting the job in the tube on beanstalk', function() {
            spyOn(beanstalkClient, 'connect').andCallFake(function(callback) {
                return callback();
            });
            spyOn(beanstalkClient, 'use').andCallFake(function(tubeName, callback) {
                return callback(null, tubeName);
            });
            spyOn(beanstalkClient, 'put').andCallFake(function(priority, delay, ttr, job, callback) {
                return callback('JOB_TOO_BIG');
            });

            runs(function() {
                done = false;

                strategy.publish.call(publisherMockInstance, options, jobStatusUpdater, job, function(err, result) {
                    expect(err).toEqual('JOB_TOO_BIG');
                    expect(result).toBeFalsy();
                    done = true;
                })
            });

            waitsFor(function() {return done;}, 'Done', 100);

            runs(function() {
                expect(beanstalkClient.connect).toHaveBeenCalled();
                expect(beanstalkClient.use).toHaveBeenCalled();
                expect(beanstalkClient.use.mostRecentCall.args[0]).toBe('single-tube');
                expect(beanstalkClient.put).toHaveBeenCalled();
                expect(beanstalkClient.put.mostRecentCall.args[0]).toBe(1);
                expect(beanstalkClient.put.mostRecentCall.args[1]).toBe(0);
                expect(beanstalkClient.put.mostRecentCall.args[2]).toBe(120);
                expect(beanstalkClient.put.mostRecentCall.args[3]).toEqual(JSON.stringify(job));
            });
        });

        it('job published delayed because connection to beanstalk in progress', function() {
            var called = false;

            spyOn(global, 'setTimeout').andCallFake(function(callback, delay) {
                    called = true;
                }
            );

            publisherMockInstance.isConnecting = true;

            runs(function() {
                strategy.publish.call(publisherMockInstance, options, jobStatusUpdater, job, function(err, result) {
                })
            });

            waitsFor(function() {return called;}, 'called', 100);

            runs(function() {
                expect(called).toBeTruthy();
            });
        });
    });
});
