'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var pidValidator = rdk.utils.pidValidator;
var _ = require('lodash');
var RdkError = rdk.utils.RdkError;

module.exports.callJpid = function(req, pid, callback) {
    if (!pid) {
        return callback('No pid provided to callJpid');
    }
    var jdsPath = '/vpr/jpid/' + pid;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });
    httpUtil.get(options, callback);
};

module.exports.getIcn = function(req, pid, next) {

    var evaluateIcn = function(ids, next) {
        var icn = _.find(ids, pidValidator.isIcn);

        if (!icn) {
            return next('jpid did not find an icn');
        }

        return next(null, icn);
    };

    // do a jpid lookup
    var cb = function(error, response, result) {
        if (error) {
            return next(error);
        }
        evaluateIcn(result.patientIdentifiers, next);
    };

    exports.callJpid(req, pid, cb);

};

module.exports.getEdipiOrIcn = function(req, pid, next) {

    var evaluateEdipiOrIcn = function(ids, next) {
        var edipi = _.find(ids, pidValidator.isPidEdipi);

        if (!edipi) {
            var icn = _.find(ids, pidValidator.isIcn);
            if (!icn) {
                return next('edipi or icn could not be found.');
            }

            return next(null, {
                'type': 'ICN',
                'value': icn
            });
        } else {
            return next(null, {
                'type': 'EDIPI',
                'value': edipi.replace('DOD;', '')
            });
        }

    };

    // do a jpid lookup
    var cb = function(error, response, result) {
        if (error) {
            return next(error);
        }
        evaluateEdipiOrIcn(result.patientIdentifiers, next);
    };

    exports.callJpid(req, pid, cb);

};

module.exports.buildResponse = function(req, res, err, response, returnedData, errorCode) {

    if (!errorCode) {
        errorCode = 'vvs.500.1000';
    }
    var rdkError;
    if (err) {
        rdkError = new RdkError({
            code: errorCode,
            error: err,
            logger: req.logger
        });

        return res.status(rdkError.status).rdkSend(rdkError);
    } else if (response.statusCode !== rdk.httpstatus.ok &&
        response.statusCode !== rdk.httpstatus.created &&
        response.statusCode !== rdk.httpstatus.no_content) {
        rdkError = new RdkError({
            code: errorCode,
            error: {
                'error': response.body
            },
            logger: req.logger
        });

        return res.status(rdkError.status).rdkSend(rdkError);
    }

    var formattedResponse = {
        data: {
            items: []
        }
    };

    if (response.statusCode !== rdk.httpstatus.no_content && returnedData) {
        if (Array.isArray(returnedData)) {
            formattedResponse.data.items = returnedData;
        } else {
            formattedResponse.data.items.push(returnedData);
        }
    }

    return res.rdkSend(formattedResponse);
};
