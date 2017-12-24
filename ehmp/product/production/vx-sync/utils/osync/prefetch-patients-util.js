'use strict';

require('../../env-setup');

var async = require('async');
var moment = require('moment');

function savePrefetchPatient(log, environment, patient, callback) {
    log.debug('prefetch-patients-util.savePrefetchPatient: Saving patient to prefetch store: %j', patient);

    environment.pjds.updatePrefetchPatient(patient.uid, patient, function(error, response, result) {
        if (error) {
            log.error('prefetch-patients-util.savePrefetchPatient: There was an error saving a prefetch patient to pJDS. Error: %s', error);
            return setTimeout(callback, 0, error);
        }

        if (response.statusCode !== 201) {
            log.error('prefetch-patients-util.savePrefetchPatient: There was an error saving a prefetch patient to pJDS. Error: %j', result);
            return setTimeout(callback, 0, result);
        }

        setTimeout(callback, 0);
    });
}

function deleteExpiredPrefetchPatients(log, environment, callback) {
    var startDate = moment().subtract(1, 'y').format('YYYYMMDDHHmmss');
    var endDate = moment().subtract(2, 'd').format('YYYYMMDDHHmmss');

    environment.pjds.getPrefetchPatients('range=[' + startDate + '..' + endDate + ']', 'ehmp-patients', function(error, response, result) {
        if (error) {
            log.error('prefetch-patients-util.deleteExpiredPrefetchPatients: There was an error retrieving expired prefetch patients. Error: %s', error);
            return callback(error);
        }

        if (response.statusCode !== 200) {
            log.error('prefetch-patients-util.deleteExpiredPrefetchPatients: There was an error retrieving expired prefetch patients. Error: %j', result);
            return callback(result);
        }

        async.eachSeries(result.items, function(item, seriesCallback) {
            environment.pjds.removePrefetchPatient(item.uid, function(delError, delResponse, delResult) {
                if (delError) {
                    log.error('prefetch-patients-util.deleteExpiredPrefetchPatients: There was an error removing a prefetch patient from pJDS. Error: %s', delError);
                    return setTimeout(seriesCallback, 0, delError);
                }

                if (delResponse.statusCode !== 200) {
                    log.error('prefetch-patients-util.deleteExpiredPrefetchPatients: There was an error removing a prefetch patient from pJDS. Error: %j', delResult);
                    return setTimeout(seriesCallback, 0, delResult);
                }

                setTimeout(seriesCallback, 0);
            });
        },
        function(err) {
            if (err) {
                return callback(null, 'Delete of expired prefetch patients completed with error(s).');
            }

            callback(null, 'Delete of expired prefetch patients completed.');
        });
    });
}

module.exports.savePrefetchPatient = savePrefetchPatient;
module.exports.deleteExpiredPrefetchPatients = deleteExpiredPrefetchPatients;


