'use strict';

module.exports.edit = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (!writebackContext.resourceId) {
            error = 'Missing Resource ID';
        }
    } else {
        error = 'Invalid edit request';
    }
    return setImmediate(callback, error);
};

module.exports.detail = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (!writebackContext.resourceId) {
            error = 'Missing Resource ID';
        }
    } else {
        error = 'Invalid detail request';
    }
    return setImmediate(callback, error);
};

module.exports.discontinueDetails = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (!writebackContext.model.dfn) {
            error = 'Missing dfn';
        }
        if (!writebackContext.model.provider) {
            error = 'Missing provider';
        }
        if (!writebackContext.model.orderIds || writebackContext.model.orderIds.length < 1) {
            error = 'Missing Order ID(s)';
        }
    } else {
        error = 'Invalid discontinue details request';
    }
    return setImmediate(callback, error);
};

module.exports.signDetails = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (!writebackContext.model.dfn) {
            error = 'Missing dfn';
        }
        if (!writebackContext.model.provider) {
            error = 'Missing provider';
        }
        if (!writebackContext.model.orderIds || writebackContext.model.orderIds.length < 1) {
            error = 'Missing Order ID(s)';
        }
    } else {
        error = 'Invalid sign details request';
    }
    return setImmediate(callback, error);
};

module.exports.signOrders = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (!writebackContext.model.dfn) {
            error = 'Missing dfn';
        }
        if (!writebackContext.model.provider) {
            error = 'Missing provider';
        }
        if (!writebackContext.model.location) {
            error = "Missing location";
        }
        if (!writebackContext.model.orderList || writebackContext.model.orderList.length < 1) {
            error = 'Missing Order List';
        } else {
            for (var i = 0; i < writebackContext.model.orderList.length; i++) {
                var orderData = writebackContext.model.orderList[i];
                if (!orderData.orderId) {
                    error = "Missing orderId in Order List at index " + i;
                } else if (!orderData.orderDetailHash) {
                    error = "Missing orderDetailHash in Order List at index " + i;
                }
            }
        }

        if (writebackContext.model.orderCheckList && writebackContext.model.orderCheckList.length > 0) {
            for (var j = 0; j < writebackContext.model.orderCheckList.length; j++) {
                var orderCheck = writebackContext.model.orderCheckList[j];

                if (!orderCheck.orderCheck) {
                    error = "Missing orderCheck in Order Check List at index " + j;
                }
            }
        }

    } else {
        error = 'Invalid sign orders request';
    }
    return setImmediate(callback, error);
};

module.exports.saveDraftOrder = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (!writebackContext.model.patientUid) {
            error = 'Missing patientUid';
        }
        if (!writebackContext.model.authorUid) {
            error = 'Missing authorUid';
        }
        if (!writebackContext.model.domain) {
            error = "Missing domain";
        }
        if (!writebackContext.model.subDomain) {
            error = "Missing subDomain";
        }
        if (!writebackContext.model.ehmpState) {
            error = "Missing ehmpState";
        }
        if (!writebackContext.model.visit) {
            error = 'Missing Visit Context';
        } else {
            if (!writebackContext.model.visit.location) {
                error = "Missing location";
            }
            if (!writebackContext.model.visit.serviceCategory) {
                error = "Missing serviceCategory";
            }
            if (!writebackContext.model.visit.dateTime) {
                error = "Missing dateTime";
            }
        }
    } else {
        error = 'Invalid save draft order request';
    }
    return setImmediate(callback, error);
};

module.exports.findDraftOrders = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (!writebackContext.model.patientUid) {
            error = 'Missing patientUid';
        }
        if (!writebackContext.model.authorUid) {
            error = 'Missing authorUid';
        }
    } else {
        error = 'Invalid find draft order request';
    }
    return setImmediate(callback, error);
};