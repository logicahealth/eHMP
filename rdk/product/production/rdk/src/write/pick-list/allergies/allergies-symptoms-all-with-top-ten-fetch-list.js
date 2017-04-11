'use strict';
var async = require('async');
var fetchTopTen = require('./allergies-symptoms-top-ten-fetch-list').fetch;
var fetchAllSymptoms = require('./allergies-symptoms-fetch-list').fetch;

/**
 * Calls the RPC 'ORWDAL32 DEF' and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr><td colspan=2><b>NONE</b></td></tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr><td colspan=2><b>NONE</b></td></tr>
 * </table>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 */
module.exports.fetch = function(logger, configuration, callback) {
    async.parallel({
        topTen: function(cb) {
            fetchTopTen(logger, configuration, function(err, result){
                cb(err, result);
            });
        },
        allSymptoms: function(cb) {
            fetchAllSymptoms(logger, configuration, function(err, result){
                cb(err, result);
            });
        }
    }, function(err, results) {
        if (err) {
            return callback(err);
        }

        var allergiesEndpointsCombined = {
            topTen: results.topTen,
            allSymptoms: results.allSymptoms
        };
        callback(null, allergiesEndpointsCombined);
    });
};
