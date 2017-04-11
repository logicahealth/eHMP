'use strict';
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var async = require('async');
var labResults = require('./lab-result-resource');
var radReports = require('./radiology-report-resource');
var fhirResource = require('../common/entities/fhir-resource');
var errors = require('../common/errors');
var fhirToJDSSearch = require('../common/utils/fhir-to-jds-search');
var diagnosticReportSortUtils = require('./diagnostic-report-sort-utils');
var constants = require('../common/utils/constants');
var jds = require('../common/utils/jds-query-helper');

//TO DO:
// As JSON.parse and JSON.stringify work in a blocking manner perhaps we should switch to a streaming parser as this one:
// https://github.com/dominictarr/JSONStream

//The stopAggregating flag is used in conjunction with the _count paramenter.  It is a signal to stop bundling additional results while still incrementing the result count total.
var stopAggregating;
var fhirToJDSSortMap = diagnosticReportSortUtils.getFhirToJDSMap();

var domains = {
    'lab': 'laboratory',
    'rad': 'imaging',
    'ap': 'accession'
};

var labCategoryPrefix = 'urn:va:lab-category:';

var laboratoryServiceCategories = ['LAB', 'CH', 'MB'];
var imagingServiceCategories = ['RAD'];
var accessionServiceCategories = ['LAB', 'OTH', 'SP', 'CP', 'AP'];

function getResourceConfig() {
    return [{
        name: 'diagnosticreport-diagnosticreport',
        path: '',
        get: getDiagnosticReports,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        requiredPermissions: [],
        isPatientCentric: true,
        interceptors: {
            fhirPid: true,
            validatePid: false
        },
        permitResponseFormat: true
    }];
}

function validateParams(params, onSuccess, onError) {
    stopAggregating = false;
    // check common parameters
    fhirToJDSSearch.validateCommonParams(params, function() {
        // validate date
        fhirToJDSSearch.validateDateParams(params, ['date'], function() {
            if (fhirToJDSSearch.isSortCriteriaValid(params, fhirToJDSSortMap)) {
                onSuccess();
            } else {
                onError(['Unsupported _sort criteria. Supported attributes are: date, identifier, issued, performer, result, specimen and status']);
            }
        }, onError);
        // TODO: add validation for code param
    }, onError);
}

