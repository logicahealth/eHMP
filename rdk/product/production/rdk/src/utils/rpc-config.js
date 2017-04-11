'use strict';
var _ = require('lodash');
/**
 * Patient centric resources pass in with patient site.
 * Non-patient centric resources just pass in the user session object as normal
 *
 * @param {Object} config - The config object containing rpc configuration
 * @param {Object} params - The parameters passed in for patient (contains patientIdentifiers.site) or non-patient (uses req.session.user.site) centric calls.
 *
 * @return {Object} - Object containing vistaConfig if no errors thrown by undefined parameters and their attributes
 */
//
function getVistaRpcConfiguration(config, params) {
    if (_.isUndefined(params) || _.isNull(params)) {
        throw new Error('The vista rpc config params parameter must be defined when calling getVistaRpcConfiguration');
    }
    if (_.isUndefined(params.site) || _.isNull(params.site)) {
        throw new Error('The vista rpc config params.site parameter must be defined when calling getVistaRpcConfiguration');
    }

    var vistaConfig = _.extend(_.clone(config.rpcConfig), config.vistaSites[params.site]);

    if (params && params.accessCode && params.verifyCode) {
        vistaConfig.accessCode = params.accessCode;
        vistaConfig.verifyCode = params.verifyCode;
    }

    if (params && params.division) {
        vistaConfig.division = params.division;
    }

    return vistaConfig;
}

function getPatientCentricVistaRpcConfigurationParams(user, patientSite) {
    var params = {};
    if (user.accessCode) {
        params.accessCode = user.accessCode;
    }
    if (user.verifyCode) {
        params.verifyCode = user.verifyCode;
    }
    if (user.division) {
        params.division = user.division;
    }
    if (patientSite) {
        params.site = patientSite;
    } else {
        params.site = user.site;
    }
    return params;
}

module.exports.getPatientCentricVistaRpcConfigurationParams = getPatientCentricVistaRpcConfigurationParams;
module.exports.getVistaRpcConfiguration = getVistaRpcConfiguration;