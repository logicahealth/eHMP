'use strict';

var uidUtils = require(global.VX_UTILS + 'uid-utils');
var _ = require('underscore');


// utiity function to validate clinical object data received is in right format.
// if valid, return an object with isValid attribute set to true, otherwise return an
// object with isValid set to false, and also with errMsg.

function isValidClinicalObject(clinicalObj) {
	if (_.isUndefined(clinicalObj)) {
		return {
			isValid: false,
			errMsg: 'data is undefined.'
		};
	}
	var requiredFields = ['uid', 'patientUid', 'authorUid', 'domain', 'subDomain', 'visit'];
	var missingField = _.find(requiredFields, function(field){
		return _.isUndefined(clinicalObj[field]);
	});
	if (missingField) {
		return {
			isValid: false,
			errMsg: 'missing required field ' + missingField
		};
	}
	// make sure uid is a valid format for (uid, patientUid, authorUid)
	var invalidUid = _.find(['uid', 'patientUid', 'authorUid'], function(field){
		var isValid;
		uidUtils.isValidUidFormat(clinicalObj[field], function(error){
			isValid = _.isUndefined(error);
		});
		return !isValid;
	});
	if (invalidUid) {
		return {
			isValid: false,
			errMsg: 'invalid uid format for field: ' + invalidUid
		};
	}
	var result = validateVisitData(clinicalObj.visit);
	if (!result.isValid) {
		return {
			isValid: false,
			errMsg: result.errMsg
		};
	}
	return {isValid: true};
}

// function to check if visit data is valid
function validateVisitData(visit) {
	var requiredFields = ['location', 'serviceCategory', 'dateTime'];
	var missingField = _.find(requiredFields, function(field){
		return _.isUndefined(visit[field]);
	});
	if (missingField) {
		return {
			isValid: false,
			errMsg: 'Visit - missing required field ' + missingField
		};
	}
	return {isValid: true};
}

module.exports.isValidClinicalObject = isValidClinicalObject;