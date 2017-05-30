'use strict';

require('../env-setup');

var _ = require('underscore');
var async = require('async');
var inspect = require('util').inspect;
var format = require('util').format;
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var fsUtil = require(global.VX_UTILS + 'fs-utils');
var docUtil = require(global.VX_UTILS + 'doc-utils');
var domainUtil = require(global.VX_UTILS + 'domain');

function clearPatient(log, config, environment, force, identifiers, jpid, callback) {
    log.debug('clearPatientUtil.clearPatient entering method for ids: %s', identifiers);

    if (!identifiers || !jpid || _.isEmpty(identifiers)) {
        var errorMessage = format('clearPatientUtil.clearPatient: Missing list of corresponding ids or jpid: ids: %s, jpid: %s', identifiers, jpid);
        log.error(errorMessage);
        return callback(errorMessage);
    }

	var jdsClient = environment.jds.childInstance(log),
		vistaConnector = environment.vistaClient.childInstance(log),
		hdrClient = environment.hdrClient.childInstance(log),
		solrClient = environment.solr.childInstance(log);

    var asyncMethod = (!_.isUndefined(force) ? async.parallel : async.series);
    asyncMethod({
        'clearDocuments': function(callback) {
            async.map(identifiers, function(identifier, docCallback) {
                log.debug('clearPatientUtil.clearPatient clearDocuments for id: %s', identifier);
                var dirName = docUtil.getPatientTopDirAbsPath(identifier, config);
                fsUtil.deleteAllFiles(dirName);
                docCallback();
            }, callback);
        },
        'clearSolr': function(callback) {
            async.map(identifiers, function(identifier, solrCallback) {
                log.debug('clearPatientUtil.clearPatient clearSolr for id: %s', identifier);
                solrClient.deleteByQuery('domain:(' + domainUtil.getSolrDomainList().join(' OR ') + ') AND pid:(' + identifier + ')', solrCallback);
            }, callback);
        },
        'unsubscribeVistaSites': function(callback) {
            async.map(identifiers, function(identifier, vistaCallback) {
                log.debug('clearPatientUtil.clearPatient unsubscribeVistaSites for id: %s', identifier);
                if (idUtil.isPid(identifier)) {
                    if (idUtil.isVistaDirect(identifier, config)) {
                        vistaConnector.unsubscribe(identifier, function(error, response) {
                            if (error) {
                                log.error('clearPatientUtil.clearPatient unsubscribeVistaSites for id %s - error returned from unsubscribe call: %s', identifier, error);
                                vistaCallback(error);
                            } else if (response !== 'success') {
                                log.error('clearPatientUtil.clearPatient unsubscribeVistaSites for id %s - unexpected response returned from unsubscribe call: %s', identifier, inspect(response));
                                vistaCallback(format('clearPatientUtil.clearPatient unsubscribeVistaSites for id %s - unexpected response: %s', identifier, inspect(response)));
                            } else {
                                log.debug('clearPatientUtil.clearPatient unsubscribeVistaSites complete for id: %s', identifier);
                                vistaCallback();
                            }
                        });
                    } else if (idUtil.isVistaHdr(identifier, config)) {
                        var siteId = idUtil.extractSiteFromPid(identifier);
                        hdrClient.unsubscribe(siteId, identifier, function(error, response) {
                            if (error) {
                                log.error('clearPatientUtil.clearPatient unsubscribeVistaSites (VistaHdr) for id %s - error returned from unsubscribe call: %s', identifier, error);
                                vistaCallback(error);
                            } else if (response !== 'success') {
                                log.error('clearPatientUtil.clearPatient unsubscribeVistaSites (VistaHdr) for id %s - unexpected response returned from unsubscribe call: %s', identifier, inspect(response));
                                vistaCallback(format('clearPatientUtil.clearPatient unsubscribeVistaSites (VistaHdr) for id %s - unexpected response: %s', identifier, inspect(response)));
                            } else {
                                log.debug('clearPatientUtil.clearPatient unsubscribeVistaSites (VistaHdr) complete for id: %s', identifier);
                                vistaCallback();
                            }
                        });
                    } else {
                        log.debug('clearPatientUtil.clearPatient unsubscribeVistaSites id does not correspond to a configured site: %s', identifier);
                        vistaCallback();
                    }
                } else {
                    log.debug('clearPatientUtil.clearPatient unsubscribeVistaSites id is not a pid: %s', identifier);
                    vistaCallback();
                }
            }, function(error) {
                callback(error);
            });
        },
        'removePatientFromJds': function(callback) {
            log.debug('clearPatientUtil.clearPatient removePatientFromJds for jpid: %s', jpid);
            jdsClient.removePatientIdentifier(jpid, function(error, response) {
                var errorMessage;
                if (error) {
                    errorMessage = format('clearPatientUtil.clearPatient removePatientFromJds for jpid %s: error returned from JDS: error: %s, response: %s', jpid, inspect(error), inspect((response) ? response.body : null));
                    log.error(errorMessage);
                    return callback(errorMessage);
                }
                if (response.statusCode !== 200) {
                    errorMessage = format('clearPatientUtil.clearPatient removePatientFromJds for jpid %s: unexpected response returned from JDS: %s', jpid, inspect((response) ? response.body : null));
                    log.error(errorMessage);
                    return callback(errorMessage);
                }

                log.debug('clearPatientUtil.clearPatient removePatientFromJds complete for jpid %s', jpid);
                callback();
            });
        }
    }, function(error) {
        callback(error);
    });
}

module.exports.clearPatient = clearPatient;
