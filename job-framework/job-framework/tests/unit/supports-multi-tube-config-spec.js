'use strict';

var supportsMultiTubeConfig =  require('../../src/supports-multi-tube-config');

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

describe('supports-multi-tube-config.js', function() {
    describe('supportsMultiTubeConfig', function() {
        it('returns false if tubeDetails do not exist', function() {
            var supported = supportsMultiTubeConfig(logger, {});
            expect(supported).toBe(false);

            supported = supportsMultiTubeConfig(logger, {ratio: 1, tubeDetails: []});
            expect(supported).toBe(false);
        });

        it('returns false if priority values are not define for a tube detail', function() {
            var supported = supportsMultiTubeConfig(logger, {tubeDetails: [{}]});
            expect(supported).toBe(false);

            supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 1, priority: {}}]});
            expect(supported).toBe(false);

            supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 1, priority: {startValue: 1}}]});
            expect(supported).toBe(false);

            supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 1, priority: {endValue: 100}}]});
            expect(supported).toBe(false);
        });

        it('returns false if a priority start or end in a detail are not numbers', function() {
            var supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 1, priority: {startValue: 'six', endValue: 100}}]});
            expect(supported).toBe(false);

            supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 1, priority: {startValue: 6, endValue: 'fifty'}}]});
            expect(supported).toBe(false);
        });

        it('returns false if a priority start or end in a detail are not in the 1 to 100 range inclusive', function() {
            var supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 1, priority: {startValue: 0, endValue: 100}}]});
            expect(supported).toBe(false);

            supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 1, priority: {startValue: 6, endValue: 0}}]});
            expect(supported).toBe(false);

            supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 1, priority: {startValue: 101, endValue: 5}}]});
            expect(supported).toBe(false);

            supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 1, priority: {startValue: 5, endValue: 101}}]});
            expect(supported).toBe(false);
        });

        it('returns false if there is an invalid ratio value', function() {
            var supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: -1, priority: {startValue: 50, endValue: 60}}]});
            expect(supported).toBe(false);

            var supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 13.4, priority: {startValue: 50, endValue: 60}}]});
            expect(supported).toBe(false);
        });

        it('returns false if a priority end is less than a priority start value in a detail', function() {
            var supported = supportsMultiTubeConfig(logger, {tubeDetails: [{ratio: 1, priority: {startValue: 50, endValue: 10}}]});
            expect(supported).toBe(false);
        });

        it('returns true if a tube details exists and all are valid', function() {
            var beanstalkJobTypeConfig = {
                "tubeDetails": [{
                    "ratio": 10,
                    "priority": {
                        "startValue": 1,
                        "endValue": 24
                    }
                }, {
                    "ratio": 5,
                    "priority": {
                        "startValue": 25,
                        "endValue": 49
                    }
                }, {
                    "ratio": 3,
                    "priority": {
                        "startValue": 50,
                        "endValue": 74
                    }
                }, {
                    "ratio": 1,
                    "priority": {
                        "startValue": 75,
                        "endValue": 100
                    }
                }]
            };

            var supported = supportsMultiTubeConfig(logger, beanstalkJobTypeConfig);
            expect(supported).toBe(true);
        });
    });
});
