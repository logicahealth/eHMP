'use strict';

var oracledb = require('oracledb');
var rdk = require('../../core/rdk');
var _ = require('lodash');
var async = require('async');
var nullchecker = rdk.utils.nullchecker;
var notificationsHelper = require('./notifications-helper');
var navMapping = require('../activitymanagement/tasks/navigation-mapping');
var dbAccess = require('../../subsystems/jbpm/jbpm-subsystem');
var authUtils = rdk.utils.authentication;

var DO_AUTO_COMMIT = true;

function addRecipient(req, ntfid, recipient, callback) {

    var rcp = {
        userId: recipient.recipient.userId || '',
        teamId: recipient.recipient.teamId || '',
        teamType: recipient.recipient.teamType || '',
        teamFocus: recipient.recipient.teamFocus || '',
        teamRole: recipient.recipient.teamRole || '',
        patientId: recipient.recipient.patientId || '',
        patientAssignment: recipient.recipient.patientAssignment || 0,
        facility: recipient.recipient.facility || '',
        salience: recipient.salience || ''
    };

    var addRecip = {
        bindParams: {
            v_ntfid: '' + ntfid,
            v_user_id: '' + rcp.userId,
            v_team_id: '' + rcp.teamId,
            v_team_type: '' + rcp.teamType,
            v_team_focus: '' + rcp.teamFocus,
            v_team_role: '' + rcp.teamRole,
            v_patient_id: '' + rcp.patientId,
            v_patient_assignment: rcp.patientAssignment,
            v_facility: '' + rcp.facility,
            v_salience: '' + rcp.salience
        },
        query: 'BEGIN notifs_pkg.ADD_RECIPIENT(:v_ntfid,:v_user_id,:v_team_id,:v_team_type,:v_team_focus,:v_team_role,:v_patient_id,:v_patient_assignment,:v_facility,:v_salience); END; '
    };

    dbAccess.doExecuteProcWithInOutParams(req, req.app.config.jbpm.notifsDatabase, addRecip.query, addRecip.bindParams, DO_AUTO_COMMIT, callback);
}

function addAssociatedItem(req, ntfid, item, callback) {

    var rcp = {
        item: item || '',
    };
    var addItem = {
        bindParams: {
            v_ntfid: '' + ntfid,
            v_item: '' + rcp.item
        },

        query: 'BEGIN notifs_pkg.ADD_ASSOC_ITEM(:v_ntfid,:v_item); END; '
    };

    dbAccess.doExecuteProcWithInOutParams(req, req.app.config.jbpm.notifsDatabase, addItem.query, addItem.bindParams, DO_AUTO_COMMIT, callback);
}

