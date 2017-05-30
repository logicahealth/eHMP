#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var async = require('async');
var bunyan = require('bunyan');
var express = require('express');
var jdsFilter = require('jds-filter');
var nconf = require('nconf');
var path = require('path');
var querystring = require('querystring');
var RpcClient = require('vista-js').RpcClient;
var kill = require('../src/core/factory-components/rdk-signals');
var http = require('../src/utils/http');
var fmDateUtil = require('../src/utils/fileman-date-converter');


var app = createApp();
reportCosignUsers(app);


function createApp() {
    nconf.argv().env(); //config priority: command line arguments, env variables, config file (if specified), default config file
    var suppliedConfig = nconf.get('config');
    var defaultConfigPath = path.join(__dirname, '..', 'config/rdk-fetch-server-config.json');
    nconf.file(suppliedConfig || defaultConfigPath);
    nconf.required(['jdsServer', 'generalPurposeJdsServer', 'vistaSites', 'rpcConfig']);

    if (nconf.get('help')) {
        console.log('Usage: find-cosigner-users.js [--site SITE] [--users USERS] [--log-level LEVEL] [--parallel-limit LIMIT] [--config CONFIG]\n    --site            VistA site hash, defaults to all sites in the config\n    --users           comma separated UIDs or DUZs, defaults to all users who have logged into eHMP 2.0\n    --log-level       log level, defaults to 40\n    --parallel-limit  number of simultaneous RPC calls, defaults to 40\n    --config          path to JSON config, defaults to config/rdk-fetch-server-config.json');
        process.exit(0);
    }

    var config = {};
    config.jdsServer = nconf.get('jdsServer');
    config.generalPurposeJdsServer = nconf.get('generalPurposeJdsServer');
    config.rpcConfig = nconf.get('rpcConfig');

    config.vistaSites = nconf.get('vistaSites');
    var site = nconf.get('site');
    if (site) {
        if (!config.vistaSites[site]) {
            console.error('Site ' + site + ' is not in the vistaSites config');
            process.exit(1);
        }
        var sites = {};
        sites[site] = config.vistaSites[site];
        config.vistaSites = sites;
    }

    var users = nconf.get('users');
    if (users) {
        if (_.isString(users)) {
            users = users.split(/\s*,\s*/g);
        }
        if (!users[0].match(/urn:va:user:.+/i)) {
            if (!site) {
                console.error('The "site" option is required when listing users by DUZ. Either provide it or list users by UID.');
                process.exit(1);
            }
            users = _.map(users, function(duz) {
                return 'urn:va:user:' + site + ':' + duz;
            });
        }
        config.userUids = users;
    }

    var parallelLimit = nconf.get('parallel-limit') || 40;
    config.parallelLimit = Number(parallelLimit);

    var app = express();
    app.config = config;

    var logLevel = nconf.get('log-level') || 40;
    var logger = require('bunyan').createLogger({
        name: 'host-logger',
        level: logLevel
    });
    app.logger = logger;

    kill.logKill(app, null);

    return app;
}

function reportCosignUsers(app) {
    var vistaSites = _.get(app, 'config.vistaSites', {});
    async.eachOf(vistaSites, function (site, siteHash, siteCallback) {
        var rpcClient = createRpcClient(site);

        async.waterfall([
            _.partial(async.parallel, {
                rpcConnect: function (connectCallback) {
                    rpcClient.connect(connectCallback);
                },
                noteTitles: _.partial(getProgressNoteTitles, siteHash),
                users: _.partial(getSiteUsers, siteHash)
            }),
            function (results, checkCallback) {
                checkUsersForRequiresCosigner(results.users, results.noteTitles, rpcClient, function (error) {
                    rpcClient.close();
                    return checkCallback(error);
                });
            }
        ], siteCallback);
    }, function (error) {
        if (error) {
            console.error(error);
        }
        process.exit(error ? 1 : 0);
    });
}

function createRpcClient(site) {
    var rpcConfig = {
        context: _.get(app, 'config.rpcConfig.context', 'HMP UI CONTEXT'),
        host: _.get(site, 'host', ''),
        port: _.get(site, 'port', 0),
        accessCode: _.get(site, 'accessCode', ''),
        verifyCode: _.get(site, 'verifyCode', ''),
        division: _.get(site, ['division', 0, 'id'], ''),
        localIP: '',
        localAddress: ''
    };

    app.logger.debug({ rpcConfig: rpcConfig }, 'Creating RPC client');

    return RpcClient.create(app.logger, rpcConfig);
}

