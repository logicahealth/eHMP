'use strict';

var async = require('../../../node_modules/async/lib/async');
var activitiesResource = require('../../resources/activitymanagement/activities/activities-operations-resource'); // For signal processing to Consults
var getGenericJbpmConfig = require('../../resources/activitymanagement/activity-utils').getGenericJbpmConfig; // For signal processing to Consults
var consultTaskOperations = require('../../resources/activitymanagement/tasks/consult-tasks-resource');
var httpUtil = require('../../core/rdk').utils.http;
var paramUtil = require('../../utils/param-converter');
var writeNoteToPjds = require('./notes-unsigned-pjds-writer');
var _ = require('lodash');

module.exports.getDefinitions = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var requestConfig = {
        logger: writebackContext.logger,
        baseUrl: appConfig.fetchServer.baseUrl,
        url: '/resource/activities/',
        json: true,
        headers: {
            cookie: writebackContext.cookie,
            authorization: writebackContext.authorization
        }
    };

    var options = _.extend({}, requestConfig);
    httpUtil.get(options, function(err, response, body) {
        logger.info({
            res: response,
            body: body
        }, 'note-task-writer.getDefinitions jBPM response');
        if (err) {
            logger.error('note-task-writer.getDefinitions error', err);
            return callback(err);
        }

        if (body.errno) {
            if (body.errno.indexOf('EHOSTUNREACH') > -1) {
                return callback('The jBPM server is unreachable.');
            }
            return callback(body.errno);
        }

        if (!body || !body.data || !body.data.items) {
            logger.error('Failed to retrieve definitions from jBPM');
            return callback('Failed to retrieve definitions from jBPM. Review rdk logs.');
        }

        var availableDeployments = _.filter(body.data.items, function(obj) {
            return obj.id === 'General_Medicine.Note';
        });

        if (!!availableDeployments.length) {
            writebackContext.deploymentId = getDeploymentId(availableDeployments);
        } else {
            logger.error('Failed to find note deploymentId');
            return callback('Failed to find note deploymentId from jBPM response. Review rdk logs.');
        }

        logger.info('Set note activity deploymentId', writebackContext.deploymentId);
        return callback(null);
    });
    return;
};

module.exports.create = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var requestConfig = {
        logger: writebackContext.logger,
        baseUrl: appConfig.fetchServer.baseUrl,
        url: '/resource/activities/start',
        json: true,
        headers: {
            cookie: writebackContext.cookie,
            authorization: writebackContext.authorization
        }
    };

    var options = _.extend({}, requestConfig, {
        body: createTaskJson(writebackContext)
    });
    httpUtil.post(options, function(err, response, body) {
        var errorMessage = null;
        logger.info({
            res: response,
            body: body
        }, 'note-task-writer.create jBPM response');
        if (err) {
            logger.error('note-task-writer.create error', err);
            errorMessage = err;
        }

        if (!body || !body.data || !body.data.processInstanceId) {
            logger.error('Failed to create jBPM process.');
            errorMessage = 'Failed to create jBPM process. Review rdk logs.';
        }
        if (_.isNull(errorMessage)) {
            writebackContext.model.processInstanceId = body.data.processInstanceId;
            return callback(null);
        } else {
            if (writebackContext.model.isAddendum) {
                writeNoteToPjds.deleteAddendum(writebackContext, function() {
                    return callback(errorMessage);
                });
            } else {
                writeNoteToPjds.delete(writebackContext, function() {
                    return callback(errorMessage);
                });
            }
        }
    });
};

module.exports.delete = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var requestConfig = {
        logger: writebackContext.logger,
        baseUrl: appConfig.fetchServer.baseUrl,
        url: '/resource/activities/abort',
        json: true,
        headers: {
            cookie: writebackContext.cookie,
            authorization: writebackContext.authorization
        }
    };

    var options = _.extend({}, requestConfig, {
        body: deleteTaskJson(writebackContext)
    });
    httpUtil.post(options, function(err, response, body) {
        logger.info({
            res: response,
            body: body
        }, 'note-task-writer.delete jBPM response');
        if (err) {
            logger.error('note-task-writer.delete error', err);
            return callback(err);
        }
        return callback(null);
    });
};

