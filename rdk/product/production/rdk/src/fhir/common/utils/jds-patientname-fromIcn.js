'use strict';
var rdk = require('../../../core/rdk');
var httpUtil = rdk.utils.http;
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');



module.exports.get = function(icn, req, callback) {
    //http://10.2.2.110:9080/vpr/9E7A;100013/find/patient?filter=in(pid,["9E7A;100013"])

    var jdsServer = req.app.config.jdsServer;
    var jdsPath = '/vpr/' + icn + '/find/patient?filter=in(pid,["' + icn + '"])';

    var options = _.extend({}, jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });
    httpUtil.get(options,
        function(err, result, data) {
            if (!nullchecker.isNullish(err)) {
                return callback(null, undefined);
            }

            return callback(null, _.has(data, 'data.items[0].displayName') ? data.data.items[0].displayName : undefined);
        }
    );

};
