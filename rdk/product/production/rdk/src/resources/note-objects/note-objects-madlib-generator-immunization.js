'use strict';
var _ = require('lodash');
var moment = require('moment');

var lineFormatter = '\n';

function normalizeDate(input) {
    var retVal;

    input = input.toString();
    if (! _.isEmpty(input) && input.length> 8) {
        input = input.substr(0, 8);
    }

    retVal = moment(input).format('MM/DD/YYYY');


    return retVal;
}

function getImmunizationMadlib(immunization) {
    var retVal = 'Immunization: ' + immunization.name + lineFormatter;
    // they have \r\n at the end of cdcFullVaccineName
    if (_.isString(immunization.cdcFullVaccineName) && immunization.cdcFullVaccineName.indexOf('\r\n') > 0) {
        immunization.cdcFullVaccineName = immunization.cdcFullVaccineName.substr(0, immunization.cdcFullVaccineName.indexOf('\r\n'));
    }
    retVal += 'Full Name: ' + immunization.cdcFullVaccineName + lineFormatter;
    retVal += 'Date Administered: ' + normalizeDate(immunization.administeredDateTime);

    var location = 0;
    if (_.isString(immunization.seriesName)) {
        if (immunization.seriesName.indexOf('SERIES ') === 0) {
            location = ('Series ').length;
            immunization.seriesName = immunization.seriesName.substr(location, immunization.cdcFullVaccineName.length);
        }
    }

    // DE4348
    if (! _.isEmpty(immunization.seriesName)){
        retVal += ', Series: ' + immunization.seriesName + lineFormatter;
    } else {
        retVal += ', ' + lineFormatter;
    }

    retVal += 'Manufacturer: ' + immunization.manufacturer + lineFormatter;
    retVal += 'Lot #: ' + immunization.lotNumber + ', ';
    retVal += 'Expiration Date: ' + normalizeDate(immunization.expirationDate) + lineFormatter;
    retVal += 'Location: ' + immunization.locationName + ',  ';
    retVal += 'Dosage: ' + immunization.dosage + ' ' + immunization.dosageUnits + lineFormatter;
    retVal += 'Admin Route/Site: ' + immunization.routeOfAdministration + '  ' + immunization.siteOfAdministration + lineFormatter;

    var vis = immunization.vis;
    if (_.isArray(vis)) {
        retVal += 'Vaccine Information Statement(s):' + lineFormatter;
        _.forEach(vis, function (input) {
            var visName = input.visName;

            if (!_.isEmpty(toString(visName))) {
                retVal += 'VIS Name: ' + visName + ', ';
            }

            var editionDate = input.editionDate;
            if (!_.isEmpty(toString(editionDate))) {
                retVal += 'Edition Date: ' + normalizeDate(editionDate) + ', ';
            }

            var language = input.language;
            if (!_.isEmpty(toString(language))) {
                retVal += 'Language: ' + language;
            }

            retVal += lineFormatter;
        });
    }

    if (!_.isUndefined(immunization.performerName)) {
        retVal += 'Administered by: ' + immunization.performerName + lineFormatter;
    }

    if (!_.isUndefined(immunization.orderingProvider)) {
        retVal += 'Ordered by: ' + immunization.orderingProvider + lineFormatter;
    }

    if (!_.isUndefined(immunization.comment)) {
        retVal += 'Comments: ' + immunization.comment + lineFormatter;
    }


    return retVal;
}

function getMadlibString(errorMessages, sourceClinicalObject) {
    if (!_.isObject(sourceClinicalObject)) {
        errorMessages.push('sourceClinicalObject model is not an object');
        return;
    }

    var immunization = sourceClinicalObject.data;
    if (!_.isEmpty(immunization)) {
        return getImmunizationMadlib(sourceClinicalObject.data);
    }

    return 'Default immunization madlib for ' + sourceClinicalObject.uid;
}

module.exports.getMadlibString = getMadlibString;
module.exports._getImmunizationMadlib = getImmunizationMadlib;