module.exports.getTask = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var requestConfig = {
        logger: writebackContext.logger,
        baseUrl: appConfig.fetchServer.baseUrl,
        url: '/resource/tasks/current',
        json: true,
        headers: {
            cookie: writebackContext.cookie,
            authorization: writebackContext.authorization
        }
    };

    var options = _.extend({}, requestConfig, {
        body: {
            'processInstanceId': parseInt(writebackContext.model.processInstanceId),
            'icn': writebackContext.siteHash + ';' + writebackContext.model.pid
        }
    });
    httpUtil.post(options, function(err, response, body) {
        logger.info({
            res: response,
            body: body
        }, 'note-task-writer.getTask jBPM response');
        if (err) {
            logger.error('note-task-writer.getTask error', err);
            writebackContext.model.taskId = '';
            // Don't return an error as the main function of the resource call was successful.
            if (_.isObject(writebackContext.vprResponse)) {
                writebackContext.vprResponse.jBPMerror = {
                    noteMessage: 'Signed note, failed to get task.',
                    jbmpMessage: err
                };
            }
            return callback(null);
        }
        if (!body || !body.data || !body.data.items || !body.data.items[0] || !body.data.items[0].TASKID) {
            logger.error('Failed to get task id from jBPM.');
            writebackContext.model.taskId = '';
            // Don't return an error as the main function of the resource call was successful.
            if (_.isObject(writebackContext.vprResponse)) {
                writebackContext.vprResponse.jBPMerror = {
                    noteMessage: 'Signed note.Failed to retrieve task id from jBPM. Review rdk logs.',
                    jbmpMessage: err
                };
            }
            return callback(null);
        }
        writebackContext.model.taskId = body.data.items[0].TASKID;
        return callback(null);
    });
};

module.exports.start = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var requestConfig = {
        logger: writebackContext.logger,
        baseUrl: appConfig.fetchServer.baseUrl,
        url: '/resource/tasks/update',
        json: true,
        headers: {
            cookie: writebackContext.cookie,
            authorization: writebackContext.authorization
        }
    };

    var options = _.extend({}, requestConfig, {
        body: changestateJson(writebackContext, 'start')
    });
    httpUtil.post(options, function(err, response, body) {
        logger.info({
            res: response,
            body: body
        }, 'note-task-writer.start jBPM response');
        if (err) {
            logger.error('note-task-writer.start error', err);
            // Don't return an error as the main function of the resource call was successful.
            if (_.isObject(writebackContext.vprResponse)) {
                writebackContext.vprResponse.jBPMerror = {
                    noteMessage: 'Signed note, failed to start task.',
                    jbmpMessage: err
                };
            }
            return callback(null);
        }
        return callback(null);
    });
};

module.exports.complete = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var requestConfig = {
        logger: writebackContext.logger,
        baseUrl: appConfig.fetchServer.baseUrl,
        url: '/resource/tasks/update',
        json: true,
        headers: {
            cookie: writebackContext.cookie,
            authorization: writebackContext.authorization
        }
    };

    var options = _.extend({}, requestConfig, {
        body: changestateJson(writebackContext, 'complete')
    });
    httpUtil.post(options, function(err, response, body) {
        logger.info({
            res: response,
            body: body
        }, 'note-task-writer.complete jBPM response');
        if (err) {
            logger.error('note-task-writer.complete error', err);
            // Don't return an error as the main function of the resource call was successful.
            if (_.isObject(writebackContext.vprResponse)) {
                writebackContext.vprResponse.jBPMerror = {
                    noteMessage: 'Signed note, failed to complete task.',
                    jbmpMessage: err
                };
            }
            return callback(null);
        }
        return callback(null);
    });
};

