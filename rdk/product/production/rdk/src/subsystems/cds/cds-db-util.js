'use strict';
var dd = require('drilldown');

function getMongoDBConnectionString(dbName, cdsMongoServer, logger) {

	var connectionString = 'mongodb://';
    
    if (dd(cdsMongoServer)('username').exists && dd(cdsMongoServer)('password').exists) {
        logger.debug('username: ' + cdsMongoServer.username);
        logger.debug('password: ' + cdsMongoServer.password);
        connectionString += cdsMongoServer.username + ':' + cdsMongoServer.password + '@';
    } else {
        logger.debug('No username/password specified for MongoDB connection string.');
    }

    connectionString += cdsMongoServer.host + ':' + cdsMongoServer.port + '/' +dbName + '?auto_reconnect=true';

    if (dd(cdsMongoServer)('options').exists) {
        logger.debug('options: ' + cdsMongoServer.options);
        connectionString += '&' + cdsMongoServer.options;
    } else {
        logger.debug('No additional options specified for MongoDB connection string.');
    }

    logger.debug('connection string test ' + connectionString );

    return connectionString;
}

module.exports.getMongoDBConnectionString = getMongoDBConnectionString;
