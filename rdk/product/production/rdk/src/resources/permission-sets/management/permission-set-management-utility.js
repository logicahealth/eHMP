'use strict';

var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var PJDS_STORE = 'permset';

function findPermissionSet(req, res, uid, callback) {
    var pjdsOptions = {
        store: PJDS_STORE,
        key: uid
    };
    pjds.get(req, res, pjdsOptions, function(error, result) {
        return callback(error, result);
    });
}

module.exports.findPermissionSet = findPermissionSet;
