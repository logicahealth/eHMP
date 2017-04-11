'use strict';

// set up the packages we need
var rdk = require('../../core/rdk');
var _ = require('lodash');
var ObjectId = require('mongoskin').ObjectID;
var request = require('request');

// Database
var dbName = 'schedule';
var exeCollection = 'cdsjobs';
var agenda;
var cdsInvocationUrl;
var agendaJobProcessorName;
var thisApp;

var testId;

//Called from cds-agenda.init()
function init(app) {
    thisApp = app;
    var isCDSInvocationServerAvailable = _.result(thisApp, 'subsystems.cds.isCDSInvocationConfigured');
    if (!isCDSInvocationServerAvailable) {
        return;
    }
    agenda = thisApp.subsystems.cds.getAgenda();
    agendaJobProcessorName = thisApp.subsystems.cds.getAgendaJobProcessorName();
    testId = thisApp.subsystems.cds.testMongoDBId;
    cdsInvocationUrl = thisApp.subsystems.cds.getInvocationUrl();
}

// /////////
// Job
// /////////


/**
 * Retrieve a Scheduled job
 *
 * @api {get} /resource/cds/schedule/job[?jobname=name] Request Schedule Job
 *
 * @apiName getJob
 * @apiGroup CDS Scheduler
 *
 * @apiParam {String} [jobname] Job name
 *
 * @apiSuccess (Success 200) {json[]} data A Job array
 *
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
{
    "status": 200,
    "data": [{
            "_id": "559cd12977cbe259a740c0c2",
            "name":
                    "sendRequest",
            "data": {
                "cdsname": "Timeout",
                "url":
                        "IP            /cds-results-service/core/executeRulesJob"
            },
            "type": "normal",
            "priority": 0,
            "nextRunAt":
                    "2015-07-10T16:08:49.203Z",
            "jobname": "job1",
            "disabled":
                    true,
            "lastModifiedBy": "CDS Jobs Queue",
            "lockedAt":
                    null,
            "lastRunAt": "2015-07-08T07:28:41.928Z",
            "lastFinishedAt": "2015-07-08T07:28:41.929Z"
        }]
}
 *
 * @apiError (Error 404) data The id or name specified does not exist
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 *  { "status": 404,
 *    "data": null }
 *
 */
var getJob = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS schedule resource is unavailable.');
    }
    var status = rdk.httpstatus.ok;
    var match = {};

    if (req.query.jobname) {
        match.jobname = req.query.jobname;
    }

    agenda.jobs(match, function(err, jobs) {
        // Work with jobs
        /*
         * This odd JSON parse logic to remove a circular reference that
         * crashes one of the outcepters in RDK as of the time of this
         * writing.
         */
        var message = (err === null) ? JSON.parse(JSON.stringify(jobs)) : err;
        if (err === null && _.isEmpty(jobs)) {
            status = rdk.httpstatus.not_found;
        }
        res.status(status).rdkSend(message);
    });
};
module.exports.getJob = getJob;

/**
 * Create a scheduled job
 *
 * @api {post} /resource/cds/schedule/job Create Schedule Job
 *
 * @apiName postJob
 * @apiGroup CDS Scheduler
 *
 * @apiHeader {application/json} Content-Type
 * @apiHeader {json} content Job object
 *
 * @apiParam {String} jobname Job name
 * @apiParam {String} cdsname CDS Job name
 * @apiParam {String} [when] The time the CDS Job should run
 * @apiParam {String} [interval] The frequency of running the CDS Job
 *
 * @apiSuccess (Success 201) {json} data Job JSON document
 * @apiSuccessExample Success-Response: HTTP/1.1 201 Created { "status": 201,
 *                    "message": "Send Request queued for JobName" }
 *
 * @apiError (Error 404) {json} error Missing or invalid field(s)
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request { "status": 404,
 *                  "error": "Missing required CDS job name" }
 *
 */
var postJob = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS schedule resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        var aj = {};
        var url = '';
        var match = {};
        var jobname = '';
        var cdsname = '';
        var when = '';
        var interval = '';

        if (req.query.jobname) {
            jobname = req.query.jobname;
            match.jobname = jobname;
        }
        if (!jobname) {
            return res.status(rdk.httpstatus.not_found).rdkSend('Missing required schedule job name');
        }
        if (req.query.cdsname) {
            cdsname = req.query.cdsname;
        }
        if (!cdsname) {
            return res.status(rdk.httpstatus.not_found).rdkSend('Missing required CDS job name');
        }

        url = req.query.url || cdsInvocationUrl;

        if (req.query.when) {
            when = req.query.when;
        }
        if (req.query.interval) {
            interval = req.query.interval;
        }

        dbConnection.collection(exeCollection).findOne({
            name: cdsname
        }, function(err, result) {
            if (!result) {
                return res.status(rdk.httpstatus.not_found).rdkSend('CDS Job \'' + cdsname + '\' does not exist');
            }

            agenda.jobs(match, function(err, result) {
                if (err) {
                    return res.status(rdk.httpstatus.bad_request).rdkSend(err);
                } else if (!_.isEmpty(result)) {
                    return res.status(rdk.httpstatus.conflict).rdkSend('Job \'' + jobname + '\' exists');
                }
                aj = agenda.create(agendaJobProcessorName, {
                    cdsname: cdsname,
                    url: url
                });
                aj.attrs.jobname = jobname;

                if (when) {
                    aj.schedule(req.query.when);
                }
                if (interval) {
                    aj.repeatEvery(req.query.interval);
                }
                if (!when) {
                    aj.disable();
                }
                aj.save();
                return res.status(rdk.httpstatus.created).rdkSend('Send Request queued for ' + cdsname);
            });
        });
    });
};
module.exports.postJob = postJob;

