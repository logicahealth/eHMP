#!/usr/bin/env node

'use strict';

var oracledb = require('oracledb');
var configHelper = require('./oracle-config-helper.js');
var oracleConfig = {
    user: '',
    password: '',
    connectString: ''
};

function deleteMessage(argv) {
    if (!argv.host) {
        configHelper.getOracleConfig(argv.config, argv.connectionObject, function(err, config) {
            if (err) {
                console.log(err);
                return;
            }
            oracleConfig = config;
            deleteMessageOracleProcedure(argv.id, function(err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(result + ' deleted');
                return;
            });
        });
    } else {
        oracleConfig.user = argv.user;
        oracleConfig.password = argv.password;
        oracleConfig.connectString = argv.host + ':' + argv.port + '/' + argv.service;
        deleteMessageOracleProcedure(argv.id, function(err, result) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(result + ' deleted');
            return;
        });
    }
}

/**
 * Deletes a message - Calls delete_message stored procedure.
 * Returns row count of records altered.
 * @param identifier - id of message to delete
 * @param callback - callback to call when done
 */
function deleteMessageOracleProcedure(identifier, callback) {
    oracledb.getConnection(oracleConfig, function(err, connection) {
        var bindParams = {
            id: identifier,
            output: {
                dir: oracledb.BIND_OUT,
                type: oracledb.NUMBER
            }
        };
        if (err) {
            return callback(err);
        }
        var procedure_delete_message = 'BEGIN COMMUNICATION.MESSAGE_API.DELETE_MESSAGE(i_identifier => :id, o_rowcount => :output); END;';
        connection.execute(procedure_delete_message, bindParams, {
            autoCommit: true
        }, function(err, result) {
            doRelease(connection);
            if (err) {
                return callback(err);
            }
            if (result.outBinds.output === 0) {
                return callback('Record not found');
            }
            return callback(null, identifier);
        });
    });
}
/**
 * Releases Oracle connection
 * @param connection
 */
function doRelease(connection) {
    connection.close(
        function(err) {
            if (err) {
                console.log(err);
            }
        });
}

exports.deleteMessage = deleteMessage;
exports._deleteMessageOracleProcedure = deleteMessageOracleProcedure;
exports._doRelease = doRelease;
