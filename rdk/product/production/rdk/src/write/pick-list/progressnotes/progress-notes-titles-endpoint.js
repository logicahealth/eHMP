'use strict';
var _ = require('lodash');
var querystring = require('querystring');
var jdsFilter = require('jds-filter');
var nullUtil = require('../../core/null-utils');
var async = require('async');
var validate = require('./../utils/validation-util');
var rdk = require('../../../core/rdk');
var http = rdk.utils.http;

var interceptors = {
    operationalDataCheck: false,
    synchronize: false
};

var asuProcess = require('../../../subsystems/asu/asu-process');

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
        'url': '/asu/rules/getMultiDocPermissions'
    };

    userClassUid = _.isArray(userClassUid) ? userClassUid : [userClassUid];
    roleNames = _.isArray(roleNames) ? roleNames : ((roleNames === null || roleNames === undefined) ? [] : [roleNames]);
    actionNames = _.isArray(actionNames) ? actionNames : [actionNames];
    logger.debug('progress-notes-titles-endpoint.asuFilter userClassUid=\'' + userClassUid + '\', roleNames=\'' + roleNames + '\', docStatus=\'' + docStatus + '\', actionNames=\'' + actionNames + '\', site=\'' + site + '\'');

    httpConfig.baseUrl = configuration.asuServer.baseUrl;
    httpConfig.timeout = configuration.asuServer.timeout;
    httpConfig.logger = logger;

    var jsonParams = [];
    var httpBody = {
        'documents': jsonParams
    };

    //Iterate through all of the progress notes we got back from the RPC.
    _.each(progressNotes, function(progressNoteTitle) {
        jsonParams.push({
            'userClassUids': userClassUid,
            'docDefUid': progressNoteTitle.documentDefUid,
            'docStatus': docStatus,
            'roleNames': roleNames,
            'actionNames': actionNames
        });
    });

    //Call ASU Rules on each one of them and populate a flag saying whether it was approved or not.
    //console.log(JSON.stringify(jsonParams, null, 2));
    asuProcess.evaluate(httpBody, null, httpConfig, null, logger, function(error, asuResponses) {
        if (error) {
            logger.error({
                error: error
            }, 'progress-notes-titles-endpoint.asuFilter progress-notes-titles-endpoint ERROR asuProcess.evaluate error occurred');
            return finished('progress-notes-titles-endpoint.asuFilter progress-notes-titles-endpoint ERROR asuProcess.evaluate error occurred: ' + error);
        }
        if (typeof asuResponses !== 'object') {
            logger.error('progress-notes-titles-endpoint.asuFilter progress-notes-titles-endpoint ERROR asuProcess.evaluate did not return a JSON String: ' + asuResponses);
            return finished('progress-notes-titles-endpoint.asuFilter progress-notes-titles-endpoint asuProcess.evaluate did not return a JSON String: ' + asuResponses);
        }

        if (asuResponses.length !== progressNotes.length) {
            logger.error('progress-notes-titles-endpoint.asuFilter progress-notes-titles-endpoint ERROR asuProcess.evaluate asuResponses length does not match progressNotes length');
            return finished('progress-notes-titles-endpoint.asuFilter progress-notes-titles-endpoint ERROR asuProcess.evaluate asuResponses length does not match progressNotes length');
        }

        var asuApproved = false;
        var myErrorMessage;

        _.each(asuResponses, function(asuResponse, index) {
            if (asuResponse[0].hasPermission === false) {
                asuApproved = false;
                progressNotes[index].asuApproved = asuApproved;
            } else if (asuResponse[0].hasPermission === true) {
                asuApproved = true;
                progressNotes[index].asuApproved = asuApproved;
            } else {
                myErrorMessage = 'progress-notes-titles-endpoint.asuFilter ERROR asuProcess.evaluate.asuResponse didn\'t include a hasPermission: ' + JSON.stringify(asuResponse);
                asuApproved = undefined;
                progressNotes[index].asuApproved = asuApproved;
                return false;
            }
        });

        if (myErrorMessage) {
            return finished(myErrorMessage);
        }

        //Now that we know what was approved (flag that was set), filter out anything that isn't approved.
        async.filterSeries(progressNotes, function(item, callback) {
                logger.debug('progress-notes-titles-endpoint.asuFilter asu approved for docDefUid ' + item.documentDefUid + ' is: ' + item.asuApproved);
                if (item.asuApproved === true) {
                    async.setImmediate(function() {
                        return callback(true);
                    });
                } else {
                    async.setImmediate(function() {
                        return callback(false);
                    });
                }
            },
            function(fieldResults) {
                logger.debug('progress-notes-titles-endpoint.asuFilter FINISHED FILTERING asu approved');
                return finished(error, fieldResults);
            });
    });
}
module.exports._asuFilter = asuFilter;

