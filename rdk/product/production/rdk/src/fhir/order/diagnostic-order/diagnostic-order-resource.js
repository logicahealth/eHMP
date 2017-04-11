'use strict';
var rdk = require('../../../core/rdk');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var fhirToJDSSearch = require('../../common/utils/fhir-to-jds-search');
var diagnosticOrder = require('./diagnostic-order');
var conformanceUtils = require('../../conformance/conformance-utils');
var conformance = require('../../conformance/conformance-resource');

var fhirToJDSAttrMap = [{
    fhirName: 'subject.identifier',
    vprName: 'pid',
    dataType: 'string',
    definition: 'http://hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Patient indentifier - note that this patient identifier will overrule any patient identifier that is in the URI of this endpoint.',
    searchable: true
},{
    fhirName: 'pid',
    vprName: 'pid',
    dataType: 'string',
    definition: 'http://hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Patient indentifier - note that this patient identifier will overrule any patient identifier that has been specified in the URI of this endpoint as well as the subject.identifier on the query string.',
    searchable: true
},{
    fhirName: 'event-date',
    vprName: 'entered',
    dataType: 'date',
    definition: 'http://hl7.org/fhir/2015MAY/datatypes.html#date',
    description: 'The date at which the event happened.',
    searchable: true
},{
    fhirName: 'code',
    vprName: 'item[].code.coding[].code',
    dataType: 'string',
    definition: 'http://hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Code to indicate the item (test or panel) being ordered.',
    searchable: true
}];
conformanceUtils.addCountAttribute(fhirToJDSAttrMap); //adding the _count attribute that is common to (almost) all endpoints.

// Issue call to Conformance registration
conformance.register(conformanceUtils.domains.DIAGNOSTIC_ORDER, createDiagnosticOrderConformanceData());

function createDiagnosticOrderConformanceData() {
   var resourceType = conformanceUtils.domains.DIAGNOSTIC_ORDER;
   var profileReference = 'http://hl7.org/fhir/2015MAY/diagnosticorder.html';
   var interactions = [ 'read', 'search-type' ];

   return conformanceUtils.createConformanceData(resourceType, profileReference,
           interactions, fhirToJDSAttrMap);
}

function getResourceConfig() {
    return [{
        name: 'fhir-order-diagnostic-order',
        path: '',
        get: getDiagnosticOrder,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        interceptors: { fhirPid: true, validatePid: false },
        requiredPermissions: ['read-fhir'],
        isPatientCentric: true,
        permitResponseFormat: true
    },{
        name: 'fhir-order-diagnostic-order-search',
        path: '_search',
        post: getDiagnosticOrder,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        interceptors: { fhirPid: true, validatePid: false },
        requiredPermissions: ['read-fhir'],
        isPatientCentric: true,
        permitResponseFormat: true
    }];
}

