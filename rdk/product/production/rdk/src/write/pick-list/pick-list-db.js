'use strict';
var _ = require('lodash');
var async = require('async');
var Datastore = require('nedb');
var nullUtil = require('../core/null-utils');
var pickListConfigInMemoryRpcCall = require('./config/pick-list-config-in-memory-rpc-call');
var pickListConfig = require('./config/pick-list-config-in-memory-rpc-call').pickListConfig;
var validationUtil = require('./utils/validation-util');

var pickListRoot = './';
var loading = [];

var db = new Datastore();
var refreshInProgress = null;
module.exports.refreshInProgress = refreshInProgress;

var REFRESH_STATE_NOT_LOADED = 'notLoaded';
var REFRESH_STATE_NORMAL = 'normal';
var REFRESH_STATE_STALE = 'stale';



module.exports.retrieveDataFromDB = retrieveDataFromDB;
module.exports.updateDatabase = updateDatabase;
module.exports.REFRESH_STATE_NOT_LOADED = REFRESH_STATE_NOT_LOADED;
module.exports.REFRESH_STATE_NORMAL = REFRESH_STATE_NORMAL;
module.exports.REFRESH_STATE_STALE = REFRESH_STATE_STALE;

/**
 * Retrieves the data from the database.  If an error occurs, and error will be returned.  Otherwise you will receive
 * a result which contains status and possibly data.<br/>
 * If the status is REFRESH_STATE_NOT_LOADED, data will be null.<br/>
 * If the status is REFRESH_STATE_NORMAL, data will contain the data retrieved from the database.<br/>
 * If the status is REFRESH_STATE_STALE, data will contain the data retrieved from the database - it is the responsibility
 * of the caller to refresh the data asynchronously at this point.<br/>
 *
 * @param logger The logger.
 * @param dataNeedsRefreshAfterMinutes How many minutes old is cached data still acceptable?
 * @param query The pick-list name, site, and any other parameters.
 * @param callback The function to call when done.
 */
function retrieveDataFromDB(logger, dataNeedsRefreshAfterMinutes, query, callback) {
    var dateCurrent = new Date();
    var refreshIntervalInMilliseconds = 1000 * 60 * dataNeedsRefreshAfterMinutes;
    db.find(query, function(err, res) {
        if (err) {
            logger.error({
                error: err
            }, 'pick-list-db.retrieveDataFromDB error finding data');
            return callback(err);
        }

        var result = {
            data: null,
            status: REFRESH_STATE_NOT_LOADED
        };
        if (nullUtil.isNullish(res)) {
            logger.warn({
                error: err
            }, 'pick-list-db.retrieveDataFromDB warning res was nullish');
            return callback(null, {});
        } else if (res.length < 1) {
            logger.debug({
                result: result
            }, 'pick-list-db.retrieveDataFromDB res.length < 1');
            return callback(null, result);
        } else {
            logger.debug('pick-list-db.retrieveDataFromDB res.length === ' + res.length);

            if (nullUtil.isNullish(res[0]) || nullUtil.isNullish(res[0].data)) {
                logger.warn('pick-list-db.retrieveDataFromDB warning res[0] or res[0].data was nullish');
                return callback(null, {});
            }

            var dateCreated = new Date(res[0].timeStamp);
            result.data = res[0].data;
            //result.pickList = res[0].pickList;
            //result.site = res[0].site;
            //result.timeStamp = res[0].timeStamp;
            if ((dateCurrent.getTime() - dateCreated.getTime()) < refreshIntervalInMilliseconds) {
                result.status = REFRESH_STATE_NORMAL;
            } else {
                result.status = REFRESH_STATE_STALE;
            }

            logger.debug({
                result: result
            }, 'pick-list-db.retrieveDataFromDB result');
            return callback(null, result);
        }
    });
}

/**
 * Method to see if the current heap size exceeds the percentage we have specified.
 *
 * @param logger The logger.
 */
