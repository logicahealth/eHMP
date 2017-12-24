'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var async = require('async');
var _ = require('lodash');
var videoVisitUtils = require('./utils');


function invokePatientProfileServiceResource(req, res, httpMethod) {
    var pid = req.param('pid');
    if (!pid) {
        if (req.body.pid) {
            pid = req.body.pid;
        } else {
            return videoVisitUtils.buildResponse(req, res, new Error('Missing pid parameter'), null, null, 'rdk.400.1000');
        }
    }
    var errorCode = 'rdk.400.1000';
    async.waterfall([
        videoVisitUtils.getEdipiOrIcn.bind(null, req, pid),
        function(id, callback) {
            errorCode = 'pps.500.1000';
            processRequest(req, id, httpMethod, callback);
        }
    ], function(err, response, result) {
        return videoVisitUtils.buildResponse(req, res, err, response, result, errorCode);
    });
}

function processRequest(req, id, httpMethod, callback) {
    var config = _.extend({}, req.app.config.videoVisit.pvPatientProfileService, {
        logger: req.logger,
        json: true
    });

    var builder = '';
    if (httpMethod === 'get' || httpMethod === 'post') {
        builder = '/secure/patient/' + id.type + '/' + id.value + '/demographics';
    } else if (httpMethod === 'put') {
        var _id = req.param('_id');
        if (!_id) {
            if (req.body._id) {
                _id = req.body._id;
            }
        }
        builder = '/secure/patient/' + id.type + '/' + id.value + '/demographics/id/' + _id;
    }

    delete req.body.pid;

    config.uri = builder;
    config.body = req.body;

    var cb = function(err, response, returnedData) {
        if (err) {
            return callback(err);
        }
        return callback(null, response, returnedData);
    };

    if (httpMethod === 'get') {
        httpUtil.get(config, cb);
    } else if (httpMethod === 'post') {
        httpUtil.post(config, cb);
    } else if (httpMethod === 'put') {
        httpUtil.put(config, cb);
    }
}

module.exports.createPatientDemographics = function(req, res) {
    if (req.body._id) { //this is just a workaround for put operation issue in ADK(for put ADK always passing data as query parameter)
        return module.exports.updatePatientDemographics(req, res);
    }

    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'CREATE_PATIENT_DEMOGRAPHICS';
    return invokePatientProfileServiceResource(req, res, 'post');
};

module.exports.getPatientDemographics = function(req, res) {
    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'GET_PATIENT_DEMOGRAPHICS';
    return invokePatientProfileServiceResource(req, res, 'get');
};

module.exports.updatePatientDemographics = function(req, res) {
    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'UPDATE_PATIENT_DEMOGRAPHICS';

    if (!req.param('_id')) {
        if (!req.body._id) {
            return videoVisitUtils.buildResponse(req, res, new Error('Missing _id parameter'), null, null, 'rdk.400.1000');
        }
    }

    return invokePatientProfileServiceResource(req, res, 'put');
};

module.exports.getPatientEmergencyContact = function(req, res) {
    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'GET_PATIENT_EMERGENCY_CONTACT';

    var pid = req.param('pid');
    if (!pid) {
        return videoVisitUtils.buildResponse(req, res, new Error('Missing pid parameter'), null, null, 'rdk.400.1000');
    }

    var errorCode = 'rdk.400.1000';
    async.waterfall([
        videoVisitUtils.getEdipiOrIcn.bind(null, req, pid),
        function(id, callback) {
            errorCode = 'pps.500.1000';
            var config = _.extend({}, req.app.config.videoVisit.pvPatientProfileService, {
                logger: req.logger,
                json: true,
                url: '/secure/patient/' + id.type + '/' + id.value + '/contacts?type=Emergency'
            });
            httpUtil.get(config, callback);
        }
    ], function(err, response, result) {
        return videoVisitUtils.buildResponse(req, res, err, response, result, errorCode);
    });
};

module.exports.processRequest = processRequest;
module.exports.invokePatientProfileServiceResource = invokePatientProfileServiceResource;
