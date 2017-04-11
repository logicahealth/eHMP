'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var httpUtil = rdk.utils.http;
var async = require('async');
var filter = require('./user-defined-filter-resource');
var graph = require('./user-defined-stack-resource');
var uds = require('./user-defined-screens-resource');
var dd = require('drilldown');
var nullchecker = rdk.utils.nullchecker;

var USER_SCREENS_CONFIG = 'UserScreensConfig';

var interceptors = {
    operationalDataCheck: false,
    synchronize: false
};
var permissions = [];

function getResourceConfig() {
    return [{
        name: 'write-user-defined-screens',
        path: '',
        post: saveUserDefinedScreens,
        interceptors: interceptors,
        requiredPermissions: permissions,
        isPatientCentric: false
    }, {
        name: 'write-user-defined-screens-copy',
        path: '/copy',
        post: copyUserDefinedWorkspace,
        interceptors: interceptors,
        requiredPermissions: permissions,
        isPatientCentric: false
    }, {
        name: 'write-user-defined-screens',
        path: '',
        put: updateWorkspaceId,
        interceptors: interceptors,
        subsystems: ['jdsSync'],
        requiredPermissions: permissions,
        isPatientCentric: false
    }];
}

function saveUserDefinedScreens(req, res) {
    req.logger.debug('In Save user defined screens');

    var screenType = req.body.screenType;

    req.logger.debug('Inside saveUserDefinedScreens writeuserdefinedscreens screenType: ' + screenType);

    var input = '';
    var screenId = '';
    input = req.body.param;
    req.logger.debug({input: input}, 'Inside saveUserDefinedScreens writeuserdefinedscreens input');

    screenId = createScreenIdFromRequest(req, USER_SCREENS_CONFIG);

    req.logger.debug('screenId: ' + screenId);

    //Get USER_SCREENS_CONFIG for update or for create if it's empty
    uds.getScreenData(screenId, req, function(err, data) {
        req.logger.debug({data: data}, 'getting data for screenID: ' + screenId + ' and data returned');
        if (err) {
            req.logger.error(err);
            res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        } else {
            var udsData = {};
            var userDefinedScreensData = dd(data)('userDefinedScreens').val;
            var userDefinedFiltersData = dd(data)('userDefinedFilters').val;
            var userDefinedGraphsData = dd(data)('userDefinedGraphs').val;
            var userDefinedTileSortData = dd(data)('userDefinedSorts').val;
            if(screenType === USER_SCREENS_CONFIG) {
                udsData = {
                    _id: screenId,
                    userScreensConfig: input,
                    userDefinedScreens: userDefinedScreensData,
                    userDefinedFilters: userDefinedFiltersData,
                    userDefinedGraphs: userDefinedGraphsData,
                    userDefinedSorts: userDefinedTileSortData
                };
            } else {
                if(nullchecker.isNullish(userDefinedScreensData)) {
                    //No userdefined screens, push the new one
                    var tempUserDefinedFiltersData = [];
                    tempUserDefinedFiltersData.push(input);
                    data.userDefinedScreens = tempUserDefinedFiltersData;
                } else {
                    var count;
                    if(!input.hasOwnProperty('id')) {
                        //This must be a delete request, delete data with this screenId from array
                        if(nullchecker.isNotNullish(userDefinedScreensData)) {
                            for (count = 0; count < userDefinedScreensData.length; count++) {
                                if (userDefinedScreensData[count].id === screenType) {
                                    userDefinedScreensData.splice(count, 1);
                                }
                            }
                        }

                        //Delete associated filters
                        if(nullchecker.isNotNullish(userDefinedFiltersData)) {
                            for (count = 0; count < userDefinedFiltersData.length; count++) {
                                if (userDefinedFiltersData[count].id === screenType) {
                                    userDefinedFiltersData.splice(count, 1);
                                }
                            }
                        }

                        //Delete associated stacked graphs
                        if(nullchecker.isNotNullish(userDefinedGraphsData)) {
                            for (count = 0; count < userDefinedGraphsData.length; count++) {
                                if (userDefinedGraphsData[count].id === screenType) {
                                    userDefinedGraphsData.splice(count, 1);
                                }
                            }
                        }

                        //Delete associated tile sorts
                        if(nullchecker.isNotNullish(userDefinedTileSortData)) {
                            for (count = 0; count < userDefinedTileSortData.length; count++) {
                                if (userDefinedTileSortData[count].id === screenType) {
                                    userDefinedTileSortData.splice(count, 1);
                                }
                            }
                        }
                    } else {
                        var found = false;
                        if(nullchecker.isNotNullish(userDefinedScreensData)) {
                            for (count = 0; count < userDefinedScreensData.length; count++) {
                                if (userDefinedScreensData[count].id === screenType) {
                                    found = true;
                                    userDefinedScreensData.splice(count, 1, input);
                                }
                            }
                        }

                        if(!found) {
                            userDefinedScreensData.push(input);

                            req.logger.debug({data: data}, 'Inside Yea writeuserdefinedscreens -saveUserDefinedScreens, data before adding userDefinedScreens saving to JDS: ');

                            data.userDefinedScreens = userDefinedScreensData;
                        }
                    }
                }
                udsData = data;
            }

            //The UI is coded to expect strings, store it as such
            var content = JSON.stringify(udsData);

            req.logger.debug({content: content}, 'Inside Yea writeuserdefinedscreens -saveUserDefinedScreens, before saving to JDS: ');

            postScreenData(content, req, function(err) {
                if (err) {
                    req.logger.error(err);
                    res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
                } else {
                    res.status(rdk.httpstatus.ok).rdkSend(content);
                }
            });
        }
    });
}

