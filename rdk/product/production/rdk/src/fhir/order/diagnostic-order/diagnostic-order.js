'use strict';

var fhirResource = require('../../common/entities/fhir-resource');
var fhirUtils = require('../../common/utils/fhir-converter');
var helpers = require('../../common/utils/helpers');
var rdk = require('../../../core/rdk');
var constants = require('../../common/utils/constants');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var errors = require('../../common/errors');
var helpers = require('../../common/utils/helpers');
var fhirToJDSSearch = require('../../common/utils/fhir-to-jds-search');

var jdsToFHIRStatusMap = {
    COMPLETE: 'completed',
    PENDING: 'requested',
    DISCONTINUED: 'suspended',
    'DISCONTINUED/EDIT': 'suspended',
    ACTIVE: 'in-progress',
    EXPIRED: 'failed',
    LAPSED: 'failed',
    get: function(jdsStatus) {
        return this[jdsStatus];
    }
};

var fhirToJDSMap = {
    // 'actor': '',               // Who recorded or did this
    //'bodysite': '',             // Location of requested test (if applicable)
    //'code': 'statusCode',       // Code to indicate the item (test or panel) being ordered
    //'encounter': '',            // The encounter that this diagnostic order is associated with
    'event-date': 'entered', // The date at which the event happened
    'event-status': 'statusName', // proposed | draft | planned ...
    //'event-status-date': '',    // A combination of past-status and date
    'identifier': 'uid', // Identifiers assigned to this order
    //'item-date': '',            // The date at which the event happened
    //'item-past-status': '',     // proposed | draft | planned | ...
    //'item-status': '',          // proposed | draft | planned | ...
    //'item-status-date': '',     // A combination of item-past-status and item-date
    'orderer': 'providerName', // Who ordered the test
    'patient': 'pid', // Who and/or what test is about
    //'specimen': '',             // If the whole order relates to specific specimens
    'status': 'statusName', // proposed | draft | planned
    'subject': 'pid' // Who and/or what test is about
};

function buildJDSPath(pid, params, services) {
    var jdsPath = '/vpr/' + pid + '/index/order';
    var query = [];

    if (!_.isEmpty(services)) {
        query.push('filter=in(service,[' + services.join(',') + '])');
    }
    // search queries
    var searchQuery = buildSearchQuery(params);
    if (nullchecker.isNotNullish(searchQuery)) {
        query.push(searchQuery);
    }
    // common parameters
    query = query.concat(fhirToJDSSearch.buildCommonQueryParams(params, fhirToJDSMap));

    // add filter queries to path
    if (query.length > 0) {
        jdsPath += '?' + query.join('&');
    }

    return jdsPath;
}

function buildSearchQuery(params, services) {
    var query = [];
    var dateQuery;

    // services
    if (!_.isEmpty(services)) {
        query.push('in(service,[' + services.join(',') + '])');
    }
    // system & code
    if (nullchecker.isNotNullish(params.code)) {
        query.push(fhirToJDSSearch.buildCodeAndSystemQuery(params.code));
    }
    // date
    if (nullchecker.isNotNullish(params['event-date'])) {
        dateQuery = fhirToJDSSearch.buildDateQuery(params['event-date'], 'entered', false, false);
        if (dateQuery) {
            query.push(dateQuery);
        }
    }
    return fhirToJDSSearch.buildSearchQueryString(query);
}

function getJDSErrorMessage(error) {
    var msg = '';

    if (nullchecker.isNotNullish(error.errors)) {
        msg = _.reduce(error.errors, function(memo, e) {
            if (!_.isEmpty(memo)) {
                memo += ', ';
            }
            memo += e.domain + ' :: ' + e.message;
            return memo;
        }, '');
    }
    return msg;
}

function getData(appConfig, logger, pid, params, callback) {
    // check for required pid param
    if (nullchecker.isNullish(pid)) {
        return callback(new Error('Missing required parameter: pid'));
    }

    var jdsPath = buildJDSPath(pid, params, ['RA', 'LR']);

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
            logger.error('Procedure::getData: ' + body.error.code + ' - ' + getJDSErrorMessage(body.error));
            return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, internalError));
        }
        logger.error('Procedure::getData: Empty response from JDS.');
        return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, internalError));
    });
}


function convertToFhir(result, req) {
    var link = [new fhirResource.Link(req.protocol + '://' + req.headers.host + req.originalUrl, 'self')];
    var entry = [];
    var items = result.data.items;
    _.forEach(items, function(item) {
        var diagnosticOrders = createDiagnosticOrder(item, item.pid);
        entry = entry.concat(_.map(diagnosticOrders, function(order) {
            return new fhirResource.Entry(order);
        }));
    });
    return new fhirResource.Bundle(link, entry, result.data.totalItems);
}