/**
 * @api {get} /fhir/patient/{id}/diagnosticorder Get Diagnostic Order
 * @apiName getDiagnosticOrder
 * @apiGroup Diagnostic Order
 * @apiParam {String} id The patient id
 * @apiParam {Number} [_count] The number of results to show.
 *
 * @apiDescription Converts a vpr call for radiology and laboratory orders into a FHIR \'DiagnosticOrder\' resource.
 *
 * @apiExample {js} Request Examples:
 *      // Limiting results count
 *      http://10.4.4.1:8888/resource/fhir/patient/9E7A;253/diagnosticorder?_count=1
 *
 * @apiSuccess {json} data JSON object conforming to the <a href="http://www.hl7.org/FHIR/2015May/diagnosticorder.html">Diagnostic Order FHIR DTSU2 specification</a>.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *     "resourceType": "Bundle",
 *     "type": "collection",
 *     "id": "bd2860db-0439-4cf3-8e50-02d6a0776dba",
 *     "link": [
 *         {
 *             "relation": "self",
 *             "url": "http://localhost:8888/resource/fhir/patient/9E7A;253/diagnosticorder?_count=1"
 *         }
 *     ],
 *     "total": 489,
 *     "entry": [
 *         {
 *             "resource": {
 *                 "resourceType": "DiagnosticOrder",
 *                 "id": "46f20ac5-9902-4207-e1c4-ab9fb8135796",
 *                 "subject": {
 *                     "reference": "Patient/9E7A;253"
 *                 },
 *                 "item": [
 *                     {
 *                         "code": {
 *                             "coding": [
 *                                 {
 *                                     "system": "urn:oid:2.16.840.1.113883.6.233",
 *                                     "code": "urn:va:oi:1339",
 *                                     "display": "24 HR URINE CALCIUM",
 *                                     "extension": [
 *                                         {
 *                                             "url": "http://vistacore.us/fhir/extensions/diagnosticorder#oiPackageRef",
 *                                             "valueString": "5083;99LRT"
 *                                         }
 *                                     ]
 *                                 }
 *                             ]
 *                         }
 *                     }
 *                 ],
 *                 "text": {
 *                     "status": "generated",
 *                     "div": "<div>24 HR URINE CALCIUM</div>"
 *                 },
 *                 "contained": [
 *                     {
 *                         "resourceType": "Practitioner",
 *                         "id": "95574865-0d28-469c-a90b-bb70ef1a7c86",
 *                         "text": {
 *                             "status": "generated",
 *                             "div": "<div>Programmer,One</div>"
 *                         },
 *                         "name": {
 *                             "family": [
 *                                 "PROGRAMMER"
 *                             ],
 *                             "given": [
 *                                 "ONE"
 *                             ]
 *                         },
 *                         "identifier": [
 *                             {
 *                                 "system": "http://vistacore.us/fhir/id/uid",
 *                                 "value": "urn:va:user:9E7A:1"
 *                             }
 *                         ]
 *                     },
 *                     {
 *                         "resourceType": "Practitioner",
 *                         "id": "556db0e1-73bb-41a8-ea6d-2a9b64bbd1bb",
 *                         "text": {
 *                             "status": "generated",
 *                             "div": "<div>PROGRAMMER,ONE</div>"
 *                         },
 *                         "name": {
 *                             "family": [
 *                                 "PROGRAMMER"
 *                             ],
 *                             "given": [
 *                                 "ONE"
 *                             ]
 *                         },
 *                         "identifier": [
 *                             {
 *                                 "system": "http://vistacore.us/fhir/id/uid",
 *                                 "value": "urn:va:user:9E7A:1"
 *                             }
 *                         ],
 *                         "extension": [
 *                             {
 *                                 "url": "http://vistacore.us/fhir/extensions/diagnosticorder#role",
 *                                 "valueString": "S"
 *                             },
 *                             {
 *                                 "url": "http://vistacore.us/fhir/extensions/diagnosticorder#signedDateTime",
 *                                 "valueString": 201408111839
 *                             }
 *                         ]
 *                     },
 *                     {
 *                         "resourceType": "Organization",
 *                         "id": "81808f2a-11ae-4868-bc0d-e9b21bf96c57",
 *                         "text": {
 *                             "status": "generated",
 *                             "div": "<div>ABILENE (CAA)</div>"
 *                         },
 *                         "identifier": [
 *                             {
 *                                 "system": "http://vistacore.us/fhir/id/uid",
 *                                 "value": "998"
 *                             }
 *                         ]
 *                     },
 *                     {
 *                         "resourceType": "Location",
 *                         "id": "7a65dc6a-3583-4eb1-ca38-0699e1f8f6cb",
 *                         "text": {
 *                             "status": "generated",
 *                             "div": "<div>PRIMARY CARE</div>"
 *                         },
 *                         "identifier": [
 *                             {
 *                                 "system": "http://vistacore.us/fhir/id/uid",
 *                                 "value": "urn:va:location:9E7A:32"
 *                             }
 *                         ]
 *                     }
 *                 ],
 *                 "orderer": {
 *                     "reference": "#95574865-0d28-469c-a90b-bb70ef1a7c86"
 *                 },
 *                 "identifier": [
 *                     {
 *                         "system": "urn:oid:2.16.840.1.113883.6.233",
 *                         "value": "urn:va:order:9E7A:253:38017"
 *                     }
 *                 ],
 *                 "event": [
 *                     {
 *                         "description": "24 HR URINE CALCIUM Container C 24 HR URINE SP LB #18362\\\r\\\n",
 *                         "dateTime": "2014-08-11T18:39:00+08:00"
 *                     }
 *                 ],
 *                 "extension": [
 *                     {
 *                         "url": "http://vistacore.us/fhir/extensions/diagnosticorder#kind",
 *                         "valueString": "Laboratory"
 *                     },
 *                     {
 *                         "url": "http://vistacore.us/fhir/extensions/diagnosticorder#lastUpdateTime",
 *                         "valueString": "20140811183900"
 *                     },
 *                     {
 *                         "url": "http://vistacore.us/fhir/extensions/diagnosticorder#localId",
 *                         "valueString": "38017"
 *                     },
 *                     {
 *                         "url": "http://vistacore.us/fhir/extensions/diagnosticorder#service",
 *                         "valueString": "LR"
 *                     },
 *                     {
 *                         "url": "http://vistacore.us/fhir/extensions/diagnosticorder#stampTime",
 *                         "valueString": "20140811183900"
 *                     },
 *                     {
 *                         "url": "http://vistacore.us/fhir/extensions/diagnosticorder#statusCode",
 *                         "valueString": "urn:va:order-status:pend"
 *                     },
 *                     {
 *                         "url": "http://vistacore.us/fhir/extensions/diagnosticorder#statusVuid",
 *                         "valueString": "urn:va:vuid:4501114"
 *                     },
 *                     {
 *                         "url": "http://vistacore.us/fhir/extensions/diagnosticorder#displayGroup",
 *                         "valueString": "CH"
 *                     },
 *                     {
 *                         "url": "http://vistacore.us/fhir/extensions/diagnosticorder#start",
 *                         "valueString": "20140811"
 *                     },
 *                     {
 *                         "url": "http://vistacore.us/fhir/extensions/diagnosticorder#name",
 *                         "valueString": "24 HR URINE CALCIUM"
 *                     }
 *                 ]
 *             }
 *         }
 *     ]
 * }
 *
 * @apiError (Error 400) Invalid parameter values.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *      Invalid parameter values.
 * }
 */
