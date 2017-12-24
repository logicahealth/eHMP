'use strict';
var _ = require('lodash');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var nullUtil = require('../core/null-utils');
var JSONStream = require('JSONStream');
var FileDB = require('./pick-list-db-file');
var pickListUtil = require('./pick-list-utils');

var pickListRoot = './';
var loading = [];

var refreshInProgress = null;
module.exports.refreshInProgress = refreshInProgress;

var REFRESH_STATE_NOT_LOADED = 'notLoaded';
var REFRESH_STATE_NORMAL = 'normal';
var REFRESH_STATE_STALE = 'stale';

module.exports.REFRESH_STATE_NOT_LOADED = REFRESH_STATE_NOT_LOADED;
module.exports.REFRESH_STATE_NORMAL = REFRESH_STATE_NORMAL;
module.exports.REFRESH_STATE_STALE = REFRESH_STATE_STALE;

/**
 * db needs to have two methods:
 *
 * retrieve(logger, dataNeedsRefreshAfterMinutes, query, callback)
 * store(logger, params, data, callback)
 */
module.exports.db = new FileDB();

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

        module.exports.db.store(app, params, result, callback);
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

    var siteNames = _.keys(app.config.vistaSites);
    var processedData = [];
    var errored = false;
    _.each(siteNames, function(site, i) {
        var siteConfig = app.config.vistaSites[site];
        async.series(_.map(pickListUtil.inMemoryConfig(app), function(value) {
            return function (callback) {
                var params = { site: site, pickList: value.name };
                loadPickList(app, siteConfig, params, value.modulePath, callback);
            };
        }), function (err, results) {
            if (errored) {
                return;
            }
            if (err) {
                refreshInProgress = false;
                errored = true;
                app.logger.error({error: err}, 'pick-list-db.refresh error retrieving data');
                return callback(err);
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
 * Retrieves a pick-list after refreshing it if needed.
 *
 * @param app A reference to the application object (e.g. logger, config, etc.).
 * @param logger request logger
 * @param siteConfig The configuration for calling RPCs.
 * @param params The pick-list name, site, and any other parameters.
 * @param modulePath The path of the file with the pick-list's fetch function.
 * @param dataNeedsRefreshAfterMinutes How many minutes old is cached data still acceptable? (Use 0 to force a cache refresh.)
 * @param callback The function to call when done.
 */
module.exports.retrievePickList = function retrievePickList(app, logger, siteConfig, params, filters, modulePath, dataNeedsRefreshAfterMinutes, callback) {
    var originalParams = params;
    params = _.omit(params, 'parseStreams');
    var pickListConfig = pickListUtil.inMemoryConfig(app);

    module.exports.db.retrieve(app, logger, dataNeedsRefreshAfterMinutes, params, function(err, res) {
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
                    parseJSONIfNeeded(originalParams.parseStreams, result, function (err, result) {
                        var retValue = filterResults(result, filters);
                        logger.debug({
                            retValue: retValue
                        }, 'pick-list-db.retrievePickList: retValue');
                        return callback(err, retValue);
                    });
                }
            });
        } else {
            logger.debug({
                data: res.data
            }, 'pick-list-db.retrievePickList: res.data');

            parseJSONIfNeeded(originalParams.parseStreams, res.data, function (err, result) {
                var retValue = filterResults(result, filters);
                logger.debug({
                    retValue: retValue
                }, 'pick-list-db.retrievePickList: retValue filtered');
                callback(err, retValue);

                //Purposefully done after the callback so it can reload new data after the stale data is returned.
                if (res.status === REFRESH_STATE_STALE) {
                    loadPickList(app, siteConfig, params, modulePath, function (error/*, result*/) {
                        if (error) {
                            logger.error({
                                error: error
                            }, 'pick-list-db.retrievePickList error occurred trying to refresh stale data:');
                        }
                    });
                }
            });
        }
    });
};

function parseJSONIfNeeded(parse, data, callback) {
    if (!parse || !(data instanceof EventEmitter) || !_.isFunction(data.pipe)) {
        return callback(null, data);
    }

    var results = [];
    var parser = JSONStream.parse('*');
    parser.on('data', function parseJSONOnEntry(entry) {
        results.push(entry);
    });
    parser.on('error', callback);
    parser.on('end', function parseJSONOnEnd() {
        return callback(null, results);
    });
    data.pipe(parser);
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
    if (!_.get(filters, 'fieldToCheckAgainst') || !_.get(filters, 'stringToSearchFor')) {
        return data;
    }

    var regex = new RegExp(_.escapeRegExp(filters.stringToSearchFor), 'i');

    if (data instanceof EventEmitter && _.isFunction(data.pipe)) {
        return addStreamFilter(data, filters.fieldToCheckAgainst, regex);
    } else {
        var retValue = _.filter(data, function (n) {
            if (!_.get(n, filters.fieldToCheckAgainst)) {
                return false;
            }
            return regex.test(n[filters.fieldToCheckAgainst]);
        });
        return retValue;
    }
}

/**
 * Adds a field and value to filter records in a stream.
 *
 * @param {stream.Readable} stream The stream to filter out records that don't match (must be parsable as JSON).
 * @param {string} field The name of the field to compare the value to.
 * @param {any} value The value to find records with.
 */
function addStreamFilter(stream, field, value) {
    if (!stream.pickListFilters) {
        var pickListFilters = [];

        var parser = JSONStream.parse('*', function (entry) {
            var negativeMatch = _.find(pickListFilters, function (filter) {
                var value = _.get(entry, filter.field);
                if (!_.has(entry, filter.field)) {
                    return true;
                } else if (filter.value instanceof RegExp) {
                    return !filter.value.test(value);
                } else {
                    return !_.isEqual(filter.value, value);
                }
            });
            return negativeMatch ? undefined : entry;
        });

        var stringer = JSONStream.stringify();

        stream = stream.pipe(parser).pipe(stringer);

        stream.pickListFilters = pickListFilters;
    }

    stream.pickListFilters.push({
        field: field,
        value: value
    });

    return stream;
}

module.exports._filterResults = filterResults;
