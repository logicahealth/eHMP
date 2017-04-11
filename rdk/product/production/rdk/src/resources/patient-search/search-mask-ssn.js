'use strict';

var _ = require('lodash');
var async = require('async');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var moment = require('moment');

module.exports.maskPtSelectSsn = maskPtSelectSsn;
module.exports.maskSsn = maskSsn;
module.exports.getLoc = getLoc;

function getLoc(req, obj, callback) {
    if (obj.data && obj.data.items) {
        var items = obj.data.items;
        var options = _.extend({}, req.app.config.jdsServer, {
            url: '',
            logger: req.logger,
            json: true
        });
        async.eachSeries(items, function(item, done) {
            options.url = '/vpr/' + item.pid;
            httpUtil.get(options, function(error, response, result) {
                if (error) {
                    req.logger.error('Error performing search', (error.message || error));
                    error.message = 'There was an error processing your request. The error has been logged.';
                    return done(error);
                } else if (response.statusCode === 400) {
                    return done();
                } else if (response.statusCode >= 300) {
                    return done({
                        status: response.statusCode,
                        message: result
                    });
                } else {
                    item.roomBed = result.data.items[0].roomBed;
                    return done();
                }
            });

        }, function done(error) {
            callback(error, obj);
        });
    }
}

function maskPtSelectSsn(jdsResponse) {
    var items = ((jdsResponse || {}).data || {}).items || jdsResponse || [];
    _.each(items, function(item) {
        //Don't format "*SENSITIVE*" values
        if (!item.ssn || typeof item.ssn !== 'string' || item.sensitive) {
            return;
        }
        var maskedSsn = maskSsn(item.ssn);
        item.ssn = maskedSsn;
    });
    return jdsResponse;
}

/**
 * Masks an SSN. Replaces the first five numerical characters with asterisks.
 *
 * @param {string} ssn - The ssn to mask.
 * @return {string} maskedSsn - The masked SSN.
 */
function maskSsn(ssn) {
    var last4 = /(.*)(.{4})/;
    var validSsn = ssn.match(last4);
    if (!validSsn) {
        return;
    }
    var maskedSsn = validSsn[1].replace(/[^-]/g, '*') + validSsn[2];
    return maskedSsn;
}
