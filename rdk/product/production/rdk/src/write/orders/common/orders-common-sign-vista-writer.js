'use strict';

var rpcClientFactory = require('./../../core/rpc-client-factory');
var encryptSig = require('./orders-sig-code-encryptor');
var patientLock = require('./orders-common-patient-lock');
var orderLock = require('./orders-common-order-lock');
var orderDetail = require('./orders-common-detail-vista-writer');
var vprOrder = require('./orders-common-vpr-order');
var crypto = require('crypto');
var async = require('async');
var _ = require('lodash');

var ERR_MSG_SIG_FAILURE = 'The electronic signature code entered is not valid.';
var ERR_MSG_COMPARISON_FAILURE = 'The status of this order has recently changed.  Please refresh the order view and if necessary, try again.';

function signOrders(writebackContext, callback) {

    writebackContext.vistaConfig.noReconnect = true;
    writebackContext.model.dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        writebackContext.model.isLockPatient = false;
        writebackContext.model.isLockOrders = false;

        var signTasks = createSignOrderTasks(writebackContext);

        async.series([
                signTasks.taskValidateSig,
                signTasks.taskLockPatient,
                signTasks.taskLockOrders,
                signTasks.taskOrderComparison,
                signTasks.taskSaveOrderCheckForSession,
                signTasks.taskSignOrderSend
            ],
            function (err, result) {

                //attempt to unlock order and unlock patient
                var unlockTasks = [];
                if (writebackContext.model.isLockPatient) {
                    _.forEach(writebackContext.model.orderList, function (orderData) {
                        unlockTasks.push(function (callback) {
                            orderLock.unlockOrder(orderData.orderId, writebackContext);
                        });
                    });
                }

                if (writebackContext.model.isLockOrders) {
                    unlockTasks.push(function (callback) {
                        patientLock.unlockPatient(writebackContext);
                    });
                }

                async.series(unlockTasks);

                if (err) {
                    return callback(err);
                }

                writebackContext.vprResponse = result[result.length - 1];

                //update JDS with the latest version of the signed order
                vprOrder.getVprOrders(writebackContext, function(err, vprOrderResults) {
                    //FUTURE-TODO support updating JDS with more than one signed order (will probably require changes to jds-direct-writer)
                    if (vprOrderResults && vprOrderResults.length > 0) {
                        var vprOrder = vprOrderResults[0];

                        writebackContext.vprModel = vprOrder;
                    }

                    return callback(null, writebackContext.vprResponse);
                });
            });
    });
}

function createSignOrderTasks(writebackContext) {

    var taskValidateSig = function (callback) {
        validateSignature(writebackContext, function (err, result) {
            if (err || !result) {
                return callback(ERR_MSG_SIG_FAILURE);
            }

            return callback(null, result);
        });
    };

    var taskLockPatient = function (callback) {
        patientLock.lockPatient(writebackContext, function (err, result) {
            //utilize error message from VistA
            if (result !== '1') {
                return callback(err);
            }

            writebackContext.model.isLockPatient = true;
            return callback(null, result);
        });
    };

    var taskLockOrders = function (callback) {
        var tasks = [];

        _.forEach(writebackContext.model.orderList, function (orderData) {

            tasks.push(
                function (callback) {
                    orderLock.lockOrder(orderData.orderId, writebackContext, function (err, result) {
                        //utilize error message from VistA
                        if (result !== '1') {
                            return callback(err);
                        }

                        writebackContext.model.isLockOrders = true;
                        return callback(null, result);
                    });
                }
            );
        });

        async.series(tasks,
            function (err, result) {
                if (err) {
                    return callback(err);
                }

                return callback(null, result);
            }
        );

    };

    var taskOrderComparison = function (callback) {

        var tasks = [];

        _.forEach(writebackContext.model.orderList, function (orderData) {

            tasks.push(
                function (callback) {
                    compareOrderDetails(orderData.orderId, orderData.orderDetailHash, writebackContext, function (err, result) {

                        if (err || !result) {
                            return callback(ERR_MSG_COMPARISON_FAILURE, null);
                        }

                        return callback(null, result);
                    });
                }
            );
        });

        async.series(tasks,
            function (err, result) {
                if (err) {
                    return callback(err);
                }

                return callback(null, result);
            }
        );
    };

    var taskSaveOrderCheckForSession = function (callback) {

        saveOrderCheckForSession(writebackContext, function (err, result) {
            //display error message from VistA
            if (err) {
                return callback(err);
            }

            return callback(null, result);
        });
    };

    var taskSignOrderSend = function (callback) {

        signOrderSend(writebackContext, function (err, results) {

            if (err) {
                //display error message from VistA
                return callback(err);
            }

            return callback(null, results);
        });
    };

    return {
        'taskValidateSig': taskValidateSig,
        'taskLockPatient': taskLockPatient,
        'taskLockOrders': taskLockOrders,
        'taskOrderComparison': taskOrderComparison,
        'taskSaveOrderCheckForSession': taskSaveOrderCheckForSession,
        'taskSignOrderSend': taskSignOrderSend
    };
}

