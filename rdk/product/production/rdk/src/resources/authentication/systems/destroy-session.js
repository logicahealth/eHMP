'use strict';

var _ = require('lodash');
var rdk = require('../../../core/rdk');

function destroySession(req, res) {

    if (!_.isObject(req.session.user)) {
        req.logger.debug('Could not destroy empty session.');
        return res.status(rdk.httpstatus.unauthorized).rdkSend();
    }

    req.session.destroy(function(err) {
        if (err) {
            req.logger.error('Error destroying session: ' + err.toString());
            return res.status(rdk.httpstatus.internal_server_error).rdkSend();
        }
        req.logger.debug('Destroyed session.');

        return res.status(rdk.httpstatus.ok).rdkSend();
    });
}

module.exports = destroySession;