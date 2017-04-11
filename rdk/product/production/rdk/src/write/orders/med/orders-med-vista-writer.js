'use strict';

var rpcClientFactory = require('../../core/rpc-client-factory');
var RcpClient = require('vista-js').RpcClient;
var RpcParameter = RcpClient.RpcParameter;

module.exports.create = function(writebackContext, callback) {
    var pid = writebackContext.pid;

    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var parameters = [];
        var rpcName = 'ORQPT MYRPC';
        parameters.push(new RpcParameter.literal('MYPARAM'));

        rpcClient.execute(rpcName, parameters, function(err, data) {
            if(err) {
                return callback(err, data);
            }
            writebackContext.vprModel = null;  // set this by the VistA response
            var error = null;  // set error if trouble writing back
            return callback(error);
        });
    });
};

module.exports.update = function(writebackContext, callback) {
    var pid = writebackContext.pid;

    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var parameters = [];
        var rpcName = 'ORQPT MYRPC';
        parameters.push(new RpcParameter.literal('MYPARAM'));

        rpcClient.execute(rpcName, parameters, function(err, data) {
            if(err) {
                return callback(err, data);
            }
            writebackContext.vprModel = null;  // set this by the VistA response
            var error = null;  // set error if trouble writing back
            return callback(error);
        });
    });
};

