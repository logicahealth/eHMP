/**
 * Returns the list of valid values for the vital, laboratory, and medication types from JDS
 *
 * @return {JSON}      - an object that conatins the required list of values
 *
 **/

'use strict';
var _ = require('lodash');
var querystring = require('querystring');
var util = require('util');
var async = require('async');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;

var interceptors = {
    synchronize: false
};

function buildVitalsPath(req, callback) {

    var jdsResource = '/data/index/vital-type-uid';
    var jdsQuery = {};
    var userSession = req.session.user || {};
    var limit = req.param('limit');
    var site = userSession.site || null;
    if (limit) {
        jdsQuery.limit = Number(limit);
    }
    if (site) {
        jdsQuery.range = 'urn:va:vital-type:' + site + ':*';
    }

    var jdsQueryString = querystring.stringify(jdsQuery);
    var jdsPath = jdsResource + '?' + jdsQueryString;

    return callback(null, jdsPath);
}

function buildLaboratoryPath(req, callback) {

    var jdsResource = '/data/index/orderable-linktype';
    var jdsQuery = {};
    var userSession = req.session.user || {};
    var limit = req.param('limit');
    var site = userSession.site || null;
    if (limit) {
        jdsQuery.limit = Number(limit);
    }
    if (site) {
        jdsQuery.range = 'urn:va:orderable:' + site + ':*';
        jdsQuery.filter = 'eq(linktype,LRT)';
    }

    var jdsQueryString = querystring.stringify(jdsQuery);
    var jdsPath = jdsResource + '?' + jdsQueryString;

    return callback(null, jdsPath);
}

function buildMedicationPath(req, callback) {

    var jdsResource = '/data/index/orderable-linktype';
    var jdsQuery = {};
    var userSession = req.session.user || {};
    var limit = req.param('limit');
    var site = userSession.site || null;
    if (limit) {
        jdsQuery.limit = Number(limit);
    }
    if (site) {
        jdsQuery.range = 'urn:va:orderable:' + site + ':*';
        jdsQuery.filter = 'eq(linktype,PSP)';
    }

    var jdsQueryString = querystring.stringify(jdsQuery);
    var jdsPath = jdsResource + '?' + jdsQueryString;

    return callback(null, jdsPath);
}

function getOpData(opType, req, res) {
    req.logger.warn('op %s resource GET called', opType);
    req.audit.logCategory = util.format('Operation Data Type - %s', opType.toUpperCase());

    var opPathBuilders = {
        vital: buildVitalsPath,
        laboratory: buildLaboratoryPath,
        medication: buildMedicationPath
    };
    async.waterfall(
        [
            opPathBuilders[opType].bind(null, req),
            getJdsResponse.bind(null, req)
        ],
        function(err, results) {
            if (err) {
                req.logger.error('DE4687:getOpData:BEGIN --- ' + err, err);
                req.logger.error('DE4687:getOpData:END ---');
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }
            return res.status(results.statusCode).rdkSend(results.data);
        }
    );
}

function getJdsResponse(req, path, callback) {
    var jdsServer = req.app.config.jdsServer;
    var options = _.extend({}, jdsServer, {
        url: path,
        logger: req.logger,
        json: true
    });
    httpUtil.get(options, function(error, response, data) {
        var resultObj = {};
        resultObj.data = data;
        resultObj.statusCode = _.get(response, 'statusCode');
        if (error) {
            req.logger.error('DE4687:getJdsResponse:BEGIN --- ', error, response, resultObj);
            req.logger.error('DE4687:getJdsResponse:END ---');
        }
        callback(error, resultObj);
    });
}

module.exports = getOpData;
module.exports.interceptors = interceptors;
