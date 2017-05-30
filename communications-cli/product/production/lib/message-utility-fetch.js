#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var oracledb = require('oracledb');
var configHelper = require('./oracle-config-helper.js');
var oracleConfig = {
    user: '',
    password: '',
    connectString: ''
};

function fetchMessages(argv) {
    if (!argv.host) {
        configHelper.getOracleConfig(argv.config, argv.connectionObject, function(err, config) {
            if (err) {
                console.log(err);
                return;
            }
            oracleConfig = config;
            fetchMessagesOracleProcedure(argv.cat, function(error, results) {
                if (error) {
                    console.log(error);
                    return;
                }
                if (results.length === 0) {
                    console.log('No messages found for this category');
                    return;
                }
                printJsonMessages(results);
            });
        });
    } else {
        oracleConfig.user = argv.user;
        oracleConfig.password = argv.password;
        oracleConfig.connectString = argv.host + ':' + argv.port + '/' + argv.service;
        fetchMessagesOracleProcedure(argv.cat, function(error, results) {
            if (error) {
                console.log(error);
                return;
            }
            if (results.length === 0) {
                console.log('No messages found for this category');
                return;
            }
            printJsonMessages(results);
        });
    }
}

function printJsonMessages(messages) {
    var messageCollection = [];
    _.each(messages, function(value) {
        var messageObj = {};
        messageObj.identifier = value[0];
        messageObj.title = value[1];
        messageObj.content = value[2];
        messageObj.date = value[3];
        messageObj.status = value[4];
        messageObj['ehmp-app-version'] = value[5];

        messageCollection.push(messageObj);
    });
    try {
        var response = JSON.stringify(messageCollection);
        console.log(response);
    } catch (err) {
        console.log(err);
    }
}

/**
 * Fetches all messages of the specified category
 * @param category
 * @param callback - callback to call when done
 */
function fetchMessagesOracleProcedure(category, callback) {
    oracledb.fetchAsString = [oracledb.CLOB];
    oracledb.getConnection(oracleConfig, function(err, connection) {
        if (err) {
            return callback(err);
        }
        var fetch_query = 'SELECT identifier, payload_title, payload_content, TO_CHAR(sent), status_code, recipient FROM communication.message WHERE category_code = :categoryCode ORDER BY sent';
        connection.execute(fetch_query, [category], function(err, result) {
            doRelease(connection);
            if (err) {
                return callback(err);
            }
            return callback(null, result.rows);
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

exports.fetchMessages = fetchMessages;
exports._doRelease = doRelease;
