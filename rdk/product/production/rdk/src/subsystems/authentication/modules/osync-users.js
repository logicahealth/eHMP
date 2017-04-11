'use strict';
var _ = require('lodash');
var moment = require('moment');
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;

var RdkTimer = rdk.utils.RdkTimer;
var RdkError = rdk.utils.RdkError;

var saveOsyncUsers = function(req, res, saveUserJDSCallback, params) {
    var logger = req.logger;
    var expires = _.get(req, 'session.expires');
    var data = params.data;
    var site = _.get(data, 'site');
    var duz = _.get(data, ['duz', site], 'unknown');
    var uid = _.get(data, uid, 'urn:va:user:' + site + ':' + duz);

    //save current active user in PJDS
    var timer = new RdkTimer({
        'name': 'jdsSaveActiveOsyncUserListTimer',
        'start': true
    });

    var callback = function(err, data) {
        timer.log(logger, {
            'stop': true
        });
        return saveUserJDSCallback(err, data);
    };

    if (duz === 'unknown' || _.isEmpty(site)) {
        var errorObj = new RdkError({
            'error': 'No user duz for site found in duz object',
            'code': 'pjds.500.1001',
            'logger': logger
        });
        // don't bother trying to make the call but continue
        // without error after logging the issue
        return callback(null, data);
    }

    var user = {uid: uid, site: site, id: duz, lastSuccessfulLogin: moment(expires).format('YYYYMMDDHHmmss')};

    logger.debug(user, 'Saving active user to PJDS.');

    setOsyncActiveUserList(req, res, user, function(err, result) {
        if (err) {
            // just log the error we aren't going to require
            // the save to osync for a successful login
            var errorObj = new RdkError({
                'error': err,
                'code': 'pjds.500.1004',
                'logger': logger
            });
        }
        callback(null, data);
    });
};

var setOsyncActiveUserList = function(req, res, osyncUser, callback) {
    var pjdsOptions = {
        store: 'activeusr',
        data: osyncUser,
        key: osyncUser.uid
    };
    pjds.post(req, res, pjdsOptions, callback);
};

module.exports.saveOsyncUsers = saveOsyncUsers;
