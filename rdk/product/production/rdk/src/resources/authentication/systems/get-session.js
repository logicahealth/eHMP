'use strict';

var _ = require('lodash');
var rdk = require('../../../core/rdk');

function getSession(req, res) {

    if (_.isObject(req.session.user)) {
        req.logger.info('Session %s Found for %s', req.session._id, req.session.user);
        //set the user session expiration to be equal to the new cookie expiration
        req.session.user.expires = req.session.cookie.expires;
        return res.status(rdk.httpstatus.ok).rdkSend(req.session.user);
    }

    req.logger.warn('No system session present for get');
    res.status(rdk.httpstatus.unauthorized).rdkSend();

}

module.exports = getSession;
