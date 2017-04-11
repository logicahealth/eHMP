'use strict';

var rdk = require('../../../core/rdk');
var uriBuilder = rdk.utils.uriBuilder;
var httpUtil = rdk.utils.http;
var activityDb = require('../../../subsystems/jbpm/jbpm-subsystem');
var _ = require('lodash');
var getGenericJbpmConfig = require('../activity-utils').getGenericJbpmConfig;
var async = require('async');
var dd = require('drilldown');
var moment = require('moment');

function getOpenConsultTasks(req, res) {
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'GET_OPEN_CONSULT_TASKS';

    var icn = req.param('icn');
    var icnError;

    if (!icn) {
        icnError = new Error('Unable to retrieve \'icn\' parameter');
        req.logger.error(icnError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(icnError.message);
    }

    var consultTaskCb = function(err, results) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
        return res.rdkSend(results);
    };

    return doGetOpenConsultTasks(icn, req.logger, getGenericJbpmConfig(req), req.app.config.jbpm.activityDatabase, consultTaskCb);
}

function doGetOpenConsultTasks(icn, logger, jbpmConfig, dbConfig, consultTaskCb) {

    var taskName = 'Complete Consult';
    var queryParams = [taskName, icn];

    var taskQuery = 'SELECT ti.CREATEDON, pi.DEPLOYMENTID, ti.PROCESSINSTANCEID, ti.ID as TASKID FROM ACTIVITYDB.AM_TASKINSTANCE ti ' +
        'JOIN ACTIVITYDB.AM_PROCESSINSTANCE pi on ti.PROCESSINSTANCEID=pi.PROCESSINSTANCEID JOIN ACTIVITYDB.AM_TASKSTATUSLOOKUP tsl ON ti.STATUSID = tsl.ID ' +
        'WHERE ti.TASKNAME = :taskName AND ti.ICN = :icn AND tsl.STATUS in (\'Created\',\'Ready\',\'Reserved\',\'InProgress\')';
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

                                var taskId = dd(moreTaskItemDetail)('id').val || null;
                                var activityInstanceId = dd(moreTaskItemDetail)('processInstanceId').val || null;

                                var correspondingStub = _.filter(stubs, {
                                    'taskId': taskId,
                                    'activityInstanceId': activityInstanceId
                                });

                                if (taskId && activityInstanceId && correspondingStub && correspondingStub.length === 1) {
                                    correspondingStub = correspondingStub[0];

                                    _.each(_.filter(moreTaskItemDetail.variables, {
                                        'name': 'consultOrder'
                                    }), function(consultOrder) {
                                        try {
                                            consultOrder = JSON.parse(consultOrder.value);
                                        } catch (e) {
                                            logger.error('Invalid JSON encountered parsing consultOrder for taskId: %s', taskId);
                                            return;
                                        }
                                        correspondingStub.noteClinicalObjectUid = null;
                                        correspondingStub.name = dd(consultOrder)('specialty').val || null;
                                        correspondingStub.associatedCondition = dd(consultOrder)('condition').val || null;
                                        correspondingStub.request = dd(consultOrder)('requestQuestion').val || null;
                                        correspondingStub.comment = dd(consultOrder)('requestComment').val || null;

                                    });

                                    _.each(_.filter(moreTaskItemDetail.variables, {
                                        'name': 'consultClinicalObject'
                                    }), function(consultClinicalObject) {
                                        try {
                                            consultClinicalObject = JSON.parse(consultClinicalObject.value);
                                        } catch (e) {
                                            logger.error('Invalid JSON encountered parsing consultClinicalObject for taskId: %s', taskId);
                                            return;
                                        }
                                        correspondingStub.noteClinicalObjectUid = dd(consultClinicalObject)('data')('completion')('noteClinicalObjectUid').val || null;
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

    logger.debug('consult-tasks-resource:getOpenConsultTasks taskQuery %s', taskQuery);
    activityDb.doQueryWithParamsLogger(logger, dbConfig, taskQuery, queryParams, cb);
}

function convertOracleDateToDisplay(dateInput) {
    //"2016-05-03T17:28:10.000Z" -> "20160503132810+0000"
    var output = moment(dateInput); //date inputs are UTC:ISO 8601
    return output.format('YYYYMMDDHHmmss+SSSS');
}

module.exports.getOpenConsultTasks = getOpenConsultTasks;
module.exports.doGetOpenConsultTasks = doGetOpenConsultTasks;
