'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var pjds = rdk.utils.pjdsStore;

module.exports = getList;

function getList(req, res) {
    var permissionSetsPjdsOptions = {
        store: 'permset'
    };
    pjds.get(req, res, permissionSetsPjdsOptions, function(permissionSetsError, permissionSetsResponse) {
        if (permissionSetsError) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Error retrieving Permission Sets List from P-JDS');
        } else {
            var permissionSets = [];
            _.each(permissionSetsResponse.data.items, function(item) {
                permissionSets.push({label: item.label, val: item.uid, permissions: item.permissions});
            });
            return res.status(rdk.httpstatus.ok).rdkSend(permissionSets);
        }
    });
}
