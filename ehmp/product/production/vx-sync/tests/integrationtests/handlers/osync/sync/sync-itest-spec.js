'use strict';
/*global describe, it, before, beforeEach, after, afterEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/sync/sync');

var mockConfig = {
    jds: {
        protocol: 'http',
        host: 'IP        ',
        port: 9080,
        osyncjobfrequency: 172800000
    },
    syncUrl: "http://IP           /sync/doLoad?icn=",
};

var mockHandlerCallback = {
    callback: function(error, response) {
    }
};

describe('sync request handler integration test', function() {
    describe('sync.handle', function() {
        beforeEach(function() {
            spyOn(mockHandlerCallback, 'callback');
        });

        //it('error condition: invalid icn causing a 400 error', function () {
        //    var done = false;
        //    var patients = [];
        //    var patient = {};
        //
        //    var testData = null;
        //    var testError = null;
        //
        //    runs(function () {
        //        var job = {};
        //        job.type = 'sync';
        //        job.source = 'appointments';
        //
        //        patient.ien = '9E7A;1234';
        //        patient.dfn='1234';
        //        patients.push(patient);
        //        job.patients = patients;
        //
        //        var mockEnvironment = null;
        //        handler(log, mockConfig, mockEnvironment, job, function (error, data) {
        //            console.log("data " + data);
        //            testData = data;
        //            testError = error;
        //            done = true;
        //            mockHandlerCallback.callback();
        //        });
        //
        //        expect(mockHandlerCallback.callback).toHaveBeenCalled();
        //
        //        //expect(testData).toBe(undefined);
        //        expect(testError).toBe("ERROR: sync.validateSync: get didn't return a 202 response: 400\nBody: The value \"9E7A;1234\" for patient id type \"icn\" was not in a valid format");
        //
        //    });
        //
        //    waitsFor(function () {
        //        return done;
        //    }, 'Callback not called', 100);
        //
        //    runs(function () {
        //    });
        //});


    });

});

