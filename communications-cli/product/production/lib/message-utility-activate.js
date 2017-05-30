#!/usr/bin/env node

'use strict';

var oracledb = require('oracledb');
var configHelper = require('./oracle-config-helper.js');
var oracleConfig = {
    user: '',
    password: '',
    connectString: ''
};

function activateMessage(argv) {
    if (!argv.host) {
        configHelper.getOracleConfig(argv.config, argv['connection-object'], function(err, config) {
            if (err) {
                console.log(err);
                return;
            }
            oracleConfig = config;
            activateMessageOracleProcedure(argv.id, function(err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(result + ' activated');
                return;
            });
        });
    } else {
        oracleConfig.user = argv.user;
        oracleConfig.password = argv.password;
        oracleConfig.connectString = argv.host + ':' + argv.port + '/' + argv.service;
        activateMessageOracleProcedure(argv.id, function(err, result) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(result + ' activated');
            return;
        });
    }
}
/**
 * Activates a message by calling the activate_message
 * stored procedure.
 * @param identifier - id of message to activate
 * @param callback - callback to call when finished
 */
function activateMessageOracleProcedure(identifier, callback) {
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
        var procedure_activate_message = 'BEGIN COMMUNICATION.MESSAGE_API.ACTIVATE_MESSAGE(i_identifier => :id, o_rowcount => :output); END;';
        connection.execute(procedure_activate_message, bindParams, {
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

exports.activateMessage = activateMessage;
exports._activateMessageOracleProcedure = activateMessageOracleProcedure;
exports._doRelease = doRelease;
