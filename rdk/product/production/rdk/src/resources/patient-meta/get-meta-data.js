'use strict';
var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');

module.exports = getMetaData;

function getMetaData(req, res, next) {
    req.logger.debug('getMetaData resource called');
    var appletId = req.param('appletId');
    var version = req.param('version');
    var uids = req.interceptorResults.patientIdentifiers.uids;
    if (_.isUndefined(uids)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uids');
    }

    var pjdsOptions = {
        store: 'pidmeta',
        key: uids
    };

    pjds.get(req, res, pjdsOptions, function(error, response) {
        var resultObj = {};
        var statusCode = _.get(response, 'statusCode');
        resultObj.data = {
            items: [{
                status: statusCode
            }]
        };
        var dataItems = _.result(response, 'data.items', []);
        if (error || _.isEmpty(dataItems)) {
            if (statusCode === 404 || _.isEmpty(dataItems)) {
                resultObj.data.items = [{
                    status: 202
                }];
                return res.status(rdk.httpstatus.accepted).rdkSend(resultObj);
            }
            return res.status(statusCode || rdk.httpstatus.bad_request).rdkSend(error.message);
        }
        var items = response.data.items[0];
        if (appletId) {
            _.remove(items.val, function(v) {
                return v.applet_id !== appletId;
            });
        }
        if (version) {
            _.remove(items.val, function(v) {
                return v.version !== version;
            });
        }

        resultObj.data.items = [items];
        return res.status(rdk.httpstatus.ok).rdkSend(resultObj);
    });
}
