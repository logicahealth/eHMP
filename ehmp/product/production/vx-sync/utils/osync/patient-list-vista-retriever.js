'use strict';

var _ = require('underscore');
var async = require('async');
var rpcUtil = require(global.VX_UTILS + '/rpc-util');
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');
var nullUtils = require(global.VX_UTILS + 'null-utils');
var parseRpcResponsePatientList = require(global.OSYNC_UTILS + 'patient-sync-utils').parseRpcResponsePatientList;

function getPatientsFromOneVista(log, rpcConfig, id, site, callback) {
    var patients = [];

    rpcUtil.standardRPCCall(log, rpcConfig, 'HMP DEFAULT PATIENT LIST', id, null, function (error, data) {
        if (error) {
            log.error('patient-list-vista-retrieve.getPatientList: An error occurred retrieving the patient list data for active user ' + id + ' from site ' + rpcConfig.host + ':' + rpcConfig.port + ':' + error + ' -- data contained: ' + data);
            return callback(null, patients); // We don't want to bail completely--we still want to try the other sites, so don't pass the error along to siteCb().
        }

        if (nullUtils.isNullish(data) || _.isEmpty(data)) {
            log.debug('patient-list-vista-retrieve.getPatientList: the data returned was empty');
            return callback(null, patients);
        }

        parseRpcResponsePatientList(log, data, function(err, patients) {
            if (err) {
                log.warn('patient-list-vista-retrieve.getPatientList: An error occurred while parsing the patient list data for active user ' + id + ' from site ' + rpcConfig.host + ':' + rpcConfig.port + ':' + err + ' -- data contained: ' + data);
                // We don't want to bail completely--we still want to try the other sites, so don't pass the error along to siteCb().
                return callback(null, []);
            }

            _.each(patients, function(patient) {
                _.extend(patient, {siteId: site});
            });

            callback(null, patients);
        });
    });
}

function getPatientListForOneUser(log, config, user, callback) {
    var configVistaSites = config.vistaSites;
    var rpcConfig = configVistaSites[user.site];

    if (_.isUndefined(rpcConfig)) {
        log.warn('patient-list-vista-retrieve.getPatientList: Site not configured for %s', user.site);
        return callback(null, []);
    }

    rpcConfig.context = config.rpcContext;

    getPatientsFromOneVista(log, rpcConfig, user.id, user.site, function(err, results) {
        if (err) {
            log.warn('patient-list-vista-retrieve.getPatientList: An error occurred retrieving the patient list(s) for the active user %j : %s', user, err);
            return callback(null, []);
        }

        callback(null, results);
    });
}

module.exports.getPatientListForOneUser = getPatientListForOneUser;
