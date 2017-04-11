'use strict';
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var errors = require('../common/errors.js');
var helpers = require('../common/utils/helpers.js');
var fhirUtils = require('../common/utils/fhir-converter');
var fhirResource = require('../common/entities/fhir-resource');
var fhirToJDSSearch = require('../common/utils/fhir-to-jds-search');
var fhirConstants = require('../common/utils/constants');
var errors = require('../common/errors');


var jdsToFHIRStatusMap = {
    'COMPLETE': 'completed',
    'IN-PROGRESS': 'in-proogress',
    'ABORTED': 'aborted',
    'ENTERED-IN-ERROR': 'entered-in-error',
    get: function(jdsStatus) {
        return this[jdsStatus];
    }
};

var conceptCategory = 'ED';



var fhirToJDSAttrMap = [{
    fhirName: 'date',
    vprName: 'entered',
    dataType: 'dateTime',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#dateTime',
    description: 'Date/Period the procedure was performed Procedure.performedDateTime. The prefixes >, >=, <=, < and != may be used on the parameter value (e.g. date=>2015-01-15). The following date formats are permitted: yyyy-mm-ddThh:mm:ss (exact date search), yyyy-mm-dd (within given day), yyyy-mm (within given month), yyyy (within given year). A single date parameter can be used for an exact date search (e.g. date=2015-01-26T08:30:00) or an implicit range (e.g. date=2015-01, searches all dates in January 2015). Two date parameters can be used to specify an explicitly bounded range. When using a pair of date parameters, the parameters should bind both ends of the range. One should have a less-than operator (<, <=) while the other a greater-than operator (>, >=). ',
    searchable: true,
    sortable: true
}, {
    fhirName: 'encounter',
    vprName: 'encounterUid',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'The encounter when procedure performed',
    searchable: false,
    sortable: true
}, {
    fhirName: 'location',
    vprName: 'locationName',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Where the procedure happened ',
    searchable: false,
    sortable: true
}, {
    fhirName: 'patient',
    vprName: 'pid',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'The identity of a patient to list procedures for ',
    searchable: false,
    sortable: true
}, {
    fhirName: 'performer',
    vprName: 'facilityName',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'The reference to the practitioner',
    searchable: false,
    sortable: true
}, {
    fhirName: 'type',
    vprName: 'name',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Type of procedure',
    searchable: false,
    sortable: true
}];

/**
 * To contain a simplified object (from fhirToJDSAttrMap) of
 * only sortable fhirName:vprName  attributes for easier processing.
 */
var fhirToJDSSortMap;


function buildJDSPath(pid, params) {
    var basePath = '/vpr/' + pid + '/find/education';
    var searchQuery = buildSearchQuery(params);
    return fhirToJDSSearch.buildJDSPath(basePath, searchQuery, params, fhirToJDSSortMap);
}

function buildSearchQuery(params) {
    var query = [];
    var dateQuery;

    // date
    if (nullchecker.isNotNullish(params.date)) {
        dateQuery = fhirToJDSSearch.buildDateQuery(params.date, 'entered');
        if (dateQuery) {
            query.push(dateQuery);
        }
    }
    return fhirToJDSSearch.buildSearchQueryString(query);
}


function getData(appConfig, logger, pid, params, callback) {

    fhirToJDSSortMap = fhirToJDSSearch.getSimplifiedSortArray(params, fhirToJDSAttrMap);

    // check suport for specific user given sort params
    if (!fhirToJDSSearch.isSortCriteriaValid(params, fhirToJDSSortMap)) {
        var errMsg = 'Unsupported _sort criteria. Supported attributes are: ' + fhirToJDSSearch.getAllowableSortFhirValueString(fhirToJDSAttrMap) ;
        return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, errMsg));
    }

    // check for required pid param
    if (nullchecker.isNullish(pid)) {
        return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, 'Missing required parameter: pid'));
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
            return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, 'Error fetching pid=' + pid + ' - ' + (error.message || error)));
        }
        if ('data' in body) {
            return callback(null, body);
        }
        if ('error' in body) {
            logger.error('Procedure::getData: ' + body.error.code + ' - ' + errors.getJDSErrorMessage(body.error));
            return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, internalError));
        }
        logger.error('Procedure::getData: Empty response from JDS.');
        return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, internalError));
    });
}

