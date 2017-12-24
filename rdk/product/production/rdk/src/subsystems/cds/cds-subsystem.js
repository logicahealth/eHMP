'use strict';

const fs = require('fs');
const _ = require('lodash');
const async = require('async');
const MongoClient = require('mongodb').MongoClient;

const rdk = require('../../core/rdk');
const http = rdk.utils.http;

const cdsAgenda = require('./cds-subsystem-agenda');


let cdsdbConnections = new Map();

let invocationServerConfigured = false;
let cdsInvocationUrl;

let mongoServerConfigured = false;
let cdsMongoServer;
let mongoOptions;


function getSubsystemConfig(app, logger) {
    logger.debug('cds-subsystem.getSubsystemConfig()');

    // 1. load rootCert
    let rootCert = loadRootCert(logger, _.get(app.config, 'cdsMongoServer.rootCert'));

    // 2. build cdsInvocationUrl
    if (!_.isEmpty(app.config.cdsInvocationServer)) {
        invocationServerConfigured = true;
        cdsInvocationUrl = app.config.externalProtocol + '://' + app.config.cdsInvocationServer.host + ':' + app.config.cdsInvocationServer.port;
        logger.debug('cds-subsystem.getSubsystemConfig() invocationServerConfigured');
    }

    // 3. build cdsSubsystemSettings and mongoOptions
    if (!_.isEmpty(app.config.cdsMongoServer)) {
        mongoServerConfigured = true;
        cdsMongoServer = app.config.cdsMongoServer;
        logger.debug('cds-subsystem.getSubsystemConfig() mongoServerConfigured');
        mongoOptions = getMongoOptions(rootCert);
    }

    let pingCalls = [pingMongo.bind(null, logger, app), pingCdsi.bind(null, logger, app)];

    return {
        healthcheck: {
            name: 'cds',
            interval: 100000,
            check: callback => {
                async.parallel(pingCalls, error => callback(!error));
            }
        }
    };
}


function loadRootCert(logger, certPath) {
    logger.debug('cds-subsystem.loadRootCert() certPath: "%s"', certPath);

    let rootCert;
    if (_.isEmpty(certPath)) {
        logger.debug('cds-subsystem.loadRootCert() empty certPath, skipping load of cert file');
        return;
    }

    try {
        // Since this should only run once during initialization of cds-subsystem,
        // it should be okay to call the sync version to read the file.
        rootCert = fs.readFileSync(certPath);
    } catch (error) {
        logger.error({
            error: error
        }, 'cds-subsystem.loadRootCert() Unable to load rootCert file at: "' + certPath + '"');
    }

    return rootCert;
}