function getProgressNoteTitles(site, callback) {
    app.logger.debug('Loading progress notes titles');

    var filter = [
        'and', ['eq', 'statusName', 'ACTIVE'],
        ['like', 'uid', 'urn:va:doc-def:' + site + ':%'],
        ['ne', 'typeName', 'OBJECT'],
        ['ne', 'typeName', 'COMPONENT']
    ];
    var filterString = jdsFilter.build(filter);
    var queryObject = {
        filter: filterString
    };

    var options = _.extend({}, app.config.jdsServer, {
        url: '/data/find/doc-def?' + querystring.stringify(queryObject),
        logger: app.logger,
        json: true,
        timeout: 120000
    });

    http.get(options, function (error, response, responseBody) {
        if (error || _.has(responseBody, 'error')) {
            return callback(error || responseBody.error, responseBody);
        }
        if (_.isEmpty(_.get(responseBody, 'data.items'))) {
            return callback('No note titles found.', responseBody, response.statusCode);
        }
        return parseTitles(responseBody.data.items, callback);
    });
}

function parseTitles(data, callback) {
    var titles = [];
    var notesClass = _.find(data, 'name', 'PROGRESS NOTES');
    var whiteList = _.filter(notesClass.item, function(item) {
        return item.name !== 'CONSULTS';
    });
    whiteList = whiteList.concat(_.find(data, 'name', 'ADDENDUM').item);

    var i = 0;
    while (i < whiteList.length) {
        var item = _.find(data, 'uid', whiteList[i].uid);
        if (item && item.typeName === 'TITLE') {
            titles.push({
                uid: item.uid,
                name: item.displayName
            });
        } else if (item && item.item) {
            whiteList = whiteList.concat(item.item);
        } //else, we couldn't find it. this doc-def is inactive.
        i++;
    }

    app.logger.debug({ noteTitles: titles }, 'Loaded progress note titles');
    return callback(null, titles);
}

function getSiteUsers(siteHash, callback) {
    app.logger.debug({ site: siteHash }, 'Loading site users');

    var query = '?filter=like(uid,"urn:va:user:' + siteHash + '%25")';
    var options = _.extend({}, app.config.generalPurposeJdsServer, {
        url: 'ehmpusers/' + query,
        logger: app.logger,
        json: true
    });

    http.get(options, function (err, response, responseBody) {
        var users = _.get(responseBody, 'items');
        app.logger.debug({ site: siteHash, users: users }, 'Loaded site users');

        if (app.config.userUids) {
            users = _.filter(users, function(user) {
                return _.contains(app.config.userUids, user.uid);
            });
        }

        return callback(err, users);
    });
}

function checkUsersForRequiresCosigner(users, noteTitles, rpcClient, callback) {
    var likelyNotes = [];
    async.eachSeries(users, function (user, userCallback) {
        if (_.has(user, 'status') && user.status !== 'active') {
            app.logger.info({ user: user }, 'skipping inactive user');
            return userCallback();
        }

        async.detectLimit(_.union(likelyNotes, noteTitles), app.config.parallelLimit, function (noteTitle, noteTitleCallback) {
            checkRequiresCosigner(user, noteTitle, rpcClient, function (error, cosignerRequired) {
                if (error) {
                    app.logger.error({ user: user, error: error }, 'Error calling TIU REQUIRES COSIGNATURE');
                }
                return noteTitleCallback(cosignerRequired);
            });
        }, function (noteTitle) {
            if (noteTitle) {
                if (!_.contains(likelyNotes, noteTitle)) {
                    app.logger.debug({ noteTitle: noteTitle }, 'Found a likely note title');
                    likelyNotes.push(noteTitle);
                }
                app.logger.info({ user: user, noteTitle: noteTitle }, 'user requires a cosigner');
                console.error(user.lastname + ', ' + user.firstname + ' (' + user.uid + ') requires a cosigner for note "' + noteTitle.name + '" (' + noteTitle.uid + ')');
            }

            app.logger.info({ uid: user.uid }, 'checked user');
            return userCallback();
        });
    }, callback);
}

function checkRequiresCosigner(user, noteTitle, rpcClient, callback) {
    app.logger.debug({ user: user, noteTitle: noteTitle }, 'Checking whether user requires a cosigner');

    var rpcName = 'TIU REQUIRES COSIGNATURE';
    var rpcParams = [];

    var ien = localIdFromUid(noteTitle.uid);
    rpcParams.push(ien);

    rpcParams.push('');

    var dfn = localIdFromUid(user.uid);
    rpcParams.push(dfn);

    // today's date
    rpcParams.push(fmDateUtil.getFilemanDateTime(new Date()));

    rpcClient.execute(rpcName, rpcParams, function (error, response) {
        return callback(error, response === '1');
    });
}

function localIdFromUid(uid) {
    var index = uid.lastIndexOf(':');
    if (index > -1) {
        return uid.substring(index + 1);
    }
}