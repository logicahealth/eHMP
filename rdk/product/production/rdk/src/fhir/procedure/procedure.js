'use strict';

var fhirResource = require('../common/entities/fhir-resource');
var fhirToJDSSearch = require('../common/utils/fhir-to-jds-search');
var fhirUtils = require('../common/utils/fhir-converter');
var helpers = require('../common/utils/helpers');
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var errors = require('../common/errors');
var fhirConstants = require('../common/utils/constants');

var jdsToFHIRStatusMap = {
    'COMPLETE': 'completed',
    'IN-PROGRESS': 'in-proogress',
    'ABORTED': 'aborted',
    'ENTERED-IN-ERROR': 'entered-in-error',
    get: function(jdsStatus) {
        return this[jdsStatus];
    }
};
var jdsToFHIRDiagnosticStatus = {
    'registered': 'registered',
    'partial': 'partial',
    'COMPLETE': 'final',
    'corrected': 'corrected',
    'appended': 'appended',
    'cancelled': 'cancelled',
    'entered-in-error': 'entered-in-error',
    get: function(jdsStatus) {
        return this[jdsStatus];
    }
};

var fhirToJDSAttrMap = [{
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
    fhirName: 'date',
    vprName: 'dateTime',
    dataType: 'dateTime',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#dateTime',
    description: 'Date/Period the procedure was performed Procedure.performedDateTime. The prefixes >, >=, <=, < and != may be used on the parameter value (e.g. date=>2015-01-15). The following date formats are permitted: yyyy-mm-ddThh:mm:ss (exact date search), yyyy-mm-dd (within given day), yyyy-mm (within given month), yyyy (within given year). A single date parameter can be used for an exact date search (e.g. date=2015-01-26T08:30:00) or an implicit range (e.g. date=2015-01, searches all dates in January 2015). Two date parameters can be used to specify an explicitly bounded range. When using a pair of date parameters, the parameters should bind both ends of the range. One should have a less-than operator (<, <=) while the other a greater-than operator (>, >=).',
    searchable: true,
    sortable: true
}, {
    fhirName: 'encounter',
    vprName: 'encounterUid',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'The encounter when procedure performed.',
    searchable: false,
    sortable: true
}, {
    fhirName: 'location',
    vprName: 'locationName',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Where the procedure happened.',
    searchable: false,
    sortable: true
}, {
    fhirName: 'patient',
    vprName: 'pid',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'The patient identifier (or subject) for which to retrieve the associated list of procedures.',
    searchable: false,
    sortable: true
}, {
    fhirName: 'performer',
    vprName: 'facilityName',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'The reference to the practitioner.',
    searchable: false,
    sortable: true
}, {
    fhirName: 'type',
    vprName: 'name',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Type of procedure.',
    searchable: false,
    sortable: true
}];

/**
 * To contain a simplified object (from fhirToJDSAttrMap) of
 * only sortable fhirName:vprName  attributes for easier processing.
 */
var fhirToJDSSortMap;


function buildJDSPath(pid, params) {
    var basePath = '/vpr/' + pid + '/find/procedure';
    var searchQuery = buildSearchQuery(params);
    return fhirToJDSSearch.buildJDSPath(basePath, searchQuery, params, fhirToJDSSortMap);
}

