#!/usr/bin/env node

'use strict';

var oracledb = require('oracledb');
var _ = require('lodash');
var configHelper = require('./oracle-config-helper.js');
var oracleConfig = {
    user: '',
    password: '',
    connectString: ''
};
var userToUpdate;
var enabled;
var categorySystem = 'http://ehmp.DNS   /messageCategories';
var categoryCode;

/**
 * 1. Checks if enabled is set to true or false. Returns error if not
 * 2. If true, sey enabled to 'Y', else set to 'N'
 * 3. If user is provided, store it
 * 4. Call method to update preferences
 * @param argv
 * @return
 */
function updateUserPreferences(argv) {
    if (_.lowerCase(argv.enabled) !== 'true' && _.lowerCase(argv.enabled) !== 'false') {
        console.log('Enabled must be set to True or False');
        return;
    }

    if (_.lowerCase(argv.enabled) === 'true') {
        enabled = 'Y';
    } else {
        enabled = 'N';
    }

    if (argv.userId) {
        userToUpdate = argv.userId;
    }
    categoryCode = argv.category;

    if (!argv.host) {
        configHelper.getOracleConfig(argv.config, argv.connectionObject, function(err, config) {
            if (err) {
                console.log(err);
                return;
            }
            oracleConfig = config;
            updatePreferencesOracleProcedure(function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                }
                console.log('Preferences updated: ' + result);
                return;
            });
        });
    } else {
        oracleConfig.user = argv.user;
        oracleConfig.password = argv.password;
        oracleConfig.connectString = argv.host + ':' + argv.port + '/' + argv.service;
        updatePreferencesOracleProcedure(function(error, result) {
            if (error) {
                console.log(error);
                return;
            }
            console.log('Preferences updated: ' + result);
            return;
        });
    }
}

/**
 * Calls oracle procedure to update user preferences
 * @param callback
 */
function updatePreferencesOracleProcedure(callback) {
    oracledb.getConnection(oracleConfig, function(err, connection) {
        var bindParams = {
            user: userToUpdate,
            category: categoryCode,
            system: categorySystem,
            status: enabled,
            output: {
                dir: oracledb.BIND_OUT,
                type: oracledb.NUMBER
            }
        };
        if (err) {
            return callback(err);
        }
        var procedure_update_user = 'BEGIN COMMUNICATION.MESSAGE_API.UPDATE_USER_PREFERENCES(i_user_id => :user, i_category_system => :system, i_category_code => :category, i_enabled => :status, o_rowcount => :output); END;';
        connection.execute(procedure_update_user, bindParams, {
            autoCommit: true
        }, function(err, result) {
            doRelease(connection);
            if (err) {
                return callback(err);
            }
            if (result.outBinds.output === 0) {
                return callback('Record not found');
            }
            return callback(null, result.outBinds.output);
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

exports.updateUserPreferences = updateUserPreferences;
exports._updatePreferencesOracleProcedure = updatePreferencesOracleProcedure;
exports._doRelease = doRelease;
