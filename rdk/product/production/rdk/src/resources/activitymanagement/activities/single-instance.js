'use strict';

var _ = require('lodash');
var async = require('async');
var querystring = require('querystring');
var jdsFilter = require('jds-filter');
var rdk = require('../../../core/rdk');
var clinicalObjectSubsystem = require('../../../subsystems/clinical-objects/clinical-objects-subsystem');
var filterAsuDocuments = require('../../../subsystems/jds/jds-subsystem').filterAsuDocuments;
var httpUtil = rdk.utils.http;
var activityDb = require('../../../subsystems/jbpm/jbpm-subsystem');
var actionsJson = require('./activity-instance-actions');
var resultUtils = rdk.utils.results;

function transformQueryResults(req, instanceId, data, callback) {
    req.logger.debug({
        data: data
    });
    var results = {};
    if (_.isEmpty(data)) {
        req.logger.debug('No results found');
        return callback(null, results);
    }

    results.processId = instanceId;
    results.activityName = data.ACTIVITYNAME;
    results.activityDescription = data.ACTIVITYDESCRIPTION;
    results.instanceName = data.INSTANCENAME;
    results.domain = data.DOMAIN;
    results.pid = data.PID;
    results.userID = data.USERID;
    results.healthIndicator = data.ACTIVITYHEALTHY;
    results.healthIndicatorReason = data.ACTIVITYHEALTHDESCRIPTION;
    results.startedDateTime = data.STATESTARTDATE;
    results.initiationDate = data.INITIATIONDATE;
    results.deploymentId = data.DEPLOYMENTID;
    results.clinicalObjectUID = data.CLINICALOBJECTUID;
    results.state = data.STATE;
    results.processDefinitionId = data.PROCESSDEFINITIONID;
    results.facilityRequestDivisionId = data.FACILITYID;

    var urgency = data.URGENCY;

    if (!_.isUndefined(urgency)) {
        results.urgency = urgency;
    }

    pidToNameLookup(req, results.userID, function (err, user) {
        if (err) {
            req.logger.error(err);
            return callback(null, results);
        }

        results.startedBy = user.name;
        return callback(null, results);
    });
}

function transformHistoryQueryResults(req, results, data, callback) {
    if (_.isEmpty(data)) {
        req.logger.debug('No results found');
        return callback(null, results);
    }

    var temp = [];

    async.eachSeries(data, function (item, cb) {
        var obj = {};
        obj.taskName = item.TASKNAME;
        obj.signalAction = item.SIGNALACTION;
        obj.signalStatusTimestamp = item.STATUSTIMESTAMP;
        obj.signalHistory = item.SIGNALHISTORY;
        pidToNameLookup(req, item.SIGNALOWNERNAME, function (err, owner) {
            if (err) {
                req.logger.error(err);
            } else {
                obj.signalOwnerName = owner.name;
            }

            temp.push(obj);
            return cb(null);
        });
    }, function cb(err) {
        if (err) {
            req.logger.error(err);
        }

        results.taskHistory = temp;
        return callback(null, results);
    });
}

function getTaskDetails(req, callback) {
    var instanceId = parseInt(req.query.id);

    if (!_.isNumber(instanceId)) {
        return callback('invalid query parameters');
    }

    var procParams = {
        p_process_instance_id: instanceId
    };

    var procQuery = 'BEGIN ACTIVITIES.getInstance(:p_process_instance_id, :recordset); END;';

    activityDb.doExecuteProcWithParams(req, req.app.config.jbpm.activityDatabase, procQuery, procParams, function (err, data) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }

        data = resultUtils.unescapeSpecialCharacters(data, ['ACTIVITYHEALTHDESCRIPTION', 'INSTANCENAME'])[0];
        // if no data was found
        if (_.isUndefined(data)) {
            req.logger.debug('query returned no results');
            return callback(null, '');
        }

        transformQueryResults(req, instanceId, data, function (err, results) {
            return callback(null, results);
        });
    });
}

