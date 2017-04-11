'use strict';

var _ = require('lodash');
var async = require('async');
var rpcUtil = require(global.VX_UTILS + '/rpc-util');
var jobUtil = require(global.VX_UTILS + 'osync-job-utils');
var nullUtils = require(global.VX_UTILS + 'null-utils');
var parseRpcResponsePatientList = require(global.VX_UTILS + 'patient-sync-utils').parseRpcResponsePatientList;

/**
 * Takes a job and validates all of the fields of that job to make sure it's a valid one.<br/>
 * Examples: job type and source are correct, patients exist and have correct identifiers.
 *
 * @param job The job to validate.
 * @returns {string} Error message if validation failed; null otherwise.
 */
function validate(job) {
    // make sure we have the correct jobtype
    if (nullUtils.isNullish(job.type)) {
        return 'patientlist.validate: Could not find job type';
    }

    // Make sure the job sent to us is a patientlist
    if (job.type !== 'patientlist') {
        return 'patientlist.validate: job type was not patientlist';
    }

    if (job.users && _.isArray(job.users)) {
        for (var i = 0; i < job.users.length; i++) {
            var u = job.users[i];
            if (nullUtils.isNullish(u)) {
                return 'patientlist.validate: a user was null';
            }
            if (nullUtils.isNullish(u.duz) || _.isEmpty(u.duz)) {
                return 'patientlist.validate: a user.duz was null or empty';
            }
        }
    }

    return null;
}

function getPatientList(log, config, environment, duz, job, callback) {
    var configVistaSites = config.vistaSites;
    var sites = _.keys(configVistaSites);
    if (_.isArray(sites) && sites.length > 0) {
        async.eachSeries(sites, function(site, siteCb) {
            if (nullUtils.isNullish(duz[site])) {
                return siteCb();
            }

            var rpcConfig = configVistaSites[site];
            rpcConfig.context = config.rpcContext;

            rpcUtil.standardRPCCall(log, rpcConfig, 'HMP DEFAULT PATIENT LIST', duz[site], null, function (error, data) {
                if (error) {
                    log.warn('An error occurred retrieving the patient list data for active user ' + duz[site] + ' from site ' + configVistaSites[site].host + ':' + configVistaSites[site].port + ':' + error + ' -- data contained: ' + data);
                    return siteCb(); // We don't want to bail completely--we still want to try the other sites, so don't pass the error along to siteCb().
                }

                if (nullUtils.isNullish(data) || _.isEmpty(data)) {
                    log.debug('patientlist: the data returned was empty');
                    return siteCb();
                }

                parseRpcResponsePatientList(log, data, function(err, patients) {
                    if (err) {
                        log.warn('An error occurred while parsing the patient list data for active user ' + duz[site] + ' from site ' + configVistaSites[site].host + ':' + configVistaSites[site].port + ':' + err + ' -- data contained: ' + data);
                        return siteCb(); // We don't want to bail completely--we still want to try the other sites, so don't pass the error along to siteCb().
                    }

                    async.eachSeries(patients, function(patient, cb) {
                        log.debug('processing ' + JSON.stringify(patient));

                        var singlePatientJob = _.cloneDeep(job);
                        singlePatientJob.source = 'patient lists';
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

                        log.debug('Finished processing site ' + configVistaSites[site].host + ':' + configVistaSites[site].port + ' for active user ' + duz[site]);
                        siteCb();
                    });
                });
            });
        }, function(err) {
            if (err) {
                log.warn('An error occurred retrieving the patient list(s) for the active user ' + JSON.stringify(duz) + ': ' + err);
                // We don't necessarily want to bail on all active users just because one failed, so don't pass this error to callback().
                return callback();
            }

            log.debug('Finished retrieving patient list(s) for the active user ' + JSON.stringify(duz));
            callback();
        });
    } else {
        callback();
    }
}

function handle(log, config, environment, job, handlerCallback) {
    log.debug('patientlist.handle : received request to sync for active users: ' + JSON.stringify(job));

    var error = validate(job);
    if (error) {
        return handlerCallback(error);
    }

    async.eachSeries(job.users, function(user, cb) {
        if (nullUtils.isNotNullish(user.duz)) {
            getPatientList(log, config, environment, user.duz, job, cb);
        }
    }, function(err) {
        if (err) {
            return handlerCallback(err);
        }

        handlerCallback();
    });
}

module.exports = handle;
