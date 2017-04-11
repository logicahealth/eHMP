'use strict';

var getVistaRpcConfiguration = require('../../../utils/rpc-config').getVistaRpcConfiguration;
var RpcClient = require('vista-js').RpcClient;
var async = require('async');
var _ = require('lodash');
var nullchecker = require('../../../core/rdk').utils.nullchecker;

/**
 * Returns VPR order object by calling HMP GET PATIENT DATA JSON
 * @param writebackContext The writeback context
 * @param orderUid The order uid (ex: 'urn:va:order:9E7A:3:15822')
 * @param callback The callback
 */
var getVprOrder = function(writebackContext, orderUid, callback) {
    if(nullchecker.isNullish(writebackContext.interceptorResults.patientIdentifiers.dfn)){
        return callback(new Error('Missing required patient identifiers'));
    }

    var rpcName = 'HMP GET PATIENT DATA JSON';

    var rpcParams = {
        '"patientId"': writebackContext.interceptorResults.patientIdentifiers.dfn,
        '"domain"': 'order',
        '"uid"': orderUid
    };

    var rpcConfig = getVistaRpcConfiguration(writebackContext.appConfig, writebackContext.vistaConfig);

    rpcConfig.context = 'HMP SYNCHRONIZATION CONTEXT';

    RpcClient.callRpc(writebackContext.logger, rpcConfig, rpcName, rpcParams, function(err, resp) {
        if (err) {
            return callback(err);
        }

        var vprModel = JSON.parse(resp).data.items[0];

        if (vprModel && vprModel.uid === orderUid) {
            return callback(null, vprModel);
        }
        else {
            return callback(new Error("Failed to parse order VPR result."));
        }
    });
};

/**
 * Returns all VPR orders listed in writebackContext.model.orderList (by calling HMP GET PATIENT DATA JSON on each order)
 * @param writebackContext The writeback context
 * @param callback The callback
 */
var getVprOrders = function(writebackContext, callback) {

    var vprOrderTasks = [];
    _.forEach(writebackContext.model.orderList, function(order) {
        vprOrderTasks.push(function(vprOrderCallback) {
            var orderId = order.orderId;

            //Exclude semi-colon postfix.
            orderId = orderId.indexOf(';') > -1 ? orderId.substring(0, orderId.indexOf(';')) : orderId;

            var uid = toUid(writebackContext, orderId);

            getVprOrder(writebackContext, uid, function(err, vprOrder) {
                return vprOrderCallback(null, vprOrder);
            });
        });
    });

    async.series(vprOrderTasks,
        function(err, results) {
            callback(null, results);
        });
};

/**
 * Utility to piece together a uid from raw order data returned by the legacy CPRS save order RPC call.
 *
 * @param writebackContext The writeback context.
 * @param orderData Raw order data
 * @returns uid
 */
var toUidFromLegacyOrderData = function(writebackContext, orderData) {

    var resultArray = ('' + orderData).split('^');

    var orderId = resultArray[0].substring(1, resultArray[0].indexOf(';'));

    return toUid(writebackContext, orderId);
};


/**
 * Utility to piece together a uid using an orderId and the siteHash and dfn elements stored in the writebackContext.
 *
 * @param writebackContext The writeback context.
 * @param orderId Order internal entry number.
 * @returns uid
 */
var toUid = function(writebackContext, orderId) {
    return 'urn:va:order:' + writebackContext.siteHash + ':' + writebackContext.interceptorResults.patientIdentifiers.dfn + ':' + orderId;
};

module.exports.getVprOrder = getVprOrder;
module.exports.getVprOrders = getVprOrders;
module.exports.toUid = toUid;
module.exports.toUidFromLegacyOrderData = toUidFromLegacyOrderData;