/**
 * @api {get} /fhir/patient/{id}/diagnosticreport Get Diagnostic Reports
 * @apiName getDiagnosticReport
 * @apiGroup Diagnostic Report
 * @apiParam {String} [domain] The domain to filter on.  Choices include: lab', rad, ap
 * @apiParam {String} [service] The diagnostic discipline/department which created the report
 * @apiParam {Number} [_count] The number of results to show.
 * @apiParam {String} [date] Obtained date/time. The prefixes >, >=, <=, < and != may be used on the parameter value (e.g. date=>2015-01-15). The following date formats are permitted: yyyy-mm-ddThh:mm:ss (exact date search), yyyy-mm-dd (within given day), yyyy-mm (within given month), yyyy (within given year). A single date parameter can be used for an exact date search (e.g. date=2015-01-26T08:30:00) or an implicit range (e.g. date=2015-01, searches all dates in January 2015). Two date parameters can be used to specify an explicitly bounded range. When using a pair of date parameters, the parameters should bind both ends of the range. One should have a less-than operator (<, <=) while the other a greater-than operator (>, >=). Consult the <a href="http://www.hl7.org/FHIR/2015May/search.html#date">FHIR DSTU2 API</a> documentation for more information.
 * @apiParam {String} [_sort] Sort criteria. Ascending order by default, order is specified with the following variants:  _sort:asc (ascending), _sort:dsc (descending). Supported sort properties: date, identifier, issued, performer, result, service, specimen, status.
 *
 * @apiDescription Converts vpr \'labratory,\' \'imaging\' and \'accession\' resources into a FHIR \'diagnosticreport\' resource.
 *
 * @apiExample {js} Request Examples:
 *      // DiagnosticReport limiting results count
 *      http://IP           /resource/fhir/patient/9E7A;253/diagnosticreport?_count=1
 *
 *      // DiagnosticReport exact date search
 *      http://IP           /resource/fhir/patient/9E7A;253/diagnosticreport?date=2015-01-26T13:45:00
 *
 *      // DiagnosticReport on a day
 *      http://IP           /resource/fhir/patient/9E7A;253/diagnosticreport?date=2015-01-26
 *
 *      // DiagnosticReport on a month
 *      http://IP           /resource/fhir/patient/9E7A;253/diagnosticreport?date=2015-01
 *
 *      // DiagnosticReport on a year
 *      http://IP           /resource/fhir/patient/9E7A;253/diagnosticreport?date=2015
 *
 *      // DiagnosticReport outside a date range (e.g. DiagnosticReports not occuring on January 2015)
 *      http://IP           /resource/fhir/patient/9E7A;253/diagnosticreport?date=!=2015-01
 *
 *      // DiagnosticReport Explicit date range
 *      http://IP           /resource/fhir/patient/9E7A;253/diagnosticreport?date=>=2014-06&date=<=2014-09-20
 *
 *      // DiagnosticReport sorted by date (sorts by DiagnosticReport.appliesDateTime)
 *      http://IP           /resource/fhir/patient/9E7A;253/diagnosticreport?_sort=date
 *
 *      // DiagnosticReport sorted by date in descending order
 *      http://IP           /resource/fhir/patient/9E7A;253/diagnosticreport?_sort:dsc=date
 *
 *      // DiagnosticReport sorted by performer (sorts by DiagnosticReport.performer.display)
 *      http://IP           /resource/fhir/patient/9E7A;253/diagnosticreport?_sort=performer
 *
 * @apiSuccess {json} data Json object conforming to the <a href="http://www.hl7.org/FHIR/2015May/diagnosticreport.html">DiagnosticReport FHIR DTSU2 specification</a>.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 *{
 *  "resourceType": "Bundle",
 *  "type": "collection",
 *  "id": "ccbd2fd7-486a-41a8-f08e-ef53e5a00689",
 *  "link": [
 *    {
 *      "relation": "self",
 *      "url": "http://localhost:8888/resource/fhir/patient/9E7A;253/diagnosticreport?domain=lab&_count=1&date=2010&_sort=date"
 *    }
 *  ],
 *  "total": 18,
 *  "entry": [
 *    {
 *      "resource": {
 *        "resourceType": "DiagnosticReport",
 *        "name": {
 *          "text": "POTASSIUM",
 *          "coding": [
 *            {
 *              "system": "urn:oid:2.16.840.1.113883.4.642.2.58",
 *              "code": "urn:va:ien:60:177:72",
 *              "display": "POTASSIUM"
 *            }
 *          ]
 *        },
 *        "status": "final",
 *        "issued": "2010-03-23T11:04:00+08:00",
 *        "subject": {
 *          "reference": "Patient/9E7A;253"
 *        },
 *        "performer": {
 *          "reference": "#737894fd-760e-4ac4-b304-1fbcfefd7674",
 *          "display": "ALBANY VA MEDICAL CENTER"
 *        },
 *        "contained": [
 *          {
 *            "resourceType": "Organization",
 *            "id": "737894fd-760e-4ac4-b304-1fbcfefd7674",
 *            "identifier": [
 *              {
 *                "type": {
 *                  "text": "facility-code"
 *                },
 *                "value": "500"
 *              }
 *            ],
 *            "name": "ALBANY VA MEDICAL CENTER",
 *            "address": [
 *              {
 *                "text": "VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097",
 *                "state": "NY",
 *                "city": "ALBANY",
 *                "line": [
 *                  "ALBANY VA MEDICAL CENTER",
 *                  "VA MEDICAL CENTER 1 3RD sT."
 *                ],
 *                "postalCode": "12180-0097"
 *              }
 *            ],
 *            "text": {
 *              "status": "generated",
 *              "div": "<div>ALBANY VA MEDICAL CENTER<br/>VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097</div>"
 *            }
 *          },
 *          {
 *            "resourceType": "Specimen",
 *            "id": "6ec1bec2-c167-41b3-e905-34267c92dd3b",
 *            "type": {
 *              "text": "SERUM"
 *            },
 *            "subject": {
 *              "reference": "Patient/9E7A;253"
 *            },
 *            "collection": {
 *              "collectedDateTime": "2010-03-05T09:00:00+08:00"
 *            }
 *          },
 *          {
 *            "resourceType": "Observation",
 *            "id": "fd352966-8eb4-4be3-dc4b-3849b06c4152",
 *            "code": {
 *              "text": "POTASSIUM",
 *              "coding": [
 *                {
 *                  "system": "urn:oid:2.16.840.1.113883.4.642.2.58",
 *                  "code": "urn:va:ien:60:177:72",
 *                  "display": "POTASSIUM"
 *                }
 *              ]
 *            },
 *            "status": "final",
 *            "valueQuantity": {
 *              "value": 4.1,
 *              "units": "meq/L"
 *            },
 *            "reliability": "ok",
 *            "specimen": {
 *              "reference": "#6ec1bec2-c167-41b3-e905-34267c92dd3b",
 *              "display": "SERUM"
 *            },
 *            "referenceRange": [
 *              {
 *                "high": {
 *                  "value": 5.3,
 *                  "units": "meq/L"
 *                },
 *                "low": {
 *                  "value": 3.8,
 *                  "units": "meq/L"
 *                }
 *              }
 *            ]
 *          }
 *        ],
 *        "identifier": [
 *          {
 *            "system": "urn:oid:2.16.840.1.113883.6.233",
 *            "value": "urn:va:lab:9E7A:253:CH;6899693.909999;6"
 *          }
 *        ],
 *        "serviceCategory": {
 *          "text": "Chemistry",
 *          "coding": [
 *            {
 *              "system": "http://hl7.org/fhir/v2/0074",
 *              "code": "CH",
 *              "display": "Chemistry"
 *            }
 *          ]
 *        },
 *        "diagnosticDateTime": "2010-03-05T09:00:00+08:00",
 *        "specimen": [
 *          {
 *            "reference": "#6ec1bec2-c167-41b3-e905-34267c92dd3b",
 *            "display": "SERUM"
 *          }
 *        ],
 *        "extension": [
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#abnormal",
 *            "valueBoolean": false
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#categoryCode",
 *            "valueString": "urn:va:lab-category:CH"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#categoryName",
 *            "valueString": "Laboratory"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#displayName",
 *            "valueString": "K"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#displayOrder",
 *            "valueDecimal": 1.2
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#facilityCode",
 *            "valueString": "500"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#groupName",
 *            "valueString": "CH 0323 425"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#groupUid",
 *            "valueString": "urn:va:accession:9E7A:253:CH;6899693.909999"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#high",
 *            "valueString": "5.3"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#kind",
 *            "valueString": "Laboratory"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#localId",
 *            "valueString": "CH;6899693.909999;6"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#micro",
 *            "valueBoolean": false
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#pid",
 *            "valueString": "9E7A;253"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#qualifiedName",
 *            "valueString": "POTASSIUM (SERUM)"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#result",
 *            "valueString": "4.1"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#specimen",
 *            "valueString": "SERUM"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#stampTime",
 *            "valueString": "20100323110400"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#statusCode",
 *            "valueString": "urn:va:lab-status:completed"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#summary",
 *            "valueString": "POTASSIUM (SERUM) 4.1 meq/L"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#typeId",
 *            "valueInteger": 177
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#units",
 *            "valueString": "meq/L"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#lastUpdateTime",
 *            "valueString": "20100323110400"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#low",
 *            "valueString": "3.8"
 *          },
 *          {
 *            "url": "http://vistacore.us/fhir/extensions/lab#lnccodes[0]",
 *            "valueString": "urn:va:ien:60:177:72"
 *          }
 *        ],
 *        "result": [
 *          {
 *            "reference": "#fd352966-8eb4-4be3-dc4b-3849b06c4152",
 *            "display": "POTASSIUM"
 *          }
 *        ],
 *        "text": {
 *          "status": "generated",
 *          "div": "<div>Collected: 2010-03-05T09:00:00<br/>Report Released: 2010-03-23T11:04:00<br/>Accession: urn:va:accession:9E7A:253:CH;6899693.909999<br/>Test: POTASSIUM<br/>Result: 4.1 meq/L<br/>Low: 3.8 meq/L<br/>High: 5.3 meq/L<br/>Specimen: SERUM<br/>Performing Lab: ALBANY VA MEDICAL CENTER<br/>\t\tundefined<br/>\t\tundefined<br/></div>"
 *        }
 *      }
 *    }
 *  ]
 *}
 *
 * @apiError (Error 400) Invalid parameter values.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *      Invalid parameter values.
 * }
 */
