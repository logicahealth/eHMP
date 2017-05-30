'use strict';

var _ = require('lodash');
var async = require('async');
var errorUtil = require(global.VX_UTILS + 'error');
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
    if (!job.type || job.type !== 'appointments') {
        return 'appointments.validate: Invalid job type for appointments handler';
    }

    if (!job.siteId) {
        return 'appointments.validate: Missing site in job';
    }

    if (!job.clinic) {
        return 'appointments.validate: Missing clinic in job';
    }

    return null;
}

/**
 * Will return an array of patients that will include their
 * DFN^DATE of event (appt or admit)^location name^location IEN
 *
 * @param log
 * @param osyncConfig
 * @param environment
 * @param job
 * @param handlerCallback
 * @returns {*}
 */
function handle(log, osyncConfig, environment, job, handlerCallback) {
    log.debug('appointments.handle : received request to save ' + JSON.stringify(job));

    // Set rpcUtil up so that we can override it for unit tests.
    //----------------------------------------------------------
    var rpcUtil = null;
    if (environment.rpcUtil) {
        rpcUtil = environment.rpcUtil;
    } else {
        rpcUtil = require(global.VX_UTILS + '/rpc-util');
    }

    var error = validate(job);
    if (error) {
        return handlerCallback(error);
    }

    var now = moment();
    var startDate = filemanDateUtil.getFilemanDate(now.toDate());

    var daysInFuture = osyncConfig.appointmentsOptions.daysInFuture;
    var future = now.clone().add(daysInFuture, 'days');
    var endDate = filemanDateUtil.getFilemanDate(future.toDate());

    var rpcConfig = osyncConfig.vistaSites[job.siteId];
    rpcConfig.context = osyncConfig.rpcContext;

    // Makes an RPC call to vista to get a list of patients with up coming appointments
    // in the next 24 hours (period set in configuration).
    rpcUtil.standardRPCCall(log, rpcConfig, 'HMP PATIENT SCHED SYNC', startDate, endDate, job.clinic, null, function(error, data) {
        if (error) {
            log.error('appointments.handle: An error occurred retrieving appointments from site ' + osyncConfig.vistaSites[job.siteId].host + ':' + osyncConfig.vistaSites[job.siteId].port + ': ' + error + ' -- data contained: ' + data);
            return handlerCallback(errorUtil.createTransient('appointments.handle: ' + error, data));
        }

        if (nullUtils.isNullish(data) || _.isEmpty(data)) {
            log.debug('appointments.handle: No appointments to process for site ' + job.siteId);
            return handlerCallback();
        }

        parseRpcResponseAppointments(log, data, ['all'], function(err, patients) {
            if (err) {
                log.error('appointments.handle: An error occurred while parsing the appointments data from site ' + osyncConfig.vistaSites[job.siteId].host + ':' + osyncConfig.vistaSites[job.siteId].port + ': ' + err + ' -- data contained: ' + data);
                return handlerCallback(errorUtil.createTransient('appointments.handle: ' + err));
            }

            async.eachSeries(patients, function(patient, cb) {
                log.debug('appointments.handle: processing patient: ' + JSON.stringify(patient));

                var singlePatientJob = _.cloneDeep(job);
                singlePatientJob.source = 'appointments';
                singlePatientJob.patient = patient;
                singlePatientJob.jobId = undefined;
                singlePatientJob.jpid = undefined;

                if (job.referenceInfo) {
                    singlePatientJob.referenceInfo = job.referenceInfo;
                }

                var jobToPublish = jobUtil.createSyncJob(log, singlePatientJob);

                environment.publisherRouter.publish(jobToPublish, function(error) {
                    if (error) {
                        return cb(error);
                    }

                    cb();
                });
            }, function(err) {
                if (err) {
                    return handlerCallback(err);
                }

                handlerCallback();
            });
        });
    });
}

module.exports = handle;