function getTaskHistory(req, results, callback) {
    if (_.isEmpty(results)) {
        req.logger.debug('no results');
        return callback(null, '');
    }

    var instanceId = parseInt(req.query.id);

    if (!_.isNumber(instanceId)) {
        return callback('invalid query parameters');
    }

    var procParams = {
        p_process_instance_id: instanceId
    };

    var procQuery = 'BEGIN ACTIVITIES.getActivityHistory(:p_process_instance_id, :recordset); END;';

    activityDb.doExecuteProcWithParams(req, req.app.config.jbpm.activityDatabase, procQuery, procParams, function (err, data) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }

        if (_.isEmpty(data)) {
            req.logger.debug('query returned no results');
            return callback(null, results);
        }

        transformHistoryQueryResults(req, results, data, function (err, result) {
            return callback(null, results);
        });
    });
}

function _getPatientDemographics(logger, patient, results) {
    logger.trace({
        patient: patient
    });

    if (_.isUndefined(patient)) {
        logger.error('undefined patient');
        return undefined;
    }

    if (_.isUndefined(_.get(patient, 'genderName')) || _.isUndefined(_.get(patient, 'displayName')) ||
        _.isUndefined(_.get(patient, 'birthDate')) || _.isUndefined(_.get(patient, 'last4'))) {
        logger.error('malformed patient');
        return undefined;
    }

    if (_.isUndefined(results)) {
        results = {};
    }

    var genderName = patient.genderName;
    var displayName = patient.displayName;
    var parts = displayName.split(',');

    results.gender = (_.isUndefined(genderName) || !_.isString(genderName) ? '?' : genderName[0]);
    results.DOB = patient.birthDate;
    results.ssn = patient.last4;
    results.firstName = parts[1];
    results.lastName = parts[0];

    logger.trace({
        results: results
    });
    return results;
}

function getPatientDemographics(req, results, callback) {

    if (_.isEmpty(results)) {
        req.logger.debug('no results');
        return callback(null, '');
    }

    var patientID = results.pid;

    var path = '/data/index/pt-select-pid?range=' + patientID;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: path,
        logger: req.logger,
        json: true
    });

    httpUtil.get(options, function (err, response, body) {
        if (err) {
            req.logger.error(err);
            return callback(null, results);
        }

        var patient = _.get(body, 'data.items[0]');
        if (_.isUndefined(patient)) {
            return callback('could not get patient demographics');
        }

        results = _getPatientDemographics(req.logger, patient, results);

        return callback(null, results);
    });
}

function getUserDemographicsQuery(req, userID) {
    var logger = req.logger;

    if (_.isUndefined(userID)) {
        logger.error({
            error: 'undefined userID'
        });
        return undefined;
    }

    var idSplit = userID.split(';');
    var uid = 'urn:va:user:' + idSplit[0] + ':' + idSplit[1];
    var jdsPath = '/data/' + uid;

    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: logger || {},
        json: true
    });

    logger.debug(options, 'getUserDemographicsQuery options');

    return options;
}

function getClinicalObjectDetails(req, results, callback) {
    if (_.isEmpty(results)) {
        req.logger.debug('no results');
        return callback(null, '');
    }

    var logger = req.logger;
    var clinicalObjectUID = results.clinicalObjectUID;
    var clinObjects = clinicalObjectSubsystem.read(logger, req.app.config, clinicalObjectUID, true, function (err, object) {
        if (err) {
            logger.error('error retrieving clinical object');
            return callback('error retrieving clinical object');
        }
        results.clinicalObject = object;
        return callback(null, results);
    });
}

function getNoteClinicalObjectDetails(req, results, callback) {
    if (_.isEmpty(results)) {
        req.logger.debug('no results for note clinical object details');
        return callback(null, '');
    }

    var noteClinicalObjectUid = _.get(results, 'clinicalObject.data.completion.noteClinicalObjectUid');
    if (_.isEmpty(noteClinicalObjectUid)) {
        req.logger.debug('could not find note clinical object');
        return callback(null, results);
    }

    var logger = req.logger;
    var clinObjects = clinicalObjectSubsystem.read(logger, req.app.config, noteClinicalObjectUid, true, function (err, object) {
        if (err) {
            logger.debug('error retrieving clinical object for note');
            return callback(null, results);
        }

        var details = {
            data: {
                items: []
            }
        };
        details.data.items.push(object.data);

        //Run through the ASU rules
        filterAsuDocuments(req, details, function (err, response) {
            if (!err && !_.isEmpty(response)) {
                results.associatedNoteClinicalObject = object;
            }
            return callback(null, results);
        });
    });
}

