'use strict';

var rdk = require('../core/rdk');
var _ = require('lodash');
var querystring = require('querystring');
var nullchecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;
var moment = require('moment');
var jdsFilter = require('jds-filter');

function getResourceConfig() {
    return [{
        name: 'patient-record-labsbytype',
        path: '',
        get: performLabSearchByType,
        subsystems: ['patientrecord','jds','solr','jdsSync','authorization'],
        requiredPermissions: [],
        isPatientCentric: true
    }];
}

function performLabSearchByType(req, res) {
    req.audit.dataDomain = 'laboratory';
    req.audit.logCategory = 'RETRIEVE';

    var typeName = req.param('type.name');
    var pid = req.param('pid');
    var dateStart = req.param('date.start');
    var dateEnd = req.param('date.end');
    var start = req.param('start') || 0;
    var limit = req.param('limit');
    var order = req.query.order;

    var jdsServer = req.app.config.jdsServer;

    req.logger.info('Lab Search by Type called with pid=%s type=%s from=%s to=%s', pid, typeName, dateStart, dateEnd);
    if (nullchecker.isNullish(typeName)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing type.name parameter');
    }

    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    var jdsQuery = {};
    if (start && start >= 0) {  //ensure start exists and is non-negative integer
        jdsQuery.start = start;
    }
    if (limit && limit > 0) {  //ensure limit exists and is positive integer
        jdsQuery.limit = limit;
    }
    jdsQuery.order = order || 'observed desc';

    var jdsFilters = [];
    jdsFilters.push(['eq', 'typeName', '"' + typeName + '"']);

    if(dateEnd) {
        // when we have a dateStart
        // make sure that dateEnd is after dateStart
        // make sure that both dates specify the same precision
        if(dateStart) {
            if ((dateEnd >= dateStart) && (dateEnd.length === dateStart.length)) {
                jdsFilters.push(['lte', 'observed', dateEnd]);
            }
            // if no dateStart is present just add dateEnd
        } else {
            jdsFilters.push(['lte', 'observed', dateEnd]);
        }
    }

    if(!dateStart && !dateEnd) {
        // no explicit dateStart
        // no explicit dateEnd
        // default to 1 year
        dateStart = moment().subtract(1, 'year').format('YYYYMMDD');
        jdsFilters.push(['gte', 'observed', dateStart]);
    } else if (dateStart) {
        jdsFilters.push(['gte', 'observed', dateStart]);
    }

    var jdsFilterQuery = jdsFilter.build(jdsFilters);
    jdsQuery.filter = jdsFilterQuery;

    var jdsResource = '/vpr/' + pid + '/index/laboratory';
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

            jdsStatusCode = (response && response.statusCode) || 500;

            res.status(jdsStatusCode).rdkSend(data);
        }
    );
}

module.exports.getResourceConfig = getResourceConfig;
