'use strict';

var env = require('../../env-setup');

var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var argv = require('yargs')
    .usage('Usage: $0 --site <site> --id <id> --no-header --log-level <log-level>')
    .string('site')
    .alias('n', 'no-header')
    .argv;

var log = require('bunyan').createLogger({
    name: 'get-osync-activeuser',
    level: argv['log-level'] || 'error'
});
var config = require(global.VX_ROOT + 'worker-config.json').vxsync;
config.osync.vistaSites = config.vistaSites;
config.osync.rpcContext = 'HMP UI CONTEXT';

var jdsUtil = require(global.OSYNC_UTILS + 'jds-utils');

var noHeader = _.has(argv, 'no-header');
var site = argv.site;
var id = argv.id;

if (!noHeader) {
    console.log('Getting active users...');
}

var filter ='';

if (id) {
    filter = {filter: 'eq(id,\"' + id + '\")'};
} else if (site) {
    filter = {filter: 'eq(site,\"' + site + '\")'};
}

jdsUtil.getFromPJDS(log, config.osync, 'activeusr/', filter, function(error, response) {
    if (error) {
        console.log('Error response from active user generic store. Error: %s', error);
    } else {
        var activeUsers;
        try {
            activeUsers = JSON.parse(response.body).items;
        } catch(e) {
            console.log('Error parsing response from active user generic store.');
            activeUsers = [];
        }

        if (_.isEmpty(activeUsers)) {
            console.log('No users to process.');
        } else {
            async.eachSeries(activeUsers, function(user, callback) {
                console.log('User: ' + JSON.stringify(user));
                return callback();

            });
        }
    }

    console.log('\nProcessing complete.');
    process.exit(0);
});
