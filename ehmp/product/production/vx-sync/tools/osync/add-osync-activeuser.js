'use strict';

var env = require('../../env-setup');

var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var config = require(global.VX_ROOT + 'worker-config');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');

var argv = require('yargs')
    .usage('Usage: $0 --site <site> --id <id> --last-login <lastSuccessfulLogin> --no-header --log-level <log-level>')
    .demand(['site', 'id'])
    .string('site')
    .string('id')
    .alias('n', 'no-header')
    .alias('l', 'last-login')
    .help()
    .argv;

var log = require('bunyan').createLogger({
    name: 'add-osync-activeuser',
    level: argv['log-level'] || 'error'
});

var noHeader = _.has(argv, 'no-header');
var site = argv.site;
var id = argv.id;
var lastSuccessfulLogin;

if (moment(argv.lastSuccessfulLogin, 'YYYYMMDDHHmmss').isValid()) {
    lastSuccessfulLogin = argv.lastSuccessfulLogin;
} else {
    lastSuccessfulLogin = moment().format('YYYYMMDDHHmmss');
}

if (!noHeader) {
    console.log('Adding active user...');
}

var user = {uid: 'urn:va:user:' + site + ':' + id, site: site, id: id, lastSuccessfulLogin: lastSuccessfulLogin};

var pjdsClient = new PjdsClient(log, log, config);

pjdsClient.addActiveUser(user, function(error, response) {
    if (error) {
        console.log('Error saving active user to generic data store. ' + error);
    }

    if (response.statusCode === 201 || response.statusCode === 200) {
        console.log('Active user saved to generic data store.');
    } else {
        console.log('Active user was not saved to generic data store. Status code: ' +
        response.statusCode + ', Response: ' + response.body);
    }

    console.log('\nProcessing complete.');
    process.exit(0);
});