function getDiagnosticReports(req, res) {
    var pid = req.query.pid;
    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_format).send('Missing required parameter: pid');
    }
    //lab & radiology are expecting this value in _pid, assign it here as a safety check
    req._pid = pid;

    var domain = req.param('domain');
    var service = req.param('service');
    var serviceCategories = [];
    var params = req.query;
    if (nullchecker.isNullish(service)) {
        if (nullchecker.isNotNullish(domain)) {
            serviceCategories.push(domain.toUpperCase());
        } else {
            serviceCategories = serviceCategories.concat(laboratoryServiceCategories);
            serviceCategories = serviceCategories.concat(imagingServiceCategories);
            serviceCategories = serviceCategories.concat(accessionServiceCategories);
        }
    } else {
        serviceCategories = serviceCategories.concat(service.toUpperCase().split(','));
    }

    validateParams(params, function() {
        getDiagnosticReportsImpl(pid, req, res, params, serviceCategories);
    }, function(errors) {
        return res.status(rdk.httpstatus.bad_request).send('Invalid parameters:' + fhirToJDSSearch.validationErrorsToString(errors));
    });
}

function getDiagnosticReportsImpl(pid, req, res, params, serviceCategories) {
    var count = req.param('_count');

    var asyncTasks = [];
    asyncTasks.push(function(callback) {
        callback(null, {
            results: [],
            totalItems: 0
        });
    });

    // laboratory
    if (nullchecker.isNullish(serviceCategories) || (nullchecker.isNotNullish(serviceCategories) && _.intersection(laboratoryServiceCategories, serviceCategories).length > 0)) {
        var labCategoryCodes = [];
        var intersectionLaboratory = [];
        if (nullchecker.isNotNullish(serviceCategories)) {
            intersectionLaboratory = _.intersection(laboratoryServiceCategories, serviceCategories);
        }
        if (!_.contains(intersectionLaboratory, 'LAB')) {
            for (var labCC in labResults.categoryMap) {
                if (_.contains(intersectionLaboratory, labResults.categoryMap[labCC].code)) {
                    labCategoryCodes.push(labCategoryPrefix + labCC);
                }
            }
        }
        asyncTasks.push(function(accumulator, callback) {
            var limitRemainder = count;
            if (nullchecker.isNotNullish(count) && accumulator && accumulator.results && accumulator.results.length) {
                limitRemainder -= accumulator.results.length;
            }
            if (limitRemainder === 0) {
                stopAggregating = true;
            }
            getVprData(pid, req, domains.lab, labCategoryCodes, limitRemainder, params, function(err, inputJSON) {
                var error = null;
                var result = null;

                if (err instanceof errors.ParamError) {
                    error = {
                        code: rdk.httpstatus.bad_request,
                        message: err.message
                    };
                } else if (err instanceof errors.NotFoundError) {
                    error = {
                        code: rdk.httpstatus.not_found,
                        message: err.error
                    };
                } else if (err instanceof errors.FetchError) {
                    req.logger.error(err.message);
                    error = {
                        code: rdk.httpstatus.internal_server_error,
                        message: 'There was an error processing your request. The error has been logged.'
                    };
                } else if (err) {
                    error = {
                        code: rdk.httpstatus.internal_server_error,
                        message: err.message
                    };
                } else {
                    result = labResults.convertToFhir(inputJSON, req);
                    if(!stopAggregating){
                        accumulator.results = accumulator.results.concat(result);
                    }
                    accumulator.totalItems += inputJSON.data.totalItems;
                }

                callback(error, accumulator); //call final callback

            });
        });
    }
    // accession
    if (nullchecker.isNullish(serviceCategories) || (nullchecker.isNotNullish(serviceCategories) && _.intersection(accessionServiceCategories, serviceCategories).length > 0)) {
        var apCategoryCodes = [];
        var intersectionAccession = [];
        if (nullchecker.isNotNullish(serviceCategories)) {
            intersectionAccession = _.intersection(accessionServiceCategories, serviceCategories);
        }
        if (_.intersection(intersectionAccession, ['LAB', 'AP']).length === 0) {
            for (var apCC in labResults.categoryMap) {
                if (_.contains(intersectionAccession, labResults.categoryMap[apCC].code)) {
                    apCategoryCodes.push(labCategoryPrefix + apCC);
                }
            }
        }
        asyncTasks.push(function(accumulator, callback) {
            var limitRemainder = count;
            if (nullchecker.isNotNullish(count) && accumulator && accumulator.results && accumulator.results.length) {
                limitRemainder -= accumulator.results.length;
            }
            if (limitRemainder === 0) {
                stopAggregating = true;
            }
            getVprData(pid, req, domains.ap, apCategoryCodes, limitRemainder, params, function(err, inputJSON) {
                var error = null;
                var result = null;

                if (err instanceof errors.ParamError) {
                    error = {
                        code: rdk.httpstatus.bad_request,
                        message: err.message
                    };
                } else if (err instanceof errors.NotFoundError) {
                    error = {
                        code: rdk.httpstatus.not_found,
                        message: err.error
                    };
                } else if (err instanceof errors.FetchError) {
                    req.logger.error(err.message);
                    error = {
                        code: rdk.httpstatus.internal_server_error,
                        message: 'There was an error processing your request. The error has been logged.'
                    };
                } else if (err) {
                    error = {
                        code: rdk.httpstatus.internal_server_error,
                        message: err.message
                    };
                } else {
                    result = labResults.convertToFhir(inputJSON, req);
                    if(!stopAggregating){
                        accumulator.results = accumulator.results.concat(result);
                    }
                    accumulator.totalItems += inputJSON.data.totalItems;
                }

                callback(error, accumulator); //call final callback

            });
        });
    }
    // imaging
    if (nullchecker.isNullish(serviceCategories) || (nullchecker.isNotNullish(serviceCategories) && _.intersection(imagingServiceCategories, serviceCategories).length > 0)) {
        var radCategoryCodes = [];
        asyncTasks.push(function(accumulator, callback) {
            var limitRemainder = count;
            if (nullchecker.isNotNullish(count) && accumulator && accumulator.results && accumulator.results.length) {
                limitRemainder -= accumulator.results.length;
            }
            if (limitRemainder === 0) {
                stopAggregating = true;
            }
            getVprData(pid, req, domains.rad, radCategoryCodes, limitRemainder, params, function(err, inputJSON) {
                var error = null;
                var result = null;

                if (err instanceof errors.ParamError) {
                    error = {
                        code: rdk.httpstatus.bad_request,
                        message: err.message
                    };
                } else if (err instanceof errors.NotFoundError) {
                    error = {
                        code: rdk.httpstatus.not_found,
                        message: err.error
                    };
                } else if (err instanceof errors.FetchError) {
                    req.logger.error(err.message);
                    error = {
                        code: rdk.httpstatus.internal_server_error,
                        message: 'There was an error processing your request. The error has been logged.'
                    };
                } else if (err) {
                    error = {
                        code: rdk.httpstatus.internal_server_error,
                        message: err.message
                    };
                } else {
                    result = radReports.convertToFhir(inputJSON, req);
                    if(!stopAggregating){
                        accumulator.results = accumulator.results.concat(result);
                    }
                    accumulator.totalItems += inputJSON.data.totalItems;
                }

                callback(error, accumulator); //call final callback

            });
        });
    }

    async.waterfall(asyncTasks, function(err, accumulator) { //final callback
        if (nullchecker.isNotNullish(err)) {
            res.status(err.code).send(err.message);
        } else {
            var bundle = buildBundle(accumulator.results, req, accumulator.totalItems);
            res.status(200).send(bundle);
        }
    });
}

