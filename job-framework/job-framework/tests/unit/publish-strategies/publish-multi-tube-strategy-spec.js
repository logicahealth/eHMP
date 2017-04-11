'use strict';

var _ = require('underscore');

var BeanstalkClient = require('../../../src/beanstalk-client');
var strategy = require('../../../src/publish-strategies/publish-multi-tube-strategy');

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

describe('publisher-multi-tube-strategy.js', function() {
    describe('getTubeIndex', function() {
        it('return excepted tube index when tube details are not in priority order ', function() {
            var beanstalkJobTypeConfig = {tubeDetails: [{priority: {startValue: 51, endValue: 100}}, {priority: {startValue: 1, endValue: 50}}]};

            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 50)).toBe(2);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 1)).toBe(2);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 25)).toBe(2);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 80)).toBe(1);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 100)).toBe(1);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 51)).toBe(1);
        });

        it('return excepted tube index when tube details contain gaps in priority', function() {
            var beanstalkJobTypeConfig = {tubeDetails: [{priority: {startValue: 10, endValue: 20}}, {priority: {startValue: 40, endValue: 60}}]};

            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 50)).toBe(2);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 1)).toBe(1);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 21)).toBe(1);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 30)).toBe(1);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 31)).toBe(2);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 51)).toBe(2);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 80)).toBe(2);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 100)).toBe(2);
        });

        it('return first tube index when tube details containing overlapping priorities ', function() {
            var beanstalkJobTypeConfig = {tubeDetails: [{priority: {startValue: 1, endValue: 50}}, {priority: {startValue: 40, endValue: 100}}]};

            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 50)).toBe(1);
        });

        it('return expected tube index when priority is out of expected 1 to 100 range', function() {
            var beanstalkJobTypeConfig = {tubeDetails: [{priority: {startValue: 1, endValue: 50}}, {priority: {startValue: 40, endValue: 100}}]};

            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, -10000)).toBe(1);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, -1)).toBe(1);
            expect(strategy._getTubeIndex(beanstalkJobTypeConfig, 101)).toBe(2);
        });
    });

    describe('getTubeName', function() {
        it('get tubeName for tubename and job priority when multiple tubes are supported', function() {
            var publisher = {beanstalkJobTypeConfig: {tubename: 'multi-tube',
                tubeDetails: [{priority: {startValue: 1, endValue: 50}}, {priority: {startValue: 51, endValue: 100}}]}};

            expect(strategy._getTubeName.call(publisher, {})).toEqual('multi-tube1');
            expect(strategy._getTubeName.call(publisher, {priority: 10})).toEqual('multi-tube1');
            expect(strategy._getTubeName.call(publisher, {priority: 60})).toEqual('multi-tube2');
            expect(strategy._getTubeName.call(publisher, {priority: 0})).toEqual('multi-tube1');
            expect(strategy._getTubeName.call(publisher, {priority: 101})).toEqual('multi-tube2');
        });
    });

    describe('publish', function() {
        var beanstalkClient, publisherMockInstance, done;
        var options = {priority: 1, delay: 0, ttr: 120};
        var job = {priority: 60, type: 'multi-tube', jobId: 1};

        beforeEach(function() {
            beanstalkClient = BeanstalkClient(logger, '10.3.3.6', 5000);

            publisherMockInstance = {logger: logger,
                metrics: {info: function () {}},
                client: beanstalkClient,
                queue: undefined,
                isConnected: false,
                beanstalkJobTypeConfig: {tubename: 'multi-tube',
                    tubeDetails: [{priority: {startValue: 1, endValue: 50}}, {priority: {startValue: 51, endValue: 100}}]}
            };

            publisherMockInstance.connect = function(callback) {
                strategy.connect.call(publisherMockInstance, callback);
            }
        });

        it('job published successfully', function() {
            strategy = strategy.createQueue(publisherMockInstance);

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

            waitsFor(function() {return done;}, 'Done', 1000);

            runs(function() {
                expect(beanstalkClient.connect).toHaveBeenCalled();
                expect(beanstalkClient.use).toHaveBeenCalled();
                expect(beanstalkClient.use.mostRecentCall.args[0]).toBe('multi-tube2');
                expect(beanstalkClient.put).toHaveBeenCalled();
                expect(beanstalkClient.put.mostRecentCall.args[0]).toBe(1);
                expect(beanstalkClient.put.mostRecentCall.args[1]).toBe(0);
                expect(beanstalkClient.put.mostRecentCall.args[2]).toBe(120);
                expect(beanstalkClient.put.mostRecentCall.args[3]).toEqual(JSON.stringify(job));
            });
        });

        it('job not published because of an error connecting to beanstalk', function() {
            strategy = strategy.createQueue(publisherMockInstance);

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
            strategy = strategy.createQueue(publisherMockInstance);

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
                expect(beanstalkClient.use.mostRecentCall.args[0]).toBe('multi-tube2');
                expect(beanstalkClient.put).not.toHaveBeenCalled();
            });
        });

        it('job not published because of an error putting the job in the tube on beanstalk', function() {
            strategy = strategy.createQueue(publisherMockInstance);

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
                expect(beanstalkClient.use.mostRecentCall.args[0]).toBe('multi-tube2');
                expect(beanstalkClient.put).toHaveBeenCalled();
                expect(beanstalkClient.put.mostRecentCall.args[0]).toBe(1);
                expect(beanstalkClient.put.mostRecentCall.args[1]).toBe(0);
                expect(beanstalkClient.put.mostRecentCall.args[2]).toBe(120);
                expect(beanstalkClient.put.mostRecentCall.args[3]).toEqual(JSON.stringify(job));
            });
        });
    });
});