// Retreives a list of open consults and finds the ones that have a matching
// note uid. If the consult has the matching note uid, then add the consult
// deploymentId and processInstanceId to the note model
//
// The deploymentId and processInstanceId is needed for completeConsults and disconnectConsults
module.exports.getOpenConsultsForNoteUid = function(req, writebackContext, callback) {
    var pid = writebackContext.pid;
    var pidError;

    if (!pid) {
        pidError = new Error('Unable to retrieve \'pid\' parameter');
        writebackContext.logger.error(pidError);
        return callback(pidError.message);
    }

    var jbpmConfig = getGenericJbpmConfig(req);
    var dbConfig = req.app.config.jbpm.activityDatabase;
    consultTaskOperations.doGetOpenConsultTasks(pid, writebackContext.logger, jbpmConfig, dbConfig, function(err, results) {
        if (err) {
            writebackContext.logger.error(err);
            return callback(err);
        }

        var note;
        if (writebackContext.model.signItems) {
            note = writebackContext.model.signItems[0];
        } else {
            note = writebackContext.model;
        }

        var consults = [];
        _.each(results, function(consult) {
            if (consult.noteClinicalObjectUid === note.uid) {
                consults.push({
                    deploymentId: consult.deploymentId,
                    processInstanceId: consult.activityInstanceId
                });
            }
        });

        note.consults = consults;
        return callback();
    });
};

module.exports.completeConsults = function(req, writebackContext, callback) {
    // Descope
    if (!_.isObject(writebackContext) || !_.isObject(writebackContext.model)) {
        return callback('notes-task-writer::completeConsults called with malformed writebackContext');
    }
    var model = writebackContext.model;
    if (!_.isArray(model.signItems) || _.size(model.signItems) !== 1 || !_.isObject(model.signItems[0])) {
        return callback('notes-task-writer::completeConsults called with malformed note model');
    }
    var note = model.signItems[0];
    if (!_.isObject(req) || !_.isObject(req.session) || !_.isObject(req.session.user)) {
        return callback('notes-task-writer::completeConsults called with malformed request or session data');
    }

    // If we have reached this point, the Complete Consult payload will fire, we don't monitor its results because failover would create hanging data
    return consultSignal(req, note, 'COMPLETE', writebackContext, callback);
};

module.exports.disconnectConsults = function(req, writebackContext, callback) {
    // Descope
    if (!_.isObject(writebackContext) || !_.isObject(writebackContext.model)) {
        return callback('notes-task-writer::completeConsults called with malformed writebackContext or model');
    }
    var note = writebackContext.model;
    if (!_.isObject(req) || !_.isObject(req.session) || !_.isObject(req.session.user)) {
        return callback('notes-task-writer::completeConsults called with malformed request or session data');
    }

    // If we have reached this point, the Release Consult payload will fire, we don't monitor its results because failover would create hanging data
    return consultSignal(req, note, 'RELEASE.CONSULT', writebackContext, callback);
};

