'use strict';

/**
 * @external Logger Bunyan logger
 */

/**
 * VxSyncMetricsShim enables a Bunyan logger to behave like a VxSync Metrics instance.
 */
class VxSyncMetricsShim {
    /**
     * @param {Logger} bunyanLogger
     */
    constructor(bunyanLogger) {
        this.logger = bunyanLogger;
    }
    fatal(message, object) {
        this.logger.fatal({vxSyncMetrics: object}, message);
    }
    error(message, object) {
        this.logger.error({vxSyncMetrics: object}, message);
    }
    warn(message, object) {
        this.logger.warn({vxSyncMetrics: object}, message);
    }
    info(message, object) {
        this.logger.info({vxSyncMetrics: object}, message);
    }
    debug(message, object) {
        this.logger.debug({vxSyncMetrics: object}, message);
    }
    trace(message, object) {
        this.logger.trace({vxSyncMetrics: object}, message);
    }
}

// export default VxSyncMetricsShim;  // eslint: parsing import and export may only appear with 'sourceType: module'
module.exports = VxSyncMetricsShim;


