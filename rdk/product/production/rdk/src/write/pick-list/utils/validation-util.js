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
module.exports.isWholeNumber = function(num) {
    if (nullUtil.isNullish(num)) {
        return false;
    }

    if (typeof num === 'string' && _.isEmpty(num)) {
        return false;
    }

    return num % 1 === 0;
};

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


module.exports.isStringNullish = isStringNullish;
