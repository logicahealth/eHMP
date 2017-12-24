'use strict';

var util = require('util');
var querystring = require('querystring');
var _ = require('lodash');
var solrSimpleClient = require('./solr-simple-client');
var rdk = require('../../../core/rdk');

module.exports = getDocumentDetail;
module.exports.description = {
    get: 'Get text search result detail where the items in a group are text documents'
};

function getDocumentDetail(req, res) {

    var missingParameters = ['pid', 'query', 'group.value', 'group.field'];
    _.remove(missingParameters, function(name) {
        return req.query[name];
    });
    if (!_.isEmpty(missingParameters)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing parameter(s) ' + missingParameters.join(', '));
    }

    var query = solrSimpleClient.escapeQueryChars(req.query.query, true);
    var group_value = solrSimpleClient.escapeQueryChars(req.query['group.value']);
    var group_field = solrSimpleClient.escapeQueryChars(req.query['group.field']);
    var domain = req.query.domain;

    /*
     /solr/select?
     q=pid:+<pid>&
     rows=1000&
     fq={!tag=dt}datetime:[<hl7date> TO *]  // if date range included
     fq=domain:encounter&                   // required
     fq=<query>&                            // if query included
     fq=stop_code_name:"<location>"&        // if location included
     sort=visit_date_time+desc&
     */


    var grouping = null;
    if (group_value !== 'undefined') {
        grouping = util.format('%s:"%s"', group_field, group_value);
    } else {
        //DE8275: Domains that are grouped by optional values end up being grouped by the fact that they lack the attribute.
        //in such case, we set the grouping to a group that does not have the field defined for that domain.
        grouping = util.format('-%s:[* TO *]', group_field);
    }
    var patientPIDList = [];
    _.each(req.interceptorResults.patientIdentifiers.allSites, function(pid) {
        patientPIDList.push(pid);
    });

    req.logger.debug({patientPIDList: patientPIDList}, 'document-details.js patientPIDList');

    var fq = [
        'pid:(' + patientPIDList.join(' OR ') + ')',
        grouping
    ];

    if(domain){
        fq.push('domain: '+ domain);
    }

    req.logger.debug('document-details.js fq: %j', fq);

    var queryParameters = {
        q: util.format('%s', query),
        sort: 'datetime desc,reference_date_time desc',
        fq: fq,
        hl: true,
        'hl.fragsize': 60,
        'hl.snippets': 10,
        'hl.fl': [
            'body',
            'subject'
        ],
        'hl.simple.pre':'{{addTag "',
        'hl.simple.post': '" "mark" "cpe-search-term-match"}}',
        defType: 'synonym_edismax',
        synonyms: true,
        qs: 4,
        qf: 'all',
        wt: 'json',
        rows: 1000
    };
    return solrSimpleClient.executeSolrQuery(querystring.stringify(queryParameters), 'select', req,
        function (err, response) {
            if (!err && response.error) {
                err = response.error;
            }
            if (err) {
                req.logger.error(err);
                return res.status(_.isNumber(err.code) ? err.code : 500).rdkSend(err.message || err);
            }

            var formattedResponse = {
                data: {
                    items: {
                        results: response.response.docs,
                        highlights: response.highlighting
                    }
                }
            };
            res.status(200).rdkSend(formattedResponse);
        }
    );
}