function addNotification(req, intialCallback) {
    var body = req.body;

    var addNotif = {
        bindParams: {
            prd_user_id: body.producer.userId || '',
            prd_desc: body.producer.description || '',
            ntf_patient_id: body.patientId || '',
            ntf_message_subject: body.message.subject || '',
            ntf_message_body: body.message.body || '',
            ntf_resolution: body.resolution || 'producer',
            ntf_resolutionstate: body.resolutionState === true ? 1 : 0,
            ntf_expiration: body.expiration || '', //format: 'yyyy-mm-dd',
            ntf_ext_refid: body.referenceId || '',
            nav_channel: (body.navigation && body.navigation.channel) ? body.navigation.channel : '',
            nav_event: (body.navigation && body.navigation.event) ? body.navigation.event : '',
            nav_parameter: (body.navigation && body.navigation.parameter) ? body.navigation.parameter : '',
            permissions: '',
            n_ntfid: {
                type: oracledb.STRING,
                dir: oracledb.BIND_OUT
            }
        },
        query: 'BEGIN notifs_pkg.ADD_NOTIFICATION(:prd_user_id,:prd_desc,:ntf_patient_id,:ntf_message_subject,:ntf_message_body,:ntf_resolution,:ntf_resolutionstate,:ntf_expiration,:ntf_ext_refid,:nav_channel,:nav_event,:nav_parameter,:permissions,:n_ntfid); END;'
    };
    var recipients = body.recipients;

    async.waterfall([
        function(callback) {

            async.parallel([
                    function(cb) {
                        // check for associated item matching 'ehmp:task:taskID'
                        if (nullchecker.isNotNullish(body.associatedItems)) {
                            var item = _.find(body.associatedItems, function(itm) {
                                return (itm.indexOf('ehmp:task:') === 0);
                            });
                            if (!_.isUndefined(item) && !isNaN(parseInt(item.substring(('ehmp:task:').length)))) {
                                var taskId = item.substring(('ehmp:task:').length);
                                var getTask = {
                                    bindParams: {
                                        p_task_definition_id: null,
                                        p_task_instance_id: taskId,
                                        p_patient_identifiers: null,
                                        p_task_statuses: null
                                    },
                                    query: 'BEGIN TASKS.getTasksByIds(:p_task_definition_id, :p_task_instance_id, :p_patient_identifiers, :p_task_statuses, :recordset); END;'

                                };

                                // Get task by ID and copy NAVIGATION & PERMISSION into notification
                                dbAccess.doExecuteProcWithParams(req, req.app.config.jbpm.activityDatabase, getTask.query, getTask.bindParams, function(err, results) {
                                    if (results.length > 0) {
                                        var task = results[0];
                                        var params = {};
                                        if (_.has(task, 'NAVIGATION') && nullchecker.isNotNullish(task.NAVIGATION)) {
                                            try {
                                                task.NAVIGATION = JSON.parse(task.NAVIGATION);

                                                if (_.isObject(task.NAVIGATION)) {
                                                    if (_.has(task.NAVIGATION, 'channel') && _.has(task.NAVIGATION, 'event')) {
                                                        task.NAVIGATION.parameters = navMapping.getParameters(task);

                                                        _.extend(params, {
                                                            nav_channel: task.NAVIGATION.channel,
                                                            nav_event: task.NAVIGATION.event,
                                                            nav_parameter: JSON.stringify(task.NAVIGATION.parameters)
                                                        });
                                                    }
                                                }
                                            } catch (e) {
                                                req.logger.error('Unable to parse task navigation data from task: ' + task);
                                            }
                                        }
                                        if (_.has(task, 'PERMISSION') && nullchecker.isNotNullish(task.PERMISSION)) {
                                            _.extend(params, {
                                                permissions: task.PERMISSION
                                            });
                                        }
                                        _.extend(addNotif.bindParams, params);
                                        cb(null, addNotif);
                                    } else {
                                        cb({
                                            status: rdk.httpstatus.not_found,
                                            message: 'Task not found for taskId: ' + taskId
                                        }, null);
                                    }
                                });
                            } else {
                                cb(null, {});
                            }
                        } else {
                            cb(null, {});
                        }
                    },
                    function(cb) {
                        // check recipients to allow notification routing if needed
                        var recipientToQueryMap = [];
                        _.each(recipients, function(map) {
                            if (nullchecker.isNotNullish(map.recipient) && nullchecker.isNullish(map.recipient.userId)) {
                                var query = buildRouteNotifQuery(req, map.recipient);
                                if (nullchecker.isNotNullish(query)) {
                                    recipientToQueryMap.push({
                                        recipient: map.recipient,
                                        salience: map.salience,
                                        query: query.query,
                                        bindParams: query.bindParams
                                    });
                                }
                            }
                        });
                        if (recipientToQueryMap.length > 0) {
                            routeNotification(req, recipientToQueryMap, cb);
                        } else {
                            cb(null, recipients);
                        }
                    },
                ],
                function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, results[1]);
                });
        },
        function(recipients, callback) {

            dbAccess.doExecuteProcWithInOutParams(req, req.app.config.jbpm.notifsDatabase, addNotif.query, addNotif.bindParams, DO_AUTO_COMMIT, function(err, result) {
                if (err) {
                    return callback(err, null);
                }
                async.parallel([
                    function(callbackParallel) {
                        async.eachSeries(recipients, function(recipient, callbackEach) {
                            addRecipient(req, result.outBinds.n_ntfid, recipient, function(err, result) {
                                callbackEach();
                            });
                        }, function done() {
                            callbackParallel();
                        });
                    },
                    function(callbackParallel) {
                        if (body.associatedItems && body.associatedItems.length > 0) {
                            async.eachSeries(body.associatedItems, function(item, callbackEach) {
                                addAssociatedItem(req, result.outBinds.n_ntfid, item, function(err, result) {
                                    callbackEach();
                                });
                            }, function done() {
                                callbackParallel();
                            });
                        } else {
                            callbackParallel();
                        }
                    }
                ], function done(err, results) {
                    callback(err, result);
                });
            });
        }
    ], function(err, result) {
        if (err) {
            return intialCallback(err, null);
        }
        return intialCallback(null, result);
    });
}

