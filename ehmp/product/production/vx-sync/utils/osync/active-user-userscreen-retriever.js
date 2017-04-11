'use strict';

var _ = require('underscore');
var moment = require('moment');

var jdsUtil = require(global.OSYNC_UTILS + 'jds-utils');

function getAllActiveUsers(log, config, callback) {

    jdsUtil.getFromJDS(log, config, 'osyncusers', function(error, response) {
        if (error) {
            log.error('active-users-userscreen-retriever.getAllActiveUsers: Error response from active user userscreen. Error: %s', error);
            return callback();
        }

        var activeUsers;
        try {
            activeUsers = JSON.parse(response.body).users;
        } catch(e) {
            log.error('active-users-userscreen-retriever.getAllActiveUsers: Error parsing response from active user user screen.');
            activeUsers = [];
        }

        if (_.isEmpty(activeUsers)) {
            log.debug('active-users-userscreen-retriever.getAllActiveUsers: No users in JDS to process');
            return callback(null, []);
        }

        var result = filterForActiveUsers(log, config, activeUsers, moment());
        result = transformUserFormat(result);

        callback(null, result);
    });
}

function filterForActiveUsers(log, config, usersList, now) {
    log.debug('active-users-userscreen-retriever.filterForActiveUsers called');

    now = typeof now !== 'undefined' ? now : moment();
    var active_user_threshold = config.activeUserThresholdDays ? config.activeUserThresholdDays : 30;

    return _.filter(usersList, function(user) {
        if (!user.lastlogin) {
            return false;
        }

        if (user.duz) {
            log.debug('active-users-userscreen-retriever.filterForActiveUsers: checking %j is on blacklist.', user.duz);

            var blacklisted = isBlackListedUser(user, config);
            if (blacklisted) {
                return false;
            }
        }

        return now.diff(moment(user.lastlogin.substring(0, 10)), 'days') <= active_user_threshold;
    });
}

function isBlackListedUser(user, config) {
    return _.some(_.keys(user.duz), function(site) {
        if (config.vistaSites[site] && config.vistaSites[site].inactiveUsers) {
            return _.contains(config.vistaSites[site].inactiveUsers, user.duz[site]);
        }
        return false;
    });
}

function transformUserFormat(users) {
    var transformedUsers = [];

    _.each(users, function(user) {
        var sites = _.keys(user.duz);

        _.each(sites, function(site) {
            transformedUsers.push({uid: 'urn:va:user:' + site + ':' + user.duz[site], id: user.duz[site], site: site});
        });
    });

    return transformedUsers;
}

module.exports.getAllActiveUsers = getAllActiveUsers;
module.exports._filterForActiveUsers = filterForActiveUsers;
