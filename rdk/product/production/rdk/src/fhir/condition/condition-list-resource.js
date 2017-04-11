'use strict';
var ra = require('../common/entities/condition-objects.js'),
    errors = require('../common/errors'),
    domains = require('../common/domain-map.js'),
    fhirResource = require('../common/entities/fhir-resource'),
    rdk = require('../../core/rdk'),
    fhirToJDSSearch = require('../common/utils/fhir-to-jds-search'),
    _ = require('lodash'),
    nullchecker = rdk.utils.nullchecker;

//http://IP             /vpr/all/find/problem?filter=like(%22problemText%22,%22%25%22)
//get all problems in the system

//http://IP             /vpr/9E7A;20/find/problem
//get all problems for a specific pid

function getResourceConfig() {
    return [{
        name: 'condition-getProblems',
        path: '',
        get: getProblems,
        subsystems: ['patientrecord', 'jds', 'solr', 'authorization'],
        interceptors: {
            fhirPid: true
        },
        permitResponseFormat: true,
        requiredPermissions: [],
        isPatientCentric: true
    }];
}

var fhirToJDSMap = {
    asserter: 'providerDisplayName',
    // (NOT MAPPED) category
    // (NOT MAPPED) clinicalstatus
    'code': 'icdCode',
    'date-asserted': 'entered',
    // (NOT MAPPED) dueto-code
    // (NOT MAPPED) dueto-item
    // (NOT MAPPED) encounter
    // (NOT MAPPED) evidence
    // (NOT MAPPED) following-code
    // (NOT MAPPED) following-item
    // (NOT MAPPED) location
    onset: 'onset',
    // (NOT MAPPED) onset-info
    patient: 'pid',
    // (NOT MAPPED) severity
    // (NOT MAPPED) stage
    // (NOT MAPPED) subject
};

function buildJDSPath(pid, params) {
    var jdsPath = '/vpr/' + pid + '/index/' + domains.jds('problem');
    var query = [];
    var searchQuery = buildSearchQuery(params);

    // search queries
    if (nullchecker.isNotNullish(searchQuery)) {
        query.push(searchQuery);
    }
    // common parameters
    query = query.concat(fhirToJDSSearch.buildCommonQueryParams(params, fhirToJDSMap));

    // add filter queries to path
    if (query.length > 0) {
        jdsPath += '?' + query.join('&');
    }

    return jdsPath;
}

function buildSearchQuery(params) {

    var query = [];
    var dateAssertedQuery,
        onsetDateTimeQuery;

    /* uid was searchable at one time, but is not indicated as such in the FHIR spec */
    /* for more inforation: http://www.hl7.org/FHIR/2015May/condition.html#4.3.4 */

    // NOTE:  uid should be mapped to an identifier as per the mapping docs, but is currently not.

    //if (nullchecker.isNotNullish(params.uid)) {
    //    uidQuery = 'like("uid","' + params.uid + '")';
    //    if (uidQuery) {
    //        query.push(uidQuery);
    //    }
    //}

    // dates
    if (nullchecker.isNotNullish(params.onset)) {
        onsetDateTimeQuery = fhirToJDSSearch.buildDateQuery(params.onset, 'onset', true /*ignoreTime*/ );
        if (onsetDateTimeQuery) {
            query.push(onsetDateTimeQuery);
        }
    }
    if (nullchecker.isNotNullish(params['date-asserted'])) { //the hyphen in the name prevents us from using our normal conventions to access it.
        dateAssertedQuery = fhirToJDSSearch.buildDateQuery(params['date-asserted'], 'entered', true /*ignoreTime*/ );
        if (dateAssertedQuery) {
            query.push(dateAssertedQuery);
        }
    }

    return fhirToJDSSearch.buildSearchQueryString(query);
}

