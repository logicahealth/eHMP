'use strict';

require('../../../env-setup');

var _ = require('underscore');

var jds = require(global.VX_DUMMIES + 'jds-client-dummy');
var JobStatusUpdater = require(global.VX_JOBFRAMEWORK + 'JobStatusUpdater');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var config = {
    'jds': {}
};
var job = {
    'rootJobId': '1',
    'jpid': 'X',
    'type': 'enterprise-sync-request',
    'patientIdentifier': {
        'type': 'pid',
        'value': 'AAAA;3'
    }
};

var client = new jds(log.console, config);
var updater = new JobStatusUpdater(log, config, client);

var populateTimestamp = JobStatusUpdater._populateTimestamp;

function createsNumericString(value) {
    var jobState = {
        timestamp: value
    };

    populateTimestamp(jobState);

    return isStringInt(jobState.timestamp);
}

function isStringInt(value) {
    return _.isString(value) && Number(value) > 0 && Number(value) === parseInt(value);
}

describe('jobStatusUpdater-spec.js', function() {
    describe('General functionality', function() {
        it('tests that it writes job states', function() {
            updater.startJobStatus(job, function() {
                expect(client.responseIndex).toBe(1);
            });
        });

        it('tests that it writes error states', function() {
            //
            updater.errorJobStatus(job, 'error test', function() {
                expect(client.responseIndex).toBe(2);
            });
        });
    });

    describe('isStringInt()', function() {
        it('tests validity of test utility function isStringInt()', function() {
            expect(isStringInt()).toBe(false);
            expect(isStringInt(null)).toBe(false);
            expect(isStringInt(true)).toBe(false);
            expect(isStringInt(1234)).toBe(false);
            expect(isStringInt('')).toBe(false);
            expect(isStringInt('1234.5')).toBe(false);
            expect(isStringInt('1234')).toBe(true);
        });
    });

    describe('populateTimestamp()', function() {
        it('tests that non-object does not error', function() {
            expect(populateTimestamp).not.toThrow();
            expect(populateTimestamp.bind(null, null)).not.toThrow();
            expect(populateTimestamp.bind(null, null)).not.toThrow();
            expect(populateTimestamp.bind(null, 'string')).not.toThrow();
            expect(populateTimestamp.bind(null, true)).not.toThrow();
        });

        it('tests that unpopulated timestamp value is populated', function() {
        expect(isStringInt(populateTimestamp({}).timestamp)).toBe(true);
        });

        it('tests that null or undefined timestamp value is populated', function() {
            expect(createsNumericString()).toBe(true);
            expect(createsNumericString(null)).toBe(true);
        });

        it('tests that non-object is populated with a string number', function() {
            expect(createsNumericString('string')).toBe(true);
            expect(createsNumericString(true)).toBe(true);
            expect(createsNumericString(1234)).toBe(true);
        });

        it('tests that non-integer is populated with a string number', function() {
            expect(createsNumericString('1234.1')).toBe(true);
            expect(isStringInt(populateTimestamp({
                timestamp: '1234.1'
            }).timestamp)).toBe(true);
        });

        it('tests that timestamp is populated correctly', function() {
            var beforeTS = Date.now();
            var jobState = populateTimestamp({});
            var afterTS = Date.now();
            var success = beforeTS <= parseInt(jobState.timestamp) && parseInt(jobState.timestamp) <= afterTS;
            expect(success).toEqual(true);
        });
    });
});