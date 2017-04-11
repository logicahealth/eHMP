'use strict';

var rdk = require('../../core/rdk');
var RpcClient = require('vista-js').RpcClient;
var getVistaRpcConfiguration = require('../../utils/rpc-config').getVistaRpcConfiguration;
var async = require('async');
var isNullish = require('../../utils/nullchecker').isNullish;
var _ = require('lodash');
// below: _ exports for unit testing only
module.exports._signOrder = signOrder;

function getResourceConfig() {
    return [{
        name: 'write-back-sign-order-sign',
        path: '/sign',
        interceptors: {
            synchronize: false
        },
        requiredPermissions: [], //['sign-patient-laborder']
        isPatientCentric: false, //shouldn't this be patient centric
        description: {
            post: 'Signs an order'
        },
        post: signOrder,
        healthcheck: [

            function() {
                return true;
            }
        ]
    }];
}

function signOrder(req, res) {
    req.logger.info('perform sign order');
    var userSession,
        site, duz;

    try {
        userSession = req.session.user;
        site = userSession.site;
        duz = userSession.duz[site];
    } catch (e) {
        res.status(rdk.httpstatus.internal_server_error).rdkSend('Required authentication data is not present in request.');
        return;
    }

    var input = req.body.param;
    var signatureCode = input.signatureCode;
    var orders = input.orders;
    var pid = input.patientIEN;
    var locationIEN = input.locationIEN;
    var rpcConfig = getVistaRpcConfiguration(req.app.config, req.session.user.site, userSession);
    // rpcConfig.context = 'OR CPRS GUI CHART';

    if (isNullish(pid) || isNullish(locationIEN) || isNullish(signatureCode) || isNullish(orders) || _.isEmpty(orders) || ('' in orders)) {
        var error = {
            message: 'REQUEST NOT VALID'
        };

        req.logger.error(error);
        res.status(rdk.httpstatus.forbidden).rdkSend(error);
        return;
    }

    async.series([
            function sendOrders(callback) {
                var args = [];
                args.push(pid, duz, locationIEN, signatureCode, orders);
                RpcClient.callRpc(req.logger, rpcConfig, 'HMP WRITEBACK SIGN ORDERS', args, function(error, result) {
                    var parsedError = {},
                        parsedResult = {};
                    var message = '';
                    if (!isNullish(error)) {
                        message = error.message;
                        error = {};
                        error['Vista Error'] = message;
                    } else if (!isNullish(result)) {
                        result = result.split('\n');
                        var localId = '';
                        _.each(result, function(order) {
                            if (!isNullish(order)) {
                                if (order.indexOf(';') > 0) {
                                    localId = order.slice(0, order.indexOf(';'));
                                    if (order.indexOf('^E^') > -1) {
                                        message = order.slice(order.lastIndexOf('^') + 1, order.length);
                                        parsedError[localId] = message;
                                    } else if (order.indexOf('^RS') > 0) {
                                        message = 'Order successfully signed!';
                                        parsedResult[localId] = message;
                                    }
                                } else {
                                    error = order;
                                }
                            }
                        });
                        if (!_.isEmpty(parsedError)) {
                            error = parsedError;
                        }
                        if (!_.isEmpty(parsedResult)) {
                            result = parsedResult;
                        }
                    }
                    callback(error, result);
                });
            }
        ],
        function(error, result) {
            if (error) {
                req.logger.error(error);
                res.status(rdk.httpstatus.forbidden).rdkSend(error);
            } else {
                req.logger.info(result);
                res.status(rdk.httpstatus.ok).rdkSend(result);
            }
        });
}

module.exports.getResourceConfig = getResourceConfig;
