'use strict';
var _ = require('lodash');
var nullUtil = require('../../core/null-utils');
var pickListInMemoryRpcCall = require('../pick-list-in-memory-rpc-call');
var async = require('async');
var validate = require('./../utils/validation-util');
var pickListConfig = require('../config/pick-list-config-in-memory-rpc-call').pickListConfig;
var dbList = require('../pick-list-db');
var rdk = require('../../../core/rdk');
var http = rdk.utils.http;

var interceptors = {
    operationalDataCheck: false,
    synchronize: false
};

var asuProcess = require('../../../subsystems/asu/asu-process');
var loading = [];



/**
 * If "userClassUid && roleNames && docStatus && actionNames && site" do NOT exist, this just returns.
 * Otherwise, it calls asu rules for each of the items in the array and then filters out those which do not belong.
 *
 * @param logger
 * @param progressNotes
 * @param finished
 */
function asuFilter(logger, configuration, userClassUid, roleNames, docStatus, actionNames, site, progressNotes, finished) {
    var httpConfig = {
        'timeout': 30000,
        'url': '/asu/rules/getDocPermissions',
        'port': 9000
    };

    userClassUid = _.isArray(userClassUid) ? userClassUid : [userClassUid];
    var docDefUid = 'urn:va:doc-def:' + site + ':';
    roleNames = _.isArray(roleNames) ? roleNames : ((roleNames === null || roleNames === undefined) ? [] : [roleNames]);
    actionNames = _.isArray(actionNames) ? actionNames : [actionNames];
    logger.debug('progress-notes-titles-endpoint.asuFilter userClassUid=\'' + userClassUid + '\', roleNames=\'' + roleNames + '\', docStatus=\'' + docStatus + '\', actionNames=\'' + actionNames + '\', site=\'' + site + '\'');

    httpConfig.baseUrl = configuration.vxSyncServer.baseUrl.replace(/:\d{4}$/, ':' + httpConfig.port);
    httpConfig.logger = logger;

    //Iterate through all of the progress notes we got back from the RPC.
    async.mapSeries(progressNotes, function(progressNote, callback) {
        var jsonParams = {
            'userClassUids': userClassUid,
            'docDefUid': docDefUid + progressNote.ien,
            'docStatus': docStatus,
            'roleNames': roleNames,
            'actionNames': actionNames
        };

        //Call ASU Rules on each one of them and populate a flag saying whether it was approved or not.
        //console.log(JSON.stringify(jsonParams, null, 2));
        asuProcess.evaluate(jsonParams, null, httpConfig, null, logger, function (error, asuResponses) {
            if (error) {
                logger.error('progress-notes-titles-endpoint.asuFilter progress-notes-titles-endpoint ERROR asuProcess.evaluate error occurred: ' + error);
                return callback('progress-notes-titles-endpoint.asuFilter progress-notes-titles-endpoint ERROR asuProcess.evaluate error occurred: ' + error);
            }
            if (typeof asuResponses !== 'object') {
                logger.error('progress-notes-titles-endpoint.asuFilter progress-notes-titles-endpoint ERROR asuProcess.evaluate did not return a JSON String: ' + asuResponses);
                return callback('progress-notes-titles-endpoint.asuFilter progress-notes-titles-endpoint asuProcess.evaluate did not return a JSON String: ' + asuResponses);
            }
            //logger.debug(asuResponses);
            var asuApproved = false;
            _.each(asuResponses, function (asuResponse) {
                if (asuResponse.hasPermission === false) {
                    asuApproved = false;
                    return false;
                }
                else if (asuResponse.hasPermission === true) {
                    asuApproved = true;
                }
                else {
                    logger.error('progress-notes-titles-endpoint.asuFilter ERROR asuProcess.evaluate.asuResponse didn\'t include a hasPermission: ' + asuResponses);
                    return callback('progress-notes-titles-endpoint.asuFilter ERROR asuProcess.evaluate.asuResponse didn\'t include a hasPermission: ' + asuResponse);
                }
            });

            //progressNote.userClassUid = userClassUid;
            //progressNote.docDefUid = 'urn:va:doc-def:' + site + ':' + progressNote.ien;
            //progressNote.docStatus = docStatus;
            //progressNote.roleNames = roleNames;
            //progressNote.actionNames = actionNames;
            //
            //progressNote.response = asuResponses;
            progressNote.asuApproved = asuApproved;
            callback();
        });
    }, function(err) {
        logger.debug('progress-notes-titles-endpoint.asuFilter asu approved finished calling asu');
        if (err) {
            logger.error('progress-notes-titles-endpoint.asuFilter ERROR asu error occurred: ' + err);
            return finished(err);
        }

        //Now that we know what was approved (flag that was set), filter out anything that isn't approved.
        async.filterSeries(progressNotes, function(item, callback) {
                logger.debug('progress-notes-titles-endpoint.asuFilter asu approved for ien ' + item.ien + ' is: ' + item.asuApproved);
                if (item.asuApproved === true) {
                    async.setImmediate(function () {
                        return callback(true);
                    });
                }
                else {
                    async.setImmediate(function () {
                        return callback(false);
                    });
                }
            },
            function(fieldResults) {
                logger.debug('progress-notes-titles-endpoint.asuFilter FINISHED FILTERING asu approved');
                finished(err, fieldResults);
            });
    });
}

