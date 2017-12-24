'use strict';

require('../../env-setup');

// Retrieves all patients with an active admission for VistA sites that are configured for the osync-admission-run.js cron job.
// Stores all patients to the pJDS prefetch data store.

var _ = require('underscore');
var async = require('async');
var crontab = require('crontab');

var parseRpcResponse = require(global.OSYNC_UTILS + 'patient-sync-utils');
var filemanDateUtil = require(global.VX_UTILS + 'filemanDateUtil');
var prefetchUtil = require(global.OSYNC_UTILS + 'prefetch-patients-util');

function prefetchPatients(log, config, environment, callback) {
    getAdmissionSites(log, config.vistaSites, function(error, sites) {
        processAdmissionsForSites(log, config, environment, sites, function(error, result) {
            callback(error, result);
        });
    });
}

// Get admission sites to be synced by osync from the admission run cron job.
function getAdmissionSites(log, vistaSites, callback) {
    crontab.load(function(err, crontab) {
        if (err || _.isUndefined(crontab)) {
            log.error('prefetch-patients-admission.getAdmissionSites: Unable to retrieve admissions for sites. error: %s', err);
            return setTimeout(callback, 0, null, {});
        }

        var job = crontab.jobs({command: 'osync-admission-run.js'});

        if (_.isUndefined(job) || _.isEmpty(job)) {
            return setTimeout(callback, 0, null, {});
        }
        var tokens = job[0].command().split(' ');
        var siteKey = _.indexOf(tokens, '--site');

        if (siteKey === -1 || siteKey.length < siteKey + 1) {
            log.info('prefetch-patients-admission.getAdmissionSites: No admissions sites configured for osync admissions in crontab.');
            return setTimeout(callback, 0, null, {});
        }

        var sites = tokens[siteKey + 1].split(',');
        var admissionSites = _.pick(vistaSites, sites);

        log.debug('prefetch-patients-admission.getAdmissionSites: Found the following osync admissions sites in crontab: %s.', _.keys(admissionSites));
        return setTimeout(callback, 0, null, admissionSites);
    });
}

function processAdmissionsForSites(log, config, environment, sites, callback) {
    async.eachSeries(_.keys(sites), function(site, seriesCallback) {
        environment.vistaClient.fetchAdmissionsForSite(site, function (error, data) {
            if (error) {
                log.error('prefetch-patients-admission.processAdmissionsForSites: Unable to retrieve admissions from site: %s. error: %s data: %s', site, error, data);
                return setTimeout(seriesCallback, 0);       //Allow processing to continue on error
            }

            processPatients(log, config, environment, data, site, sites[site].stationNumber, seriesCallback);
        });
    }, function() {
        log.debug('prefetch-patients-admission.processAdmissionsForSites: Admission processing completed.');
        callback(null, 'Admission processing completed.');
    });

}

function processPatients(log, config, environment, data, site, stationNumber, callback) {
    if (_.isUndefined(data) || _.isEmpty(data)) {
        log.info('prefetch-patients-admission.processPatients: No admissions to process for site %s', site);
        return setTimeout(callback, 0);
    }

    parseRpcResponse.parseRpcResponseAdmissions(log, data, function(err, patients) {
        if (err) {
            log.error('prefetch-patients-admission.processPatients: Unable to parse the admissions for site: %s error: %s', site, err);
            return setTimeout(callback, 0);
        }

        async.eachSeries(patients, function(patient, cb) {
            patient.siteId = site;
            var prefetchPatient = createAdmissionPatient(patient, stationNumber);

            log.debug('prefetch-patients-admission.processPatients: Saving patient %j to prefetch list.', prefetchPatient);
            prefetchUtil.savePrefetchPatient(log, environment, prefetchPatient, cb);
        }, function(err) {
            if (err) {
                log.error('prefetch-patients-admission.processPatients: Unable to create and save the admissions for site: %s error: %s', site, err);
            }
            return setTimeout(callback, 0);
        });
    });
}

function createAdmissionPatient(patient, stationNumber) {
    return {
        uid: 'urn:va:admission:' + patient.siteId + ':' + patient.dfn + ':' + patient.dfn,
        pid: patient.siteId + ';' + patient.dfn,
        patientIdentifier: patient.dfn + '^PI^' + stationNumber + '^USVHA^P',
        isEhmpPatient: true,
        source: 'admission',
        sourceDate: filemanDateUtil.getVprDateTime(patient.date),
        facility: stationNumber,
        clinic: patient.locationName
    };
}

module.exports.prefetchPatients = prefetchPatients;
module.exports._createAdmissionPatient = createAdmissionPatient;
module.exports._getAdmissionSites = getAdmissionSites;
module.exports._processAdmissionsForSites = processAdmissionsForSites;
