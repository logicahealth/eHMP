'use strict';

var userUtil = require('./user-whitelist');
var rdk = require('../../core/rdk');

var getSessionUser = {};

getSessionUser.getUser = function(req, res) {
    if (req.session && req.session.user) {
        //set the user session expiration to be equal to the new cookie expiration
        req.session.user.expires = req.session.cookie.expires;
        res.status(rdk.httpstatus.ok).rdkSend(userUtil.sanitizeUser(req.session.user));
    } else {
        res.status(rdk.httpstatus.unauthorized).rdkSend();
    }
};

module.exports = getSessionUser;
