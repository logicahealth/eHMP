'use strict';

var _ = require('underscore');
var moment = require('moment');
var uidUtils = require(global.VX_UTILS + 'uid-utils');
var xformUtils = require(global.VX_UTILS + 'xform-utils');

function dodVitalToVPR(logger, record, edipi){
    var systemId = 'DOD';

    if (!record){
        return;
    }

    var dateTimeTaken = moment(record.dateTimeTaken, 'x').format('YYYYMMDDHHmmss');
    var ncid = _.find(record.codes, function(codeItem) {
        return codeItem.system === 'DOD_NCID';
    });
    var loinc = _.find(record.codes, function(codeItem) {
        return codeItem.system === 'LOINC';
    });

    var uidSuffix = '-';               // Create a UID suffix to prevent ID collisions for vitals that contain multiple observations:
    if (_.isUndefined(ncid)) {         // If there is no DOD_NCID code item (e.g., for Blood Pressure),
        if (!_.isUndefined(loinc)) {   // then fallback to LOINC code item
            uidSuffix += loinc.code;   // and create the suffix in the form '-<code>'
        }                              // ...
    } else {                           // otherwise
        uidSuffix += ncid.code;        // use the DOD_NCID code item
    }

    return {
        codes: xformUtils.transformCodes(record.codes),
        observed: dateTimeTaken,
        resulted: dateTimeTaken,
        typeName: record.vitalType,
        result: record.rate,
        units: record.units,
        facilityName: systemId,
        facilityCode: systemId,
        uid: uidUtils.getUidForDomain('vital', 'DOD', edipi, record.cdrEventId) + uidSuffix,
        pid: 'DOD;' + edipi
    };
}

module.exports = dodVitalToVPR;
