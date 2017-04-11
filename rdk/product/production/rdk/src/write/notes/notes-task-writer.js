'use strict';

var httpUtil = require('../../core/rdk').utils.http;
var paramUtil = require('../../utils/param-converter');
var _ = require('lodash');

module.exports.getDefinitions = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var requestConfig = {
        logger: writebackContext.logger,
        baseUrl: appConfig.fetchServer.baseUrl,
        url: '/resource/tasks/getprocessdefinitions',
        json: true,
        headers: {
            cookie: writebackContext.cookie
        }
    };

    var options = _.extend({}, requestConfig);
    httpUtil.get(options, function(err, response, body) {
        logger.info('note-task-writer.getDefinitions jBPM response', JSON.stringify(response));
        logger.info('note-task-writer.getDefinitions jBPM body', JSON.stringify(body));
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

        writebackContext.deploymentId = _.find(body.data.items, function(obj) {
            return obj.id === 'General_Medicine.Note';
        }).deploymentId;

        if (!writebackContext.deploymentId) {
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
        url: '/resource/tasks/startprocess',
        json: true,
        headers: {
            cookie: writebackContext.cookie
        }
    };

    var options = _.extend({}, requestConfig, {
        body: createTaskJson(writebackContext)
    });
    httpUtil.post(options, function(err, response, body) {
        logger.info('note-task-writer.create jBPM response', JSON.stringify(response));
        logger.info('note-task-writer.create jBPM body', JSON.stringify(body));
        if (err) {
            logger.error('note-task-writer.create error', err);
            return callback(err);
        }

        if (!body || !body.data || !body.data.processInstanceId) {
            logger.error('Failed to create jBPM process.');
            return callback('Failed to create jBPM process. Review rdk logs.');
        }
        writebackContext.model.processInstanceId = body.data.processInstanceId;
        return callback(null);
    });
};

module.exports.delete = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var requestConfig = {
        logger: writebackContext.logger,
        baseUrl: appConfig.fetchServer.baseUrl,
        url: '/resource/tasks/abortprocess',
        json: true,
        headers: {
            cookie: writebackContext.cookie
        }
    };

    var options = _.extend({}, requestConfig, {
        body: deleteTaskJson(writebackContext)
    });
    httpUtil.post(options, function(err, response, body) {
        logger.info('note-task-writer.delete jBPM response', JSON.stringify(response));
        logger.info('note-task-writer.delete jBPM body', JSON.stringify(body));
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
        url: '/resource/tasks/getcurrenttask',
        json: true,
        headers: {
            cookie: writebackContext.cookie
        }
    };

    var options = _.extend({}, requestConfig, {
        body: {
            'processInstanceId': parseInt(writebackContext.model.processInstanceId),
            'icn': writebackContext.siteHash + ';' + writebackContext.model.pid
        }
    });
    httpUtil.post(options, function(err, response, body) {
        logger.info('note-task-writer.getTask jBPM response', JSON.stringify(response));
        logger.info('note-task-writer.getTask jBPM body', JSON.stringify(body));
        if (err) {
            logger.error('note-task-writer.getTask error', err);
            return callback(err);
        }
        if (!body || !body.data || !body.data.items || !body.data.items[0] || !body.data.items[0].TASKID) {
            logger.error('Failed to get task id.', body.data.items);
            return callback('Failed to retrieve task id from jBPM. Review rdk logs.');
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
        url: '/resource/tasks/changestate',
        json: true,
        headers: {
            cookie: writebackContext.cookie
        }
    };

    var options = _.extend({}, requestConfig, {
        body: changestateJson(writebackContext, 'start')
    });
    httpUtil.post(options, function(err, response, body) {
        logger.info('note-task-writer.start jBPM response', JSON.stringify(response));
        logger.info('note-task-writer.start jBPM body', JSON.stringify(body));
        if (err) {
            logger.error('note-task-writer.start error', err);
            return callback(err);
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
        url: '/resource/tasks/changestate',
        json: true,
        headers: {
            cookie: writebackContext.cookie
        }
    };

    var options = _.extend({}, requestConfig, {
        body: changestateJson(writebackContext, 'complete')
    });
    httpUtil.post(options, function(err, response, body) {
        logger.info('note-task-writer.complete jBPM response', JSON.stringify(response));
        logger.info('note-task-writer.complete jBPM body', JSON.stringify(body));
        if (err) {
            logger.error('note-task-writer.complete error', err);
            return callback(err);
        }
        return callback(null);
    });
};

function changestateJson(writebackContext, state) {
    return {
        'taskid': writebackContext.model.taskId.toString(),
        'state': state,
        'deploymentid': writebackContext.deploymentId
    };
}

function createTaskJson(writebackContext) {
    var title = writebackContext.model.localTitle.replace(/</g, '(').replace(/>/g, ')').replace(/&/g, ' AND ');
    var noteInformation = '\nPatient: ' + writebackContext.model.patientName +
        '\nDOB: ' + paramUtil.convertWriteBackInputDate(writebackContext.model.patientBirthDate).format('MM/DD/YYYY') +
        '\nAuthor: ' + writebackContext.model.authorDisplayName +
        '\nNote Title: ' + title +
        '\nDate of Note: ' + paramUtil.convertWriteBackInputDate(writebackContext.model.referenceDateTime).format('MM/DD/YYYY HH:mm') +
        '\nStatus: ' + writebackContext.model.statusDisplayName;
    return {
        'deploymentId': writebackContext.deploymentId,
        'processDefId': 'General_Medicine.Note',
        'parameter': {
            'noteId': writebackContext.model.uid.toString(),
            'noteTitle': title,
            'noteInformation': noteInformation,
            'icn': writebackContext.siteHash + ';' + writebackContext.model.pid
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