function buildBundle(results, req, total) {
    // var b = new fhirResource.Bundle2();
    var entry = [];
    var link = [];

    if (req) {
        link.push(new fhirResource.Link(req.protocol + '://' + req.headers.host + req.originalUrl, 'self'));
    }
    for (var i = 0; i < results.length; i++) {
        if (nullchecker.isNotNullish(results[i])) {
            var e = new fhirResource.Entry(results[i]);
            // This IS on the DSTU2 spec but the HAPI validation tool complains about it. We're not adding any meaninful
            // information on the link so it is safe to be commented out for the moment.
            //e.link = [new fhirResource.Link(req.protocol + '://' + req.headers.host + '/fhir/diagnosticreport/' + (e.resource._id || e.resource.id || '@null'), 'self')];
            entry.push(e);
        }
    }

    //DiagnosticReport is an aggregate of multiple reports, its results must be sorted after all VPR calls
    entry = diagnosticReportSortUtils.sortEntries(req, entry);
    return (new fhirResource.Bundle2(link, entry, total));
}

/**
 * Builds the corresponding JDS query for the FHIR DiagnosticReport.name search token query.
 *
 * The name query is of type token. It supports a comma delimited list of code token queries. Each
 * token can include a code or a system AND code query separated by a '|'.
 *
 * Ex.  name=myCode,anotherCode,mySystem|myOtherCode,...
 */
