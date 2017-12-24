'use strict';

var env = require('../../env-setup');

var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var config = require(global.VX_ROOT + 'worker-config');
var PjdsClient = require('jds-cache-api').PjdsClient;

var argv = require('yargs')
    .usage('Usage: $0 --site <site> --id <id> --no-header --log-level <log-level>')
    .string('site')
    .alias('n', 'no-header')
    .help()
    .argv;

var log = require('bunyan').createLogger({
    name: 'get-osync-activeuser',
    level: argv['log-level'] || 'error'
});

var noHeader = _.has(argv, 'no-header');
var site = argv.site;
var id = argv.id;

if (!noHeader) {
    console.log('Getting active users...');
}

var filter = {filter: ''};

if (id) {
    filter = {filter: '?filter=eq(id,\"' + id + '\")'};
} else if (site) {
    filter = {filter: '?filter=eq(site,\"' + site + '\")'};
}

var pjdsClient = new PjdsClient(log, log, config.pjds);

pjdsClient.getActiveUsers(filter, function(error, response) {
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
            _.each(activeUsers, function(activeUser) {
                console.log('User: ' + JSON.stringify(activeUser));
            });
        }
    }

    console.log('\nProcessing complete.');
    process.exit(0);
});
