'use strict';

var env = require('../../env-setup');

var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var argv = require('yargs')
    .usage('Usage: $0 --site <site> --id <id> --no-header --log-level <log-level>')
    .demand(['site', 'id'])
    .string('site')
    .alias('n', 'no-header')
    .argv;

var log = require('bunyan').createLogger({
    name: 'remove-osync-activeuser',
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
    console.log('Removing active user...');
}

jdsUtil.deleteFromPJDS(log, config.osync, 'activeusr/urn:va:user:'  + site + ':' + id, function(error, response) {
    if (error) {
        console.log('Error removing active user to generic data store. ' + error);
    }

    if (response.statusCode === 201 || response.statusCode === 200) {
        console.log('Active user removed from generic data store.');
    } else {
        console.log('Active user was not removed from generic data store. Status code: ' +
        response.statusCode + ', Response: ' + response.body);
    }

    console.log('\nProcessing complete.');
    process.exit(0);
});
