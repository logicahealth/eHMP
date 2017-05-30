'use strict';

require('../../env-setup');

var _ = require('underscore');
var async = require('async');

var objUtil = require(global.VX_UTILS + 'object-utils');
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');

//-------------------------------------------------------------------------
// Constructor for this class.
//
// log: The logger to be used.
// config: Standard config information
// environment: Standard environment information.
//-------------------------------------------------------------------------
function OSyncActiveUserListUtil(log, config, environment) {
    if (!(this instanceof OSyncActiveUserListUtil)) {
        return new OSyncActiveUserListUtil(log, config);
    }
    this.log = log;
    // this.log = require('bunyan').createLogger({
    //  name: 'osync-active-user-list-util',
    //  level: 'debug'
    // });

    this.config = config;
    this.environment = environment;
    this.log.debug('osync-active-user-list-util.constructor: Leaving method.');

    // the following is a hook that allows us to mock out the activeUserRetriever to use for unit testing.
    //----------------------------------------------------------------------------------------------------
    if (!environment.activeUserRetriever) {
        this.activeUserRetriever = require(global.OSYNC_UTILS + 'active-user-retriever');
    } else {
        this.activeUserRetriever = environment.activeUserRetriever;
    }

    // the following is a hook that allows us to mock out the activeUserRetriever to use for unit testing.
    //----------------------------------------------------------------------------------------------------
    if (!environment.activeUserScreenRetriever) {
        this.activeUserScreenRetriever = require(global.OSYNC_UTILS + 'active-user-userscreen-retriever');
    } else {
        this.activeUserScreenRetriever = environment.activeUserScreenRetriever;
    }
}


//--------------------------------------------------------------------------------------------------------
// This function takes the results received from pJds and the results received from the jds user screen
// mechanism and merges the list together removing duplicates.
//
// pJdsUsers: The items retrieved from pJds
// jdsUserScreenUsers: The items retrieved from the user screen area in JDS.
// returns: An array of users were the result of merging the two lists.
//--------------------------------------------------------------------------------------------------------
OSyncActiveUserListUtil.prototype.mergeUsers = function(pJdsUsers, jdsUserScreenUsers) {
    var self = this;
    self.log.debug('osync-active-user-list-util.mergeUsers: Entered method. pJdsUsers: %j; jdsUserScreenUsers: %j', pJdsUsers, jdsUserScreenUsers);

    if ((!_.isArray(pJdsUsers)) && (!_.isArray(jdsUserScreenUsers))) {
        return[];
    }

    if ((_.isArray(pJdsUsers)) && (!_.isArray(jdsUserScreenUsers))) {
        return pJdsUsers;
    }

    if ((!_.isArray(pJdsUsers)) && (_.isArray(jdsUserScreenUsers))) {
        return jdsUserScreenUsers;
    }

    // Both parameters exist - merge them together.
    //---------------------------------------------
    return _.uniq(_.union(pJdsUsers, jdsUserScreenUsers), false, _.property('uid'));
};


//--------------------------------------------------------------------------------------------------------
// This function retreives the active users that are stored in pJds.
//
// callback: The call back handler that is called when this is done.   It has the following
//           signature:
//              function(error, result)
//                 where:
//                    error: Is any error that has occurred or null if there is no error.
//                    result: An array of users retrieved from pJds
//--------------------------------------------------------------------------------------------------------
OSyncActiveUserListUtil.prototype.retreiveActiveUsersFromPJds = function(callback) {
    var self = this;
    self.log.debug('osync-active-user-list-util.retreiveActiveUsersFromPJds: Entered method.');

    self.activeUserRetriever.getAllActiveUsers(self.log, self.config, self.environment, function(error, result) {
        self.log.debug('osync-active-user-list-util.retreiveActiveUsersFromPJds: Returned from retrieving users from pJDS.  error: %j; result: %j', error, result);

        if (error) {
            self.log.error('active-users.retreiveActiveUsersFromPJds: Error retrieving active user lists from active user generic data store in JDS.  Error: %s', error);
            return callback(error, []);
        }

        if ((_.isUndefined(result)) || (!_.isArray(result)) || (result.length === 0)) {
            self.log.debug('active-users.retreiveActiveUsersFromPJds: No active users found in active user generic data store in JDS.');
            return callback(null, []);
        }

        return callback(null, result);
    });
};

