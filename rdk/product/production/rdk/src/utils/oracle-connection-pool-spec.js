var bunyan = require('bunyan');
var logger = sinon.stub(bunyan.createLogger({name: 'test-logger'}));

var _ = require('lodash');
var oracledb = require('oracledb');
var oracleConnectionPool = require('./oracle-connection-pool');

var dbConfig = {
    user: 'user',
    password: 'password',
    connectString: 'connectString',
};

var req = {
    logger: logger
};

var mockPool = {'simulated': 'connectionPool'};

var mockKey = 'dXNlcnBhc3N3b3JkY29ubmVjdFN0cmluZw==';

var mockCachedPool = {
    'dXNlcnBhc3N3b3JkY29ubmVjdFN0cmluZw==': mockPool
 };

describe('oracle-connection-pool-spec.js', function() {
    'use strict';

    var orgLoggerLevel = logger._level;
    beforeEach(function() {
        logger._level = 50;
    });

    afterEach(function(){
        logger._level = orgLoggerLevel;
    });

    describe('doQuery', function() {
        it('Should call doQueryWithParams', function() {
            sinon.stub(oracleConnectionPool, 'doQueryWithParams', function(req, dbConfig, query, queryParameters, callback, maxRowsParam) {
                return callback(null, 'Called doQueryWithParams');
            });
            oracleConnectionPool.doQuery(req, dbConfig, '', function(error, response){
                expect(response).to.eql('Called doQueryWithParams');
            }, 100);
        });
    });

    describe('doQueryWithParams', function() {
        var query = 'SELECT * FROM activitydb.Am_TaskRoute WHERE taskInstanceId IN (test0,test1) OR taskInstanceId IN (test2) order by taskInstanceId,id';
        it('Should have queryParameters pass through user defined data', function() {
            sinon.stub(oracleConnectionPool, '_getPool', function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    var conn;
                    response.getConnection(function(error, response) {
                        response.execute = function(sql, bindParams, options, callback) {
                            return callback(null, bindParams);
                        };
                        conn = response;
                    });
                    response.getConnection = function(callback) {
                        return callback(null, conn);
                    };
                    callback(null, response);
                });
            });
            var queryParameters = {
                rows: 'success'
            };
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, queryParameters, function(error, response) {
                expect(response).to.eql('success');
            });
        });

        it('Should have queryParameters pass through an empty Array', function() {
            sinon.stub(oracleConnectionPool, '_getPool', function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    var conn;
                    response.getConnection(function(error, response) {
                        response.execute = function(sql, bindParams, options, callback) {
                            if (_.isArray(bindParams) && _.isEmpty(bindParams)) {
                                return callback(null, {rows: []});
                            }
                            return callback('bindParams not an empty array', null);
                        };
                        conn = response;
                    });
                    response.getConnection = function(callback) {
                        return callback(null, conn);
                    };
                    callback(null, response);
                });
            });
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql([]);
            });
        });

        it('Should get an error from _getPool', function() {
            sinon.stub(oracleConnectionPool, '_getPool', function(req, dbConfig, callback) {
                return callback('_getPool error');
            });
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(error).to.eql('_getPool error');
            });
        });

        it('Should get an error from pool.getConnection', function() {
            sinon.stub(oracleConnectionPool, '_getPool', function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    callback('pool.getConnection error');
                });
            });
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(error).to.eql('pool.getConnection error');
            });
        });

        it('Should have maxRowsParam pass through user defined data', function() {
            sinon.stub(oracleConnectionPool, '_getPool', function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    var conn;
                    response.getConnection(function(error, response) {
                        response.execute = function(sql, bindParams, options, callback) {
                            return callback(null, {rows: options.maxRows});
                        };
                        conn = response;
                    });
                    response.getConnection = function(callback) {
                        return callback(null, conn);
                    };
                    callback(null, response);
                });
            });
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql(500);
            }, 500);
        });

        it('Should have maxRosParam passed through 100', function() {
            sinon.stub(oracleConnectionPool, '_getPool', function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    var conn;
                    response.getConnection(function(error, response) {
                        response.execute = function(sql, bindParams, options, callback) {
                            return callback(null, {rows: options.maxRows});
                        };
                        conn = response;
                    });
                    response.getConnection = function(callback) {
                        return callback(null, conn);
                    };
                    callback(null, response);
                });
            });
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql(100);
            });
        });

        it('Should have connection.execute call _doClose', function() {
            sinon.stub(oracleConnectionPool, '_getPool', function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    callback(null, response);
                });
            });
            sinon.stub(oracleConnectionPool, '_doClose', function(req, connection) {
                expect(req.doClose).to.eql(true);
            });
            var modReq = {
                logger: logger,
                doClose: true
            };
            oracleConnectionPool.doQueryWithParams(modReq, dbConfig, query, null, function(error, response) {});
        });

        it('Should have connection.execute return an error', function() {
            sinon.stub(oracleConnectionPool, '_getPool', function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    var conn;
                    response.getConnection(function(error, response) {
                        response.execute = function(sql, bindParams, options, callback) {
                            return callback('connection.execute error', null);
                        };
                        conn = response;
                    });
                    response.getConnection = function(callback) {
                        return callback(null, conn);
                    };
                    callback(null, response);
                });
            });
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(error).to.eql('connection.execute error');
            });
        });

        it('Should have connection.execute return success', function() {
            sinon.stub(oracleConnectionPool, '_getPool', function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    var conn;
                    response.getConnection(function(error, response) {
                        response.execute = function(sql, bindParams, options, callback) {
                            return callback(null, {rows: 'success'});
                        };
                        conn = response;
                    });
                    response.getConnection = function(callback) {
                        return callback(null, conn);
                    };
                    callback(null, response);
                });
            });
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql('success');
            });
        });
    });

    describe('_getPool', function() {
        var mockCreatePool;
        beforeEach(function() {

        });

        afterEach(function() {

        });

        it('Should return an empty object because _onShutdown is called', function() {
            var pool;
            sinon.stub(oracleConnectionPool, '_onShutdown', function() {
                pool = _.cloneDeep(oracleConnectionPool._cachedPool);
            });
            oracleConnectionPool._getPool(req, dbConfig, function(error, response) {
                expect(pool).to.eql({});
            });
        });

        it('Should create a new pool even though cachedPool is not empty', function() {
            oracleConnectionPool._cachedPool.randomkey = _.cloneDeep(oracleConnectionPool._cachedPool[mockKey]);
            oracleConnectionPool._cachedPool.randomkey.pool = {'connectionPool': 'simulated'};
            oracleConnectionPool._getPool(req, dbConfig, function(error, response) {
                expect(_.has(oracleConnectionPool._cachedPool, mockKey)).to.eql(true);
                expect(response.poolAttrs.connectString).to.eql(dbConfig.connectString);
            });
        });

        it('Should change the min and max pool connection size', function() {
            oracleConnectionPool._cachedPool = {};
            var dbConfigUpdate = _.cloneDeep(dbConfig);
            dbConfigUpdate.poolMin = 10;
            dbConfigUpdate.poolMax = 20;
            oracleConnectionPool._getPool(req, dbConfigUpdate, function(error, response) {
                expect(response.poolAttrs.poolMin).to.eql(10);
                expect(response.poolAttrs.poolMax).to.eql(20);
            });
        });

        it('Should return an error sent from oracledb.createPool', function() {
            oracleConnectionPool._cachedPool = {};
            sinon.stub(oracledb, 'createPool', function(options, callback) {
                return callback({message: 'error from createPool'}, null);
            });
            oracleConnectionPool._getPool(req, dbConfig, function(error, response) {
                expect(error).to.eql({message: 'error from createPool'});
                expect(response).to.eql(null);
            });
        });

        it('Should return the _cachedPool object with our test data', function() {
            oracleConnectionPool._cachedPool = {};
            oracleConnectionPool._getPool(req, dbConfig, function(error, response) {
                expect(response).to.eql(oracleConnectionPool._cachedPool[mockKey]);
            });
        });

        it('Should return the cached pool from our mockKey', function() {
            oracleConnectionPool._getPool(req, dbConfig, function(error, response) {
                expect(response).to.eql(oracleConnectionPool._cachedPool[mockKey]);
            });
        });
    });

    describe('_doClose', function() {
        it('Should close the connection and not send back a response', function() {
            var conn;
            oracledb.getConnection(dbConfig, function(error, connection) {
                conn = connection;
            });
            oracleConnectionPool._doClose(req, conn);
        });

        it('Should return an error and try to log it', function() {
            var conn;
            oracledb.getConnection(dbConfig, function(error, connection) {
                conn = connection;
            });
            conn.close = function(callback) {
                return callback({message: 'Close error'});
            };

            oracleConnectionPool._doClose(req, conn);
            var lastError = logger.error.getCall(logger.error.callCount - 1).args;
            expect(lastError[0]).to.eql('Close error');
        });
    });

    describe('_onShutdown', function() {
        it('Should have a listener on SIGQUIT pointing to closePool()', function() {
            var listeners = process.listeners('SIGQUIT');
            var foundClosePool = false;
            for (var i = 0; i < listeners.length; i++) {
                var func = listeners[i].toString();
                if (-1 !== func.indexOf('_closePool()')) {
                    foundClosePool = true;
                }
            }
            expect(foundClosePool).to.eql(true);
        });

        it('Should have a listener on SIGTERM pointing to closePool()', function() {
           var listeners = process.listeners('SIGTERM');
            var foundClosePool = false;
            for (var i = 0; i < listeners.length; i++) {
                var func = listeners[i].toString();
                if (-1 !== func.indexOf('_closePool()')) {
                    foundClosePool = true;
                }
            }
            expect(foundClosePool).to.eql(true);
        });

        it('Should have a listener on SIGINT pointing to closePool()', function() {
           var listeners = process.listeners('SIGINT');
            var foundClosePool = false;
            for (var i = 0; i < listeners.length; i++) {
                var func = listeners[i].toString();
                if (-1 !== func.indexOf('_closePool()')) {
                    foundClosePool = true;
                }
            }
            expect(foundClosePool).to.eql(true);
        });
    });

    describe('_closePool', function() {
        it('Should catch the error and not delete the key from the cachedPool', function() {
            oracleConnectionPool._cachedPool[mockKey].close = function(callback) {
                return callback({message: 'Failed'});
            };
            oracleConnectionPool._closePool();
            var lastError = logger.error.getCall(logger.error.callCount - 1).args;
            expect(oracleConnectionPool._cachedPool).to.not.be.empty();
        });

        it('Should close all the connections and cachedPool should be empty', function() {
            oracleConnectionPool._cachedPool = {};
            oracleConnectionPool._getPool(req, dbConfig, function(error, response) {
                oracleConnectionPool._closePool();
                expect(oracleConnectionPool._cachedPool).to.eql({});
            });
        });
    });
});
