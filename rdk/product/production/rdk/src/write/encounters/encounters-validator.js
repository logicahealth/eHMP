'use strict';

var _ = require('lodash');
var nullChecker = require('../../utils/nullchecker');
var paramUtil = require('../../utils/param-converter');
var filemanDateUtil = require('../../utils/fileman-date-converter');

function validateInput(model, logger, errors) {

    if (nullChecker.isNotNullish(model)) {

        if (nullChecker.isNullish(model.patientDFN)) {
            errors.push('The field patientDFN is required');
        }

        if (nullChecker.isNullish(model.isInpatient)) {
            errors.push('The field isInpatient is required');
        }

        if (nullChecker.isNullish(model.locationUid)) {
            errors.push('The field locationUid is required');
        }

        if (nullChecker.isNullish(model.encounterDateTime)) {
            errors.push('The field encounterDateTime is required');
        } else {
            var encounterDateTimeMoment = paramUtil.convertWriteBackInputDate(model.encounterDateTime);
            if (!encounterDateTimeMoment) {
                errors.push('The field encounterDateTime is malformed.');
            } else {
                var encounterDateTimeFilemanFormat = filemanDateUtil.getFilemanDateTime(encounterDateTimeMoment.toDate());
                if (encounterDateTimeFilemanFormat <= 0) {
                    errors.push('The field encounterDateTime is malformed.');
                }
            }
        }

        return true;

    } else {
        errors.push('Missing message body');
        return false;
    }
}

module.exports.save = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;
    var errors = [];
    validateInput(model, logger, errors);

    var retVal = _.size(errors) === 0 ? null : errors;
    return setImmediate(callback, retVal);
};

module.exports._validateInput = validateInput;
