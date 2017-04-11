'use strict';
var _ = require('lodash');
var moment = require('moment');

// generate note object madlib string

var INTERPRETATION_MAP = {
    'High': 'High',
    'High alert': 'Critically High',
    'Low': 'Low',
    'Low alert': 'Critically Low'
};

module.exports.getMadlibString = getMadlibString;

function normalizeDate(input) {
    var retVal;

    input = input.toString();
    if (!_.isEmpty(input) && input.length > 8) {
        input = input.substr(0, 8);
    }

    retVal = moment(input).format('MM/DD/YYYY');

    return retVal;
}

function getMadlibString(errorMessages, sourceClinicalObject) {
    if (!_.isObject(sourceClinicalObject)) {
        errorMessages.push('sourceClinicalObject model is not an object');
        return;
    }

    var data = sourceClinicalObject.data;
    if (!_.isObject(data)) {
        return 'Default lab orders madlib for ' + sourceClinicalObject.uid;
    }

    var madlibString = '';
    if (data.typeName) {
        madlibString += data.typeName;
    }
    if (data.specimen) {
        madlibString += ', ' + data.specimen;
    }
    if (data.observed) {
        madlibString += ', ' + normalizeDate(data.observed);
    }
    if (INTERPRETATION_MAP[data.interpretationName]) {
        madlibString += ', ' + INTERPRETATION_MAP[data.interpretationName];
    }
    if (data.result) {
        madlibString += ', ' + data.result;
    }
    if (data.units) {
        madlibString += ' ' + data.units;
    }
    return _.trim(madlibString, ', ');
}
