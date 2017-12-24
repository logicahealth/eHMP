'use strict';
var _ = require('lodash');
var _s = require('underscore.string');
var rdk = require('../../../core/rdk');
var httpUtil = rdk.utils.http;
var RdkTimer = rdk.utils.RdkTimer;
var RdkError = rdk.utils.RdkError;

var JDS_HTTP_FETCH_TIMEOUT_MILLS = 5000;

/**
 * Call jds for operational data related to the user to help determine some eHMP policies
 * @param {Object} req - typical default Express request object
 * @param {Object} res - typical default Express response object
 * @param {Function} userInfoCB - typical callback function
 * @param {Object=} params - Optional items used to determine how the attempt will be dealt with
 * @return {Object|undefined}
 */
var jdsUserData = function(req, res, userInfoCB, params) {
    var errObj;
    var logger = req.logger;
    var site = params.site;
    var data = params.data;
    var jds = _.get(req, 'app.config.jdsServer', {});
    var duz = _.get(data, ['duz', site], '');
    var timer = new RdkTimer({
        'name': 'jdsDataTimer',
        'start': true
    });

    var callback = function(err, data) {
        timer.log(logger, {
            'stop': true
        });
        return userInfoCB(err, data);
    };
    // the username format being sent to the jds end point is site code combined with user duz
    // ex. siteCode:username

    var tempUid = 'urn:va:user:' + site + ':' + duz;
    var returnObj = {
        ssn: '',
        title: '',
        uid: tempUid,
        firstname: '',
        lastname: ''
    };

    if (_s.isBlank(duz) || _s.isBlank(site)) {
        errObj = new RdkError({
            code: 'jds.412.1001',
            logger: logger
        });
        return callback(errObj, null);
    }

    var jdsPath = '/data/'+ tempUid;

    httpUtil.get({
        timeout: JDS_HTTP_FETCH_TIMEOUT_MILLS,
        logger: logger,
        baseUrl: jds.baseUrl,
        url: jdsPath,
        json: true
    }, function(err, response, body) {
        if (err) {
            var errorObj = new RdkError({
                error: err,
                code: 'jds.401.1001',
                logger: logger
            });
            return callback(errorObj, null);
        }

        var userItem = _.result(body, 'data.items[0]', {});
        var name = _.result(userItem, 'name', '').split(',');

        returnObj.ssn = _.result(userItem, 'ssn', '').toString();
        returnObj.title = _.result(userItem, 'specialty') || 'Clinician';
        returnObj.firstname = name[1] || '';
        returnObj.lastname = name[0] || '';
        returnObj.uid = _.result(userItem, 'uid', tempUid);
        logger.trace(returnObj, 'JDS user info return obj');

        if (_.isEmpty(returnObj.ssn) || _.isEmpty(name)) {
            logger.warn('JDS user info is incomplete');
        }
        return callback(null, returnObj);
    });
};

module.exports = jdsUserData;
