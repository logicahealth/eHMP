'use strict';

require('../../env-setup');

var _ = require('underscore');
var uuid = require('node-uuid');

var inspect = require('util').inspect;
var RpcClient = require('vista-js').RpcClient;

var argv = require('yargs')
    .usage('Usage: $0 [options...]')
    .demand(['host', 'port', 'dfn'])
    .describe('host', 'IP Address of the VistA host')
    .describe('port', 'Port of the VistA host')
    .describe('dfn', 'DFN of the patient for the subscribe request (\'OP\' for operational data)')
    .describe('domains', 'The domains to use when subscribing the patient. This is a comma-delimited list')
    .describe('accessCode', 'Value to use for accessCode for validation. Defaults to REDACTED')
    .describe('verifyCode', 'Value to use for verifyCode for validation. Defaults to REDACTED')
    .describe('localIP', 'Value to use for the localIP parameter in the RPC call. Defaults to 127.0.0.1')
    .describe('localAddress', 'Value to use for the localAddress parameter in the RPC call. Defaults to localhost')
    .describe('connectTimeout', 'Value in milliseconds to use for the connectTimeout parameter in the RPC call. Defaults to 3000')
    .describe('sendTimeout', 'Value in milliseconds to use for the sendTimeout parameter in the RPC call. Defaults to 10000')
    .describe('context', 'Context to set for running the RPC. Defaults to or HMP SYNCHRONIZATION CONTEXT')
    .describe('hmpServerId', 'Value for the hmpServerId parameter. Defaults to hmp-development-box')
    .describe('logLevel', 'bunyan log levels, one of: trace, debug, info, warn, error, fatal. Defaults to error.')
    .argv;


var domains = [
    'allergy',
    'auxiliary',
    'appointment',
    'diagnosis',
    'document',
    'factor',
    'immunization',
    'lab',
    'med',
    'obs',
    'order',
    'problem',
    'procedure',
    'consult',
    'image',
    'surgery',
    'task',
    'visit',
    'vital',
    'ptf',
    'exam',
    'cpt',
    'education',
    'pov',
    'skin',
    'treatment',
    'roadtrip',
    'patient'
];

if (!_.isEmpty(argv.domains)) {
    domains = _.map(argv.domains.split(','), function(domain) {
        return domain.trim();
    });
}

var logger = require('bunyan').createLogger({
    name: 'rpc',
    level: argv.logLevel || 'error'
});

var rpc = 'HMPDJFS API';
var params = {
    '"server"': argv.hmpServerId || 'hmp-development-box'
};


if (argv.dfn === 'OP') {
    params['"command"'] = 'startOperationalDataExtract';
} else {
    params['"command"'] = 'putPtSubscription';
    params['"localId"'] = String(argv.dfn);
    params['"rootJobId"'] = uuid.v4();
    params['"HMPSVERS"'] = 1;

    _.each(domains, function(domain) {
        var jobDomainId = '"jobDomainId-' + domain + '"';
        params[jobDomainId] = uuid.v4();
    });
}


var config = {
    host: argv.host,
    port: argv.port,
    accessCode: argv.accessCode || 'REDACTED',
    verifyCode: argv.verifyCode || 'REDACTED',
    localIP: argv.localIP || '127.0.0.1',
    localAddress: argv.localAddress || 'localhost',
    context: argv.context || 'HMP SYNCHRONIZATION CONTEXT',
    connectTimeout: argv.connectTimeout || 3000,
    sendTimeout: argv.sendTimeout || 10000
};

RpcClient.callRpc(logger, config, rpc, params, function(error, response) {
    logger.debug('Completed calling Subscribe RPC for dfn: %s; result: %j', argv.dfn, response);
    if (error) {
        console.log('Error calling Subscribe for dfn: %s', argv.dfn);
        console.log(error);
        if (response) {
            console.log(response);
        }
        process.exit(1);
    }

    console.log('Called Subscribe for dfn: %s', argv.dfn);
    console.log('Response:');
    try {
        console.log(inspect(JSON.parse(response), {
            depth: null
        }));
    } catch (err) {
        console.log(response);
    }
    process.exit(0);
});

var logger = require('bunyan').createLogger({
    name: 'rpc',
    level: argv.logLevel || 'error'
});

var rpc = 'HMPDJFS API';
var params = {
    '"server"': argv.hmpServerId || 'hmp-development-box'
};


if (argv.dfn === 'OP') {
    params['"command"'] = 'startOperationalDataExtract';
} else {
    params['"command"'] = 'putPtSubscription';
    params['"localId"'] = String(argv.dfn);
}


var config = {
    host: argv.host,
    port: argv.port,
    accessCode: argv.accessCode || 'REDACTED',
    verifyCode: argv.verifyCode || 'REDACTED',
    localIP: argv.localIP || '127.0.0.1',
    localAddress: argv.localAddress || 'localhost',
    context: argv.context || 'HMP SYNCHRONIZATION CONTEXT',
    connectTimeout: argv.connectTimeout || 3000,
    sendTimeout: argv.sendTimeout || 10000
};

RpcClient.callRpc(logger, config, rpc, params, function(error, response) {
    logger.debug('Completed calling Subscribe RPC for dfn: %s; result: %j', argv.dfn, response);
    if (error) {
        console.log('Error calling Subscribe for dfn: %s', argv.dfn);
        console.log(error);
        if (response) {
            console.log(response);
        }
        process.exit(1);
    }

    console.log('Called Subscribe for dfn: %s', argv.dfn);
    console.log('Response:');
    try {
        console.log(inspect(JSON.parse(response), {
            depth: null
        }));
    } catch (err) {
        console.log(response);
    }
    process.exit(0);
});