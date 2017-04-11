'use strict';
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var procedure = require('./procedure');
var fhirToJDSSearch = require('../common/utils/fhir-to-jds-search');
var fhirResource = require('../common/entities/fhir-resource');
var educations = require('./educations');
var async = require('async');
var confUtils = require('../conformance/conformance-utils');
var conformance = require('../conformance/conformance-resource');

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

//Issue call to Conformance registration
conformance.register(confUtils.domains.PROCEDURE, createConformanceData());

function createConformanceData() {   
    var resourceType = confUtils.domains.PROCEDURE;
    var profileReference = 'http://www.hl7.org/FHIR/2015May/procedure.html';
    var interactions = [ 'read', 'search-type'];

    return confUtils.createConformanceData(resourceType, profileReference,
            interactions, procedure.fhirToJDSAttrMap);
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
 *      http://IPADDRESS:POR/resource/fhir/patient/9E7A;253/procedure?_count=1
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

function buildBundle(results, req, total) {
    var link;
    if (req) {
        link = [new fhirResource.Link(req.protocol + '://' + req.headers.host + req.originalUrl, 'self')];
    }

    var entry = [];
    _.forEach(results, function(aResult) {
        entry.push(new fhirResource.Entry(aResult));
    });

    return (new fhirResource.Bundle(link, entry, total));
}

function buildTask(req, res, module) {
    // task function called by async
    return function(callback) {
        module.getData(req.app.config, req.logger, req.query.pid, req.query, function(err, inputJSON) {
            if (nullchecker.isNotNullish(err)) {
                return res.status(err.code).send(err.message);
            }
            var outJSON = module.convertToFhir(inputJSON.data.items, req);
            return callback(err, outJSON);
        });
    };
}

function getProcedure(req, res) {
    var pid = req.query.pid;
    var params = req.query;
    var domainFilter = params._tag;

    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_format).send('Missing required parameter: pid');
    }

    validateParams(req.query, /*onSuccess*/ function() {


        var tasks;
        switch (domainFilter) {
            case 'procedure':
                tasks = [buildTask(req, res, procedure)];
                break;
            case 'educations':
                tasks = [buildTask(req, res, educations)];
                break;
            default:
                tasks = [buildTask(req, res, procedure), buildTask(req, res, educations)];
        }

        async.parallel(tasks, function(err, results) {
            if (err) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }

            //-----------------------------------------------------------
            // 1) consolidate all entries into a single array. Note, concat
            //    will take leave out empty array items.
            // 2) reduce total number of entries as specificed per _count
            // 3) build and send final Bundle of all gathered entries.
            //-----------------------------------------------------------

            var resources = _.flatten(results);

            limitFHIRResultByCount(resources, params._count);
            var fhirBundle = buildBundle(resources, req, resources.length);

            return res.status(rdk.httpstatus.ok).send(fhirBundle);
        });

    }, /*onError*/ function(errors) {
        return res.status(rdk.httpstatus.bad_request).send('Invalid parameters:' + fhirToJDSSearch.validationErrorsToString(errors));
    }); //end-validateParams
}


function validateParams(params, onSuccess, onError) {
    // check common parameters
    fhirToJDSSearch.validateCommonParams(params, function() {
        // validate date
        fhirToJDSSearch.validateDateParams(params, ['date'], onSuccess, onError );
        // TODO-FUTURE: add validation for code param
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
module.exports.createConformanceData = createConformanceData;
