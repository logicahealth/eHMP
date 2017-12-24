'use strict';

var moment = require('moment');
var rdk = require('../../../core/rdk');
var listResource = require('../../facility/list');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
module.exports.addSpecializedResultsToResponse = addSpecializedResultsToResponse;
module.exports._updateCumulativeResponseData = updateCumulativeResponseData;
module.exports._transformSolrHighlightingToHmpObject = transformSolrHighlightingToHmpObject;
module.exports._transformSolrItemsToHmpFormat = transformSolrItemsToHmpFormat;
module.exports._buildResponseObjectSkeleton = buildResponseObjectSkeleton;
module.exports._getSearchedDomainFromSolrResponse = getSearchedDomainFromSolrResponse;
module.exports._isGroupingEnabled = isGroupingEnabled;
module.exports._addSynonymsToResponse = addSynonymsToResponse;
module.exports._removeEscapeChars = removeEscapeChars;

function addSpecializedResultsToResponse(req, specializedSolrResults, reqQuery) {
    var hmpEmulatedResponseObject = buildResponseObjectSkeleton(reqQuery);

    _.each(specializedSolrResults, function(specializedSolrResult) {
        if (specializedSolrResult.error) {
            hmpEmulatedResponseObject = {
                success: false,
                error: specializedSolrResult.error.msg,
                trace: specializedSolrResult.error.trace
            };
            return false;
        }

        hmpEmulatedResponseObject = transformSolrItemsToHmpFormat(req, specializedSolrResult, hmpEmulatedResponseObject);
        hmpEmulatedResponseObject = updateCumulativeResponseData(specializedSolrResult, hmpEmulatedResponseObject);
        hmpEmulatedResponseObject = addSynonymsToResponse(specializedSolrResult, hmpEmulatedResponseObject);
    });
    return hmpEmulatedResponseObject;
}

function updateCumulativeResponseData(specializedSolrResult, hmpEmulatedResponseObject) {
    if (isGroupingEnabled(specializedSolrResult)) {
        _.each(specializedSolrResult.grouped, function(group_field) {
            var itemsFound = group_field.matches || 0;
            hmpEmulatedResponseObject.data.foundItemsTotal += itemsFound;
            hmpEmulatedResponseObject.data.unfilteredTotal += itemsFound; // these are the same in HMP
        });
    } else {
        var itemsFound = specializedSolrResult.response.numFound;
        hmpEmulatedResponseObject.data.foundItemsTotal += itemsFound;
        hmpEmulatedResponseObject.data.unfilteredTotal += itemsFound;
    }

    hmpEmulatedResponseObject.data.elapsed += specializedSolrResult.responseHeader.QTime;

    return hmpEmulatedResponseObject;
}

function transformSolrItemsToHmpFormat(req, specializedSolrResult, hmpEmulatedResponseObject) {
    var transformSolrItemsToHmpFormatDispatch = {
        accession: transformDefaultSolrItemsToHmp,
        allergy: transformDefaultSolrItemsToHmp,
        treatment: transformDefaultSolrItemsToHmp,
        consult: transformDefaultSolrItemsToHmp,
        procedure: transformDefaultSolrItemsToHmp,
        obs: transformDefaultSolrItemsToHmp,
        image: transformDefaultSolrItemsToHmp,
        surgery: transformDefaultSolrItemsToHmp,
        mh: transformDefaultSolrItemsToHmp,
        immunization: transformDefaultSolrItemsToHmp,
        pov: transformDefaultSolrItemsToHmp,
        skin: transformDefaultSolrItemsToHmp,
        exam: transformDefaultSolrItemsToHmp,
        cpt: transformDefaultSolrItemsToHmp,
        education: transformDefaultSolrItemsToHmp,
        factor: transformDefaultSolrItemsToHmp,
        appointment: transformDefaultSolrItemsToHmp,
        visit: transformDefaultSolrItemsToHmp,
        rad: transformDefaultSolrItemsToHmp,
        ptf: transformDefaultSolrItemsToHmp,

        med: transformMedSolrItemsToHmp,
        order: transformOrderSolrItemsToHmp,
        document: transformDocumentSolrItemsToHmp,
        vital: transformVitalSolrItemsToHmp,
        result: transformLabSolrItemsToHmp,
        lab: transformLabSolrItemsToHmp, // should not be needed, but left in for safety
        problem: transformProblemSolrItemsToHmp,
        'ehmp-activity': transformEHMPActivitySolrItemsToHmp,

        vlerdocument: transformVlerDocumentSolrItemsToHmp,

        //        suggest: buildSuggestQuery,
        //        tasks: buildTasksQuery,
        //        generic: buildGenericQuery,
        //        wholeDomain: buildWholeDomainQuery,
        //        labPanel: buildLabPanelQuery,
        //        labGroup: buildLabGroupQuery,
        //        infobuttonSearch: buildInfobuttonQuery  // HMP uses Infobutton as one word
        default: transformDefaultSolrItemsToHmp,
        'null': transformDefaultSolrItemsToHmp
    };

    var searchedDomain = getSearchedDomainFromSolrResponse(specializedSolrResult);
    if (isGroupingEnabled(specializedSolrResult)) {
        _.each(specializedSolrResult.grouped, function(group_type) {
            _.each(group_type.groups, function(group) {
                _.each(group.doclist.docs, function(doc) {
                    var transformedItem = transformSolrItemsToHmpFormatDispatch[searchedDomain](req, doc, searchedDomain);
                    transformedItem.count = group.doclist.numFound;
                    // avoid push mutation by using concat
                    hmpEmulatedResponseObject.data.items = hmpEmulatedResponseObject.data.items.concat(transformedItem);
                });
            });
        });
    } else {
        _.each(specializedSolrResult.response.docs, function(doc) {
            var transformedItem = transformSolrItemsToHmpFormatDispatch[searchedDomain](req, doc, searchedDomain);
            hmpEmulatedResponseObject.data.items = hmpEmulatedResponseObject.data.items.concat(transformedItem);
        });
    }

    hmpEmulatedResponseObject = transformSolrHighlightingToHmpObject(specializedSolrResult, hmpEmulatedResponseObject);
    return hmpEmulatedResponseObject;
}

