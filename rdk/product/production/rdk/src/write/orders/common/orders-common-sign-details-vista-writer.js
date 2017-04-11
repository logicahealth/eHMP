'use strict';

var rpcClientFactory = require('./../../core/rpc-client-factory');
var orderActionValid = require('./orders-common-action-valid-vista-writer');
var ordersUtils = require('./orders-utils');
var orderDetail = require('./orders-common-detail-vista-writer');
var orderCheckSession = require('./orders-common-check-session-vista-writer');
var crypto = require('crypto');
var async = require('async');
var _ = require('lodash');

module.exports = function(writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var actionCode = ordersUtils.getOrderActionCodes('sign');
        var provider = writebackContext.model.provider;

        async.series([
            function(asyncCallback) { //is order still signable
                var actionValidFunctions = [];
                var getActionValidFunc = function(orderId) {
                    return function(parallelCallback) {
                        orderActionValid.actionValid(orderId, actionCode, provider, writebackContext, function(err, data) {
                            if (err) {
                                return parallelCallback(err);
                            }
                            parallelCallback(null);
                        });
                    };
                };
                // http://stackoverflow.com/questions/19696015/javascript-creating-functions-in-a-for-loop
                _.each(writebackContext.model.orderIds, function(id) {
                    actionValidFunctions.push(getActionValidFunc(id));
                });

                async.parallel(
                    actionValidFunctions,
                    function(err) {
                        if (err) {
                            return asyncCallback(err);
                        }
                        asyncCallback(null);
                    });
            },
            function(asyncCallback) { //fetch order details
                var getDetailFunctions = {};
                var getDetailFunc = function(orderId) {
                    return function(parallelCallback) {
                        orderDetail.getDetail(orderId, writebackContext, function(err, data) {
                            if (err) {
                                return parallelCallback(err, null);
                            }
                            parallelCallback(null, data);
                        });
                    };
                };
                _.each(writebackContext.model.orderIds, function(id) {
                    var orderId = '' + id;
                    getDetailFunctions[orderId] = getDetailFunc(orderId);
                });
                async.parallel(
                    getDetailFunctions,
                    function(err, results) {
                        if (err) {
                            return asyncCallback(err);
                        }
                        asyncCallback(null, results);
                    });
            },
            function(asyncCallback) { //fetch order checks
                var getCheckFunctions = {};
                var getCheckFunc = function(orderId) {
                    return function(parallelCallback) {
                        orderCheckSession.check(orderId, writebackContext, function(err, data) {
                            if (err) {
                                return parallelCallback(err, null);
                            }
                            parallelCallback(null, data);
                        });
                    };
                };
                _.each(writebackContext.model.orderIds, function(id) {
                    var orderId = '' + id;
                    getCheckFunctions[orderId] = getCheckFunc(orderId);
                });
                async.parallel(
                    getCheckFunctions,
                    function(err, results) {
                        if (err) {
                            return asyncCallback(err);
                        }
                        asyncCallback(null, results);
                    });
            }
        ], function(err, results) {
            if (err) {
                return callback(err, null);
            }
            var orderList = [];
            _.each(writebackContext.model.orderIds, function(id) {
                var key = '' + id;
                orderList.push(getSignDetails(key, results[1][key], results[2][key]));
            });
            writebackContext.vprResponse = orderList;
            return callback(null);
        });
    });
};

function getSignDetails(orderId, detailData, orderChecks) {
    var signDetails = {};
    signDetails.orderId = orderId;
    signDetails.detail = detailData;
    if (orderChecks) {
        var orderCheckList = [];
        var check;
        if (orderChecks.indexOf('\r\n') === -1) {
            check = {};
            check.orderCheck = orderChecks;
            orderCheckList.push(check);
        } else {
            var dataList = orderChecks.split('\r\n');
            var i = 0;
            for (; i < dataList.length - 1; i++) {
                check = {};
                check.orderCheck = dataList[i];
                orderCheckList.push(check);
            }
        }
        signDetails.orderCheckList = orderCheckList;
    }
    signDetails.hash = crypto.createHash('md5').update(detailData).digest('hex');
    return signDetails;
}

module.exports._getSignDetails = getSignDetails;
