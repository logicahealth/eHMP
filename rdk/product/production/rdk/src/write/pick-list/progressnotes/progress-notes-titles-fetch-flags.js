'use strict';

var async = require('async');
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var parse = require('./progress-notes-titles-fetch-flags-parser-object').parse;
var _ = require('lodash');


/**
 * Calls the RPCs to get the flags for a progress note title.<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>ien</td>
 * 		<td>The progress note title ien.</td>
 * 	</tr>
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
 * @param callback The function to call when finished.
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var ien = _.get(params, 'ien');

    if (validate.isStringNullish(ien)) {
        return callback('ien cannot be empty');
    }

    async.parallel({
        surgeryFlag: function(cb) {
            rpcUtil.standardRPCCall(logger, configuration, 'TIU IS THIS A SURGERY?', ien, parse, function(err, result) {
                cb(err, result);
            });
        },
        oneVisitFlag: function(cb) {
            rpcUtil.standardRPCCall(logger, configuration, 'TIU ONE VISIT NOTE?', ien, parse, function(err, result) {
                cb(err, result);
            });
        },
        prfFlag: function(cb) {
            rpcUtil.standardRPCCall(logger, configuration, 'TIU ISPRF', ien, parse, function(err, result) {
                cb(err, result);
            });
        },
        consultFlag: function(cb) {
            rpcUtil.standardRPCCall(logger, configuration, 'TIU IS THIS A CONSULT?', ien, parse, function(err, result) {
                cb(err, result);
            });
        }
    }, function(err, results) {
        if (err) {
            return callback(err);
        }

        var flags = {
            isSurgeryNote: results.surgeryFlag.flag,
            isOneVisitNote: results.oneVisitFlag.flag,
            isPrfNote: results.prfFlag.flag,
            isConsultNote: results.consultFlag.flag
        };
        callback(null, flags);
    });
};
