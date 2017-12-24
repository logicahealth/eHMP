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
var Agenda = require('agenda');
var request = require('request');
var _ = require('lodash');
var cdsSchedule = require('../../resources/cds-schedule/cds-schedule');

var agenda;
var logger;
var dbName = '_cds_agenda_';
var jobProcessorName = 'sendRequest';

var logger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

function init(app, subsystemLogger) {
   logger = subsystemLogger;
    if (!_.isUndefined(app, 'config.cdsMongoServer')) {
        app.subsystems.cds.getCDSDB(logger, dbName, null, function(error, dbConnection) {
            if (!error) {
                initDb(app, dbConnection);
                cdsSchedule.init(app);
            }
        });
    } else {
        logger.debug('mongoServerConfigured was not configured - Agenda not initialized.');
    }
}

function initDb(app, dbConnection) {
    try {

        agenda = new Agenda()
            .name('CDS Jobs Queue')
            .mongo(dbConnection)
            .processEvery('5 seconds');

        agenda.define(jobProcessorName, function(job, done) {
            sendRequest(job, done);
        });

        agenda.on('ready', function() {
            agenda.start();
        });
        agenda.on('error', function() {
            logger.error('Agenda error - stopping');
            agenda.stop();
        });

        agenda.db_init();

        return agenda;

    } catch (e) {
        logger.error({error: e}, 'error initializing agenda');
        return null;
    }
}

function sendRequest(job, done) {

    var info = job.attrs.data;
    var url = info.url + '/' + info.cdsname;

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

//Note: agenda shutdown logic applied in app-factory

function getAgenda() {
    return agenda;
}

function getAgendaJobProcessorName() {
    return jobProcessorName;
}

module.exports.init = init;
module.exports.getAgenda = getAgenda;
module.exports.getAgendaJobProcessorName = getAgendaJobProcessorName;
