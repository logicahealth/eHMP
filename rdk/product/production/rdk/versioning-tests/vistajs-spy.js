'use strict';

var _ = require('lodash');
var RpcClient = require('vista-js').RpcClient;
var recordResponse = require('./recorded-response-repository').recordResponse;

module.exports.enabled = true;
module.exports.startSpying = startSpying;
module.exports.stopSpying = stopSpying;
module.exports.buildUrl = buildUrl;

var originalFunctions;

function startSpying() {
    if (originalFunctions) {
        return;
    }

    console.log('vistajs-spy.js: start spying on VistaJS requests');

    originalFunctions = {};
    startSpyingOnRpcClient();
}

function stopSpying() {
    if (!originalFunctions) {
        return;
    }

    console.log('vistajs-spy.js: stop spying on VistaJS requests');

    _.each(originalFunctions.RpcClient, function(func, name) {
        RpcClient[name] = func;
    });
    originalFunctions = undefined;
}

function startSpyingOnRpcClient() {
    originalFunctions.RpcClient = {
        create: RpcClient.create,
        callRpc: RpcClient.callRpc
    };
    RpcClient.create = spyOnRpcClientCreate;
    RpcClient.callRpc = spyOnCallRpc;
}

function spyOnRpcClientCreate(logger, configuration) {
    var rpcClient = originalFunctions.RpcClient.create(logger, configuration);
    var originalExecute = rpcClient.execute;
    rpcClient.execute = function(rpcName) {
        var args = _.initial(arguments);
        var params = _.rest(args);
        var callback = _.last(arguments);
        args.push(createSpyCallback(configuration, rpcName, params, callback));
        originalExecute.apply(rpcClient, args);
    };
    return rpcClient;
}

function spyOnCallRpc() {
    var args = _.initial(arguments);
    var callback = _.last(arguments);
    var configuration, rpcName, params;
    if (RpcClient.isClient(_.first(args))) {
        configuration = args[0].config;
        rpcName = args[1];
        params = _.slice(args, 2);
    } else {
        configuration = args[1];
        rpcName = args[2];
        params = _.slice(args, 3);
    }
    args.push(createSpyCallback(configuration, rpcName, params, callback));
    originalFunctions.RpcClient.callRpc.apply(null, args);
}

function createSpyCallback(configuration, rpcName, params, callback) {
    return function(error, result) {
        if (module.exports.enabled) {
            var recordOptions = {url: buildUrl(configuration, rpcName, params)};
            recordResponse(recordOptions, result, error);
        }
        callback(error, result);
    };
}

function buildUrl(configuration, rpcName, params) {
    if (rpcName === 'HMPCRPC RPC' && params.length > 0) {
        var config = _.first(_.flatten(params));
        return 'http://vista/' + configuration.context + '/' + rpcName + '/' + config['"command"'];
    }
    return 'http://vista/' + configuration.context + '/' + rpcName;
}
