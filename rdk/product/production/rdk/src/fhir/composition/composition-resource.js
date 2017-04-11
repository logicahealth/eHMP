'use strict';
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var errors = require('../common/errors');
var querystring = require('querystring');
var composition = require('./composition');

var getResourceConfig = function() {
    return [{
        name: 'fhir-composition',
        path: '',
        get: getComposition,
        requiredPermissions: ['read-fhir'],
        isPatientCentric: true,
        permitResponseFormat: true,
        subsystems: ['patientrecord', 'jds', 'solr', 'authorization'],
        interceptors: {
            fhirPid: true,
            validatePid: false
        }
    },{
        name: 'fhir-composition-search',
        path: '_search',
        post: getComposition,
        requiredPermissions: ['read-fhir'],
        isPatientCentric: true,
        permitResponseFormat: true,
        subsystems: ['patientrecord', 'jds', 'solr', 'authorization'],
        interceptors: {
            fhirPid: true,
            validatePid: false
        }
    }];
};

function getComposition(req, res) {

    var pid = req.query['subject.identifier'];
    var type = req.param('type');
    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_request).send('Missing subject.identifier parameter');
    }
    getCompositionData(req, pid, type, function(err, inputJSON) {
        if (err instanceof errors.FetchError) {
            req.logger.error(err.message);
            res.status(rdk.httpstatus.internal_server_error).send('There was an error processing your request. The error has been logged.');
        } else if (err instanceof errors.NotFoundError) {
            res.status(rdk.httpstatus.not_found).send(err.error);
        } else if (err) {
            res.status(rdk.httpstatus.internal_server_error).send(err.message);
        } else {

            var outJSON = {};
            outJSON = composition.convertToFhir(inputJSON, req);

            res.status(200).send(outJSON);
        }
    });
}

function getCompositionData(req, pid, type, callback) {
    var config = req.app.config;
    var jdsResource, jdsPath;
    var start = req.param('start') || 0;
    var limit = req.param('_count');
    var jdsQuery = {
        start: start
    };
    if (limit) {
        jdsQuery.limit = limit;
    }
    if (type === undefined) {
        jdsResource = '/vpr/' + pid + '/index/document/';
    } else if ((nullchecker.isNotNullish(type) && type === '34745-0')) {
        jdsResource = '/vpr/' + pid + '/index/document/?filter=in(kind,%5B%22Discharge%20Summary%22,%22Discharge%20Summarization%20Note%22%5D)';
    } else if ((nullchecker.isNotNullish(type) && type === '34765-8')) {
        jdsResource = '/vpr/' + pid + '/index/document/?filter=not(in(kind,%5B%22Discharge%20Summary%22,%22Discharge%20Summarization%20Note%22%5D))';
    }
    if (jdsResource !== undefined && jdsResource.indexOf('?') > -1) {
        jdsPath = jdsResource + '&' + querystring.stringify(jdsQuery);
    } else {
        jdsPath = jdsResource + '?' + querystring.stringify(jdsQuery);
    }
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

module.exports.getCompositionData = getCompositionData;
module.exports.getResourceConfig = getResourceConfig;
module.exports.getComposition = getComposition;
