'use strict';

require('../../../../env-setup');
var getDemographics = require(global.VX_HANDLERS + 'resync-request/get-patient-demographics');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var log = require(global.VX_DUMMIES + 'dummy-logger');

var config = {
    jds: {
        protocol: 'http',
        host: '10.2.2.110',
        port: 9080
    }
};

var demographicsData = {
    "apiVersion": "1.0",
    "data": {
        "updated": 20160216141659,
        "totalItems": 2,
        "currentItemCount": 2,
        "items": [
            {
                "pid": "9343;23",
                "displayName": "Ten,Patient"},
            {
                "pid": "DOD;443343",
                "displayName": "Ten,Patient"}
        ]
    }};

describe('When get patient demographics', function() {
    var environment, job, callback, called, calledError;

    beforeEach(function() {
        job = {"patientIdentifier": {"type": "icn", "value": "10110V004877"}};

        environment = {jds: new JdsClientDummy(log, config)};

        callback = function(error) {
            called = true;
            calledError = error;
        };
    });

    it('verify icn demographics added to job', function() {
        environment.jds._setResponseData([null], [{statusCode: 200}], demographicsData);

        getDemographics.loadDemographics(environment, log, job, callback)

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBeFalsy();
            expect(job.demographics).toBeDefined();
            expect(job.demographics.pid).toBe('9343;23');
        });
    });

    it('verify dod demographics added to job', function() {
        environment.jds._setResponseData([null], [{statusCode: 200}], demographicsData);
        var dodJob = {"patientIdentifier": {"type": "pid", "value": "DOD;443343"}}

        getDemographics.loadDemographics(environment, log, dodJob, callback)

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBeFalsy();
            expect(dodJob.demographics).toBeDefined();
            expect(dodJob.demographics.pid).toBe('DOD;443343');
        });
    });

    it('verify error returned if no demographics found', function() {
        environment.jds._setResponseData([null], [{statusCode: 200}], {});

        getDemographics.loadDemographics(environment, log, job, callback)

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).not.toBeFalsy();
        });
    });

    it('verify error returned if error returned from jds', function() {
        environment.jds._setResponseData(["Connection Error"], [null], null);

        getDemographics.loadDemographics(environment, log, job, callback)

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).not.toBeFalsy();
        });
    });

    it('verify error returned if error response returned from jds', function() {
        environment.jds._setResponseData([null], [{statusCode: 500}], {error: 'error'});

        getDemographics.loadDemographics(environment, log, job, callback)

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).not.toBeFalsy();
        });
    });
});
