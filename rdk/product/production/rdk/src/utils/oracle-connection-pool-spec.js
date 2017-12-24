'use strict';

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

var mockKey = 'dXNlcnBhc3N3b3JkY29ubmVjdFN0cmluZw==';

describe('oracle-connection-pool-spec.js', function() {
    var orgLoggerLevel = logger._level;
    var poolError;
    var connectionError;
    var executeError;
    var getRowsError;
    var pool;
    var connection;
    var result;
    var rows;

    beforeEach(function() {
        logger._level = 50;
        stubOracle();
    });

    afterEach(function(){
        logger._level = orgLoggerLevel;
    });

    describe('doQuery', function() {
        it('Should call doQueryWithParams', function(done) {
            sinon.stub(oracleConnectionPool, 'doQueryWithParams').callsFake(function(req, dbConfig, query, queryParameters, callback, maxRowsParam) {
                return callback(null, 'Called doQueryWithParams');
            });
            oracleConnectionPool.doQuery(req, dbConfig, '', function(error, response){
                expect(response).to.eql('Called doQueryWithParams');
                done();
            }, 100);
        });
    });

    describe('doQueryWithParams', function() {
        var query = 'SELECT * FROM activitydb.Am_TaskRoute WHERE taskInstanceId IN (test0,test1) OR taskInstanceId IN (test2) order by taskInstanceId,id';
        it('Should have queryParameters pass through user defined data', function(done) {
            var queryParameters = {
                rows: 'success'
            };
            connection.execute = function (query, parameters, options, callback) {
                result.rows = parameters.rows;
                callback(executeError, result);
            };
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, queryParameters, function(error, response) {
                expect(response).to.eql('success');
                done();
            });
        });

        it('Should have queryParameters pass through an empty Array', function(done) {
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql([]);
                done();
            });
        });

        it('Should get an error from getPool', function () {
            oracleConnectionPool._cachedPool = {};
            poolError = 'getPool error';
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(error.message).to.eql('ConnectionError: getPool error');
            });
        });

        it('Should get an error from pool.getConnection', function(done) {
            connectionError = 'pool.getConnection error';
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(error.message).to.eql('pool.getConnection error');
                done();
            });
        });

        it('Should have maxRowsParam pass through user defined data', function(done) {
            connection.execute = function (query, parameters, options, callback) {
                result.rows = options.maxRows;
                callback(executeError, result);
            };
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql(500);
                done();
            }, 500);
        });

        it('Should have maxRosParam passed through 100', function(done) {
            connection.execute = function (query, parameters, options, callback) {
                result.rows = options.maxRows;
                callback(executeError, result);
            };
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql(100);
                done();
            });
        });

        it('Should have connection.execute call doClose', function(done) {
            sinon.stub(oracleConnectionPool, 'getPool').callsFake(function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    callback(null, response);
                });
            });
            sinon.stub(oracleConnectionPool, 'doClose').callsFake(function(req, connection) {
                expect(req.doClose).to.eql(true);
            });
            var modReq = {
                logger: logger,
                doClose: true
            };
            oracleConnectionPool.doQueryWithParams(modReq, dbConfig, query, null, function(error, response) {
                done();
            });
        });

        it('Should have connection.execute return an error', function(done) {
            executeError = 'connection.execute error';
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(error.message).to.eql('connection.execute error');
                done();
            });
        });

        it('Should have connection.execute return success', function(done) {
            connection.execute = function(sql, bindParams, options, callback) {
                return callback(null, {rows: 'success'});
            };
            oracleConnectionPool.doQueryWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql('success');
                done();
            });
        });
    });

    describe('doExecuteProcWithParams', function() {
        var query = 'SELECT * FROM activitydb.Am_TaskRoute WHERE taskInstanceId IN (test0,test1) OR taskInstanceId IN (test2) order by taskInstanceId,id';
        it('Should have queryParameters pass through user defined data', function(done) {
            var queryParameters = {
                rows: 'success'
            };
            connection.execute = function (query, parameters, options, callback) {
                rows = parameters.rows;
                callback(executeError, result);
            };
            oracleConnectionPool.doExecuteProcWithParams(req, dbConfig, query, queryParameters, function(error, response) {
                expect(response).to.eql('success');
                done();
            });
        });

        it('Should have queryParameters pass through an empty Array', function(done) {
            oracleConnectionPool.doExecuteProcWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql([]);
                done();
            });
        });

        it('Should get an error from getPool', function () {
            oracleConnectionPool._cachedPool = {};
            poolError = 'getPool error';
            oracleConnectionPool.doExecuteProcWithParams(req, dbConfig, query, null, function(error, response) {
                expect(error.message).to.eql('ConnectionError: getPool error');
            });
        });

        it('Should get an error from pool.getConnection', function(done) {
            connectionError = 'pool.getConnection error';
            oracleConnectionPool.doExecuteProcWithParams(req, dbConfig, query, null, function(error, response) {
                expect(error.message).to.eql('pool.getConnection error');
                done();
            });
        });

        it('Should have maxRowsParam pass through user defined data', function(done) {
            connection.execute = function (query, parameters, options, callback) {
                rows = options.maxRows;
                callback(executeError, result);
            };
            oracleConnectionPool.doExecuteProcWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql(500);
                done();
            }, 500);
        });

        it('Should have maxRosParam passed through 100', function(done) {
            connection.execute = function (query, parameters, options, callback) {
                rows = options.maxRows;
                callback(executeError, result);
            };
            oracleConnectionPool.doExecuteProcWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql(100);
                done();
            });
        });

        it('Should have connection.execute call doClose', function(done) {
            sinon.stub(oracleConnectionPool, 'getPool').callsFake(function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    callback(null, response);
                });
            });
            sinon.stub(oracleConnectionPool, 'doClose').callsFake(function(req, connection) {
                expect(req.doClose).to.eql(true);
            });
            var modReq = {
                logger: logger,
                doClose: true
            };
            oracleConnectionPool.doExecuteProcWithParams(modReq, dbConfig, query, null, function(error, response) {
                done();
            });
        });

        it('Should have connection.execute return an error', function(done) {
            executeError = 'connection.execute error';
            oracleConnectionPool.doExecuteProcWithParams(req, dbConfig, query, null, function(error, response) {
                expect(error.message).to.eql('connection.execute error');
                done();
            });
        });

        it('Should have connection.execute return success', function(done) {
            connection.execute = function(sql, bindParams, options, callback) {
                rows = 'success';
                return callback(null, result);
            };
            oracleConnectionPool.doExecuteProcWithParams(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql('success');
                done();
            });
        });
    });

    describe('doExecuteProcMultipleRecordSets', function() {
        var query = 'SELECT * FROM activitydb.Am_TaskRoute WHERE taskInstanceId IN (test0,test1) OR taskInstanceId IN (test2) order by taskInstanceId,id';
        it('Should have queryParameters pass through user defined data', function(done) {
            var queryParameters = {
                rows: 'success'
            };
            connection.execute = function (query, parameters, options, callback) {
                rows = parameters.rows;
                callback(executeError, result);
            };
            oracleConnectionPool.doExecuteProcMultipleRecordSets(req, dbConfig, query, queryParameters, function(error, response) {
                expect(response).to.eql(['success', 'success']);
                done();
            });
        });

        it('Should have queryParameters pass through an empty Array', function(done) {
            oracleConnectionPool.doExecuteProcMultipleRecordSets(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql([[], []]);
                done();
            });
        });

        it('Should get an error from getPool', function () {
            oracleConnectionPool._cachedPool = {};
            poolError = 'getPool error';
            oracleConnectionPool.doExecuteProcMultipleRecordSets(req, dbConfig, query, null, function(error, response) {
                expect(error.message).to.eql('ConnectionError: getPool error');
            });
        });

        it('Should get an error from pool.getConnection', function(done) {
            connectionError = 'pool.getConnection error';
            oracleConnectionPool.doExecuteProcMultipleRecordSets(req, dbConfig, query, null, function(error, response) {
                expect(error.message).to.eql('pool.getConnection error');
                done();
            });
        });

        it('Should get an error from resultset.getRows', function(done) {
            getRowsError = 'resultset.getRows error';
            oracleConnectionPool.doExecuteProcMultipleRecordSets(req, dbConfig, query, null, function(error, response) {
                expect(error.message).to.eql('ConnectionError: resultset.getRows error');
                done();
            });
        });

        it('Should have maxRowsParam pass through user defined data', function(done) {
            connection.execute = function (query, parameters, options, callback) {
                rows = options.maxRows;
                callback(executeError, result);
            };
            oracleConnectionPool.doExecuteProcMultipleRecordSets(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql([500, 500]);
                done();
            }, 500);
        });

        it('Should have maxRosParam passed through 100', function(done) {
            connection.execute = function (query, parameters, options, callback) {
                rows = options.maxRows;
                callback(executeError, result);
            };
            oracleConnectionPool.doExecuteProcMultipleRecordSets(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql([100, 100]);
                done();
            });
        });

        it('Should have connection.execute call doClose', function(done) {
            sinon.stub(oracleConnectionPool, 'getPool').callsFake(function(req, dbConfig, callback) {
                oracledb.createPool({}, function(error, response) {
                    callback(null, response);
                });
            });
            sinon.stub(oracleConnectionPool, 'doClose').callsFake(function(req, connection) {
                expect(req.doClose).to.eql(true);
            });
            var modReq = {
                logger: logger,
                doClose: true
            };
            oracleConnectionPool.doExecuteProcMultipleRecordSets(modReq, dbConfig, query, null, function(error, response) {
                done();
            });
        });

        it('Should have connection.execute return an error', function(done) {
            executeError = 'connection.execute error';
            oracleConnectionPool.doExecuteProcMultipleRecordSets(req, dbConfig, query, null, function(error, response) {
                expect(error.message).to.eql('connection.execute error');
                done();
            });
        });

        it('Should have connection.execute return success', function(done) {
            connection.execute = function(sql, bindParams, options, callback) {
                rows = 'success';
                return callback(null, result);
            };
            oracleConnectionPool.doExecuteProcMultipleRecordSets(req, dbConfig, query, null, function(error, response) {
                expect(response).to.eql(['success', 'success']);
                done();
            });
        });
    });

    describe('getPool', function() {

        it.skip('Should return an empty object because _onShutdown is called', function(done) {
            var pool;
            sinon.stub(oracleConnectionPool, '_onShutdown').callsFake(function() {
                pool = _.cloneDeep(oracleConnectionPool._cachedPool);
            });
            oracleConnectionPool.getPool(req, dbConfig, function(error, response) {
                expect(pool).to.eql({});
                done();
            });
        });

        it('Should create a new pool even though cachedPool is not empty', function(done) {
            oracleConnectionPool.getPool(req, dbConfig, function(error, response) {
                oracleConnectionPool._cachedPool.randomkey = _.cloneDeep(oracleConnectionPool._cachedPool[mockKey]);
                oracleConnectionPool._cachedPool.randomkey.pool = {'connectionPool': 'simulated'};
            });

            oracleConnectionPool.getPool(req, dbConfig, function(error, response) {
                expect(_.has(oracleConnectionPool._cachedPool, mockKey)).to.eql(true);
                expect(response.poolAttrs.connectString).to.eql(dbConfig.connectString);
                done();
            });
        });

        it('Should change the min and max pool connection size', function(done) {
            oracleConnectionPool._cachedPool = {};
            var dbConfigUpdate = _.cloneDeep(dbConfig);
            dbConfigUpdate.poolMin = 10;
            dbConfigUpdate.poolMax = 20;
            oracleConnectionPool.getPool(req, dbConfigUpdate, function(error, response) {
                expect(response.poolAttrs.poolMin).to.eql(10);
                expect(response.poolAttrs.poolMax).to.eql(20);
                done();
            });
        });

        it('Should return an error sent from oracledb.createPool', function(done) {
            oracleConnectionPool._cachedPool = {};
            poolError = new Error('error from createPool');
            oracleConnectionPool.getPool(req, dbConfig, function(error, response) {
                expect(_.get(error, 'message')).to.eql('Error: error from createPool');
                expect(response).to.eql(null);
                done();
            });
        });

        it('Should return the _cachedPool object with our test data', function(done) {
            oracleConnectionPool._cachedPool = {};
            oracleConnectionPool.getPool(req, dbConfig, function(error, response) {
                expect(response).to.eql(oracleConnectionPool._cachedPool[mockKey]);
                done();
            });
        });

        it('Should return the cached pool from our mockKey', function(done) {
            oracleConnectionPool.getPool(req, dbConfig, function(error, response) {
                expect(response).to.eql(oracleConnectionPool._cachedPool[mockKey]);
                done();
            });
        });
    });

    describe('doClose', function() {
        it('Should close the connection and not send back a response', function() {
            oracleConnectionPool.doClose(req, connection);
        });

        it('Should return an error and try to log it', function() {
            connection.close = function(callback) {
                return callback(new Error('Close error'));
            };

            oracleConnectionPool.doClose(req, connection);
            var lastError = logger.error.getCall(logger.error.callCount - 1).args;
            expect(lastError[0]).to.eql('Error: Close error');
        });
    });

    describe.skip('_onShutdown', function() { //moved out of this file
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
        it('Should log the error and delete the key from the cachedPool', function(done) {
            oracleConnectionPool._cachedPool[mockKey].close = function(callback) {
                return callback('ORA-0000 Fake Oracle Error message');
            };

            var fakeSafeLog = sinon.spy();

            oracleConnectionPool._closePool(function(err, res) {
                expect(oracleConnectionPool._cachedPool).to.be.empty();
                expect(fakeSafeLog.calledOnce).to.be.true();
                done();
            }, fakeSafeLog);
        });

        it('Should close all the connections and cachedPool should be empty', function(done) {
            oracleConnectionPool._cachedPool = {};
            oracleConnectionPool.getPool(req, dbConfig, function(error, response) {
                oracleConnectionPool._closePool(function(err, res){});
                expect(oracleConnectionPool._cachedPool).to.eql({});
                done();
            });
        });
    });

    function stubOracle() {
        poolError = null;
        connectionError = null;
        executeError = null;
        getRowsError = null;

        rows = [];
        var recordset = {
            getRows: function (maxRowsParam, callback) {
                callback(getRowsError, rows);
            },
            close: function (callback) {
                callback();
            }
        };
        result = {
            rows: 1,
            outBinds: {
                recordset: recordset,
                recordset2: recordset
            },
            close: function (callback) {
                callback();
            }
        };
        connection = {
            execute: function (query, parameters, options, callback) {
                result.rows = rows;
                callback(executeError, result);
            },
            close: function (callback) {
                callback();
            }
        };
        pool = {
            _logStats: function () { },
            getConnection: function (callback) {
                callback(connectionError, connection);
            },
            close: function (callback) {
                callback();
            }
        };

        var fakeCreatePool = function (config, callback) {
            setImmediate(function () {
                pool.poolAttrs = config;
                callback(poolError, pool);
            });
        };
        if (oracledb.createPool) {
            sinon.stub(oracledb, 'createPool').callsFake(fakeCreatePool);
        } else {
            oracledb.createPool = fakeCreatePool;
        }
    }
});
