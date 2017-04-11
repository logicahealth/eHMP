'use strict';
var _ = require('lodash');

module.exports.extractPiecesFromUID = extractPiecesFromUID;
module.exports.extractDomainFromUID = extractDomainFromUID;
module.exports.extractSiteFromUID = extractSiteFromUID;
module.exports.extractLocalIdFromUID = extractLocalIdFromUID;
module.exports.extractSiteHash = extractSiteHash;
module.exports.isValidUidFormat = isValidUidFormat;

function extractPiecesFromUID(uid, delimiter) {
    delimiter = delimiter || ':';
    var parts = uid.split(delimiter);
    var info = {};
    switch(parts.length) {
        case 6:
            info.localId = parts[5];
        /* falls through */
        case 5:
            info.patient = parts[4];
        /* falls through */
        case 4:
            info.site = parts[3];
        /* falls through */
        case 3:
            info.domain = parts[2];
        /* falls through */
        case 2:
            info.organization = parts[1];
        /* falls through */
        case 1:
            info.prefix = parts[0];
    }
    return info;
}

function extractDomainFromUID(uid, delimiter) {
    return extractPiecesFromUID(uid,delimiter).domain;
}

function extractSiteFromUID(uid, delimiter) {
    return extractPiecesFromUID(uid,delimiter).site;
}

function extractLocalIdFromUID(uid, delimiter) {
    return extractPiecesFromUID(uid,delimiter).localId;
}

function extractSiteHash(uid, delimiter) {
    delimiter = delimiter || ':';
    var parts = uid.split(':');
    var info = '';
    if (_.isArray(parts) && parts.length >= 4) {
        info = parts[3];
    }

    return info;
}

/**
 Utility function to check to see if uid is a valid format.
 At least need five parts: prefix, organization, domain, site, patient.
 return object with error, uidParts fields.
 if there is an error, then error will be the detailed error message, uidParts will be undefined.
 if uid is valid, then error will be undefined, and uidParts will be
 filled with right information.
 **/
function isValidUidFormat(uid) {
    if (_.isUndefined(uid)){
        return callback('uid is undefined');
    }
    var uidParts = extractPiecesFromUID(uid);
    var missingField = _.find(['patient', 'site', 'domain', 'organization', 'prefix'], function(field){
        return _.isUndefined(uidParts[field]);
    });

    var err;

    if (missingField) {
        err = 'Missing field: ' + missingField;
        uidParts = undefined;
    }

    return {
        error: err,
        uidParts: uidParts
    };
}
