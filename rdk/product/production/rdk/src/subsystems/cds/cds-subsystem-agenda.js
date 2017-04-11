'use strict';

/**
 * cds-agenda
 *
 * Utility module that handles all initialization and setup of the Agenda module used by cds-schedule.
 * Agenda is the 3rd party module that handles the scheduling and execution of CDS jobs.
 *
 * This module is used and exposed by the CDS subsystem.
 */

var rdk = require('../../core/rdk');
var mongo = require('mongoskin');
var Agenda = require('agenda');
var request = require('request');
var dd = require('drilldown');
var cdsDBUtil = require('./cds-db-util');

var agenda;
var logger;
var dbName = '_cds_agenda_';
var jobProcessorName = 'sendRequest';

function init(app, mongoConfig) {
    logger = app.logger;
    try {

    var connectionString = cdsDBUtil.getMongoDBConnectionString(dbName, mongoConfig, logger);

    logger.debug('connection string test ' + connectionString );
        agenda = new Agenda()
            .name('CDS Jobs Queue')
            .database(connectionString)
            .processEvery('5 seconds');

        agenda._db.ensureIndex('nextRunAt', ignoreErrors)
            .ensureIndex('lockedAt', ignoreErrors)
            .ensureIndex('name', ignoreErrors)
            .ensureIndex('priority', ignoreErrors);

        // unlock jobs
        agenda._db.update({
            lockedAt: {
                $exists: true
            }
        }, {
            $set: {
                lockedAt: null
            }
        }, function() {});

        agenda.define(jobProcessorName, function(job, done) {
            sendRequest(job, done);
        });

        agenda.start();
        return agenda;

    } catch (e) {
        // console.log('error initializing agenda: ' + e);
        logger.error({error: e}, 'error initializing agenda');
        return null;
    }
}

function ignoreErrors() {}

function sendRequest(job, done) {

    var info = job.attrs.data;
    var url = 'http://' + info.url + '/' + info.cdsname;

    // console.log('In sendRequest: URL: ' + url + ' disabled: ' + job.attrs.disabled);
    logger.debug('In sendRequest: URL: ' + url + ' disabled: ' + job.attrs.disabled);

    if (job.attrs.disabled) {
        done(null);
    } else {
        request.post({
            url: url,
            timeout: 50000
        }, function(err, response, body) {
            var message = (err === null) ? {
                data: body
            } : err;
            if (response) {
                if (response.statusCode === rdk.httpstatus.ok) {
                    message = null;
                } else {
                    message.status = response.statusCode;
                }
            }
            done(message); // logged in agenda job as "failReason"
        });
    }
}



/*
 * This is to shutdown Agenda - without it we can get into a situation where RDK
 * doesn't shut down when it's told to.
 */
function graceful() {
    if (agenda) {
        agenda.stop(function() {
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
}
process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

function getAgenda() {
    return agenda;
}

function getAgendaJobProcessorName() {
    return jobProcessorName;
}

module.exports.init = init;
module.exports.getAgenda = getAgenda;
module.exports.getAgendaJobProcessorName = getAgendaJobProcessorName;