function buildRouteNotifQuery(req, recipient) {
    var divisions = authUtils.getSiteDivisions(_.get(req, 'app.config.vistaSites')).join(',');

    var defaultParams = {
        p_team_role: recipient.teamRole || null,
        p_facility: recipient.facility || divisions
    };
    if (nullchecker.isNotNullish(recipient.teamId)) {
        return {
            bindParams: _.extend({
                p_team_id: recipient.teamId || null,
                p_team_type: null,
                p_team_focus: null,
                p_patient_id: null,
                p_patient_assignment: 0
            }, defaultParams),
            query: 'BEGIN notifs_pkg.GET_NOTIF_ROUTE(:p_team_id,:p_team_focus,:p_team_type,:p_team_role,:p_patient_id,:p_patient_assignment,:p_facility,:recordset); END;'
        };
    } else {
        return {
            bindParams: _.extend({
                p_team_id: null,
                p_team_type: recipient.teamType || null,
                p_team_focus: recipient.teamFocus || null,
                p_patient_id: recipient.patientId || null,
                p_patient_assignment: recipient.patientAssignment || 0
            }, defaultParams),
            query: 'BEGIN notifs_pkg.GET_NOTIF_ROUTE(:p_team_id,:p_team_focus,:p_team_type,:p_team_role,:p_patient_id,:p_patient_assignment,:p_facility,:recordset); END;'
        };
    }
}

function routeNotification(req, recipientToQueryMap, callback) {
    var asyncJobs = [];

    var newMap = _.filter(req.body.recipients, function(item) {
        return nullchecker.isNotNullish(_.get(item, 'recipient.userId'));
    });

    _.each(recipientToQueryMap, function(map) {
        asyncJobs.push(function(callback) {
            dbAccess.doExecuteProcWithParams(req, req.app.config.jbpm.notifsDatabase, map.query, map.bindParams, function(err, data) {
                if (err) {
                    callback(err, null);
                }
                _.each(data, function(row) {
                    if (nullchecker.isNotNullish(row.userId)) {
                        // Find facility hash
                        var site = authUtils.getSiteCode(_.get(req, 'app.config.vistaSites'), row.division);
                        // Build recipient object
                        var recipient = {
                            recipient: _.extend({}, map.recipient, {
                                userId: _.trimLeft((site + ';' + row.userId), ';')
                            }),
                            salience: map.salience
                        };
                        // Check for duplicate recipients (by userId) & keep the one with lowest value for salience
                        var found = newMap.map(function(map) {
                            return map.recipient.userId;
                        }).indexOf(recipient.recipient.userId);
                        if (found !== -1) {
                            if (recipient.salience < newMap[found].salience) {
                                newMap[found] = recipient;
                            }
                        } else {
                            newMap.push(recipient);
                        }
                    }
                });
                return callback(null, newMap);
            });
        });
    });

    async.parallelLimit(asyncJobs, 5, function(err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, _.flatten(results));
        }
    });

}

function resolveNotificationById(req, callback) {

    var resolveNotif = {
        bindParams: {
            p_ntf_id: req.params.notificationId || null,
            p_user_id: req.body.userId || null
        },
        query: 'BEGIN notifs_pkg.RESOLVE_NOTIF_BY_ID(:p_ntf_id,:p_user_id); END;'
    };

    dbAccess.doExecuteProcWithInOutParams(req, req.app.config.jbpm.notifsDatabase, resolveNotif.query, resolveNotif.bindParams, DO_AUTO_COMMIT, callback);
}

function resolveNotificationsByRefId(req, callback) {

    var resolveNotif = {
        bindParams: {
            p_ref_id: req.params.referenceId || null,
            p_user_id: req.body.userId || null
        },
        query: 'BEGIN notifs_pkg.RESOLVE_NOTIFS_BY_REF_ID(:p_ref_id,:p_user_id); END;'
    };

    dbAccess.doExecuteProcWithInOutParams(req, req.app.config.jbpm.notifsDatabase, resolveNotif.query, resolveNotif.bindParams, DO_AUTO_COMMIT, callback);
}

