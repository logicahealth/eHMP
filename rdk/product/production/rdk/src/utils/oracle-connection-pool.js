'use strict';

var oracledb = require('oracledb');
var _ = require('lodash');

module.exports._cachedPool = {};

module.exports.doQuery = function(req, dbConfig, query, callback, maxRowsParam) {
    return this.doQueryWithParams(req, dbConfig, query, [], callback, maxRowsParam);
};

module.exports.doQueryWithParams = function(req, dbConfig, query, queryParameters, callback, maxRowsParam) {
    queryParameters = queryParameters || [];
    var self = this;
    this._getPool(req, dbConfig, function(poolError, pool) {
        if (poolError) {
            return callback(poolError, null);
        }
        pool.getConnection(function(error, connection) {
            if (error) {
                if (req && req.logger) {
                    req.logger.error(error.message);
                }
                return callback(error, null);
            }

            var options = {
                maxRows: maxRowsParam || 100,
                    outFormat: oracledb.OBJECT
            };
            connection.execute(query, queryParameters, options, function(err, result) {
                self._doClose(req, connection);
                if (err) {
                    return callback(err, null);
                }
                return callback(null, result.rows);
            });
        });
    });
};

module.exports._getPool = function(req, dbConfig, cb) {
    if (_.isEmpty(this._cachedPool)) {
        this._onShutdown();
    }
    var connectionHash = new Buffer(dbConfig.user + dbConfig.password + dbConfig.connectString).toString('base64');
    if (!_.isEmpty(this._cachedPool) && _.has(this._cachedPool, connectionHash)) {
        return cb(null, this._cachedPool[connectionHash]);
    }

    var self = this;
    oracledb.createPool({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString,
            poolMin: dbConfig.poolMin || 0,
            poolMax: dbConfig.poolMax || 4,
            _enableStats: true
        },
        function(err, pool) {
            if (err) {
                if (req && req.logger) {
                    req.logger.error(err.message);
                }
                return cb(err, null);
            }
            self._cachedPool[connectionHash] = pool;
            return cb(null, pool);
        });
};

module.exports._doClose = function(req, connection) {
    connection.close(function(err) {
        if (err) {
            if (req && req.logger) {
                req.logger.error(err.message);
            }
        }
    });
};

module.exports._onShutdown =  function() {
    var self = this;
    process.on('SIGQUIT', function() {
        self._closePool();
    });
    process.on('SIGTERM', function() {
        self._closePool();
    });
    process.on('SIGINT', function() {
        self._closePool();
    });
};

module.exports._closePool = function() {
    var self = this;
    _.each(this._cachedPool, function(pool, poolKey) {
        var closeError;
        pool.close(function(error) {
            if (error) {
                closeError = true;
                //@TODO: Add logging of error
            }
        });
        if (!closeError) {
            delete self._cachedPool[poolKey];
        }
    });
};
