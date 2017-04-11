'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var http = rdk.utils.http;
var dd = require('drilldown');
var async = require('async');
var mongo = require('mongoskin');
var ObjectId = mongo.ObjectID;
var cdsAgenda = require('./cds-subsystem-agenda');

var mongoServerConfigured = false;
var invocationConfigured = false;

var cdsInvocationUrl;
var cdsdbConnections = {};

function getInvocationUrl() {
    return cdsInvocationUrl;
}

function isCDSInvocationConfigured() {
    return invocationConfigured;
}

function isCDSMongoServerConfigured() {
    return mongoServerConfigured;
}

var cdsMongoServer;
var logger;

function init(app) {

    logger = app.logger;
    logger.debug('beginning cds subsystem configuration...');

    if (dd(app)('config')('cdsMongoServer').exists) {

        //configuration is present, but connects will be created lazily as needed.
        mongoServerConfigured = true;
        cdsMongoServer = app.config.cdsMongoServer; //keep the configuration items to create connections below...
        logger.debug('mongoServerConfigured: ' + mongoServerConfigured);

        cdsAgenda.init(app, cdsMongoServer);
    }
    if (dd(app)('config')('cdsInvocationServer').exists) {

        invocationConfigured = true;
        cdsInvocationUrl = app.config.externalProtocol + '://' + app.config.cdsInvocationServer.host + ':' + app.config.cdsInvocationServer.port;

        logger.debug('invocationConfigured: ' + invocationConfigured);
    }

}

function getSubsystemConfig(app) {

    init(app);

    //the cds subsystem (fully deployed) uses two external systems, so we check both for expected behavior.
    return {
        healthcheck: {
            name: 'cds',
            interval: 100000,
            check: function(callback) {
                async.parallel([
                        function(callback) {
                            if (!dd(app)('config')('cdsMongoServer').exists) {
                                return callback(null, true); //if it's not configured, we know that and it's absence is 'healthy'.
                            }
                            var cdsMongoOptions = {
                                baseUrl: 'http://' + app.config.cdsMongoServer.host + ':' + app.config.cdsMongoServer.port,
                                url: '/',
                                timeout: 5000,
                                logger: app.logger
                            };
                            http.get(cdsMongoOptions, function(err /*, response, body*/ ) {
                                if (err) {
                                    return callback(err, false);
                                }
                                return callback(null, true);
                            });
                        },
                        function(callback) {
                            if (!dd(app)('config')('cdsInvocationServer').exists) {
                                return callback(null, true); //if it's not configured, we know that and it's absence is 'healthy'.
                            }
                            var cdsiOptions = {
                                baseUrl: 'http://' + app.config.cdsInvocationServer.host + ':' + app.config.cdsInvocationServer.port,
                                url: '/',
                                timeout: 5000,
                                logger: app.logger
                            };
                            http.get(cdsiOptions, function(err /*, response, body*/ ) {
                                if (err) {
                                    return callback(err, false);
                                }
                                return callback(null, true);
                            });
                        }
                    ],
                    function(error) {
                        // simple logic for now - no errors means we're healthy
                        if (error) {
                            return callback(false); // not healthy
                        }
                        return callback(true); // healthy
                    });
            }
        }
    };
}

function getCDSDB(dbName, callback) {

    if (!mongoServerConfigured) {
        return callback('CDS Mongo Server is not configured!', null);
    }

    if (_.has(cdsdbConnections, dbName)) {
        return callback(null, cdsdbConnections[dbName]);
    }

    // if we don't already have a connection open to that db, lets try to make one and return that...
    var db = mongo.db('mongodb://' + cdsMongoServer.host + ':' + cdsMongoServer.port + '/' +
        dbName + '?auto_reconnect=true', {
            safe: true
        });

    db.open(function(err) {
        if (err) {
            logger.error('error: cds-work-product unable to connect to \'' + dbName + '\' database' + ' Error was: ' + err);
            return callback(err, null);
        }

        logger.info('success: cds-work-product connected to \'' + dbName + '\' database');
        cdsdbConnections[dbName] = db;
        return callback(null, cdsdbConnections[dbName]);
    });
}

function getCDSDBCount() {
    return _.size(cdsdbConnections);
}

function testMongoDBId(id) {
    var message = null;
    var oid;
    try {
        oid = new ObjectId(id);
    } catch (err) {
        message = err.message;
    }
    return message;
}

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.isCDSMongoServerConfigured = isCDSMongoServerConfigured;
module.exports.isCDSInvocationConfigured = isCDSInvocationConfigured;
module.exports.getInvocationUrl = getInvocationUrl;
module.exports.getCDSDB = getCDSDB;
module.exports.getCDSDBCount = getCDSDBCount;
module.exports.getAgenda = cdsAgenda.getAgenda;
module.exports.getAgendaJobProcessorName = cdsAgenda.getAgendaJobProcessorName;
module.exports.testMongoDBId = testMongoDBId;
