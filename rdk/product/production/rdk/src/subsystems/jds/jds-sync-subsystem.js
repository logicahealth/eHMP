/*jslint node: true */
'use strict';

var _ = require('lodash');
var async = require('async');
var util = require('util');
var S = require('string');
var rdk = require('../../core/rdk');
var patientCache = rdk.patientCache;
var httpUtil = rdk.utils.http;
var nullchecker = require('../../utils/nullchecker');
var checkStatus = require('./jds-sync-check-status');
var jdsSyncConfig = require('./jds-sync-config');
var patientSearchResource = require('../../resources/patient-search/patient-search-resource');
var pidValidator = rdk.utils.pidValidator;

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.loadPatient = loadPatient;
module.exports.loadPatientPrioritized = loadPatientPrioritized;
module.exports.loadPatientForced = loadPatientForced;
module.exports.clearPatient = clearPatient;
module.exports.getPatientStatus = getPatientStatus;
module.exports.getPatientDataStatus = getPatientDataStatus;
module.exports.getPatientStatusDetail = getPatientStatusDetail;
module.exports.syncPatientDemographics = syncPatientDemographics;
module.exports.getOperationalStatus = getOperationalStatus;
module.exports.getPatient = getPatient;
module.exports.getPatientAllSites = getPatientAllSites;
module.exports.getJdsStatus = getJdsStatus;
module.exports._syncStatusResultProcessor = syncStatusResultProcessor;

function getSubsystemConfig(app) {
    return {
        healthcheck: {
            name: 'jdsSync',
            dependencies: ['authorization'],
            interval: 100000,
            check: function(callback) {
                var jdsConfig = {
                    timeout: 5000,
                    baseUrl: app.config.jdsServer.baseUrl,
                    url: '/ping',
                    logger: app.logger
                };

                httpUtil.get(jdsConfig, function(err) {
                    if (err) {
                        return callback(false);
                    }
                    callback(true);
                });
            }
        }
    };
}

function loadPatient(pid, immediate, req, callback) {
    var config = jdsSyncConfig.configureWithPidParam('loadPatient', pid, req);
    doLoad(config, pid, immediate, null, req, callback);
}

function loadPatientPrioritized(pid, prioritySite, req, callback) {
    var config = jdsSyncConfig.configureWithPidParam('loadPatient', pid, req);
    doLoad(config, pid, false, prioritySite, req, callback);
}

function loadPatientForced(pid, forcedSite, immediate, req, callback) {
    var config = jdsSyncConfig.configureWithPidParam('loadPatient', pid, req);
    jdsSyncConfig.addForcedParam(config, req, forcedSite);
    doLoad(config, pid, immediate, null, req, callback);
}

function clearPatient(pid, req, callback) {
    jdsSyncConfig.setupAudit(pid, req);
    async.waterfall([
        function(cb) {
            getPatientWithFallback(pid, req, cb);
        },
        function(patientResult, cb) {
            var usePid = getRealPid(pid, patientResult);
            if (usePid) {
                cb(null, usePid);
            } else {
                cb(404);
            }
        }
    ],
    function(err, usePid) {
        if (err) {
            return callback(err, createErrorResponse(err, 'pid '+pid+' not found.'));
        }
        //cache key synchonize-interceptor is initially set in the syncPatient function of synchonize.js interceptor
        patientCache.del('synchronize-interceptor' + pid);
        var config = jdsSyncConfig.getSyncConfig('clearPatient', req);
        jdsSyncConfig.addPidParam(config, req, pid);
        httpUtil.post(config, function(err, response, clearResult) {
            if (err) {
                req.logger.error(err);
                return callback(err);
            }
            if (nullchecker.isNullish(clearResult)) {
                req.logger.error(err);
                return callback(err);
            }

            if (response && 200 <= response.statusCode && response.statusCode <= 299) {
                waitForPatientClear(pid, usePid, req, callback);
            } else {
                callback(500, createErrorResponse(500, util.format('An error has interrupted the patient synchronization process. Please report this error to your local help desk or system administrator: Patient %s was not unsynced after a failed sync.', pid)));
            }
        });
    });
}