function transformSolrHighlightingToHmpObject(specializedSolrResult, hmpEmulatedResponseObject) {
    var highlighting = specializedSolrResult.highlighting || {};

    // use _.each() instead of for..in to allow function scope and more concise syntax
    _.each(highlighting, function(highlightedFields, highlightedUid) {
        _.each(hmpEmulatedResponseObject.data.items, function(item) {
            if (item.uid === highlightedUid) {
                item.highlights = highlightedFields;
            }
        });
    });

    return hmpEmulatedResponseObject;
}

function isGroupingEnabled(specializedSolrResult) {
    return specializedSolrResult.hasOwnProperty('grouped');
}

/**
 * Only gets domains from solr queries that filter on one domain
 */
function getSearchedDomainFromSolrResponse(solrResult) {
    var searchedDomain = null;
    solrResult.responseHeader.params.fq.forEach(function(filterQuery) {
        var domainFq = filterQuery.match(/domain:([\w'-]+)/);
        if (!nullchecker.isNullish(domainFq)) {
            searchedDomain = domainFq[1];
        }
    });
    return searchedDomain;
    //var error = new Error('something broke');
    //console.error( error.stack );
    //return error;
}

function transformDefaultSolrItemsToHmp(req, item, domain) {
    var transformedItem = item;
    transformedItem.where = transformedItem.facility_name;
    transformedItem.type = domain;
    delete transformedItem.facility_name;

    return transformedItem;
}

function transformMedSolrItemsToHmp(req, item, domain) {

    var transformedItem = item;
    transformedItem.where = transformedItem.facility_name;
    transformedItem.type = domain;
    delete transformedItem.facility_name;

    return transformedItem;
}


function transformOrderSolrItemsToHmp(req, item, domain) {

    var transformedItem = item;
    transformedItem.where = transformedItem.facility_name;
    transformedItem.type = domain;
    if (transformedItem.service === 'LR') {
        transformedItem.kind = 'Laboratory';
    } else if (transformedItem.service === 'GMRC') {
        transformedItem.kind = 'Consult Report';
    } else if (transformedItem.service === 'RA') {
        transformedItem.kind = 'Radiology Report';
    }

    transformedItem.summary += ' (' + transformedItem.status + ' Order)';

    return transformedItem;
}

function transformDocumentSolrItemsToHmp(req, item, domain) {
    var transformedItem = item;
    transformedItem.where = transformedItem.facility_name;
    transformedItem.type = domain;
    transformedItem.status = transformedItem.document_status;
    transformedItem.documentDefUid = transformedItem.document_def_uid;
    transformedItem.localTitle = transformedItem.local_title;
    transformedItem.authorUid = transformedItem.author_uid;
    transformedItem.signerUid = transformedItem.signer_uid;
    transformedItem.cosignerUid = transformedItem.cosigner_uid;
    transformedItem.attendingUid = transformedItem.attending_uid;

    delete transformedItem.facility_name;
    delete transformedItem.document_status;
    delete transformedItem.document_def_uid;
    delete transformedItem.author_uid;
    delete transformedItem.signer_uid;
    delete transformedItem.cosigner_uid;
    delete transformedItem.attending_uid;

    return transformedItem;
}

function transformVitalSolrItemsToHmp(req, item, domain) {
    var transformedItem = item;
    transformedItem.where = transformedItem.facility_name;
    transformedItem.type = domain;
    delete transformedItem.facility_name;

    return transformedItem;
}

function transformLabSolrItemsToHmp(req, item, domain) {

    var transformedItem = item;
    transformedItem.where = transformedItem.facility_name;
    transformedItem.type = domain;
    delete transformedItem.facility_name;

    return transformedItem;
}

function transformProblemSolrItemsToHmp(req, item, domain) {

    var transformedItem = item;
    transformedItem.where = transformedItem.facility_name;
    transformedItem.type = domain;
    delete transformedItem.facility_name;

    return transformedItem;

}

function transformEHMPActivitySolrItemsToHmp(req, item, domain) {

    var transformedItem = item;

    transformedItem.type = domain;
    if (transformedItem.sub_domain === 'request') {
        transformedItem.kind = 'Request Activity';
        transformedItem.summary = _.last(transformedItem.request_title);
        transformedItem.datetime = moment(_.last(transformedItem.request_accepted_date)).format('YYYYMMDDHHmmss');
    } else if (transformedItem.sub_domain === 'consult') {
        transformedItem.kind = 'Consult';
        transformedItem.summary = transformedItem.consult_name;
        transformedItem.datetime = moment(transformedItem.consult_orders_accepted_date, 'YYYYMMDDHHmmss+HHmm').format('YYYYMMDDHHmmss');
    }
    var facilityList = listResource.list(req).data.items;
    transformedItem.where = _.find(facilityList, {
        division: transformedItem.activity_source_facility_id
    }).name;

    return transformedItem;

}

function transformVlerDocumentSolrItemsToHmp(req, item, domain) {
    var transformedItem = item;
    transformedItem.where = transformedItem.facility_name;

    if (domain) {
        transformedItem.type = domain;
    } else {
        transformedItem.type = 'vlerdocument';
    }

    transformedItem.kind = 'Community Health Summaries';
    delete transformedItem.facility_name;
    return transformedItem;
}

function addSynonymsToResponse(specializedSolrResult, hmpEmulatedResponseObject) {
    if (_.isArray(_.get(specializedSolrResult, 'debug.expandedSynonyms'))) {
        var synonyms = _.flatten(_.map(specializedSolrResult.debug.expandedSynonyms, function(row) {
            return _.map(parseMultipleSynonymsInARow(row), removeEscapeChars);
        }));
        hmpEmulatedResponseObject.data.synonyms = _.uniq(synonyms);
    }
    return hmpEmulatedResponseObject;
}


function parseMultipleSynonymsInARow(row) {
    // If performance is an issue in the future, this version is 2x faster (and much less readable)
    // function parseMultipleSynonymsInARow2(row) {
    //     var regex = /(""\S*"\s+.*?"|"\S+\s+".*?""|".*?"(?=(?:\s|$))|\S+)/g;
    //     return row.match(regex);
    // }

    // This parsing is messy because the string is built messily;
    // nested quotes are not escaped:
    // https://github.com/healthonnet/hon-lucene-synonyms/blob/c87fb8ced0abc9e19381a4843c964cf8473e8912/src/main/java/com/github/healthonnet/search/SynonymExpandingExtendedDismaxQParserPlugin.java#L478

    var strings = row.split(' ');
    var tokens = [];
    var insideQuotedString = false;
    var insideNestedString = false;
    var currentToken = null;
    _.each(strings, function(line) {
        if (_.startsWith(line, '"')) {
            insideQuotedString = true;
        }
        if (insideQuotedString) {
            if (_.startsWith(line, '""')) {
                insideNestedString = true;
            }
            if (_.isNull(currentToken)) {
                currentToken = line;
            } else {
                currentToken += ' ' + line;
            }
        } else {
            tokens.push(line);
        }
        if (_.endsWith(line, '"')) {
            if (insideNestedString) {
                insideNestedString = false;
            } else {
                insideQuotedString = false;
                tokens.push(currentToken);
                currentToken = null;
            }
        }
    });
    return tokens;
}

function removeEscapeChars(item) {
    if (_.startsWith(item, '\"')) {
        item = item.substring(1, item.length);
    }
    if (_.endsWith(item, '\"')) {
        item = item.substring(0, item.length - 1);
    }
    return item;
}


function buildResponseObjectSkeleton(reqQuery) {
    var responseObject = {};

    var data = {};
    data.query = reqQuery.query; // query and original appear to be always the same
    data.original = reqQuery.query; // "original search", PatientSearch.java:80
    data.altQuery = ''; // never used in HMP
    data.elapsed = 0; // QTime header from solr response
    data.foundItemsTotal = 0; // data points; not the number of returned result summaries
    data.unfilteredTotal = 0; // see PatientSearch.java:200, probably equal to facets.all
    data.corrections = []; // never used in HMP
    data.mode = 'SEARCH'; // see NOTES for more modes
    data.items = [];
    if (nullchecker.isNotNullish(reqQuery.returnSynonyms) && reqQuery.returnSynonyms === 'true') {
        data.synonyms = [];
    }
    data.filters = {};

    responseObject.data = data;
    responseObject.params = {};
    responseObject.success = true;

    return responseObject;
}
