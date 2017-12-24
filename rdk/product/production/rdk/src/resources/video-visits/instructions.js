'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var httpUtil = rdk.utils.http;
var videoVisitUtils = require('./utils');

module.exports.getInstructions = function(req, res) {
    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'GET_INSTRUCTIONS';

    var config = _.extend({}, req.app.config.videoVisit.vvService, {
        logger: req.logger,
        json: true,
        url: '/public/instructions',
        body: req.body
    });

    var cb = function(err, response, returnedData) {
        return videoVisitUtils.buildResponse(req, res, err, response, returnedData);
    };

    httpUtil.get(config, cb);
};
