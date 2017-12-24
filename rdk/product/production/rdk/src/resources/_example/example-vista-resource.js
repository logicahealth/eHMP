'use strict';

var RpcClient = require('vista-js').RpcClient;
var RpcParameter = RpcClient.RpcParameter;
var _ = require('lodash');
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;

//refer to ./example-basic-resource for more details
function getResourceConfig(app) {
    return [{
        name: 'test-vista',
        path: '/test/vista',
        get: exampleVistaGet,
        interceptors: {
            operationalDataCheck: false
        },
        subsystems: [],
        requiredPermissions: ['example-permission', 'additional-example-permission'],
        isPatientCentric: true
    }];
}

function exampleVistaGet(req, res) {
    req.logger.debug('example VistA resource GET called');
    if(nullchecker.isNullish(req.interceptorResults.patientIdentifiers.dfn)){
        return res.status(500).rdkSend('Missing required patient identifiers');
    }
    var vistaSite = 'SITE';
    var patientDfn = '3';
    req.audit.patientId = vistaSite + ';' + patientDfn;
    req.audit.logCategory = 'RETRIEVE';

    // Extend onto an empty object to prevent overwriting the
    // running configuration with our custom values in the
    // last object
    var vistaConfig = _.extend({}, req.app.config.vistaSites[vistaSite], {
        context: 'HMP UI CONTEXT',
        accessCode: req.session.user.accessCode,
        verifyCode: req.session.user.verifyCode
    });
    var parameters = [];
    var rpcName = 'ORWPT CWAD';
    parameters.push(new RpcParameter.literal(req.interceptorResults.patientIdentifiers.dfn));
    return RpcClient.callRpc(
        req.logger, vistaConfig, rpcName, parameters,
        function(err, result) {
            if(err) {
                req.logger.error(err, 'exampleVistaGet response error');
                return res.status(500).rdkSend(err);
            }
            return res.rdkSend({data: result});
        }
    );
}

module.exports.getResourceConfig = getResourceConfig;