/**
 * @api {get} /fhir/patient/{id}/condition Get Condition
 * @apiName getProblems
 * @apiGroup Condition
 * @apiParam {Number} [_count] The number of results to show.
 * @apiParam {String} [date-asserted] date-asserted date/time. The prefixes >, >=, <=, < and != may be used on the parameter value (e.g. date-asserted=>2015-01-15). The following date formats are permitted: yyyy-mm-ddThh:mm:ss (exact date search), yyyy-mm-dd (within given day), yyyy-mm (within given month), yyyy (within given year). A single date parameter can be used for an exact date search (e.g. date-asserted=2015-01-26T08:30:00) or an implicit range (e.g. date-asserted=2015-01, searches all dates in January 2015). Two date parameters can be used to specify an explicitly bounded range. When using a pair of date parameters, the parameters should bind both ends of the range. One should have a less-than operator (<, <=) while the other a greater-than operator (>, >=). Consult the <a href="http://www.hl7.org/FHIR/2015May/search.html#date">FHIR DSTU2 API</a> documentation for more information.
 * @apiParam {String} [onset] onset date/time. The prefixes >, >=, <=, < and != may be used on the parameter value (e.g. onset=>2015-01-15). The following date formats are permitted: yyyy-mm-ddThh:mm:ss (exact date search), yyyy-mm-dd (within given day), yyyy-mm (within given month), yyyy (within given year). A single date parameter can be used for an exact date search (e.g. onset=2015-01-26T08:30:00) or an implicit range (e.g. onset=2015-01, searches all dates in January 2015). Two date parameters can be used to specify an explicitly bounded range. When using a pair of date parameters, the parameters should bind both ends of the range. One should have a less-than operator (<, <=) while the other a greater-than operator (>, >=). Consult the <a href="http://www.hl7.org/FHIR/2015May/search.html#date">FHIR DSTU2 API</a> documentation for more information.
 * @apiParam {String} [_sort] Sort criteria. Ascending order by default, order is specified with the following variants:  _sort:asc (ascending), _sort:dsc (descending). Supported sort properties: asserter, code, date-asserted, onset, patient.
 *
 * @apiDescription Converts a vpr \'problem\' resource into a FHIR \'condition\' resource.
 * @apiExample {js} Request Examples:
 *      // Limiting results count
 *      http://IP           /resource/fhir/patient/10110V004877/condition?_count=1
 *
 *      // Conditions on a year
 *      http://IP           /resource/fhir/patient/10110V004877/condition?onset=2000
 *
 *      // Conditions in a year and month
 *      http://IP           /resource/fhir/patient/10110V004877/condition?onset=2005-04
 *
 *      // Conditions in a year, month, and day
 *      http://IP           /resource/fhir/patient/10110V004877/condition?onset=2000-02-21
 *
 *      // Conditions outside of a date range
 *      http://IP           /resource/fhir/patient/10110V004877/condition?onset=!=2000-02
 *
 *      // Conditions within an explicit date range
 *      http://IP           /resource/fhir/patient/10110V004877/condition?onset=>=2010-06&onset=<=2014-09-20
 *
 *      // Conditions sorted by code
 *      http://IP           /resource/fhir/patient/10110V004877/condition?_sort=code
 *
 *      // Conditions sorted by asserter
 *      http://IP           /resource/fhir/patient/10110V004877/condition?_sort=asserter
 *
 *      // Conditions sorted by date-asserted
 *      http://IP           /resource/fhir/patient/10110V004877/condition?_sort=date-asserted
 *
 *      // Conditions sorted by onset
 *      http://IP           /resource/fhir/patient/10110V004877/condition?_sort=onset
 *
 *      // Conditions sorted by patient (pid)
 *      http://IP           /resource/fhir/patient/10110V004877/condition?_sort=patient
 *
 *
 * @apiSuccess {json} data Json object conforming to the <a href="http://www.hl7.org/FHIR/2015May/condition.html">Condition FHIR DTSU2 specification</a>.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "resourceType": "Bundle",
 *  "type": "collection",
 *  "id": "16b7493b-0a69-4a16-b72a-22c9873de33d",
 *  "link": [
 *      {
 *          "relation": "self",
 *          "url": "http://localhost:8888/resource/fhir/patient/10110V004877/condition?_count=1"
 *      }
 *  ],
 *  "total": 32,
 *  "entry": [{
 *      "resource": {
 *          "resourceType": "Condition",
 *          "category": {
 *              "coding": [{
 *                  "code": "diagnosis",
 *                  "system": "2.16.840.1.113883.4.642.2.224"
 *              }]
 *          },
 *          "stage": {
 *              "summary": "Diabetes Mellitus Type II or unspecified (ICD-9-CM 250.00)"
 *          },
 *          "patient": {
 *              "reference": "9E7A;8"
 *          },
 *          "code": {
 *              "coding": [{
 *                  "system": "urn:oid:2.16.840.1.113883.6.233",
 *                  "code": "urn:icd:250.00",
 *                  "display": "DIABETES MELLI W/O COMP TYP II"
 *              }]
 *          },
 *          "asserter": {
 *              "reference": "#71a470ef-0f93-4377-80ac-54c4f3ec914c",
 *              "display": "VEHU,TEN"
 *          },
 *          "dateAsserted": "2000-05-08",
 *          "onsetDateTime": "2000-02-21",
 *          "contained": [{
 *              "resourceType": "Encounter",
 *              "text": {
 *                  "status": "generated",
 *                  "div": "<div>Encounter with patient 9E7A;8</div>"
 *              },
 *              "location": [{
 *                  "resourceType": "Location",
 *                  "_id": "urn:va:location:9E7A:32"
 *              }]
 *          },
 *          {
 *              "resourceType": "Practitioner",
 *              "_id": "71a470ef-0f93-4377-80ac-54c4f3ec914c",
 *              "name": "VEHU,TEN",
 *              "identifier": {
 *                  "value": "urn:va:user:9E7A:20012",
 *                  "system": "urn:oid:2.16.840.1.113883.6.233"
 *              }
 *          }],
 *          "clinicalStatus": "confirmed",
 *          "extension": [{
 *              "url": "http://vistacore.us/fhir/extensions/condition#serviceConnected",
 *              "valueBoolean": false
 *          },
 *          {
 *              "url": "http://vistacore.us/fhir/extensions/condition#statusCode",
 *              "valueString": "urn:sct:55561003"
 *          },
 *          {
 *              "url": "http://vistacore.us/fhir/extensions/condition#statusDisplayName",
 *              "valueString": "Active"
 *          },
 *          {
 *              "url": "http://vistacore.us/fhir/extensions/condition#statusName",
 *              "valueString": "ACTIVE"
 *          },
 *          {
 *              "url": "http://vistacore.us/fhir/extensions/condition#updated",
 *              "valueDateTime": "2004-03-31"
 *          }]
 *      }
 * }]
 * }
 * @apiError (Error 400) Invalid parameters.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *      Invalid parameters:
 *      Unsupported _sort criteria. Supported attributes are: date-asserted, onset, patient and asserter
 * }
 */
