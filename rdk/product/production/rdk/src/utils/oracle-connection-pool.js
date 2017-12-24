'use strict';

var oracledb = require('oracledb');
var _ = require('lodash');
var async = require('async');

var isClosing = false;

module.exports._cachedPool = {};

function ConnectionError(message) {
    var error = Error.call(this, message);

    this.name = 'ConnectionError';
    this.message = error.message;
    this.stack = error.stack;
}

ConnectionError.prototype = Object.create(Error.prototype);
ConnectionError.prototype.constructor = ConnectionError;

module.exports.ConnectionError = ConnectionError;

function ExecutionError(message) {
    var error = Error.call(this, message);

    this.name = 'ExecutionError';
    this.message = error.message;
    this.stack = error.stack;
}

ExecutionError.prototype = Object.create(Error.prototype);
ExecutionError.prototype.constructor = ExecutionError;

module.exports.ExecutionError = ExecutionError;

module.exports.doQuery = function(req, dbConfig, query, callback, maxRowsParam) {
    return this.doQueryWithParams(req, dbConfig, query, [], callback, maxRowsParam);
};

module.exports.doQueryWithParams = function(req, dbConfig, query, queryParameters, callback, maxRowsParam) {
    if (isClosing) {
        return callback(new Error('Connection pool closing for shutdown - no new connections allowed'));
    }
    queryParameters = queryParameters || [];
    var self = this;
    self.getPool(req, dbConfig, function(poolError, pool) {
        if (poolError) {
            return callback(new ConnectionError(poolError), null);
        }
        pool.getConnection(function(error, connection) {
            if (error) {
                error = new ConnectionError(error);
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
                self.doClose(req, connection);
                if (err) {
                    return callback(new ExecutionError(err), null);
                }
                return callback(null, result.rows);
            });
        });
    });
};

module.exports.doExecuteProcWithParams = function(req, dbConfig, query, parameters, callback, maxRowsParam) {
    if (isClosing) {
        return callback(new Error('Connection pool closing for shutdown - no new connections allowed'));
    }
    parameters = parameters || {};
    parameters.recordset = {
        type: oracledb.CURSOR,
        dir: oracledb.BIND_OUT
    };

    var self = this;
    this.getPool(req, dbConfig, function(poolError, pool) {
        if (poolError) {
            return callback(new ConnectionError(poolError), null);
        }
        pool.getConnection(function(error, connection) {
            if (error) {
                error = new ConnectionError(error);
                if (req && req.logger) {
                    req.logger.error(error.message);
                }
                return callback(error, null);
            }

            var options = {
                maxRows: maxRowsParam || 100,
                outFormat: oracledb.OBJECT
            };

            connection.execute(query, parameters, options, function(err, result) {
                if (err) {
                    err = new ExecutionError(err);
                    if (req && req.logger) {
                        req.logger.error(err.message);
                    }

                    self.doClose(req, connection);
                    return callback(err, null);
                }

                result.outBinds.recordset.getRows(maxRowsParam, function(err, rows) {
                    self._doCloseCursor(req, connection, result.outBinds.recordset);
                    if (err) {
                        err = new ConnectionError(err);
                        if (req && req.logger) {
                            req.logger.error(err.message);
                        }

                        return callback(err, null);
                    } else {
                        return callback(null, rows);
                    }
                });
            });
        });
    });
};

module.exports.doExecuteProcMultipleRecordSets = function(req, dbConfig, query, parameters, callback, maxRowsParam) {
    if (isClosing) {
        return callback(new Error('Connection pool closing for shutdown - no new connections allowed'));
    }
    parameters = parameters || {};
    parameters.recordset = {
        type: oracledb.CURSOR,
        dir: oracledb.BIND_OUT
    };
    parameters.recordset2 = {
        type: oracledb.CURSOR,
        dir: oracledb.BIND_OUT
    };

    var self = this;
    this.getPool(req, dbConfig, function(poolError, pool) {
        if (poolError) {
            return callback(new ConnectionError(poolError), null);
        }
        pool.getConnection(function(error, connection) {
            if (error) {
                error = new ConnectionError(error);
                if (req && req.logger) {
                    req.logger.error(error.message);
                }
                return callback(error, null);
            }

            var options = {
                maxRows: maxRowsParam || 100,
                outFormat: oracledb.OBJECT
            };

            connection.execute(query, parameters, options, function(err, result) {
                if (err) {
                    err = new ExecutionError(err);
                    if (req && req.logger) {
                        req.logger.error(err.message);
                    }

                    self.doClose(req, connection);
                    return callback(err, null);
                }
                async.parallel([

                        function(parallelCb) {
                            result.outBinds.recordset.getRows(maxRowsParam, function(err, rows) {
                                if (err) {
                                    err = new ConnectionError(err);
                                    if (req && req.logger) {
                                        req.logger.error(err.message);
                                    }
                                    self._doCloseRecordset(req, result.outBinds.recordset, function (cberr) {
                                        return parallelCb(err, null); //return the original error
                                    });
                                } else {
                                    self._doCloseRecordset(req, result.outBinds.recordset, function (err) {
                                        return parallelCb(null, rows); //only return the cb after recordset is done
                                    });
                                }
                            });

                        },
                        function(parallelCb) {
                            result.outBinds.recordset2.getRows(maxRowsParam, function(err, rows) {
                                if (err) {
                                    err = new ConnectionError(err);
                                    if (req && req.logger) {
                                        req.logger.error(err.message);
                                    }
                                    self._doCloseRecordset(req, result.outBinds.recordset2, function () {
                                        return parallelCb(err, null); //only return the cb after recordset is done
                                    });
                                } else {
                                    self._doCloseRecordset(req, result.outBinds.recordset2, function () {
                                        return parallelCb(null, rows); //only return the cb after recordset is done
                                    });
                                }
                            });
                        }
                    ],
                    function(err, results) {
                        if (err) {
                            //close the connection
                            self.doClose(req, connection);
                            err = new ConnectionError(err);
                            if (req && req.logger) {
                                req.logger.error(err.message);
                            }

                            return callback(err, null);
                        }
                        self.doClose(req, connection);
                        return callback(null, results);
                    });
            });
        });
    });
};