function buildSearchQuery(params) {
    var query = [];
    var dateQuery;

    // TODO-FUTURE
    // system & code - Not yet truely supported at JDS data level , since codes are not given back up
    // if (nullchecker.isNotNullish(params.code)) {
    //     query.push(fhirToJDSSearch.buildCodeAndSystemQuery(params.code));
    // }

    // date
    if (nullchecker.isNotNullish(params.date)) {
        dateQuery = fhirToJDSSearch.buildDateQuery(params.date, 'dateTime');
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

function convertToFhir(items, req) {
    return _.map(items, function(item) {
        return createProcedure(req, item, item._pid);
    });
}

function createProcedure(req, jdsItem, pid) {
    var fhirItem = new fhirResource.Procedure(helpers.generateUUID(), pid);

    fhirItem.text = new fhirResource.Narrative('<div>' + _.escape(jdsItem.oiName || jdsItem.name) + '</div>');
    fhirItem.status = jdsToFHIRStatusMap.get(jdsItem.statusName);
    fhirItem.identifier = [new fhirResource.Identifier(jdsItem.uid, fhirConstants.procedure.PROCEDURE_UID_IDENTIFIER_SYSTEM)];
    fhirItem.patient = new fhirResource.ReferenceResource('Patient/' + jdsItem.pid); // REQUIRED


    fhirItem.type = {
        coding: [{
            system: fhirConstants.procedure.NONEDUCATION_TYPECODE_SYSTEM,
            code: encodeURI(jdsItem.name),
            display: jdsItem.name,
            primary: true
        }]
    };

    if (nullchecker.isNotNullish(jdsItem.results)) {
        fhirItem.contained = [];
        fhirItem.report = [];
        _.forEach(jdsItem.results, function(result) {
            var report = createReport(jdsItem, result);
            fhirItem.contained.push(report);
            var reference = new fhirResource.ReferenceResource('#' + report.id, result.localTitle);
            fhirItem.report.push(reference);
        });
    }

    if (nullchecker.isNotNullish(jdsItem.dateTime)) {
        fhirItem.performedDateTime = fhirUtils.convertToFhirDateTime(jdsItem.dateTime, fhirUtils.getSiteHash(jdsItem.uid));
    }

    if (nullchecker.isNotNullish(jdsItem.encounterUid)) {
        fhirItem.encounter = {};
        fhirItem.encounter.reference = jdsItem.encounterUid;
    }

    if (nullchecker.isNotNullish(jdsItem.locationName)) {
        fhirItem.location = createLocation(jdsItem);
    }
    fhirItem.extension = createExtensions(jdsItem);

    return fhirItem;
}

function createReport(jdsItem, item) {
    var siteHash = fhirUtils.getSiteHash(jdsItem.uid);
    var result = {
        resourceType: 'DiagnosticReport',
        id: helpers.generateUUID(),
        text: {
            status: 'generated',
            div: '<div>' + _.escape(item.localTitle) + '</div>'
        },
        identifier: [{
            value: item.uid,
            system: 'http://vistacore.us/fhir/id/uid'
        }],
        name: {
            coding: [{
                display: item.localTitle,
                primary: true
            }]
        },
        diagnosticDateTime: fhirUtils.convertToFhirDateTime(jdsItem.dateTime, siteHash),
        status: jdsToFHIRDiagnosticStatus.get(jdsItem.statusName),
        issued: fhirUtils.convertToFhirDateTime(jdsItem.dateTime, siteHash),
        subject: new fhirResource.ReferenceResource('Patient/' + jdsItem.pid),
        performer: {
            reference: item.summary
        }
    };
    return result;
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

function createExtensions(jdsItem) {
    var ext = [
        createExtension('category', jdsItem),
        createExtension('facilityCode', jdsItem),
        createExtension('facilityName', jdsItem),
        createExtension('kind', jdsItem),
        createExtension('lastUpdateTime', jdsItem),
        createExtension('localId', jdsItem),
        createExtension('consultUid', jdsItem),
        createExtension('orderUid', jdsItem),
        createExtension('stampTime', jdsItem),
        createExtension('lastUpdateTime', jdsItem),
        createExtension('requested', jdsItem)
    ];
    return _.compact(ext);
}

// for testing.
function getFhirItems(result, req) {
    var fhirResult = {};
    var fhirItems = [];

    fhirResult = convertToFhir(result, req);
    fhirItems = fhirResult.entry;
    return fhirItems;
}


module.exports.getFhirItems = getFhirItems;
module.exports.jdsToFHIRStatusMap = jdsToFHIRStatusMap;
module.exports.fhirToJDSAttrMap = fhirToJDSAttrMap;
module.exports.getData = getData;
module.exports.convertToFhir = convertToFhir;
module.exports.createProcedure = createProcedure;
