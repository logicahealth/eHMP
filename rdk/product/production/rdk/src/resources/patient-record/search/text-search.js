'use strict';

var rdk = require('../../../core/rdk');
var util = require('util');
var querystring = require('querystring');
var _ = require('lodash');
var async = require('async');
var hmpSolrResponseTransformer = require('./hmp-solr-response-transformer');
var nullchecker = rdk.utils.nullchecker;
var solrSimpleClient = require('./solr-simple-client');
var auditUtil = require('../../../utils/audit');
var asuUtils = require('../asu-utils');

module.exports = performTextSearch;
module.exports.description = {
    get: 'Perform a text search on records for one patient'
};

// below: _ exports for unit testing only
module.exports._buildSolrQuery = buildSolrQuery;
module.exports._buildSpecializedSolrQuery = buildSpecializedSolrQuery;

/**
 * /vpr/v{apiVersion}/search
 * Request parameters:
 * String pid     required
 * String query   required
 * String[] types optional
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function performTextSearch(req, res, next) {
    // Parse the URL

    // expected query params:
    //    _dc       // "search identifier", currently timestamp, can by anything though
    //    format    // only accepts json
    //    domains   // solr "fq=domain:type" --- there can be multiple 'types' parameters
    //    query     // solr "q=*query*"
    //    pid       // solr "fq=pid:(11111)"
    //    page      // unused
    //    start     // solr "start"
    //    limit     // solr "rows"

    var reqQuery = req.query;
    var specializedSolrQueryStrings = [];
    var domains;
    var patientPIDList = [];

    _.each(req.interceptorResults.patientIdentifiers.allSites, function(pid){
        patientPIDList.push(pid);
    });

    var allPids = patientPIDList.join(' OR ');
    req.logger.debug('reqQuery.pidJoinedList: ' + allPids);
    reqQuery.pidJoinedList = allPids;
    if (allPids.indexOf('OR') !== -1) {
        reqQuery.pidJoinedList = '(' + reqQuery.pidJoinedList + ')';
    }
    req.logger.debug('reqQuery.pidJoinedList: ' + reqQuery.pidJoinedList);

    req.audit.patientId = reqQuery.pid;
    req.audit.patientPidList = reqQuery.pidJoinedList;
    req.audit.logCategory = 'SEARCH';
    auditUtil.addAdditionalMessage(req, 'searchCriteriaQuery', util.format('query=%s', reqQuery.query));
    auditUtil.addAdditionalMessage(req, 'searchCriteriaDomain', util.format(util.format('domains=%s', reqQuery.domains)));

    if (nullchecker.isNullish(reqQuery.pid)) {
        // require searchText and pid
        return res.status(400).rdkSend('Missing pid parameter');
    }
    if (nullchecker.isNullish(reqQuery.query)) {
        return res.status(400).rdkSend('Missing query parameter');
    }

    req.logger.info({ query: reqQuery.query, domain: reqQuery.domains }, 'performing text search');



    if (nullchecker.isNullish(reqQuery.types)) {
        // manually set all the domains to search because HMP needs specialized queries
        domains = [
            'default',

            // FUTURE-TODO: incorporate these as default
            //            cpt obs encounter procedure allergy immunization mh roadtrip auxiliary pov skin diagnosis ptf exam education treatment

            'med',
            'order',
            'document',
            'vital',
            'lab',
            'problem'
        ];
    } else {
        var types = reqQuery.types;
        if (!_.isArray(types)) {
            types = types.split(',');
        }
        _.each(types, function(type, index) {
            types[index] = type.trim();
        });
        domains = [].concat(types);
    }


    _.each(domains, function(domain) {
        var specializedSolrQuery = buildSpecializedSolrQuery(reqQuery, domain);
        if (!specializedSolrQuery) {
            return res.status(400).rdkSend('Unknown type ' + domain);
        }
        specializedSolrQueryStrings.push(specializedSolrQuery);
    });
    executeAndTransformSolrQuerys(specializedSolrQueryStrings, res, req, reqQuery);
}

function executeAndTransformSolrQuerys(specializedSolrQueryStrings, res, req, reqQuery) {
    async.map(specializedSolrQueryStrings,
        function(item, callback) {
            solrSimpleClient.executeSolrQuery(item, 'select', req, function(err, result) {
                return callback(err, result);
            });
        },
        function(err, results) {
            if (err) {
                res.status(500).rdkSend('The search could not be completed\n' + err.stack);
                return;
            }
            var hmpEmulatedResponseObject = hmpSolrResponseTransformer.addSpecializedResultsToResponse(results, reqQuery);
            if (hmpEmulatedResponseObject.error) {
                req.logger.error(hmpEmulatedResponseObject, 'Error in addSpecializedResultsToResponse');
                return res.status(500).rdkSend(hmpEmulatedResponseObject.error);
            }
            hmpEmulatedResponseObject.params = reqQuery;
            hmpEmulatedResponseObject.method = req.route.stack[0].method.toUpperCase() + ' ' + req.route.path;

            if (nullchecker.isNullish(hmpEmulatedResponseObject.data.items) || !hmpEmulatedResponseObject.data.items.length) {
                res.rdkSend(hmpEmulatedResponseObject);
            } else {
                var matches = _.where(hmpEmulatedResponseObject.data.items, {type: 'document'});
                if (!nullchecker.isNullish(matches) && matches.length > 0) {
                    asuUtils.applyAsuRules(req, hmpEmulatedResponseObject, function (error, response) {
                        if (error) {
                            req.logger.debug('Asu Error: %j', error);
                            return res.status(500).rdkSend(error);
                        }
                        else {
                            hmpEmulatedResponseObject.data.items = groupByTitle(response, req.logger);
                            res.rdkSend(hmpEmulatedResponseObject);
                        }
                    });
                } else {
                    res.rdkSend(hmpEmulatedResponseObject);
                }
            }
        }
    );
}

/*
 * This function will group by documents by local title.
 * group by has been removed from SOLR search, since all document data won't be available for ASU
 */
