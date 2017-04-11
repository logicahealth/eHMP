'use strict';

require('../../../env-setup');
var format = require('util').format;
var _ = require('lodash');
var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');
var logUtil = require(global.VX_UTILS + 'log');
var async = require('async');

function handle(log, config, environment, handlerCallback) {
    var jobs = [];

    if (!_.isUndefined(config.jobs)) {
        if (!_.isUndefined(config.jobs.activeUsers)) {
            var str = config.jobs.activeUsers.toString().toLowerCase();
            if (str === 'true' || str === 'yes' || str === 'on') {
                log.debug('starting osync active users job');
                jobs = jobs.concat(jobUtil.createActiveUsersJob(log, config, environment));
            }
        }

        if (!_.isUndefined(config.jobs.appointments)) {
            var str = config.jobs.appointments.toString().toLowerCase();
            if (str === 'true' || str === 'yes' || str === 'on') {
                if (config.appointmentsOptions.clinicsList && !_.isEmpty(config.appointmentsOptions.clinicsList)) {
                    // Check for each site in the clinicsList.
                    var sites = _.keys(config.appointmentsOptions.clinicsList);
                    _.each(sites, function(site) {
                        var clinicsList = config.appointmentsOptions.clinicsList[site];
                        if (clinicsList && !_.isEmpty(clinicsList)) {
                            if (clinicsList[0] == 'ALL') {
                                // Make and concat a job to sync all clinics for this site.
                                log.debug('starting osync appointments job for all clinics at ' + site);
                                var job = jobUtil.createAppointmentsJob(log, config, environment);
                                job.siteId = site;
                                jobs = jobs.concat(job);
                            } else {
                                // Make and concat a job for each clinic.
                                _.each(clinicsList, function(clinic) {
                                    log.debug('starting osync appointments job for ' + site + ':' + clinic.clinic);
                                    var job = jobUtil.createAppointmentsJob(log, config, environment);
                                    job.siteId = site;
                                    job.clinic = clinic.clinic;
                                    jobs = jobs.concat(job);
                                });
                            }
                        }
                    });
                }
            }
        }

        if (!_.isUndefined(config.jobs.admissions)) {
            var str = config.jobs.admissions.toString().toLowerCase();
            if (str === 'true' || str === 'yes' || str === 'on') {
                log.debug('Starting admissions job');
                jobs = jobs.concat(jobUtil.createAdmissionsJob(log, config, environment));
            }
        }
    }

    if (_.isEmpty(jobs) ) {
        var errorMsg = 'There are no jobs to publish';
        log.error("ERROR: " + errorMsg);
        return handlerCallback(errorMsg, null);
    }

    // make sure that there is something to publish.
    //----------------------------------------------
    if ((jobs) && (jobs.length > 0)) {
        async.each(jobs, function(job, callback) {
            log.debug('opportunistic-sync-request.publishJobs: Entered method. ' + jobs.length + ' jobsToPublish: ' + jobs);
            environment.publisherRouter.publish(job, function(error) {
                if (error) {
                    log.error('opportunistic-sync-request.publishJobs: publisher error: ' + error);
                    return callback(error);
                }

                log.debug('opportunistic-sync-request.publishJobs : jobs published, complete status. jobId: ' + job.jobId + ' jobs: ' + jobs);
                callback();
            });
        }, function(err) {
            if (err) {
                log.error('opportunistic sync failed: ' + err);
                if (handlerCallback) {
                    handlerCallback(err);
                }
                return;
            }

            log.debug('opportunistic sync complete');
            if (handlerCallback) {
                handlerCallback();
            }
        });
    }

}

module.exports = handle;
module.exports.handle = handle;
