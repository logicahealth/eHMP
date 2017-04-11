'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var jdsFilterUtil = require('jds-filter');

/**
 * Adds filter or error to req.interceptorResults.jdsFilter
 */
module.exports = function(req, res, next) {
    req.logger.info('jdsFilterInterceptor invoked');
    req.interceptorResults = req.interceptorResults || {};
    req.interceptorResults.jdsFilter = {};
    var filter = req.query.filter;
    if(!filter) {
        req.interceptorResults.jdsFilter.error = new Error('No jds filter query parameter');
        return next();
    }

    var filterObj;
    try {
        filterObj = jdsFilterUtil.parse(filter);
    } catch(e) {
        delete req.query.filter;
        req.interceptorResults.jdsFilter = {error: e};
        return next();
    }

    req.interceptorResults.jdsFilter = {filter: filterObj};
    return next();
};
