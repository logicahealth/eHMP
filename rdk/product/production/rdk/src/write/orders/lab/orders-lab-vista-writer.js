'use strict';

var locationUtils = require('../../../utils/location-util');
var filemanDateUtil = require('../../../utils/fileman-date-converter');
var rpcClientFactory = require('../../core/rpc-client-factory');
var orderChecks = require('../common/orders-common-check-vista-writer');
var lockPatient = require('../common/orders-common-patient-lock');
var vprOrders = require('../common/orders-common-vpr-order');
var nullchecker = require('../../../core/rdk').utils.nullchecker;
var _ = require('lodash');

module.exports.create = function(writebackContext, callback) {
    writebackContext.vistaConfig.noReconnect = true;
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        lockPatient.lockPatient(writebackContext, function(err, data) {
            if (err) {
                return callback(err, data);
            }
            if (!isOrderChecked(writebackContext.model)) {
                orderChecks.check(writebackContext, function(err, data) {
                    if (err) {
                        lockPatient.unlockPatient(writebackContext);
                        return callback(err, data);
                    } else if (data) {
                        lockPatient.unlockPatient(writebackContext);
                        writebackContext.vprResponse = getOrderChecks(data);
                        return callback(null);
                    } else {
                        saveOrder(true, writebackContext, rpcClient, callback);
                    }
                });
            } else {
                orderChecks.check(writebackContext, function(err, data) {
                    if (err) {
                        lockPatient.unlockPatient(writebackContext);
                        return callback(err, data);
                    } else if (data) {
                        var orderCheckList = [];
                        var dataList;
                        if (data.indexOf('\r\n') === -1) {
                            dataList = data;
                        } else {
                            dataList = data.split('\r\n');
                            dataList.pop();
                            dataList.sort();
                        }
                        var j = 0;
                        for (; j < writebackContext.model.orderCheckList.length; j++) {
                            orderCheckList.push(writebackContext.model.orderCheckList[j].orderCheck);
                        }
                        orderCheckList.sort();
                        if (orderCheckList.length === dataList.length) {
                            var i = 0;
                            for (; i < dataList.length; i++) {
                                if (dataList[i] !== orderCheckList[i]) {
                                    lockPatient.unlockPatient(writebackContext);
                                    writebackContext.vprResponse = getOrderChecks(data);
                                    return callback(null);
                                }
                            }
                            saveOrder(true, writebackContext, rpcClient, callback);
                        } else {
                            lockPatient.unlockPatient(writebackContext);
                            writebackContext.vprResponse = getOrderChecks(data);
                            return callback(null);
                        }
                    } else {
                        lockPatient.unlockPatient(writebackContext);
                        writebackContext.vprResponse = getOrderChecks(data);
                        return callback(null);
                    }
                });
            }
        });
    });

};

module.exports.update = function(writebackContext, callback) {
    writebackContext.vistaConfig.noReconnect = true;
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        lockPatient.lockPatient(writebackContext, function(err, data) {
            if (err) {
                return callback(err, data);
            }
            if (!isOrderChecked(writebackContext.model)) {
                orderChecks.check(writebackContext, function(err, data) {
                    if (err) {
                        lockPatient.unlockPatient(writebackContext);
                        return callback(err, data);
                    } else if (data) {
                        lockPatient.unlockPatient(writebackContext);
                        writebackContext.vprResponse = getOrderChecks(data);
                        return callback(null);
                    } else {
                        saveOrder(false, writebackContext, rpcClient, callback);
                    }
                });
            } else {
                orderChecks.check(writebackContext, function(err, data) {
                    if (err) {
                        lockPatient.unlockPatient(writebackContext);
                        return callback(err, data);
                    } else if (data) {
                        var orderCheckList = [];
                        var dataList;
                        if (data.indexOf('\r\n') === -1) {
                            dataList = data;
                        } else {
                            dataList = data.split('\r\n');
                            dataList.pop();
                            dataList.sort();
                        }
                        var j = 0;
                        for (; j < writebackContext.model.orderCheckList.length; j++) {
                            orderCheckList.push(writebackContext.model.orderCheckList[j].orderCheck);
                        }
                        orderCheckList.sort();
                        if (orderCheckList.length === dataList.length) {
                            var i = 0;
                            for (; i < dataList.length; i++) {
                                if (dataList[i] !== orderCheckList[i]) {
                                    lockPatient.unlockPatient(writebackContext);
                                    writebackContext.vprResponse = getOrderChecks(data);
                                    return callback(null);
                                }
                            }
                            saveOrder(false, writebackContext, rpcClient, callback);
                        } else {
                            lockPatient.unlockPatient(writebackContext);
                            writebackContext.vprResponse = getOrderChecks(data);
                            return callback(null);
                        }
                    } else {
                        lockPatient.unlockPatient(writebackContext);
                        writebackContext.vprResponse = getOrderChecks(data);
                        return callback(null);
                    }
                });
            }
        });
    });
};

