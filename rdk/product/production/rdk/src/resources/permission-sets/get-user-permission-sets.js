'use strict';
var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');

module.exports = getUserPermissionSets;

function getUserPermissionSets(req, res, next) {
    req.logger.debug('getPermissionSets resource called');
    var uid = req.param('uid');
    if (_.isUndefined(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid');
    }

    var pjdsOptions = {
        store: 'ehmpusers',
        key: uid
    };

    pjds.get(req, res, pjdsOptions, function(error, response) {
        if (error) {
            res.status(response.statusCode || rdk.httpstatus.bad_request).rdkSend(error.message);
        } else {
            var data = response.data;
            var resultObj = {};
            resultObj.data = data.permissionSet;
            resultObj.statusCode = _.get(response, 'statusCode');
            res.status(rdk.httpstatus.ok).rdkSend(resultObj);
        }
    });
}