module.exports.getResourceConfig = function( /*app*/ ) {
    var resourceConfig = [{
        name: 'progress-notes-titles-asu-filtered',
        path: '',
        interceptors: interceptors,
        requiredPermissions: ['sign-note'],
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
        } else {
            res.status(500).rdkSend(error);
        }
    } else {
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

function fetchProgressNotes(req, res) {
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

    getDefaultUserClass(req, function(errorDUC, response, body) {
        var errorStatus = (response || {}).statusCode || 500;
        if (errorDUC) {
            req.logger.debug({
                error: errorDUC
            }, 'progress-notes-titles-endpoint...getDefaultUserClass ERROR Could not obtain default user class');
            return serverSend(res, 'progress-notes-titles-endpoint...getDefaultUserClass ERROR Could not obtain default user class: ' + errorDUC, null, errorStatus);
        }
        try {
            req.logger.debug({
                parsing: body
            });
            body = JSON.parse(body);
        } catch (e) {
            req.logger.error({
                error: e
            }, 'progress-notes-titles-endpoint...getDefaultUserClass ERROR parsing data');
            return serverSend(res, 'progress-notes-titles-endpoint...getDefaultUserClass ERROR parsing data: ' + e, null, errorStatus);
        }

        if (body && body.data && body.data.items) {
            _.each(body.data.items, function(item) {
                userClassUid.push(item.uid);
            });
        }

        if (roleNames) {
            roleNames = roleNames.split(',');
        }
        if (actionNames) {
            actionNames = actionNames.split(',');
        }

        getDocDef(req, function(err, retValue) {
            if (err) {
                req.logger.error({
                    error: err
                }, 'progress-notes-titles-endpoint...jds call ERROR');

                return serverSend(res, err);
            }

            asuFilter(req.logger, req.app.config, userClassUid, roleNames, docStatus, actionNames, site, retValue, function(error, progressNotes) {
                if (err) {
                    return serverSend(res, err);
                }
                return serverSend(res, null, progressNotes);
            });
        });
    });
}

function getDocDef(req, callback) {
    var site = req.session.user.site;
    var filter = [
        'and', ['eq', 'statusName', 'ACTIVE'],
        ['like', 'uid', 'urn:va:doc-def:' + site + ':%'],
        ['ne', 'typeName', 'OBJECT'],
        ['ne', 'typeName', 'COMPONENT']
    ];
    var filterString = jdsFilter.build(filter);
    var queryObject = {
        filter: filterString
    };

    var options = _.extend({}, req.app.config.jdsServer, {
        url: '/data/find/doc-def?' + querystring.stringify(queryObject),
        logger: req.logger,
        json: true,
        timeout: 120000
    });

    http.get(options, function(err, response, responseBody) {
        if (_.has(responseBody, 'error')) {
            return callback(new Error(responseBody.error), responseBody, response.statusCode);
        }
        if (!_.has(responseBody, 'data')) {
            return callback(new Error('Missing data in JDS response.'), responseBody, response.statusCode);
        }
        if (_.isEmpty(_.get(responseBody, 'data.items'))) {
            return callback(new Error('No items in JDS response.'), responseBody, response.statusCode);
        }
        return parseTitles(req, responseBody.data.items, callback);
    });
}

function parseTitles(req, data, callback) {
    var retVal = [];
    var notesClass = _.find(data, 'name', 'PROGRESS NOTES');
    var whiteList = _.filter(notesClass.item, function(item) {
        return item.name !== 'CONSULTS';
    });
    whiteList = whiteList.concat(_.find(data, 'name', 'ADDENDUM').item);

    var i = 0;
    while (i < whiteList.length) {
        var item = _.find(data, 'uid', whiteList[i].uid);
        if (item && item.typeName === 'TITLE') {
            retVal.push({
                documentDefUid: item.uid,
                name: item.name,
                localTitle: item.displayName
            });
        } else if (item && item.item) {
            whiteList = whiteList.concat(item.item);
        } //else, we couldn't find it. this doc-def is inactive.
        i++;
    }
    return callback(null, retVal);
}
