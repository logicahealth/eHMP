'use strict';
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var querystring = require('querystring');
var errors = require('../common/errors');

function getVprData(appConfig, logger, pid, callback, params, services) {
    var jdsPath = buildVprPath(pid, params, services);
    var options = _.extend({}, appConfig.jdsServer, {
        url: jdsPath,
        logger: logger,
        json: true
    });

    rdk.utils.http.get(options, function(error, response, obj) {
        logger.debug('callback from fetch()');
        if (error) {
            callback(new errors.FetchError('Error fetching pid=' + pid + ' - ' + (error.message || error), error));
        } else {
            if ('data' in obj) {
                return callback(null, obj);
            } else if ('error' in obj) {
                if (errors.isNotFound(obj)) {
                    return callback(new errors.NotFoundError('Object not found', obj));
                }
            }

            return callback(new Error('There was an error processing your request. The error has been logged.'));
        }
    });
}

function buildVprPath(pid, params, services) {
    var jdsPath;
    var jdsQuery = {};
    if (nullchecker.isNotNullish(params.start)) {
        jdsQuery.start = params.start;
    }
    if (nullchecker.isNotNullish(params._count)) {
        jdsQuery.limit = params._count;
    }
    if (nullchecker.isNotNullish(services) && services.length > 0) {
        jdsQuery.filter = 'in(service,[' + services.join(',') + '])';
    }
    jdsPath = '/vpr/' + pid + '/index/order' + '?' + querystring.stringify(jdsQuery);
    return jdsPath;
}

module.exports.getVprData = getVprData;
