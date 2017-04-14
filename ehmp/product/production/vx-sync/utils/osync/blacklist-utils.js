'use strict';

function isBlackListedPatient(log, environment, patientId, siteId, callback) {
    if(patientId && siteId) {
        return isBlackListed(log, environment, 'urn:va:patient:' + siteId + ':' + patientId + ':' + patientId, callback);
    }

    callback(null, false);
}

function isBlackListedUser(log, environment, user, callback) {
    return isBlackListed(log, environment, user.uid, callback);
}


function isBlackListed(log, environment, uid, callback) {
    environment.pjds.getOsyncBlistByUid(uid, function(error, response) {
        if (error) {
            log.error('blacklist-utils.isBlackListed: Error response from osync black list generic store. Error: %s', error);
            return callback(null, true);
        }

        if (response.statusCode === 404) {
            log.debug('blacklist-utils.isBlackListed: ' + uid + ' uid not found on black list.');
            return callback(null, false);
        }

        if (response.statusCode !== 200) {
            log.error('blacklist-utils.isBlackListed: Error response from osync black list generic store. Response: %s', response.body);
        } else {
            log.debug('blacklist-utils.isBlackListed: ' + uid + ' uid found on black list.');
        }

        callback(null, true);
    });
}

module.exports.isBlackListedPatient = isBlackListedPatient;
module.exports.isBlackListedUser = isBlackListedUser;
