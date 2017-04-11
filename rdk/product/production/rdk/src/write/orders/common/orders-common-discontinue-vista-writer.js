'use strict';

var fhirUtils = require('../../../fhir/common/utils/fhir-converter');
var filemanDateUtil = require('../../../utils/fileman-date-converter');
var rpcClientFactory = require('./../../core/rpc-client-factory');
var ordersUtils = require('./orders-utils');
var async = require('async');
var patientLock = require('./orders-common-patient-lock');
var orderLock = require('./orders-common-order-lock');
var orderDetail = require('./orders-common-detail-vista-writer');
var vprOrder = require('./orders-common-vpr-order');
var crypto = require('crypto');
var ERR_MSG_COMPARISON_FAILURE = 'The status of this order has recently changed.  Please refresh the order view and if necessary, try again.';
var nullchecker = require('../../../core/rdk').utils.nullchecker;

module.exports = function(writebackContext, callback) {
    writebackContext.vistaConfig.noReconnect = true;
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        if (nullchecker.isNullish(writebackContext.interceptorResults.patientIdentifiers.dfn)) {
            return callback('Missing required patient identifiers');
        }

        var lock = []; //use dfn as key for patient lock and use orderId as key for order lock
        async.series([
            function(asyncCallback) { //lock patient
                patientLock.lockPatient(writebackContext, function(err, data) {
                    if (err) {
                        return asyncCallback(err);
                    }
                    lock[writebackContext.interceptorResults.patientIdentifiers.dfn] = true;
                    asyncCallback(null);

                });
            },
            function(asyncCallback) { //lock orders
                var lockOrderFunctions = [];
                var lockOrderFunc = function(orderId) {
                    return function(lockOrdersCallback) {
                        orderLock.lockOrder(orderId, writebackContext, function(err, data) {
                            if (err) {
                                return lockOrdersCallback(err);
                            }
                            lock[orderId] = true;
                            lockOrdersCallback(null);

                        });
                    };
                };
                var orderId;
                for (var i = 0; i < writebackContext.model.orderList.length; i++) {
                    orderId = writebackContext.model.orderList[i].orderId;
                    lockOrderFunctions.push(lockOrderFunc(orderId));
                }
                async.series(
                    lockOrderFunctions,
                    function(err) {
                        if (err) {
                            return asyncCallback(err);
                        }
                        asyncCallback(null);
                    }
                );
            },
            function(asyncCallback) { //fetch each order detail & compare hash
                var compareFunctions = [];
                var compareFunc = function(orderId, hash) {
                    return function(detailCallback) {
                        orderDetail.getDetail(orderId, writebackContext, function(err, data) {
                            if (err) {
                                return detailCallback(err);
                            }

                            var latestHash = crypto.createHash('md5').update(data).digest('hex');
                            if (hash !== latestHash) {
                                return detailCallback(ERR_MSG_COMPARISON_FAILURE);
                            }
                            detailCallback(null);
                        });
                    };
                };
                var orderId, hash;
                for (var i = 0; i < writebackContext.model.orderList.length; i++) {
                    orderId = writebackContext.model.orderList[i].orderId;
                    hash = writebackContext.model.orderList[i].hash;
                    compareFunctions.push(compareFunc(orderId, hash));
                }

                async.series(
                    compareFunctions,
                    function(err) {
                        if (err) {
                            return asyncCallback(err);
                        }
                        asyncCallback(null);
                    }
                );
            },
            function(asyncCallback) { //discontinue orders
                var discontinueFunctions = {};
                var discontinueFunc = function(orderId) {
                    return function(discontinueCallback) {
                        discontinue(orderId, rpcClient, writebackContext, function(err, data) {
                            if (err) {
                                discontinueCallback(err);
                                return;
                            }
                            discontinueCallback(null, true);
                        });
                    };
                };
                var orderId;
                for (var i = 0; i < writebackContext.model.orderList.length; i++) {
                    orderId = writebackContext.model.orderList[i].orderId;
                    discontinueFunctions[orderId] = discontinueFunc(orderId);
                }
                async.series(
                    discontinueFunctions,
                    function(err, results) {
                        if (err) {
                            asyncCallback(err);
                            return;
                        }
                        asyncCallback(null, results);
                    }
                );
            }
        ], function(err, results) { //unlock orders & patient before processing error & results
            async.series([
                function(resultsCallback) { //unlock orders by checking each order lock, lock[orderId]
                    var unlockOrderFunctions = [];
                    var unlockOrderFunc = function(orderId) {
                        return function(unlockOrdersCallback) {
                            if (lock[orderId]) {
                                orderLock.unlockOrder(orderId, writebackContext);
                            }
                            unlockOrdersCallback(null);
                        };
                    };
                    var orderId;
                    for (var i = 0; i < writebackContext.model.orderList.length; i++) {
                        orderId = writebackContext.model.orderList[i].orderId;
                        unlockOrderFunctions.push(unlockOrderFunc(orderId));
                    }
                    async.parallel(
                        unlockOrderFunctions,
                        function(err) {
                            if (err) {
                                return resultsCallback(err);
                            }
                            resultsCallback(null);
                        }
                    );
                },
                function(resultsCallback) { //unlock patient by checking patient lock, lock[dfn]
                    if (lock[writebackContext.interceptorResults.patientIdentifiers.dfn]) {
                        patientLock.unlockPatient(writebackContext);
                    }
                    resultsCallback(null);
                }
            ], function(error) {
                if (err) {
                    return callback(err);
                }
                writebackContext.vprResponse = results[3];

                //update JDS with the latest version of the discontinued order
                vprOrder.getVprOrders(writebackContext, function(err, vprOrderResults) {
                    //FUTURE-TODO support updating JDS with more than one discontinued order (will probably require changes to jds-direct-writer)
                    if (vprOrderResults && vprOrderResults.length > 0) {
                        var vprOrder = vprOrderResults[0];

                        writebackContext.vprModel = vprOrder;
                    }

                    return callback(null);
                });
            });

        });

    });
};

function discontinue(orderId, rpcClient, writebackContext, callback) {
    var rpcName = 'ORWDXA DC';
    rpcClient.execute(rpcName, getParameters(writebackContext.model, orderId), function(err, data) {
        if (err) {
            return callback(err, data);
        }
        return callback(null, orderId + ' ' + data);
    });
}

function getParameters(model, orderId) {
    var parameters = [];
    if (model && model.provider && model.location && orderId) {
        parameters.push(orderId);
        parameters.push(model.provider);
        parameters.push(model.location);
        if (model.reason) {
            parameters.push(model.reason);
        } else {
            parameters.push('0');
        }
        parameters.push('0');
        parameters.push('0');
    }
    return parameters;
}

module.exports._getParameters = getParameters;