module.exports.getResourceConfig = function(/*app*/) {
    var resourceConfig = [{
        name: 'progress-notes-titles-asu-filtered',
        path: '',
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false,
        get: fetchProgressNotes
    }];

    return resourceConfig;
};

var serverSend = function(res, error, json, statusCode, headers) {
    if (error) {
        if (!nullUtil.isNullish(statusCode)) {
            if (!nullUtil.isNullish(headers)) {
                _.each(headers, function(value, key) {
                    res.setHeader(key, value);
                });
            }
            res.status(statusCode).rdkSend(error);
        }
        else {
            res.status(500).rdkSend(error);
        }
    }
    else {
        res.status(200).rdkSend(json);
    }
};


function getDefaultUserClass(req, callback) {
    req.audit.logCategory = 'RETRIEVE';

    var options = _.extend({}, req.app.config.jdsServer, {
        url: '/data/find/asu-class?filter=eq("name","USER")',
        logger: req.logger,
        timeout: 120000
    });
    http.get(options, callback);
}

function updateDatabase(req, query, progressNotes, error, callback) {
    dbList.updateDatabase(req.logger, query, new Date(), progressNotes, function (dbError, dbDataUpdated) {
        if (dbError) {
            req.logger.error('progress-notes-titles-endpoint...updateDatabase ERROR from asuFilter: ' + error);
            return callback(dbError);
        }

        req.logger.debug('progress-notes-titles-endpoint.fetchProgressNotes SUCCESSFULLY UPDATED DB');
        loading.splice(loading.indexOf(JSON.stringify(query)), 1); //Remove this entry from our list of things being loaded.
        return callback(null, dbDataUpdated);
    });
}

