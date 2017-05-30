'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var nodemailer = require('nodemailer');
var emailSubsystem = require('./email-subsystem');

describe('email-subsystem', function () {
    var originalTransport = emailSubsystem.__transport;
    var originalEmailSubsystemEnabled = emailSubsystem.__emailSubsystemEnabled;
    afterEach(function() {
        emailSubsystem.__transport = originalTransport;
        emailSubsystem.__emailSubsystemEnabled = originalEmailSubsystemEnabled;
    });
    describe('transportOk', function() {
        it('returns true if the transport says it is a nodemailer version', function() {
            emailSubsystem.__transport = {
                _getVersionString: function() {
                    return 'nodemailer 2.x';
                }
            };
            var ok = emailSubsystem._transportOk();
            expect(ok).to.be.true();
        });
        it('returns false if the transport does not say it is a nodemailer version', function() {
            emailSubsystem.__transport = null;
            var ok = emailSubsystem._transportOk();
            expect(ok).to.be.false();
        });
    });

    describe('sendMail', function() {
        it('returns an error if the email subsystem is not enabled', function() {
            emailSubsystem.__emailSubsystemEnabled = false;
            var config = {};
            emailSubsystem.sendMail(config, function(err, info) {
                expect(err).to.be.an.error();
                expect(err).to.match(/email subsystem is not enabled/);
            });
        });
        it('returns an error if the transport is not ok', function() {
            emailSubsystem.__emailSubsystemEnabled = true;
            emailSubsystem.__transport = {};
            var config = {};
            emailSubsystem.sendMail(config, function(err, info) {
                expect(err).to.be.an.error();
                expect(err).to.match(/email subsystem transport error/);
            });
        });
        it('wraps the nodemailer transport.sendMail method', function(done) {
            emailSubsystem.__emailSubsystemEnabled = true;
            var config = {};
            emailSubsystem.__transport = {
                _getVersionString: function() {
                    return 'nodemailer 2.x';
                },
                sendMail: function(innerConfig, callback) {
                    expect(innerConfig).to.equal(config);
                    return callback(null, 'nodemailer sendmail used');
                }
            };
            emailSubsystem.sendMail(config, function(err, info) {
                expect(err).to.be.falsy();
                expect(info).to.equal('nodemailer sendmail used');
                done();
            });
        });
    });

    describe('getSubsystemConfig', function() {
        it('disables the subsystem if the email transport is not configured', function() {
            var app = {};
            var logger = sinon.stub(bunyan.createLogger({name: 'email-subsystem-spec'}));
            emailSubsystem.getSubsystemConfig(app, logger);
            expect(emailSubsystem.__emailSubsystemEnabled).to.be.false();
            expect(logger.info.calledWith('config.emailTransport is not an object; email subsystem disabled'));
        });
        it('enables the subsystem if the email transport is configured', function() {
            var app = {};
            _.set(app, 'config.emailTransport', {});

            var logger = sinon.stub(bunyan.createLogger({name: 'email-subsystem-spec'}));
            sinon.stub(nodemailer, 'createTransport').callsFake(function(config) {
                expect(config).to.equal(app.config.emailTransport);
            });
            emailSubsystem.getSubsystemConfig(app, logger);
            expect(emailSubsystem.__emailSubsystemEnabled).to.be.true();
            expect(logger.debug.calledWith('creating email subsystem transport'));
        });
        describe('healthcheck', function() {
            it('returns false when the email subsystem is disabled', function(done) {
                var app = {};
                sinon.stub(net, 'Socket').callsFake(function() {
                    expect('socket not instantiated').to.be.true();
                });
                var logger = sinon.stub(bunyan.createLogger({name: 'email-subsystem-spec'}));
                var check = emailSubsystem.getSubsystemConfig(app, logger).healthcheck.check;
                check(function(ok) {
                    expect(ok).to.be.false();
                    done();
                });
            });
            it('returns false when the email subsystem transport is not ok', function(done) {
                var app = {};
                _.set(app, 'config.emailTransport', {});
                sinon.stub(nodemailer, 'createTransport').callsFake(function() {
                    emailSubsystem.__transport = 'bad transport';
                });
                sinon.stub(net, 'Socket').callsFake(function() {
                    expect('socket not instantiated').to.be.true();
                });
                var logger = sinon.stub(bunyan.createLogger({name: 'email-subsystem-spec'}));
                var check = emailSubsystem.getSubsystemConfig(app, logger).healthcheck.check;
                check(function(ok) {
                    expect(ok).to.be.false();
                    done();
                });
            });
            it('returns false upon client error', function(done) {
                var app = {};
                _.set(app, 'config.emailTransport', {});
                var logger = sinon.stub(bunyan.createLogger({name: 'email-subsystem-spec'}));
                var emitter = new EventEmitter();
                sinon.stub(net, 'Socket').callsFake(function() {
                    return emitter;
                });
                emitter.connect = function() {
                    emitter.emit('error');
                };
                emitter.destroy = sinon.spy();
                var check = emailSubsystem.getSubsystemConfig(app, logger).healthcheck.check;
                check(function(ok) {
                    expect(emitter.destroy.called).to.be.true();
                    expect(ok).to.be.false();
                    done();
                });
            });
            it('returns false upon client close', function(done) {
                var app = {};
                _.set(app, 'config.emailTransport', {});
                var logger = sinon.stub(bunyan.createLogger({name: 'email-subsystem-spec'}));
                var emitter = new EventEmitter();
                sinon.stub(net, 'Socket').callsFake(function() {
                    return emitter;
                });
                emitter.connect = sinon.spy(function() {
                    emitter.emit('close');
                });
                emitter.destroy = sinon.spy();
                var check = emailSubsystem.getSubsystemConfig(app, logger).healthcheck.check;
                check(function(ok) {
                    expect(emitter.connect.called).to.be.true();
                    expect(emitter.destroy.called).to.be.true();
                    expect(ok).to.be.false();
                    done();
                });
            });
            it('returns false upon client timeout', function(done) {
                var app = {};
                _.set(app, 'config.emailTransport', {});
                var logger = sinon.stub(bunyan.createLogger({name: 'email-subsystem-spec'}));
                var emitter = new EventEmitter();
                sinon.stub(net, 'Socket').callsFake(function() {
                    return emitter;
                });
                emitter.connect = sinon.spy(function() {
                    emitter.emit('timeout');
                });
                emitter.destroy = sinon.spy();
                var check = emailSubsystem.getSubsystemConfig(app, logger).healthcheck.check;
                check(function(ok) {
                    expect(emitter.connect.called).to.be.true();
                    expect(emitter.destroy.called).to.be.true();
                    expect(ok).to.be.false();
                    done();
                });
            });
            it('returns false when data does not start with "220" (service ready)', function(done) {
                var app = {};
                _.set(app, 'config.emailTransport', {});
                var logger = sinon.stub(bunyan.createLogger({name: 'email-subsystem-spec'}));
                var emitter = new EventEmitter();
                sinon.stub(net, 'Socket').callsFake(function() {
                    return emitter;
                });
                emitter.connect = sinon.spy(function() {
                    emitter.emit('data', '421 service not available');
                });
                emitter.write = function(message) {
                    expect('write not called').to.be.true();
                };
                emitter.destroy = sinon.spy();
                var check = emailSubsystem.getSubsystemConfig(app, logger).healthcheck.check;
                check(function(ok) {
                    expect(emitter.connect.called).to.be.true();
                    expect(emitter.destroy.called).to.be.true();
                    expect(ok).to.be.false();
                    done();
                });
            });
            it('returns true when data does starts with "220" (service ready)', function(done) {
                var app = {};
                _.set(app, 'config.emailTransport', {});
                var logger = sinon.stub(bunyan.createLogger({name: 'email-subsystem-spec'}));
                var emitter = new EventEmitter();
                sinon.stub(net, 'Socket').callsFake(function() {
                    return emitter;
                });
                emitter.connect = sinon.spy(function() {
                    emitter.emit('data', '220');
                });
                emitter.write = sinon.spy(function(message) {
                    expect(message).to.equal('QUIT\n');
                });
                emitter.destroy = sinon.spy();
                var check = emailSubsystem.getSubsystemConfig(app, logger).healthcheck.check;
                check(function(ok) {
                    expect(emitter.connect.called).to.be.true();
                    expect(emitter.write.called).to.be.true();
                    expect(emitter.destroy.called).to.be.true();
                    expect(ok).to.be.true();
                    done();
                });
            });
        });
    });
});
