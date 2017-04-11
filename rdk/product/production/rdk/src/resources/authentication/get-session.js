'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var userUtil = require('../user/user-whitelist');

function getSession(req, res) {

    if (_.isObject(req.session.user) === true) {
        req.logger.info('Session Found');
        //set the csrf token just before we send back to user
        rdk.utils.jwt.addJwtHeader(req, res);
        //set the user session expiration to be equal to the new cookie expiration
        req.session.user.expires = req.session.cookie.expires;
        res.status(rdk.httpstatus.ok).rdkSend(userUtil.sanitizeUser(req.session.user));
        return;
    }

    req.logger.warn('No session present for get');
    res.status(rdk.httpstatus.unauthorized).rdkSend();

}

module.exports = getSession;
