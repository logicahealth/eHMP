'use strict';

var _ = require('lodash');
var async = require('async');
var rdk = require('../../../core/rdk');
var parse = require('./people-for-facility-parser').parse;
var requestsPickListUtil = require('./requests-picklists-utils');

module.exports.fetch = function(logger, configuration, callback, params) {
    var fullConfig = _.get(params, 'fullConfig');
    if (!fullConfig) {
        callback('people-for-facility: missing fullConfig parameter');
        return;
    }

    var facilityID = _.get(params, 'facilityID');
    var facilitySiteCode = requestsPickListUtil.getSiteCode(fullConfig.vistaSites, facilityID);

    var datastore = 'ehmpusers';
    var query = '?filter=like(uid,"urn:va:user:' + facilitySiteCode + '%25")';
    var options = _.extend({}, fullConfig.generalPurposeJdsServer, {
        url: datastore + '/' + query,
        logger: logger,
        json: true
    });

    rdk.utils.http.get(options, function(err, response, responseBody) {
        if (err) {
            callback(err);
            return;
        }
        var results = [];
        async.eachSeries(responseBody.items, function(item, cb) {
            rdk.utils.http.get(_.extend({}, fullConfig.jdsServer, {
                url: 'data/' + _.get(item, 'uid'),
                logger: logger,
                json: true
            }), function(err, response, responseBody) {
                if (err) {
                    logger.warn(err);
                    cb();//Don't bail on the whole operation over this.
                    return;
                }
                if (responseBody.data && responseBody.data.items) {
                    logger.trace('people picklist item responseBody.data.items: ' + JSON.stringify(responseBody.data.items));
                    results.push(parse(responseBody.data.items[0], facilitySiteCode));
                }
                cb();
            });
        }, function(err) {
            callback(err, results);
        });
    });
};
