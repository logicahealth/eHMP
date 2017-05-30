'use strict';

var updateUtility = require('./message-utility-update-user');
var oracledb = require('oracledb');
var configHelper = require('./oracle-config-helper.js');

describe('Updates user preferences', function() {
    it('should return error if enabled does not equal true or false', function() {
        var argv = {
            enabled: 'foo'
        };
        var log = sinon.spy(console, 'log');
        updateUtility.updateUserPreferences(argv);
        expect(log.calledWith('Enabled must be set to True or False')).to.be.true();
    });

    it('should return no record', function() {
        var resultSet = {
            outBinds: {
                output: 0
            }
        };
        var argv = {
            cat: 'category1',
            enabled: 'true',
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
        updateUtility.updateUserPreferences(argv);
        expect(log.calledWith('Record not found')).to.be.true();
    });
    it('should return error if connection fails', function() {
        var argv = {
            cat: 'category1',
            enabled: 'false',
            userid: 'sampleUser',
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
        updateUtility.updateUserPreferences(argv);
        expect(log.calledWith('Error')).to.be.true();
    });
    it('should return error if execute fails', function() {
        var argv = {
            cat: 'category1',
            enabled: 'false',
            userid: 'sampleUser',
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
            return callback('Error');
        };
        conn.close = function(callback) {
            return callback(null);
        };
        updateUtility.updateUserPreferences(argv);
        expect(log.calledWith('Error')).to.be.true();
    });
    it('should return preferences updated', function() {
        var resultSet = {
            outBinds: {
                output: 4
            }
        };
        var argv = {
            cat: 'category1',
            enabled: 'false',
            userid: 'sampleUser',
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
        updateUtility.updateUserPreferences(argv);
        expect(log.calledWith('Preferences updated: 4')).to.be.true();
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
        updateUtility._doRelease(conn);
        expect(log.calledWith('Error')).to.be.true();
    });
    // Tests that use config file
    describe('updates preferences using connection config file', function() {
        it('should return error if getOracleConfig fails', function() {
            var argv = {
                cat: 'category1',
                enabled: 'false',
                userid: 'sampleUser'
            };

            sinon.stub(configHelper, 'getOracleConfig', function(config, conObj, callback) {
                return callback('Error');
            });
            var log = sinon.spy(console, 'log');
            updateUtility.updateUserPreferences(argv);
            expect(log.calledWith('Error')).to.be.true();
        });
        it('should return Preferences updated', function() {
            var argv = {
                cat: 'category1',
                enabled: 'false',
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
            updateUtility.updateUserPreferences(argv);
            expect(log.calledWith('Preferences updated: 4')).to.be.true();
        });
        it('should return error from updatePreferencesOracle method', function() {
            var argv = {
                cat: 'category1',
                enabled: 'false',
                userid: 'sampleUser'
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

            updateUtility.updateUserPreferences(argv);
            expect(log.calledWith('Error')).to.be.true();
        });
    });

});
