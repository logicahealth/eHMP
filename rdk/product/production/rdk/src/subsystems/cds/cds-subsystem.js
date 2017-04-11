'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var http = rdk.utils.http;
var async = require('async');
var mongo = require('mongoskin');
var ObjectId = mongo.ObjectID;
var cdsAgenda = require('./cds-subsystem-agenda');
var cdsDBUtil = require('./cds-db-util');
var fs = require('fs');
var cdsWorkProduct = require('../../resources/cds-work-product/cds-work-product');
var cdsEngine = require('../../resources/cds-engine/cds-engine');
var cdsCriteria = require('../../resources/cds-patient-list/criteria');
var cdsDefinition = require('../../resources/cds-patient-list/definition');
var cdsPatientList = require('../../resources/cds-patient-list/patient-list');
var cdsMetrics = require('../../resources/cds-metrics/metrics');
var cdsIntent = require('../../resources/cds-intent/cds-intent');

var mongoServerConfigured = false;
var invocationConfigured = false;

var cdsInvocationUrl;
var cdsdbConnections = {};
var domain;

function getInvocationUrl() {
    return cdsInvocationUrl;
}

function isCDSInvocationConfigured() {
    return invocationConfigured;
}

function isCDSMongoServerConfigured() {
    return mongoServerConfigured;
}
var cdsSubsystemSettings = {
    cdsMongoServer: null,
    mongoskinOptions: null,
    logger: null,
    rootCert: null
};
function getMongoskinOptions(callback) {
    if (cdsSubsystemSettings.mongoskinOptions) {
        return callback(cdsSubsystemSettings.mongoskinOptions);
    }
    var mongoOptions = {
        'server': {
            'ssl': true,
            'sslValidate': false,
            'sslInvalidHostNameAllowed': true,
            'sslCA': null,
            'socketOptions': {
                'connectTimeoutMS': 500,
                'socketTimeoutMS': 500
            },
            'poolSize': 10
        },
        'safe': true,
        'db': {
            'native_parser': false
        },
        'replSet': {},
        'mongos': {}
    };
    if (_.isEmpty(cdsSubsystemSettings.rootCert)) {
        return callback(mongoOptions);
    }
    fs.readFile(cdsSubsystemSettings.rootCert, function(error, data) {
        if (!error) {
            mongoOptions.server.sslCA = [data];
        }
        return callback(mongoOptions);
    });
}

var onDomainError = function(er) {
    //reset database connections
    cdsdbConnections = {};
    cdsSubsystemSettings.logger.error({
        error: er
    }, 'Error connecting to database.');
};


function init(app, subsystemLogger) {
    cdsSubsystemSettings.rootCert = _.get(app.config, 'cdsMongoServer.rootCert');
    if (!_.isUndefined(domain)) {
        domain.removeListener('error', onDomainError);
    }
    domain = require('domain').create();

    domain.on('error', onDomainError);

    cdsSubsystemSettings.logger = subsystemLogger;
    cdsSubsystemSettings.logger.debug('beginning cds subsystem configuration...');

    if (!_.isUndefined(app.config.cdsInvocationServer)) {
        invocationConfigured = true;
        cdsInvocationUrl = app.config.externalProtocol + '://' + app.config.cdsInvocationServer.host + ':' + app.config.cdsInvocationServer.port;
        cdsSubsystemSettings.logger.debug('invocationConfigured: ' + invocationConfigured);
    }

    if (!_.isUndefined(app.config.cdsMongoServer.host)) {
        //configuration is present, but connects will be created lazily as needed.
        mongoServerConfigured = true;
        cdsSubsystemSettings.cdsMongoServer = app.config.cdsMongoServer; //keep the configuration items to create connections below...
        cdsSubsystemSettings.logger.debug('mongoServerConfigured: ' + mongoServerConfigured);

        //setting additional connection options for SSL, connection pooling, etc.
        getMongoskinOptions(function(mongoskinOptionsConfig) {
            cdsSubsystemSettings.mongoskinOptions = mongoskinOptionsConfig;
            // db setup
            // cdsAgenda.init(app, subsystemLogger);
            cdsCriteria.init(app, subsystemLogger);
            cdsDefinition.init(app, subsystemLogger);
            cdsEngine.init(app, subsystemLogger);
            cdsIntent.init(app, subsystemLogger);
            cdsMetrics.init(app, subsystemLogger);
            cdsPatientList.init(app, subsystemLogger);
            cdsWorkProduct.init(app, subsystemLogger);
        });
    }
}

function getSubsystemConfig(app, logger) {

    init(app, logger);

    //the cds subsystem (fully deployed) uses two external systems, so we check both for expected behavior.
    return {
        healthcheck: {
            name: 'cds',
            interval: 100000,
            check: function(callback) {
                async.parallel([
                        function(callback) {
                            if (!mongoServerConfigured) {
                                return callback(null, true); //if it's not configured, we know that and it's absence is 'healthy'.
                            }
                            var cdsMongoOptions = {
                                baseUrl: 'http://' + app.config.cdsMongoServer.host + ':' + app.config.cdsMongoServer.port,
                                url: '/',
                                timeout: 5000,
                                logger: logger
                            };
                            http.get(cdsMongoOptions, function(err /*, response, body*/ ) {
                                if (err) {
                                    return callback(err, false);
                                }
                                return callback(null, true);
                            });
                        },
                        function(callback) {
                            if (!invocationConfigured) {
                                return callback(null, true); //if it's not configured, we know that and it's absence is 'healthy'.
                            }
                            var cdsiOptions = {
                                baseUrl: 'http://' + app.config.cdsInvocationServer.host + ':' + app.config.cdsInvocationServer.port,
                                url: '/',
                                timeout: 5000,
                                logger: logger
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

function getCDSDB(dbName, initDbFunc, callback) {

    if (!mongoServerConfigured) {
        return callback('CDS Mongo Server is not configured!', null);
    }
    getMongoskinOptions(function(mongoskinOptions) {
        var connectionString = cdsDBUtil.getMongoDBConnectionString(dbName, cdsSubsystemSettings.cdsMongoServer, cdsSubsystemSettings.logger);
        var MongoClient = require('mongodb').MongoClient;
        domain.run(function() {
            if (_.has(cdsdbConnections, dbName)) {
                return callback(null, cdsdbConnections[dbName]);
            }

            MongoClient.connect(connectionString, mongoskinOptions, function(err, db) {

                if (err) {
                    cdsSubsystemSettings.logger.error({
                        error: err
                    }, 'error: Unable to connect to database: \'' + dbName + '\'');
                    return callback(err, null);
                }

                cdsSubsystemSettings.logger.info('success: Connected to database: \'' + dbName + '\'');
                if (_.isFunction(initDbFunc)) {
                    initDbFunc(db);
                }
                cdsdbConnections[dbName] = db;
                return callback(null, cdsdbConnections[dbName]);

            });

        });
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
module.exports._cdsSubsystemSettings = cdsSubsystemSettings;
