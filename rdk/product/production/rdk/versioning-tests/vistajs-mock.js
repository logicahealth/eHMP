'use strict';

var _ = require('lodash');
var RpcClient = require('vista-js').RpcClient;
var readResponse = require('./recorded-response-repository').readResponse;
var buildUrl = require('./vistajs-spy').buildUrl;

module.exports.mockVistaJS = mockVistaJS;

function mockVistaJS() {
    mockRcpClientCalls();
}

function mockRcpClientCalls() {
    RpcClient.create = handleRpcClientCreate;
    RpcClient.callRpc = handleRpcClientCallRpc;
}

function handleRpcClientCreate(logger, configuration) {
    var callCallback = function(callback) {
        callback(null, 'success');
    };
    return {
        connect: callCallback,
        close: callCallback,
        execute: function(rpcName) {
            var callback = _.last(arguments);
            var params = _.slice(arguments, 1, arguments.length - 1);
            handleRpcCall(logger, configuration, rpcName, params, callback);
        }
    };
}

function handleRpcClientCallRpc() {
    var logger, configuration, rpcName, params;
    if (RpcClient.isClient(_.first(arguments))) {
        configuration = arguments[0].logger;
        configuration = arguments[0].config;
        rpcName = arguments[1];
        params = _.slice(arguments, 2, arguments.length - 1);
    } else {
        logger = arguments[0];
        configuration = arguments[1];
        rpcName = arguments[2];
        params = _.slice(arguments, 3, arguments.length - 1);
    }
    var callback = _.last(arguments);
    handleRpcCall(logger, configuration, rpcName, params, callback);
}

function handleRpcCall(logger, configuration, rpcName, params, callback) {
    if (logger.simulateExternalError) {
        logger.didSimulateExternalError = true;
        return callback(new Error('Simulated external error'));
    }

    var url = buildUrl(configuration, rpcName, params);
    readResponse({url: url}, function(error, response, responseError) {
        if (response || _.isString(response)) {
            return callback(responseError, response);
        } else {
            return callback(error || responseError || new Error('No recorded response'));
        }
    });
}
