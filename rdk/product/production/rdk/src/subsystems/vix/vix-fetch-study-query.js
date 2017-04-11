'use strict';
var rdk = require('../../core/rdk');
var vix = require('./vix-subsystem');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;
/**
 * Calls the eVix with a POST studyquery to get  data on a study
 *
 */
module.exports.fetch = function getStudyQuery(req, bseToken, query, callback) {
    // Get the VIX HTTP configuration
    var config = vix.getVIXStudyQueryConfig(req.app.config, req.logger);

    req.logger.debug(config, 'VIX CONFIG');

    if (nullchecker.isNullish(config)) {
        return callback({err: 'vix is not configured'});
    }

    // build the header info
    var user = req.session.user;
    var fullName = user.lastname + ',' + user.firstname;
    var ssn = user.ssn;
    var siteName = user.facility;
    var siteNumber = user.site;
    var duz = _.get(user, ['duz', siteNumber]);
    var facility = req.param('facility') || req.session.user.site;

    if (nullchecker.isNullish(facility)) {
        return callback('missing required parameter: facility');
    }

    var stationNumber = req.session.user.division;

    config.headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'xxx-securityToken': bseToken.token,
        'xxx-fullname': fullName,
        'xxx-duz': duz,
        'xxx-ssn': ssn,  // TODO what is the purpose of this? (security hazard)
        'xxx-sitename': siteName,
        'xxx-sitenumber': stationNumber
    };
    config.body = query;

    return httpUtil.post(config, function(vixError, vixResponse) {
        if (vixError) {
            return callback(vixError);
        }
        return callback(null, vixResponse.body);
    });
};
