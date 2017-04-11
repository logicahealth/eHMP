'use strict';

var _ = require('underscore');

// var logger = require(global.VX_DUMMIES + 'dummy-logger');

var logger = require('bunyan').createLogger({
	name: 'test:VistaJS-authenticate',
	level: 'fatal'
});

var wConfig = require('./config');
var authenticate = require('../../src/RpcClient').RpcClient.authenticate;

var config = _.defaults(wConfig.vistaSites['9E7A'], {
	host: '10.2.2.101',
	port: 9210,
	accessCode: 'ep1234',
	verifyCode: 'ep1234!!',
	context: 'HMP SYNCHRONIZATION CONTEXT',
	localIP: '127.0.0.1',
	localAddress: 'localhost',
	connectTimeout: 1000,
	sendTimeout: 5000
});

describe('verify RpcClient.authenticate() against Panorama', function() {
	describe('verify correct config info yields good result', function() {
		it('verified', function() {
			var testError;
			var testResult;
			var called = false;

			var expectedError = null;
			var expectedResult = {
				accessCode: 'ep1234',
				verifyCode: 'ep1234!!',
				duz: jasmine.any(String),
				greeting: jasmine.any(String)
			};

			function callback(error, result) {
				called = true;
				testError = error;
				testResult = result;
			}

			authenticate(logger, config, callback);

			waitsFor(function() {
				return called;
			}, 'should be called', 5000);

			runs(function() {
				expect(testError).toEqual(expectedError);
				expect(testResult).toEqual(expectedResult);
			});
		});
	});

	describe('verify incorrect config info yields error result', function() {
		it('verified', function() {
			var testError;
			var testResult;
			var called = false;

			function callback(error, result) {
				called = true;
				testError = error;
				testResult = result;
			}

			var conf = _.clone(config);
			conf.port = 666;
			authenticate(logger, conf, callback);

			waitsFor(function() {
				return called;
			}, 'should be called', 10000);

			runs(function() {
				expect(testError).not.toBeNull();
			});
		});
	});

    describe('verify invalid verify code yields error', function() {
        it('verified', function() {
            var testError;
            var called = false;

            var expectedError = 'Not a valid ACCESS CODE/VERIFY CODE pair.';

            function callback(error, result) {
                called = true;
                testError = error;
            }

            config.verifyCode="dfssd";

            authenticate(logger, config, callback);

            waitsFor(function() {
                return called;
            }, 'should be called', 5000);

            runs(function() {
                expect(testError).toEqual(expectedError);
            });
        });
    });

});