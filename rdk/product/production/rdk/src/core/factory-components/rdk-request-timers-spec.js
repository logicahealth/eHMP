'use strict';
var bunyan = require('bunyan');
var RdkRequestTimers = require('./rdk-request-timers');

describe('RDK Request Timers', function () {
    var logger;
    var timers;
    var info;
    beforeEach(function () {
        logger = bunyan.createLogger({
            name: 'rdk-request-timers',
            level: 'info'
        });
        info = sinon.stub(logger, 'info');
        timers = new RdkRequestTimers(logger);
    });
    afterEach(function () {
        info.restore();
        timers = undefined;
    });
    describe('has a constructor that', function () {
        describe('returns the new rdkRequestTimers instance and', function () {
            it('accepts a logger to be used', function () {
                var timers = new RdkRequestTimers(logger);
                expect(timers).to.be.instanceOf(RdkRequestTimers);
                expect(timers).to.own('logger', logger);
            });
            it('creates a list', function () {
                var timers = new RdkRequestTimers(logger);
                expect(timers).to.be.instanceOf(RdkRequestTimers);
                expect(timers).to.have.property('list');
                expect(timers.list).to.be.empty();
            });
        });
    });

    describe('has a start method that', function () {
        describe('returns false if', function () {
            it('no timer name is given', function () {
                var timer = timers.start();
                expect(timer).to.be.false();
            });
            it('logger level is not appropriate', function () {
                logger = sinon.stub(bunyan.createLogger({
                    name: 'no-level-request-timer',
                    level: 'warn'
                }));
                var badTimers = new RdkRequestTimers(logger);
                var timer = badTimers.start('new-warn-timer');
                expect(timer).to.be.false();

            });
        });
        describe('returns the new timer when it', function () {
            it('creates and starts a timer', function () {
                var timer = timers.start('fake_timer_create_start');
                expect(timer).to.have.property('name', 'fake_timer_create_start');
                expect(timer).to.have.property('logged', false);
                expect(timer).to.have.property('beginning');
            });
            it('accepts a roundTo parameter', function () {
                var params = {
                    roundTo: 5
                };
                var timer = timers.start('fake_timer_roundTo', params);
                expect(timer).to.have.property('name', 'fake_timer_roundTo');
                expect(timer).to.have.property('roundTo', 5);
            });
            it('accepts a format parameter', function () {
                var params = {
                    format: true
                };
                var timer = timers.start('fake_timer_format', params);
                expect(timer).to.have.property('name', 'fake_timer_format');
                expect(timer).to.have.property('format', true);
            });
            it('accepts a log.start parameter', function () {
                var params = {
                    log: {
                        start: true
                    }
                };
                var timer = timers.start('fake_timer_log_start', params);
                expect(timer).to.have.property('name', 'fake_timer_log_start');
                expect(logger.info.called).to.be.true();
            });
        });
    });

    describe('has a stop method that', function () {
        describe('returns false if', function () {
            it('no timer name is given', function () {
                var timer = timers.stop();
                expect(timer).to.be.false();
            });
            it('no timer was found for the name', function () {
                var timer = timers.stop('non_existant_timer');
                expect(timer).to.be.false();
            });
            it('the timer was already logged', function () {
                var initialTimer = timers.start('new_logged_timer');
                initialTimer.log(logger);
                expect(logger.info.called).to.be.true();
                var afterLogged = timers.stop('new_logged_timer');
                expect(afterLogged).to.be.false();
            });
        });
        describe('returns the stopped timer when it', function () {
            it('stops and logs a timer', function () {
                var timer = timers.start('fake_timer_stop_log');
                expect(timer).to.have.property('logged', false);
                timer = timers.stop('fake_timer_stop_log');
                expect(timer).to.have.property('name', 'fake_timer_stop_log');
                expect(timer).to.have.property('logged', true);
                expect(timer).to.have.property('beginning');
                expect(timer).to.have.property('end');
                expect(timer).to.have.property('elapsedMilliseconds');
            });
            it('accepts a format parameter', function () {
                var params = {
                    format: true
                };
                timers.start('fake_timer_format');
                var timer = timers.stop('fake_timer_format', params);
                expect(timer).to.have.property('name', 'fake_timer_format');
                expect(timer.format).to.be.true();
                expect(timer.beginning).to.be.a.number();
                expect(timer.end).to.be.a.number();
                expect(timer.elapsedMilliseconds).to.be.a.number();
                expect(logger.info.getCall(0).args[0].start, 'loggedObject.start is a formatted moment utc time').to.be.truthy();
                expect(logger.info.getCall(0).args[0].stop, 'loggedObject.stop is a formatted moment utc time').to.be.truthy();
            });
            it('accepts a log.stop parameter', function () {
                var params = {
                    log: {
                        stop: true
                    }
                };
                timers.start('fake_timer_log_stop');
                var timer = timers.stop('fake_timer_log_stop', params);
                expect(timer).to.have.property('name', 'fake_timer_log_stop');
                expect(logger.info.called).to.be.true();
            });
        });
    });
});
