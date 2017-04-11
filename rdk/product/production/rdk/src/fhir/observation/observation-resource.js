'use strict';
//Code was commented out, not removed, for possible reuse at a later date if health factors, aka social-history, are syncd.
var rdk = require('../../core/rdk');
var _ = require('lodash');
var async = require('async');
var nullchecker = rdk.utils.nullchecker;
var fhirUtils = require('../common/utils/fhir-converter');
var vitals = require('./vitals/vitals-resource');
////No-Health-Factors ++
//var healthFactors = require('./health-factors/health-factors');
////No-Health-Factors --
var fhirToJDSSearch = require('../common/utils/fhir-to-jds-search');
var fhirResource = require('../common/entities/fhir-resource');
var observationUtils = require('./observation-utils');
var confUtils = require('../conformance/conformance-utils');
var conformance = require('../conformance/conformance-resource');

var fhirToJDSAttrMap = [{
    fhirName: 'date',
    vprName: '',  //this does not map conventionally - it's 'observed' in vitals, and 'entered' in health factors
    dataType: 'dateTime',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#dateTime',
    description: 'Obtained date/time. The prefixes >, >=, <=, < and != may be used on the parameter value (e.g. date=>2015-01-15). The following date formats are permitted: yyyy-mm-ddThh:mm:ss (exact date search), yyyy-mm-dd (within given day), yyyy-mm (within given month), yyyy (within given year). A single date parameter can be used for an exact date search (e.g. date=2015-01-26T08:30:00) or an implicit range (e.g. date=2015-01, searches all dates in January 2015). Two date parameters can be used to specify an explicitly bounded range. When using a pair of date parameters, the parameters should bind both ends of the range. One should have a less-than operator (<, <=) while the other a greater-than operator (>, >=). ',
    searchable: true
},{
    fhirName: 'code',
    vprName: 'name',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'What action is being ordered - a tokenized value containing a single field, or 2 pipe separated fields called \'system\' and \'code\'.  The system field (left side of pipe) and pipe is optional and may be omitted. If the system field is empty and the pipe is included, it is implied that the field should not exist in the results.  Multiple codes can be specified, by joining with a comma, which signifies an OR clause.  (Valid examples: [code=8310-5] [code=http://loinc.org|8310-5] [code=9279-1,8310-5] [code=http://loinc.org|9279-1,8310-5] [code=http://loinc.org|9279-1,http://loinc.org|8310-5] [code=|8310-5] [code=8310-5,|9279-1])',
    searchable: true
},{
    //this is effectively a searchable attribute, and is added here for conformance.
    fhirName: '_tag',
    vprName: '',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'To specify a specific subset, use either vital-signs or social-history. (social-history is currently not implemented.)' ,
    searchable: true
},{
    fhirName: '_sort',
    vprName: '',
    dataType: 'string',
    definition: 'http://hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Sort criteria. Ascending order by default, order is specified with the following variants:  _sort:asc (ascending), _sort:desc (descending). Supported sort properties: date, identifier, patient, performer, subject, value-quantity.',
    searchable: true
}];
confUtils.addCountAttribute(fhirToJDSAttrMap); //adding the _count attribute that is common to (almost) all endpoints.

// Issue call to Conformance registration
conformance.register(confUtils.domains.OBSERVATION, createObservationConformanceData());

function createObservationConformanceData() {
   var resourceType = confUtils.domains.OBSERVATION;
   var profileReference = 'http://www.hl7.org/FHIR/2015May/observation.html';
   var interactions = [ 'read', 'search-type' ];

   return confUtils.createConformanceData(resourceType, profileReference,
           interactions, fhirToJDSAttrMap);
}

var TAGS = {
    VITALS: 'vital-signs',
    HEALTH_FACTORS: 'social-history'
};

function getResourceConfig() {
    return [{
        name: 'fhir-vitals-observation',
        path: '',
        get: getObservation,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        interceptors: { fhirPid: true },
        requiredPermissions: ['read-fhir'],
        isPatientCentric: true,
        permitResponseFormat: true
    },{
        name: 'fhir-vitals-observation-search',
        path: '_search',
        post: getObservation,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        interceptors: { fhirPid: true },
        requiredPermissions: ['read-fhir'],
        isPatientCentric: true,
        permitResponseFormat: true
    }];
}

