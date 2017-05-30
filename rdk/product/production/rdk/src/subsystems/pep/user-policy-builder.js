'use strict';

var rpcUtil = require('../../utils/rpc-config');
var RpcClient = require('vista-js').RpcClient;
var _ = require('lodash');
var rdkJWT = require('../../core/factory-components/rdk-jwt.js');

function objPropertyToBoolean(obj, path) {
    var propValue = _.result(obj, path, false) + '';

    return propValue.toLowerCase() === 'true';
}

function buildUserPolicy(req) {
    var requestUser = _.result(req, 'session.user', {});

    return {
        breakglass: objPropertyToBoolean(req, 'query._ack') || objPropertyToBoolean(req, 'params._ack') || objPropertyToBoolean(req, 'body._ack') || false,
        consumerType: _.result(requestUser, 'consumerType', undefined),
        isPublicEndpoint: rdkJWT.isPublicEndpoint(req),
        site: _.result(requestUser, 'site', ''),
        rptTabs: objPropertyToBoolean(requestUser, 'rptTabs'),
        corsTabs: objPropertyToBoolean(requestUser, 'corsTabs'),
        dgRecordAccess: objPropertyToBoolean(requestUser, 'dgRecordAccess'),
        dgSensitiveAccess: objPropertyToBoolean(requestUser, 'dgSensitiveAccess'),
        sensitive: false,
        hasSSN: true,
        requestingOwnRecord: false
    };
}

function auditSensitiveDataAccessInVista(req, patient) {
    var localpid = patient.pid.split(';')[1];
    if (!localpid) {
        // there's no point in logging by ICN because the call just errors
        return;
    }
    var serverConfig = rpcUtil.getVistaRpcConfiguration(req.app.config, req.session.user);

    req.logger.debug('PEP: making sensitive rpc call to Vista' + serverConfig.name);

    RpcClient.callRpc(req.logger, serverConfig, 'HMPCRPC RPC', [{
            '"command"': 'logPatientAccess',
            '"patientId"': localpid
        }],
        function(err, result) {
            if (err) {
                req.logger.warn('PEP: Sensitive RPC call error: ' + err);
            }
            if (result) {
                req.logger.debug('PEP: Sensitive RPC results: ' + result);
            }
        });
}

function userIsPatient(req, patients) {
    //userSSN is returned as a number so we convert to string for comparison.
    var userSSN = _.result(req, 'session.user.ssn', '').toString();
    var patientSSN = _.result(patients, '[0].ssn', '');

    return !_.isEmpty(userSSN) && !_.isEmpty(patientSSN) && userSSN === patientSSN;
}

//updates sensitive, hadSSN and requestingOwnRecord policy values in userPolicy object
function updateUserPolicyWithPatientData(req, userPolicy, patients) {
    var items = _.result(patients, 'data.items', null);

    if (_.isNull(items) || !_.isArray(items) || items.length === 0) {
        req.logger.warn('PEP: Not enough information available to build an authorization request.');
        return;
    }

    userPolicy.requestingOwnRecord = userIsPatient(req, items);

    _.each(items, function(patient) {
        if (patient.sensitive === true) {
            userPolicy.sensitive = true;
            req.audit.sensitive = true;

            //breakglass is set in buildUserPolicy function
            if (userPolicy.breakglass) {
                auditSensitiveDataAccessInVista(req, patient);
            }
        }
        if (!patient.ssn) {
            userPolicy.hasSSN = false;
        }
    });
}

module.exports = function(req, patients) {
    var userPolicy = buildUserPolicy(req);
    updateUserPolicyWithPatientData(req, userPolicy, patients);
    return userPolicy;
};


module.exports._buildUserPolicy = buildUserPolicy;
//used for testing only
module.exports._auditSensitiveDataAccessInVista = auditSensitiveDataAccessInVista;
module.exports._userIsPatient = userIsPatient;
module.exports._updateUserPolicyWithPatientData = updateUserPolicyWithPatientData;
