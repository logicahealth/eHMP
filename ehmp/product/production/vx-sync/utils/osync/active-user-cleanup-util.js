'use strict';

require('../../env-setup');

var _ = require('underscore');
var util = require('util');
var async = require('async');
var moment = require('moment');

//-------------------------------------------------------------------------------------------
// Constructor for this class.
//
// log: Bunyan logger to be used when logging messages.
// config: The worker-config.js settings.
// environment: The environment that contains shared resources.
//-------------------------------------------------------------------------------------------
function ActiveUserCleanupUtil(log, config, environment) {
    if (!(this instanceof ActiveUserCleanupUtil)) {
        return new ActiveUserCleanupUtil(log, config);
    }
    this.log = log;
    // this.log = require('bunyan').createLogger({
    //  name: 'osync-active-user-list-util',
    //  level: 'debug'
    // });

    this.config = config;
    this.osyncConfig = config.osync;
    this.environment = environment;
    this.log.debug('osync-active-user-list-util.constructor: Leaving method.');
}

//-------------------------------------------------------------------------------------------
// Remove the inactive users from pJDS and if we are running in mixed mode then also from
// JDS.
//
// callback: The call back handler to call when this is done.  It has the following signature:
//           function(error) where
//             error: Is the error if on occurs.
//-------------------------------------------------------------------------------------------
ActiveUserCleanupUtil.prototype.removeInactiveUsers = function(callback) {
    var self = this;

    var tasks = [
        self.removeUsersFromGenericStore.bind(self),
        self.removeUsersFromUserScreen.bind(self)
    ];

    self.log.info('active-user-cleanup.removeInactiveUsers: Starting the removal of inactive users.');

    async.parallel(tasks, function(error) {
        if (error) {
            return callback(error);
        }

        return callback(null);
    });
};

//-------------------------------------------------------------------------------------------
// Remove the inactive users from pJDS.
//
// callback: The call back handler to call when this is done.  It has the following signature:
//           function(error) where
//             error: Is the error if on occurs.
//-------------------------------------------------------------------------------------------
ActiveUserCleanupUtil.prototype.removeUsersFromGenericStore = function(callback) {
    var self = this;

    var oldLastLoginDate = moment().subtract(self.osyncConfig.activeUserThresholdDays || 30, 'd').format('YYYYMMDDHHmmss');
    var filter = {
        filter: '?filter=lt(lastSuccessfulLogin,' + oldLastLoginDate + ')'
    };

    self.environment.pjds.getActiveUsers(filter, function(error, response) {
        if (error) {
            self.log.error('active-users-cleanup.removeUsersFromGenericStore: Error response from active user generic store. Error: %j; response: %j', error, response);
            return callback(error);
        }

        if (!response) {
            self.log.error('active-users-cleanup.removeUsersFromGenericStore: No response received from JDS.');
            return callback('active-users-cleanup.removeUsersFromGenericStore: No response received from JDS.');
        }

        if (_.isEmpty(response.body)) {
            self.log.error('active-users-cleanup.removeUsersFromGenericStore: No response body message received from JDS.');
            return callback('active-users-cleanup.removeUsersFromGenericStore: No response body message received from JDS.');
        }

        var body;
        try {
            body = JSON.parse(response.body);
        } catch (e) {
            var errorMessage = util.format('active-users-retriever.removeUsersFromGenericStore: Error parsing response from active user generic store.  response.body: %j', response.body);
            self.log.error(errorMessage);
            return callback(errorMessage);
        }

        if (_.isEmpty(body.items)) {
            self.log.debug('active-users-retriever.removeUsersFromGenericStore: No users to process.');
            return callback(null);
        }

        var activeUsers = body.items;
        async.each(activeUsers, function(activeUser, deleteCallback) {
            self.environment.pjds.removeActiveUser(activeUser.uid, function(error) {
                // note that if we get an error - we do not want to stop - an error on one should not stop
                // errors on the rest.
                //----------------------------------------------------------------------------------------
                if (error) {
                    var errorMessage = util.format('active-users-cleanup.removeUsersFromGenericStore: Error deleting from active user generic store. Error: %s', error);
                    self.log.error(errorMessage);
                    return deleteCallback(errorMessage);
                }

                return deleteCallback(null);
            });
        }, function(error) {
            return callback(error);
        });

    });
};

//-------------------------------------------------------------------------------------------
// Remove the inactive users from jds.
//
// callback: The call back handler to call when this is done.  It has the following signature:
//           function(error) where
//             error: Is the error if on occurs.
//-------------------------------------------------------------------------------------------
ActiveUserCleanupUtil.prototype.removeUsersFromUserScreen = function(callback) {
    var self = this;

    if (_.isUndefined(self.osyncConfig.mixedEnvironmentMode) || !self.osyncConfig.mixedEnvironmentMode) {
        self.log.debug('active-user-cleanup.removeUsersFromUserScreen: No work to be done. Not in mixed environment mode.');
        return callback(null);
    }

    self.environment.jds.getActiveUsers(function(error, response) {
        if (error) {
            self.log.error('active-users-cleanup.removeUsersFromUserScreen: Error response from active user userscreen. Error: %s; response: %j', error, response);
            return callback(error);
        }

        if (!response) {
            self.log.error('active-users-cleanup.removeUsersFromUserScreen: No response received from JDS.');
            return callback('active-users-cleanup.removeUsersFromUserScreen: No response received from JDS.');
        }

        if (_.isEmpty(response.body)) {
            self.log.error('active-users-cleanup.removeUsersFromUserScreen: No response body message received from JDS.');
            return callback('active-users-cleanup.removeUsersFromUserScreen: No response body message received from JDS.');
        }

        var body;
        try {
            body = JSON.parse(response.body);
        } catch (e) {
            var errorMessage = util.format('active-users-retriever.removeUsersFromUserScreen: Error parsing response from active user user screen.  response.body: %j', response.body);
            self.log.error(errorMessage);
            return callback(errorMessage);
        }

        if (_.isEmpty(body.users)) {
            self.log.debug('active-users-retriever.removeUsersFromGenericStore: No users to process.');
            return callback(null);
        }

        var activeUsers = body.users;

        var oldestLoginDate = moment().subtract(self.osyncConfig.activeUserThresholdDays || 30, 'd');

        activeUsers = _.reject(activeUsers, function(activeUser) {
            if (activeUser.lastlogin) {
                self.log.debug('active-users-cleanup.removeUsersFromUserScreen: oldest - ' + oldestLoginDate.format('YYYYMMDDHHmmss') +
                    ' user - ' + moment(activeUser.lastlogin).format('YYYYMMDDHHmmss') + ' isBefore ' + moment(activeUser.lastlogin).isBefore(oldestLoginDate));
                return moment(activeUser.lastlogin).isBefore(oldestLoginDate);
            } else {
                return true;
            }
        });

        self.log.debug('active-users-cleanup.removeUsersFromUserScreen: users to save ' + JSON.stringify(activeUsers));

        self.environment.jds.saveActiveUsers(activeUsers, function(error) {
            if (error) {
                var errorMessage = util.format('active-users-cleanup.removeUsersFromUserScreen: Error trying to save active user userscreen. ' + error);
                self.log.error(errorMessage);
                return callback(errorMessage);
            }

            return callback(null);
        });
    });
};

module.exports = ActiveUserCleanupUtil;