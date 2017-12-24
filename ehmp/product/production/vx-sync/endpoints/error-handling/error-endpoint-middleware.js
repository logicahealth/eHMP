'use strict';
require('../../env-setup');

var _ = require('underscore');

var errorProcessingApi = require(global.VX_UTILS + 'error-processing/error-processing-api');
var format = require('util').format;
var HttpHeaderUtils = require(global.VX_UTILS + 'http-header-utils');

function registerErrorAPI(logger, config, environment, app) {
    app.get('/error/find', fetchErrors.bind(null, logger, config, environment));
    app.post('/error/submit/:uid', submitByUid.bind(null, logger, config, environment));
    app.get('/error/doSubmit/:uid', submitByUid.bind(null, logger, config, environment));
    app.get('/error/doSubmit', submitRange.bind(null, logger, config, environment));
    app.post('/error/submit', submitRange.bind(null, logger, config, environment));
}

function fetchErrors(logger, config, environment, request, response) {
    var httpHeaderUtil = new HttpHeaderUtils(logger);
    var referenceInfo = httpHeaderUtil.extractReferenceInfo(request);
    var childLog = logger.child(referenceInfo);
    childLog.debug('error-endpoint.fetchErrors()');

    var errorProcessingContext = errorProcessingApi.ErrorProcessingContext(childLog, config, environment, request.query);
    errorProcessingApi.fetchErrors(errorProcessingContext, function(error, result) {
        if (error) {
            response.status(500).json(error);
        } else {
            response.status(200).json(result);
        }
    });
}

function submitByUid(logger, config, environment, request, response) {
    var httpHeaderUtil = new HttpHeaderUtils(logger);
    var referenceInfo = httpHeaderUtil.extractReferenceInfo(request);
    var childLog = logger.child(referenceInfo);
    var uid = request.params.uid || '';
    childLog.debug('error-endpoint.submitByUid(%s)', uid);

    var errorProcessingContext = errorProcessingApi.ErrorProcessingContext(childLog, config, environment, request.query);
    errorProcessingApi.submitByUid(uid, errorProcessingContext, function(error) {
        if (error) {
            response.status(500).json(error);
        } else {
            var results = {errors: errorProcessingContext.errors, processed: errorProcessingContext.results};
            response.status(200).json(results);
        }
    });
}

function submitRange(logger, config, environment, request, response) {
    var httpHeaderUtil = new HttpHeaderUtils(logger);
    var referenceInfo = httpHeaderUtil.extractReferenceInfo(request);
    var childLog = logger.child(referenceInfo);
    childLog.debug('error-endpoint.submitRange()');

    if(!_.has(request, 'query')){
        request.query = {};
    }

    if(!_.has(request.query, 'limit')){
        request.query.limit = (config['error-processing'] && config['error-processing'].jdsGetErrorLimit)?config['error-processing'].jdsGetErrorLimit:1000;
    }

    var errorProcessingContext = errorProcessingApi.ErrorProcessingContext(childLog, config, environment, request.query);
    errorProcessingApi.submit(errorProcessingContext, function(error) {
        if (error) {
            response.status(500).json(error);
        } else {
            var results = {errors: errorProcessingContext.errors, processed: errorProcessingContext.results};
            if(results.errors.length + results.processed.length >= errorProcessingContext.query.limit){
                results.message = format('Limit of %s error records has been reached. Additional error records may remain in the Error Store.', errorProcessingContext.limit);
            }
            response.status(200).json(results);
        }
    });
}

module.exports = registerErrorAPI;
module.exports._submitByUid = submitByUid;
module.exports._fetchErrors = fetchErrors;
module.exports._submitRange = submitRange;
