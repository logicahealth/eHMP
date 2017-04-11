'use strict';
var _ = require('lodash');
var validate = require('../write/pick-list/utils/validation-util');
var UID_IEN_LOCATION = 4;
/**
 *  Returns the location IEN from  UID 
 *
 *  @param location type
 *  @param location uid example: urn:va:location:C877:158
 *  location uids have a site code and the ien of a 'hospital location' file,
 *  which is not a clinic or ward.
 *  @return The IEN digit or digits
 */
function getLocationIEN(uid) {
    if (!_.isEmpty(uid) && !_.isUndefined(uid)) {
        if (!validate.isWholeNumber(uid)) {
            return uid.split(':')[UID_IEN_LOCATION].replace(/\D/g, '');
        }
        if (validate.isWholeNumber(uid)) {
            return uid;
        } else {
            return uid.split(':')[UID_IEN_LOCATION];
        }
    } else {
        return null;
    }
}
/**
 *  Generates a Location UID 
 *
 *  @param Site, location Type and IEN 
 *  @param ien example: 158
 *  @param site example: C877
 *  @param site example: W  - W stands for wards
 *  @return Location UID
 */
function getLocationUid(site, locationType, ien) {
    if (_.isEmpty(ien) || _.isUndefined(ien)) {
        return null;
    }
    if (_.isEmpty(site) || _.isUndefined(site)) {
        return null;
    }
    return 'urn:va:location:' + site + (locationType === 'W' ? ':w' : ':') + ien;
}
module.exports.getLocationIEN = getLocationIEN;
module.exports.getLocationUid = getLocationUid;