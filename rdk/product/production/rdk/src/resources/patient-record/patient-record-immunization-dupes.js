'use strict';

var _ = require('lodash');

function isPrimarySiteDivision(primarySites, facilityCode) {
    var retVal = false;

    _.each(primarySites, function (primarySite) {
        if (primarySite.division === facilityCode) {
            retVal = true;
            return false; //DE7867 added to break when we find the value
        }
    });

    return retVal;
}

function removeDuplicateImmunizations(vistaSites, immunizations) {

    // filter out the removed records
    immunizations = _.filter(immunizations, function(immunization) {
        return _.isUndefined(immunization.removed);
    });


    // We need to make sure we had administered date and time...
    // when the record is removed, we need to fabricate one...
    // also, while we are at it, lets mark the record as primary site related or not...
    // and put them in different collections

    var primarySiteRecords = [];
    var secondarySiteRecords = [];
    _.each(immunizations, function(immunization){
        immunization.administeredDateTime = _.isUndefined(immunization.administeredDateTime) ? 'N/A' : immunization.administeredDateTime;
        isPrimarySiteDivision(vistaSites, immunization.facilityCode) ? primarySiteRecords.push(immunization) : secondarySiteRecords.push(immunization); //jshint ignore:line
    });


    var retVal = {};

    // take out the duplicates out of the primary records
    _.each(primarySiteRecords, function (record) {
        var key = record.name + record.administeredDateTime;
        retVal[key] = record;
    });

    retVal = _.values(retVal);

    // add the secondary site records as they are
    retVal = retVal.concat(secondarySiteRecords);

    return {items : retVal };
}


module.exports.removeDuplicateImmunizations =  removeDuplicateImmunizations;
