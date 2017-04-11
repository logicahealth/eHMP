'use strict';
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var procedure = require('./procedure.js');
var fhirToJDSSearch = require('../common/utils/fhir-to-jds-search');

function getResourceConfig() {
    return [{
        name: 'procedure-procedure',
        path: '',
        get: getProcedure,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        interceptors: {
            fhirPid: true
        },
        requiredPermissions: [],
        isPatientCentric: true,
        permitResponseFormat: true
    }];
}


/**
 * @api {get} /fhir/patient/{id}/procedure Get Procedure
 * @apiName getProcedure
 * @apiGroup Procedure
 * @apiParam {Number} [_count] The number of results to show.
 *
 * @apiDescription Converts a vpr 'procedure' resource into a FHIR 'procedure' resource.
 *
 * @apiExample {js}  Examples:
 *      // Limiting results count
 *      http://IP           /resource/fhir/patient/9E7A;253/procedure?_count=1
 *
 * @apiSuccess {json} data Json object conforming to the <a href="http://www.hl7.org/FHIR/2015May/procedure.html">Procedure  FHIR DTSU2 specification</a>.
 * @apiSuccessExample Success-Response:
 * {
 *    "resourceType": "Bundle",
 *    "type": "collection",
 *    "id": "ccebfbe9-edaf-4c38-e54c-9c2741bdd61e",
 *    "link": [
 *        {
 *            "relation": "self",
 *            "url": "http://127.0.0.1:8888/resource/fhir/patient/C877;100816/procedure"
 *        }
 *    ],
 *    "total": 1,
 *    "entry": [
 *        {
 *            "resource": {
 *                "resourceType": "Procedure",
 *                "id": "a7da3796-174e-46fc-b77d-b4913af5a05f",
 *                "text": {
 *                    "status": "generated",
 *                    "div": "<div>LAPARASCOPY</div>"
 *                },
 *                "status": "completed",
 *                "identifier": [
 *                    {
 *                        "system": "urn:oid:2.16.840.1.113883.6.233",
 *                        "value": "urn:va:procedure:ABCD:226:50;MCAR(699,"
 *                    }
 *                ],
 *                "patient": {
 *                    "reference": "Patient/HDR;5000000317V387446"
 *                },
 *                "type": {
 *                    "coding": [
 *                        {
 *                            "system": "gov.va.fileman697-2:9E7A",
 *                            "display": "LAPARASCOPY",
 *                            "primary": true
 *                        }
 *                    ]
 *                },
 *                "extension": [
 *                    {
 *                        "url": "http://vistacore.us/fhir/extensions/procedure#category",
 *                        "valueString": "CP"
 *                    },
 *                    {
 *                        "url": "http://vistacore.us/fhir/extensions/procedure#stampTime",
 *                        "valueString": "20150825173613"
 *                    },
 *                    {
 *                        "url": "http://vistacore.us/fhir/extensions/procedure#dateTime",
 *                        "valueString": "199811190800"
 *                    },
 *                    {
 *                        "url": "http://vistacore.us/fhir/extensions/procedure#facilityCode",
 *                        "valueString": "561"
 *                    },
 *                    {
 *                        "url": "http://vistacore.us/fhir/extensions/procedure#facilityName",
 *                        "valueString": "New Jersey HCS"
 *                    },
 *                    {
 *                        "url": "http://vistacore.us/fhir/extensions/procedure#kind",
 *                        "valueString": "Procedure"
 *                    },
 *                    {
 *                        "url": "http://vistacore.us/fhir/extensions/procedure#localId",
 *                        "valueString": "50;MCAR(699,"
 *                    }
 *                ]
 *            }
 *        }
 *    ]
 *}
 *
 * @apiError (Error 400) Invalid parameter values.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad
 * {
 *      Invalid parameter values.
 * }
 */
function getProcedure(req, res) {
    var pid = req.query.pid;
    var params = req.query;

    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_format).send('Missing required parameter: pid');
    }

    validateParams(req.query, /*onSuccess*/ function() {
        procedure.getData(req.app.config, req.logger, pid, params, function(err, inputJSON) {
            if (nullchecker.isNotNullish(err)) {
                return res.status(err.code).send(err.message);
            }
            // If we decide to get the referenced order data - Note: requires callback!
            // procedure.processFhirWithOrders(inputJSON, req, function(fhirBundle) {}

            var fhirBundle = procedure.convertToFhir(inputJSON, req);
            limitFHIRResultByCount(fhirBundle, params._count);
            res.status(rdk.httpstatus.ok).send(fhirBundle);
        });
    }, /*onError*/ function(errors) {
        return res.status(rdk.httpstatus.bad_request).send('Invalid parameters:' + fhirToJDSSearch.validationErrorsToString(errors));
    });
}

function validateParams(params, onSuccess, onError) {
    // check common parameters
    fhirToJDSSearch.validateCommonParams(params, function() {
        // validate date
        fhirToJDSSearch.validateDateParams(params, ['date'], function() {
            if (procedure.isSortCriteriaValid(params, procedure.fhirToJDSMap)) {
                onSuccess();
            } else {
                onError(['Unsupported _sort criteria. Supported attributes are: ' + _.keys(procedure.fhirToJDSMap)]);
            }
        }, onError);
        // TODO: add validation for code param
    }, onError);
}

function limitFHIRResultByCount(fhirBundle, countStr) {
    if (nullchecker.isNotNullish(countStr)) {
        var count = parseInt(countStr);
        fhirBundle.entry = _.take(fhirBundle.entry, count);
    }
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.getProcedure = getProcedure;