/**
 * Save order (Create / Update)
 *
 * @param updateJds As of right now, update JDS only when new order is created.
 * @param writebackContext The Writeback Context
 * @param rpcClient The RPC client
 * @param callback The callback
 */
function saveOrder(updateJds, writebackContext, rpcClient, callback) {
    var rpcName = 'ORWDX SAVE';
    var dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;
    if(nullchecker.isNullish(dfn)){
        return callback('Missing required patient identifiers');
    }
    rpcClient.execute(rpcName, getParameters(dfn, writebackContext.model), function(err, data) {
        lockPatient.unlockPatient(writebackContext);
        if (err) {
            return callback(err, data);
        }

        var uid = vprOrders.toUidFromLegacyOrderData(writebackContext, data);

        vprOrders.getVprOrder(writebackContext, uid, function(err, vprOrder) {

            if (err || !vprOrder) {

                var msg = 'Could not retrieve VPR order';
                if (err) {
                    msg = err.message;
                }

                writebackContext.vprResponse = JSON.stringify({
                    data: msg
                });
                return callback(null);
            }

            writebackContext.vprResponse = JSON.stringify(vprOrder);
            if (updateJds) {
                writebackContext.vprModel = vprOrder;
            }
            return callback(null);
        });

    });
}

/**
 * Returns paramater array
 *
 * @param model The request JSON
 * @returns {Array}
 */
function getParameters(dfn, model) {
    var parameters = [];
    if (model && dfn && model.provider && model.location && model.inputList) {
        parameters.push(dfn);
        parameters.push(model.provider);
        parameters.push(locationUtils.getLocationIEN(model.location));
        parameters.push(model.orderDialog);
        parameters.push(model.displayGroup);
        parameters.push(model.quickOrderDialog);
        if (model.orderId) {
            parameters.push(model.orderId);
        } else {
            parameters.push('');
        }
        var inputList = {};
        _.each(model.inputList, function(value, i) {
            inputList[model.inputList[i].inputKey + ',1'] = model.inputList[i].inputValue; //FUTURE-TODO need further research on instance for future features
        });
        //convert collection date/time
        if ((inputList['28,1'] !== 'LC') && (inputList['6,1'] !== 'TODAY')) {
            inputList['6,1'] = filemanDateUtil.getFilemanDateWithArgAsStr(inputList['6,1']);
        }
        var i;
        if (model.commentList) {
            var wpInstance = '15,1'; //FUTURE-TODO need further research on instance for future features
            inputList[wpInstance] = 'ORDIALOG("WP",' + wpInstance + ')';
            for (i = 1; i <= model.commentList.length; i++) {
                inputList['"WP",' + wpInstance + ',' + i + ',0'] = model.commentList[i - 1].comment;
            }
        }
        if (model.orderCheckList) {
            inputList['"ORCHECK"'] = '' + model.orderCheckList.length;
            for (var j = 0; j <  model.orderCheckList.length; j++) {
                var orderCheck = model.orderCheckList[j].orderCheck.split('^');
                var index = j + 1;
                inputList['"ORCHECK","' + orderCheck[0] + '","' + orderCheck[2] + '","' + index + '"'] =
                    model.orderCheckList[j].orderCheck.substring(orderCheck[0].length + 1, model.orderCheckList[j].length);
            }
        } else {
            inputList['"ORCHECK"'] = '0';
        }
        if (model.specialtyId) {
            inputList['"ORTS"'] = model.specialtyId;
        } else {
            inputList['"ORTS"'] = '0';
        }
        parameters.push(inputList);
        parameters.push('');
        parameters.push('');
        parameters.push('');
        parameters.push('0');
    }
    return parameters;
}

function isOrderChecked(model) {
    if (model && model.orderCheckList && model.orderCheckList.length > 0 && model.orderCheckList[0].orderCheck) {
        return true;
    }
    return false;
}

function getOrderChecks(data) {
    var response = {};
    var orderCheckList = [];
    var check = {};
    if (data.indexOf('\r\n') === -1) {
        check.orderCheck = data;
        orderCheckList.push(check);
    } else {
        var dataList = data.split('\r\n');
        var i = 0;
        for (; i < dataList.length - 1; i++) {
            check.orderCheck = dataList[i];
            orderCheckList.push(check);
        }
    }
    response.orderCheckList = orderCheckList;
    return JSON.stringify(response);
}

module.exports._getParameters = getParameters;
module.exports._isOrderChecked = isOrderChecked;
module.exports._getOrderChecks = getOrderChecks;
