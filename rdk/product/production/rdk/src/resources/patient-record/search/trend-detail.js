'use strict';

var util = require('util');
var querystring = require('querystring');
var _ = require('lodash');
var async = require('async');
var rdk = require('../../../core/rdk');
var jdsFilter = require('jds-filter');
var httpUtil = rdk.utils.http;
var auditUtil = require('../../../utils/audit');


module.exports = getTrendDetail;
module.exports.description = {
    get: 'Get text search result detail where the items in a group are data points that should be graphed'
};

function getTrendDetail(req, res) {

    req.audit.patientId = req.query.pid;
    req.audit.logCategory = 'SEARCH';
    auditUtil.addAdditionalMessage(req, 'searchCriteria', util.format('pid=%s,uid=%s,', req.query.pid, req.query.uid));

    if (!req.query.pid) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    } else if (!req.query.uid) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid parameter');
    }

    //var domain = req.query.domain;
    var pid = req.query.pid;
    var uid = req.query.uid;

    var detailDomains = {
        med: buildMedDetailPath,
        document: buildDocumentDetailPath,
        vital: buildVitalDetailPath,
        lab: buildLabDetailPath,
        problem: buildProblemDetailPath
    };

    var domainRegex = /^urn:(?:va:)?([^:]*)/;
    var domain = uid.match(domainRegex);
    if (!domain) {
        return res.status(400).rdkSend(new Error('Invalid uid'));
    }
    domain = domain[1];
    if (!_.has(detailDomains, domain)) {
        return res.status(400).rdkSend(new Error('Invalid uid'));
    }

    async.waterfall(
        [
            function(callback) {
                req.app.subsystems.jds.getByUid(req, pid, uid, function (error, data, statusCode) {
                    callback(error, data);
                });
            },
            function(data, callback) {
                var jdsPath = detailDomains[domain](pid, data);
                var options = _.extend({}, req.app.config.jdsServer, {
                    url: jdsPath,
                    logger: req.logger,
                    json: true
                });
                httpUtil.get(options, function(error, resp, data) {
                    var response = {};
                    response.statusCode = _.get(resp, 'statusCode');
                    response.data = data;
                    callback(error, response);
                });
            }
        ],
        function(err, data) {
            if (err) {
                req.logger.error(err, 'Error in getTrendDetail');
                return res.status(_.isNumber(err.code) ? err.code : 500).rdkSend(err.message || 'Error');
            }
            return res.status(data.statusCode).rdkSend(data.data);
        }
    );
}

function buildMedDetailPath(pid, uidData) {
    // qualifiedName
    var qualifiedName = _.get(uidData, 'data.items[0].qualifiedName') || null;
    var jdsResource = '/vpr/' + pid + '/index/medication';
    var jdsFilterString = jdsFilter.build([
        ['eq', 'qualifiedName', qualifiedName]
    ]);
    var jdsQuery = {
        filter: jdsFilterString
    };
    jdsQuery = querystring.stringify(jdsQuery);
    var jdsPath = jdsResource + '?' + jdsQuery;
    return jdsPath;
}

function buildDocumentDetailPath(pid, uidData) {
    // localTitle
    var qualifiedName = _.get(uidData, 'data.items[0].qualifiedName') || null;
    var jdsResource = '/vpr/' + pid + '/index/document';
    var jdsFilterString = jdsFilter.build([
        ['eq', 'qualifiedName', qualifiedName]
    ]);
    var jdsQuery = {
        filter: jdsFilterString
    };
    jdsQuery = querystring.stringify(jdsQuery);
    var jdsPath = jdsResource + '?' + jdsQuery;
    return jdsPath;
}

function buildVitalDetailPath() {
    // qualifiedName
}

function buildLabDetailPath() {
    // qualifiedName
}

function buildProblemDetailPath() {
    // icdGroup
}
