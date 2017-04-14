'use strict';

require('../../../../env-setup');

var request = require('request');
var loadPatient = require(global.VX_HANDLERS + 'resync-request/demographics-sync');
var log = require(global.VX_DUMMIES + 'dummy-logger');

var config = { "configRefresh": 0,
    "syncRequestApi": {
        "protocol": "http",
        "host": "127.0.0.1",
        "port": 8080,
        "patientSyncPath": "/sync/doLoad",
        "patientUnsyncPath": "/sync/clearPatient",
        "patientStatusPath": "/sync/status",
        "patientDemoSyncPath": "/sync/demographicSync",
        "method": "POST"},
    "retrySync" : {"maxRetries": 3}};

var icnJob = {"patientIdentifier": {"type": "icn", "value": "10110V004877"},"demographics":{"birthDate":"19350407","displayName":"Ten,Patient"}};
var dodJob = {"patientIdentifier": {"type": "pid", "value": "DOD;12345"},"demographics":{"birthDate":"19350407","displayName":"Ten,Patient"}};

describe('The demographic sync ', function() {
    var libPost, callback, called, calledError;

    beforeEach(function() {
        libPost = request.post;

        callback = function(error) {
            called = true;
            calledError = error;
        };
    });

    afterEach(function() {
        request.post = libPost;
    });

    it('for an icn is posted successfully', function() {
        request.post = function(options, callback) {
            expect(options.json.icn).toBe('10110V004877');
            expect(options.json.demographics).toBeDefined();
            return callback(null, {statusCode: 200});
        };

        loadPatient(log, config, icnJob, callback)

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBeFalsy();
        });
    });

    it('for an edipi is posted successfully', function() {
        request.post = function(options, callback) {
            expect(options.json.edipi).toBe('12345');
            expect(options.json.demographics).toBeDefined();
            return callback(null, {statusCode: 200});
        };

        loadPatient(log, config, dodJob, callback)

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBeFalsy();
        });
    });

    it('post returns an error', function() {
        request.post = function(options, callback) {
            expect(options.json.edipi).toBe('12345');
            return callback("Connection Refused.");
        };

        loadPatient(log, config, dodJob, callback)

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBe("Connection Refused.");
        });
    });

    it('post returns a 500 status response', function() {
        request.post = function(options, callback) {
            expect(options.json.edipi).toBe('12345');
            return callback(null, {statusCode: 500});
        };

        loadPatient(log, config, dodJob, callback)

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).not.toBeFalsy();
        });
    });
});
