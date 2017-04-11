'use strict';
var _ = require('lodash');

module.exports.validateCreateModel = validateCreateModel;

// Verifies both the structure and the contents of a passed in object, should return MODEL_VALID string
function validateCreateModel(errorMessages, model) {
	// Check for grossly malformed argument
	if (!_.isObject(model)) {
		errorMessages.push('model argument malformed');
        return;
	}
	if (_.isEmpty(model)) {
		errorMessages.push('model required but not set');
        return;
	}

	// Ensure a correctly structured model argument
	var requiredOuterFields = ['patientUid', 'authorUid', 'domain', 'subDomain', 'visit', 'ehmpState', /*'referenceId',*/ 'data'];
	var requiredVisitFields = ['location', 'serviceCategory', 'dateTime'];
	var requiredDataFields = ['sourceUid'];
    var hasVisit = _.has(model, 'visit');
    var hasData = _.has(model, 'data');
    if (hasVisit) {
        var visit = model.visit;
        if (!requiredFieldsExist(requiredVisitFields, visit)) {
            errorMessages.push('clinical object structure is malformed: required fields for visit subfield are missing');
        }
        if (!dateTimeIsValid(visit.dateTime)) {
            errorMessages.push('visit has malformed dateTime field');
        }
    } else {
        errorMessages.push('clinical object is missing visit data element');
    }
    if (hasData) {
        var data = model.data;
        if (!requiredFieldsExist(requiredDataFields, data)) {
            errorMessages.push('clinical object structure is malformed: required fields for data subfield are missing');
        } else {
            if (data.sourceUid.lastIndexOf('urn:va:ehmp-', 0) !== 0) {
                errorMessages.push('data subfield must have sourceUid that starts with urn:va:ehmp-');
            }
        }
    } else {
        errorMessages.push('clinical object is missing data element');
    }
	if (!requiredFieldsExist(requiredOuterFields, model)) {
		errorMessages.push('clinical object structure is malformed: required outer fields are missing');
	}

	// Ensure referenceId exists and is set to either null or undefined (special case)
	if (!_.has(model, 'referenceId')) {
		model.referenceId = null;
	} else if ((!_.isNull(model.referenceId)) && (!_.isUndefined(model.referenceId))) {
		errorMessages.push('referenceId is not used for note objects. Exclude or set to null.');
	}
	if (model.domain !== 'ehmp-note') {
		errorMessages.push('domain field must be exact string: "ehmp-note"');
	}
	if (model.subDomain !== 'noteObject') {
		errorMessages.push('subDomain field must be exact string: "noteObject"');
	}
	if (model.ehmpState !== 'active') {
		errorMessages.push('ehmp state is not set to active');
	}

	return;
}

function requiredFieldsExist(requiredFields, model) {
	var errors = [];
    if (!model) {
        return false;
    }
	_.each(requiredFields, function(fieldName) {
		if (!_.has(model, fieldName)) {
			errors.push('model does not contain required element: ' + fieldName);
		}
		if (_.isEmpty(getValue(model, fieldName))) {
			errors.push(fieldName + ' cannot be empty');
		}
	});

	if (_.size(errors) === 0) {
		return true;
	}

	return false;
}

function getValue(model, key) {
	return key.split('.').reduce(function(object, field) {
		return _.isEmpty(object) ? object : object[field];
	}, model);
}

// We use 4-colon-delineated clusters in several places, this helper takes a cluster and clamps it to be similar to a desired form (* in form is a wildcard) - This function will fail on "::" empty fields
function clusterIsMatch(cluster, form) { //jshint ignore:line
	if (_.isEmpty(cluster) || _.isEmpty(form)) {
		return false;
	}

	var clusterPieces = cluster.split(':');
	var formPieces = form.split(':');

	if (clusterPieces.length !== formPieces.length) {
		return false;
	}

	for (var n = 0; n < formPieces.length; n++) {
		if (formPieces[n] === '*') {
			formPieces[n] = clusterPieces[n];
		}
		if (_.isEmpty(formPieces[n]) || _.isEmpty(clusterPieces[n])) {
			return false;
		}
		if (String(formPieces[n]) !== String(clusterPieces[n])) {
			return false;
		}
	}

	return true;
}

// We don't use Date objects, so this validates strings piece by piece
function dateTimeIsValid(dateTime) {
	if ((!_.isEmpty(dateTime)) && typeof(dateTime) === 'string' && dateTime.length === 14) {
		var year = dateTime.substr(0, 4);
		var month = dateTime.substr(4, 2);
		var day = dateTime.substr(6, 2);
		var hour = dateTime.substr(8, 2);
		var minute = dateTime.substr(10, 2);
		var second = dateTime.substr(12, 2);

		// Date.parse will give back NaN if we didn't give it a correct format, use this to validate:
		var dateTimeCast = new Date(year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second);
		if (!isNaN(Date.parse(dateTimeCast))) {
			return true;
		}
	}

	return false;
}
