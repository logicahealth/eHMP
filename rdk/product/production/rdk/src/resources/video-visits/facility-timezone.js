'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var httpUtil = rdk.utils.http;
var nullchecker = rdk.utils.nullchecker;
var videoVisitUtils = require('./utils');

module.exports.getFacilityTimezone = function(req, res) {
    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'GET_FACILITY_TIMEZONE';

    var facilityCode = req.param('facilityCode');
    if (nullchecker.isNullish(facilityCode)) {
        facilityCode = req.session.user.division;
    }

    var config = _.extend({}, req.app.config.videoVisit.vvService, {
        logger: req.logger,
        json: true,
        url: '/public/facility/' + facilityCode + '/timezone',
        body: req.body
    });

    var cb = function(err, response, returnedData) {
        return videoVisitUtils.buildResponse(req, res, err, response, returnedData);
    };

    httpUtil.get(config, cb);
};
