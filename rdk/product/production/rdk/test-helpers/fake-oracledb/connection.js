'use strict';
var _ = require('lodash');

/**
 * Simulates the OracleDB Connection class
 * @param  {Object} userConnAttrs  Object of user overrides for defaults
 * @return {void}                  No return, this is a constructor
 */
function oracledbConnection(userConnAttrs) {
    var connDefaults = {
        user: '',
        password: '',
        connectString: '',
        externalAuth: false,
        stmtCacheSize: 0
    };
    this.connAttrs = _.defaults(userConnAttrs, connDefaults);

    var connWriteOnly = {
        action: null, //string
        clientId: null, //string
        module: null //string
    };

    var connReadOnly = {
        oracleServerVersion: 093
    };

    this.connAttrs = _.extend(this.connAttrs, connWriteOnly, connReadOnly);
}

/**
 * Simulates the OracleDB Connection class break method
 * @param  {Function} callback  Callback function to run on finish
 * @return {Function}           Returns callback with error
 */
oracledbConnection.prototype.break = function(callback) {
    var error = false;
    if (error) {
        return callback('error');
    }
    return callback(null);
};

/**
 * Simulates the OracleDB Connection class close method
 * @param  {Function} callback  Callback function to run on finish
 * @return {Function}           Returns callback with error
 */
oracledbConnection.prototype.close = function(callback) {
    var error = false;
    if (error) {
        return callback('error');
    }
    return callback(null);
};

/**
 * Simulates the OracleDB Connection class commit method
 * @param  {Function} callback  Callback function to run on finish
 * @return {Function}           Returns callback with error
 */
oracledbConnection.prototype.commit = function(callback) {
    var error = false;
    if (error) {
        return callback('error');
    }
    return callback(null);
};

/**
 * Simulates the OracleDB Connection class execute method
 * @param  {String}   sql        String to query for
 * @param  {Object}   bindParams Object of  bindParams
 * @param  {Object}   options    Object of options
 * @param  {Function} callback   Callback function to run on finish
 * @return {Function}            Returns callback with error, response
 */
oracledbConnection.prototype.execute = function(sql, bindParams, options, callback) {
    var error = options.error ? options.error : false;
    if (error) {
        return callback('connection.execute error');
    }
    return callback(null, {rows: 'connection.execute success'});
};

/**
 * Simulates the OracleDB Connection class queryStream method
 * @param  {String} sql        String to query for
 * @param  {Object} bindParams Object of bindParams
 * @param  {Object} options    Object of options
 * @return {void}              No return at this time
 */
oracledbConnection.prototype.queryStream = function(sql, bindParams, options) {
    return;
};

/**
 * Simulates the OracleDB Connection class rollback method
 * @param  {Function} callback  Callback function to run on finish
 * @return {Function}           Returns callback with error
 */
oracledbConnection.prototype.rollback = function(callback) {
    var error = false;
    if (error) {
        return callback('error');
    }
    return callback(null);
};

module.exports = oracledbConnection;
