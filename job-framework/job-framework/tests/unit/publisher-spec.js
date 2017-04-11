'use strict';

var Publisher = require('../../src/publisher');
var singleTubeStrategy = require('../../src/publish-strategies/publish-single-tube-strategy');

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

describe('publisher.js', function() {
    describe('publish', function() {
        var metrics, config, originalStrategyConnect, originalStrategyPublish, job, options, jobStatusUpdater, done;

        beforeEach(function() {
            originalStrategyConnect = singleTubeStrategy.connect;
            originalStrategyPublish = singleTubeStrategy.publish;

            job = {
                type: 'resync-request',
                patientIdentifier: {
                    type: 'pid',
                    value: '9E7A;3'
                },
                rootJobId: '1',
                jobId: '1'
            };

            options = {priority: 1, delay: 0, ttr: 120};
            metrics = {};
            jobStatusUpdater = {};
            config = {
                beanstalk: {
                    repoUniversal: {
                        priority: 10,
                        delay: 0,
                        ttr: 120,
                        timeout: 10,
                        initMillis: 1000,
                        maxMillis: 15000,
                        incMillis: 1000
                    },
                    repoDefaults: {
                        host: "127.0.0.1",
                        port: 5000,
                        tubename: "vx-sync",
                        tubePrefix: "vxs-",
                        jobTypeForTube: true
                    },
                    jobTypes: {
                        singleTube: {tubename: 'singleTube'}
                    }
                }
            };
        });

        afterEach(function() {
            singleTubeStrategy.connect = originalStrategyConnect;
            singleTubeStrategy.publish = originalStrategyPublish;
        });

        it('makes connect and publish calls to single tube strategy', function() {
            spyOn(singleTubeStrategy, 'connect').andCallFake(function(callback) {
                return callback();
            });
            spyOn(singleTubeStrategy, 'publish').andCallFake(function(ob, options, jobStatusUpdater, callback) {
                expect(this.isConnected).toBeTruthy();
                return callback(null, 1)
            });

            var publisher = Publisher(logger, metrics, config, 'singleTube');

            runs(function() {
                done = false;

                publisher.connect(function(err) {
                    expect(err).toBeFalsy();

                    publisher.publish(job, options, jobStatusUpdater, function(err, beanstalkJobId) {
                        expect(err).toBeFalsy();
                        expect(beanstalkJobId).toBe(1);
                        done = true;
                    })
                })
            });

            waitsFor(function() {return done;}, 'Done', 10000);

            runs(function() {
                expect(singleTubeStrategy.connect).toHaveBeenCalled();
                expect(singleTubeStrategy.publish).toHaveBeenCalled();
            });
         });
    });
});