function getProblems(req, res) {
    var pid = req.query.pid;
    var params = req.query;

    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_format).send('Missing required parameter: pid');
    }

    validateParams(params, /*onSuccess*/ function() {
        getProblemsData(req.app.config, req.logger, pid, params, function(err, inputJSON) {
            if (nullchecker.isNotNullish(err)) {
                res.status(err.code).send(err.message);
            } else {
                var fhirBundle = convertToFhir(inputJSON, req);
                res.status(rdk.httpstatus.ok).send(fhirBundle);
            }
        });
    }, /*onError*/ function(errors) {
        return res.status(rdk.httpstatus.bad_request).send('Invalid parameters:' + fhirToJDSSearch.validationErrorsToString(errors));
    });
}

function getProblemsData(appConfig, logger, pid, params, callback) {
    // check for required pid param
    if (nullchecker.isNullish(pid)) {
        return callback(new Error('Missing required parameter: pid'));
    }

    var jdsPath = buildJDSPath(pid, params);
    var options = _.extend({}, appConfig.jdsServer, {
        url: jdsPath,
        logger: logger,
        json: true
    });

    rdk.utils.http.get(options, function(error, response, body) {
        var internalError = 'There was an error processing your request. The error has been logged.';
        logger.debug('callback from fetch()');

        if (error) {
            callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, 'Error fetching pid=' + pid + ' - ' + (error.message || error)));
        } else {
            if ('data' in body) {
                return callback(null, body);
            } else if ('error' in body) {
                logger.error('condition-list-resource::getProblemsData: ' + body.error.code + ' - ' + getJDSErrorMessage(body.error));
                return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, internalError));
            }
            logger.error('condition-list-resource::getProblemsData: Empty response from JDS.');
            return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, internalError));
        }
    });
}

function validateParams(params, onSuccess, onError) {
    // check common parameters
    fhirToJDSSearch.validateCommonParams(params, function() {
        // validate date
        fhirToJDSSearch.validateDateParams(params, ['date-asserted', 'onset'], function() {
            if (isSortCriteriaValid(params)) {
                onSuccess();
            } else {
                onError(['Unsupported _sort criteria. Supported attributes are: asserter, code, date-asserted, onset, and patient']);
            }
        }, onError);
    }, onError);
}

function convertToFhir(inputJSON, req) {
    var results = [],
        items = inputJSON.data.items,
        total = inputJSON.data.totalItems;
    for (var i = 0, l = items.length; i < l; i++) {
        //add meta to item
        items[i].fhirMeta = {
            _pid: req._pid,
            _originalUrl: req.originalUrl,
            _host: req.headers.host,
            _protocol: req.protocol
        };
        results.push(ra.conditionFactory('ConditionItem', items[i]));
    }
    return buildBundle(results, req, total);
}

function buildBundle(results, req, total) {
    var b = new fhirResource.Bundle2();
    if (req) {
        b.link.push(new fhirResource.Link(req.protocol + '://' + req.headers.host + req.originalUrl, 'self'));
    }
    b.total = total;
    for (var i in results) {
        if (nullchecker.isNotNullish(results[i])) {
            var e = new fhirResource.Entry(results[i]);
            b.entry.push(e);
        }
    }
    return b;
}

function isSortCriteriaValid(params) {
    return fhirToJDSSearch.isSortCriteriaValid(params, fhirToJDSMap);
}

function getJDSErrorMessage(error) {
    var msg = '';

    if (nullchecker.isNotNullish(error.errors)) {
        msg = _.reduce(error.errors, function(memo, e) {
            if (memo && memo.length > 0) {
                memo += ', ';
            }
            memo += e.domain + ' :: ' + e.message;
            return memo;
        }, '');
    }
    return msg;
}

module.exports.convertToFhir = convertToFhir;
module.exports.getResourceConfig = getResourceConfig;
module.exports.isSortCriteriaValid = isSortCriteriaValid;
