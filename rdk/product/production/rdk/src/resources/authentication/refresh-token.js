'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var userUtil = require('../user/user-whitelist');

function refreshToken(req, res) {

    if (_.isObject(req.session.user) === true) {
        req.logger.info('Token refreshed');
        //refresh the user session expiration BEFORE sending the response in order to set it on the user object
        req.session.touch();
        //set the user session expiration to be equal to the new cookie expiration
        req.session.user.expires = req.session.cookie.expires;
        res.status(rdk.httpstatus.ok).rdkSend(userUtil.sanitizeUser(req.session.user));
        return;
    }

    req.logger.warn('No session present for refresh');
    res.status(rdk.httpstatus.unauthorized).rdkSend();

}

module.exports = refreshToken;
