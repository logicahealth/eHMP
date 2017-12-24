'use strict';

// const _ = require('lodash');
const logger = require('../dummies/dummy-logger');

// const logger = require('bunyan').createLogger({
//     name: 'jds-client',
//     level: 'debug'
// });

const VxSyncMetricsShim = require('../../src/vx-sync-metrics-shim');

describe('vx-sync-metrics-shim', function() {
    it('sets the logger member', function() {
        const metrics = new VxSyncMetricsShim(logger);
        expect(metrics.logger).toEqual(logger);
    });

    it('wraps Bunyan logger methods', function() {
        spyOn(logger, 'fatal');
        spyOn(logger, 'error');
        spyOn(logger, 'warn');
        spyOn(logger, 'info');
        spyOn(logger, 'debug');
        spyOn(logger, 'trace');

        const metrics = new VxSyncMetricsShim(logger);

        metrics.fatal('fatal', {fatal: true});
        metrics.error('error', {error: true});
        metrics.warn('warn', {warn: true});
        metrics.info('info', {info: true});
        metrics.debug('debug', {debug: true});
        metrics.trace('trace', {trace: true});

        expect(logger.fatal).toHaveBeenCalledWith(jasmine.objectContaining({vxSyncMetrics: {fatal: true}}), 'fatal');
        expect(logger.error).toHaveBeenCalledWith(jasmine.objectContaining({vxSyncMetrics: {error: true}}), 'error');
        expect(logger.warn).toHaveBeenCalledWith(jasmine.objectContaining({vxSyncMetrics: {warn: true}}), 'warn');
        expect(logger.info).toHaveBeenCalledWith(jasmine.objectContaining({vxSyncMetrics: {info: true}}), 'info');
        expect(logger.debug).toHaveBeenCalledWith(jasmine.objectContaining({vxSyncMetrics: {debug: true}}), 'debug');
        expect(logger.trace).toHaveBeenCalledWith(jasmine.objectContaining({vxSyncMetrics: {trace: true}}), 'trace');
    });
});
