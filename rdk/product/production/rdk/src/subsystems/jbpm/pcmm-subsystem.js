'use strict';

var _ = require('lodash');

var rdk = require('../../core/rdk');
var db = rdk.utils.pooledJbpmDatabase;
var oracledb = require('oracledb');

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: app.subsystems.jbpm.getHealthcheck(app, logger)
    };
}
module.exports.getSubsystemConfig = getSubsystemConfig;

function doQuery(dbConfig, query, callback) {
    db.doQuery(null, dbConfig, query, callback);
}
module.exports.doQuery = doQuery;

function doQueryWithParams(dbConfig, query, queryParameters, callback, maxRowsParam) {
    db.doQueryWithParams(null, dbConfig, query, queryParameters, callback, (maxRowsParam || 1000000));
}
module.exports.doQueryWithParams = doQueryWithParams;

function validate(typeJson, instanceJson, appConfig, cb, errors) {
    var abort = false;
    if (!appConfig || !appConfig.jbpm || !appConfig.jbpm.activityDatabase || !_.isObject(appConfig.jbpm.activityDatabase)) {
        if (errors) {
            errors.push('bad app configuration for pcmm validation');
        }
        abort = true;
    }
    if (!typeJson || !typeJson.fields || !typeJson.table || !_.isArray(typeJson.fields) || (typeJson.fields.length < 1)) {
        if (errors) {
            errors.push('bad type for pcmm validation');
        }
        abort = true;
    }
    if (!instanceJson || !_.isObject(instanceJson)) {
        if (errors) {
            errors.push('bad instance for pcmm validation');
        }
        abort = true;
    }
    if (abort) {
        return cb(true);
    }

    var query = '';

    //If validating Team Role, use Validate Role SP, otherwise if validating
    //the team name, use the Validate Team SP
    if (typeJson.table === 'PCMM.PCM_STD_TEAM_ROLE') {
        query = 'BEGIN PCMM.VALIDATE_ROLE(:instance_id,:pcmm_recordset); END; ';
    } else if (typeJson.table === 'PCMM.TEAM') {
        query = 'BEGIN PCMM.VALIDATE_TEAM(:instance_id,:pcmm_recordset); END; ';
    }

    var bindVars = {
        instance_id: _.get(instanceJson, typeJson.fields[0].inJson),
        pcmm_recordset: {
            type: oracledb.CURSOR,
            dir: oracledb.BIND_OUT
        }
    };

    //We only ever need to check that the selected team/role exists in the database
    var MAX_ROWS = 1;

    oracledb.getConnection(
        appConfig.jbpm.activityDatabase,
        function(err, connection) {
            if (err) {
                errors.push('error getting database connection');
                return;
            }
            connection.execute(query, bindVars, function(err, result) {
                if (err) {
                    errors.push('error executing database query');
                    doRelease(connection);
                    return;
                }
                fetchRowsFromRS(connection, result.outBinds.pcmm_recordset, MAX_ROWS, cb);
            });
        });

    function fetchRowsFromRS(connection, resultSet, numRows, cb) {

        resultSet.getRows(numRows, function(err, rows) {

            //go ahead and close the connection since we only care about whether the row exists
            doClose(connection, resultSet);
            if (err) {
                errors.push('An error occurred getting the rows from the dataset');
                return cb(false, false);
            }

            if (rows.length > 0) {
                return cb(false, true);
            } else {
                return cb(false, false);
            }
        });

    }

    function doRelease(connection) {
        connection.release(
            function(err) {
                if (err) {
                    errors.push('error occurred releasing database connection');
                }
            });
    }

    function doClose(connection, resultSet) {
        resultSet.close(
            function(err) {
                if (err) {
                    errors.push('error occurred closing database connection');
                }
                doRelease(connection);
            });
    }

}

module.exports.validate = validate;