function groupByTitle(response, logger) {

    //iterate and get a list with localTitle
    var docList = [], itemArray = [];
    _.each(response, function(item) {
        if(_.has(item, 'localTitle')) {
            docList = docList.concat(item);
        } else {
            itemArray = itemArray.concat(item);
        }
    });


    var itemMap = _.groupBy(docList, 'localTitle');
    _.each(itemMap, function(val, key) {
        val[0].count = val.length;
        itemArray = itemArray.concat(val[0]);
    });
    return itemArray;
}

/**
 * Return the domain portion of the filter query for a given domain.  We roll up the default query to handle multiple domains.
 * Other domains have a one-to-one relation with the domain value.
 * @param domain
 * @returns {*}
 */
function getFilterQueryForDomain(domain) {
    var fqDomain = domain;
    if (fqDomain === 'default') {
        fqDomain = '(accession OR allergy OR treatment OR consult OR procedure OR obs OR image OR surgery OR mh OR immunization OR pov OR skin OR exam OR cpt OR education OR factor OR appointment OR visit OR rad OR ptf)';
    }
    return fqDomain;
}

/**
 *
 * @param reqQuery
 * @param domain
 * @param queryParameters
 * @returns {*}
 */
function buildSolrQuery(reqQuery, domain, queryParameters) {
    if (!reqQuery || !reqQuery.pid) {
        return new Error('pid must be specified');
    }
    queryParameters = queryParameters || {};
    domain = domain || '*:*';
    var start = reqQuery.start || 0;
    var limit = reqQuery.limit || 101;

    //Default the filter query to the domain, except for the default which we expand to all domains utilizing the same query
    var fqDomain = getFilterQueryForDomain(domain);
    var defaultQueryParameters = {
        fl: [ // select these fields
            'uid',
            'datetime',
            'summary',
            'url',
            'kind',
            'facility_name'
        ],
        fq: [ // filter queries
            ('pid:' + reqQuery.pidJoinedList), ('domain:' + fqDomain),
            'domain:(NOT patient)'
        ],
        q: reqQuery.query,
        start: start,
        rows: limit,
        wt: 'json',
        synonyms: 'true',
        defType: 'synonym_edismax',
        hl: 'true',
        'hl.fl': ['summary', 'kind', 'facility_name'],
        'hl.fragsize': 45,
        'hl.snippets': 5
    };

    _.each(Object.keys(defaultQueryParameters), function(queryParameterType) {
        if (queryParameters.hasOwnProperty(queryParameterType)) {
            // if there are conflicting elements, resolve the merge below
            if (Array.isArray(defaultQueryParameters[queryParameterType])) {
                queryParameters[queryParameterType] = queryParameters[queryParameterType].concat(
                    defaultQueryParameters[queryParameterType]
                );
            }
            //            if (typeof defaultQueryParameters === 'string') {
            //                // do nothing for now, just keep the overridden query parameters
            //            }
            if (typeof defaultQueryParameters === 'object') {
                queryParameters[queryParameterType] = _.extend(
                    defaultQueryParameters[queryParameterType],
                    queryParameters[queryParameterType]
                );
            }
        } else {
            queryParameters[queryParameterType] = defaultQueryParameters[queryParameterType];
        }
    });

    var compiledQueryParameters = solrSimpleClient.compileQueryParameters(queryParameters);
    var solrQueryString = querystring.stringify(compiledQueryParameters);
    return solrQueryString;
}

