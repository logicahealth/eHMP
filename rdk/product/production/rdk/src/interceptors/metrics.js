'use strict';

var metrics = require('../utils/metrics/metrics');
var _ = require('lodash');

module.exports = function(req, res, next) {
    var logger = req.logger;
    logger.info('metrics invoked');

    var metricData = metrics.handleIncomingStart(req, logger);

    function onFinish() {
        var dataItems = _.get(res, 'data.items');
        if(dataItems){
            metricData.numRecords = _.size(dataItems);
        }
        metrics.handleFinish(metricData, logger);
    }

    function onClose() {
        logger.info('METRICS: CALL CLOSED: ' + new Date().getTime());
    }

    res.on('finish', onFinish);
    res.on('close', onClose);

    next();
};
