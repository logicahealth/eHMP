'use strict';

var _ = require('underscore');
var async = require('async');

var activeUserUserScreenRetriever = require(global.OSYNC_UTILS + 'active-user-userscreen-retriever');
var activeUserUserRetriever = require(global.OSYNC_UTILS + 'active-user-retriever');
var nullUtil = require(global.VX_UTILS + 'null-utils');
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');

function handle(log, config, environment, job, handlerCallback) {
    log.debug('active-users.handle : received request to save ' + JSON.stringify(job));

    if (nullUtil.isNullish(job.type) || job.type !== 'active-users') {
        log.debug('active-users.handle: No Job type or incorrect job type received');
        return handlerCallback();
    }

    async.parallel([
            function(callback){
                activeUserUserRetriever.getAllActiveUsers(log, config, function (error, result) {
                    if (error) {
                        log.error('active-users.handle: Error retrieving active user lists from active user generic data store in JDS.');
                        return callback(null, []);
                    }

                    if (_.isUndefined(result) || result.length === 0) {
                        log.debug('active-users.handle: No active users found in active user generic data store in JDS.');
                        return callback(null, []);
                    }

                    return callback(null, result);

                });
            },
            function(callback){
                if (_.isUndefined(config.mixedEnvironmentMode) || !config.mixedEnvironmentMode) {
                    log.debug('active-user.handle: No work to be done. Not in mixed environment mode.');
                    return callback(null, []);
                }

                activeUserUserScreenRetriever.getAllActiveUsers(log, config, function (error, result) {
                    if (error) {
                        log.error('active-users.handle: Error retrieving active user lists from active user user screen in JDS.');
                        return callback(null, []);
                    }

                    if (_.isUndefined(result) || result.length === 0) {
                        log.debug('active-users.handle: No active users found in active user user screen in JDS.');
                        return callback(null, []);
                    }

                    return callback(null, result);
                });
            }
        ],
        function(err, results){
            if (_.isEmpty(results[1])) {
                job.users = results[0];
            } else {
                job.users = mergeUsers(results[0], results[1]);
            }

            job.source = 'active-users';

            var jobToPublish = jobUtil.createPatientListJob(log, config, environment, job);
            log.debug('active-users.handle: ' + jobToPublish.toString());

            environment.publisherRouter.publish(jobToPublish, handlerCallback);
        });
}

function mergeUsers(genericDataStoreUsers, userScreenUsers) {
    return _.uniq(_.union(genericDataStoreUsers, userScreenUsers), false, _.property('uid'))
}

module.exports = handle;

