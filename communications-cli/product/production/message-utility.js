#!/usr/bin/env node

'use strict';
var createUtility = require('./lib/message-utility-create');
var fetchUtility = require('./lib/message-utility-fetch');
var activateUtility = require('./lib/message-utility-activate');
var deleteUtility = require('./lib/message-utility-delete');
var updateUserPrefs = require('./lib/message-utility-update-user');

var defaultConfig = '../fetch_server/config/rdk-fetch-server-config.json';
var defaultObject = 'oracledb.communicationsDatabase';

var argv = require('yargs')
    .usage('Usage: $0 [command] [options...]')
    .command('create', 'Create a new message', {
        category: {
            alias: 'cat',
            describe: 'Specify a message category',
        },
        content: {
            describe: 'Specify message body',
            type: 'string'
        },
        'content-data': {
            describe: 'Message JSON data',
            type: 'string'
        },
        title: {
            describe: 'Specify a message title',
            type: 'string'
        },
        sender: {
            describe: 'Who is message from',
            type: 'string'
        },
        'ehmp-app-version': {
            alias: 'version',
            describe: 'Specify eHMP app version',
            type: 'string'
        },
        file: {
            alias: 'f',
            describe: 'Specify a json file',
            type: 'string'
        },
        'attachment': {
            alias: 'attachmentData',
            describe: 'Specify an attachment',
            type: 'string'
        },
        'attachment-content-type': {
            alias: 'contentType',
            describe: 'Specify attachment content type',
            type: 'string'
        }
    }, function(argv) {
        if (argv.f) {
            createUtility.createMessagesFromFile(argv);
        } else {
            createUtility.createSingleMessage(argv);
        }
    })
    .command('activate', 'Activate a message', {
        identifier: {
            alias: 'id',
            demand: 1,
            type: 'string'
        }
    }, function(argv) {
        activateUtility.activateMessage(argv);
    })
    .command('delete', 'Delete a message', {
        identifier: {
            alias: 'id',
            demand: 1,
            type: 'string'
        }
    }, function(argv) {
        deleteUtility.deleteMessage(argv);
    })
    .command('fetch', 'Fetch a list of messages by category', {
        category: {
            alias: 'cat',
            demand: 1,
            type: 'string'
        }
    }, function(argv) {
        fetchUtility.fetchMessages(argv);
    })
    .command('update-preferences', 'Update user preferences', {
        category: {
            alias: 'cat',
            type: 'string',
            demand: true
        },
        enabled: {
            describe: 'True or False',
            type: 'string'
        },
        'user-id': {
            describe: 'User to update',
            type: 'string'
        }
    }, function(argv) {
        updateUserPrefs.updateUserPreferences(argv);
    })
    .demand(1, 'A command must be provided')
    .option('config', {
        default: defaultConfig,
        type: 'string',
        global: true
    })
    .option('connection-object', {
        default: defaultObject,
        type: 'string',
        global: true
    })
    .option('host', {
        describe: 'Oracle connection info',
        type: 'string',
        global: true
    })
    .option('port', {
        describe: 'Oracle connection info',
        default: '1521',
        type: 'string',
        global: true
    })
    .option('username', {
        alias: 'user',
        describe: 'Oracle connection info',
        default: 'communicationuser',
        type: 'string',
        global: true
    })
    .option('password', {
        describe: 'Oracle connection info',
        type: 'string',
        global: true
    })
    .option('service', {
        describe: 'Oracle service name',
        global: true
    })
    .help('help')
    .help()
    .alias('h', 'help')
    .argv;
