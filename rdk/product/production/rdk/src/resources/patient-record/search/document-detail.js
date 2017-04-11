'use strict';

var util = require('util');
var querystring = require('querystring');
var _ = require('lodash');
var async = require('async');
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

    //var domain = req.query.domain;
    var pid = req.query.pid;
    var query = req.query.query;
    //var domain = req.query.domain;
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

    async.waterfall(
        [
            req.app.subsystems.jdsSync.getPatientAllSites.bind(null, pid, req),
            function(jdsResponse, callback) {
                if (jdsResponse.data.error) {
                    return callback(jdsResponse.data.error);
                }

                var pids = _.pluck(jdsResponse.data.data.items, 'pid');
                var grouping = util.format('%s:"%s"', group_field, group_value);

                var fq = [
                    'pid:(' + pids.join(' OR ') + ')',
                    grouping
                ];
                if (group_field === 'local_title') {
                    fq.push('domain: document');
                }

                var queryParameters = {
                    q: util.format('%s', query),
                    sort: 'datetime desc,reference_date_time desc',
                    fq: fq,
                    //fl: [
                    //    'uid'
                    //],
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
                //
                //if(req.query.range) {
                //    // TODO
                //}
                //if(req.query.stop_code_name) {
                //
                //}
                return solrSimpleClient.executeSolrQuery(querystring.stringify(queryParameters), 'select', req, callback);
            }
        ],
        function(err, response) {
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
