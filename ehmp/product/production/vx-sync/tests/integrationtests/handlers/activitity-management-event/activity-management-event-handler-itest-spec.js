'use strict';

require('../../../../env-setup');

// var _ = require('underscore');
var handle = require(global.VX_HANDLERS + 'activity-management-event/activity-management-event-handler');

var testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
// var jobUtil = require(global.VX_UTILS + 'job-utils');
var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
// var wConfig = require(global.VX_ROOT + 'worker-config');
// var JobStatusUpdater = require(global.VX_JOBFRAMEWORK + 'JobStatusUpdater');

var host = require(global.VX_INTTESTS + 'test-config');
var PORT       ;
var tubename = 'vx-sync-test';

var sampleJob = {
    type: 'activity-management-event',
    patientIdentifier: {
    type: 'pid',
    value: '9E7A;0' },
    jpid: 'b2f63ba4-98dc-4d4a-b46e-df5e73d4c6eb',
    rootJobId: '1',
    jobId: '2'
};

describe('activity-management-event-handler', function() {
    describe('Activity management event handler processes job', function() {

        it('Happy path with valid job', function() {
            var completed = false;
            var response;
            var config = {
            };

            var environment = {
                metrics: dummyLogger
            };
            testHandler(handle, dummyLogger, config, environment, host, port, tubename, sampleJob, [], null, function (result) {
                response = result;
                completed = true;
            });

            waitsFor(function () {
                return completed;
            }, 'response from activity management test handler timed out.', 10000);

            runs(function () {
                expect(response).toBeTruthy();
            });
        });

    });
});
