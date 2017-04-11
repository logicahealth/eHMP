'use strict';

var _ = require('lodash');
var async = require('async');
var errorUtil = require(global.VX_UTILS + 'error');
var rpcUtil = require(global.VX_UTILS + '/rpc-util');
var nullUtils = require(global.VX_UTILS + 'null-utils');
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');
var parseRpcResponseAppointments = require(global.OSYNC_UTILS + 'patient-sync-utils').parseRpcResponseAppointments;
var filemanDateUtil = require(global.VX_UTILS + 'filemanDateUtil');
var moment = require('moment');

/**
 * Takes a job and validates all of the fields of that job to make sure it's a valid one.<br/>
 * Examples: job type and source are correct, patients exist and have correct identifiers.
 *
 * @param job The job to validate.
 * @returns {string} Error message if error occurred, null otherwise.
 */
function validate(job) {
    // make sure we have the correct jobtype
    if (nullUtils.isNullish(job.type)) {
        return 'appointments.validate: Could not find job type';
    }
    //Make sure the job sent to us is an appointment-request
    if (job.type !== 'appointments') {
        return 'appointments.validate: job type was not appointments';
    }
    return null;
}

function getSiteInfo(log, config, job) {
    var sites;
    var configVistaSites = config.vistaSites;

    // appointment scheduler sets siteId. If there is siteId, that means request is coming from appointment scheduler.
    if (!_.isUndefined(job.siteId)) {
        sites = [];
        if (job.siteId.toString().toLowerCase() === 'all') {
            sites = _.keys(configVistaSites);
        } else {
            sites[0] = job.siteId;
        }
    } else {
        sites = _.keys(configVistaSites);
    }

    return sites;
}

function getClinicInfo(log, config, site, job) {
    var clinics = [];
    if (!_.isUndefined(job.clinic)) {
        clinics[0] = job.clinic;
    } else if (!_.isUndefined(config.appointmentsOptions.clinicsList[site])) {
        clinics = config.appointmentsOptions.clinicsList[site];
    } else if (config.appointmentsOptions.syncAllByDefault) {
        clinics[0] = 'ALL';
    }
    return clinics;
}

/**
 * Will return an array of patients that will include their
 * DFN^DATE of event (appt or admit)^location name^location IEN
 *
 * @param log
 * @param config
 * @param environment
 * @param job
 * @param handlerCallback
 * @returns {*}
 */
function handle(log, config, environment, job, handlerCallback) {
    log.debug('appointment-request.handle : received request to save ' + JSON.stringify(job));

    var error = validate(job);
    if (error) {
        return handlerCallback(error);
    }

    // Makes an RPC call to vista to get a list of patients with up coming appointments in the next 24 hours (period set in configuration).
    var now = moment();
    var startDate = filemanDateUtil.getFilemanDate(now.toDate());

    var configVistaSites = config.vistaSites;
    var sites = getSiteInfo(log, config, job);
    log.debug('sites ' + JSON.stringify(sites));
    if (_.isArray(sites) && sites.length > 0) {
        async.eachSeries(sites, function(site, siteCb) {
            var daysInFuture = config.appointmentsOptions.daysInFuture;
            var future = now.clone().add(daysInFuture, 'days');
            var endDate = filemanDateUtil.getFilemanDate(future.toDate());

            var rpcConfig = configVistaSites[site];
            rpcConfig.context = config.rpcContext;

            rpcUtil.standardRPCCall(log, rpcConfig, 'HMP PATIENT SCHED SYNC', startDate, endDate, null, function(error, data) {
                if (error) {
                    log.warn('An error occurred retrieving appointments from site ' + configVistaSites[site].host + ':' + configVistaSites[site].port + ': ' + error + ' -- data contained: ' + data);
                    return siteCb(); // We don't want to bail completely--we still want to try the other sites, so don't pass the error along to siteCb().
                }

                if (nullUtils.isNullish(data) || _.isEmpty(data)) {
                    log.debug('No appointments to process for site ' + site);
                    return siteCb();
                }

                var clinics = getClinicInfo(log, config, site, job);
                parseRpcResponseAppointments(log, data, clinics, function(err, patients) {
                    if (err) {
                        log.warn('An error occurred while parsing the appointments data from site ' + configVistaSites[site].host + ':' + configVistaSites[site].port + ': ' + err + ' -- data contained: ' + data);
                        return siteCb(); // We don't want to bail completely--we still want to try the other sites, so don't pass the error along to siteCb().
                    }

                    async.eachSeries(patients, function(patient, cb) {
                        log.debug('appointment-request.handle processing patient: ' + JSON.stringify(patient));

                        var singlePatientJob = _.cloneDeep(job);
                        singlePatientJob.source = 'appointments';
                        singlePatientJob.patient = patient;
                        singlePatientJob.siteId = site;
                        singlePatientJob.jobId = undefined;
                        singlePatientJob.jpid = undefined;

                        var jobToPublish = jobUtil.createValidationJob(log, config, environment, singlePatientJob);
                        environment.publisherRouter.publish(jobToPublish, function(error, results) {
                            if (error) {
                                return cb(error);
                            }

                            setTimeout(cb, (config.delay && _.isNumber(config.delay)) ? config.delay : 500);
                        });
                    }, function(err) {
                        if (err) {
                            return siteCb(err);
                        }

                        siteCb();
                    });
                });
            });
        }, function(err) {
            if (err) {
                return handlerCallback(err);
            }

            handlerCallback();
        });
    } else {
        return handlerCallback();
    }
}

module.exports = handle;