//--------------------------------------------------------------------------------------------------------
// This function retreives the active users that are stored in JDS user screen.  This function will
// only retrieve items if the system is configured in mixedEnvironmentMode.  If it is not configured that
// way then it will always return an empty array.
//
// callback: The call back handler that is called when this is done.   It has the following
//           signature:
//              function(error, result)
//                 where:
//                    error: Is any error that has occurred or null if there is no error.
//                    result: An array of users retrieved from JDS user screen.
//--------------------------------------------------------------------------------------------------------
OSyncActiveUserListUtil.prototype.retrieveActiveUsersFromJdsUserScreen = function(callback) {
    var self = this;
    self.log.debug('osync-active-user-list-util.retrieveActiveUsersFromJdsUserScreen: Entered method.');

    // If we are not configured in mixedEnvironmentMode - return immediately with no results.
    //----------------------------------------------------------------------------------------
    if (_.isUndefined(objUtil.getProperty(self.config, 'osync', 'mixedEnvironmentMode')) ||
        (!objUtil.getProperty(self.config, 'osync', 'mixedEnvironmentMode'))) {
        self.log.debug('active-user.retrieveActiveUsersFromJdsUserScreen: No work to be done. Not in mixed environment mode.');
        return callback(null, []);
    }

    self.activeUserScreenRetriever.getAllActiveUsers(self.log, self.config.osync, self.environment, function(error, result) {
        self.log.debug('osync-active-user-list-util.retrieveActiveUsersFromJdsUserScreen: Returned from retrieving users from user screen.  error: %j; result: %j', error, result);
        if (error) {
            self.log.error('active-users.retrieveActiveUsersFromJdsUserScreen: Error retrieving active user lists from active user user screen in JDS.');
            return callback(error, []);
        }

        if ((_.isUndefined(result)) || (!_.isArray(result)) || (result.length === 0)) {
            self.log.debug('active-users.retrieveActiveUsersFromJdsUserScreen: No active users found in active user user screen in JDS.');
            return callback(null, []);
        }

        return callback(null, result);
    });
};


//--------------------------------------------------------------------------------------------------------
// This function retrieves the list of active users.  If the system is configured in mixedEnvironmentMode,
// then it will retreive the list of users that were stored in the old way (JDS user screen) along with
// the list of users stored in the new way (pJDS).  It merges the lists together.
//
// activeUsersCallback: The call back handler that is called when this is done.   It has the following
//           signature:
//              function(error, result)
//                 where:
//                    error: Is any error that has occurred or null if there is no error.
//                    users: An array of users retrieved from pJDS and JDS user screen.
//--------------------------------------------------------------------------------------------------------
OSyncActiveUserListUtil.prototype.getActiveUsers = function(activeUsersCallback) {
    var self = this;
    self.log.debug('osync-active-user-list-util.getActiveUsers: Entered method.');

    var tasks = [
        self.retreiveActiveUsersFromPJds.bind(self),
        self.retrieveActiveUsersFromJdsUserScreen.bind(self)
    ];
    async.parallel(tasks, function(error, results) {
        self.log.debug('osync-active-user-list-util.getActiveUsers: Returned from retrieving active users from JDS and pJDS.  error: %j; results: %j', error, results);

        if (error) {
            return activeUsersCallback(error, []);
        }

        if (_.isEmpty(results[0])) {
            return activeUsersCallback(null, results[1]);
        }

        if (_.isEmpty(results[1])) {
            return activeUsersCallback(null, results[0]);
        }

        return activeUsersCallback(null, self.mergeUsers(results[0], results[1]));

    });
};

//------------------------------------------------------------------------------------------------
// This feature creates the jobs to be published.  There will be one job per user.
//
// users: An array of users for which jobs will be created.
// returns: The array of jobs to be published.  One job per user.
//------------------------------------------------------------------------------------------------
OSyncActiveUserListUtil.prototype.createJobsForUsers = function(users, referenceInfo){
    var self = this;
    self.log.debug('osync-active-user-list-util.createJobsForUsers: Entered method.  users: %j', users);

    var jobsToPublish = [];
    if (_.isEmpty(users)) {
        return jobsToPublish;
    }

    _.each(users, function(user) {
        var meta = {
            'source':'active-users',
            'user': user,
            'referenceInfo': referenceInfo
        };

        if(referenceInfo){
            meta.referenceInfo = referenceInfo;
        }

        var jobToPublish = jobUtil.createPatientListJob(self.log, meta);
        jobsToPublish.push(jobToPublish);
    });

    return jobsToPublish;
};

//----------------------------------------------------------------------------------------------
// This function retreives the active user list and processes the list by creating one job for
// each user and publishing that to the Patient List Handler.
//
// callback: The call back handler that is called when this is done.   It has the following
//           signature:
//              function(error, numUsersProcessed)
//                 where:
//                    error: Is any error that has occurred or null if there is no error.
//                    numUsersProcessed: The number of users that were processed.
//----------------------------------------------------------------------------------------------
OSyncActiveUserListUtil.prototype.retrieveAndProcessActiveUserList = function(referenceInfo, callback) {
    var self = this;

    self.log.debug('osync-active-user-list-util.retrieveAndProcessActiveUserList: Entered method.');
    self.getActiveUsers(function(error, users) {
        self.log.debug('osync-active-user-list-util.retrieveAndProcessActiveUserList: Returned from getActiveUsers: error: %j; users: %j.', error, users);

        if (error) {
            return callback(error, 0);
        }

        if (_.isEmpty(users)) {
            return callback(null, 0);
        }

        var jobsToPublish = self.createJobsForUsers(users, referenceInfo);
        self.log.debug('osync-active-user-list-util.retrieveAndProcessActiveUserList: Returned from creating jobs.  jobsToPublish: %j', jobsToPublish);

        self.environment.publisherRouter.publish(jobsToPublish, function(error) {
            if (error) {
                self.log.error('osync-active-user-list-util.retrieveAndProcessActiveUserList: Failed to publish jobs.  JobsToPublish: %j', jobsToPublish);
                return callback(error, 0);
            }

            return callback(null, users.length);
        });

    });
};

module.exports = OSyncActiveUserListUtil;
