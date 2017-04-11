'use strict';

var bunyan = require('bunyan');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var logging = require('./logging-service')([]);
var sessionObj = require('./spec-session.json');

describe('The logging service', function () {
    var logger;
    var logged;

    function AccumulateStream() { }
    util.inherits(AccumulateStream, EventEmitter);
    AccumulateStream.prototype.write = function (rec) {
        logged.push(rec);
    };

    beforeEach(function () {
        logged = [];
    });

    describe('with default configuration', function () {
        before(function () {
            logger = logging.create({
                name: 'unit-test-log',
                streams: [{
                    type: 'raw',
                    stream: new AccumulateStream()
                }]
            });
        });

        it('does not log lower than the configured level', function () {
            logger.debug('Message');

            logged.must.be.empty();
        });

        it('logs an Error', function () {
            var e = new Error('Uh, oh');
            logger.error({ error: e }, 'Message');

            logged.length.must.be(1);
            logged[0].error.must.exist();
            logged[0].error.message.must.be('Uh, oh');
            logged[0].error.stack.must.be.a.string();
            logged[0].msg.must.be('Message');
        });

        it('does not log the logger', function () {
            logger.error({ logger: logger }, 'Message');

            logged.length.must.be(1);
            logged[0].logger.must.be('[logger]');
            logged[0].msg.must.be('Message');
        });

        it('logs and truncates a user', function () {
            logger.error({ user: sessionObj.session.user }, 'Message');

            logged.length.must.be(1);
            verifyTruncatedUser(logged[0].user);
        });

        it('logs and truncates a session', function () {
            logger.error({ session: sessionObj }, 'Message');

            logged.length.must.be(1);
            _.keys(logged[0].session).must.eql(['_id', 'session', 'expires']);
            _.keys(logged[0].session.session).must.eql(['cookie', 'csrf', 'jwt', 'user']);
            verifyTruncatedUser(logged[0].session.session.user);
        });

        it('logs and truncates a session within a body', function () {
            logger.error({ body: { session: sessionObj } }, 'Message');

            logged.length.must.be(1);
            verifyTruncatedUser(logged[0].body.session.session.user);
        });
    });

    describe('with trace configuration', function () {
        before(function () {
            logger = logging.create({
                name: 'unit-test-log',
                streams: [{
                    level: 'trace',
                    type: 'raw',
                    stream: new AccumulateStream()
                }]
            });
        });

        it('logs an entire user', function () {
            logger.error({ user: sessionObj.session.user }, 'Message');

            logged.length.must.be(1);
            verifyFullUser(logged[0].user);
        });
    });

    function verifyTruncatedUser(user) {
        _.keys(user).must.eql([
            'accessCode',
            'duz',
            'expires',
            'facility',
            'firstname',
            'lastname',
            'site',
            'uid',
            'username'
        ]);
    }

    function verifyFullUser(user) {
        _.keys(user).must.eql([
            'accessCode',
            'consumerType',
            'corsTabs',
            'dgRecordAccess',
            'dgSecurityOfficer',
            'dgSensitiveAccess',
            'disabled',
            'divisionSelect',
            'duz',
            'eHMPUIContext',
            'expires',
            'facility',
            'firstname',
            'infoButtonOid',
            'lastname',
            'password',
            'permissionSets',
            'permissions',
            'provider',
            'requiresReset',
            'rptTabs',
            'section',
            'sessionLength',
            'site',
            'ssn',
            'title',
            'uid',
            'username',
            'verifyCode',
            'vistaKeys',
            'vistaUserClass'
        ]);
    }
});