function getNotificationsByParams(req, params, callback) {

    var getNotifs = {
        bindParams: {
            p_user_id: params.userId || null,
            p_patient_ids: params.patientIds || null,
            p_recipient_filter: params.recipientFilter || null,
            p_resolution_state: nullchecker.isNotNullish(params.resolutionState) ? params.resolutionState : null,
            p_read_by_user: nullchecker.isNotNullish(params.readByUser) ? params.readByUser : null,
            p_min_salience: params.minSalience || null,
            p_max_salience: params.maxSalience || null,
            p_start_date: params.startDate || null,
            p_end_date: params.endDate || null
        },
        query: 'BEGIN notifs_pkg.GET_NOTIFS_BY_PARAMS(:p_user_id,:p_patient_ids,:p_recipient_filter,:p_resolution_state,:p_read_by_user,:p_min_salience,:p_max_salience,:p_start_date,:p_end_date,:recordset); END;'
    };

    dbAccess.doExecuteProcWithParams(req, req.app.config.jbpm.notifsDatabase, getNotifs.query, getNotifs.bindParams, function(err, results) {
        if (err) {
            return callback(err, null);
        }
        processNotifications(req, params, results, callback);
    });
}

function getNotificationsByRefId(req, callback) {
    var params = req.params;

    var getNotifs = {
        bindParams: {
            p_ref_id: params.referenceId || null
        },
        query: 'BEGIN notifs_pkg.GET_NOTIFS_BY_REF_ID(:p_ref_id,:recordset); END;'
    };

    dbAccess.doExecuteProcWithParams(req, req.app.config.jbpm.notifsDatabase, getNotifs.query, getNotifs.bindParams, function(err, results) {
        if (err) {
            return callback(err, null);
        }
        processNotifications(req, params, results, callback);
    });
}

function processNotifications(req, params, notifications, originalCallback) {

    async.each(notifications, function(notif, eachCallback) {
        if (nullchecker.isNullish(notif.notificationId)) {
            return originalCallback({
                status: 500,
                message: 'Invalid notification'
            }, null);
        }
        async.parallel({
                recipients: function(callback) {
                    dbAccess.doQueryWithParams(req, req.app.config.jbpm.notifsDatabase, 'SELECT * FROM TABLE(notifs_pkg.GET_RECIPIENTS_BY_NOTIF(:p_ntf_id))', {
                        p_ntf_id: notif.notificationId
                    }, callback);
                },
                associatedItems: function(callback) {
                    dbAccess.doQueryWithParams(req, req.app.config.jbpm.notifsDatabase, 'SELECT * FROM TABLE(notifs_pkg.GET_ASSOC_ITEMS_BY_NOTIF(:p_ntf_id))', {
                        p_ntf_id: notif.notificationId
                    }, callback);
                }
            },
            function(err, results) {
                if (err) {
                    return eachCallback(err);
                }

                updateNotificationFields(req, params, results, notif);

                return eachCallback();
            });
    }, function(err) {
        if (err) {
            return originalCallback(err, null);
        }
        // Filter out notifications without navigation info or permissions for the current user
        if (params.navigationRequired === true) {
            notifications = _.filter(notifications, function(notification) {
                return (hasNavigation(notification) && hasPermission(req, notification));
            });
        }

        // Filter out notifications with duplicate taskID (associated item) - keep only the newest ones
        if (params.groupRows === true) {
            notifications = groupNotificationsByTask(notifications);
        }

        // If only a counter is needed, return without further processing
        if (params.countNotifs === true) {
            var response = {
                count: notifications.length
            };
            return originalCallback(null, response);
        }

        getPatientNames(req, notifications, originalCallback);
    });

}

function groupNotificationsByTask(notifications) {
    var modifiedNotifications = [];
    var groupedNotifications = _.groupBy(notifications, 'taskId');
    _.each(groupedNotifications, function(group) {
        if (group[0].taskId === undefined) {
            modifiedNotifications = modifiedNotifications.concat(group);
        } else {
            modifiedNotifications.push(_.max(group, function(item) {
                return item.createdOn;
            }));
        }
    });
    _.each(modifiedNotifications, function(item) {
        delete item.taskId;
    });
    return modifiedNotifications;
}