/**
 * Modify a scheduled job
 *
 * @api {put} /resource/cds/schedule/job Modify Schedule Job
 *
 * @apiName putJob
 * @apiGroup CDS Scheduler
 *
 * @apiHeader {application/json} Content-Type
 * @apiHeader {json} content Job object
 *
 * @apiParam {String} jobname Job name
 * @apiParam {String} [when] The time the job is scheduled to run
 * @apiParam {String} [interval] The frequency of running the job
 * @apiParam {String} [enable] Enable the job to be queued
 * @apiParam {String} [disable] Disable the job from being queued
 *
 * @apiSuccess (Success 200) {json} data update flag
 * @apiSuccessExample Success-Response: HTTP/1.1 200 Success
 *  { "status": 200,
 *    "data": 1 }
 *
 * @apiError (Error 400) {json} error Missing or invalid field(s)
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 *  { "status": 400,
 *    "message": "Missing or invalid field(s)" }
 *
 *
 */
var putJob = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS schedule resource is unavailable.');
    }
    var disable = req.query.hasOwnProperty('disable');
    var enable = req.query.hasOwnProperty('enable');
    var jobname = '';
    var when = '';
    var interval = '';

    if (disable && enable) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Cannot enable and disable a job at the same time.');
    }
    if (_.isEmpty(req.query.jobname)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required schedule job name');
    }
    jobname = req.query.jobname;

    if (req.query.when) {
        when = req.query.when;
    }
    if (req.query.interval) {
        interval = req.query.interval;
    }

    agenda.jobs({
        jobname: jobname
    }, function(err, result) {
        if (!_.isEmpty(err) || _.isEmpty(result)) {
            return res.status(rdk.httpstatus.not_found).rdkSend('Job - ' + jobname + ' not found');
        }

        var aj = result[0];
        if (disable) {
            aj.disable();
        } else if (enable) {
            aj.enable();
        }
        if (!when && !interval && disable) {
            return res.status(rdk.httpstatus.ok).rdkSend('Job - ' + jobname + ' disabled = ' + disable);
        }
        if (when) {
            aj.schedule(req.query.when);
        }
        if (interval) {
            aj.repeatEvery(req.query.interval);
        }
        aj.save(function(saveError) {
            if (saveError) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend('Could not update job ' + jobname);
            }
            return res.status(rdk.httpstatus.ok).rdkSend('Job - ' + jobname + ' updated');
        });
    });
};
module.exports.putJob = putJob;

/**
 * Delete a scheduled job
 *
 * @api {delete} /resource/cds/schedule/job?jobname=name Delete Schedule Job
 *
 * @apiName deleteJob
 * @apiGroup CDS Scheduler
 *
 * @apiDescription This call deletes a scheduled job. Either a jobname, an id,
 *                 or both are required.
 *
 * @apiParam {String} [jobname] name of the job
 * @apiParam {String} [id] 24 digit HEX number doc id
 *
 * @apiSuccess (Success 200) {Number} data Delete count
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK { "status" 200,
 *                    "message": 1 }
 *
 * @apiError (Error 404) {Number} data The specified job was not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found { "error": 404,
 *                  "error": "Job not found" }
 *
 */
var deleteJob = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS schedule resource is unavailable.');
    }
    var match = {};

    if (req.query.jobname) {
        match.jobname = req.query.jobname;
    }
    if (req.query.id) {
        var message = testId(req.query.id);
        if (message) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(message);
        }
        match._id = new ObjectId(req.query.id);
    }

    if (!match.hasOwnProperty('jobname') && !match.hasOwnProperty('_id')) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing or invalid required parameter.');
    }

    agenda.cancel(match, function(err, numRemoved) {
        if (!_.isEmpty(err)) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
        if (numRemoved === 0) {
            return res.status(rdk.httpstatus.not_found).rdkSend('Job not found');
        }
        return res.status(rdk.httpstatus.ok).rdkSend(numRemoved);
    });
};
module.exports.deleteJob = deleteJob;
module.exports.init = init;
