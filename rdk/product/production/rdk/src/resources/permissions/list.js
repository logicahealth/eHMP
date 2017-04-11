'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var pjds = rdk.utils.pjdsStore;

module.exports = getList;

function getList(req, res) {
    var permissionsPjdsOptions = {
        store: 'permission'
    };
    var returnTestData = req.param('testdata');
    pjds.get(req, res, permissionsPjdsOptions, function(error, response) {
        if (error) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Error retrieving Permissions List from P-JDS');
        } else {
            var permissions = response.data.items;
            if (!_.isUndefined(returnTestData) && returnTestData === 'true') {
                permissions = [{
                    'uid': 'test-permission',
                    'count': response.data.items.length
                }];
            }
            return res.status(rdk.httpstatus.ok).rdkSend(permissions);
        }
    });
}
