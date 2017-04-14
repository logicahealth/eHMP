'use strict';

require('../../env-setup');

var util = require('util');
var ActiveUserCleanupUtil = require(global.OSYNC_UTILS + 'active-user-cleanup-util');
var pollerUtils = require(global.VX_UTILS + 'poller-utils');


var argv;
argv = require('yargs')
    .usage('\r\nThis utility will clean up the old active users from the both JDS and pJDS.  \r\n\r\nUsage: $0 --force ')
    .describe('force', 'Trigger the clean up process to start.')
    .describe('log-level', 'Set a bunyan log level. Default is error. Possible values from most to least verbose: trace, debug, info, warn, error, fatal')
    .demand(['force'])
    .argv;

var config = require(global.VX_ROOT + 'worker-config');

var logUtil = require(global.VX_UTILS + 'log');
var log = logUtil._createLogger({
    name: 'remove-osync-activeuser',
    level: argv['log-level'] || 'error',
    child: logUtil._createLogger
});

var environment = pollerUtils.buildOsyncEnvironment(log, config);

// Kick off the script...
//------------------------
var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
activeUserCleanupUtil.removeInactiveUsers(function(error) {
    var message = '';

    if (error) {
        message = util.format('active-user-cleanup-run: Error removing users. Error: %j' + error);
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

    message = 'active-user-cleanup-run: Removal of inactive users complete.';
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