function copyUserDefinedWorkspace(req, res) {

    var fromId = req.query.fromId;
    var toId = req.query.toId;
    var predefined = req.query.predefined;
    var screenId = '';
    var userDefinedFiltersData = [];
    var userDefinedGraphsData = [];
    var userDefinedTileSortData = [];
    var tasks = [];

    screenId = createScreenIdFromRequest(req, USER_SCREENS_CONFIG);

    req.logger.debug('screenId: ' + screenId);
    //Get USER_SCREENS_CONFIG for copy and update
    uds.getScreenData(screenId, req, function(err, data) {
        req.logger.debug({data: data}, 'Inside writeuserdefinedscreens - copyUserDefinedWorkspace: ');
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        } else {
            var count;
            var tempUserDefinedFiltersData = dd(data)('userDefinedFilters').val;
            if(nullchecker.isNotNullish(tempUserDefinedFiltersData)) {
                userDefinedFiltersData = tempUserDefinedFiltersData;
            }
            req.logger.debug({userDefinedFiltersData: userDefinedFiltersData}, 'userDefinedFilters data before copy');

            var tempUserDefinedGraphsData = dd(data)('userDefinedGraphs').val;
            if(nullchecker.isNotNullish(tempUserDefinedGraphsData)) {
                userDefinedGraphsData = tempUserDefinedGraphsData;
            }
            req.logger.debug({userDefinedGraphssData: userDefinedGraphsData}, 'userDefinedGraphssData data before copy');

            if(predefined === 'true') {
                tasks.push(function (callback) {
                    req.logger.debug('predifined:::111 ' + predefined);

                    filter.getPredefinedFilterData(req, fromId, function(err, filterData) {
                        if (err) {
                            req.logger.error(err);
                        } else {
                            req.logger.debug({filterData: filterData}, 'filterData before copied');
                            if(nullchecker.isNotNullish(filterData)) {
                                filterData.id = toId;
                                userDefinedFiltersData.push(filterData);
                                req.logger.debug({userDefinedFiltersData: userDefinedFiltersData}, 'userDefinedScreens before copied filterData');
                            }
                        }
                        callback();
                    });
                });

                tasks.push(function (callback) {
                    graph.getPredefinedStackedGraphData(req, fromId, function(err, graphData) {
                        if (err) {
                            req.logger.error(err);
                        } else {
                            req.logger.debug({graphData: graphData}, 'filterData before copied filterData');
                            if(nullchecker.isNotNullish(graphData)) {
                                graphData.id = toId;
                                userDefinedGraphsData.push(graphData);
                                req.logger.debug({userDefinedGraphsData: userDefinedGraphsData}, 'userDefinedScreens after copied graphData');
                            }
                        }
                        callback();
                    });
                });

                tasks.push(function (callback) {
                    //update with predefined or user defined filters and graphs
                    data.userDefinedFilters = userDefinedFiltersData;
                    data.userDefinedGraphs = userDefinedGraphsData;

                    //The UI is coded to expect strings, store it as such
                    var content = JSON.stringify(data);

                    req.logger.debug({userDefinedFiltersData: userDefinedFiltersData}, 'userDefinedScreens after copied filterData');

                    postScreenData(content, req, function(err) {
                        if (err) {
                            req.logger.error(err);
                            res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
                        } else {
                            res.status(rdk.httpstatus.ok).rdkSend(content);
                        }
                    });
                    setImmediate(callback);
                });

                async.series(tasks, function () {
                });
            } else {
                req.logger.debug('predifined:::222 ' + predefined);
                var userDefinedScreensData = dd(data)('userDefinedScreens').val;
                req.logger.debug({userDefinedScreensData: userDefinedScreensData}, 'userDefinedScreens before copied workspace');
                if(nullchecker.isNotNullish(userDefinedScreensData)) {
                    var copiedWorkspace;
                    for (count = 0; count < userDefinedScreensData.length; count++) {
                        if (userDefinedScreensData[count].id === fromId) {
                            copiedWorkspace = _.clone(userDefinedScreensData[count]);
                            copiedWorkspace.id = toId;
                            userDefinedScreensData.splice((count+1), 0, copiedWorkspace);
                        }
                    }
                    data.userDefinedScreens = userDefinedScreensData;
                    req.logger.debug({userDefinedScreensData: userDefinedScreensData}, 'userDefinedScreens after copied workspace');
                }

                userDefinedFiltersData = dd(data)('userDefinedFilters').val;
                if(nullchecker.isNotNullish(userDefinedFiltersData)) {
                    var copiedFilterData;
                    for (count = 0; count < userDefinedFiltersData.length; count++) {
                        if (userDefinedFiltersData[count].id === fromId) {
                            copiedFilterData = _.clone(userDefinedFiltersData[count]);
                            copiedFilterData.id = toId;
                            userDefinedFiltersData.splice((count+1), 0, copiedFilterData);
                            break;
                        }
                    }
                }

                userDefinedGraphsData = dd(data)('userDefinedGraphs').val;
                if(nullchecker.isNotNullish(userDefinedGraphsData)) {
                    var copiedGraphsData;
                    for (count = 0; count < userDefinedGraphsData.length; count++) {
                        if (userDefinedGraphsData[count].id === fromId) {
                            copiedGraphsData = _.clone(userDefinedGraphsData[count]);
                            copiedGraphsData.id = toId;
                            userDefinedGraphsData.splice((count+1), 0, copiedGraphsData);
                            break;
                        }
                    }
                }

                userDefinedTileSortData = dd(data)('userDefinedSorts').val;
                if(nullchecker.isNotNullish(userDefinedTileSortData)) {
                    var copiedTileSortData;
                    for (count = 0; count < userDefinedTileSortData.length; count++) {
                        if (userDefinedTileSortData[count].id === fromId) {
                            copiedTileSortData = _.clone(userDefinedTileSortData[count]);
                            copiedTileSortData.id = toId;
                            userDefinedTileSortData.splice((count+1), 0, copiedTileSortData);
                            break;
                        }
                    }
                }

                //update with predefined or user defined filters, graphs and tile sorts
                data._id = screenId;
                data.userDefinedFilters = userDefinedFiltersData;
                data.userDefinedGraphs = userDefinedGraphsData;
                data.userDefinedSorts = userDefinedTileSortData;

                //The UI is coded to expect strings, store it as such
                var content = JSON.stringify(data);

                req.logger.debug({userDefinedFiltersData: userDefinedFiltersData}, 'userDefinedScreens after copied filterData');

                postScreenData(content, req, function(err) {
                    if (err) {
                        req.logger.error(err);
                        res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
                    } else {
                        res.status(rdk.httpstatus.ok).rdkSend(content);
                    }
                });
            }
        }
    });
}

