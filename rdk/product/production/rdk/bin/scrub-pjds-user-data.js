#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var fs = require('fs');
var async = require('async');
var bunyan = require('bunyan');
var express = require('express');
var nconf = require('nconf');
var path = require('path');
var kill = require('../src/core/factory-components/rdk-signals');
var http = require('../src/utils/http');

var ehmpUsersBlacklist = [
    'firstname',
    'lastname',
    'error'
];


var app = createApp();
scrubStore(app, 'pidmeta', scrubPidMetaItem);
scrubStore(app, 'ehmpusers', scrubEhmpUsersItem);


function createApp() {
    nconf.argv().env(); //config priority: command line arguments, env variables, config file (if specified), default config file
    var suppliedConfig = nconf.get('config');
    var defaultConfigPath = path.join(__dirname, '..', 'config/rdk-fetch-server-config.json');
    nconf.file(suppliedConfig || defaultConfigPath);
    nconf.required(['generalPurposeJdsServer']);

    if (nconf.get('help')) {
        console.log('Usage: scrub-pjds-user-data.js [--log-level LEVEL] [--parallel-limit LIMIT] [--config CONFIG]\n    --log-level       log level, defaults to 40\n    --parallel-limit  number of simultaneous calls to store data, defaults to 4\n    --config          path to JSON config, defaults to config/rdk-fetch-server-config.json');
        process.exit(0);
    }

    var config = {};
    config.generalPurposeJdsServer = nconf.get('generalPurposeJdsServer');

    var parallelLimit = nconf.get('parallel-limit') || 4;
    config.parallelLimit = Number(parallelLimit);

    var app = express();
    app.config = config;

    var logLevel = nconf.get('log-level') || 40;
    var logger = bunyan.createLogger({
        name: 'scrub-pjds-logger',
        level: logLevel
    });
    app.logger = logger;

    kill.logKill(app, null);

    return app;
}

function scrubStore(app, store, scrubFunction) {
    app.logger.debug('Start scrubbing ' + store);

    loadPjdsItems(app, store, function (error, items) {
        if (error) {
            app.logger.error({ store: store, error: error }, 'Error loading items from ' + store);
            console.log('Error loading items from ' + store);
            console.log(error);
            return;
        }

        backupStore(app, store, items);

        async.eachLimit(items, app.config.parallelLimit, function (item, callback) {
            async.waterfall([
                scrubFunction.bind(null, app, item),
                savePjdsItem.bind(null, app, store)
            ], callback);
        }, function (error) {
            if (error) {
                app.logger.error({ store: store, error: error }, 'Error scrubbing items in ' + store);
                console.log('Error scrubbing items in ' + store);
                console.log(error);
            } else {
                app.logger.debug('Finished scrubbing ' + store);
                console.log('Finished scrubbing ' + store);
            }
        });
    });
}

function loadPjdsItems(app, store, callback) {
    var options = _.extend({}, app.config.generalPurposeJdsServer, {
        url: store + '/',
        logger: app.logger,
        json: true
    });
    http.get(options, function (error, response, responseBody) {
        var items = _.get(responseBody, 'items');
        var status = _.get(response, 'statusCode', _.get(responseBody, 'status', 500));
        if (!error && status >= 300) {
            error = responseBody || 'Unable to load items from ' + store;
        }

        app.logger.debug({ items: items }, 'Loaded ' + store);
        return callback(error, items);
    });
}

function savePjdsItem(app, store, item, callback) {
    if (!item) {
        return callback();
    }
    if (!item.uid) {
        return callback('No item.uid found in ' + JSON.stringify(item, null, 2));
    }
    var options = _.extend({}, app.config.generalPurposeJdsServer, {
        url: store + '/' + item.uid,
        logger: app.logger,
        body: item,
        json: true
    });
    http.put(options, function (error, response, responseBody) {
        var status = _.get(response, 'statusCode', _.get(responseBody, 'status', 500));
        if (!error && status >= 300) {
            error = responseBody || 'Unable to update item ' + item.uid;
        }
        return callback(error, item);
    });
}

function backupStore(app, store, items) {
    var time = new Date().getTime();
    var backupPath = path.join(__dirname, store + time + '.bak.json');

    app.logger.debug({ store: store, path: backupPath }, 'Backing up the existing store data');

    fs.writeFileSync(backupPath, JSON.stringify({ items: items }));
    console.log('Backed up ' + store + ' to ' + backupPath);
}

function scrubPidMetaItem(app, item, callback) {
    var didChange = false;
    var vals = _.get(item, 'val');
    _.each(vals, function (val) {
        var modifiedBy = _.get(val, 'modifiedBy');
        if (!_.isEmpty(modifiedBy) && !_.startsWith(modifiedBy, 'urn:va:user:')) {
            didChange = true;
            val.modifiedBy = '';

            app.logger.debug({ uid: item.uid, val: val.name }, 'Removed modifiedBy from pidmeta value');
        }
    });
    callback(null, didChange ? item : null);
}

function scrubEhmpUsersItem(app, item, callback) {
    var didChange = false;
    _.each(ehmpUsersBlacklist, function (key) {
        if (_.has(item, key)) {
            didChange = true;
            delete item[key];

            app.logger.debug({ uid: item.uid, field: key }, 'Removed sensitive field from ehmpusers item');
        }
    });
    callback(null, didChange ? item : null);
}
