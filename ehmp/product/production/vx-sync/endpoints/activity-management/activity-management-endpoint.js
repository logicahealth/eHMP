'use strict';
var inspect = require(global.VX_UTILS + 'inspect');
var pidUtils = require(global.VX_UTILS + 'patient-identifier-utils');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var _ = require('underscore');

function registerAMEAPI(log, config, environment, app) {
    app.post('/activity-management-event', handleActivityManagementPost.bind(null, log, config, environment));
}

function handleActivityManagementPost(log, config, environment, request, response) {
	log.debug('handling activity management event post request');
	var reqBody = request.body;
	log.debug(inspect(reqBody));

	_validateRequest(reqBody, function(isValid, errMsg) {
		if (!isValid) {
			return response.status(400).send(errMsg);
		}
	});
	// create job and publish it
	var patientIdentifier = pidUtils.create('pid', reqBody.pid);
	var job = jobUtil.createActivityManagementEvent(patientIdentifier, reqBody.domain, reqBody);
	environment.publisherRouter.publish(job, function(error){
		if (!error) {
			return response.status(200).send('OK');
		}
		else {
			return response.status(500).send('Error publishing the job.');
		}
	});
}

// utility function
function _validateRequest(postData, callback) {
	var errorMsg;
	var requiredFields = ['uid', 'pid', 'domain', 'encounter-uid'];
	if (_.isUndefined(postData)) {
		errorMsg = 'post data is undefined!';
		return callback(false, errorMsg);
	}
	if (_.isEmpty(postData)) {
		errorMsg = 'post data is empty';
		return callback(false, errorMsg);
	}
	var missingField = _.find(requiredFields, function(field){
		return _.isUndefined(postData[field]);
	});
	if (missingField) {
		return callback(false, 'missing required field ' + missingField);
	}
	// make sure pid is a valid pid format
	if (!pidUtils.isPid(postData.pid)) {
		return callback(false, 'invalid pid format');
	}
	return callback(true);
}

module.exports = registerAMEAPI;