function asuFilterAndUpdateDB(req, userClassUid, roleNames, docStatus, actionNames, site, retValue, query, callback) {
    req.logger.debug('progress-notes-titles-endpoint...asuFilterAndUpdateDB');

    asuFilter(req.logger, req.app.config, userClassUid, roleNames, docStatus, actionNames, site, retValue, function (error, progressNotes) {
        if (error) {
            req.logger.error('progress-notes-titles-endpoint...asuFilter ERROR from asuFilter: ' + error);
            return callback(error);
        }

        req.logger.debug('progress-notes-titles-endpoint...asuFilter SUCCESSFULLY FILTERED');

        return updateDatabase(req, query, progressNotes, error, callback);
    });
}
function fetchProgressNotes(req, res) {
    var type = 'progress-notes-titles-asu-filtered';
    var site = req.session.user.site;
    var roleNames = req.param('roleNames');
    var docStatus = req.param('docStatus');
    var actionNames = req.param('actionNames');

    if (validate.isStringNullish(docStatus)) {
        req.logger.debug('progress-notes-titles-endpoint.fetchProgressNotes docStatus cannot be empty');
        return serverSend(res, 'docStatus cannot be empty');
    }
    if (validate.isStringNullish(actionNames)) {
        req.logger.debug('progress-notes-titles-endpoint.fetchProgressNotes actionNames cannot be empty');
        return serverSend(res, 'actionNames cannot be empty');
    }

    var userDetails = req.session.user;
    var userClassUid = _.pluck(userDetails.vistaUserClass, 'uid');

    if (!(docStatus && actionNames)) {
        req.logger.debug('progress-notes-titles-endpoint.fetchProgressNotes docStatus & actionNames are required');
        return serverSend(res, 'docStatus & actionNames are required');
    }

    var i = _.indexOf(_.pluck(pickListConfig, 'name'), 'progress-notes-titles');
    if (i === -1) {
        req.logger.debug('progress-notes-titles-endpoint.fetchProgressNotes Couldn\'t find progress-notes-titles in the configuration');
        return serverSend(res, 'Couldn\'t find ' + type + ' in the configuration');
    }

    getDefaultUserClass(req,function(errorDUC, response, body) {
        var errorStatus = (response || {}).statusCode || 500;
        if (errorDUC) {
            req.logger.debug('progress-notes-titles-endpoint...getDefaultUserClass ERROR Could not obtain default user class: ' + errorDUC);
            return serverSend(res, 'progress-notes-titles-endpoint...getDefaultUserClass ERROR Could not obtain default user class: ' + errorDUC, null, errorStatus);
        }
        try {
            req.logger.debug({parsing: body});
            body = JSON.parse(body);
        } catch (e) {
            req.logger.error('progress-notes-titles-endpoint...getDefaultUserClass ERROR parsing data: ' + e);
            return serverSend(res, 'progress-notes-titles-endpoint...getDefaultUserClass ERROR parsing data: ' + e, null, errorStatus);
        }

        if (body && body.data && body.data.items) {
            _.each(body.data.items, function (item) {
                userClassUid.push(item.uid);
            });
        }


        var query = {
            'pickList': type,
            'site': site,
            'docStatus': docStatus,
            'actionNames': actionNames,
            'userClassUid': userClassUid.join('_')
        };
        if (roleNames) {
            query.roleNames = roleNames;
        }

        if (roleNames) {
            roleNames = roleNames.split(',');
        }
        if (actionNames) {
            actionNames = actionNames.split(',');
        }



        dbList.retrieveDataFromDB(req.logger, pickListConfig[i].asuDataNeedsRefreshAfterMinutes, query, function(errorDB, dbData) {
            if (errorDB) {
                req.logger.debug('progress-notes-titles-endpoint...retrieveDataFromDB Data didn\'t exist in db yet: ' + errorDB);
                return serverSend(res, errorDB);
            }



            if (_.includes(loading, JSON.stringify(query))) {
                req.logger.info('progress-notes-titles-endpoint...retrieveDataFromDB: Pick list (progress-notes-titles-asu-filtered) is still being retrieved.  Try again after \'' + pickListConfig[i].asuLargePickListRetry + '\' seconds.');
                return serverSend(res, 'Pick list (progress-notes-titles-asu-filtered) is still being retrieved.  See Retry-After seconds (in the header) for the length of time to wait.', null, 202, {'Retry-After': pickListConfig[i].asuLargePickListRetry});
            }

            if (dbData.status === dbList.REFRESH_STATE_NORMAL) {
                return serverSend(res, null, dbData);
            }

            if (dbData.status === dbList.REFRESH_STATE_STALE) {
                //No return statement as after notifying the user we want to execute the steps below.
                serverSend(res, null, dbData);
            }

            pickListInMemoryRpcCall.inMemoryRpcCall(req, site, 'progress-notes-titles', function(err, retValue, statusCode, headers) {
                if (err) {
                    req.logger.error('progress-notes-titles-endpoint...inMemoryRpcCall ERROR: ' + err);

                    return serverSend(res, err);
                }

                asuFilterAndUpdateDB(req, userClassUid, roleNames, docStatus, actionNames, site, retValue, query, function(err, data) {
                    if (err) {
                        return serverSend(res, err);
                    }
                    return serverSend(res, null, data);
                });
            });
        });
    });
}
