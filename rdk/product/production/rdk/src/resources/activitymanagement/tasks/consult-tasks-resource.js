'use strict';

var rdk = require('../../../core/rdk');
var uriBuilder = rdk.utils.uriBuilder;
var httpUtil = rdk.utils.http;
var activityDb = require('../../../subsystems/jbpm/jbpm-subsystem');
var _ = require('lodash');
var getGenericJbpmConfig = require('../activity-utils').getGenericJbpmConfig;
var callJpid = require('./task-operations-resource').callJpid;
var async = require('async');
var moment = require('moment');

function getOpenConsultTasks(req, res) {
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'GET_OPEN_CONSULT_TASKS';

    var pid = req.param('pid');
    var pidError;

    if (!pid) {
        pidError = new Error('Unable to retrieve \'pid\' parameter');
        req.logger.error(pidError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(pidError.message);
    }

    var consultTaskCb = function(err, results) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
        return res.rdkSend(results);
    };

    callJpid(req, pid, function(error, response, result) {
        if (error) {
            req.logger.error(error);
        }

        var identifiers = [];

        if (result && result.hasOwnProperty('patientIdentifiers') && Array.isArray(result.patientIdentifiers)) {
            identifiers = result.patientIdentifiers;

            //identifiers should not currently contain any commas
            //if in the future they do, buggy behavior will occur due to the comma split performed in getTasksByIds procedure
            _.each(identifiers, function(id, idIndex) {
                if (id.indexOf(',') !== -1) {
                    req.logger.error('Unqueryable patient identifier encountered from jpid lookup');
                    identifiers.splice(idIndex, 1);
                }
            });
        }

        if (error || identifiers.length === 0 || !result || !result.hasOwnProperty('patientIdentifiers') || result.patientIdentifiers.length < 2) {
            //use only passed-in patient id value in case of:
            // error looking up patient identifiers
            // received malformed result from identifier lookup
            // no additional identifiers were retrieved (0 or 1 result in array)
            // all identifiers contained unqueryable characters
            if (pid.indexOf(',') !== -1) {
                return consultTaskCb(new Error('Invalid \'pid\' parameter'));
            }
            return doGetOpenConsultTasks(pid, req.logger, getGenericJbpmConfig(req), req.app.config.jbpm.activityDatabase, consultTaskCb);
        }

        return doGetOpenConsultTasks(identifiers.join(), req.logger, getGenericJbpmConfig(req), req.app.config.jbpm.activityDatabase, consultTaskCb);
    });
}

