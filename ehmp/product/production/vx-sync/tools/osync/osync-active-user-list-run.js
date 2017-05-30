'use strict';

require('../../env-setup');
var util = require('util');

var OSyncActiveUserListUtil = require(global.OSYNC_UTILS + 'osync-active-user-list-util');
var pollerUtils = require(global.VX_UTILS + 'poller-utils');
var uuid = require('node-uuid');

var argv;
argv = require('yargs')
    .usage('\r\nThis utility will reqeust a sync for the patients of each active user.  \r\n\r\nUsage: $0 --force ')
    .describe('force', 'Trigger the sync for the patients of each active user.')
    .describe('log-level', 'Set a bunyan log level. Default is error. Possible values from most to least verbose: trace, debug, info, warn, error, fatal')
    .demand(['force'])
    .argv;


var config = require(global.VX_ROOT + 'worker-config');

// Need to make sure all the default beanstalk settings are copied to each job instance
//--------------------------------------------------------------------------------------
var queueConfig = require(global.VX_JOBFRAMEWORK).QueueConfig;
queueConfig.createFullBeanstalkConfig(config.osync.beanstalk);

var referenceInfo = {
    sessionId: uuid.v4(),
    utilityType: 'osync-active-user-list'
};

var logUtil = require(global.VX_UTILS + 'log');
var log = logUtil._createLogger({
    name: 'osync-active-user-list-run',
    level: argv['log-level'] || 'error'
}).child(referenceInfo);

var environment = pollerUtils.buildOsyncEnvironment(log, config);

console.log('osync-active-user-list-run: Utility started. sessionId: %s', referenceInfo.sessionId);

var oSyncActiveUserListUtil = new OSyncActiveUserListUtil(log, config, environment);
oSyncActiveUserListUtil.retrieveAndProcessActiveUserList(referenceInfo, function(error, numUsersProcessed) {
    var message = '';

    if (error) {
        message = util.format('An error occurred calling oSyncActiveUserListUtil.retrieveAndProcessActiveUserList: %j', error);
        log.error(message);
        console.log(message);

        // Since we may still have log files being written to, we do not want to kill this process without giving them
        // some time to catch up.  Also - we have to use process.exit because JDS uses a forever agent - so it keeps
        // things open.
        //------------------------------------------------------------------------------------------------------------
        setTimeout(function() {
            process.exit();
        }, 1000);
    }

    message = util.format('Process completed successfully.  Number of users processed was: %s', numUsersProcessed);
    console.log(message);
    log.info(message);

    // Since we may still have log files being written to, we do not want to kill this process without giving them
    // some time to catch up.  Also - we have to use process.exit because JDS uses a forever agent - so it keeps
    // things open.
    //------------------------------------------------------------------------------------------------------------
    setTimeout(function() {
        process.exit();
    }, 1000);
});