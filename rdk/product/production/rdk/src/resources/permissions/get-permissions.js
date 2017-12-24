'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var pjds = rdk.utils.pjdsStore;

module.exports = getList;

function getList(req, res) {
    var filter = _.get(req.params, 'filter') || _.get(req.query, 'filter') || ['eq', 'status', 'active'];
    var permissionsPjdsOptions = {
        store: 'permission',
        filterList: filter
    };
    pjds.get(req, res, permissionsPjdsOptions, function(error, response) {
        if (error) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Error retrieving Permissions List from P-JDS');
        }

        var hasNationalAccess = _.get(req, 'session.user.nationalAccess', false);
        if(!hasNationalAccess) {
            _.remove(response.data.items, function(item) {
                return item.nationalAccess;
            });
        }

        return res.status(rdk.httpstatus.ok).rdkSend(response.data.items);
    });
}
