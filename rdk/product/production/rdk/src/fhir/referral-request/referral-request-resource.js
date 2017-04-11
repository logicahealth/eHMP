'use strict';
var referralRequest = require('./referral-request.js'),
    errors = require('../common/errors'),
    domains = require('../common/domain-map.js'),
    querystring = require('querystring'),
    rdk = require('../../core/rdk'),
    _ = require('lodash'),
    nullchecker = rdk.utils.nullchecker;

function getResourceConfig() {
    return [{
        name: 'referralrequest-getReferralRequest',
        path: '',
        get: getReferralRequest,
        subsystems: ['patientrecord', 'jds', 'solr', 'authorization'],
        requiredPermissions: [],
        isPatientCentric: true,
        permitResponseFormat: true
    }];
}

function getReferralRequest(req, res) {
    getData(req, function(err, inputJSON) {
        if (err) {
            if (err instanceof errors.ParamError) {
                res.status(rdk.httpstatus.bad_request).send(err.message);
            } else {
                req.logger.error(err.message);
                res.status(rdk.httpstatus.internal_server_error).send(err.message);
            }
        } else {
            res.status(rdk.httpstatus.ok).send(referralRequest.convertToFhir(inputJSON, req));
        }
    });
}



function getData(req, callback) {
    req._pid = req.param('subject.identifier');
    var start = req.param('start') || 0;
    var limit = req.param('limit');
    var jdsQuery = {
        start: start
    };
    if (limit) {
        jdsQuery.limit = limit;
    }
    var pid = req._pid,
        config = req.app.config,
        jdsResource = '/vpr/' + pid + '/index/' + domains.jds('consult'),
        options = _.extend({}, config.jdsServer, {
            url: jdsResource + '?' + querystring.stringify(jdsQuery),
            logger: req.logger,
            json: true
        });
    if (nullchecker.isNullish(pid)) {
        return callback(new errors.ParamError('subject.identifier'));
    }

    rdk.utils.http.get(options, function(error, response, obj) {

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

module.exports.getResourceConfig = getResourceConfig;
