'use strict';

var _ = require('lodash');
var RpcClient = require('vista-js').RpcClient;
var rdk = require('../core/rdk');

var READ_ONLY_RPCS = [
    'ORQOR DETAIL'
];

function getSubsystemConfig() {
    return {
        healthcheck: {
            name: 'vista-read-only-subsystem',
            interval: 100000,
            check: function (callback) {
                return callback(true);
            }
        }
    };
}

function getReadOnlyVistaConfig(req, site) {
    var context = _.get(req, 'app.config.rpcConfig.context');
    if (!context) {
        req.logger.error('getReadOnlyVistaConfig: app rpcConfig context not found');
    }
    var vistaConfig = _.get(req, ['app', 'config', 'vistaSites', site]);
    if (!vistaConfig) {
        req.logger.error({site: site}, 'getReadOnlyVistaConfig: vistaSite not found');
    }
    return _.extend({}, vistaConfig, {
        context: context
    });
}

function getRpcSystemClient(req, site, callback) {
    req._rpcSystemClients = req._rpcSystemClients || {};
    if (req._rpcSystemClients[site]) {
        return callback(null, req._rpcSystemClients[site]);
    }
    var vistaConfig = getReadOnlyVistaConfig(req, site);
    var rpcSystemClient = RpcClient.create(req.logger, vistaConfig);

    rpcSystemClient.connect(function (err) {
        if (err) {
            return callback(err);
        }
        req._rpcSystemClients[site] = rpcSystemClient;
        return callback(null, rpcSystemClient);
    });

    var _execute = rpcSystemClient.execute;
    rpcSystemClient.execute = function (rpcName) {
        if (!_.includes(READ_ONLY_RPCS, rpcName)) {
            var callback = _.last(arguments);
            return callback(new Error('Requested RPC was not read-only'));
        }
        return _execute.apply(rpcSystemClient, arguments);
    };
}

function closeAllRpcSystemClients(req) {
    req._rpcSystemClients = req._rpcSystemClients || {};
    _.each(req._rpcSystemClients, function(client) {
        if (client) {
            client.close();
        }
    });
    req._rpcSystemClients = {};
}


module.exports.getRpcSystemClient = getRpcSystemClient;
module.exports.closeAllRpcSystemClients = closeAllRpcSystemClients;
module.exports.getSubsystemConfig = getSubsystemConfig;
