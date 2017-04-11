'use strict';
var _ = require('lodash');

function getMongoDBConnectionString(dbName, cdsMongoServer, logger) {

	var connectionString = 'mongodb://';

    if (!_.isUndefined(_.get(cdsMongoServer, 'username')) && !_.isUndefined(_.get(cdsMongoServer, 'password'))) {
        logger.debug('username: ' + cdsMongoServer.username);
        logger.debug('password: ' + cdsMongoServer.password);
        connectionString += cdsMongoServer.username + ':' + cdsMongoServer.password + '@';
    } else {
        logger.debug('No username/password specified for MongoDB connection string.');
    }

    connectionString += cdsMongoServer.host + ':' + cdsMongoServer.port + '/' +dbName + '?auto_reconnect=true';

    if (!_.isUndefined(_.get(cdsMongoServer, 'options'))) {
        logger.debug('options: ' + cdsMongoServer.options);
        connectionString += '&' + cdsMongoServer.options;
    } else {
        logger.debug('No additional options specified for MongoDB connection string.');
    }

    logger.debug('connection string test ' + connectionString );

    return connectionString;
}

module.exports.getMongoDBConnectionString = getMongoDBConnectionString;
