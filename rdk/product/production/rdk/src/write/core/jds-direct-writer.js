'use strict';

var httpUtil = require('../../core/rdk').utils.http;
var async = require('async');
var _ = require('lodash');

module.exports = function(writebackContext, vxSyncResponse, callback) {
    var logger = writebackContext.logger;
    logger.debug('jds-direct-writer');
    var vprModel = writebackContext.vprModel;
    if (!vprModel) {
        writebackContext.logger.warn('No VPR model defined, skipping VX-Sync writeback call');
        return setImmediate(callback);
    }

    var vprModels = [].concat(vprModel);

    var appConfig = writebackContext.appConfig;
    var requestConfig = {
        logger: writebackContext.logger,
        baseUrl: appConfig.vxSyncWritebackServer.baseUrl,
        url: '/writeback'
    };
    logger.info('Calling the VX-Sync writeback endpoint');
    async.each(vprModels, function(vprModel, callback) {
        logger.debug({jdsDirectWriterVprModel: vprModel});
        var options = _.extend({}, requestConfig, {body: vprModel});
        httpUtil.post(options, function(err, response, body) {
            if (err) {
                // We don't need to return an error if this fails
                logger.warn({jdsDirectWriterResponseError: err}, 'Error calling the VX-Sync writeback endpoint');
                vxSyncResponse.message = 'Error calling the VX-Sync writeback endpoint';
            }
            logger.debug({jdsDirectWriterResponse: body});
            return callback();
        });
    }, function(err) {
        return setImmediate(callback, err);
    });
};
