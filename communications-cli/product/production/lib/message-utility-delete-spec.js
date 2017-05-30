'use strict';

var deleteUtility = require('./message-utility-delete.js');
var oracledb = require('oracledb');
var configHelper = require('./oracle-config-helper.js');

describe('Deletes a message', function() {
    describe('Oracle Connections', function() {
        it('returns an error if record not found', function() {
            var conn;
            var resultSet = {
                outBinds: {
                    output: 0
                }
            };
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback(null, conn);
            });
            conn.execute = function(sql, bindParams, options, callback) {
                return callback(null, resultSet);
            };
            conn.close = function(callback) {
                return callback(null);
            };
            deleteUtility._deleteMessageOracleProcedure('identifer1', function(err, result) {
                expect(err).to.eql('Record not found');
            });
        });
        it('returns an error if execute fails', function() {
            var conn;
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback(null, conn);
            });
            conn.execute = function(sql, bindParams, options, callback) {
                return callback('Error');
            };
            conn.close = function(callback) {
                return callback(null);
            };
            deleteUtility._deleteMessageOracleProcedure('identifer1', function(err, result) {
                expect(err).to.eql('Error');
            });
        });
        it('returns an error if connection fails', function() {
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback('Error');
            });
            deleteUtility._deleteMessageOracleProcedure('identifer1', function(err, result) {
                expect(err).to.eql('Error');
            });
        });
        it('returns identifer if message activated', function() {
            var conn;
            var resultSet = {
                outBinds: {
                    output: 1
                }
            };
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback(null, conn);
            });
            conn.execute = function(sql, bindParams, options, callback) {
                return callback(null, resultSet);
            };
            conn.close = function(callback) {
                return callback(null);
            };
            deleteUtility._deleteMessageOracleProcedure('identifer1', function(err, result) {
                expect(result).to.eql('identifer1');
            });
        });
        it('should return an error if connection doesnt close', function() {
            var conn;
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            conn.close = function(callback) {
                return callback('Error');
            };
            var log = sinon.spy(console, 'log');
            deleteUtility._doRelease(conn);
            expect(log.calledWith('Error')).to.be.true();
        });
    });

    describe('Deletes a message', function() {
        it('Returns message deleted', function() {
            var resultSet = {
                outBinds: {
                    output: 1
                }
            };
            var argv = {
                id: 'identifer1',
                host: 'localhost'
            };
            var conn;
            var log = sinon.spy(console, 'log');
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback(null, conn);
            });
            conn.execute = function(sql, bindParams, options, callback) {
                return callback(null, resultSet);
            };
            conn.close = function(callback) {
                return callback(null);
            };
            deleteUtility.deleteMessage(argv);
            expect(log.calledWith('identifer1 deleted')).to.be.true();
        });
        it('Returns error if no record found', function() {
            var resultSet = {
                outBinds: {
                    output: 0
                }
            };
            var argv = {
                id: 'identifer1',
                host: 'localhost'
            };
            var conn;
            var log = sinon.spy(console, 'log');
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback(null, conn);
            });
            conn.execute = function(sql, bindParams, options, callback) {
                return callback(null, resultSet);
            };
            conn.close = function(callback) {
                return callback(null);
            };
            deleteUtility.deleteMessage(argv);
            expect(log.calledWith('Record not found')).to.be.true();
        });
    });
    // Tests that use config file
    describe('updates preferences using connection config file', function() {
        it('should return error if getOracleConfig fails', function() {
            var argv = {
                id: 'identifer1',
                userid: 'sampleUser'
            };

            sinon.stub(configHelper, 'getOracleConfig', function(config, conObj, callback) {
                return callback('Error');
            });
            var log = sinon.spy(console, 'log');
            deleteUtility.deleteMessage(argv);
            expect(log.calledWith('Error')).to.be.true();
        });
        it('should return identifier deleted', function() {
            var argv = {
                id: 'identifer1',
                userid: 'sampleUser'
            };
            var resultSet = {
                outBinds: {
                    output: 4
                }
            };
            sinon.stub(configHelper, 'getOracleConfig', function(config, conObj, callback) {
                return callback(null, 'connection');
            });
            var log = sinon.spy(console, 'log');
            var conn;
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback(null, conn);
            });
            conn.execute = function(sql, bindParams, options, callback) {
                return callback(null, resultSet);
            };
            conn.close = function(callback) {
                return callback(null);
            };
            deleteUtility.deleteMessage(argv);
            expect(log.calledWith('identifer1 deleted')).to.be.true();
        });
        it('should return error from method', function() {
            var argv = {
                id: 'identifer1',
            };

            sinon.stub(configHelper, 'getOracleConfig', function(config, conObj, callback) {
                return callback(null, 'connection');
            });

            var log = sinon.spy(console, 'log');
            var conn;
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });

            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback('Error');
            });

            deleteUtility.deleteMessage(argv);
            expect(log.calledWith('Error')).to.be.true();
        });
    });


});
