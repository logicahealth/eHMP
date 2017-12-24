'use strict';

var _ = require('lodash');
var async = require('async');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var RdkError = rdk.utils.RdkError;
var pjdsUtil = rdk.utils.pjdsUtil;

var getList = function(req, res) {
    var filter = pjdsUtil.getRequestParameter(req, 'filter', 'eq(status,active)');
    pjdsUtil.getPermissionSet(req, {
        store: 'permset',
        filterList: filter
    }, function (error, response) {
        if (error) {
            var rdkError = new RdkError({
                code: '202.500.1002',
                logger: req.logger,
                error: error
            });
            return res.status(rdkError.status).rdkSend(rdkError);
        }

        var hasNationalAccess = _.get(req, 'session.user.nationalAccess', false);
        if (!hasNationalAccess) {
            _.remove(response.data.items, function(item) {
                return item.nationalAccess;
            });
        }

        _.each(response.data.items, function(item) {
            _.extend(item, { val: item.uid });
        });

        populateUserNamesOnResponse(req, response.data.items, function(err, userNames) {
            if (err) {
                req.logger.warn('Encountered an error when looking up user names for permission sets', err);
            }

            if (userNames) {
                _.each(response.data.items, function(permSet) {
                    if (permSet.authorUid) {
                        permSet.authorName = userNames[permSet.authorUid];
                    }

                    if (permSet.lastUpdatedUid) {
                        permSet.lastUpdatedName = userNames[permSet.lastUpdatedUid];
                    }
                });
            }

            return res.status(rdk.httpstatus.ok).rdkSend(response.data.items);
        });
    });
};

function populateUserNamesOnResponse(req, permSets, callback) {
    var authorUids = _.compact(_.map(permSets, 'authorUid'));
    var lastUpdatedUids = _.compact(_.map(permSets, 'lastUpdatedUid'));
    var allUids = _.union(authorUids, lastUpdatedUids);
    var jdsQueryAddresses = pjdsUtil.getJDSQueriesFromIds(allUids, 10);
    var queryTasks = [];

    _.each(jdsQueryAddresses, function(query) {
        queryTasks.push(function(taskCallback) {
            runJDSQuery(req, query, taskCallback);
        });
    });

    async.parallelLimit(queryTasks, 15, function(err, results) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }

        var userNames = {};
        _.each(results, function(result) {
            // each result is now an array of demographics
            _.each(result, function(user) {
                userNames[user.uid] = user.name;
            });
        });

        return callback(null, userNames);
    });

}

function runJDSQuery(req, query, callback) {
    var logger = req.logger;
    var jdsServer = req.app.config.jdsServer;
    var options = _.extend({}, jdsServer, {
        url: query,
        logger: logger || {},
        json: true
    });

    httpUtil.get(options, function(err, response, returnedData) {
        if (err) {
            logger.error(err.message);
            return callback(err);
        }

        if (!_.isUndefined(_.get(returnedData, 'data.items'))) {
            return callback(null, returnedData.data.items);
        }

        logger.error('Unexpected JSON format. Could not find patient or user in JDS. Will not include fields in the response.');
        return callback(null, {});
    });
}

module.exports = getList;