/**
 * Perform domain-specific solr queries
 *
 * @param reqQuery
 * @param domain
 * @returns {*}
 */
function buildSpecializedSolrQuery(reqQuery, domain) {
    var buildSpecializedSolrQueryDispatch = {
        med: buildMedQuery,
        order: buildOrderQuery,
        document: buildDocumentQuery,
        vital: buildVitalQuery,
        result: buildLabQuery,
        lab: buildLabQuery,
        problem: buildProblemQuery,

        //suggest: buildSuggestQuery,
        //tasks: buildTasksQuery,
        //generic: buildGenericQuery,
        //wholeDomain: buildWholeDomainQuery,
        //labPanel: buildLabPanelQuery,
        //labGroup: buildLabGroupQuery,
        //infobuttonSearch: buildInfobuttonQuery  // HMP uses Infobutton as one word
        default: buildDefaultQuery
    };

    domain = domain.toLowerCase();
    if (buildSpecializedSolrQueryDispatch[domain]) {
        var specializedSolrQuery = buildSpecializedSolrQueryDispatch[domain](reqQuery, domain);
        return specializedSolrQuery;
    }
    return undefined;
}

function buildDefaultQuery(reqQuery, domain) {
    var queryString = buildSolrQuery(reqQuery, domain);
    return queryString;
}

function buildMedQuery(reqQuery, domain) {
    var queryParameters = {
        sort: 'overall_stop desc',
        fl: [
            'qualified_name',
            'va_type',
            'last_filled',
            'last_give',
            'med_drug_class_name'
        ],
        group: 'true',
        'group.field': 'qualified_name',
        'hl.fl': [
            'administration_comment',
            'prn_reason'
        ],
        'hl.fragsize': 72,
        'q.op': 'AND'
    };
    var solrQueryString = buildSolrQuery(reqQuery, domain, queryParameters);
    return solrQueryString;
}

function buildOrderQuery(reqQuery, domain) {
    var queryParameters = {
        fq: [
            'service:(LR OR GMRC OR RA OR FH OR UBEC OR "OR")',
            '-status_name:(COMPLETE OR "DISCONTINUED/EDIT" OR DISCONTINUED OR EXPIRED OR LAPSED)'
        ],
        fl: [
            'service',
            'status_name'
        ],
        'hl.fl': [
            'content'
        ]
    };
    var solrQueryString = buildSolrQuery(reqQuery, domain, queryParameters);
    return solrQueryString;
}

function buildDocumentQuery(reqQuery, domain) {
    var queryParameters = {
        fl: [
            'local_title',
            'phrase',
            'document_def_uid',
            'document_status',
            'author_uid',
            'signer_uid',
            'cosigner_uid',
            'attending_uid'
        ],
        sort: 'reference_date_time desc',
        'hl.fl': [
            'body',
            'subject'
        ]
    };
    var solrQueryString = buildSolrQuery(reqQuery, domain, queryParameters);
    return solrQueryString;
}

function buildVitalQuery(reqQuery, domain) {
    var queryParameters = {
        sort: 'observed desc',
        group: 'true',
        'group.field': 'qualified_name'
    };
    var solrQueryString = buildSolrQuery(reqQuery, domain, queryParameters);
    return solrQueryString;
}

function buildLabQuery(reqQuery, domain) {
    domain = 'result';
    var queryParameters = {
        fl: [
            'lnccodes',
            'type_code',
            'group_name',
            'observed',
            'interpretationName',
            'units'
        ],
        sort: 'observed desc',
        group: 'true',
        'group.field': 'qualified_name_units',
        'hl.fl': [
            'comment'
        ]
    };
    var solrQueryString = buildSolrQuery(reqQuery, domain, queryParameters);
    return solrQueryString;
}

function buildProblemQuery(reqQuery, domain) {
    var queryParameters = {
        fq: ['-removed:true'],
        fl: [
            'comment',
            'icd_code',
            'icd_name',
            'icd_group',
            'problem_status',
            'acuity_name'
        ],
        sort: 'problem_status asc',
        group: 'true',
        'group.field': 'icd_code'
    };
    var solrQueryString = buildSolrQuery(reqQuery, domain, queryParameters);
    return solrQueryString;
}
