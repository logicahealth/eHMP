'use strict';
var _ = require('lodash');
var Pool = require('./pool');
var Connection = require('./connection');

/**
 * Simulates the OracleDB createPool method
 * @param  {object}   poolAttrs An array of options to override the defaults
 * @param  {Function} callback  Callback function to run on finish
 * @return {Function}           Returns callback with error, pool
 */
function createPool(userPoolAttrs, callback) {
    if (!userPoolAttrs) {
        userPoolAttrs = {};
    }
    var pool = new Pool(userPoolAttrs);
    return callback(null, pool);
}

/**
 * Simulates the OracleDB getConnection method
 * @param  {Object}   userAttrs Object of user overrides for defaults
 * @param  {Function} callback  Callback function to run on finish
 * @return {Function}           Returns callback with error, connection
 */
function getConnection(userAttrs, callback) {
    if (!userAttrs) {
        userAttrs = {};
    }
    var connection = new Connection(userAttrs);
    return callback(null, connection);
}

module.exports.createPool = createPool;
module.exports.getConnection = getConnection;
module.exports.ARRAY = [];
module.exports.OBJECT = {};

module.exports.BLOB = {};
module.exports.BUFFER = '';
module.exports.CLOB = '';
module.exports.CURSOR = '';
module.exports.DATE = '';
module.exports.DEFAULT = '';
module.exports.NUMBER = 0;
module.exports.STRING = '';

module.exports.BIND_IN = '';
module.exports.BIND_INOUT = '';
module.exports.BIND_OUT = '';
