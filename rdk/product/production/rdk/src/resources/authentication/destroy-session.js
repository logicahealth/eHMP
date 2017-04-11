'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');

function destroySession(req, res) {

    if (!_.isObject(_.result(req, 'session.user', undefined))) {
        req.logger.debug('Could not destroy empty session.');
        return res.status(rdk.httpstatus.internal_server_error).rdkSend();
    }

    req.session.destroy(function(err) {
        if (err) {
            req.logger.error({error: err}, 'Error destroying session');
            res.status(rdk.httpstatus.internal_server_error).rdkSend();
            return;
        }
        req.logger.debug('Destroyed session.');
        //backbone requires a json object at a minimum to be sent back or it will assume an error
        res.status(rdk.httpstatus.ok).rdkSend({});
    });
}

module.exports = destroySession;