function isHeapSizeExceeded(logger) {
    var percentTotalHeapBeforeMemoryNotification = 75;
    if (!_.has(pickListConfigInMemoryRpcCall, 'percentTotalHeapBeforeMemoryNotification')) {
        logger.error('pick-list-db.isHeapSizeExceeded error: percentTotalHeapBeforeMemoryNotification is not found in pick-list-config-in-memory-rpc-call.json');
    } else if (!validationUtil.isWholeNumber(pickListConfigInMemoryRpcCall.percentTotalHeapBeforeMemoryNotification)) {
        logger.error('pick-list-db.isHeapSizeExceeded error: percentTotalHeapBeforeMemoryNotification is not a whole number in pick-list-config-in-memory-rpc-call.json');
    } else {
        percentTotalHeapBeforeMemoryNotification = pickListConfigInMemoryRpcCall.percentTotalHeapBeforeMemoryNotification;
    }

    var memory = process.memoryUsage();
    var memoryExceeded = memory.heapUsed > percentTotalHeapBeforeMemoryNotification * 0.01 * memory.heapTotal;
    if (memoryExceeded) {
        logger.error('pick-list-db.isHeapSizeExceeded error: The acceptable memory allocated on the heap for pick-lists has been exceeded');
    }
    return memoryExceeded;
}

/**
 * Method to store pick-list data in the database.
 *
 * @param logger The logger.
 * @param params The pick-list name, site, and any other parameters.
 * @param timeStamp The timestamp to record with the data.
 * @param data The pick-list data.
 * @param callback The function to call when done.
 */
function updateDatabase(logger, params, timeStamp, data, callback) {
    var updatedData = _.clone(params, true);
    _.set(updatedData, 'timeStamp', timeStamp);
    _.set(updatedData, 'data', data);
    db.update(params, updatedData, {
        upsert: true
    }, function(err, numReplaced, newDoc) {
        isHeapSizeExceeded(logger);

        if (err) {
            logger.error({
                error: err
            }, 'pick-list-db.updateDatabase error updating data');
            return callback(err);
        }
        if (numReplaced === 0) {
            logger.error({
                error: err
            }, 'pick-list-db.updateDatabase error no records were stored in-memory');
            return callback('No records were stored in-memory');
        }
        if (nullUtil.isNullish(newDoc) || nullUtil.isNullish(newDoc.data)) {
            if (nullUtil.isNullish(data)) {
                logger.warn('pick-list-db.updateDatabase warning newDoc or newDoc.data was nullish and data was also nullish');
                return callback(null, {});
            } else {
                logger.debug({
                    data: data
                }, 'pick-list-db.updateDatabase newDoc or newDoc.data was nullish - data contained');
                return callback(null, data);
            }
        }

        //Uncomment for testing - shows you everything in the database after your update.
        //db.find({}, function (error, results) {
        //    console.log(results);
        logger.debug({
            data: data
        }, 'pick-list-db.updateDatabase data');
        logger.debug({
            data: newDoc.data
        }, 'pick-list-db.updateDatabase newDoc.data');
        callback(null, newDoc.data);
        //});
    });
}

/**
 * Generic method to load a pick-list into the in-memory database.
 *
 * @param app A reference to the application object (e.g. logger, config, etc.).
 * @param siteConfig The configuration for calling RPCs.
 * @param params The pick-list name, site, and any other parameters.
 * @param modulePath The path of the file with the pick-list's fetch function.
 * @param callback The function to call when done.
 */
function loadPickList(app, siteConfig, params, modulePath, callback) {
    var logger = app.logger;

    // work on a copy of site config to avoid mutating the original
    siteConfig = _.extend({}, siteConfig, {
        division: null
    });
    require(pickListRoot + modulePath).fetch(logger, siteConfig, function(err, result) {
        if (err) {
            logger.error({
                error: err
            }, 'pick-list-db.loadPickList error loading pick list');
            return callback(err);
        }
        if (!result) {
            logger.warn('pick-list-db.loadPickList warning contained no data for ' + params.site + ':' + params.pickList);
            return callback(null, params.site + ':' + params.pickList + ' contained no data');
        }

        updateDatabase(logger, params, new Date(), result, callback);
    }, params, app.config);
}

