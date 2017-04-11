'use strict';

var _ = require('lodash');

var sensitiveDataValue = '*SENSITIVE*';
// last5 is considered sensitive but needed so leave it and let it get masked
var sensitiveDataFields = ['last5', 'ssn', 'birthDate'];
var blacklistDataFields = ['last4', 'ssn4'];

// Replace contents of sensitive data fields with the "sensitive data" value.
function hideSensitiveFields(patient, pepResults) {
    return removeSensitiveFields(_.mapValues(patient, function(value, key, object) {
        if (_.includes(sensitiveDataFields, key)) {
            return sensitiveDataValue;
        }
        return value;
    }), pepResults);
}

// Remove sensitivity-related fields that are unused by the application
function removeSensitiveFields(obj, results) {
    //Remove blacklisted Items

    obj = _.omit(obj, blacklistDataFields);

    // TODO: why does this function also set sensitivity to false? This seems like room for a separate function.
    if (results && results.code && (results.code === 'Permit')) {
        obj.sensitive = false;
    }

    return obj;
}

module.exports.hideSensitiveFields = hideSensitiveFields;
module.exports.removeSensitiveFields = removeSensitiveFields;

module.exports._sensitiveDataValue = sensitiveDataValue;
module.exports._sensitiveDataFields = sensitiveDataFields;
module.exports._blacklistDataFields = blacklistDataFields;
