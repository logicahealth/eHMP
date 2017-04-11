'use strict';

var oracledb = require('oracledb');
var rdk = require('../../core/rdk');
var _ = require('lodash');
var async = require('async');
var nullchecker = rdk.utils.nullchecker;
var dd = require('drilldown');
var notificationsHelper = require('./notifications-helper');
var tasksResource = require('../activitymanagement/tasks/task-operations-resource');

function doQuery(req, connection, query, bindParams, callback, maxRowsParam) {
    var options = {
        maxRows: maxRowsParam || 100,
        outFormat: oracledb.OBJECT
    };

    connection.execute(query, bindParams, options, function(err, result) {
        if (err) {
            doRelease(req, connection);
            return callback(err, null);
        }
        return callback(null, result.rows);
    });
}

function doCommit(req, connection) {
    connection.commit(function(err) {
        if (err) {
            if (req && req.logger) {
                req.logger.error(err.message);
            }
        }
    });
}

function doRelease(req, connection) {
    connection.release(function(err) {
        if (err) {
            if (req && req.logger) {
                req.logger.error(err.message);
            }
        }
    });
}

function doClose(req, connection, resultSet) {
    resultSet.close(
        function(err) {
            if (err) {
                if (req && req.logger) {
                    req.logger.error(err.message);
                }
            }
            doRelease(req, connection);
        });
}

function addRecipient(req, ntfid, recipient, connection, callback) {
    var dbConfig = req.app.config.jbpm.notifsDatabase;
    var rcp = {
        patientId: recipient.recipient.patientId || '',
        teamFoci: recipient.recipient.teamFoci || '',
        role: recipient.recipient.role || '',
        teamId: recipient.recipient.teamId || '',
        userId: recipient.recipient.userId || '',
        salience: recipient.salience || ''
    };
    var bindParams = {
        v_ntfid: '' + ntfid,
        v_user_id: '' + rcp.userId,
        v_team_id: '' + rcp.teamId,
        v_role: '' + rcp.role,
        v_patient_id: '' + rcp.patientId,
        v_team_foci: '' + rcp.teamFoci,
        v_salience: '' + rcp.salience
    };
    var query = 'BEGIN notifs_pkg.ADD_RECIPIENT(:v_ntfid,:v_user_id,:v_team_id,:v_role,:v_patient_id,:v_team_foci,:v_salience); END; ';
    var options = {
        maxRows: 100,
        outFormat: oracledb.OBJECT
    };
    connection.execute(query, bindParams, options, function(err, result) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result);
    });

}

function addAssociatedItem(req, ntfid, item, connection, callback) {
    var dbConfig = req.app.config.jbpm.notifsDatabase;
    var rcp = {
        item: item || '',
    };
    var bindParams = {
        v_ntfid: '' + ntfid,
        v_item: '' + rcp.item,
    };
    var query = 'BEGIN notifs_pkg.ADD_ASSOC_ITEM(:v_ntfid,:v_item); END; ';
    var options = {
        maxRows: 100,
        outFormat: oracledb.OBJECT
    };
    connection.execute(query, bindParams, options, function(err, result) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result);
    });

}

