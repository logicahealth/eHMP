'use strict';

var clearPatientUtil = require(global.VX_UTILS + 'clear-patient-util');
var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var inspect = require('util').inspect;
var format = require('util').format;

function handle(log, config, environment, job, handlerCallback) {
	log.debug('patient-record-retirement-handler.handle: entering method for job: %s', inspect(job));

	if (!jobUtil.isValid(jobUtil.patientRecordRetirementType(), job)) {
		log.error('patient-record-retirement-handler.handle: Invalid job received.  Job: %j', job);
		return handlerCallback(errorUtil.createFatal('Invalid format for job', job));
	}

	getPatientIdentifiersFromJds(log, config, environment, job, function(error, identifiers, jpid) {
		if (error) {
			log.error('patient-record-retirement-handler.handle: getPatientIdentifiersFromJds returned error: %s', error);
			return handlerCallback(errorUtil.createTransient(error, job));
		}

		clearPatientUtil.clearPatient(log, config, environment, true, identifiers, jpid, function(error) {
			if (error) {
				log.error('patient-record-retirement-handler.handle: clearPatientUtil.clearPatient returned error: %s', error);
				return handlerCallback(errorUtil.createTransient(error, job));
			}
			log.debug('patient-record-retirement-handler.handle: completed for job: %s', inspect(job));
			return handlerCallback(null, 'success');
		});
	});
}

function getPatientIdentifiersFromJds(log, config, environment, job, callback) {
	if(job.identifiers && job.jpid){
		log.debug('patient-record-retirement-handler: corresponding identifiers list already present in job %s; skipping to next step', inspect(job));
		return callback(null, job.identifiers, job.jpid);
	}

	var id = job.patientIdentifier.value;
	log.debug('patient-record-retirement-handler.getPatientIdentifiersFromJds: entering method for identifier: %s', inspect(id));

	environment.jds.getPatientIdentifierByPid(id, function(error, response, result) {
		var errorMessage;
		if (error) {
			errorMessage = format('patient-record-retirement-handler.getPatientIdentifiersFromJds: received error from JDS when attempting to get identifiers for: %s, error: %s', id, inspect(error));
			return callback(errorMessage);
		}
		if (!response || response.statusCode !== 200) {
			errorMessage = format('patient-record-retirement-handler.getPatientIdentifiersFromJds: received unexpected response from JDS when attempting to get identifiers for: %s, response: %s', id, inspect((response) ? response.body : null));
			return callback(errorMessage);
		}
		if (!result) {
			errorMessage = format('patient-record-retirement-handler.getPatientIdentifiersFromJds: received null result from JDS when attempting to get identifiers for: %s', id);
			return callback(errorMessage);
		}

		var identifiers = result.patientIdentifiers;
		var jpid = result.jpid;

		log.debug('patient-record-retirement-handler.getPatientIdentifiersFromJds: returning identifiers: %s, jpid: %s', identifiers, jpid);
		return callback(null, identifiers, jpid);
	});
}

module.exports = handle;
handle._steps = {
	getPatientIdentifiersFromJds: getPatientIdentifiersFromJds
};