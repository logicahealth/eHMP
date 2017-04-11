'use strict';

var oracledb = require('oracledb');

function doQuery(req, query, callback) {
    var dbConfig = req.app.config.jbpm.activityDatabase;

    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function(error, connection) {
            if (error) {
                return callback(error, null);
            }

            connection.execute(query, [], {
                maxRows: 100,
                outFormat: oracledb.OBJECT
            }, function(err, result) {
                doRelease(req, connection);
                if (err) {
                    return callback(err, null);
                }

                return callback(null, result.rows);
            });
        });
}

function doRelease(req, connection) {
    connection.release(
        function(err) {
            if (err) {
                req.logger.error(err.message);
            }
        });
}

module.exports.doQuery = doQuery;
