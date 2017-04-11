'use strict';

var _ = require('lodash');

module.exports.editLab = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (_.isEmpty(writebackContext.resourceId)) {
            error = 'Missing Resource ID';
        }
    } else {
        error = 'Invalid edit request';
    }
    return setImmediate(callback, error);
};

module.exports.detailLab = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (_.isEmpty(writebackContext.resourceId)) {
            error = 'Missing Resource ID';
        }
        if (_.isEmpty(writebackContext.siteParam)) {
            error = 'Missing site parameter';
        }
    } else {
        error = 'Invalid detail request';
    }
    return setImmediate(callback, error);
};

module.exports.discontinueDetailsLab = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (_.isEmpty(writebackContext.interceptorResults.patientIdentifiers.dfn)) {
            error = 'Missing dfn';
        }
        if (_.isEmpty(writebackContext.model.provider)) {
            error = 'Missing provider';
        }
        if (_.isEmpty(writebackContext.model.orderIds) || writebackContext.model.orderIds.length < 1) {
            error = 'Missing Order ID(s)';
        }
    } else {
        error = 'Invalid discontinue details request';
    }
    return setImmediate(callback, error);
};

module.exports.signDetailsLab = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (_.isEmpty(writebackContext.interceptorResults.patientIdentifiers.dfn)) {
            error = 'Missing dfn';
        }
        if (_.isEmpty(writebackContext.model.provider)) {
            error = 'Missing provider';
        }
        if (_.isEmpty(writebackContext.model.orderIds) || writebackContext.model.orderIds.length < 1) {
            error = 'Missing Order ID(s)';
        }
    } else {
        error = 'Invalid sign details request';
    }
    return setImmediate(callback, error);
};

module.exports.signOrdersLab = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (_.isEmpty(writebackContext.interceptorResults.patientIdentifiers.dfn)) {
            error = 'Missing dfn';
        }
        if (_.isEmpty(writebackContext.model.provider)) {
            error = 'Missing provider';
        }
        if (_.isEmpty(writebackContext.model.location)) {
            error = 'Missing location For Sing Order Lab';
        }
        if (!writebackContext.model.orderList || writebackContext.model.orderList.length < 1) {
            error = 'Missing Order List';
        } else {
            for (var i = 0; i < writebackContext.model.orderList.length; i++) {
                var orderData = writebackContext.model.orderList[i];
                if (!orderData.orderId) {
                    error = 'Missing orderId in Order List at index ' + i;
                } else if (!orderData.orderDetailHash) {
                    error = 'Missing orderDetailHash in Order List at index ' + i;
                }
            }
        }

        if (!_.isEmpty(writebackContext.model.orderCheckList)) {
            if (writebackContext.model.orderCheckList.length > 0) {
                for (var j = 0; j < writebackContext.model.orderCheckList.length; j++) {
                    var orderCheck = writebackContext.model.orderCheckList[j];

                    if (_.isEmpty(orderCheck.orderCheck)) {
                        error = 'Missing orderCheck in Order Check List at index ' + j;
                    }
                }
            }
        }

    } else {
        error = 'Invalid sign orders request';
    }
    return setImmediate(callback, error);
};

module.exports.saveDraftLabOrder = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (_.isEmpty(writebackContext.model.patientUid)) {
            error = 'Missing patientUid';
        }
        if (_.isEmpty(writebackContext.model.authorUid)) {
            error = 'Missing authorUid';
        }
        if (_.isEmpty(writebackContext.model.domain)) {
            error = 'Missing domain';
        }
        if (_.isEmpty(writebackContext.model.subDomain)) {
            error = 'Missing subDomain';
        }
        if (_.isEmpty(writebackContext.model.ehmpState)) {
            error = 'Missing ehmpState';
        }
        if (_.isEmpty(writebackContext.model.visit)) {
            error = 'Missing Visit Context';
        } else {
            if (_.isEmpty(writebackContext.model.visit.location)) {
                error = 'Missing location for  Save Draft Lab Order';
            }
            if (_.isEmpty(writebackContext.model.visit.serviceCategory)) {
                error = 'Missing serviceCategory';
            }
            if (_.isEmpty(writebackContext.model.visit.dateTime)) {
                error = 'Missing dateTime';
            }
        }
        switch (writebackContext.model.ehmpState) {
            case 'draft':
                if (!_.isEmpty(writebackContext.model.data)) {
                    if (writebackContext.model.subDomain === 'laboratory') {
                        if (_.isEmpty(writebackContext.model.data.labTestText)) {
                            error = 'Missing Lab Text';
                        }
                    }
                }
                if (!_.isEmpty(writebackContext.model.referenceId)) {
                    error = 'Draft Order should not have a referenceId';
                }
                break;
            case 'deleted':
                if (_.isEmpty(writebackContext.model.uid)) {
                    error = 'Deleted Order should have a uid';
                }
                break;
            default:
                break;
        }
    } else {
        error = 'Invalid save draft order request';
    }
    return setImmediate(callback, error);
};

module.exports.findDraftOrders = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (_.isEmpty(writebackContext.model.patientUid)) {
            error = 'Missing patientUid';
        }
        if (_.isEmpty(writebackContext.model.authorUid)) {
            error = 'Missing authorUid';
        }
    } else {
        error = 'Invalid find draft order request';
    }
    return setImmediate(callback, error);
};

module.exports.readDraftOrder = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (_.isEmpty(writebackContext.resourceId)) {
            error = 'Missing clinical object UID (resourceId)';
        }
    } else {
        error = 'Invalid read draft order request';
    }
    return setImmediate(callback, error);
};
