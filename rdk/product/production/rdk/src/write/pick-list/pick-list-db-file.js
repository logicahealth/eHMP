'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var nullUtil = require('../core/null-utils');
var pickListDb = require('./pick-list-db');
var pickListUtil = require('./pick-list-utils');

function FileDB() {}
module.exports = FileDB;

module.exports.keepCachedFiles = false;

var exitListenerAttached = false;

/**
 * Retrieves the data from the database.  If an error occurs, and error will be returned.  Otherwise you will receive
 * a result which contains status and possibly data.<br/>
 * If the status is REFRESH_STATE_NOT_LOADED, data will be null.<br/>
 * If the status is REFRESH_STATE_NORMAL, data will contain the data retrieved from the database.<br/>
 * If the status is REFRESH_STATE_STALE, data will contain the data retrieved from the database - it is the responsibility
 * of the caller to refresh the data asynchronously at this point.<br/>
 *
 * @param app A reference to the application object (e.g. logger, config, etc.).
 * @param logger request logger
 * @param dataNeedsRefreshAfterMinutes How many minutes old is cached data still acceptable?
 * @param query The pick-list name, site, and any other parameters.
 * @param callback The function to call when done.
 */
FileDB.prototype.retrieve = function (app, logger, dataNeedsRefreshAfterMinutes, query, callback) {
    var dateCurrent = new Date();
    var refreshIntervalInMilliseconds = 1000 * 60 * dataNeedsRefreshAfterMinutes;

    getFilePath(app, query, function (err, filePath) {
        if (err) {
            logger.error({ error: err }, 'pick-list-db-file.retrieve error getting data filePath');
            return callback(err);
        }

        fs.stat(filePath, function (err, stats) {
            var result = {
                data: null,
                status: pickListDb.REFRESH_STATE_NOT_LOADED
            };

            if (err) {
                if (err.code === 'ENOENT') {
                    return callback(null, result);
                } else {
                    logger.error({ error: err }, 'pick-list-db-file.retrieve error finding data');
                    return callback(err);
                }
            }

            var dateCreated = stats.mtime || stats.ctime;
            if ((dateCurrent.getTime() - dateCreated.getTime()) < refreshIntervalInMilliseconds) {
                result.status = pickListDb.REFRESH_STATE_NORMAL;
            }
            else {
                result.status = pickListDb.REFRESH_STATE_STALE;
            }

            result.data = fs.createReadStream(filePath);

            logger.debug({ result: result }, 'pick-list-db-file.retrieve result');
            return callback(null, result);
        });
    });
};

/**
 * Method to store pick-list data in the database.
 *
 * @param app A reference to the application object (e.g. logger, config, etc.).
 * @param params The pick-list name, site, and any other parameters.
 * @param data The pick-list data.
 * @param callback The function to call when done.
 */
FileDB.prototype.store = function (app, params, data, callback) {
    getFilePath(app, params, function (err, filePath) {
        if (err) {
            app.logger.error({ error: err }, 'pick-list-db-file.store error getting data filePath');
            return callback(err);
        }

        attachExitListener();

        fs.writeFile(filePath, JSON.stringify(data), function (err) {
            if (err) {
                app.req.logger.error({ error: err }, 'pick-list-db-file.store error updating data');
                return callback(err);
            }

            if (nullUtil.isNullish(data)) {
                return callback(null, {});
            } else {
                return callback(null, data);
            }
        });
    });
};

/**
 * Create an absolute file path for the given params.
 *
 * @param {object} params
 * @param callback The function to call when done.
 */
function getFilePath(app, params, callback) {
    var pickListConfig = pickListUtil.inMemoryConfig(app);
    var i = _.indexOf(_.pluck(pickListConfig, 'name'), params.pickList);

    var filePathKeys = ['site', 'pickList'];
    if (_.isArray(pickListConfig[i].requiredParams)) {
        filePathKeys = filePathKeys.concat(pickListConfig[i].requiredParams);
    }
    if (_.isArray(pickListConfig[i].optionalParams)) {
        _.each(pickListConfig[i].optionalParams, function (paramName) {
            if (_.has(params, paramName)) {
                filePathKeys.push(paramName);
            }
        });
    }

    var filePath = '';
    _.each(filePathKeys, function (key) {
        if (filePath.length > 0) {
            filePath += '_';
        }
        filePath += params[key];
    });
    filePath += '.json';

    var cachePath = path.join(__dirname, 'file-db-cache');
    fs.mkdir(cachePath, function (err) {
        if (err && err.code !== 'EEXIST') {
            return callback(err);
        }
        return callback(null, path.join(cachePath, filePath));
    });
}

function attachExitListener() {
    if (module.exports.keepCachedFiles) {
        return;
    }
    if (!exitListenerAttached) {
        process.addListener('exit', cleanupCache);
        exitListenerAttached = true;
    }
}

function cleanupCache() {
    if (module.exports.keepCachedFiles) {
        return;
    }
    var cachePath = path.join(__dirname, 'file-db-cache');
    var entries;
    try {
        entries = fs.readdirSync(cachePath);
    } catch (ex) {
        return;
    }
    _.each(entries, function (filename) {
        var filePath = path.join(cachePath, filename);
        try {
            fs.unlinkSync(filePath);
        } catch (ex) {
            console.log('Error removing', filePath);
            console.log(ex);
            return;
        }
    });
    try {
        fs.rmdirSync(cachePath);
    } catch (ex) {
        console.log('Error removing', cachePath);
        console.log(ex);
        return;
    }
}

module.exports.cleanupCache = cleanupCache;
