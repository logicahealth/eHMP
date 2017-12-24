'use strict';
var ra = require('../common/entities/radiology-objects.js'),
    errors = require('../common/errors'),
    //   helpers = require('../common/utils/helpers.js'),
    domains = require('../common/domain-map.js'),
    rdk = require('../../core/rdk'),
    _ = require('lodash'),
    nullchecker = rdk.utils.nullchecker;

function getResourceConfig() {
    //de7867 - removed the line that turned off the synchronize
    //         interceptor from this patient centric resource
    return [{
        name: 'fhir-radiology-report',
        path: '',
        get: getRadiologyReport,
        interceptors: {
            audit: false,
            metrics: false,
            authentication: false, // why are they skipping authentication?
            operationalDataCheck: false // why don't they care about the operational data, they can't even log in without it?
        },
        permitResponseFormat: true,
        requiredPermissions: [], // why are there no required permissions?
        isPatientCentric: false // why is this claiming to be not a patient centric endpoint? This should not be skipping patient policy checks
    }];
}

function getRadiologyReport(req, res) {
    fetchRadiologyReport(req, function(err, inputJSON) {
        if (err instanceof errors.ParamError) {
            res.status(rdk.httpstatus.bad_request).send(err.message);
        } else if (err instanceof errors.NotFoundError) {
            res.status(rdk.httpstatus.not_found).send(err.error);
        } else if (err instanceof errors.FetchError) {
            res.status(rdk.httpstatus.internal_server_error).send('There was an error processing your request. The error has been logged.');
        } else if (err) {
            res.status(rdk.httpstatus.internal_server_error).send(err.message);
        } else {
            res.status(200).send({
                response: processJSON(inputJSON, req)
            });
        }
    });
}

function processJSON(inputJSON, req) {
    var outJSON = [],
        items = inputJSON.data.items;
    for (var i = 0, l = items.length; i < l; i++) {
        //add meta to item
        items[i].fhirMeta = {
            _pid: req._pid,
            _originalUrl: req.originalUrl,
            _host: req.headers.host,
            _protocol: req.protocol
        };
        outJSON.push(ra.radiologyFactory('radiologyReportItem', items[i]));
    }
    return outJSON;
}

function fetchRadiologyReport(req, callback) {
    req._pid = req.param('subject') || req.param('subject.identifier') || req.param('pid');
    var pid = req._pid,
        config = req.app.config,
        jdsResource = '/vpr/' + pid + '/index/' + domains.jds('rad'),
        options = _.extend({}, config.jdsServer, {
            url: jdsResource,
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
module.exports.getRadiologyReport = getRadiologyReport;
module.exports.convertToFhir = processJSON;
