'use strict';
var rdk = require('../../core/rdk');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var resourceArray = [];
var fhirResource = require('../common/entities/fhir-resource');
var conformanceUtils = require('../conformance/conformance-utils');

// as an array of PARAMS and its ATTRIBUTES
var fhirToJDSAttrMap = [ {
    fhirName : 'resource',
    vprName : '',
    dataType : 'string',
    definition : 'http://hl7.org/FHIR/2015May/datatypes.html#string',
    description : 'One of the resource types defined as part of FHIR',
    searchable : true
}];

function getResourceConfig() {
    // register the conformance data
    try { // don't fail on initialization
        register('conformance', createConformanceData());
    } catch (e) {
    }

    return [{
        name : 'conformance-metadata',
        path : '',
        get : getMetadata,
        subsystems : [ 'authorization' ],
        interceptors : {},
        permitResponseFormat : true,
        requiredPermissions : [],
        isPatientCentric : false
    }];
}

function createConformanceData() {
    var resourceType = 'Conformance';
    var profileReference = 'http://www.hl7.org/FHIR/2015May/conformance.html';
    var interactions = [ 'read', 'search-type' ];

    return conformanceUtils.createConformanceData(resourceType, profileReference, interactions, fhirToJDSAttrMap);
}

function register(name, data) {
    name = name.toLowerCase();
    resourceArray.push({
        name : name,
        data : data
    });
}

/**
 * @api {get} /fhir/metadata Get Conformance
 * @apiName getConformance
 * @apiGroup Conformance
 * @apiParam {String} [resource] retorce type. T
 *
 * @apiDescription Returns a FHIR \'Conformance\' report.
 * @apiExample {js} Request Examples: // Full conformance statement
 *             http://IPADDRESS:POR/resource/fhir/metadata // Conformance for a
 *             resource(s)
 *             http://IPADDRESS:POR/resource/fhir/metadata?resource=observation[,patient]
 *
 *
 * @apiSuccess {json} data Json object conforming to the <a
 *             href="http://www.hl7.org/FHIR/2015May/conformance.html">Conformance
 *             FHIR DTSU2 specification</a>.
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK { }
 * @apiError (Error 400) Invalid parameters.
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request { }
 */

function getMetadata(req, res) {
    var conformance = packageRequestedStatements(req);
    res.status(200).send(conformance);
}

function packageRequestedStatements(req) {

    var requestedDomain = req.param('resource');
    var conformanceArray;
    if (_.isEmpty(requestedDomain)) {
        conformanceArray = resourceArray;
    } else {
        conformanceArray = _.filter(resourceArray, {'name':requestedDomain.toLowerCase()});
    }

    var conformanceData = _.sortBy(conformanceArray, function(o) {
        return o.name;
    });
    var filter = [];

   var conformance = new fhirResource.ConformanceResourceHeader('0.0.1');
   var out = conformance.rest[0].resource;
   //out = [];  // Required if ConformanceResourceHeader cached

    if (!nullchecker.isNullish(req.param('resource'))) {
        var domains = req.param('resource').toLowerCase();
        filter = domains.split(',');
    }

    _.each(conformanceData, function(item) {
        if (filter.length === 0 || filter.indexOf(item.name) > -1) {
            out.push(item.data);
        }
    });
   
    return conformance;
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.register = register;
module.exports.packageRequestedStatements = packageRequestedStatements;