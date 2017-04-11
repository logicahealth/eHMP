'use strict';

var rdk = require('../../core/rdk');
var ms = require('./medication-statement-objects');
var domains = require('../common/domain-map.js');
var errors = require('../common/errors');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var fhirResource = require('../common/entities/fhir-resource');
var confUtils = require('../conformance/conformance-utils');
var conformance = require('../conformance/conformance-resource');

var fhirToJDSAttrMap = [{
    fhirName: 'subject.identifier',
    vprName: 'pid',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Patient indentifier.',
    searchable: true
}];

// Issue call to Conformance registration
conformance.register(confUtils.domains.MEDICATION_STATEMENT, createMedicationStatementConformanceData());

function createMedicationStatementConformanceData() {   
   var resourceType = confUtils.domains.MEDICATION_STATEMENT;
   var profileReference = 'http://www.hl7.org/FHIR/2015May/medicationstatement.html';
   var interactions = [ 'read', 'search-type' ];

   return confUtils.createConformanceData(resourceType, profileReference,
           interactions, fhirToJDSAttrMap);
}

function getResourceConfig() {
    return [{
        name: 'medicationdstatement-getMedicationStatement',
        path: '',
        get: getMedicationStatement,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        requiredPermissions: [],
        isPatientCentric: true,
        permitResponseFormat: true
    }];
}

function getMedicationStatement(req, res) {
    getData(req, function(err, data) {
        if (err) {
            if (err instanceof errors.ParamError) {
                res.status(rdk.httpstatus.bad_request).send(err.message);
            } else {
                req.logger.error(err.message);
                res.status(rdk.httpstatus.internal_server_error).send(err.message);
            }
        } else {
            res.send(rdk.httpstatus.ok,
                ms.buildBundle(ms.convertToFhir(data.items, req), req, data.totalItems));
        }
    });
}

function getData(req, callback) {

    // SET and CHECK Patient Id
    var pid = req.param('subject.identifier');
    if (nullchecker.isNullish(pid)) {
        return callback(new errors.ParamError('subject.identifier'));
    }

    req.audit.dataDomain = 'Medication Statement';
    req.audit.logCategory = 'MEDICATION_STATEMENT';

    var jdsResource = '/vpr/' + pid + '/index/' + domains.jds('med') + '?filter=eq(vaType,N)';

    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsResource,
        logger: req.logger,
        json: true
    });

    // FETCH DATA from source
    rdk.utils.http.get(options, function(error, response, obj) {
        if (error) {
            callback(new errors.FetchError('Error fetching pid=' + pid + ' - ' + (error.message || error), error));
        } else {
            if ('data' in obj) {
                return callback(null, obj.data);
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