function buildNameCodeQuery(name) {
    var queries = [];
    // FHIR supports escaped commas (\,). We replace non-escaped commas with a
    // unused unicode character to perform the split .
    var tokens = name.replace(/([^\\]),/g, '$1\u000B').split('\u000B');

    _.forEach(tokens, function(token) {
        // unescape any commas
        token = token.replace(/\\,/g, ',');
        var code;
        var system;
        var codeSystemSplit = token.split('|');

        if (codeSystemSplit.length > 1) {
            system = codeSystemSplit[0];
            code = codeSystemSplit[1];

        } else {
            code = codeSystemSplit[0];
        }

        if (nullchecker.isNotNullish(system)) {
            // ** System & Code **

            // LAB_RESULTS_UID_IDENTIFIER_SYSTEM and DIAGNOSTIC_REPORTS_SYSTEM hold currently the same value
            // but that doesn't have to be always the case. We don't use if-elseif for that reason.
            if (system === constants.labResultsFhir.LAB_RESULTS_UID_IDENTIFIER_SYSTEM || system === constants.labResultsFhir.DIAGNOSTIC_REPORTS_SYSTEM) {
                // LAB_RESULTS_UID_IDENTIFIER_SYSTEM does not exist in VPR, FHIR mapping associates the code with VPR record's vuid
                queries.push(jds.eq('vuid', '\"' + code + '\"'));
                // DIAGNOSTIC_REPORTS_SYSTEM does not exist in VPR, FHIR mapping associates the code with VPR record's typeCode
                queries.push(jds.eq('typeCode', '\"' + code + '\"'));
                // FHIR mapping associates the display value for these systems to VPR record's typeName
                queries.push(jds.eq('typeName', '\"' + code + '\"'));
            } else {
                // all other system|code query combinations can only be mapped to the VPR codes array
                queries.push(jds.and(jds.eq('\"codes[].system\"', system), jds.or(jds.eq('\"codes[].code\"', '\"' + code + '\"'), jds.eq('\"codes[].display\"', '\"' + code + '\"'))));
            }
        } else if (code === constants.labResultsFhir.PATHOLOGY_REPORT_NAME) {
            // ** LR ANATOMIC PATHOLOGY REPORT **
            // FHIR mapping sets this name for items with categoryCode that ends with AP, so if searching for this string
            // we should search for items with categoryCode that ends in AP.
            queries.push(jds.like('categoryCode', '%AP'));
        } else {
            // ** Code **
            var searchProps = ['typeName', 'typeCode', '\"results[].localTitle\"', 'vuid', '\"codes[].code\"', '\"codes[].display\"'];
            var codeQueries = _.map(searchProps, function(prop) {
                return jds.eq(prop, '\"' + code + '\"');
            });
            queries.push(jds.or(codeQueries));
        }
    });
    // combine all token queries into OR expressions
    return jds.or(queries);
}

