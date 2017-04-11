'use strict';

var _ = require('lodash');
var async = require('async');
var errorUtil = require(global.VX_UTILS + 'error');
var rpcUtil = require(global.VX_UTILS + '/rpc-util');
var nullUtils = require(global.VX_UTILS + 'null-utils');
var parseRpcResponseAdmissions = require(global.OSYNC_UTILS + 'patient-sync-utils').parseRpcResponseAdmissions;
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');

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
        return 'admissions.validate: Could not find job type';
    }
    // Make sure the job sent to us is an admission-request
    if (job.type !== 'admissions') {
        return 'admissions.validate: job type was not admissions';
    }
    return null;
}

/**
 * Will return an array of patients that will include their
 * DFN^DATE of event (appt or admit)^location name^roomBed^location IEN
 *
 * @param log
 * @param config
 * @param environment
 * @param job
 * @param handlerCallback
 * @returns {*}
 */
function handle(log, config, environment, job, handlerCallback) {
    log.debug('admissions.handle : received request to save %s', JSON.stringify(job));

    var error = validate(job);
    if (error) {
        return handlerCallback(error);
    }

    var configVistaSites = config.vistaSites;
    var sites = _.keys(configVistaSites);
    if (_.isArray(sites) && sites.length > 0) {
        async.eachSeries(sites, function (site, siteCb) {
            var rpcConfig = configVistaSites[site];
            rpcConfig.context = config.rpcContext;

            rpcUtil.standardRPCCall(log, rpcConfig, 'HMP PATIENT ADMIT SYNC', '', null, function (error, data) {
                if (error) {
                    log.warn('An error occurred retrieving admissions from site ' + configVistaSites[site].host + ':' + configVistaSites[site].port + ': ' + error + ' -- data contained: ' + data);
                    return siteCb(); // We don't want to bail completely--we still want to try the other sites, so don't pass the error along to siteCb().
                }

                if (nullUtils.isNullish(data) || _.isEmpty(data)) {
                    log.debug('No admissions to process for site ' + site);
                    return siteCb();
                }

                parseRpcResponseAdmissions(log, data, function(err, patients) {
                    if (err) {
                        log.warn('An error occurred while parsing the admissions data from site ' + configVistaSites[site].host + ':' + configVistaSites[site].port + ': ' + error + ' -- data contained: ' + data);
                        return siteCb(); // We don't want to bail completely--we still want to try the other sites, so don't pass the error along to siteCb().
                    }

                    async.eachSeries(patients, function(patient, cb) {
                        log.debug('admissions.handle processing patient ' + JSON.stringify(patient));

                        var singlePatientJob = _.cloneDeep(job);
                        singlePatientJob.source = 'admissions';
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
        }, function (err) {
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