function signOrderSend(writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORWDX SEND';
        rpcClient.execute(rpcName, getSignOrderSendParameters(writebackContext.model), function (err, data) {

            if (err) {
                return callback(err, data);
            }

            var dataSplit = data.split('\r\n');

            var errorMsg = '';

            //generate sign response with orderIds and include any error messages from VistA
            var respList = [];
            _.forEach(dataSplit, function (result) {
                if (result) {
                    var pieces = result.split('^');
                    if (pieces.length === 4) {

                        if (errorMsg.length > 0) {
                            errorMsg += '\n';
                        }

                        errorMsg += pieces[3];
                    }
                    else if (pieces.length > 0) {
                        var order = {};
                        order.orderId = pieces[0];
                        order.success = true;

                        respList.push(order);
                    }
                }
            });

            //FUTURE-TODO support reporting of multiple errors & successful signatures
            if (errorMsg.length > 0) {
                return callback(errorMsg);
            }
            else {
                return callback(null, respList);
            }
        });
    });
}

function getSignOrderSendParameters(model) {
    var SS_ESIGNED = '1';
    var RS_RELEASE = '1';
    var NO_PROVIDER = 'E';

    var parameters = [];

    if (model &&
        model.dfn &&
        model.provider &&
        model.location &&
        model.eSig &&
        model.orderList) {

        parameters.push(model.dfn);
        parameters.push(model.provider);
        parameters.push(model.location);
        parameters.push(encryptSig.encryptSig(model.eSig));

        var inputList = {};

        if (model.orderList) {

            for (var i = 0; i < model.orderList.length; i++) {
                var orderId = model.orderList[i].orderId;

                var orderIndex = i + 1;

                inputList['(' + orderIndex + ')'] = orderId + '^' + SS_ESIGNED + '^' + RS_RELEASE + '^' + NO_PROVIDER;
            }
        }

        parameters.push(inputList);
    }
    return parameters;
}

function validateSignature(writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORWU VALIDSIG';
        rpcClient.execute(rpcName, getValidateSignatureParameters(writebackContext.model), function (err, data) {

            var dataString = '' + data;
            if (dataString !== '1') {
                return callback(dataString.replace('0^', ''), data);
            }
            else {
                return callback(null, data);
            }
        });
    });
}

function getValidateSignatureParameters(model) {
    var parameters = [];
    if (model && model.eSig) {
        parameters.push(encryptSig.encryptSig(model.eSig));
    }
    return parameters;
}

function compareOrderDetails(resourceId, origDetailHash, writebackContext, callback) {
    orderDetail.getDetail(resourceId, writebackContext, function (err, detailData) {
        if (err) {
            return callback(err, null);
        }

        return callback(null, compareOrderDetailsWithHash(detailData, origDetailHash));
    });
}

function compareOrderDetailsWithHash(detailData, origDetailHash) {
    var detailsHash = crypto.createHash('md5').update(detailData).digest('hex');

    return origDetailHash === detailsHash;
}

function saveOrderCheckForSession(writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORWDXC SAVECHK';
        rpcClient.execute(rpcName, getSaveOrderCheckParameters(writebackContext.model), function (err, data) {

            var dataString = '' + data;
            if (dataString !== '1') {
                return callback(dataString.replace('0^', ''), data);
            }
            else {
                return callback(null, data);
            }
        });
    });
}

function getSaveOrderCheckParameters(model) {
    var parameters = [];
    if (model &&
        model.dfn) {

        parameters.push(model.dfn);

        if (model.overrideReason) {
            parameters.push(model.overrideReason);
        }

        var inputList = {};

        if (model.orderCheckList) {
            inputList['"ORCHECKS"'] = '' + model.orderCheckList.length;

            for (var i = 0; i < model.orderCheckList.length; i++) {
                var orderCheck = model.orderCheckList[i].orderCheck;
                var checkIndex = i + 1;

                inputList['"ORCHECKS", ' + checkIndex] = orderCheck;
            }
        } else {
            inputList['"ORCHECKS"'] = '0';
        }

        parameters.push(inputList);
    }

    return parameters;
}

module.exports = signOrders;
module.exports.saveOrderCheckForSession = saveOrderCheckForSession;
module.exports.compareOrderDetails = compareOrderDetails;
module.exports.validateSignature = validateSignature;
module.exports.signOrderSend = signOrderSend;
module.exports._getSaveOrderCheckParameters = getSaveOrderCheckParameters;
module.exports._compareOrderDetailsWithHash = compareOrderDetailsWithHash;
module.exports._getValidateSignatureParameters = getValidateSignatureParameters;
module.exports._getSignOrderSendParameters = getSignOrderSendParameters;


