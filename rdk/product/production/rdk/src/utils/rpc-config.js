'use strict';
var _ = require('lodash');

function getVistaRpcConfiguration(config, user) {
    if (_.isUndefined(user) || _.isNull(user)) {
        throw new Error('The user parameter must be defined when calling getVistaRpcConfiguration');
    }
    if (_.isUndefined(user.site) || _.isNull(user.site)) {
        throw new Error('The user.site parameter must be defined when calling getVistaRpcConfiguration');
    }

    var vistaConfig = _.extend(_.clone(config.rpcConfig), config.vistaSites[user.site]);

    if (user && user.accessCode && user.verifyCode) {
        vistaConfig.accessCode = user.accessCode;
        vistaConfig.verifyCode = user.verifyCode;
    }

    if (user && user.division) {
        vistaConfig.division = user.division;
    }

    return vistaConfig;
}

module.exports.getVistaRpcConfiguration = getVistaRpcConfiguration;
