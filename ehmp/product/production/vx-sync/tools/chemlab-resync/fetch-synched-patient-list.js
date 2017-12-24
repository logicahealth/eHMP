'use strict';

var _ = require('underscore');

var chemLabUtil = require('./chemlab-patient-util');

var argv = require('yargs')
    .usage('Usage: $0 --protocol <protocol> --host <host> --port <port> --output-file <output-file> --append --all-synced-patients --log-level <log-level>')
    .demand(['host', 'port', 'output-file'])
    .alias('h', 'host')
    .alias('p', 'port')
    .alias('c', 'protocol')
    .alias('l', 'log-level')
    .alias('a', 'append')
    .alias('o', 'output-file')
    .alias('s', 'all-synced-patients')
    .alias('?', 'help')
    .help('help')
    .argv;

var logger = require('bunyan').createLogger({
    name: 'beanstalk-admin',
    level: argv['log-level'] || 'warn'
});

var protocol = argv.protocol || 'http';
var host = argv.host;
var port = argv.port;

var jdsConfig = {
    protocol: protocol,
    host: host,
    port: port
};

var outputFile = argv['output-file'];
var append = _.has(argv, 'append');
var allSyncedPatients = _.has(argv, 'all-synced-patients');

chemLabUtil.createPatientList(logger, jdsConfig, outputFile, append, allSyncedPatients, function(error) {
    if (error) {
        console.log('Utility failed to create patient list file: %s', outputFile);
        console.log(error);
        return process.exit(1);
    }

    console.log('Patient list file created: %s', outputFile);
    return process.exit();
});
