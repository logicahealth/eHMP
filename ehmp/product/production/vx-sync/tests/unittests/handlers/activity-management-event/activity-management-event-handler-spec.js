'use strict';

require('../../../../env-setup');
// var _ = require('underscore');

var logger = require(global.VX_DUMMIES + 'dummy-logger');

var handler = require(global.VX_HANDLERS + 'activity-management-event/activity-management-event-handler');


var testjob = {
    type: 'activity-management-event',
    patientIdentifier: { type: 'pid', value: '88C7;4325678' },
    jpid: '39b4d293-90dc-442c-aa9c-4c58191340ea',
    rootJobId: '1',
    domain: 'order-lab',
    data: {}
};

function dummyCallback () {
	return;
}

var env = {
	callback: dummyCallback
};

var config = {};

describe('activity-management-event-handler-spec.js', function() {

	describe('_isValidRequest', function() {
	    it('Error Path: job is undefined', function() {
	        var job;
	        expect(handler._isValidRequest(job, logger, env.callback)).toBe(false);
	    });

	    it('Error Path: job type is undefined', function() {
	        var job = {};
	        expect(handler._isValidRequest(job, logger, env.callback)).toBe(false);
	    });

	    it('Error Path: wrong job type', function() {
	        var job = {
	        	type: 'enterprise-sync-request'
	        };
	        expect(handler._isValidRequest(job, logger, env.callback)).toBe(false);
	    });

	    it('happy Path', function() {
	        expect(handler._isValidRequest(testjob, logger, env.callback)).toBe(true);
	    });
	});

	describe('handle', function() {

	    it('happy Path', function() {
            spyOn(env, 'callback');
	        handler(logger, config, env, testjob, env.callback);
	        expect(env.callback).toHaveBeenCalledWith();
	    });
	});
});