function updateWorkspaceId(req, res) {
    var oldId = req.query.oldId;
    var newId = req.query.newId;

    var screenId = createScreenIdFromRequest(req, USER_SCREENS_CONFIG);
    //var screenId = '9E7A;10000000237_UserScreensConfig'; //createScreenIdFromRequest(req, USER_SCREENS_CONFIG);

    //Get USER_SCREENS_CONFIG for for updating withh new workspace name
    uds.getScreenData(screenId, req, function(err, data) {
        req.logger.debug({data: data}, 'Inside writeuserdefinedscreens - updateWorkspaceId: ');
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        } else {
            var userDefinedScreensData = dd(data)('userDefinedScreens').val;
            var screenIndex;

            screenIndex = findIndex(userDefinedScreensData, function(screen) {
                return screen.id === oldId;
            });
            if(screenIndex > -1) {
                userDefinedScreensData[screenIndex].id = newId;
            }

            var userDefinedFiltersData = dd(data)('userDefinedFilters').val;

            screenIndex = findIndex(userDefinedFiltersData, function(screen) {
                return screen.id === oldId;
            });
            if(screenIndex > -1) {
                userDefinedFiltersData[screenIndex].id = newId;
            }

            var userDefinedGraphsData = dd(data)('userDefinedGraphs').val;

            screenIndex = findIndex(userDefinedGraphsData, function(screen) {
                return screen.id === oldId;
            });
            if(screenIndex > -1) {
                userDefinedGraphsData[screenIndex].id = newId;
            }

            var userDefinedTileSortData = dd(data)('userDefinedSorts').val;

            screenIndex = findIndex(userDefinedTileSortData, function(screen) {
                return screen.id === oldId;
            });
            if(screenIndex > -1) {
                userDefinedTileSortData[screenIndex].id = newId;
            }

            //The UI is coded to expect strings, store it as such
            var content = JSON.stringify(data);

            postScreenData(content, req, function(err) {
                if (err) {
                    req.logger.error(err);
                    res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
                } else {
                    res.status(rdk.httpstatus.ok).rdkSend(content);
                }
            });
        }
    });
}

function postScreenData (content, req, callback) {
    var jdsResource = '/user/set/this'; //The correct endpoint from the JDS for SET which is part of VPRJSES global

    var conf_options = _.extend({}, req.app.config.generalPurposeJdsServer, {
        url: jdsResource,
        logger: req.logger,
        body: content
    });

    httpUtil.post(conf_options,
        function(err, response, data) {
            if (err) {
                conf_options.logger.error({error: err}, 'Unable to POST UDS data.');
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

/*function deleteWorkspace(workspace, req, callback) {
    var options = _.extend({}, req.app.config.generalPurposeJdsServer, {
        url: '/user/destroy/' + workspace,
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
            options.logger.error(ex);
            callback(ex);
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
}*/

function findIndex(array, callback) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
        if (callback(array[index], index, array)) {
            return index;
        }
    }
    return -1;
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

exports.getResourceConfig = getResourceConfig;
exports.createScreenIdFromRequest = createScreenIdFromRequest;
