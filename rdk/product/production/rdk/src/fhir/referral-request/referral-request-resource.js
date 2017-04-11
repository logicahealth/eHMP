'use strict';
var referralRequest = require('./referral-request');
var errors = require('../common/errors');
var domains = require('../common/domain-map');
var querystring = require('querystring');
var rdk = require('../../core/rdk');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var confUtils = require('../conformance/conformance-utils');
var conformance = require('../conformance/conformance-resource');

var fhirToJDSAttrMap = [ {
    fhirName: 'subject.identifier', // Note this attribute is a app-defined search param, not a Fhir specified attribute.
    vprName: 'pid',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Patient indentifier - note that this patient identifier will override any patient identifier that is in the URI of this endpoint.',
    searchable: true
}, {
    fhirName: 'pid',  // Note this attribute is a app-defined search param, not a Fhir specified attribute.
    vprName: 'pid',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Patient indentifier - note that this patient identifier will override any patient identifier that has been specified in the URI of this endpoint, as well as any subject.identifier in the query string.',
    searchable: true
}, {
    fhirName : 'patient',
    vprName : 'pid',
    dataType : 'string',
    definition : 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description : 'Who the referral is about.',
    searchable: true,
    sortable: false
}, {
    fhirName : 'priority',
    vprName : 'urgency',
    dataType : 'string',
    definition : 'http://www.hl7.org/FHIR/2015May/datatypes.html#token',
    description : 'he priority assigned to the referral.',
    searchable: false,
    sortable: false
}, {
    fhirName : 'recipient',
    vprName : 'activity.responsible',
    dataType : 'dateTime',
    definition : 'http://www.hl7.org/FHIR/2015May/search.html#string',
    description : 'The person that the referral was sent to.',
    searchable: false,
    sortable: false
}, {
    fhirName : 'requester',
    vprName : 'providerUid',
    dataType : 'string',
    definition : 'http://www.hl7.org/FHIR/2015May/search.html#string',
    description : 'Requester of referral / transfer of care.',
    searchable: false,
    sortable: false
}, {
    fhirName : 'specialty',
    vprName : 'service',
    dataType : 'string',
    definition : 'http://www.hl7.org/FHIR/2015May/search.html#string',
    description : 'The specialty that the referral is for.',
    searchable: false,
    sortable: false
}, {
    fhirName : 'status',
    vprName : 'statusName',
    dataType : 'string',
    definition : 'http://www.hl7.org/FHIR/2015May/search.html#string',
    description : 'The status of the referral.',
    searchable: false,
    sortable: false
}, {
    fhirName : 'type',
    vprName : 'consultProcedure',
    dataType : 'string',
    definition : 'http://www.hl7.org/FHIR/2015May/search.html#string',
    description : 'The type of the referral.',
    searchable: false,
    sortable: false
} ];

//Issue call to Conformance registration
conformance.register(confUtils.domains.REFERRALREQUEST, createConformanceData());

function createConformanceData() {   
    var resourceType = confUtils.domains.REFERRALREQUEST;
    var profileReference = 'http://www.hl7.org/FHIR/2015May/referralrequest.html';
    var interactions = [ 'read', 'search-type' ];

    return confUtils.createConformanceData(resourceType, profileReference,
            interactions, fhirToJDSAttrMap);
}

function getResourceConfig() {
    return [{
        name: 'referralrequest-getReferralRequest',
        path: '',
        get: getReferralRequest,
        subsystems: ['patientrecord', 'jds', 'solr', 'authorization'],
        requiredPermissions: [],
        isPatientCentric: true,
        permitResponseFormat: true
    }];
}

function getReferralRequest(req, res) {
    getData(req, function(err, inputJSON) {
        if (err) {
            if (err instanceof errors.ParamError) {
                res.status(rdk.httpstatus.bad_request).send(err.message);
            } else {
                req.logger.error(err.message);
                res.status(rdk.httpstatus.internal_server_error).send(err.message);
            }
        } else {
            res.status(rdk.httpstatus.ok).send(referralRequest.convertToFhir(inputJSON, req));
        }
    });
}



function getData(req, callback) {
    req._pid = req.param('subject.identifier');
    var start = req.param('start') || 0;
    var limit = req.param('limit');
    var jdsQuery = {
        start: start
    };
    if (limit) {
        jdsQuery.limit = limit;
    }
    var pid = req._pid,
        config = req.app.config,
        jdsResource = '/vpr/' + pid + '/index/' + domains.jds('consult'),
        options = _.extend({}, config.jdsServer, {
            url: jdsResource + '?' + querystring.stringify(jdsQuery),
            logger: req.logger,
            json: true
        });
    if (nullchecker.isNullish(pid)) {
        return callback(new errors.ParamError('subject.identifier'));
    }

    rdk.utils.http.get(options, function(error, response, obj) {

        if (error) {
            callback(new errors.FetchError('Error fetching pid=' + pid + ' - ' + (error.message || error), error));
        } else {
            if ('data' in obj) {
                return callback(null, obj);
            } else if ('error' in obj) {
                if (errors.isNotFound(obj)) {
                    return callback(new errors.NotFoundError('Object not found', obj));
                }
            }
            return callback(new Error('There was an error processing your request. The error has been logged.'));
        }
    });
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.createConformanceData = createConformanceData;