function buildSearchQuery(params, categoryCodes) {
    var query = [];
    var dateQuery;
    var nameQuery;

    // categories
    if (!_.isEmpty(categoryCodes)) {
        query.push('in(categoryCode,[' + categoryCodes.join(',') + '])');
    }
    // name (system & code)
    if (nullchecker.isNotNullish(params.name)) {
        nameQuery = buildNameCodeQuery(params.name);
        if (nameQuery) {
            query.push(nameQuery);
        }
    }
    // date
    if (nullchecker.isNotNullish(params.date)) {
        dateQuery = fhirToJDSSearch.buildDateQuery(params.date, 'observed');
        if (dateQuery) {
            query.push(dateQuery);
        }
    }
    return fhirToJDSSearch.buildSearchQueryString(query);
}

function buildJDSPath(pid, params, domain, categoryCodes) {
    var basePath = '/vpr/' + pid + '/index/' + domain;
    var searchQuery = buildSearchQuery(params, categoryCodes);
    return fhirToJDSSearch.buildJDSPath(basePath, searchQuery, params, fhirToJDSSortMap);
}

function getVprData(pid, req, domain, categoryCodes, count, params, callback) {

    var config = req.app.config;

    if (nullchecker.isNullish(pid)) {
        return callback(new errors.ParamError('subject.identifier'));
    }

    var jdsPath = buildJDSPath(pid, params, domain, categoryCodes);
    var options = _.extend({}, config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    rdk.utils.http.get(options, function(error, response, obj) {
        req.logger.debug('callback from fetch()');
        if (error) {
            return callback(new errors.FetchError('Error fetching pid=' + pid + ' - ' + (error.message || error), error));
        }
        if ('data' in obj) {
            return callback(null, obj);
        }
        if ('error' in obj) {
            if (errors.isNotFound(obj)) {
                return callback(new errors.NotFoundError('Object not found', obj));
            }
            return callback(new errors.FetchError('There was an error processing your request. The error has been logged.', obj.error));
        }
        return callback(new errors.FetchError('There was an error processing your request. The error has been logged.'));
    });
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.buildBundle = buildBundle;
module.exports.validateParams = validateParams;
module.exports.buildJDSPath = buildJDSPath;
