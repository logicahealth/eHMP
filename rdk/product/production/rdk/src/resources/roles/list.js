'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var pjds = rdk.utils.pjdsStore;

module.exports = getList;

function getList(req, res) {
    var rolesPjdsOptions = {
        store: 'roles'
    };
    pjds.get(req, res, rolesPjdsOptions, function(rolesError, rolesResponse) {
        if (rolesError) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Error retrieving Roles List from P-JDS');
        } else {
            var roles = [];
            _.each(rolesResponse.data.items, function(item) {
                roles.push({label: item.label, val: item.uid});
            });
            return res.status(rdk.httpstatus.ok).rdkSend(roles);
        }
    });
}
