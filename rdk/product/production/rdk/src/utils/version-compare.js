'use strict';

// Compare two versions numbers and return the highest one
// This code was borrowed from the UI, same function -
// updates/fixes made to this function should also be included there
function versionCompare(v1, v2) {
    // Split version numbers to its parts
    var v1parts = v1.split('.');
    var v2parts = v2.split('.');

    // Push 0 to the end of the version number that might be shorter
    //      ie. 1.2.3 and 1.2.3.4 => 1.2.3.0 and 1.2.3.4
    while (v1parts.length < v2parts.length) {
        v1parts.push('0');
    }

    while (v2parts.length < v1parts.length) {
        v2parts.push('0');
    }

    // Convert all values to numbers
    var convert = function(val) {
        val = val.replace(/\D/g, '');
        if (val.length === 0) {
            return Number.MAX_VALUE;
        }
        return Number(val);
    };
    v1parts = v1parts.map(convert);
    v2parts = v2parts.map(convert);

    for (var i = 0; i < v1parts.length; i++) {
        if (v1parts[i] === v2parts[i]) {
            continue;
        } else if (v1parts[i] > v2parts[i]) {
            return -1;
        } else if (v1parts[i] < v2parts[i]) {
            return 1;
        }
    }

    return 0;
}

module.exports.versionCompare = versionCompare;