function getDiagnosticOrder(req, res) {
    var pid = req.query.pid;
    var params = req.query;

    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_format).send('Missing required parameter: pid');
    }

    validateParams(params, /*onSuccess*/ function() {
        diagnosticOrder.getData(req.app.config, req.logger, pid, params, function(err, inputJSON) {
            if (nullchecker.isNotNullish(err)) {
                res.status(err.code).send(err.message);
            } else {
                var fhirBundle = diagnosticOrder.convertToFhir(inputJSON, req);
                limitFHIRResultByCount(fhirBundle, params._count);
                res.status(rdk.httpstatus.ok).send(fhirBundle);
            }
        });
    }, /*onError*/ function(errors) {
        return res.status(rdk.httpstatus.bad_request).send('Invalid parameters:' + fhirToJDSSearch.validationErrorsToString(errors));
    });
}

function validateParams(params, onSuccess, onError) {
    // check common parameters
    fhirToJDSSearch.validateCommonParams(params, function() {
        // validate date
        fhirToJDSSearch.validateDateParams(params, ['event-date'], function() {
            if (fhirToJDSSearch.isSortCriteriaValid(params, diagnosticOrder.fhirToJDSMap)) {
                onSuccess();
            } else {
                onError(['Unsupported _sort criteria. Supported attributes are: ' + _.keys(diagnosticOrder.fhirToJDSMap)]);
            }
        }, onError);
        // FUTURE-TODO: add validation for code param
    }, onError);
}

function limitFHIRResultByCount(fhirBundle, countStr) {
    if (nullchecker.isNotNullish(countStr)) {
        var count = parseInt(countStr);
        fhirBundle.entry = _.take(fhirBundle.entry, count);
    }
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.getDiagnosticOrder = getDiagnosticOrder;
module.exports.createDiagnosticOrderConformanceData = createDiagnosticOrderConformanceData;
