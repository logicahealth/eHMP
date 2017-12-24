#!/usr/bin/env node
'use strict';
/* eslint-disable no-console */

const path = require('path');
const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');
const docopt = require('docopt');

const handleCli = require('./jds-runner').handleCli;

const name = path.basename(process.argv[1]);
const usage = `
Usage:
    ${name} <method> [options] [(--verbose | --short) --raw-logs]
    ${name} <method> --parameters
    ${name} --methods
    ${name} -h | --help
    ${name} --version

Arguments:
    <method>            The method to invoke. See --methods.

Options:
    --id=<id>                       String.
    --site=<site>                   String.
    --list=<list>                   String.
    --store=<store>                 String.
    --uid=<uid>                     String.
    --data=<data>                   Object. Pass like --data='{"hello":"world"}'
    --index=<index>                 String.
    --filter=<filter>               String.
    --template=<template>           String.
    --delete-all=<delete-all>       Boolean. Whether to delete every item
                                    (requires uid to be undefined or null)
    --params=<params>               Object. Pass like --params='{"limit":5}'
    --range=<range>                 String.
    --order=<order>                 String.
    --start=<start>                 Number.
    --start-id=<start-id>           String.
    --bail=<bail>                   String.
    --limit=<limit>                 Number.
    --return-counts=<return-counts> Boolean.
    --active-user=<active-user>     String.
    --document=<document>           String.
    --index-data=<index-data>       String.
    --patch=<patch>                 Boolean. Whether to patch the data.
    --skip-locked=<skip-locked>     Boolean. Whether to skip locked items.
    -v --verbose    Show the full contents of objects.
    -s --short      Show only the top level of objects.
    -r --raw-logs   Don't pretty-print output.
    --parameters    Show parameters for the chosen method.
    --methods       Show available methods and their parameters.
    -h --help       Show this help.
    --version       Show version.

If the method wants a non-String type, then the options above attempt to be
parsed as JSON.
Example: --params='{"limit":2}'  # JSON.parse('{"limit":2}') -> {limit: 2}
To pass a string surrounded by quote marks, ensure the quote marks
are properly escaped by the shell, like the output of echo '"hi"'
Example: --filter='"hi"'  # becomes "hi"

Environment:
    PJDS_IP_ADDRESS
    PJDS_TCP_PORT
    PJDS_USERNAME    base64-encoded username
    PJDS_PASSWORD    base64-encoded password
    PJDS_NAMESPACE

Examples:
    ${name} --methods
    ${name} setPjdsStoreData --parameters
    ${name} addActiveUser --uid urn:va:user:1
    ${name} addToOsyncBlist --id=1 --site SITE --list user
    ${name} getPrefetchPatients --filter '[2017070106..2017073112]' --index ehmp-patients --template minimal
    ${name} createPjdsStore --store pjdsstore
    ${name} clearPjdsStore --store pjdsstore
    ${name} getPjdsStoreInfo --store pjdsstore
    ${name} getPjdsStoreData --store pjdsstore --uid urn:va:pjdsstore:1
    ${name} setPjdsStoreData --store pjdsstore --uid urn:va:pjdsstore:1 --data '{"name":"value"}'
    ${name} deletePjdsStoreData --store pjdsstore --uid urn:va:pjdsstore:1
    ${name} createPjdsStoreIndex --store pjdsstore --data '{"name":"value"}'
    ${name} getPjdsStoreIndexData --store pjdsstore --index pjdsindex
`;

if (require.main === module) {
    return main();
}
return; // Everything below must be in a function

/**
 * @return {*}
 */
function main() {
    process.on('uncaughtException', (error) => {
        console.trace('Uncaught Exception\n', error);
        process.exit(1);
    });
    require('../tests/integrationtests/_environment-setup');

    const args = docopt.docopt(usage, {version: '0.1.0'});

    let loggerOptions;
    if (args['--raw-logs']) {
        loggerOptions = {
            name: name,
            level: 'debug'
        };
    } else {
        loggerOptions = {
            name: name,
            level: 'debug',
            stream: bunyanFormat({
                outputMode: 'short',
                // color: false
            })
        };
    }
    global.logger = bunyan.createLogger(loggerOptions);

    // global.logger.info({args});

    const pjdsConfig = {
        'ip_address': process.env.PJDS_IP_ADDRESS,
        'tcp_port': parseInt(process.env.PJDS_TCP_PORT, 10),
        'username': process.env.PJDS_USERNAME,
        'password': process.env.PJDS_PASSWORD,
        'namespace': process.env.PJDS_NAMESPACE
    };

    const excludedMethods = [
        'constructor',
        'childInstance'
    ];

    const methodSuites = {};

    const PjdsClient = require('../src/pjds-client');
    const pjdsClientArguments = [global.logger, pjdsConfig];

    const methodArgumentMap = {
        id: args['--id'],
        site: args['--site'],
        list: args['--list'],
        store: args['--store'],
        uid: args['--uid'],
        data: args['--data'],
        index: args['--index'],
        filter: args['--filter'],
        template: args['--template'],
        deleteAll: args['--delete-all'],
        params: args['--params'],
        range: args['--range'],
        order: args['--order'],
        start: args['--start'],
        startId: args['--start-id'],
        bail: args['--bail'],
        limit: args['--limit'],
        returnCounts: args['--return-counts'],
        activeUser: args['--active-user'],
        document: args['--document'],
        indexData: args['--index-data'],
        patch: args['--patch'],
        skipLocked: args['--skip-locked']
    };

    return handleCli(args, PjdsClient, pjdsClientArguments, excludedMethods, methodSuites, methodArgumentMap);
}
