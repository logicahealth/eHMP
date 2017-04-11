/*jslint node: true*/
'use strict';

var rdk = require('../core/rdk');
var RpcClient = require('vista-js').RpcClient;
var getVistaRpcConfiguration = require('../utils/rpc-config').getVistaRpcConfiguration;

function getResourceConfig() {
    return [{
        name: 'vista-js-test',
        path: '',
        get: runRpc,
        requiredPermissions: [],
        isPatientCentric: false
    }];
}

/**
* Runs the given RPC. Uses the site code that is stored in the user session.
*
* @param {Object} req - The default Express request.
* @param {Object} res - The default Express response.
*/
function runRpc(req, res) {
    req.logger.info('RPC testing endpoint called');

    var json = JSON.parse(req.param('payload'));

    var vistaConfig = getVistaRpcConfiguration(req.app.config, req.session.user.site, req.session.user);

    RpcClient.callRpc(req.logger, vistaConfig, json.rpc, json.params, function(error, response) {
        if (!error) {
            return res.rdkSend(response);
        } else {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Returned Error Result:' + error + '\nPayload:\n' + JSON.stringify(json));
        }
    });
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.runRpc = runRpc;
