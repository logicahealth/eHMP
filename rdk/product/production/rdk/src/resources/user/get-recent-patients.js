'use strict';

var dd = require('drilldown');
var rdk = require('../../core/rdk');
var moment = require('moment');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');

module.exports = getEhmpUserContext;

function getEhmpUserContext(req, res, next) {
    req.logger.debug('getEhmpUserContext resource called');
    var uid = req.session.user.uid;
    if (_.isUndefined(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid');
    }
    var pjdsOptions = {
        store: 'ehmpusers',
        key: uid
    };
    pjds.get(req, res, pjdsOptions, function(error, response) {
        if (error) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(error.message);
        }
        var resultObj = {};
        var recentPatients = response.data.eHMPUIContext || [];
        resultObj.data = recentPatients.reverse();
        resultObj.status = dd(response)('statusCode').val;
        res.status(rdk.httpstatus.ok).rdkSend(resultObj);
    });
}