/**
 * Populates the loading variable so it isn't populated again and then removes it after calling loadPickList.
 */
module.exports.initialLoadPickList = function(app, siteConfig, params, modulePath, callback) {
    var logger = app.logger;

    loading.push(params.pickList);

    loadPickList(app, siteConfig, params, modulePath, function(error, result) {
        loading.splice(loading.indexOf(params.pickList), 1); //Remove this entry from our list of things being loaded.

        if (error) {
            logger.error({
                error: error
            }, 'pick-list-db.initialLoadPickList error loading pick list:');
            return callback(error);
        }

        logger.debug({
            result: result
        }, 'pick-list-db.initialLoadPickList result');
        return callback(null, result);
    });
};

module.exports.refresh = function refresh(app, forcedRefresh, callback) {
    var logger = app.logger;

    logger.info('Initializing pick list in-memory database');
    if (refreshInProgress !== null && refreshInProgress) {
        logger.debug('pick-list-db.refresh Refresh in progress');
        callback(null, 'Refresh in progress');
        return;
    }

    if (refreshInProgress === null || !refreshInProgress) {
        refreshInProgress = true;
    }
    //var config = app.config;
    var sites = app.config.vistaSites;
    var siteNames = [];
    var siteConfigs = [];
    if (!_.isNull(sites)) {
        for (var key in sites) {
            if (sites.hasOwnProperty(key) && typeof sites[key] === 'object') {
                siteNames.push(key);
                siteConfigs.push(sites[key]);
            }
        }
    }
    var processedData = [];
    _.each(siteNames, function(site, i) {
        var siteConfig = app.config.vistaSites[site];
        async.series(_.map(app.config.pickListConfig, function(value /*, index, collection*/ ) {
            return function(callback) {
                loadPickList(app, siteConfig, site, value, callback);
            };
        }), function(err, results) {
            if (err) {
                refreshInProgress = false;
                logger.error({
                    error: err
                }, 'pick-list-db.refresh error retrieving data');
                callback(err);
            } else {
                processedData.push(results);
                if (i === (siteNames.length - 1)) {
                    refreshInProgress = false;
                    logger.debug({
                        data: processedData
                    }, 'pick-list-db.refresh processedData');
                    callback(null, processedData);
                }
            }
        });
    });
};

/**
 * Converts a string into a properly escaped regular expression.
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Removes all of the records whose filters.fieldToCheckAgainst don't contain the string filters.stringToSearchFor
 *
 * @param data The data to filter out records that don't match.
 * @param filters filters out the data by comparing filters.fieldToCheckAgainst to see if that matches what is contained
 * in filters.stringToSearchFor.  It does this with a case insensitive search and adds it if the match is found anywhere
 * in that string.
 */
function filterResults(data, filters) {
    if (nullUtil.isNullish(filters)) {
        return data;
    }
    if (nullUtil.isNullish(filters.fieldToCheckAgainst) || _.isEmpty(filters.fieldToCheckAgainst)) {
        return data;
    }
    if (nullUtil.isNullish(filters.stringToSearchFor) || _.isEmpty(filters.stringToSearchFor)) {
        return data;
    }

    var reg = new RegExp(escapeRegExp(filters.stringToSearchFor), 'i');
    var retValue = _.filter(data, function(n) {
        if (nullUtil.isNullish(n)) {
            return false;
        } else if (nullUtil.isNullish(n[filters.fieldToCheckAgainst])) {
            return false;
        } else if (n[filters.fieldToCheckAgainst].match(reg)) {
            return true;
        } else {
            return false;
        }
    });

    return retValue;
}

/**
 * Retrieves a pick-list after refreshing it if needed.
 *
 * @param app A reference to the application object (e.g. logger, config, etc.).
 * @param siteConfig The configuration for calling RPCs.
 * @param params The pick-list name, site, and any other parameters.
 * @param modulePath The path of the file with the pick-list's fetch function.
 * @param dataNeedsRefreshAfterMinutes How many minutes old is cached data still acceptable? (Use 0 to force a cache refresh.)
 * @param callback The function to call when done.
 */
