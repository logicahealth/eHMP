'use strict';

var RpcClient = require('vista-js').RpcClient;
var _ = require('lodash');


/**
 * Calls the RPC 'XUS GET TOKEN' to fetch BSE token which is required on all calls to VIX service.
 * The BSE token is used to authenticate the user to Vista
 *
 *
 */
module.exports.fetch = function(req, callback) {
    var user = req.session.user;

    var site = _.get(req, ['app', 'config', 'vistaSites', user.site]);
    if (!site) {
        return callback({err: 'user site not configured'});
    }

    // Extend onto an empty object to prevent overwriting the
    // running configuration with our custom values in the
    // last object
    var vistaConfig = _.extend({}, site, {
        context: req.app.config.rpcConfig.context,
        accessCode: req.session.user.accessCode,
        verifyCode: req.session.user.verifyCode,
        division: req.session.user.division
    });
    var parameters = [];
    var rpcName = 'XUS GET TOKEN';


    return RpcClient.callRpc(
        req.logger, vistaConfig, rpcName, parameters,
        function(err, rpcData) {
            if (err) {
                req.logger.error({err: err, rpcName: rpcName}, 'vix-fetch-bse-token error RPC');
                return callback(err);
            }
            return callback(null, {token: rpcData});
        });
};