function doGetOpenConsultTasks(identifiers, logger, jbpmConfig, dbConfig, consultTaskCb) {

    var activityStates = 'Active:eConsult, Provider Completing|Active:eConsult|Scheduled:Appt. Booked|Scheduled:Appt. in Past|Scheduled:Appt. in Past, Checked Out|Scheduled:Patient no-showed previous Appt.|Scheduled:Provider Completing|Scheduling:Provider Completing|Scheduling:1st Attempt|Scheduling:2nd Attempt|Scheduling:3rd Attempt|Scheduling:EWL|Scheduling:Underway';
    var processDefinitionId = 'Order.Consult';

    var cb = function(err, rows) {
        if (err) {
            //error fetch results from DB
            return consultTaskCb(err);
        }

        if (rows && rows.length > 0) {
            var stubs = [];
            var asyncFunctions = [];
            _.each(rows, function(row, idx) {
                var stubObj = {};
                if (row) {
                    if (row.CREATEDON) {
                        stubObj.createdOn = convertOracleDateToDisplay(row.CREATEDON);
                    }

                    if (row.DEPLOYMENTID) {
                        stubObj.deploymentId = row.DEPLOYMENTID;
                    }

                    if (row.PROCESSINSTANCEID) {
                        stubObj.activityInstanceId = row.PROCESSINSTANCEID;
                    }

                    if (row.TASKID) {
                        stubObj.taskId = row.TASKID;

                        var internalCb = function(asyncCb) {
                            var uri = uriBuilder.fromUri('/tasksservice').path('/task/' + row.TASKID);
                            jbpmConfig.url = uri.build();
                            return httpUtil.get(jbpmConfig, function(err, response, returnedData) {
                                if (err) {
                                    //error retrieving task details from tasks service
                                    return asyncCb(err);
                                }

                                return asyncCb(null, returnedData);
                            });
                        };
                        asyncFunctions.push(internalCb);
                    }
                }

                stubs.push(stubObj);
            });

            async.parallelLimit(asyncFunctions, 5, function(asyncErr, asyncRes) {
                if (asyncErr) {
                    return consultTaskCb(asyncErr);
                }

                var finalRes = [];
                if (asyncRes && asyncRes.length) {
                    _.each(asyncRes, function(taskItemDetail) {
                        if (taskItemDetail && taskItemDetail.data && taskItemDetail.data.items && taskItemDetail.data.items.length) {
                            _.each(taskItemDetail.data.items, function(moreTaskItemDetail) {

                                var taskId = _.get(moreTaskItemDetail, 'id') || null;
                                var activityInstanceId = _.get(moreTaskItemDetail, 'processInstanceId') || null;

                                var correspondingStub = _.filter(stubs, {
                                    'taskId': taskId,
                                    'activityInstanceId': activityInstanceId
                                });

                                if (taskId && activityInstanceId && correspondingStub && correspondingStub.length === 1) {
                                    correspondingStub = correspondingStub[0];

                                    _.each(_.filter(moreTaskItemDetail.variables, {
                                        'name': 'consultClinicalObject'
                                    }), function(consultClinicalObject) {
                                        try {
                                            consultClinicalObject = JSON.parse(consultClinicalObject.value);
                                        } catch (e) {
                                            logger.error('Invalid JSON encountered parsing consultClinicalObject for taskId: %s', taskId);
                                            return;
                                        }
                                        correspondingStub.name = _.get(consultClinicalObject, 'displayName') || null;

                                        var consultOrder = _.get(consultClinicalObject, 'data.consultOrders');
                                        if (Array.isArray(consultOrder) && consultOrder.length > 0) {
                                            consultOrder = consultOrder[consultOrder.length - 1]; //take last consultOrder if more than 1
                                        }

                                        var conditions = _.get(consultOrder, 'conditions');
                                        var conditionNames = [];
                                        if (Array.isArray(conditions)) {
                                            _.each(conditions, function(conditionObj) {
                                                conditionNames.push(_.get(conditionObj, 'name') || '');
                                            });
                                        } else {
                                            conditionNames.push(conditions || '');
                                        }
                                        correspondingStub.associatedCondition = conditionNames.length > 0 ? conditionNames.join() : null;

                                        correspondingStub.request = _.get(consultOrder, 'request') || null;
                                        correspondingStub.comment = _.get(consultOrder, 'comment') || null;

                                        correspondingStub.noteClinicalObjectUid = _.get(consultClinicalObject, 'data.completion.noteClinicalObjectUid') || null;
                                    });

                                    delete correspondingStub.taskId;
                                    finalRes.push(correspondingStub);
                                }

                            });
                        }
                    });
                }
                return consultTaskCb(null, finalRes);
            });
        } else {
            return consultTaskCb(null, []);
        }
    };

    var procParams = {
        p_patient_identifiers: identifiers,
        p_activity_states: activityStates,
        p_process_definition: processDefinitionId
    };

    var query = 'BEGIN TASKS.getTasksByState(:p_patient_identifiers, :p_activity_states, :p_process_definition, :recordset); END;';
    logger.debug({query: query, parameters: procParams}, 'consult-tasks-resource:doGetOpenConsultTasks executing stored procedure');

    activityDb.doExecuteProcWithParams({
        logger: logger
    }, dbConfig, query, procParams, cb);
}

function convertOracleDateToDisplay(dateInput) {
    //"2016-05-03T17:28:10.000Z" -> "20160503132810+0000"
    var output = moment(dateInput); //date inputs are UTC:ISO 8601
    return output.format('YYYYMMDDHHmmss+SSSS');
}

module.exports.getOpenConsultTasks = getOpenConsultTasks;
module.exports.doGetOpenConsultTasks = doGetOpenConsultTasks;