module.exports.retrievePickList = function retrievePickList(app, siteConfig, params, filters, modulePath, dataNeedsRefreshAfterMinutes, callback) {
    var logger = app.logger;

    retrieveDataFromDB(logger, dataNeedsRefreshAfterMinutes, params, function(err, res) {
        if (err) {
            logger.error({
                error: err
            }, 'pick-list-db.retrievePickList error retrieving data');
            return callback(err);
        }

        if (nullUtil.isNullish(res)) {
            logger.error('pick-list-db.retrievePickList error: res was nullish');
            return callback('pick-list-db.retrievePickList: res was nullish');
        }

        if (res.status === REFRESH_STATE_NOT_LOADED) {
            var i = _.indexOf(_.pluck(pickListConfig, 'name'), params.pickList);

            //If we have not loaded this large pick list into memory yet, it could be the first time they requested it
            //in which case we will notify them it's loading.  Otherwise they are calling again before it's been loaded.
            //If that's the case, we shouldn't load it again but just inform them that it's still being retrieved.
            if (_.has(pickListConfig[i], 'largePickListRetry')) {
                if (_.includes(loading, params.pickList)) {
                    logger.info('pick-list-db.retrievePickList: Pick list (' + params.pickList + ') is still being retrieved.  Try again after \'' + pickListConfig[i].largePickListRetry + '\' seconds.');
                    return callback('Pick list (' + params.pickList + ') is still being retrieved.  See Retry-After seconds (in the header) for the length of time to wait.', null, 202, {
                        'Retry-After': pickListConfig[i].largePickListRetry
                    });
                } else {
                    loading.push(params.pickList);
                    logger.info('pick-list-db.retrievePickList: Pick list (' + params.pickList + ') is now loading.  Try again after \'' + pickListConfig[i].largePickListRetry + '\' seconds.');
                    callback('Pick list (' + params.pickList + ') is now loading.  See Retry-After seconds (in the header) for the length of time to wait.', null, 202, {
                        'Retry-After': pickListConfig[i].largePickListRetry
                    });
                }
            }

            loadPickList(app, siteConfig, params, modulePath, function(error, result) {
                if (error) {
                    logger.error({
                        error: error
                    }, 'pick-list-db.retrievePickList error loading pick list');
                }

                //If we were a large pick-list, we notified the user that it would take some time to load this pick-list.
                //We don't want to make multiple callbacks to that user after telling them that.
                var allowCallback = true;
                if (_.includes(loading, params.pickList)) {
                    allowCallback = false;
                    loading.splice(loading.indexOf(params.pickList), 1); //Remove this entry from our list of things being loaded.
                }

                if (error && allowCallback) {
                    logger.error({
                        error: error
                    }, 'pick-list-db.retrievePickList error loading pick list and allowCallback is true:');
                    return callback(error);
                }

                if (allowCallback) {
                    var retValue = filterResults(result, filters);
                    logger.debug({
                        retValue: retValue
                    }, 'pick-list-db.retrievePickList: retValue');
                    return callback(null, retValue);
                }
            });
        } else {
            logger.debug({
                data: res.data
            }, 'pick-list-db.retrievePickList: res.data');

            var retValue = filterResults(res.data, filters);
            logger.debug({
                retValue: retValue
            }, 'pick-list-db.retrievePickList: retValue filtered');
            callback(null, retValue);

            //Purposefully done after the callback so it can reload new data after the stale data is returned.
            if (res.status === REFRESH_STATE_STALE) {
                loadPickList(app, siteConfig, params, modulePath, function(error /*, result*/ ) {
                    if (error) {
                        logger.error({
                            error: error
                        }, 'pick-list-db.retrievePickList error occurred trying to refresh stale data:');
                    }
                });
            }
        }
    });
};

module.exports._loadPickList = loadPickList;
module.exports._updateDatabase = updateDatabase;
module.exports._database = db;
