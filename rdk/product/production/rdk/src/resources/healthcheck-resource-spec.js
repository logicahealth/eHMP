'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var rdk = require('../core/rdk');

var logger = sinon.stub(bunyan.createLogger({
    name: 'test-healthcheck-resource'
}));

describe('Healthcheck resource', function () {
    afterEach(function () {
        _.each(rdk.health._healthCheckRegistry, function (value, key) {
            delete rdk.health._healthCheckRegistry[key];
            delete rdk.health._resultRegistry[key];
        });
    });

    describe('Healthcheck registration', function () {
        it('registers a resource', function () {
            var config = {
                title: 'test-resource',
                healthcheck: {}
            };

            rdk.health.registerResource(config, logger);

            expectRegistered('test-resource', 'resource');
        });

        it('registers a subsystem', function () {
            var config = {
                healthcheck: {}
            };

            rdk.health.registerSubsystem(config, 'test-subsystem', logger);

            expectRegistered('test-subsystem', 'subsystem');
        });

        it('won\'t register an item with no healthcheck or subsystems', function () {
            var config = {};

            rdk.health.registerSubsystem(config, 'no-healthcheck', logger);

            expect(rdk.health._healthCheckRegistry['no-healthcheck']).to.be.undefined();
            expect(rdk.health._resultRegistry['no-healthcheck']).to.be.undefined();
        });

        it('registers subsystem dependencies when present', function () {
            var config = {
                subsystems: ['subsystem-1', 'subsystem-2']
            };

            rdk.health.registerSubsystem(config, 'test-subsystems', logger);

            expectRegistered('test-subsystems', 'subsystem');
            expect(rdk.health._healthCheckRegistry['test-subsystems'].subsystems).to.eql(config.subsystems);
            expect(rdk.health._resultRegistry['test-subsystems'].subsystems).to.eql({ 'subsystem-1': false, 'subsystem-2': false });
        });


        function expectRegistered(name, type) {
            var registered = rdk.health._healthCheckRegistry[name];
            expect(registered).to.not.be.undefined();
            expect(registered.name).to.be(name);
            expect(registered.type).to.be(type);

            var registeredCheck = rdk.health._resultRegistry[name];
            expect(registeredCheck).not.to.be.undefined();
            expect(registeredCheck.type).to.be(type);
            expect(registeredCheck.healthy).to.be(true);
        }
    });

    describe('Checking health', function () {
        afterEach(function () {
            _.each(rdk.health._healthCheckRegistry, function (value, key) {
                delete rdk.health._healthCheckRegistry[key];
                delete rdk.health._resultRegistry[key];
            });
        });

        it('should get results for health checks', function (done) {
            registerCheck('test-check', function (callback) { setImmediate(callback.bind(null, true)); });

            expect(rdk.health._resultRegistry['test-check'].healthy).to.be(false);
            expect(rdk.health._resultRegistry['test-check'].startedAt).to.not.be.undefined();

            rdk.health.executeAll(logger, function (healthy) {
                expect(healthy).to.be(true);
                expect(rdk.health._resultRegistry['test-check'].healthy).to.be(true);
                done();
            });
        });

        it('should get results for non-asynchronous checks', function (done) {
            var healthy = true;
            registerCheck('test-check', function (callback) {
                healthy = !healthy;
                callback(healthy);
            });

            expect(rdk.health._resultRegistry['test-check'].healthy).to.be(false);

            rdk.health.executeAll(logger, function (healthy) {
                expect(healthy).to.be(true);
                expect(rdk.health._resultRegistry['test-check'].healthy).to.be(true);
                done();
            });
        });

        it('should get results for health check dependencies', function (done) {
            registerCheck('subsystem 1', function (callback) { setImmediate(callback.bind(null, true)); });
            registerCheck('subsystem 2', function (callback) { setImmediate(callback.bind(null, false)); });
            registerCheck('subsystem master', undefined, undefined, ['subsystem 1', 'subsystem 2']);

            expect(rdk.health._resultRegistry['subsystem master'].healthy).to.be(true);

            rdk.health.executeAll(logger, function (healthy) {
                expect(healthy).to.be(false);
                expect(rdk.health._resultRegistry['subsystem 1'].healthy).to.be(true);
                expect(rdk.health._resultRegistry['subsystem 2'].healthy).to.be(false);
                expect(rdk.health._resultRegistry['subsystem master'].healthy).to.be(false);
                done();
            });
        });

        it('should stop waiting for long checks', function (done) {
            registerCheck('long-check', function (callback) { setTimeout(callback.bind(null, true), 10); });

            expect(rdk.health._resultRegistry['long-check'].healthy).to.be(false);
            expect(rdk.health._resultRegistry['long-check'].startedAt).to.not.be.undefined();

            rdk.health.executeAll(logger, function (healthy) {
                expect(healthy).to.be(false);
                expect(rdk.health._resultRegistry['long-check'].healthy).to.be(false);
                expect(rdk.health._resultRegistry['long-check'].startedAt).to.not.be.undefined();
                done();
            }, 1);
        });

        it('should update results of long checks asynchronously', function (done) {
            registerCheck('long-check', function (callback) { setTimeout(callback.bind(null, true), 10); });

            expect(rdk.health._resultRegistry['long-check'].healthy).to.be(false);
            expect(rdk.health._resultRegistry['long-check'].startedAt).to.not.be.undefined();

            rdk.health.executeAll(logger, function (healthy) {
                expect(healthy).to.be(false);
                expect(rdk.health._resultRegistry['long-check'].healthy).to.be(false);
                expect(rdk.health._resultRegistry['long-check'].startedAt).to.not.be.undefined();
                expect(rdk.health._resultRegistry['long-check'].millisTaken).to.be.undefined();
            }, 1);

            setTimeout(function () {
                expect(rdk.health._resultRegistry['long-check'].healthy).to.be(true);
                expect(rdk.health._resultRegistry['long-check'].millisTaken).to.be.gte(5);
                done();
            }, 20);
        });

        it('should poll when configured with an interval', function (done) {
            var healthy = false;
            registerCheck('interval-check', function (callback) {
                if (!healthy) {
                    setImmediate(callback.bind(null, false));
                    healthy = true;
                } else {
                    setImmediate(callback.bind(null, true));
                }
            }, 10);

            expect(rdk.health._resultRegistry['interval-check'].healthy).to.be(false);
            expect(rdk.health._resultRegistry['interval-check'].startedAt).to.not.be.undefined();

            rdk.health.executeAll(logger, function (healthy) {
                expect(healthy).to.be(false);
                expect(rdk.health._resultRegistry['interval-check'].healthy).to.be(false);
            }, 1);

            setTimeout(function () {
                rdk.health.executeAll(logger, function (healthy) {
                    expect(healthy).to.be(true);
                    expect(rdk.health._resultRegistry['interval-check'].healthy).to.be(true);
                    done();
                });
            }, 15);
        });


        function registerCheck(name, check, interval, subsystems) {
            var config = {
                healthcheck: {
                    interval: interval,
                    check: check
                },
                subsystems: subsystems
            };
            rdk.health.registerSubsystem(config, name, logger);
        }
    });

});
