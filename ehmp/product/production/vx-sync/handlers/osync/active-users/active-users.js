'use strict';

var _ = require('lodash');
var moment = require('moment');

var nullUtil = require(global.VX_UTILS + 'null-utils');
var jobUtil = require(global.VX_UTILS + 'osync-job-utils');
var jdsUtil = require(global.VX_UTILS + 'jds-utils');
var users_list_screen_id = 'osyncusers';

function handle(log, config, environment, job, handlerCallback) {
    log.debug('active-users.handle : received request to save ' + JSON.stringify(job));

    if (nullUtil.isNullish(job.type) || job.type !== 'active-users') {
        log.debug('active-users.handle: No Job type or incorrect job type received');
        return;
    }

    jdsUtil.getFromJDS(log, config, users_list_screen_id, function(error, response) {
        var responseBody = response.body;
        log.debug('active-users.handle: responseBody = ' + responseBody);
        var activeUsers = JSON.parse(responseBody).users;
        log.debug('active-users.handle: activeUsers = ' + JSON.stringify(activeUsers)); 

        if (_.isUndefined(activeUsers)) {
            log.debug('active-users.handle: No users in JDS to process');
            return handlerCallback();
        }

        var result = filterForActiveUsers(log, config, activeUsers, moment());
        job.source = 'active-users';
        job.users = result;

        var jobToPublish = jobUtil.createPatientListJob(log, config, environment, job);
        log.debug('active-users.handle: ' + jobToPublish.toString());

        environment.publisherRouter.publish(jobToPublish, handlerCallback);
    });
}

function filterForActiveUsers(log, config, usersList, now) {
    log.debug('filterForActiveUsers called');

    now = typeof now !== 'undefined' ? now : moment();
    var active_user_threshold = config.activeUserThresholdDays ? config.activeUserThresholdDays : 30;

    return _.filter(usersList, function(user) {
        if (!user.lastlogin) {
            return false;
        }

        if (user.duz) {
            log.debug('checking ' + JSON.stringify(user.duz) + ' for user blacklist.');
            var blacklisted = _.some(_.keys(user.duz), function(site) {
                if (config.vistaSites[site] && config.vistaSites[site].inactiveUsers) {
                    return _.contains(config.vistaSites[site].inactiveUsers, user.duz[site]);
                }
                return false;
            });
            if (blacklisted) {
                return false;
            }
        }

        return now.diff(moment(user.lastlogin.substring(0, 10)), 'days') <= active_user_threshold;
    });
}

module.exports = handle;
module.exports._filterForActiveUsers = filterForActiveUsers;
