'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var httpUtil = rdk.utils.http;
var nullChecker = require('../../utils/nullchecker');
var uds = require('./user-defined-screens-resource');
var dd = require('drilldown');
var nullchecker = rdk.utils.nullchecker;

var USER_SCREENS_CONFIG = 'UserScreensConfig';

var interceptors = {
    operationalDataCheck: false,
    synchronize: false
};
var permissions = [];
var healthcheck = {
    dependencies: ['jdsSync']
};

function getResourceConfig() {
    return [{
        name: 'user-defined-sort',
        path: '',
        post: createSorting,
        interceptors: interceptors,
        healthcheck: healthcheck,
        requiredPermissions: permissions,
        isPatientCentric: false
    }, {
        name: 'user-defined-sort',
        path: '',
        delete: removeSort,
        interceptors: interceptors,
        healthcheck: healthcheck,
        requiredPermissions: permissions,
        isPatientCentric: false
    }];
}

function createSorting(req, res) {
    req.audit.dataDomain = 'Sorting';
    req.audit.logCategory = 'UDS';
    req.audit.authuser = '-';

    var input = req.body;

    // Check for required data
    var inputCheck = verifyInput(input);

    if (!inputCheck.valid) {
        req.logger.error(inputCheck.errMsg);
        res.status(rdk.httpstatus.internal_server_error).rdkSend(inputCheck.errMsg);
        return;
    }

    var screenId = createScreenIdFromRequest(req, USER_SCREENS_CONFIG);

    //Get UserScreensConfig and update with new or updated graphs
    uds.getScreenData(screenId, req, function(err, data) {
        req.logger.debug('getting data in createStackedGraph for screenID: ' + screenId + ' and data returned is this: ' + data);
        if (err) {
            req.logger.error('Unable to save custom filter due to error retrieving UserScreensConfig data');
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        } else {
            var udsData = {};
            var userDefinedSortData = [];
            var count;
            var sortId = req.param('id');
            var sortData = {};
            var found;

            userDefinedSortData = dd(data)('userDefinedSorts').val;

            if(nullchecker.isNotNullish(userDefinedSortData)) {
                for (count = 0; count < userDefinedSortData.length; count++) {
                    if (userDefinedSortData[count].id === sortId) {
                        sortData = userDefinedSortData[count];
                        count = userDefinedSortData.length;
                        found = true;
                        sortData = processDataForCreate(sortId, input, sortData);
                    }
                }

                if(!found) {
                    sortData = processDataForCreate(sortId, input, sortData);
                    userDefinedSortData = userDefinedSortData.concat(sortData);
                }
            } else {
                userDefinedSortData = [];
                sortData = processDataForCreate(sortId, input, sortData);
                userDefinedSortData.push(sortData);
            }

            data.userDefinedSorts = userDefinedSortData;

            udsData = data;

            //The UI is coded to expect strings, store it as such
            var content = JSON.stringify(udsData);

            req.logger.debug('Inside userDefinedFilters createFilter filter data before post: ' + JSON.stringify(content));

            postSortData(data, req, function(err) {
                if (err) {
                    req.logger.error(err);
                    res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
                } else {
                    res.status(rdk.httpstatus.ok).rdkSend(data);
                }
            });
        }
    });

}

function verifyInput(input) {
    var retObj = {
        'valid': true
    };
    retObj.errMsg = '';
    if (nullChecker.isNullish(input.instanceId)) {
        retObj.errMsg += 'The applet instanceId is required.\n';
        retObj.valid = false;
    }
    if (nullChecker.isNullish(input.keyField)) {
        retObj.errMsg += 'The applet keyField is required.\n';
        retObj.valid = false;
    }

    if (nullChecker.isNullish(input.fieldValue)) {
        retObj.errMsg += 'fieldValue is required.\n';
        retObj.valid = false;
    }

    return retObj;
}

function processDataForCreate(sortId, input, data) {
    //look in data for sorting information for this applet
    if (!data.hasOwnProperty('id')) {
        data.id = sortId;
    }

    if (!data.hasOwnProperty('applets')) {
        data.applets = [];
    }

    var appletIndex = -1;
    var matchedApplet = _.find(data.applets, function(applet) {
        appletIndex++;
        if (applet && applet.hasOwnProperty('instanceId')) {
            if (applet.instanceId === input.instanceId) {
                return true;
            }
        }
        return false;
    });

    if (matchedApplet && matchedApplet.hasOwnProperty('orderSequence')) {

        //remove the value if it is already exists in orderSequence
        matchedApplet.orderSequence = _.without(matchedApplet.orderSequence, input.fieldValue);

        if (nullChecker.isNullish(input.orderAfter)) {
            data.applets[appletIndex].orderSequence.unshift(input.fieldValue);
        } else {
            var prevItemIndex = _.indexOf(data.applets[appletIndex].orderSequence, input.orderAfter);
            if (prevItemIndex !== -1) {
                data.applets[appletIndex].orderSequence.splice(prevItemIndex + 1, 0, input.fieldValue);
            } else {
                data.applets[appletIndex].orderSequence.unshift(input.fieldValue);
            }
        }

    } else {
        //no matching applet id
        data.applets.push({
            instanceId: input.instanceId,
            keyField: input.keyField,
            orderSequence: [input.fieldValue]
        });
    }

    return data;
}