function createDiagnosticOrder(jdsItem, pid) {
    var fhirItem = new fhirResource.DiagnosticOrder(jdsItem.uid);
    var results = [fhirItem];

    fhirItem.text = new fhirResource.Narrative('<div>' + _.escape(jdsItem.oiName || jdsItem.name) + '</div>', 'generated');
    fhirItem.subject = new fhirResource.ReferenceResource('Patient/' + pid); // REQUIRED
    fhirItem.contained = [];
    if (nullchecker.isNotNullish(jdsItem.providerUid)) {
        var orderer = createOrderer(jdsItem);
        fhirItem.orderer = new fhirResource.ReferenceResource('#' + orderer.id);
        fhirItem.contained.push(orderer);
    }
    fhirItem.identifier = [new fhirResource.Identifier(jdsItem.uid, constants.fhir.FACILITIES_IDENTIFIER_SYSTEM)];
    fhirItem.status = jdsToFHIRStatusMap.get(jdsItem.statusName);

    fhirItem.event = [{
        status: fhirItem.status,
        description: jdsItem.content,
        dateTime: fhirUtils.convertToFhirDateTime(jdsItem.entered, fhirUtils.getSiteHash(jdsItem.uid))
    }];
    if (nullchecker.isNotNullish(jdsItem.oiCode)) {
        var coding = new fhirResource.Coding(jdsItem.oiCode, jdsItem.oiName, constants.fhir.VHA_SYSTEM);
        if (nullchecker.isNotNullish(jdsItem.oiPackageRef)) {
            coding.extension = [createExtension('oiPackageRef', jdsItem)];
        }
        fhirItem.item = [{
            code: new fhirResource.CodeableConcept(undefined, coding)
        }];
    }
    _.forEach(jdsItem.clinicians, function(clinician) {
        fhirItem.contained.push(createSourcePractitioner(clinician));
    });
    fhirItem.contained.push(createOrganization(jdsItem));
    if (nullchecker.isNotNullish(jdsItem.locationUid)) {
        fhirItem.contained.push(createLocation(jdsItem));
    }
    fhirItem.extension = createExtensions(jdsItem);

    // Children are represented as separate resources on the same FHIR bundle. The parent/child relationship
    // is recorded in the resource's extensions.
    _.forEach(jdsItem.children, function(child) {
        var diagnosticOrder = createDiagnosticOrder(child, pid)[0];
        // record child in the parent
        fhirItem.extension.push(createChildExtension(diagnosticOrder.id));
        // record parent in the child
        diagnosticOrder.extension.push(createParentExtension(jdsItem.uid));

        results.push(diagnosticOrder);
    });

    return results;
}

function createOrderer(jdsItem) {
    var orderer = new fhirResource.Practitioner(helpers.generateUUID());
    if (nullchecker.isNotNullish(jdsItem.providerDisplayName)) {
        orderer.text = new fhirResource.Narrative('<div>' + _.escape(jdsItem.providerDisplayName) + '</div>', 'generated');
    }
    if (nullchecker.isNotNullish(jdsItem.providerName)) {
        orderer.name = new fhirResource.HumanName(jdsItem.providerName);
    }
    orderer.identifier = [new fhirResource.Identifier(jdsItem.providerUid, constants.fhir.UID_IDENTIFIER_SYSTEM)];
    return orderer;
}

function createSourcePractitioner(clinician) {
    var practitioner = new fhirResource.Practitioner(helpers.generateUUID());
    if (nullchecker.isNotNullish(clinician.name)) {
        practitioner.text = new fhirResource.Narrative('<div>' + _.escape(clinician.name) + '</div>', 'generated');
        practitioner.name = new fhirResource.HumanName(clinician.name);
    }
    practitioner.identifier = [new fhirResource.Identifier(clinician.uid, constants.fhir.UID_IDENTIFIER_SYSTEM)];
    practitioner.extension = _.compact([
        createExtension('role', clinician),
        createExtension('signedDateTime', clinician)
    ]);
    return practitioner;
}

function createOrganization(jdsItem) {
    var organization = new fhirResource.Organization(helpers.generateUUID());
    organization.text = new fhirResource.Narrative('<div>' + _.escape(jdsItem.facilityName) + '</div>', 'generated');
    organization.identifier = [new fhirResource.Identifier(jdsItem.facilityCode, constants.fhir.FACILITIES_IDENTIFIER_SYSTEM)];
    return organization;
}

function createLocation(jdsItem) {
    var location = new fhirResource.Location(helpers.generateUUID());
    location.text = new fhirResource.Narrative('<div>' + _.escape(jdsItem.locationName) + '</div>', 'generated');
    location.identifier = [new fhirResource.Identifier(jdsItem.locationUid, constants.fhir.FACILITIES_IDENTIFIER_SYSTEM)];
    return location;
}

function createChildExtension(uid) {
    var ref = new fhirResource.ReferenceResource('#' + uid);
    return new fhirResource.Extension('http://vistacore.us/fhir/extensions/diagnosticorder#child', ref, 'Reference');
}

function createParentExtension(parentUid) {
    var ref = new fhirResource.ReferenceResource('DiagnosticOrder/' + parentUid);
    return new fhirResource.Extension('http://vistacore.us/fhir/extensions/diagnosticorder#parent', ref, 'Reference');
}

function createExtension(propName, jdsItem) {
    var value = jdsItem[propName];
    if (nullchecker.isNullish(value)) {
        return null;
    } else {
        return new fhirResource.Extension('http://vistacore.us/fhir/extensions/diagnosticorder#' + propName, value, 'String');
    }
}

function createExtensions(jdsItem) {
    var ext = [
        createExtension('kind', jdsItem),
        createExtension('lastUpdateTime', jdsItem),
        createExtension('localId', jdsItem),
        createExtension('service', jdsItem),
        createExtension('stampTime', jdsItem),
        createExtension('statusCode', jdsItem),
        createExtension('statusVuid', jdsItem),
        createExtension('displayGroup', jdsItem),
        createExtension('start', jdsItem),
        createExtension('stop', jdsItem),
        createExtension('name', jdsItem),
        createExtension('result', jdsItem)
    ];
    return _.compact(ext);
}

module.exports.getData = getData;
module.exports.convertToFhir = convertToFhir;
module.exports.createDiagnosticOrder = createDiagnosticOrder;
module.exports.fhirToJDSMap = fhirToJDSMap;