function getPatientStatus(pid, req, callback) {
    var config = jdsSyncConfig.configureWithPidParam('getPatientStatus', pid, req);
    req.logger.trace({config: config}, 'getPatientStatus');
    httpUtil.get(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}

function getPatientDataStatus(pid, req, callback) {
    getPatientStatus(pid, req, function(syncError, syncResult) {
        if (!_.isUndefined(syncResult.error) && syncResult.error.code === 404) {
            return callback(syncResult.error.code, syncResult);
        }
        if (!_.isUndefined((syncResult.data || {}).error) && syncResult.data.error.code === 404) {
            return callback(syncResult.data.error.code, syncResult.data);
        }
        if (nullchecker.isNotNullish(syncError)) {
            var syncStatus = (syncResult && syncResult.status) || 500;
            var data = (syncResult && syncResult.data) || syncError;
            return callback(syncStatus, createErrorResponse(syncStatus, data));
        }

        if (syncResult.status !== 200) {
            return callback(syncResult.status || 500, createErrorResponse(syncResult.status, syncResult.data));
        }
        var status = {};

        var vistaSites = [];
        _.each(req.app.config.vistaSites, function(val, name) {
            vistaSites.push(name);
        });

        var sites = checkStatus.getVistaSites(syncResult, req);
        if (sites.length > 0) {
            _.each(sites, function(site) {
                req.logger.debug(site);
                if (_.contains(vistaSites, site)) {
                    status.VISTA = status.VISTA || {};
                    status.VISTA[site] = checkStatus.getSiteSyncDataStatus(syncResult, site, req);
                    req.logger.debug(status);
                } else {
                    status[site] = checkStatus.getSiteSyncDataStatus(syncResult, site, req, req);
                    req.logger.debug(status);
                }
            });
        }
        status.allSites = checkStatus.isSyncCompleted(syncResult);
        return callback(undefined, {status: 200, data: status});
    });
}

function getPatientStatusDetail(pid, req, callback) {
    var config = jdsSyncConfig.configureWithPidInPath('getPatientStatusDetail', pid, req);
    jdsSyncConfig.addParam('detailed', 'true', config);
    httpUtil.get(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}

function syncPatientDemographics(payload, req, callback) {
    req.logger.debug('syncing patient with demographics: ' + JSON.stringify(payload));

    // Need to setup 'pidToUse' because the audit and the vx-sync sync status endpoint expect to see "pid=DOD;<edipi>", not "edipi=<edipi>".
    var pidToUse = undefined;
    if (payload.icn) {
        pidToUse = payload.icn;
    } else if (payload.edipi) {
        pidToUse = 'DOD;' + payload.edipi;
    }

    if (!pidToUse) {
        callback('ICN or EDIPI is required for syncing patients by demographics.');
        return;
    }
    req.logger.debug('using pid: ' + pidToUse);

    var config = jdsSyncConfig.configure('syncPatientDemographics', pidToUse, req);
    payload.pid = pidToUse;
    config.body = payload;
    httpUtil.post(config, function(loaderr, response, loadres) {
        if (nullchecker.isNullish(loadres)) {
            req.logger.error(loaderr);
            callback(500, createErrorResponse());
            return;
        }

        getPatientStatus(pidToUse, req, function(err, syncStatus) {
            if (syncStatus && syncStatus.status < 300) {
                syncStatus.status = 201;
            }
            callback(err, syncStatus);
        });
    });
}

function getOperationalStatus(site, req, callback) {
    var config = jdsSyncConfig.configure('getOperationalStatus', undefined, req);
    jdsSyncConfig.addSiteToPath(config, req, site);
    httpUtil.get(config, syncStatusResultProcessor.bind(null, null, callback, req));
}

function getPatient(pidOrIcn, req, callback) {
    req.logger.debug('jds-sync-subsystem.getPatient retrieving patient data for ' + pidOrIcn);

    var site = patientSearchResource.getSite(req.logger, 'jds-sync-subsystem.getPatient', pidOrIcn, req);
    if (site === null) {
        req.logger.error('jds-sync-subsystem.getPatient ERROR couldn\'t obtain site from session or request');
        callback(404, createErrorResponse());
    }

    var jdsResource;
    if (pidValidator.isIcn(pidOrIcn)) {
        req.logger.debug('jds-sync-subsystem.getPatient using icn');
        jdsResource = 'ICN';
    } else if (pidValidator.isSiteDfn(pidOrIcn)) {
        req.logger.debug('jds-sync-subsystem.getPatient using pid');
        jdsResource = 'PID';
    } else {
        req.logger.error('jds-sync-subsystem.getPatient pid or icn not detected in "' + pidOrIcn + '"');
        //Previously written system requires that this return an empty array rather than telling them they
        //have an error.
        return callback(null, {
            apiVersion: '1.0',
            data: [],
            status: 200
        });
    }

    patientSearchResource.callVxSyncPatientSearch(req.logger, 'jds-sync-subsystem.getPatient', req.app.config.vxSyncServer, req.app.config.jdsServer, site, jdsResource, pidOrIcn, function(error, data) {
        if (error) {
            req.logger.error('jds-sync-subsystem.getPatient...callVxSyncPatientSearch: ERROR ' + (typeof error === 'object' ? JSON.stringify(error, null, 2) : error));
            //Why are we not passing in the error as the first parameter here?
            //The previously written unit tests expect the code to return errors this way - it would break the UI to change this - yuck.
            return callback(null, error);
        }

        //req.logger.debug('jds-sync-subsystem.getPatient...callVxSyncPatientSearch: data=' + JSON.stringify(data, null, 2));

        //When the data was retrieved from JDS, the http call wrapped it again so the UI expects it double wrapped.
        var retvalue = {
            apiVersion: '1.0',
            data: data,
            status: 200
        };

        callback(null, retvalue);
    });
}

function getPatientAllSites(pid, req, callback) {
    var config = jdsSyncConfig.configureWithPidInPath('getPatientByPidAllSites', pid, req);
    httpUtil.get(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}

function getJdsStatus(pid, req, callback) {
    var config = jdsSyncConfig.configure('getJdsStatus', pid, req);
    jdsSyncConfig.replacePidInPath(config, req, pid);
    httpUtil.get(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}

// Internal functions:

function doLoad(config, pid, immediate, prioritySite, req, callback) {
    getPatientAndStatus(pid, req, function(err, result) {
        var syncStatus = result.status;
        if (_.isArray(syncStatus) && syncStatus.length > 0) {
            syncStatus = syncStatus[0];
        }
        var usePid = getRealPid(pid, result.patient);
        if (nullchecker.isNullish(syncStatus) || nullchecker.isNullish(usePid)) {
            req.logger.error('Failed to get pid from patient.');
            return callback(err || 404, createErrorResponse(404, noSiteMessage));
        }
        req.logger.info({config: config}, 'Calling the sync endpoint');
        httpUtil.post(config, function(loaderr, response, loadres) {
            if (loaderr) {
                req.logger.error(loaderr);
                return callback(500, createErrorResponse());
            }
            if (nullchecker.isNullish(loadres)) {
                req.logger.error(loaderr);
                return callback(500, createErrorResponse());
            }

            req.logger.debug('return immediately? '+ immediate);
            if (immediate) {
                req.logger.debug('Sending response immediately after starting sync (not wating for sync complete)');
                return getPatientStatus(pid, req, function(err, syncStatus) {
                    if (nullchecker.isNullish(syncStatus)) {
                        req.logger.error(err, 'Sync request error');
                        return callback(500, createErrorResponse());
                    }
                    syncStatus.status = 201;
                    req.logger.info('Sync request acknowledged');
                    return callback(err, syncStatus);
                });
            }

            req.logger.trace(loadres);

            waitForPatientLoad(pid, usePid, prioritySite, req, callback);
        });
    });
}

function waitForPatientLoad(pid, usePid, prioritySite, req, callback) {
    var syncStatus,
        toLoop = true,
        startTime = process.hrtime();
    async.doWhilst(
        function (nxt) {//Action
            getPatientAndStatus(pid, req, function (err, syncResult) {
                syncStatus = syncResult.status;
                if (_.isArray(syncStatus) && syncStatus.length > 0) {
                    syncStatus = syncStatus[0];
                }
                var patient = syncResult.patient;

                if (nullchecker.isNullish(syncStatus) || nullchecker.isNullish(patient)) {
                    toLoop = exitDoWhilst(err, req, nxt);
                    return;
                }

                req.logger.trace(_.keys(syncStatus));

                if (!containsPid(patient)) {
                    req.logger.debug('%s NOT a valid patient - aborting!', patient);
                    toLoop = exitDoWhilst(404, req, nxt);
                    return;
                }

                toLoop = !isSyncComplete(syncStatus, prioritySite, usePid, req);

                breakOrContinue(toLoop, startTime, pid, req, nxt);
            });
        },
        function () { // Loop test
            return toLoop === true;
        },
        function (err) { // Finished
            req.logger.debug('checking sync data');
            if (_.isUndefined(err) && _.isUndefined(syncStatus.error)) {
                req.logger.debug('no error in syncStatus');
                syncStatus.status = 201;
                callback(err, syncStatus);
            } else if (err === 404) {
                callback(404, createErrorResponse(404, noSiteMessage));
            } else {
                callback(500, createErrorResponse());
            }
        }
    );
}

function isSyncComplete(syncStatus, prioritySite, pid, req) {
    if (!_.isUndefined(syncStatus) && !_.isUndefined(syncStatus.status) && syncStatus.status !== 404) {
        var sites;
        if (prioritySite === null) {
            req.logger.debug('calling checkStatus.getVistaSites');
            sites = checkStatus.getVistaSites(syncStatus, req);
        } else if (!_.isUndefined(getSiteFromPid(pid))) {
            sites = [getSiteFromPid(pid)];
        } else {
            sites = prioritySite;
        }
        req.logger.debug('Checking sync status for the following sites: '+sites);

        var syncComp = checkStatus.isSyncMarkedCompleted(syncStatus, sites, req);

        if (!syncComp) { // check to make sure all sites are sync completed
            syncComp = checkStatus.isSyncCompleted(syncStatus);
        }
        if (syncComp) {
            req.logger.debug('Sync Complete');
            return true;
        } else {
            req.logger.debug('Sync NOT Complete');
            return false;
        }
    }
}

function getSiteFromPid(pid) {
    if (nullchecker.isNotNullish(pid) && S(pid).contains(';')) {
        return pid.split(';')[0];
    }
    return undefined;
}

function exitDoWhilst(err, req, nxt) {
    req.logger.error(err);
    nxt(err);
    return false;
}

function breakOrContinue(toLoop, startTime, pid, req, nxt) {
    var currentTime = process.hrtime(startTime);
    var totalTime = (currentTime[0]*1e9+currentTime[1])/1e6; // calculate how long since load started in milliseconds

    if (!toLoop) {
        req.logger.info({pid: pid, totalTime: totalTime}, 'Sync complete');
        nxt();
        return;
    }

    var settings = req.app.config.jdsSync.settings;
    req.logger.debug(pid+' sync time taken so far: '+totalTime);
    if (totalTime > settings.timeoutMillis) {
        req.logger.error(pid+' is taking too long to sync. Waited (milliseconds): '+totalTime+' before giving up and return error 500');
        return exitDoWhilst(500, req, nxt);
    }

    setTimeout(nxt, settings.waitMillis);
}

function getPatientWithFallback(pid, req, callback) {
    getPatient(pid, req, function(error, resp) {
        // If there is a 'data' block but no 'items' then
        // try getPatientAllSites
        if (resp && resp.data && resp.data.data && resp.data.data.totalItems <= 0) {
            getPatientAllSites(pid, req, function(error, resp){
                if (error && error.code === 'ECONNRESET') {
                    //JDS is not ready, issue 404
                    callback(404, createErrorResponse(404, noSiteMessage));
                } else {
                    callback(error, resp);
                }
            });
        } else {
            callback(error, resp);
        }
    });
}

function getPatientAndStatus(pid, req, callback) {
    async.series({
        patient: function(cb) {
            getPatientWithFallback(pid, req, cb);
        },
        status: function (cb) {
            getPatientStatus(pid, req, cb);
        }
    }, callback);
}

function isIcn(pid) {
    return nullchecker.isNotNullish(pid) && !S(pid).contains(';');
}

function containsPid(patient) {
    return patient && patient.data && patient.data.data && patient.data.data.totalItems > 0;
}

function getRealPid(pid, patientResult) {
    if (containsPid(patientResult)) {
        if (isIcn(pid)) {
            return patientResult.data.data.items[0].pid;
        } else {
            return pid;
        }
    }
}

function waitForPatientClear(pid, usePid, req, callback) {
    var toLoop = true,
        startTime = process.hrtime();
    async.doWhilst(
        function (nxt) {//Action
            getPatientAndStatus(pid, req, function (err, currentResult) {
                if (nullchecker.isNullish(currentResult.status) || nullchecker.isNullish(currentResult.patient)) {
                    toLoop = exitDoWhilst(err, req, nxt);
                } else {
                    req.logger.debug(currentResult.status);
                    req.logger.debug(currentResult.patient);
                    if (_.isArray(currentResult.status) && currentResult.status.length > 0) {
                        currentResult.status = currentResult.status[0];
                    }
                    if (currentResult.status.status === 404 && currentResult.patient.status === 200) {
                        toLoop = false;
                    }
                }
            });

            breakOrContinue(toLoop, startTime, pid, req, nxt);
        },
        function () { // Loop test
            return toLoop === true;
        },
        function (err) { // Finished
            if (err) {
                callback(500, createErrorResponse());
            } else {
                callback(null, createStandardResponse(200, 'pid '+pid+' unsynced.'));
            }
        }
    );
}

function syncStatusResultProcessor(pid, callback, req, error, response, data) {
    if (error) {
        return callback(error, createErrorResponse(500, data));
    }
    if(!response) {
        return callback(error, createErrorResponse(500, data));
    }
    if (response.statusCode === 404) {
        return callback(error, createErrorResponse(404, util.format('pid %s is unsynced', pid)));
    }

    if (response.statusCode === 200 || response.statusCode === 202) {
        req.logger.debug({syncResponse:response},'sync status result');
        return callback(error, {
            status: response.statusCode,
            data: data
        });
    }
    return callback(error, createErrorResponse(response.statusCode, data));
}

function createErrorResponse(status, data) {
    status = status || 500;
    if (data && _.isEmpty(data)) {
        data = undefined;
    }
    if (_.isObject(data)) {
        return {
            status: status,
            data: data
        };
    }
    return {
        status: _.isNumber(status) ? status : 500,
        data: {
            error: {
                code: status,
                message: data || 'There was an error processing your request. The error has been logged.'
            }
        }
    };
}

function createStandardResponse(status, message) {
    return {
        status: status,
        data: {
            data: {
                code: status,
                message: message
            }
        }
    };
}

var noSiteMessage = 'This patient\'s record is not yet accessible. Please try again in a few minutes. If it is still not accessible, please contact your HIMS representative and have the patient loaded into your local VistA.';
