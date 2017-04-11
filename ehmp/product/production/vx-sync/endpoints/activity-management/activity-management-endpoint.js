'use strict';
var inspect = require(global.VX_UTILS + 'inspect');
var pidUtils = require(global.VX_UTILS + 'patient-identifier-utils');
var uidUtils = require(global.VX_UTILS + 'uid-utils');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var actUtils = require(global.VX_UTILS + 'activity-management-utils');

var _ = require('underscore');

function registerAMEAPI(log, config, environment, app) {
    app.post('/activity-management-event', handleActivityManagementPost.bind(null, log, config, environment));
}

function handleActivityManagementPost(log, config, environment, request, response) {
	log.debug('handling activity management event post request');
	var reqBody = request.body;
	log.debug(inspect(reqBody));

	var result = _validateRequest(reqBody);
	if (!result.isValid) {
		return response.status(400).send(result.errMsg);
	}

	//extract pid based on uid
    var uidParts = uidUtils.extractPiecesFromUID(reqBody.patientUid);
   	var pid = uidParts.site + ';'+ uidParts.patient;
	var patientIdentifier = pidUtils.create('pid', pid);
	// create job and publish it
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
function _validateRequest(postData) {
	var errorMsg;
	if (_.isUndefined(postData)) {
		errorMsg = 'post data is undefined!';
		return {
			isValid: false,
			errMsg: errorMsg
		};
	}
	if (_.isEmpty(postData)) {
		errorMsg = 'post data is empty';
		return {
			isValid: false,
			errMsg: errorMsg
		};
	}

	var result = actUtils.isValidClinicalObject(postData);
	if (!result.isValid) {
		return {
			isValid: false,
			errMsg: result.errMsg
		};
	}
	return {isValid: true};
}



module.exports = registerAMEAPI;