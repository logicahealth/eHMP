'use strict';

let _ = require('lodash');

/*
Verify that the value in 'value' is either an explicit integer value or a string
that, when parsed, parses to an integer value with a value greater than zero.
*/
function isParsedToPositiveInteger(value) {
    if(_.isUndefined(value) || _.isNull(value) || _.isBoolean(value) || String(value).length === 0) {
        return false;
    }

    let numericValue = Number(value);
    return !Number.isNaN(numericValue) && Number.isInteger(numericValue) && numericValue > 0;
}

module.exports.isParsedToPositiveInteger = isParsedToPositiveInteger;
