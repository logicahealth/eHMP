'use strict';

var _ = require('underscore');

var HandlerRegistry = require('../../src/handler-registry');

var registryLogger = {
	trace: _.noop,
	debug: _.noop,
	info: _.noop,
	warn: _.noop,
	error: _.noop,
	fatal: _.noop
};

var handlerLogger = {
	trace: _.noop,
	debug: _.noop,
	info: _.noop,
	warn: _.noop,
	error: _.noop,
	fatal: _.noop
};

var registryEnvironment = {
	env: 'env'
};
var handlerEnvironment = {
	env: 'env'
};

function handlerWithVistaId(vistaId, logger, config, environment) {
	return {
		vistaId: vistaId,
		logger: logger,
		config: config,
		environment: environment
	};
}

function handlerWithoutVistaId(logger, config, environment) {
	return {
		logger: logger,
		config: config,
		environment: environment
	};
}

describe('handler-registry.js', function() {
	describe('HandlerRegistry()', function() {
		it('test constructor', function() {
			var instance = new HandlerRegistry();
			expect(instance.handlers).toEqual({});
		});
	});

	describe('register()', function() {
		var vistaId = 'C877';
		var config = {
			config: 'config'
		};

		var jobType = 'jobType';

		// function(vistaId, logger, config, environment, jobType, handler)
		it('test registration works with vistaId', function() {
			var reg = new HandlerRegistry();
			reg.register(vistaId, config, jobType, handlerWithVistaId);
			var retHandler = reg.handlers[jobType];

			expect(_.isFunction(retHandler)).toBe(true);
			if (_.isFunction(retHandler)) {
				var result = retHandler(handlerLogger, handlerEnvironment);
				expect(result).not.toBeUndefined();
				expect(result).not.toBeNull();
				expect(result.vistaId).toBe(vistaId);
				expect(result.logger).not.toBe(registryLogger);
				expect(result.logger).toBe(handlerLogger);
				expect(result.config).toBe(config);
				expect(result.environment).not.toBe(registryEnvironment);
				expect(result.environment).toBe(handlerEnvironment);
			}
		});

		// function(logger, config, environment, jobType, handler)
		it('test registration works without vistaId', function() {
			var reg = new HandlerRegistry();
			reg.register(config, jobType, handlerWithoutVistaId);
			var retHandler = reg.handlers[jobType];

			expect(_.isFunction(retHandler)).toBe(true);
			if (_.isFunction(retHandler)) {
				var result = retHandler(handlerLogger, handlerEnvironment);
				expect(result).not.toBeUndefined();
				expect(result).not.toBeNull();
				expect(result.vistaId).toBeUndefined();
				expect(result.logger).not.toBe(registryLogger);
				expect(result.logger).toBe(handlerLogger);
				expect(result.config).toBe(config);
				expect(result.environment).not.toBe(registryEnvironment);
				expect(result.environment).toBe(handlerEnvironment);
			}
		});
	});

	describe('get()', function() {
		var vistaId = 'C877';
		var config = {
			config: 'config'
		};
		var jobType = 'jobType';
		var job = {
			job: 'job',
			type: jobType
		};

		var reg = new HandlerRegistry();
		reg.register(vistaId, config, jobType, handlerWithVistaId);
		reg.register(vistaId, config, 'non-matching-type', handlerWithoutVistaId);

		it('test undefined returned when no job is passed', function() {
			expect(reg.get()).toBeUndefined();
			expect(reg.get(null)).toBeUndefined();
		});

		it('test undefined returned when no job type matches', function() {
			expect(reg.get({})).toBeUndefined();
			expect(reg.get({
				type: 'bogus'
			})).toBeUndefined();
		});

		it('test handler returned when job type matches', function() {
			var retHandler = reg.get(job);
			expect(_.isFunction(retHandler)).toBe(true);
			if(_.isFunction(retHandler)) {
				var result = retHandler(handlerLogger, handlerEnvironment);
				expect(result).not.toBeUndefined();
				expect(result).not.toBeNull();
				expect(result.vistaId).toBe(vistaId);
				expect(result.logger).not.toBe(registryLogger);
				expect(result.logger).toBe(handlerLogger);
				expect(result.config).toBe(config);
				expect(result.environment).not.toBe(registryEnvironment);
				expect(result.environment).toBe(handlerEnvironment);
			}
		});
	});
});