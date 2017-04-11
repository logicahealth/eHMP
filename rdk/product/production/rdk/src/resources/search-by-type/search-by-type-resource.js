/*
    Refactor version of labsearchbytype/labsearchbytypeResource.js
 */
'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var querystring = require('querystring');
var Domains = require('./domains');
var nullchecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;
var jdsFilter = require('jds-filter');
var moment = require('moment');


var getResourceConfig = function() {
    return _.map(Domains.domains(), function(domain) {
        return {
            name: 'patient-record-searchbytype-' + domain.name,
            index: domain.index,
            path: domain.name,
            get: performSearchByType.bind(null, domain.index, domain.name),
            subsystems: ['patientrecord','jds', 'solr','jdsSync','authorization'],
            requiredPermissions: [],
            isPatientCentric: true
        };
    });
};

function performSearchByType(index, name, req, res) {
    req.audit.dataDomain = name;
    req.audit.logCategory = 'RETRIEVE';

    var type = req.param('type');
    var pid = req.param('pid');
    var fromDate = req.param('date.start');
    var toDate = req.param('date.end');
    var start = req.param('start') || 0;
    var limit = req.param('limit');
    var order = req.query.order;

    var jdsServer = req.app.config.jdsServer;

    req.logger.info(name + ' Seach by Type called with pid=%s type=%s from=%s to=%s', pid, type, fromDate, toDate);
    if (nullchecker.isNullish(type)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing type parameter');
    } else if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    var jdsQuery = {};
    if (start && start >= 0) { //ensure start exists and is non-negative integer
        jdsQuery.start = start;
    }
    if (limit && limit > 0) { //ensure limit exists and is positive integer
        jdsQuery.limit = limit;
    }
    if (order) {
        jdsQuery.order = order;
    }

    var jdsFilters = [];
    var dateFilter = 'observed'; //for lab/vital
    if (name === 'immunization') {
        jdsFilters.push(['eq', 'name', '"' + type + '"']);
        dateFilter = 'administeredDateTime'; // for immunization
    } else { // lab/vital
        jdsFilters.push(['eq', 'typeName', '"' + type + '"']);
    }

    if (toDate) {
        //when we have an fromDate
        //make sure that toDate is a date after fromDate
        //make sure that both dates specify the same precision
        if (fromDate) {
            if ((toDate >= fromDate) && (toDate.length === fromDate.length)) {
                jdsFilters.push(['lte', dateFilter, toDate]);
            }
            //if no fromDate is present just add toDate param
        } else {
            jdsFilters.push(['lte', dateFilter, toDate]);

        }
    }

    if (!fromDate && !toDate) {
        //no explicit fromDate
        //no explicit toDate
        //default to 1 year
        fromDate = moment().subtract(1, 'year').format('YYYYMMDD');
        jdsFilters.push(['gte', dateFilter, fromDate]);
    } else if (fromDate) {
        jdsFilters.push(['gte', dateFilter, fromDate]);
    }

    var jdsFilterQuery = jdsFilter.build(jdsFilters);
    jdsQuery.filter = jdsFilterQuery;
    jdsQuery.order = jdsQuery.order || (dateFilter + ' desc');

    var jdsResource = '/vpr/' + pid + '/index/' + index;
    var jdsQueryString = querystring.stringify(jdsQuery);
    var jdsPath = jdsResource + '?' + jdsQueryString;
    var options = _.extend({}, jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });
    var jdsStatusCode = 500; // default to server error in case the status code is not returned
    httpUtil.get(options,
        function(err, response, data) {
            if (!nullchecker.isNullish(err)) {
                res.status(500).rdkSend('500'); // TODO respond with real error
                return;
            }
            jdsStatusCode = response.statusCode;
            res.status(jdsStatusCode).rdkSend(data);
        }
    );
}

module.exports.getResourceConfig = getResourceConfig;
