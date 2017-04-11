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

    var query = req.query.query;
    var group_value = req.query['group.value'];
    var group_field = req.query['group.field'];


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

    var grouping = util.format('%s:"%s"', group_field, group_value);

    var patientPIDList = [];
    _.each(req.interceptorResults.patientIdentifiers.allSites, function(pid){
        patientPIDList.push(pid);
    });

    req.logger.debug({patientPIDList: patientPIDList}, 'document-details.js patientPIDList');

    var fq = [
        'pid:(' + patientPIDList.join(' OR ') + ')',
        grouping
    ];
    if (group_field === 'local_title') {
        fq.push('domain: document');
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
