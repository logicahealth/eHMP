'use strict';
var rdk = require('../../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var helpers = require('../../common/utils/helpers.js');
var fhirUtils = require('../../common/utils/fhir-converter');
var fhirToJDSSearch = require('../../common/utils/fhir-to-jds-search');
var jds = require('../../common/utils/jds-query-helper');
var fhirResource = require('../common/entities/fhir-resource');

var conceptCategory = 'HF';

var fhirToJDSMap = {
    // ** code          // Not supported - pending clarification of the FHIR standard.
    // ** code-value-x  // Not supported - pending clarification of the FHIR standard.
    // (NOT MAPPED) data-absent-reason
    date: 'entered', // Obtained date/time (e.g. Observation.appliesDateTime)
    // (NOT MAPPED) device
    // (NOT MAPPED) encounter
    identifier: 'uid', // The unique Id for a particular observation
    // patient
    patient: 'pid', // the subject that the observation is about (if patient)
    performer: 'facilityName', // Who performed the observation
    // (NOT MAPPED) related
    // (NOT MAPPED) related-target
    // (NOT MAPPED) related-type
    // (NOT MAPPED - hardcoded to 'unknown') reliability
    // (NOT MAPPED) specimen
    // (NOT MAPPED - harcoded to 'final') status
    subject: 'pid', // the subject that the observation is about
    // (NOT MAPPED value-concept
    // (NOT MAPPED value-date
    // (NOT MAPPED value-string
    // (NOT MAPPED) value-quantity
};

function buildSearchQuery(params) {
    var query = [];
    var dateQuery;

    // system & code
    if (nullchecker.isNotNullish(params.code)) {
        var systemCodeQuery = buildCodeQuery(params.code);
        if (systemCodeQuery === null) {
            // system/code query didn't map to a JDS filter that would yield results
            return null;
        }
        query.push(buildCodeQuery(params.code));
    }
    // date
    if (nullchecker.isNotNullish(params.date)) {
        dateQuery = fhirToJDSSearch.buildDateQuery(params.date, 'entered', false /*ignoreTime*/ , true /*includeSeconds*/ );
        if (dateQuery) {
            query.push(dateQuery);
        }
    }
    return fhirToJDSSearch.buildSearchQueryString(query);
}

function buildCodeQuery(codeQuery) {
    var conceptCodeRegex = /^\/concept\/.+\.(.+)$/; // '/concept/HF.' + encodeURI(jdsItem.name)
    var queries = [];
    // FHIR supports escaped commas (\,). We replace non-escaped commas with a
    // unused unicode character to perform the split .
    var tokens = codeQuery.replace(/([^\\]),/g, '$1\u000B').split('\u000B');

    _.forEach(tokens, function(token) {
        // unescape any commas
        token = token.replace(/\\,/g, ',');
        var code;
        var system;
        var codeSystemSplit = token.split('|');

        if (codeSystemSplit.length > 1) {
            system = codeSystemSplit[0];
            code = codeSystemSplit[1];
        } else {
            code = codeSystemSplit[0];
        }

        // http://ehmp.DNS   /terminology/1.0 does not exist in VPR, FHIR mapping associates the system with VPR record's name.
        // That's the only system that could be queried to get results.
        if ((nullchecker.isNullish(system) || system === 'http://ehmp.DNS   /terminology/1.0') && conceptCodeRegex.test(code)) {
            // FHIR mapping sets the code for all VPR Health Factors as: '/concept/HF.' + encodeURI(jdsItem.name)
            // When searching for a code with that pattern we know to deconstruct it and search for name
            var name = decodeURI(code.match(conceptCodeRegex)[1]);
            queries.push(jds.eq('name', '\"' + name + '\"'));
        }
    });
    if (nullchecker.isNotNullish(codeQuery) && queries.length === 0) {
        // No code/system mapped to JDS queries that would yield results
        return null;
    }
    // combine all token queries into OR expressions
    return jds.or(queries);
}

function getHealthFactors(config, logger, pid, params, callback) {
    var basePath = '/vpr/' + pid + '/find/factor/';
    var searchQuery = buildSearchQuery(params);
    if (searchQuery === null) {
        // search query would not yield any results, short-circuit
        return callback(null, {
            data: {
                items: [],
                totalItems: 0
            }
        });
    }
    var jdsPath = fhirToJDSSearch.buildJDSPath(basePath, searchQuery, params, fhirToJDSMap);
    var options = _.extend({}, config.jdsServer, {
        url: jdsPath,
        logger: logger,
        json: true
    });

    rdk.utils.http.get(options, function(error, response, body) {
        callback(error, body);
    });
}

function convertToFHIRObservations(vprItems, req) {
    return _.map(vprItems, function(vprItem) {
        return createHF(vprItem);
    });
}

function createHF(jdsItem) {
    var fhirItem = {};

    fhirItem.resource = {};
    fhirItem.resource.resourceType = 'Observation';
    fhirItem.resource.id = fhirResource.fixId(jdsItem.uid);
    fhirItem.resource.text = {
        'status': 'generated',
        'div': '<div>' + jdsItem.summary + '</div>'
    };
    var orgUid = helpers.generateUUID();
    fhirItem.resource.contained = [{
        'resourceType': 'Organization',
        'id': orgUid,
        'identifier': [{
            'system': 'urn:oid:2.16.840.1.113883.6.233',
            'value': jdsItem.facilityCode
        }],
        'name': jdsItem.facilityName
    }];

    fhirItem.resource.code = {};
    fhirItem.resource.code.coding = [{
        'system': 'http://ehmp.DNS   /terminology/1.0',
        'code': '/concept/' + conceptCategory + '.' + encodeURI(jdsItem.name),
        'display': jdsItem.name
    }];

    if (jdsItem.entered !== undefined) {
        fhirItem.resource.appliesDateTime = fhirUtils.convertToFhirDateTime(jdsItem.entered, fhirUtils.getSiteHash(jdsItem.uid));
    }

    //    fhirItem.resource.issued  --> SOURCE?

    fhirItem.resource.status = 'final';
    fhirItem.resource.reliability = 'unknown';
    fhirItem.resource.identifier = [{
        'use': 'official',
        //'label': 'uid',
        'system': 'http://vistacore.us/fhir/id/uid',
        'value': jdsItem.uid
    }];

    //Extracting Patient dfn given uid of pattern = urn:va:<collection>:<site>:<dfn>:<ien>
    var splitUid = jdsItem.uid.split(':');
    if (splitUid.length > 5) {
        fhirItem.resource.subject = {
            'reference': 'Patient/' + splitUid[4]
        };
    }
    fhirItem.resource.performer = [{
        'reference': orgUid,
        'display': jdsItem.facilityName
    }];
    return fhirItem;
}


module.exports.getHealthFactors = getHealthFactors;
module.exports.convertToFHIRObservations = convertToFHIRObservations;
