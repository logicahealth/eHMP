'use strict';

var _ = require('lodash');

var sensitiveDataValue = '*SENSITIVE*';
var sensitiveDataFields = ['ssn', 'birthDate'];
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
    if (obj.last4) {
        // This field is considered sensitive and is unused by the application, so remove it
        delete obj.last4;
    }
    //Remove last Five SSN Item
    if (obj.last5) {
        // This field is considered sensitive and is unused by the application, so remove it
        delete obj.last5;
    }
    //Remove last SSN4 Item
    if (obj.ssn4) {
        // This field is considered sensitive and is unused by the application, so remove it
        delete obj.ssn4;
    }
    if (results && results.code && (results.code === 'Permit')) {
        obj.sensitive = false;
    }

    return obj;
}

module.exports.hideSensitiveFields = hideSensitiveFields;
module.exports.removeSensitiveFields = removeSensitiveFields;

module.exports._sensitiveDataValue = sensitiveDataValue;
