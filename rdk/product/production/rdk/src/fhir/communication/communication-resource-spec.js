'use strict';

var _ = require('lodash');
var communication = require('./communication-resource');
var oracleConnectionPool = require('../../utils/oracle-connection-pool');
var oracledb = require('oracledb');


describe('Communications Resource', function() {
    var req, res;


    function createReq() {
        var dbConfig = {
            user: 'user',
            password: 'password',
            connectString: 'connectString'
        };

        req = {};
        _.set(req, 'body', {});
        _.set(req, 'param', {});
        _.set(req, 'query', {});
        _.set(req, 'session.user.uid', 'a:b:c:d');
        _.set(req, 'app.config.jbpm.communicationsDatabase', dbConfig);
        _.set(req, 'logger.debug', _.noop);
        _.set(req, 'logger.info', _.noop);
    }


    function createRes() {
        res = {};
        _.set(res, 'status', function() {
            return this;
        });
        _.set(res, 'rdkSend', function() {
            return this;
        });
    }


    function createBind(dir, type, val) {
        return {
            dir: dir,
            type: type,
            val: val
        };
    }


    beforeEach(function() {
        createReq();
        createRes();
        oracledb.STRING = 'STRING';
        oracledb.CLOB = 'CLOB';
        oracledb.NUMBER = 'NUMBER';
        oracledb.BIND_OUT = 'OUT';
        oracledb.BIND_IN = 'IN';
    });


    describe('getCommunications', function() {
        it('returns 400 when requester.userId does not match session user', function() {
            _.set(req, ['query', 'requester.userId'], 'd:c:b:a');
            sinon.spy(res, 'status');
            communication._getCommunications(req, res);
            expect(res.status.calledWith(400)).to.be.true();
        });

        it('returns 500 when it fails to get a pool from the connection pool', function() {
            sinon.stub(oracleConnectionPool, 'getPool').callsFake(function(req, dbConfig, callback) {
                callback({message: 'I forced this error'}, null);
            });

            _.set(req, ['query', 'requester.userId'], 'a:b:c:d');
            sinon.spy(res, 'status');
            communication._getCommunications(req, res);
            expect(res.status.calledWith(500)).to.be.true();
        });

        it('returns a 500 when it fails to establish a connection', function() {
            _.set(req, ['query', 'requester.userId'], 'a:b:c:d');

            var getConnection = function(callback) {
                callback({message: 'I forced this error'});
            };

            sinon.stub(oracleConnectionPool, 'getPool').callsFake(function(req, dbConfig, callback) {
                callback(null, {getConnection: getConnection});
            });

            sinon.spy(res, 'status');
            communication._getCommunications(req, res);
            expect(res.status.calledWith(500)).to.be.true();
        });

        it('generates the correct query string with minimum set of params', function(done) {
            var expected = 'BEGIN COMMUNICATION.MESSAGE_API.FETCH_MESSAGES(i_user_id => :userId, i_version => :version, i_category => :category, o_messages => :output); END;';

            _.set(req, ['query', 'requester.userId'], 'a:b:c:d');
            _.set(req, ['query', 'requester.ehmpAppVersion'], 'r2.0');
            _.set(req, ['query', 'category'], 'some category');

            var execute = function(query) {
                expect(query).to.equal(expected);
                done();
            };

            var getConnection = function(callback) {
                callback(null, {execute: execute});
            };


            sinon.stub(oracleConnectionPool, 'getPool').callsFake(function(req, dbConfig, callback) {
                callback(null, {getConnection: getConnection});
            });

            communication._getCommunications(req, res);
        });

        it('generates the correct query string with maximum set of params', function(done) {
            var expected = 'BEGIN COMMUNICATION.MESSAGE_API.FETCH_MESSAGES(i_user_id => :userId, i_version => :version, i_category => :category, i_status => :status, i_override_preferences => :override, o_messages => :output); END;';

            _.set(req, ['query', 'requester.userId'], 'a:b:c:d');
            _.set(req, ['query', 'requester.ehmpAppVersion'], 'r2.0');
            _.set(req, ['query', 'category'], 'some category');
            _.set(req, ['query', 'status'], 'some status');
            _.set(req, ['query', 'overridePreferences'], false);

            var execute = function(query) {
                expect(query).to.equal(expected);
                done();
            };

            var getConnection = function(callback) {
                callback(null, {execute: execute});
            };


            sinon.stub(oracleConnectionPool, 'getPool').callsFake(function(req, dbConfig, callback) {
                callback(null, {getConnection: getConnection});
            });

            communication._getCommunications(req, res);
        });

        it('generates the correct data binds with minimum set of params', function(done) {
            var expected = {};

            _.set(expected, 'category', createBind(oracledb.BIND_IN, oracledb.STRING, ['http://ehmp.DNS   /messageCategories']));
            _.set(expected, 'userId', createBind(oracledb.BIND_IN, oracledb.STRING, 'a:b:c:d'));
            _.set(expected, 'version', createBind(oracledb.BIND_IN, oracledb.STRING, 'version'));
            _.set(expected, 'output', {dir: oracledb.BIND_OUT, type: oracledb.CLOB});
            _.set(req, ['query', 'requester.userId'], 'a:b:c:d');
            _.set(req, ['query', 'requester.ehmpAppVersion'], 'version');
            _.set(req, ['query', 'category'], 'http://ehmp.DNS   /messageCategories');

            var execute = function(query, data) {
                expect(data).to.eql(expected);
                done();
            };

            var getConnection = function(callback) {
                callback(null, {execute: execute});
            };

            sinon.stub(oracleConnectionPool, 'getPool').callsFake(function(req, dbConfig, callback) {
                callback(null, {getConnection: getConnection});
            });

            communication._getCommunications(req, res);
        });

        it('generates the correct data binds with maximum set of params', function(done) {
            var expected = {};

            _.set(expected, 'category', createBind(oracledb.BIND_IN, oracledb.STRING, ['http://ehmp.DNS   /messageCategories']));
            _.set(expected, 'override', createBind(oracledb.BIND_IN, oracledb.STRING, 'N'));
            _.set(expected, 'status', createBind(oracledb.BIND_IN, oracledb.STRING, 'statusSystem/statusCode'));
            _.set(expected, 'userId', createBind(oracledb.BIND_IN, oracledb.STRING, 'a:b:c:d'));
            _.set(expected, 'version', createBind(oracledb.BIND_IN, oracledb.STRING, 'version'));
            _.set(expected, 'output', {dir: oracledb.BIND_OUT, type: oracledb.CLOB});

            _.set(req, ['query', 'requester.userId'], 'a:b:c:d');
            _.set(req, ['query', 'requester.ehmpAppVersion'], 'version');
            _.set(req, ['query', 'category'], 'http://ehmp.DNS   /messageCategories');
            _.set(req, ['query', 'status'], 'statusSystem/statusCode');
            _.set(req, ['query', 'overridePreferences'], false);

            var execute = function(query, data) {
                expect(data).to.eql(expected);
                done();
            };

            var getConnection = function(callback) {
                callback(null, {execute: execute});
            };

            sinon.stub(oracleConnectionPool, 'getPool').callsFake(function(req, dbConfig, callback) {
                callback(null, {getConnection: getConnection});
            });

            communication._getCommunications(req, res);
        });
    });
});
