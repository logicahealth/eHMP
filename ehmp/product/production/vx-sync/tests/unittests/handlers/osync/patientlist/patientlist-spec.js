'use strict';
/*global describe, it, before, beforeEach, after, afterEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/patientlist/patientlist');

var mockConfig = {
    inttest: true
};

var mockHandlerCallback = {
    callback: function(error, response) {
    }
};

function testError(config, job, errorMsg) {
    var done = false;
    var myData = null;
    var myError = null;

    runs(function() {
        var mockEnvironment = null;
        handler(log, config, mockEnvironment, job, function(error, data) {
            done = true;
            myData = data;
            myError = error;
            mockHandlerCallback.callback();
        });
    });

    waitsFor(function() {
        return done;
    }, 'Callback not called', 100);

    runs(function() {
        expect(mockHandlerCallback.callback).toHaveBeenCalled();

        expect(myError).toBe(errorMsg);
        expect(myData).toBe(undefined);
    });
}


describe('patientlist.handle', function() {
    var job;

    beforeEach(function() {
        spyOn(mockHandlerCallback, 'callback');
        job = {};
        job.users = [
            {
                "duz": {
                    "9E7A": '10000000237'
                },
                "lastlogin": '20150330'
            }, {
                "duz": {
                    "C877": '10000000239'
                },
                "lastlogin": '20150330'
            }
        ];
    });

    it('error condition: incorrect job type', function() {
        testError(mockConfig, job, 'patientlist.validate: Could not find job type');
    });

    it('error condition: incorrect job type', function() {
        job.type = 'BOGUS';
        testError(mockConfig, job, 'patientlist.validate: job type was not patientlist');
    });
});
