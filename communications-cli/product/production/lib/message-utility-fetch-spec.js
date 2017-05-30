'use strict';

var fetchUtility = require('./message-utility-fetch.js');
var oracledb = require('oracledb');
var configHelper = require('./oracle-config-helper.js');

describe('Fetches messages by category', function() {
    it('should return no messages', function() {
        var resultSet = {
            rows: []
        };
        var argv = {
            cat: 'category1',
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
        conn.execute = function(sql, bindParams, callback) {
            return callback(null, resultSet);
        };
        conn.close = function(callback) {
            return callback(null);
        };
        fetchUtility.fetchMessages(argv);
        expect(log.calledWith('No messages found for this category')).to.be.true();
    });
    it('should return json output of messages', function() {
        var resultSet = {
            rows: [
                ['id1', 'title', 'content', 'date', 'status', 'appVersion'],
                ['id1', 'title', 'content', 'date', 'status', 'appVersion']
            ]
        };
        var argv = {
            cat: 'category1',
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
        conn.execute = function(sql, bindParams, callback) {
            return callback(null, resultSet);
        };
        conn.close = function(callback) {
            return callback(null);
        };
        fetchUtility.fetchMessages(argv);
        expect(log.calledWith('[{"identifier":"id1","title":"title","content":"content","date":"date","status":"status","ehmp-app-version":"appVersion"},{"identifier":"id1","title":"title","content":"content","date":"date","status":"status","ehmp-app-version":"appVersion"}]')).to.be.true();
    });
    it('should return error if execute fails', function() {
        var argv = {
            cat: 'category1',
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
        conn.execute = function(sql, bindParams, callback) {
            return callback('Error');
        };
        conn.close = function(callback) {
            return callback(null);
        };
        fetchUtility.fetchMessages(argv);
        expect(log.calledWith('Error')).to.be.true();
    });
    it('should return error if connection fails', function() {
        var argv = {
            cat: 'category1',
            host: 'localhost'
        };
        var conn;
        var log = sinon.spy(console, 'log');
        oracledb.getConnection({}, function(error, connection) {
            conn = connection;
        });
        sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
            return callback('Error');
        });
        fetchUtility.fetchMessages(argv);
        expect(log.calledWith('Error')).to.be.true();
    });
    it('should return error if close fails', function() {
        var conn;
        var log = sinon.spy(console, 'log');
        oracledb.getConnection({}, function(error, connection) {
            conn = connection;
        });
        conn.close = function(callback) {
            return callback('Error');
        };
        fetchUtility._doRelease(conn);
        expect(log.calledWith('Error')).to.be.true();
    });
    // Tests that use config file
    describe('fetch messages using connection config file', function() {
        it('should return error if getOracleConfig fails', function() {
            var argv = {
                cat: 'category1',
            };

            sinon.stub(configHelper, 'getOracleConfig', function(config, conObj, callback) {
                return callback('Error');
            });
            var log = sinon.spy(console, 'log');
            fetchUtility.fetchMessages(argv);
            expect(log.calledWith('Error')).to.be.true();
        });
        it('should return messages', function() {
            var argv = {
                cat: 'category1',
            };
            var resultSet = { rows: [] };
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
            conn.execute = function(sql, bindParams, callback) {
                return callback(null, resultSet);
            };
            conn.close = function(callback) {
                return callback(null);
            };
            fetchUtility.fetchMessages(argv);
            expect(log.calledWith('No messages found for this category')).to.be.true();
        });
        it('should return error from connect', function() {
            var argv = {
                cat: 'category1',
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

            fetchUtility.fetchMessages(argv);
            expect(log.calledWith('Error')).to.be.true();
        });
    });
});
