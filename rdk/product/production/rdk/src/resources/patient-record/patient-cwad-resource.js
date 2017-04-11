/**
 * Created by alexluong on 10/21/14.
 */

'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var querystring = require('querystring');

module.exports.getResourceConfig = function() {
    return [{
        name: 'patient-record-cwad',
        path: '',
        get: getPatientCwad,
        interceptors: {
            jdsFilter: true
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: true,
        outerceptors: ['asu'],
        subsystems: ['patientrecord','jds','solr','jdsSync','authorization']
    }];
};

function getPatientCwad(req, res) {
    var pid = req.query.pid;

    if(nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    var jdsResource = '/vpr/' + pid + '/index/cwad';
    var jdsQuery = _.pick(req.query, 'start', 'limit', 'filter', 'order');
    var jdsPath = jdsResource + '?' + querystring.stringify(jdsQuery);

    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    rdk.utils.http.get(options,
        function(err, response, data) {
            if(err) {
                return res.status(500).rdkSend(err);
            }
            res.status(response.statusCode).rdkSend(data);
        }
    );

}




