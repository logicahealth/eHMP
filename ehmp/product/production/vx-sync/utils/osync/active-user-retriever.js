'use strict';

var _ = require('underscore');
var jdsUtil = require(global.OSYNC_UTILS + 'jds-utils');

function getAllActiveUsers(log, config, callback) {

    jdsUtil.getFromPJDS(log, config, 'activeusr/', undefined, function(error, response) {
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

        var result = removeBlackListedUsers(log, config, activeUsers);

        callback(null, result);
    });
}

function removeBlackListedUsers(log, config, usersList) {
    log.debug('active-users-retriever.filterForActiveUsers called');

    return _.reject(usersList, function(user) {
        log.debug('active-users-retriever.filterForActiveUsers: checking %s is on blacklist for site %s.', user.id, user.site);
        return isBlackListedUser(user, config);
    });
}

function isBlackListedUser(user, config) {
    return _.has(config.vistaSites, user.site) && _.has(config.vistaSites[user.site], 'inactiveUsers') &&
        _.contains(config.vistaSites[user.site].inactiveUsers, user.id);
}

module.exports.getAllActiveUsers = getAllActiveUsers;
module.exports._removeBlackListedUsers = removeBlackListedUsers;
