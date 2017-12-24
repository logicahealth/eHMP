'use strict';
var rdk = require('../../../core/rdk');
var _ = require('lodash');
var errors = require('../common/errors');


function getData(req, pid, refferenceDate, callback) {
    var config = req.app.config;
    var jdsPath = '/vpr/' + pid + '/index/allergy';
    var options = _.extend({}, config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    rdk.utils.http.get(options, function(error, response, obj) {
        req.logger.debug('callback from fetch()');
        if (error) {
            callback(new errors.FetchError('Error fetching pid=' + pid + ' - ' + (error.message || error), error));
        } else {
            if ('data' in obj) {
                return callback(null, buildResult(obj));
            } else if ('error' in obj) {
                if (errors.isNotFound(obj)) {
                    return callback(new errors.NotFoundError('Object not found', obj));
                }
            }

            return callback(new Error('There was an error processing your request. The error has been logged.'));
        }
    });
}
module.exports.getData = getData;

function buildResult(result) {
    var res = {};
    res.allergy = [];
    res.allergy = result.data.items;
    return res;
}
module.exports.buildResult = buildResult;
