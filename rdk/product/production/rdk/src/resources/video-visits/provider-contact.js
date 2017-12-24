'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var httpUtil = rdk.utils.http;
var nullchecker = rdk.utils.nullchecker;
var videoVisitUtils = require('./utils');

function invokeProviderContactResource(req, res, httpMethod) {
    var facilityCode = req.param('facilityCode');
    var ien = req.param('ien');
    if (nullchecker.isNullish(facilityCode) && nullchecker.isNotNullish(ien)) {
        return videoVisitUtils.buildResponse(req, res, new Error('Unable to retrieve facilityCode parameter'), null, null, 'rdk.400.1000');
    }

    if (nullchecker.isNotNullish(facilityCode) && nullchecker.isNullish(ien)) {
        return videoVisitUtils.buildResponse(req, res, new Error('Unable to retrieve ien parameter'), null, null, 'rdk.400.1000');
    }

    if (!facilityCode && !ien) {
        facilityCode = req.session.user.division;
        ien = req.session.user.duz[req.session.user.site];
    }

    var config = _.extend({}, req.app.config.videoVisit.vvService, {
        logger: req.logger,
        json: true,
        url: '/provider/' + facilityCode + '/' + ien + '/contact'
    });

    delete req.body.pid;
    config.body = req.body;

    var cb = function(err, response, returnedData) {
        if (err) {
            return videoVisitUtils.buildResponse(req, res, err, null, null, 'vvs.500.1000');
        } else if (response.statusCode !== rdk.httpstatus.ok && response.statusCode !== rdk.httpstatus.created && response.statusCode !== rdk.httpstatus.no_content) {
            return videoVisitUtils.buildResponse(req, res, {
                'error': response.body
            }, null, null, 'vvs.500.1000');
        }

        var formattedResponse = {
            data: {
                items: []
            }
        };

        if (response.statusCode !== rdk.httpstatus.no_content && returnedData) {
            formattedResponse.data.items.push(returnedData);
        }

        return res.rdkSend(formattedResponse);
    };

    if (httpMethod === 'get') {
        httpUtil.get(config, cb);
    } else if (httpMethod === 'post') {
        httpUtil.post(config, cb);
    } else if (httpMethod === 'put') {
        httpUtil.put(config, cb);
    } else if (httpMethod === 'delete') {
        httpUtil.delete(config, cb);
    }
}

module.exports.createProviderContactInfo = function(req, res) {
    if (req.body._id) { //this is just a workaround for put operation issue in ADK(for put ADK always passing data as query parameter)
        return module.exports.updateProviderContactInfo(req, res);
    }

    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'CREATE_PROVIDER_CONTACT';
    return invokeProviderContactResource(req, res, 'post');
};

module.exports.getProviderContactInfo = function(req, res) {
    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'GET_PROVIDER_CONTACT';
    return invokeProviderContactResource(req, res, 'get');
};

module.exports.updateProviderContactInfo = function(req, res) {
    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'UPDATE_PROVIDER_CONTACT';
    return invokeProviderContactResource(req, res, 'put');
};

module.exports.deleteProviderContactInfo = function(req, res) {
    req.audit.dataDomain = 'Video Visits';
    req.audit.logCategory = 'DELETE_PROVIDER_CONTACT';
    return invokeProviderContactResource(req, res, 'delete');
};
