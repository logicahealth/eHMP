'use strict';

var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var blackListUtil = require(global.OSYNC_UTILS + 'blacklist-utils');

function getAllActiveUsers(log, config, environment, callback) {
    environment.jds.getActiveUsers(function(error, response) {
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

        var result = transformUserFormat(activeUsers);
        filterForActiveUsers(log, config, environment, result, moment(), callback);
    });
}

function filterForActiveUsers(log, config, environment, usersList, now, callback) {
    log.debug('active-users-userscreen-retriever.filterForActiveUsers called');

    now = typeof now !== 'undefined' ? now : moment();
    var active_user_threshold = config.activeUserThresholdDays ? config.activeUserThresholdDays : 30;

    async.filter(usersList, function(user, filterCallback) {
        if (!user.lastSuccessfulLogin || (now.diff(moment(user.lastSuccessfulLogin.substring(0, 10)), 'days') > active_user_threshold)) {
            return filterCallback(null, false);
        }

        if (user.uid) {
            log.debug('active-users-userscreen-retriever.filterForActiveUsers: checking %j is on blacklist.', user.uid);

            return blackListUtil.isBlackListedUser(log, environment, user, function(error, result) {
                filterCallback(null, !result);
            });
        }

        return filterCallback(null, false);
    }, function(error, results) {
        callback(error, results);
    });
}

function transformUserFormat(users) {
    var transformedUsers = [];

    _.each(users, function(user) {
        var sites = _.keys(user.duz);

        _.each(sites, function(site) {
            transformedUsers.push({uid: 'urn:va:user:' + site + ':' + user.duz[site], id: user.duz[site], site: site, lastSuccessfulLogin: user.lastlogin});
        });
    });

    return transformedUsers;
}

module.exports.getAllActiveUsers = getAllActiveUsers;
module.exports._filterForActiveUsers = filterForActiveUsers;