function limitFHIRResultByCount(fhirBundle, countStr) {
    if (nullchecker.isNotNullish(countStr)) {
        var count = parseInt(countStr);
        fhirBundle.entry = _.take(fhirBundle.entry, count);
    }
}

/**
 * @api {get} /fhir/patient/{id}/observation Get Observation
 * @apiName getObservation
 * @apiGroup Observation
 * @apiParam {String} id The patient id
 * @apiParam {Number} [_count] The number of results to show.
 * @apiParam {String} [code] a tokenized value containing a single field, or 2 pipe separated fields called 'system' and 'code'.  The system field (left side of pipe) and pipe is optional and may be omitted. If the system field is empty and the pipe is included, it is implied that the field should not exist in the results.  Multiple codes can be specified, by joining with a comma, which signifies an OR clause.  (Valid examples: [code=8310-5] [code=http://loinc.org|8310-5] [code=9279-1,8310-5] [code=http://loinc.org|9279-1,8310-5] [code=http://loinc.org|9279-1,http://loinc.org|8310-5] [code=|8310-5] [code=8310-5,|9279-1] @see http://www.hl7.org/FHIR/2015May/search.html#token
 * @apiParam {String} [date] Obtained date/time. The prefixes >, >=, <=, < and != may be used on the parameter value (e.g. date=>2015-01-15). The following date formats are permitted: yyyy-mm-ddThh:mm:ss (exact date search), yyyy-mm-dd (within given day), yyyy-mm (within given month), yyyy (within given year). A single date parameter can be used for an exact date search (e.g. date=2015-01-26T08:30:00) or an implicit range (e.g. date=2015-01, searches all dates in January 2015). Two date parameters can be used to specify an explicitly bounded range. When using a pair of date parameters, the parameters should bind both ends of the range. One should have a less-than operator (<, <=) while the other a greater-than operator (>, >=). Consult the <a href="http://www.hl7.org/FHIR/2015May/search.html#date">FHIR DSTU2 API</a> documentation for more information.
 * @apiParam {String} [_tag] To specify a specific subset, either vital-signs
 * @apiParam {String} [_sort] Sort criteria. Ascending order by default, order is specified with the following variants:  _sort:asc (ascending), _sort:desc (descending). Supported sort properties: date, identifier, patient, performer, subject, value-quantity.
 * @apiParam {String} [_sort:desc] Descending sort criteria. Order is specified with the following variants:  _sort:asc (ascending), _sort:desc (descending). Supported sort properties: date, identifier, patient, performer, subject, value-quantity.
 * @apiParam {String} [_sort:asc] Ascending sort criteria. Order is specified with the following variants:  _sort:asc (ascending), _sort:desc (descending). Supported sort properties: date, identifier, patient, performer, subject, value-quantity.
 *
 * @apiDescription Converts a vpr \'vitals\' resource into a FHIR \'observation\' resource.
 *
 * @apiExample {js} Request Examples:
 *      // Limiting results count
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?_count=1
 *
 *      // Exact date search
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?date=2015-01-26T13:45:00
 *
 *      // Observations on a day
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?date=2015-01-26
 *
 *      // Observations on a month
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?date=2015-01
 *
 *      // Observations on a year
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?date=2015
 *
 *      // Observations outside a date range (e.g. observations not occuring on January 2015)
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?date=!=2015-01
 *
 *      // Explicit date range
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?date=>=2014-06&date=<=2014-09-20
 *
 *      // Observations of a particular code
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?code=9279-1
 *
 *      // Observations of a particular code and system
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?code=http://loinc.org|9279-1
 *
 *      // Observations sorted by date (sorts by Observation.appliesDateTime)
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?_sort=date
 *
 *      // Observations sorted by identifier (sorts by Observation.identifier.value)
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?_sort=identifier
 *
 *      // Observations sorted by performer (sorts by Observation.performer.display)
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?_sort=performer
 *
 *      // Observations sorted by subject (sorts by Observation.subject.reference)
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?_sort=subject
 *
 *      // Observations sorted by value-quantity (sorts by Observation.valueQuantity.value)
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?_sort=value-quantity
 *
 *      // Observations sorted by value-quantity in descending order
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/observation?_sort:desc=value-quantity
 *
 * @apiSuccess {json} data Json object conforming to the <a href="http://www.hl7.org/FHIR/2015May/observation.html">Observation FHIR DTSU2 specification</a>.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *     "resourceType": "Bundle",
 *     "type": "collection",
 *     "id": "urn:uuid:1e89fe8a-339c-48e3-ba5a-58ee064fb14b",
 *     "link": [
 *         {
 *             "rel": "self",
 *             "href": "http://10.4.4.1/resource/fhir/patient/9E7A;253/observation?date=%3E2015-01-26T01:20:00Z&code=http://loinc.org|8310-5&_count=1"
 *         }
 *     ],
 *     "meta": {
 *         "lastUpdated": "2015-06-18T14:38:50.000+08:00"
 *     },
 *     "entry": [
 *         {
 *             "resource": {
 *                 "resourceType": "Observation",
 *                 "text": {
 *                     "status": "generated",
 *                     "div": "<div>TEMPERATURE 98.2 F</div>"
 *                 },
 *                 "contained": [
 *                     {
 *                         "resourceType": "Organization",
 *                         "_id": "481de831-8896-4331-ab52-c9f7cdc78348",
 *                         "identifier": [
 *                             {
 *                                 "system": "urn:oid:2.16.840.1.113883.6.233",
 *                                 "value": "998"
 *                             }
 *                         ],
 *                         "name": "ABILENE (CAA)"
 *                     }
 *                 ],
 *                 "code": {
 *                     "coding": [
 *                         {
 *                             "system": "urn:oid:2.16.840.1.113883.6.233",
 *                             "code": "urn:va:vuid:4500638",
 *                             "display": "TEMPERATURE"
 *                         },
 *                         {
 *                             "system": "http://loinc.org",
 *                             "code": "8310-5",
 *                             "display": "BODY TEMPERATURE"
 *                         }
 *                     ]
 *                 },
 *                 "valueQuantity": {
 *                     "value": 98.2,
 *                     "units": "F"
 *                 },
 *                 "appliesDateTime": "2015-02-24T22:40:00+08:00",
 *                 "issued": "2015-02-25T15:23:27-08:00",
 *                 "status": "final",
 *                 "reliability": "unknown",
 *                 "identifier": {
 *                     "use": "official",
 *                     "system": "http://vistacore.us/fhir/id/uid",
 *                     "value": "urn:va:vital:9E7A:253:28425"
 *                 },
 *                 "subject": {
 *                     "reference": "Patient/253"
 *                 },
 *                 "performer": [
 *                     {
 *                         "reference": "481de831-8896-4331-ab52-c9f7cdc78348",
 *                         "display": "ABILENE (CAA)"
 *                     }
 *                 ],
 *                 "referenceRange": [
 *                     {
 *                         "low": {
 *                             "value": 95,
 *                             "units": "F"
 *                         },
 *                         "high": {
 *                             "value": 102,
 *                             "units": "F"
 *                         },
 *                         "meaning": {
 *                             "coding": [
 *                                 {
 *                                     "system": "http://snomed.info/id",
 *                                     "code": "87273009",
 *                                     "display": "Normal Temperature"
 *                                 }
 *                             ]
 *                         }
 *                     }
 *                 ]
 *             }
 *         }
 *     ],
 *     "total": 2
 * }
 *
 * @apiError (Error 400) Invalid parameter values.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *      Invalid parameter values.
 * }
 */
