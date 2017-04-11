'use strict';

module.exports.create = function(writebackContext, callback) {
    validateSave(false, writebackContext, callback);
};

module.exports.update = function(writebackContext, callback) {
    validateSave(true, writebackContext, callback);
};

/**
 * Validate create or update request
 */
function validateSave(update, writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        var model = writebackContext.model;
        if (model) {
            if (update && !model.orderId) {
                error = 'Missing order ID';
            } else if (!model.dfn || !model.provider || !model.location || !model.orderDialog || !model.displayGroup ||
                !model.quickOrderDialog || !model.inputList || (model.inputList.length < 1) || !model.kind) {
                error = 'Missing input parameter';
            } else if (!model.clinicalObject) {
                error = 'Missing Clinical Object';
            } else if (!model.clinicalObject.data || (model.clinicalObject.data.pastDueDate == null)) {  //empty string pastDueDate is allowed
                error = 'Missing Past Due Date field';
            }
        } else {
            if (update) {
                error = 'Invalid update request';
            } else {
                error = 'Invalid create request';
            }
        }
    } else {
        if (update) {
            error = 'Invalid update request';
        } else {
            error = 'Invalid create request';
        }
    }
    return setImmediate(callback, error);
};

module.exports.discontinueLab = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext) {
        if (!writebackContext.model.dfn) {
            error = 'Missing dfn';
        }
        if (!writebackContext.model.provider) {
            error = 'Missing provider';
        }
        if (!writebackContext.model.location) {
            error = 'Missing location from Discontinue Lab';
        }
        if (!writebackContext.model.orderList || writebackContext.model.orderList.length < 1) {
            error = 'Missing Order list';
        } else if (!writebackContext.model.orderList[0].orderId) {
            error = 'Missing order ID';
        } else if (!writebackContext.model.orderList[0].hash) {
            error = 'Missing hash';
        }
    } else {
        error = 'Invalid discontinue request';
    }
    return setImmediate(callback, error);
};