function pidToNameLookup(req, userID, callback) {
    var options = getUserDemographicsQuery(req, userID);
    if (_.isUndefined(options)) {
        req.logger.error('Invalid user ID');
        return callback('Invalid user ID');
    }
    httpUtil.get(options, function (err, response, body) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }

        var user = _.get(body, 'data.items[0]');

        if (_.isUndefined(user)) {
            return callback('could not get user demographics');
        }

        return callback(null, user);
    });
}

function lookupActions(logger, results, records, callback) {
    if (_.isEmpty(results)) {
        logger.debug('no results');
        return callback(null, '');
    }

    var retVal = [];
    var domain = results.domain;
    var stateInformation = results.state;
    results.actions = retVal;

    if (_.isEmpty(domain) || _.isEmpty(stateInformation) || _.isEmpty(records)) {
        logger.error({
            domain: domain,
            state: state,
            records: records
        });
        return callback(null, results);
    }

    var state = '';
    var substate = '';
    var stateParts = stateInformation.split(':');
    if (!_.isArray(stateParts) || stateParts.length !== 2) {
        state = stateInformation;
        substate = '';
    } else {
        state = stateParts[0];
        substate = stateParts[1];
    }

    domain = domain.toLowerCase();

    var record = _.get(_.find(_.get(records, 'domains'), domain), domain);

    if (_.isUndefined(record) || !_.isArray(record)) {
        logger.error('malformed JSON');
        return callback(null, results);
    }

    var index = 0;
    var length = record.length;
    var current;
    while (index < length) {
        current = record[index];
        var massagedState = state.toLowerCase().trim();
        var massagedSubState = substate.toLowerCase().trim();
        if (current.state.toLowerCase() === state.toLowerCase().trim() &&
            current.substate.toLowerCase() === substate.toLowerCase().trim()) {
            results.actions = current.actions;
            return callback(null, results);
        }
        index++;
    }

    logger.error({
        state: stateInformation,
        error: 'failed to retrieve actions'
    });
    return callback(null, results);
}

function getActions(req, results, callback) {
    if (_.isEmpty(results)) {
        req.logger.debug('no results');
        return callback(null, '');
    }

    var logger = req.logger;

    lookupActions(logger, results, actionsJson, function (err, result) {
        if (err) {
            logger.error(err);
        }
        return callback(null, results);
    });
}

function get(req, res) {
    req.audit.dataDomain = 'Activities';
    req.audit.logCategory = 'ACTIVITY_SINGLE_INSTANCE';

    var logger = req.logger;
    var id = req.query.id;
    if (_.isUndefined(id)) {
        logger.error('get parameter is missing');
        return res.status(rdk.httpstatus.bad_request).rdkSend('get parameter is missing');
    }

    var taskDetails = getTaskDetails.bind(null, req);
    var taskHistory = getTaskHistory.bind(null, req);
    var patientDetails = getPatientDemographics.bind(null, req);
    var clinicalObject = getClinicalObjectDetails.bind(null, req);
    var noteClinicalObject = getNoteClinicalObjectDetails.bind(null, req);
    var actions = getActions.bind(null, req);

    async.waterfall([taskDetails, taskHistory, patientDetails, clinicalObject, noteClinicalObject, actions],
        function (err, results) {
            if (err) {
                logger.error(err);
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }

            var finalAnswer = {};
            finalAnswer.items = results;
            return res.status(rdk.httpstatus.ok).rdkSend(finalAnswer);

        }
    );
}

module.exports._getUserDemographicsQuery = getUserDemographicsQuery;
module.exports._getPatientDemographics = _getPatientDemographics;
module.exports._transformQueryResults = transformQueryResults;
module.exports._transformHistoryQueryResults = transformHistoryQueryResults;
module.exports._getTaskDetails = getTaskDetails;
module.exports._getTaskHistory = getTaskHistory;
module.exports.getClinicalObjectDetails = getClinicalObjectDetails;
module.exports.getActions = getActions;
module.exports._lookupActions = lookupActions;
module.exports.get = get;