function getObservation(req, res) {
    var pid = req.query.pid;
    var params = req.query;

    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_format).send('Missing required parameter: pid');
    }

    validateParams(params, /*onSuccess*/ function() {
        fetchObservations(req, res);
    }, /*onError*/ function(errors) {
        return res.status(rdk.httpstatus.bad_request).send('Invalid parameters:' + fhirToJDSSearch.validationErrorsToString(errors));
    });
}

function processJDSError(logger, pid, error, body, errorTag) {
    var errorMessage;
    if (error) {
        errorMessage = errorTag + 'Error fetching pid=' + pid + ' - ' + (error.message || error);
        logger.error(errorMessage);
        return errorMessage;
    }
    if ('data' in body) {
        return null; // no errors to process
    }
    if ('error' in body) {
        errorMessage = errorTag + body.error.code + ' - ' + getJDSErrorMessage(body.error);
        logger.error(errorMessage);
        return errorMessage;
    }
    errorMessage = errorTag + 'Empty response from JDS';
    logger.error(errorMessage);
    return errorMessage;
}

function fetchObservations(req, res) {
    var pid = req.query.pid;
    var params = req.query;
    var config = req.app.config;
    var logger = req.logger;

    // build list of requests
    var asyncTasks = [];
    if (!params._tag || params._tag === TAGS.VITALS) {
        asyncTasks.push(function(callback) {
            vitals.getVitalsData(config, logger, pid, params, function(error, body) {
                var errorLog = processJDSError(logger, pid, error, body, 'Observation::getVitalsData: ');
                if (errorLog) {
                    return callback(errorLog);
                }
                return callback(null, {
                    fhirItems: vitals.convertToFHIRObservations(body.data.items, req),
                    total: body.data.totalItems
                });
            });
        });
    }
//// No-Health-Factors ++
// NO Health-Factors
//    if (!params._tag || params._tag === TAGS.HEALTH_FACTORS) {
//        asyncTasks.push(function(callback) {
//            healthFactors.getHealthFactors(config, logger, pid, params, function(error, body) {
//                var errorLog = processJDSError(logger, pid, error, body, 'Observation::getHealthFactors: ');
//                if (errorLog) {
//                    return callback(errorLog);
//                }
//                return callback(null, {
//                    fhirItems: healthFactors.convertToFHIRObservations(body.data.items, req),
//                    total: body.data.totalItems
//                });
//            });
//        });
//    }
//// No-Health-Factors --

    // make parallel requests and handle results
    async.parallel(asyncTasks, function(err, fhirResults) {
        if (nullchecker.isNotNullish(err)) {
            return res.status(rdk.httpstatus.internal_server_error).send('There was an error processing your request. The error has been logged.');
        }
        // merge results
        var mergedResults = _.reduce(fhirResults, function(accumulator, item) {
            return {
                fhirItems: accumulator.fhirItems.concat(item.fhirItems),
                total: accumulator.total + item.total
            };
        }, {
            fhirItems: [],
            total: 0
        });

        // sort
        mergedResults.fhirItems = observationUtils.sortBy(mergedResults.fhirItems, params);

        // wrap in FHIR bundle
        var fhirBundle = wrapInFhirBundle(mergedResults.fhirItems, mergedResults.total, req);

        // limit by _count
        limitFHIRResultByCount(fhirBundle, params._count);

        return res.status(rdk.httpstatus.ok).send(fhirBundle);
    });
}

