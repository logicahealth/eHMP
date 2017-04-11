'use strict';
var _ = require('lodash');

// generate note object madlib string

module.exports.getMadlibString = getMadlibString;

function getMadlibString(errorMessages, sourceClinicalObject) {
    if (!_.isObject(sourceClinicalObject)) {
        errorMessages.push('sourceClinicalObject model is not an object');
        return;
    }

    if (sourceClinicalObject.data.content) {
        var madlibString = 'Ordered ' + sourceClinicalObject.data.content;
        if(sourceClinicalObject.data.statusName){
            madlibString += ' ' + sourceClinicalObject.data.statusName;
        }
        return madlibString;
    }

    return 'Default lab orders madlib for ' + sourceClinicalObject.uid;
}