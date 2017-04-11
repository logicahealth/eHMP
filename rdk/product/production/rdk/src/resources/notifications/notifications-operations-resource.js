'use strict';

var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var moment = require('moment');
var _ = require('lodash');
var notificationsHelper = require('./notifications-helper');
var dataaccess = require('./notifications-data-access');

function getStaffNotificationsList(req, res) {
    buildQueryParameterObjectFromRequest(req, false, function(params) {
        dataaccess.getNotificationsByParams(req, params, function(err, result) {
            if (err) {
                return res.status(500).rdkSend(err.message);
            }

            return res.rdkSend(result);
        });
    });
}

function getStaffNotificationsIndicatorList(req, res) {
    var params = {
        resolutionState: 0,
        maxSalience: 4,
        userId: req.params.userId,
        groupRows: true,
        navigationRequired: true
    };
    dataaccess.getNotificationsByParams(req, params, function(err, result) {
        if (err) {
            return res.status(500).rdkSend(err.message);
        }

        return res.rdkSend(result);
    });

}

function getNotificationsGrowlerList(req, res) {
    var params = {
        resolutionState: 0,
        minSalience: 3,
        maxSalience: 3,
        userId: req.params.userId,
        groupRows: true,
        navigationRequired: true
    };
    dataaccess.getNotificationsByParams(req, params, function(err, result) {
        if (err) {
            return res.status(500).rdkSend(err.message);
        }

        return res.rdkSend(result);
    });
}

function getStaffNotificationsIndicatorSummary(req, res) {
    var params = {
        resolutionState: 0,
        maxSalience: 4,
        userId: req.params.userId,
        groupRows: true,
        navigationRequired: true,
        countNotifs: true
    };

    dataaccess.getNotificationsByParams(req, params, function(err, result) {
        if (err) {
            return res.status(500).rdkSend(err.message);
        }
        return res.rdkSend(result);
    });
}

function getPatientNotificationsList(req, res) {
    buildQueryParameterObjectFromRequest(req, true, function(params) {
        if (nullchecker.isNotNullish(params.error)) {
            return res.status(500).rdkSend(params.error);
        }
        dataaccess.getNotificationsByParams(req, params, function(err, result) {
            if (err) {
                return res.status(500).rdkSend(err.message);
            }

            return res.rdkSend(result);
        });
    });
}

function getNotificationsByRefId(req, res) {
    dataaccess.getNotificationsByRefId(req, function(err, result) {
        if (err) {
            return res.status(500).rdkSend(err.message);
        }

        return res.rdkSend(result);
    });
}

function postNotification(req, res) {
    dataaccess.addNotification(req, function(err, result) {
        if (err) {
            return res.status(500).rdkSend(err.message);
        }

        return res.rdkSend({
            'notificationid': result.outBinds.n_ntfid || null
        });
    });
}

function resolveNotificationById(req, res) {
    dataaccess.resolveNotificationById(req, function(err, result) {
        if (err) {
            return res.status(500).rdkSend(err.message);
        }
        return res.rdkSend();
    });
}

function resolveNotificationsByRefId(req, res) {
    dataaccess.resolveNotificationsByRefId(req, function(err, result) {
        if (err) {
            return res.status(500).rdkSend(err.message);
        }
        return res.rdkSend();
    });
}


function buildQueryParameterObjectFromRequest(req, isPatientQuery, callback) {
    var parameters = {};

    if (nullchecker.isNotNullish(req.params.userId) && !isPatientQuery) {
        parameters.userId = req.params.userId;
    } else if (nullchecker.isNotNullish(req.query.userId) && isPatientQuery) {
        parameters.userId = req.query.userId;
    }

    // default recipient filter to 'me'
    if (nullchecker.isNotNullish(parameters.userId)) {
        parameters.recipientFilter = parameters.userId;
    }

    if (nullchecker.isNotNullish(req.params.patientId) && isPatientQuery) {
        parameters.patientId = req.params.patientId;
    }

    // accepts (true/false)
    if (nullchecker.isNotNullish(req.query.resolutionState)) {
        parameters.resolutionState = req.query.resolutionState === 'true' ? 1 : 0;
    }

    // accepts (true/false)
    if (nullchecker.isNotNullish(req.query.readByUser)) {
        parameters.readByUser = req.query.readByUser === 'true' ? 1 : 0;
    }

    if (nullchecker.isNotNullish(req.query.dateRange)) {
        var dateRange = req.query.dateRange.replace(/[()]/g, '').split(',');
        var dates = _.map(dateRange, function(date) {
            return moment(date);
        });
        parameters.startDate = _.min(dates).startOf('day').format('YYYYDDMMHHmmSS');
        parameters.endDate = _.max(dates).endOf('day').format('YYYYDDMMHHmmSS');
    }

    if (nullchecker.isNotNullish(parameters.patientId)) {
        parameters.patientIds = parameters.patientId;
        notificationsHelper.getIdsArray(parameters.patientId, req, function(object) {
            if (nullchecker.isNotNullish(object.array) && object.array.length > 0) {
                parameters.patientIds = '' + object.array.join(',');
            }
            return callback(parameters);
        });
    } else {
        return callback(parameters);
    }

}


module.exports.getStaffNotificationsList = getStaffNotificationsList;
module.exports.getPatientNotificationsList = getPatientNotificationsList;
module.exports.getNotificationsGrowlerList = getNotificationsGrowlerList;
module.exports.postNotification = postNotification;
module.exports.resolveNotificationById = resolveNotificationById;
module.exports.resolveNotificationsByRefId = resolveNotificationsByRefId;
module.exports.getNotificationsByRefId = getNotificationsByRefId;
module.exports.getStaffNotificationsIndicatorList = getStaffNotificationsIndicatorList;
module.exports.getStaffNotificationsIndicatorSummary = getStaffNotificationsIndicatorSummary;
