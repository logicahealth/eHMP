'use strict';

var nullUtil = require('../../core/null-utils');
var _ = require('lodash');



/**
 * Because lodash treats NaN as a number, we need a way to ensure that the value passed in is not only a number but
 * that it is not a floating value.
 *
 * @param num the variable to check to see if it's a whole number
 * @returns {boolean} True if a whole number.
 */
function isWholeNumber(num) {
    if (nullUtil.isNullish(num)) {
        return false;
    }

    if (typeof num === 'string' && _.isEmpty(num)) {
        return false;
    }

    return num % 1 === 0;
}

/**
 * Checks to see if value is null, empty, or is not a String.  If any of those are true, this will return true.
 *
 * @param value The string to check for null, empty, or not a String
 * @returns {boolean} returns true if value is null, empty, or is not a String
 */
function isStringNullish(value) {
    return (nullUtil.isNullish(value) || !_.isString(value) || _.isEmpty(value));
}

/**
 * After calling isStringNullish, this will validate that there are at least 3 characters in that String (some RPC calls
 * require at least 3 characters).
 *
 * @param value The string to check for null, empty, or not a String
 * @returns {boolean} returns true if value is null, empty, not a String, or the String is less than 3 characters.
 */
module.exports.isStringLessThan3Characters = function(value) {
    if (isStringNullish(value)) {
        return true;
    }

    return value.length < 3;
};

/**
 * Gets the patientDFN (if required) after validating that a valid pid param has been passed in
 * and the pid site matched the site param
 *
 * @param params The request params that contain the site and patient pid
 * @param options The options that contains if the patient dfn is required to be present or not
 * @returns {callback} returns callback object.
 */
module.exports.getPatientDFN = function(params, options, callback) {
    var patientDFN;
    var patientSite;
    var requiresDfn = _.get(options, 'requiresDfn', false);
    var site = _.get(params, 'site') || '';
    var splitPid = (_.get(params, 'pid') || '').split(';');
    if (splitPid.length === 2) {
        patientDFN = _.last(splitPid);
        patientSite = _.first(splitPid);
    }
    if (!requiresDfn && isStringNullish(patientDFN)) {
        return callback(null, null);
    }
    if (!isWholeNumber(patientDFN)) {
        return callback('Patient DFN must be a whole number', null);
    }
    if (isStringNullish(site)) {
        return callback('Site param cannot be empty', null);
    }
    if (patientSite !== site) {
        return callback('Patient Site does not equal Site param', null);
    }
    return callback(null, patientDFN);
};

module.exports.isStringNullish = isStringNullish;
module.exports.isWholeNumber = isWholeNumber;
