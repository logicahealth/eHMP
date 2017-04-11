'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;

function getPatientUid(req, callback) {
    req.audit.logCategory = 'RETRIEVE';

    var uid = req.param('uid');
    var pid = req.param('pid');
    // /urn:va:\w+:\d+:\d+.*/
    if (nullchecker.isNullish(uid)) {
        return callback({code: rdk.httpstatus.bad_request, message: 'Missing uid parameter'});
    } else if (nullchecker.isNullish(pid)) {
        return callback({code: rdk.httpstatus.bad_request, message: 'Missing pid parameter'});
    }

    var options = _.extend({}, req.app.config.jdsServer, {
        //url: '/vpr/' + '9E7A;3' + '/' + 'urn:va:problem:C877:3:747'  // good
        //url: '/vpr/' + '9E7A;3' + '/' + 'urn:va:problem:9E7A:253:783'  // bad key
        url: '/vpr/' + pid + '/' + uid,
        logger: req.logger,
        json: true
    });
    httpUtil.get(options, callback);
}

module.exports.getPatientUid = getPatientUid;
