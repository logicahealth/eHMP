'use strict';

var  _ = require('lodash');
var Datastore = require('nedb');
var nullUtil = require('../core/null-utils');
var validationUtil = require('./utils/validation-util');
var pickListDb = require('./pick-list-db');
var pickListUtil = require('./pick-list-utils');

function MemoryDB() {
    this._database = new Datastore();
}
module.exports = MemoryDB;

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
MemoryDB.prototype.retrieve = function (app, logger, dataNeedsRefreshAfterMinutes, query, callback) {
    var dateCurrent = new Date();
    var refreshIntervalInMilliseconds = 1000 * 60 * dataNeedsRefreshAfterMinutes;
    this._database.find(query, function (err, results) {
        if (err) {
            logger.error({ error: err }, 'pick-list-db-memory.retrieve error finding data');
            return callback(err);
        }

        var reply = {
            data: null,
            status: pickListDb.REFRESH_STATE_NOT_LOADED
        };
        if (nullUtil.isNullish(results)) {
            logger.warn({ error: err }, 'pick-list-db-memory.retrieve warning res was nullish');
            return callback(null, {});
        }
        else if (results.length < 1) {
            logger.debug({ result: reply }, 'pick-list-db-memory.retrieve res.length < 1');
            return callback(null, reply);
        }
        else {
            logger.debug('pick-list-db-memory.retrieve res.length === ' + results.length);

            if (nullUtil.isNullish(results[0]) || nullUtil.isNullish(results[0].data)) {
                logger.warn('pick-list-db-memory.retrieve warning res[0] or res[0].data was nullish');
                reply.status = pickListDb.REFRESH_STATE_NORMAL;
                return callback(null, reply);
            }

            var dateCreated = new Date(results[0].timeStamp);
            reply.data = results[0].data;
            //result.pickList = res[0].pickList;
            //result.site = res[0].site;
            //result.timeStamp = res[0].timeStamp;
            if ((dateCurrent.getTime() - dateCreated.getTime()) < refreshIntervalInMilliseconds) {
                reply.status = pickListDb.REFRESH_STATE_NORMAL;
            } else {
                reply.status = pickListDb.REFRESH_STATE_STALE;
            }

            logger.debug({ result: reply }, 'pick-list-db-memory.retrieve result');
            return callback(null, reply);
        }
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
MemoryDB.prototype.store = function (app, params, data, callback) {
    var updatedData = _.clone(params, true);
    _.set(updatedData, 'timeStamp', new Date());
    _.set(updatedData, 'data', data);

    this._database.update(params, updatedData, { upsert: true }, function (err, numReplaced, newDoc) {
        isHeapSizeExceeded(app);

        if (err) {
            app.logger.error({ error: err }, 'pick-list-db-memory.store error updating data');
            return callback(err);
        }
        if (numReplaced === 0) {
            app.logger.error({ error: err }, 'pick-list-db-memory.store error no records were stored in-memory');
            return callback('No records were stored in-memory');
        }
        if (nullUtil.isNullish(newDoc) || nullUtil.isNullish(newDoc.data)) {
            if (nullUtil.isNullish(data)) {
                app.logger.warn('pick-list-db-memory.store warning newDoc or newDoc.data was nullish and data was also nullish');
                return callback(null, {});
            } else {
                app.logger.debug({ data: data }, 'pick-list-db-memory.store newDoc or newDoc.data was nullish - data contained');
                return callback(null, data);
            }
        }

        //Uncomment for testing - shows you everything in the database after your update.
        //self.db.find({}, function (error, results) {
        //    console.log(results);
        app.logger.debug({ data: data }, 'pick-list-db-memory.store data');
        app.logger.debug({ data: newDoc.data }, 'pick-list-db-memory.store newDoc.data');
        callback(null, newDoc.data);
        //});
    });
};

/**
 * Method to see if the current heap size exceeds the percentage we have specified.
 *
 * @param app A reference to the application object (e.g. logger, config, etc.).
 */
function isHeapSizeExceeded(app) {
    var percentTotalHeapBeforeMemoryNotification = 75;
    var pickListConfigInMemoryRpcCall = pickListUtil.inMemoryConfig(app);
    if (!_.has(pickListConfigInMemoryRpcCall, 'percentTotalHeapBeforeMemoryNotification')) {
        app.logger.error('pick-list-db-memory.isHeapSizeExceeded error: percentTotalHeapBeforeMemoryNotification is not found in pick-list-config-in-memory-rpc-call.json');
    }
    else if (!validationUtil.isWholeNumber(pickListConfigInMemoryRpcCall.percentTotalHeapBeforeMemoryNotification)) {
        app.logger.error('pick-list-db-memory.isHeapSizeExceeded error: percentTotalHeapBeforeMemoryNotification is not a whole number in pick-list-config-in-memory-rpc-call.json');
    }
    else {
        percentTotalHeapBeforeMemoryNotification = pickListConfigInMemoryRpcCall.percentTotalHeapBeforeMemoryNotification;
    }

    var memory = process.memoryUsage();
    var acceptableMemory = percentTotalHeapBeforeMemoryNotification * 0.01 * memory.heapTotal;
    var memoryExceeded = memory.heapUsed > acceptableMemory;

    if (memoryExceeded) {
        app.logger.error('pick-list-db-memory.isHeapSizeExceeded error: The acceptable memory allocated on the heap for pick-lists has been exceeded' +
            '(Used: ' + memory.heapUsed + '  Threshold:  ' + acceptableMemory + '  Total:' + memory.heapTotal + ')');
    }

    app.logger.debug('pick-list in-memory footprint:  (Used: ' + memory.heapUsed +
        '  Threshold:  ' + acceptableMemory + '  Total:' + memory.heapTotal + ')');

    return memoryExceeded;
}
