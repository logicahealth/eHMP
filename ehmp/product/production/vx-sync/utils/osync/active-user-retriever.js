'use strict';

var _ = require('underscore');
var async = require('async');
var blackListUtil = require(global.OSYNC_UTILS + 'blacklist-utils');

function getAllActiveUsers(log, config, environment, callback) {

    environment.pjds.getActiveUsers(function(error, response) {
        if (error) {
            log.error('active-users-retriever.getAllActiveUsers: Error response from active user generic store. Error: %s', error);
            return callback(null, []);
        }

        var activeUsers;
        try {
            activeUsers = JSON.parse(response.body).items;
        } catch(e) {
            log.error('active-users-retriever.getAllActiveUsers: Error parsing response from active user generic store.');
            activeUsers = [];
        }

        if (_.isEmpty(activeUsers)) {
            log.debug('active-users-retriever.getAllActiveUsers: No users to process.');
            return callback(null, []);
        }

        removeBlackListedUsers(log, environment, activeUsers, callback);
    });
}

function removeBlackListedUsers(log, environment, usersList, callback) {
    log.debug('active-users-retriever.filterForActiveUsers called');

    async.rejectSeries(usersList, function(user, rejectCallback) {
        log.debug('active-users-retriever.removeBlackListedUsers: checking %s is on blacklist for site %s.', user.id, user.site);

        blackListUtil.isBlackListedUser(log, environment, user, function(error, result) {
            rejectCallback(null, result);
        });

    }, function(error, results) {
        return callback(null, results);
    });
}

module.exports.getAllActiveUsers = getAllActiveUsers;
module.exports._removeBlackListedUsers = removeBlackListedUsers;
