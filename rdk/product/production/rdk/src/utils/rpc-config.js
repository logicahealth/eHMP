'use strict';
var _ = require('lodash');

function getVistaRpcConfiguration(config, siteHash, user) {
    if (siteHash === undefined || siteHash === null) {
        throw new Error('The siteHash parameter must be defined when calling getVistaRpcConfiguration');
    }

    var vistaConfig = _.extend(_.clone(config.rpcConfig), config.vistaSites[siteHash]);

    if (user && user.accessCode && user.verifyCode) {
        vistaConfig.accessCode = user.accessCode;
        vistaConfig.verifyCode = user.verifyCode;
    }

    return vistaConfig;
}

module.exports.getVistaRpcConfiguration = getVistaRpcConfiguration;