/**
 * Build and return an array of FHIR "entry"
 * @param  {[type]} items [description]
 * @param  {[type]} req   [description]
 * @return {[type]}       [description]
 */
function convertToFhir(items, req) {
    return _.map(items, function(item) {
        return createItem(item, req._pid);
    });
}

/**
 *
 * @param jdsItem
 * @param fhirItems
 * @param host
 * @param updated
 */
function createItem(jdsItem, pid) {

    var fhirItem = new fhirResource.Procedure(helpers.generateUUID(), pid);

    if (nullchecker.isNotNullish(jdsItem.summary)) {
        fhirItem.text = new fhirResource.Narrative('<div>' + _.escape(jdsItem.summary) + '</div>');
    }
    fhirItem.status = jdsToFHIRStatusMap.get('COMPLETE');
    fhirItem.identifier = [new fhirResource.Identifier(jdsItem.uid, fhirConstants.procedure.PROCEDURE_UID_IDENTIFIER_SYSTEM)];
    fhirItem.patient = new fhirResource.ReferenceResource('Patient/' + jdsItem.pid);

    fhirItem.type = {
        coding: [{
            system: fhirConstants.procedure.EDUCATION_TYPECODE_SYSTEM,
            code: '/concept/' + conceptCategory + '.' + encodeURI(jdsItem.name),
            display: jdsItem.name,
            primary: true
        }]
    };

    if (nullchecker.isNotNullish(jdsItem.entered)) {
        fhirItem.performedDateTime = fhirUtils.convertToFhirDateTime(jdsItem.entered, fhirUtils.getSiteHash(jdsItem.uid));
    }

    if (nullchecker.isNotNullish(jdsItem.encounterUid)) {
        fhirItem.encounter = {
            reference: jdsItem.encounterUid,
            display: jdsItem.encounterName
        };
    }

    if (nullchecker.isNotNullish(jdsItem.locationName)) {
        fhirItem.location = createLocation(jdsItem);
    }

    var outcomeDisplayValue = fhirResource.ProcedureOutcome.get(jdsItem.result);
    var outcomeCode = new fhirResource.Coding(fhirResource.ProcedureOutcomeCode.get(outcomeDisplayValue),
        outcomeDisplayValue, fhirConstants.procedure.PROCEDURE_OUTCOME_SYSTEM);
    fhirItem.outcome = new fhirResource.CodeableConcept(outcomeDisplayValue, outcomeCode);

    fhirItem.extension = createAllExtensions(jdsItem);

    return fhirItem;
}

function createLocation(jdsItem) {
    var location = {
        reference: jdsItem.locationUid,
        display: jdsItem.locationName
    };
    return location;
}

function createExtension(propName, jdsItem) {
    var value = jdsItem[propName];
    if (nullchecker.isNullish(value)) {
        return null;
    } else {
        return new fhirResource.Extension('http://vistacore.us/fhir/extensions/procedure#' + propName, value, 'String');
    }
}

function createAllExtensions(jdsItem) {
    var ext = [
        createExtension('facilityCode', jdsItem),
        createExtension('facilityName', jdsItem),
        createExtension('lastUpdateTime', jdsItem),
        createExtension('localId', jdsItem),
        createExtension('stampTime', jdsItem),
        createExtension('uid', jdsItem)
    ];
    return _.compact(ext);
}


module.exports.convertToFhir = convertToFhir;
module.exports.getData = getData;
module.exports.jdsToFHIRStatusMap = jdsToFHIRStatusMap;