function wrapInFhirBundle(fhirResults, total, req) {
    var link = 'http://' + req._remoteAddress + req.url;

    var fhirResult = new fhirResource.Bundle([new fhirResource.Link(link, 'self')]);

    var now = new Date();

    //Note: Will let current time default to running server TZ.
    fhirResult.meta = {
        'lastUpdated': fhirUtils.convertToFhirDateTime(now)
    };
    fhirResult.entry = fhirResults;
    fhirResult.total = total;

    return fhirResult;
}

function validateParams(params, onSuccess, onError) {
////No-Health-Factors ++
//    if (nullchecker.isNotNullish(params._tag) && !_.includes([TAGS.HEALTH_FACTORS, TAGS.VITALS], params._tag)) {
//      return onError(['Unsupported _tag criteria. Supported attributes are: ' + TAGS.VITALS + ' and ' + TAGS.HEALTH_FACTORS + '.']);
//}
////No-Health-Factors --
    if (nullchecker.isNotNullish(params._tag) && !_.includes([TAGS.VITALS], params._tag)) {
        return onError(['Unsupported _tag criteria. Supported attributes are: ' + TAGS.VITALS + '.']);
    }

    // check common parameters
    return fhirToJDSSearch.validateCommonParams(params, function() {
        // validate date
        fhirToJDSSearch.validateDateParams(params, ['date'], function() {
            if (vitals.isSortCriteriaValid(params)) {
                onSuccess();
            } else {
                onError(['Unsupported _sort criteria. Supported attributes are: date, identifier, patient, performer, subject and value-quantity']);
            }
        }, onError);
        // Future TODO: add validation for code param
    }, onError);
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

module.exports.getResourceConfig = getResourceConfig;
module.exports.getObservation = getObservation;