//keep the below comment, as JSHint incorrectly believe this function is never used
// due to 'delete' being a reserved word in JS but also an HTTP verb
/*exported removeSort */
function removeSort(req, res) {
    req.audit.dataDomain = 'Sort';
    req.audit.logCategory = 'UDS';
    req.audit.authuser = '-';
    var userDefinedSortData = [];

    //fail fast for missing params
    var instanceId = getInstanceIdParameter(req);
    if (!instanceId) {
        var idErr = new Error('Unable to find instance ID parameter');
        req.logger.error(idErr);
        return res.status(rdk.httpstatus.internal_server_error).rdkSend(idErr);
    }

    var sortId = req.param('id');

    var screenId = createScreenIdFromRequest(req, USER_SCREENS_CONFIG);

    //check if sort data for this workspace already exists

    uds.getScreenData(screenId, req, function(err, data) {
        if (err) {
            req.logger.error('Unable to delete custom filter due to error retrieving existing filters');
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        userDefinedSortData = dd(data)('userDefinedSorts').val;
        var sortData = {};
        var count = 0;

        for (count = 0; count < userDefinedSortData.length; count++) {
            if (userDefinedSortData[count].id === sortId) {
                sortData = userDefinedSortData[count];
                break;
            }
        }

        var appletIndex = -1;
        var matchedApplet = _.find(sortData.applets, function(applet) {
            appletIndex++;
            if (applet && applet.hasOwnProperty('instanceId')) {
                if (applet.instanceId === instanceId) {
                    return true;
                }
            }
            return false;
        });

        if (matchedApplet) {
            sortData.applets.splice(appletIndex, 1);

            //delete entire workspace sort definition if no applets remain
            if(sortData.applets.length === 0) {
                data.userDefinedSorts.splice(count, 1);
            }

            postSortData(data, req, function(err) {
                if (err) {
                    req.logger.error(err);
                    res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
                } else {
                    res.status(rdk.httpstatus.ok).rdkSend(data);
                }
            });
        } else {
            //no matching applet id
            err = new Error('Unable to find stacked graph data with this instanceid');
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
    });
}

function postSortData(content, req, callback) {
    var options = _.extend({}, req.app.config.generalPurposeJdsServer, {
        url: '/user/set/this',
        logger: req.logger || {},
        body: content
    });

    httpUtil.post(options,
        function(err, response, data) {
            if (err) {
                options.logger.error('Unable to POST sorting data. Error: ' + err);
                if (callback) {
                    callback(err);
                }
            } else {
                if (callback) {
                    callback(null, data);
                }
            }
        }
    );
}

//delete entire sort data for a workspace
//this is only called when sorting is removed from all applets in a workspace
function deleteSortData(sortId, req, callback) {
    var options = _.extend({}, req.app.config.generalPurposeJdsServer, {
        url: '/user/destroy/' + sortId,
        logger: req.logger || {}
    });

    httpUtil.get(options, function(err, response, result) {
        if (err) {
            options.logger.error(err.message);
            callback(err);
            return;
        }
        var returnedData;
        try {
            returnedData = JSON.parse(result);
            options.logger.debug(returnedData);
        } catch (ex) {
            options.logger.error(err.message);
            callback(err);
            return;
        }
        if (result === '{}') {
            callback(null, returnedData);
        } else {
            //malformed json
            err = new Error('Unexpected JSON format');
            callback(err);
            return;
        }

    });
}

function createSortId(req) {
    var userSession = req.session.user || {};
    var id = req.param('id') || null;
    var site = userSession.site || null;
    var ien = userSession.duz[site] || null;

    if (ien && site && id) {
        return site + ';' + ien + '_' + id + '_sort';
    } else {
        return null;
    }
}

function createSortIdFromString(req, id) {
    var userSession = req.session.user || {};
    var site = userSession.site || null;
    var ien = userSession.duz[site] || null;

    if (ien && site && id) {
        return site + ';' + ien + '_' + id + '_sort';
    } else {
        return null;
    }
}

function getInstanceIdParameter(req) {
    return req.param('instanceId') || null;
}

function createScreenIdFromRequest(req, screenType) {
    var uid;
    var userSession = req.session.user;
    var site = dd(userSession)('site').val;
    var ien = dd(userSession)('duz')(site).val;

    if(!_.isUndefined(site) && !_.isUndefined(ien)) {
        uid = site.concat(';').concat(ien);
        uid = uid.concat('_').concat(screenType);
    }

    return uid;
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.createSortId = createSortId;
module.exports.deleteSortData = deleteSortData;
module.exports.createSortIdFromString = createSortIdFromString;
module.exports._processDataForCreate = processDataForCreate;
module.exports._verifyInput = verifyInput;