function addNotification(req, intialCallback) {
    var body = req.body;
    var notifDb = req.app.config.jbpm.notifsDatabase;

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
                                // call Get tasks enpoint to get task info by taskId
                                // copy navigation and permissions info from task to notification
                                var mockReq = {},
                                    mockRes = {
                                        status: function() {
                                            return {};
                                        },
                                        rdkSend: function(result) {
                                            if (dd(result)('data')('items').exists && dd(result)('data')('items').val.length > 0) {
                                                var task = dd(result)('data')('items').val[0];
                                                var params = {};
                                                if (nullchecker.isNotNullish(task.NAVIGATION)) {
                                                    _.extend(params, {
                                                        nav_channel: task.NAVIGATION.channel,
                                                        nav_event: task.NAVIGATION.event,
                                                        nav_parameter: JSON.stringify(task.NAVIGATION.parameters)
                                                    });
                                                }
                                                if (nullchecker.isNotNullish(task.PERMISSION)) {
                                                    _.extend(params, {
                                                        permissions: JSON.stringify(task.PERMISSION)
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
                                        }
                                    };
                                _.extend(mockReq, req);
                                mockReq.param = function() {
                                    return taskId;
                                };
                                tasksResource.queryTasksbyId(mockReq, mockRes);
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
            oracledb.getConnection({
                    user: notifDb.user,
                    password: notifDb.password,
                    connectString: notifDb.connectString
                },
                function(error, connection) {
                    if (error) {
                        return intialCallback(error, null);
                    }
                    var options = {
                        maxRows: 100,
                        outFormat: oracledb.OBJECT
                    };
                    connection.execute(addNotif.query, addNotif.bindParams, options, function(err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        async.parallel([

                            function(callbackParallel) {
                                async.eachSeries(recipients, function(recipient, callbackEach) {
                                    addRecipient(req, result.outBinds.n_ntfid, recipient, connection, function(err, result) {
                                        callbackEach();
                                    });
                                }, function done() {
                                    callbackParallel();
                                });
                            },
                            function(callbackParallel) {
                                if (body.associatedItems && body.associatedItems.length > 0) {
                                    async.eachSeries(body.associatedItems, function(item, callbackEach) {
                                        addAssociatedItem(req, result.outBinds.n_ntfid, item, connection, function(err, result) {
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
                            doCommit(req, connection);
                            doRelease(req, connection);
                            callback(null, result);
                        });
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

function beginCondition(conditions) {
    if (nullchecker.isNotNullish(conditions)) {
        conditions = ' AND ';
    }
    return conditions;
}

function buildRouteNotifQuery(req, recipient) {
    var query;
    var site = req.session.user.site;
    var stationNumber = dd(req)('app')('config')('vistaSites')(site)('division').val;

    if (nullchecker.isNotNullish(recipient.teamId) || nullchecker.isNotNullish(recipient.role) ||
        nullchecker.isNotNullish(recipient.teamFoci) || nullchecker.isNotNullish(recipient.patientId)) {

        var defaultParams = {
            p_role: recipient.role || null,
            p_st_number: stationNumber || null,
            ntf_recordset: {
                type: oracledb.CURSOR,
                dir: oracledb.BIND_OUT
            }
        };
        if (nullchecker.isNotNullish(recipient.teamId)) {
            return {
                bindParams: _.extend({
                    p_team_id: recipient.teamId || null,
                    p_team_foci: null,
                    p_icn: null
                }, defaultParams),
                query: 'BEGIN notifs_pkg.GET_NOTIF_ROUTE(:p_team_id,:p_team_foci,:p_icn,:p_role,:p_st_number,:ntf_recordset); END;'
            };
        } else {
            return {
                bindParams: _.extend({
                    p_team_id: null,
                    p_team_foci: recipient.teamFoci || null,
                    p_icn: recipient.patientId || null
                }, defaultParams),
                query: 'BEGIN notifs_pkg.GET_NOTIF_ROUTE(:p_team_id,:p_team_foci,:p_icn,:p_role,:p_st_number,:ntf_recordset); END;'
            };
        }
    }
}

function routeNotification(req, recipientToQueryMap, callback) {
    var notifDb = req.app.config.jbpm.notifsDatabase;
    var asyncJobs = [];
    var NUM_ROWS = 100;
    oracledb.getConnection({
            user: notifDb.user,
            password: notifDb.password,
            connectString: notifDb.connectString
        },
        function(error, connection) {
            if (error) {
                return callback(error, null);
            }
            _.each(recipientToQueryMap, function(map) {
                asyncJobs.push(function(callback) {
                    var options = {
                        maxRows: 100,
                        outFormat: oracledb.OBJECT
                    };

                    connection.execute(map.query, map.bindParams, options, function(err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        var recipients = [];
                        var resultSet = result.outBinds.ntf_recordset;
                        var rows;
                        fetchRows(req, connection, resultSet, NUM_ROWS, rows, function(data) {
                            _.each(data, function(row) {
                                recipients.push({
                                    recipient: _.extend({}, map.recipient, {
                                        userId: row.ien
                                    }),
                                    salience: map.salience
                                });
                            });
                            return callback(null, recipients);
                        });
                    });
                });
            });
            async.parallelLimit(asyncJobs, 5, function(err, results) {
                doRelease(req, connection);
                if (err) {
                    callback(err, null);
                } else {
                    var newMap = [];
                    var recipients = _.union(_.flatten(results), req.body.recipients);
                    _.each(recipients, function(recipient) {
                        if (nullchecker.isNotNullish(recipient.recipient.userId)) {
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
                    callback(null, newMap);
                }
            });
        });
}

function resolveNotificationById(req, callback) {
    var dbConfig = req.app.config.jbpm.notifsDatabase;

    var resolveNotif = {
        bindParams: {
            p_ntf_id: req.params.notificationId || null,
            p_user_id: req.body.userId || null
        },
        query: 'BEGIN notifs_pkg.RESOLVE_NOTIF_BY_ID(:p_ntf_id,:p_user_id); END;'
    };


    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function(error, connection) {
            if (error) {
                return callback(error, null);
            }
            var options = {
                maxRows: 100,
                outFormat: oracledb.OBJECT
            };
            connection.execute(resolveNotif.query, resolveNotif.bindParams, options, function(err, result) {
                if (err) {
                    return callback(err, null);
                }
                doCommit(req, connection);
                doRelease(req, connection);
                return callback(null, result);
            });
        }
    );
}

function resolveNotificationsByRefId(req, callback) {
    var params = req.params;
    var dbConfig = req.app.config.jbpm.notifsDatabase;

    var resolveNotif = {
        bindParams: {
            p_ref_id: req.params.referenceId || null,
            p_user_id: req.body.userId || null
        },
        query: 'BEGIN notifs_pkg.RESOLVE_NOTIFS_BY_REF_ID(:p_ref_id,:p_user_id); END;'
    };

    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function(error, connection) {
            if (error) {
                return callback(error, null);
            }
            var options = {
                maxRows: 100,
                outFormat: oracledb.OBJECT
            };
            connection.execute(resolveNotif.query, resolveNotif.bindParams, options, function(err, result) {
                if (err) {
                    return callback(err, null);
                }
                doCommit(req, connection);
                doRelease(req, connection);
                return callback(null, result);
            });
        }
    );
}

function getNotificationsCounterByParams(req, params, callback) {
    var dbConfig = req.app.config.jbpm.notifsDatabase;
    var numRows = 10;
    var getNotifsCounter = {
        bindParams: {
            p_user_id: params.userId || null,
            p_patient_ids: params.patientIds || null,
            p_recipient_filter: params.recipientFilter || null,
            p_resolution_state: nullchecker.isNotNullish(params.resolutionState) ? params.resolutionState : null,
            p_read_by_user: nullchecker.isNotNullish(params.readByUser) ? params.readByUser : null,
            p_min_salience: params.minSalience || null,
            p_max_salience: params.maxSalience || null,
            p_start_date: params.startDate || null,
            p_end_date: params.endDate || null,
            ntf_recordset: {
                type: oracledb.CURSOR,
                dir: oracledb.BIND_OUT
            }
        },
        query: 'BEGIN notifs_pkg.GET_NOTIFS_BY_PARAMS(:p_user_id,:p_patient_ids,:p_recipient_filter,:p_resolution_state,:p_read_by_user,:p_min_salience,:p_max_salience,:p_start_date,:p_end_date,:ntf_recordset); END;'
    };

    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function(error, connection) {
            if (error) {
                return callback(error, null);
            }
            var options = {
                maxRows: 100,
                outFormat: oracledb.OBJECT
            };
            connection.execute(getNotifsCounter.query, getNotifsCounter.bindParams, options, function(err, result) {
                if (err) {
                    doRelease(req, connection);
                    return callback(err, null);
                }
                var data = [];
                fetchRowsFromRS(req, connection, params, result.outBinds.ntf_recordset, numRows, data, callback);
            });
        });
}

function getNotificationsByParams(req, params, callback) {
    var dbConfig = req.app.config.jbpm.notifsDatabase;
    var numRows = 10;
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
            p_end_date: params.endDate || null,
            ntf_recordset: {
                type: oracledb.CURSOR,
                dir: oracledb.BIND_OUT
            }
        },
        query: 'BEGIN notifs_pkg.GET_NOTIFS_BY_PARAMS(:p_user_id,:p_patient_ids,:p_recipient_filter,:p_resolution_state,:p_read_by_user,:p_min_salience,:p_max_salience,:p_start_date,:p_end_date,:ntf_recordset); END;'
    };

    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function(error, connection) {
            if (error) {
                return callback(error, null);
            }
            var options = {
                maxRows: 100,
                outFormat: oracledb.OBJECT
            };
            connection.execute(getNotifs.query, getNotifs.bindParams, options, function(err, result) {
                if (err) {
                    doRelease(req, connection);
                    return callback(err, null);
                }
                var data = [];
                fetchRowsFromRS(req, connection, params, result.outBinds.ntf_recordset, numRows, data, callback);
            });
        });
}

function getNotificationsByRefId(req, callback) {
    var params = req.params;
    var numRows = 10;
    var dbConfig = req.app.config.jbpm.notifsDatabase;

    var getNotifs = {
        bindParams: {
            p_ref_id: params.referenceId || null,
            ntf_recordset: {
                type: oracledb.CURSOR,
                dir: oracledb.BIND_OUT
            }
        },
        query: 'BEGIN notifs_pkg.GET_NOTIFS_BY_REF_ID(:p_ref_id,:ntf_recordset); END;'
    };

    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function(error, connection) {
            if (error) {
                return callback(error, null);
            }
            var options = {
                maxRows: 100,
                outFormat: oracledb.OBJECT
            };
            connection.execute(getNotifs.query, getNotifs.bindParams, options, function(err, result) {
                if (err) {
                    doRelease(req, connection);
                    return callback(err, null);
                }
                var data = [];
                fetchRowsFromRS(req, connection, params, result.outBinds.ntf_recordset, numRows, data, callback);
            });
        }
    );
}

function fetchRows(req, connection, resultSet, numRows, data, callback) {
    resultSet.getRows(
        numRows,
        function(err, rows) {
            if (err) {
                doClose(req, connection, resultSet);
                return callback(err, null);
            } else if (rows.length > 0) {
                //process rows
                data = _.union(data, rows);
                if (rows.length === numRows) { //might be more rows
                    fetchRows(req, connection, resultSet, numRows, data, callback);
                } else { //fewer rows so close and callback
                    doClose(req, connection, resultSet);
                    callback(data);
                }
            } else {
                doClose(req, connection, resultSet);
                callback(data);
            }
        }
    );
}

function fetchRowsFromRS(req, connection, params, resultSet, numRows, data, callback) {
    resultSet.getRows(
        numRows,
        function(err, rows) {
            if (err) {
                doClose(req, connection, resultSet);
                return callback(err, data);
            } else if (rows.length === 0) {
                // no more rows to return
                doClose(req, connection, resultSet);
                if (data.length > 0) {
                    processNotifications(req, params, data, callback);
                } else {
                    return callback(err, data);
                }
            } else if (rows.length > 0) {
                // fetch next numRows rows
                data = _.union(data, rows);
                fetchRowsFromRS(req, connection, params, resultSet, numRows, data, callback);
            }
        });
}

function processNotifications(req, params, notifications, originalCallback) {
    var dbConfig = req.app.config.jbpm.notifsDatabase;
    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function(error, connection) {
            if (error) {
                return originalCallback(error, null);
            }
            async.each(notifications, function(notif, eachCallback) {
                if (nullchecker.isNotNullish(notif.notificationId)) {
                    async.parallel({
                            recipients: function(callback) {
                                doQuery(req, connection, 'SELECT * FROM TABLE(notifs_pkg.GET_RECIPIENTS_BY_NOTIF(:p_ntf_id))', {
                                    p_ntf_id: notif.notificationId
                                }, callback);
                            },
                            associatedItems: function(callback) {
                                doQuery(req, connection, 'SELECT * FROM TABLE(notifs_pkg.GET_ASSOC_ITEMS_BY_NOTIF(:p_ntf_id))', {
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
                } else {
                    return originalCallback({
                        status: 500,
                        message: 'Invalid notification'
                    }, null);
                }
            }, function(err) {
                doRelease(req, connection);
                if (err) {
                    return originalCallback(err, null);
                } else {
                    if (params.navigationRequired === true) {
                        notifications = _.filter(notifications, function(notification) {
                            return (hasNavigation(notification) && hasPermission(req, notification));
                        });
                    }
                    if (params.groupRows === true) {
                        getPatientNames(req, groupNotificationsByTask(notifications), originalCallback);
                    } else {
                        getPatientNames(req, notifications, originalCallback);
                    }
                }
            });
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
module.exports.getNotificationsCounterByParams = getNotificationsCounterByParams;