module.exports.doExecuteProcWithInOutParams = function(req, dbConfig, query, parameters, autoCommit, callback, maxRowsParam) {
    if (isClosing) {
        return callback(new Error('Connection pool closing for shutdown - no new connections allowed'));
    }
    parameters = parameters || {};

    var self = this;
    this.getPool(req, dbConfig, function(poolError, pool) {
        if (poolError) {
            return callback(new ConnectionError(poolError), null);
        }
        pool.getConnection(function(error, connection) {
            if (error) {
                error = new ConnectionError(error);
                if (req && req.logger) {
                    req.logger.error(error.message);
                }
                return callback(error, null);
            }

            var options = {
                maxRows: maxRowsParam || 100,
                outFormat: oracledb.OBJECT,
                autoCommit: autoCommit
            };

            connection.execute(query, parameters, options, function(err, result) {
                self.doClose(req, connection);
                if (err) {
                    err = new ExecutionError(err);
                    if (req && req.logger) {
                        req.logger.error(err.message);
                    }

                    return callback(err, null);
                }
                return callback(null, result);
            });
        });
    });
};

module.exports.getPool = function(req, dbConfig, cb) {
    if (isClosing) {
        return cb(new Error('Connection pool closing for shutdown - no new connections allowed'));
    }
    if(!_.has(dbConfig, 'user') || !_.has(dbConfig, 'password') || !_.has(dbConfig, 'connectString')) {
        return cb(new Error('Missing connection string or user credentials to oracle data store'), null);
    }
    var self = this;
    var connectionHash = new Buffer(dbConfig.user + dbConfig.password + dbConfig.connectString).toString('base64');
    if (!_.isEmpty(self._cachedPool) && _.has(self._cachedPool, connectionHash)) {
        return cb(null, self._cachedPool[connectionHash]);
    }

    oracledb.createPool({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString,
            poolMin: dbConfig.poolMin || 0,
            poolMax: dbConfig.poolMax || 4,
            poolPingInterval: 10,
            poolTimeout: 60,
            _enableStats: true
        },
        function(err, pool) {
            if (err) {
                err = new ConnectionError(err);
                if (req && req.logger) {
                    req.logger.error(err.message);
                }
                return cb(err, null);
            }
            self._cachedPool[connectionHash] = pool;
            return cb(null, pool);
        });
};


module.exports._doCloseCursor = function(req, connection, recordSet) {
    var self = this;
    recordSet.close(
        function(err) {
            if (err) {
                err = new ExecutionError(err);
                if (req && req.logger) {
                    req.logger.error(err.message);
                }
            }
            self.doClose(req, connection);
        });
};

module.exports._doCloseRecordset = function(req, recordSet, cb) {
    //warning : this method does not close the connection
    //        : it only closes the record set
    //        : make sure you issue ._doClose once you've closed all your resultsets
    recordSet.close(
        function(err) {
            if (err) {
                err = new ExecutionError(err);
                if (req && req.logger) {
                    req.logger.error(err.message);
                }
                return cb(err);
            }
            return cb(null);
        });
};

module.exports.doClose = function(req, connection) {
    connection.close(function(err) {
        if (err) {
            err = new ExecutionError(err);
            if (req && req.logger) {
                req.logger.error(err.message);
            }
        }
    });
};

module.exports._closePool = function(callback, logger) {
    isClosing = true;
    var self = exports;
    var pLength = Object.keys(self._cachedPool).length;
    if (pLength > 0) {
        _.each(self._cachedPool, function(pool, poolKey) {
            pool._logStats();
            if (pool.hasOwnProperty('connectionsInUse') && pool.connectionsInUse > 0) {
                logger('WARNING: closing connection pool with ' + pool.connectionsInUse + ' in-use connections.');
            }
            pool.close(function(err) {
                if (err) {
                    logger('error closing pool ' + poolKey + ': ' + err);
                }
                delete self._cachedPool[poolKey];
                if (Object.keys(self._cachedPool).length === 0) {
                    return callback(null, pLength);
                }
            });
        });
    } else {
        callback(null, pLength);
    }
};
