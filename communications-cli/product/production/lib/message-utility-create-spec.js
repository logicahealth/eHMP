'use strict';

var createMessage = require('./message-utility-create.js');
var oracledb = require('oracledb');
var fs = require('fs');

describe('Creates Messages', function() {
    describe('Validates parameters', function(){
        it('should return false if params are null, empty, undefined', function(){
             createMessage._isValidParams().must.be.false();
             createMessage._isValidParams('', '', '', '').must.be.false();
             createMessage._isValidParams(null, null, null, null).must.be.false();
             createMessage._isValidParams(undefined).must.be.false();
             createMessage._isValidParams('category', 'content', 'title', 'sender').must.be.true();
        });
    });

    describe('Truncates Major-Minor-build versions to be major-minor', function(){
        it('should return empty string if paramter is empty, null, or undefined', function(){
            createMessage._truncateAppVersion().must.be.empty();
            createMessage._truncateAppVersion(null).must.be.empty();
            createMessage._truncateAppVersion(undefined).must.be.empty();
        });

        it('should return 2.12 if 2.12.3 is supplied', function(){
            var response = createMessage._truncateAppVersion('2.12.3');
            response.must.not.be.empty();
            response.must.equal('2.12');
        });
    });

    describe('Parses and Serializes JSON', function(){
        it('should return result if JSON is valid', function(){
            createMessage._validateAndSerializeContentData('{"foo": "bar"}', function(error, result){
                expect(error).be.null();
                expect(result).not.be.null();
            });
        });

        it('should return error if JSON is not valid', function(){
            createMessage._validateAndSerializeContentData('{"foo" "bar"}', function(error, result){
                expect(error).be.not.null();
                expect(error).be.include('Malformed JSON: SyntaxError: Unexpected string');
                expect(result).be.undefined();
            });
        });
    });

    describe('Validates bulk message parameters', function(){
        it('should return error message if parameters are missing', function(){
            var badMessage = '[{"content": "Test content 2","title":"Test Title 2","sender":"Developer 2","recipient":"2.12.12.1"}]';
            createMessage._validateBulkMessageParams(badMessage, function(err) {
                expect(err).to.not.be.null();
            });
        });
    });
    describe('Gets file size', function(){
        it('Should return error if file not found', function(){
            sinon.stub(fs, 'stat', function(file, callback) {
                return callback('error');
            });
            createMessage._getFileSize('doesnotexist.txt', function(err, size) {
                expect(err).to.eql('error');
            });
        });
        it('Should return a file size', function(){
            var statObject = { size: 2000000 };
            sinon.stub(fs, 'stat', function(file, callback) {
                return callback(null, statObject);
            });
            createMessage._getFileSize('file.txt', function(err, size) {
                expect(size).to.eql(2);
            });
        });
    });
    describe('Reads a file and parses json', function() {
        it('should return error if file doesnt exist', function() {
            sinon.stub(fs, 'readFile', function(file, callback) {
                return callback('error');
            });
            createMessage._readMessagesFile('nonexistent.json', function(error, result) {
                expect(error).to.eql('error');
            });
        });
        it('should return error if json is malformed', function() {
            var badJson = '[{ "foo" "bar" }]';
            sinon.stub(fs, 'readFile', function(file, callback) {
                return callback(null, badJson);
            });
            createMessage._readMessagesFile('nonexistent.json', function(error, result) {
                expect(error).to.include('JSON malformed: ');
            });
        });
        it('should return parsed json', function() {
            var goodJson = '[{ "foo": "bar" }]';
            sinon.stub(fs, 'readFile', function(file, callback) {
                return callback(null, goodJson);
            });
            createMessage._readMessagesFile('nonexistent.json', function(error, result) {
                expect(result).to.be.object();
            });
        });
    });


    describe('Sorts through collection and stores messages in oracle', function(){
        it('should return error if message creation fails', function(){
            var conn;
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            conn.execute = function(sql, bindParams, callback) {
                return callback('error');
            };

            var messages = '[{ "title":"test", "sender": "test", "category": "test", "content": "test" }]';
            createMessage._bulkImportMessages(conn, messages, function(err, result) {
                expect(err).to.eql('error');
            });
        });
        it('should return an array of message identifiers', function(){
            var conn;
            var resultSet = { outBinds: { id: '12345' } };
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            conn.execute = function(sql, bindParams, callback) {
                return callback(null, resultSet);
            };

            var messagesObj = [{ title:'test', sender: 'test', category: 'test', content: 'test', recipient: '2.12.13' }];
            createMessage._bulkImportMessages(conn, messagesObj, function(err, result) {
                expect(result).to.be.array();
            });
        });
    });

    describe('It stores an attachment', function () {
        it('returns an error if connection fails', function () {
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback('Error');
            });
            createMessage._insertAttachmentOracle('identifer1', function(err, result) {
                console.log(err);
            });
        });
        it('returns an error if execute fails', function () {
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
            createMessage._insertAttachmentOracle('identifer1', function(err, result) {
                expect(log.calledWith('Error')).to.be.true();
            });
        });
        it('return error if attachment_data is empty', function () {
            var conn;
            var resultObj = { outBinds: { attachment_data: [] }, rowsAffected: 0 };
            var log = sinon.spy(console, 'log');
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback(null, conn);
            });
            conn.execute = function(sql, bindParams, options, callback) {
                return callback(null, resultObj);
            };
            createMessage._insertAttachmentOracle('identifer1', function(err, result) {
                expect(log.calledWith('Error getting a LOB object')).to.be.true();
            });
        });
    });

    describe('Oracle Connections', function() {
        it('should return a connection', function() {
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback(null, 'success');
            });
            createMessage._createOracleConnection(function(err, response) {
                expect(response).to.eql('success');
            });
        });

        it('should return an error if the connection cannot be opened', function() {
            sinon.stub(oracledb, 'getConnection', function(oracleConfig, callback) {
                return callback('Error');
            });
            createMessage._createOracleConnection(function(err, response) {
                expect(err).to.eql('Error');
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
            createMessage._doRelease(conn);
            expect(log.calledWith('Error')).to.be.true();
        });

        it('should commit transactions', function() {
            var conn;
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            conn.commit = function(callback) {
                return callback(null);
            };
            createMessage._commitOracleTransactions(conn, function(err) {
                expect(err).to.be.undefined();
            });
        });
        it('should return error if cant commit transactions', function() {
            var conn;
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            conn.commit = function(callback) {
                return callback('error');
            };
            createMessage._commitOracleTransactions(conn, function(err) {
                expect(err).to.eql('error');
            });
        });
        it('should return error if cant execute on the connection', function() {
            var conn;
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            conn.execute = function(sql, bindParams, callback) {
                return callback('error');
            };
            createMessage._createMessages(conn, function(err, response) {
                expect(err).to.eql('error');
            });
        });
        it('should return an id if executed successfully', function() {
            var conn;
            var resultSet = { outBinds: { id: '12345' } };
            oracledb.getConnection({}, function(error, connection) {
                conn = connection;
            });
            conn.execute = function(sql, bindParams, callback) {
                return callback(null, resultSet);
            };
            createMessage._createMessages(conn, function(err, result) {
                expect(result).to.eql('12345');
            });
        });

    });
});
