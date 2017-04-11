'use strict';

require('../../env-setup');

var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var jdsUtil = require(global.OSYNC_UTILS + 'jds-utils');

function removeInactiveUsers(log, oSyncConfig) {
    var tasks = [removeUsersFromGenericStore.bind(null, log, oSyncConfig),
                 removeUsersFromUserScreen.bind(null, log, oSyncConfig)];

    log.info('active-user-cleanup.removeInactiveUsers: Starting the removal of inactive users.');

    async.parallel(tasks, function(err) {
        if(err) {
            log.error('active-user-cleanup.removeInactiveUsers: Error removing users. ' + err);
        }
        log.info('active-user-cleanup.removeInactiveUsers: Removal of inactive users complete.');
    })
}

function removeUsersFromGenericStore(log, oSyncConfig, callback) {
    var oldLastLoginDate = moment().subtract(oSyncConfig.activeUserThresholdDays || 30, 'd').format('YYYYMMDDHHmmss');

    jdsUtil.getFromPJDS(log, oSyncConfig, 'activeusr/', {filter: 'lt(lastSuccessfulLogin,' + oldLastLoginDate + ')'}, function(error, response) {
        if (error) {
            log.error('active-users-cleanup.removeUsersFromGenericStore: Error response from active user generic store. Error: %s', error);
            return callback();
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
            return callback();
        }

        async.each(activeUsers, function(activeUser, deleteCallback) {
            jdsUtil.deleteFromPJDS(log, oSyncConfig, 'activeusr/' + activeUser.uid, function(err) {
                if (err) {
                    log.error('active-users-cleanup.removeUsersFromGenericStore: Error deleting from active user generic store. Error: %s', err);
                }
                deleteCallback();
            })
        }, function(){
            return callback();
        });

    });
}

function removeUsersFromUserScreen(log, oSyncConfig, callback) {
    if (_.isUndefined(oSyncConfig.mixedEnvironmentMode) || !oSyncConfig.mixedEnvironmentMode) {
        log.debug('active-user-cleanup.removeUsersFromUserScreen: No work to be done. Not in mixed environment mode.');
        return callback();
    }

    var screen = 'osyncusers';

    jdsUtil.getFromJDS(log, oSyncConfig, screen, function(error, response) {
        if (error) {
            log.error('active-users-cleanup.removeUsersFromUserScreen: Error response from active user userscreen. Error: %s', error);
            return callback();
        }

        var activeUsers;
        try {
            activeUsers = JSON.parse(response.body).users;
        } catch(e) {
            log.error('active-users-cleanup.removeUsersFromUserScreen: Error parsing response from active user user screen.');
            activeUsers = [];
        }

        if (_.isEmpty(activeUsers)) {
            return callback();
        }

        var oldestLoginDate = moment().subtract(oSyncConfig.activeUserThresholdDays || 30, 'd');

        activeUsers = _.reject(activeUsers, function(activeUser) {
            if (activeUser.lastlogin) {
                log.debug('active-users-cleanup.removeUsersFromUserScreen: oldest - ' + oldestLoginDate.format('YYYYMMDDHHmmss') + ' user - ' + moment(activeUser.lastlogin).format('YYYYMMDDHHmmss') + ' isBefore ' + moment(activeUser.lastlogin).isBefore(oldestLoginDate));
                return moment(activeUser.lastlogin).isBefore(oldestLoginDate);
            } else {
                return true;
            }
        });

        log.debug('active-users-cleanup.removeUsersFromUserScreen: users to save ' + JSON.stringify(activeUsers) );

        jdsUtil.saveToJDS(log, oSyncConfig, screen, {users : activeUsers}, function(err) {
            if (err) {
                log.error('active-users-cleanup.removeUsersFromUserScreen: Error trying to save active user userscreen. ' + err);
            }
            return callback();
        });
    });
}

module.exports.removeInactiveUsers = removeInactiveUsers;