function getMongoOptions(rootCert) {
    let mongoOptions = {
        'server': {
            'ssl': true,
            'sslValidate': false,
            'sslInvalidHostNameAllowed': true,
            'sslCA': null,
            'socketOptions': {
                'connectTimeoutMS': 500,
                'socketTimeoutMS': 30000
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

    if (!_.isEmpty(rootCert)) {
        mongoOptions.server.sslCA = [rootCert];
    }

    return mongoOptions;
}


function getInvocationUrl() {
    return cdsInvocationUrl;
}


function isCdsInvocationServerConfigured() {
    return invocationServerConfigured;
}


function isCdsMongoServerConfigured() {
    return mongoServerConfigured;
}


function getCDSDBCount() {
    return cdsdbConnections.size;
}


function pingMongo(logger, app, callback) {
    logger.debug('cds-subsystem.pingMongo()');

    if (!mongoServerConfigured) {
        //if it's not configured, we know that and it's absence is 'healthy'.
        return setTimeout(callback, 0, null, true);
    }

    let cdsMongoOptions = {
        baseUrl: 'http://' + app.config.cdsMongoServer.host + ':' + app.config.cdsMongoServer.port,
        url: '/',
        timeout: 5000,
        logger: logger
    };

    logger.debug('cds-subsystem.pingMongo() options: %j', _.omit(cdsMongoOptions, 'logger'));

    return http.get(cdsMongoOptions, error => callback(error, !error));
}


function pingCdsi(logger, app, callback) {
    logger.debug('cds-subsystem.pingCdsi()');

    if (!invocationServerConfigured) {
        //if it's not configured, we know that and it's absence is 'healthy'.
        return setTimeout(callback, 0, null, true);
    }

    let cdsiOptions = {
        baseUrl: 'http://' + app.config.cdsInvocationServer.host + ':' + app.config.cdsInvocationServer.port,
        url: '/',
        timeout: 5000,
        logger: logger
    };

    logger.debug('cds-subsystem.pingCdsi() options: %j', _.omit(cdsiOptions, 'logger'));

    return http.get(cdsiOptions, error => callback(error, !error));
}


function getCDSDB(logger, dbName, initDbFunc, callback) {
    logger.debug('cds-subsystem.getCDSDB() dbName: "%s"', dbName);

    if (!mongoServerConfigured) {
        logger.warn('cds-subsystem.getCDSDB() dbName: "%s", CDS Mongo Server is not configured', dbName);
        return setTimeout(callback, 0, 'CDS Mongo Server is not configured!');
    }

    if (cdsdbConnections.has(dbName)) {
        logger.debug('cds-subsystem.getCDSDB() returning cached database connection for dbName: "%s"', dbName);
        return setTimeout(callback, 0, null, cdsdbConnections.get(dbName));
    }

    let connectionString = getMongoDBConnectionString(logger, dbName, cdsMongoServer);

    logger.debug('cds-subsystem.getCDSDB() connect to dbName: "%s", connectionString: %s, mongoOptions: %j', dbName, connectionString, getLoggedOptions(mongoOptions));
    MongoClient.connect(connectionString, mongoOptions, (error, cdsDb) => {
        if (error) {
            logger.error({
                error: error
            }, `cds-subsystem.getCDSDB() error: Unable to connect to database: "${dbName}"`);

            return callback(error, null);
        }

        logger.debug('cds-subsystem.getCDSDB() success: Connected to database: "%s"', dbName);

        // Register event listener for errors to remove
        // from connection cache and close connection
        cdsDb.on('error', () => {
            logger.debug('cds-subsystem.getCDSDB() MongoDB connection error handler');
            cdsDb.close(true, error => {
                logger.warn({
                    error: error
                }, `cds-subsystem.getCDSDB() error: Unable to cleanly close database: ${dbName}`);
            });

            if (cdsdbConnections.get(dbName) === cdsDb) {
                cdsdbConnections.delete(dbName);
            }
        });

        // Register event listener for close to remove
        // from connection cache
        cdsDb.on('close', () => {
            logger.debug('cds-subsystem.getCDSDB() MongoDB connection close handler');
            cdsdbConnections.delete(dbName);

            if (cdsdbConnections.get(dbName) === cdsDb) {
                cdsdbConnections.delete(dbName);
            }
        });

        if (_.isFunction(initDbFunc)) {
            logger.debug('cds-subsystem.getCDSDB() calling initDbFunc: %s()', initDbFunc.name);
            initDbFunc(cdsDb);
        }

        cdsdbConnections.set(dbName, cdsDb);
        return callback(null, cdsDb);
    });
}

function getLoggedOptions(mongoOptions) {

    let options = _.clone(mongoOptions);
    options.server = _.clone(options.server);
    if (_.get(options, 'server.sslCA')) {
        options.server.sslCA = `--${options.server.sslCA.length} cert(s)--`;
    }

    return options;
}

function getMongoDBConnectionString(logger, dbName, cdsMongoServer) {
    logger.debug('cds-subsystem.getMongoDBConnectionString() dbName: "%s", cdsMongoServer: %j', dbName, cdsMongoServer);

    let connectionString = 'mongodb://';

    logger.debug('cds-subsystem.getMongoDBConnectionString() username: "%s" password: "%s"' + cdsMongoServer.username, cdsMongoServer.password);
    if (!_.isUndefined(_.get(cdsMongoServer, 'username')) && !_.isUndefined(_.get(cdsMongoServer, 'password'))) {
        connectionString += cdsMongoServer.username + ':' + cdsMongoServer.password + '@';
    }

    connectionString += cdsMongoServer.host + ':' + cdsMongoServer.port + '/' + dbName + '?auto_reconnect=true';

    logger.debug('cds-subsystem.getMongoDBConnectionString() options: "%s"', cdsMongoServer.options);
    if (!_.isUndefined(_.get(cdsMongoServer, 'options'))) {
        connectionString += '&' + cdsMongoServer.options;
    }

    logger.debug('cds-subsystem.getMongoDBConnectionString() connectionString: %s', connectionString);

    return connectionString;
}


module.exports.getMongoDBConnectionString = getMongoDBConnectionString;
module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.isCdsMongoServerConfigured = isCdsMongoServerConfigured;
module.exports.isCdsInvocationServerConfigured = isCdsInvocationServerConfigured;
module.exports.getInvocationUrl = getInvocationUrl;
module.exports.getCDSDB = getCDSDB;
module.exports.getCDSDBCount = getCDSDBCount;
module.exports.getAgenda = cdsAgenda.getAgenda;
module.exports.getAgendaJobProcessorName = cdsAgenda.getAgendaJobProcessorName;
