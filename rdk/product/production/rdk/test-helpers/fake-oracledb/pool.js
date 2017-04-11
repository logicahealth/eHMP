'use strict';
var _ = require('lodash');
var Connection = require('./connection');

/**
 * Simulates the OracleDB Pool class
 * @param  {Object} userPoolAttrs  Object of user overrides for defaults
 * @return {void}                  No return, this is a constructor
 */
function oracledbPool(userPoolAttrs) {
    var poolDefaults = {
        user: '',
        password: '',
        connectString: '',
        externalAuth: false,
        poolIncrement: 0,
        poolTimeout: 0,
        poolMax: 0,
        poolMin: 0,
        queueRequests: true,
        queueTimeout: 0,
        stmtCacheSize: 0
    };

    this.poolAttrs = _.defaults(userPoolAttrs, poolDefaults);

    var poolStats = {
        connectionsInUse: 0,
        connectionsOpen: 0
    };
    if (this.poolAttrs._enableStats) {
        this.poolAttrs = _.extend(this.poolAttrs, poolStats);
    }
}

/**
 * Simulates the OracleDB Pool class close method
 * @param  {Function} callback  Callback function to run on finish
 * @return {Function}           Returns callback with error
 */
oracledbPool.prototype.close = function(callback) {
    var error = false;
    if (error) {
        return callback('error');
    }
    return callback(null);
};

/**
 * Simulates the OracleDB Pool class getConnection method
 * @param  {Function} callback  Callback function to run on finish
 * @return {Function}           Returns callback with error, connection
 */
oracledbPool.prototype.getConnection = function(callback) {
    var connection = new Connection(this.poolAttrs);
    return callback(null, connection);
};

module.exports = oracledbPool;