function hasNavigation(notification) {
    var navigation = notification.navigation;
    if (nullchecker.isNotNullish(navigation)) {
        // keep notification if navigation channel and event are not nullish
        if (nullchecker.isNotNullish(navigation.channel) && nullchecker.isNotNullish(navigation.event)) {
            return true;
        }
    }
    return false;
}

function hasPermission(req, notification) {
    var permissions = notification.permissions;
    if (nullchecker.isNullish(permissions)) {
        return true;
    }
    if (_.isEmpty(permissions.ehmp) && _.isEmpty(permissions.user)) {
        return true;
    }
    var user = req.session.user;
    var userPermissions = user.permissions;
    var userId = user.duz[user.site];
    if (_.intersection(userPermissions, permissions.ehmp).length > 0) {
        if (_.isEmpty(permissions.user) || _.contains(permissions.user, userId)) {
            return true;
        }
    }
    if (_.contains(permissions.user, userId)) {
        if (_.isEmpty(permissions.ehmp)) {
            return true;
        }
    }
    return false;
}

function updateNotificationFields(req, params, results, notification) {
    notification.producer = {
        userId: notification.producerId,
        description: notification.producerDescription
    };
    delete notification.producerId;
    delete notification.producerDescription;
    notification.resolutionState = (notification.resolutionState === 1) ? true : false;

    notification.message = {
        subject: notification.messageSubject,
        body: notification.messageBody
    };
    delete notification.messageBody;
    delete notification.messageSubject;

    try {
        notification.navParameter = JSON.parse(notification.navParameter);
    } catch (e) {
        req.logger.error('Unable to parse navigation parameter data from notification: ' + notification);
    }

    notification.navigation = {
        channel: notification.navChannel,
        event: notification.navEvent,
        parameter: notification.navParameter
    };
    delete notification.navChannel;
    delete notification.navEvent;
    delete notification.navParameter;

    if (results.associatedItems && results.associatedItems.length > 0) {
        notification.associatedItems = _.pluck(results.associatedItems, 'item');
        _.each(notification.associatedItems, function(item) {
            if (item.indexOf('ehmp:task:') === 0) {
                notification.taskId = item;
            }
        });
    } else {
        notification.associatedItems = [];
    }
    if (results.recipients && results.recipients.length > 0) {
        notification.recipients = results.recipients;
    } else {
        notification.recipients = [];
    }

    try {
        notification.permissions = JSON.parse(notification.permissions);
    } catch (e) {
        req.logger.error('Unable to parse notification permissions data from notification: ' + notification);
    }
}

function getPatientNames(req, notifications, callback) {
    var pidToNameMap = [];
    _.each(notifications, function(row) {
        if (row.hasOwnProperty('patientId')) {
            if (!_.any(pidToNameMap, 'patientId', row.patientId)) {
                pidToNameMap.push({
                    'patientId': row.patientId,
                    'patientName': null,
                    'last4OfSSN': null
                });
            }
        }
    });

    notificationsHelper.getNamesFromPids(pidToNameMap, req, function(resultedMap) {
        _.each(notifications, function(row) {
            if (row.hasOwnProperty('patientId')) {
                var name = _.pluck(_.where(resultedMap, {
                    'patientId': row.patientId
                }), 'patientName', 'last4OfSSN');

                var last4OfSSN = _.pluck(_.where(resultedMap, {
                    'patientId': row.patientId
                }), 'last4OfSSN');

                if (Array.isArray(name) && name.length > 0) {
                    row.patientName = name[0];
                } else {
                    row.patientName = null;
                }
                if (Array.isArray(last4OfSSN) && last4OfSSN.length > 0) {
                    row.last4OfSSN = last4OfSSN[0];
                } else {
                    row.last4OfSSN = null;
                }
            }
        });
        return callback(null, notifications);
    });
}

module.exports.addNotification = addNotification;
module.exports.getNotificationsByParams = getNotificationsByParams;
module.exports.getNotificationsByRefId = getNotificationsByRefId;
module.exports.resolveNotificationById = resolveNotificationById;
module.exports.resolveNotificationsByRefId = resolveNotificationsByRefId;