// PRE: Needs valid note, user, and signal (do not pass in null or malformed)
function consultSignal(req, note, signal, writebackContext, taskCallback) {
    // Simplify
    var user = req.session.user;
    var consults = note.consults || [];
    var noteTitle = (note.localTitle || 'INVALID TITLE').replace(/</g, '(').replace(/>/g, ')').replace(/&/g, ' AND '); // Protect Consults for their query to SQL
    var noteClinicalObjectUid = note.uid || 'INVALID NOTE ID';
    var executionUserId = user.uid || 'INVALID SESSION USER ID';
    var executionUserName = user.username || 'INVALID SESSION USERNAME';
    var location = note.locationUid || 'INVALID LOCATION UID FOR NOTE ENCOUNTER';
    var serviceCategory = note.encounterServiceCategory || 'INVALID SERVICE CATEGORY FOR NOTE ENCOUNTER';
    var dateTime = note.encounterDateTime || 'INVALID DATETIME FOR NOTE ENCOUNTER';
    var logger = req.logger;

    // Prepare the signal payload
    var signalContent = {
        'signalBody': {
            'objectType': 'signalBody',
            'noteTitle': noteTitle,
            'noteClinicalObjectUid': noteClinicalObjectUid,
            'comment': 'Notes Applet ' + signal + ' signal body payload',
            'executionUserId': executionUserId,
            'executionUserName': executionUserName
        }
    };

    // Special case appends this field because it has to
    if (signal === 'COMPLETE') {
        signalContent.signalBody.actionText = 'Completed, Admin';
        signalContent.signalBody.actionId = 1;
        signalContent.signalBody.visit = {
            'location': location,
            'serviceCategory': serviceCategory,
            'dateTime': dateTime
        };
    }

    // Tell all linked Consults to fire the given signal
    var failedArr = [];
    async.each(consults, function(consult, callback) {
        // Simplify
        var deploymentId = consult.deploymentId || 'INVALID DEPLOYMENT ID FOR CONSULT';
        var processInstanceId = parseInt(consult.processInstanceId) || 'INVALID PROCESS INSTANCE ID FOR CONSULT';

        activitiesResource.doSignal(getGenericJbpmConfig(req), deploymentId, processInstanceId, signal, signalContent, function(err) {
            if (err) {
                logger.error({
                    failedConsult: consult,
                    error: err,
                    message: 'Failed to signal consult. notes-task-writer.consultSignal'
                });
                consult.error = err;
                failedArr.push(consult);

            }
            return callback();
        });
    }, function(err) {
        if (failedArr.length > 0) {
            if (_.isObject(writebackContext.vprResponse)) {
                writebackContext.vprResponse.failedConsults = failedArr;
            } else {
                writebackContext.vprResponse = {
                    failedConsults: failedArr
                };
            }
            if (signal === 'COMPLETE') {
                async.each(failedArr, function(consult, callback) {
                    var deploymentId = consult.deploymentId || 'INVALID DEPLOYMENT ID FOR CONSULT';
                    var processInstanceId = parseInt(consult.processInstanceId) || 'INVALID PROCESS INSTANCE ID FOR CONSULT';
                    activitiesResource.doSignal(getGenericJbpmConfig(req), deploymentId, processInstanceId, 'RELEASE.CONSULT', signalContent, function(err) {
                        logger.error({
                            consult: consult,
                            error: err,
                            message: 'Failed to disassociate after failed complete.'
                        });
                    });
                    return callback();
                });
            }
        }

        return taskCallback();
    });
}

function changestateJson(writebackContext, state) {
    return {
        'taskid': writebackContext.model.taskId ? writebackContext.model.taskId.toString() : '',
        'state': state,
        'deploymentid': writebackContext.deploymentId
    };
}

function getDeploymentId(deployments) {
    deployments = deployments.sort(function(a, b) {
        //example: VistaCore:General_Medicine:2.0.0.1
        var anums = a.deploymentId.split(':')[2].split('.');
        var bnums = b.deploymentId.split(':')[2].split('.');
        var length = anums.length > bnums.length ? anums.length : bnums.length;
        for (var i = 0; i < length; i++) {
            var thisPart = i < anums.length ? anums[i] : 0;
            var thatPart = i < bnums.length ? bnums[i] : 0;
            if (thisPart !== thatPart) {
                return thatPart - thisPart;
            }
        }
        return 0;
    });
    return deployments[0].deploymentId;
}

function createTaskJson(writebackContext) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;
    var title = model.localTitle.replace(/</g, '(').replace(/>/g, ')').replace(/&/g, ' AND ');
    var noteInformation = '\nPatient: ' + model.patientName +
        '\nDOB: ' + paramUtil.convertWriteBackInputDate(model.patientBirthDate).format('MM/DD/YYYY') +
        '\nAuthor: ' + model.authorDisplayName +
        '\nNote Title: ' + title +
        '\nDate of Note: ' + paramUtil.convertWriteBackInputDate(model.referenceDateTime).format('MM/DD/YYYY HH:mm') +
        '\nStatus: ' + model.statusDisplayName;
    return {
        'deploymentId': writebackContext.deploymentId,
        'processDefId': 'General_Medicine.Note',
        'parameter': {
            'clinicalObjectUid': model.uid.toString(),
            'noteTitle': title,
            'noteInformation': noteInformation,
            'icn': model.siteHash + ';' + model.pid,
            'isAddendum': model.isAddendum
        }
    };
}

function deleteTaskJson(writebackContext) {
    return {
        'deploymentId': writebackContext.deploymentId,
        'processDefId': 'General_Medicine.Note',
        'processInstanceId': parseInt(writebackContext.model.processInstanceId)
    };
}
