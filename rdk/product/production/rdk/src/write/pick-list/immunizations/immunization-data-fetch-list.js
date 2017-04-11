'use strict';
var parse = require('./immunization-data-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var _ = require('lodash');


module.exports.apiDocs = {
    spec: {
        summary: 'Return an array of the entries from the IMMUNIZATION file (9999999.14)',
        notes: 'PXVIMM IMMDATA',
        parameters: [
            {
                name: 'site',
                description: 'The site that the RPC will query the data for.',
                type: 'string',
                required: true,
                paramType: 'query'
            },
            {
                name: 'pxvfilter',
                description: '4 possible values (R:XXX, S:A, S:H, S:*). R:XXX - return entry with IEN XXX. S:A - return list of active immunizations. S:H - return list of [selectable for] historic immunizations. S:* - return all records regardless of their status.',
                type: 'string',
                required: false,
                paramType: 'query'
            },
            {
                name: 'subfiles',
                description: 'A value of 1 or Y indicates that all subfile multiples should be included.  The first record of the returned array contains the count of records being returned. Each record is a caret-delimited list of values.',
                type: 'string',
                required: false,
                paramType: 'query'
            }
        ],
        responseMessages: []
    }
};

/**
 * Calls the RPC 'PXVIMM IMMDATA' and parses out the data<br/><br/>
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
 * 	<tr>
 * 	    <td>pxvfilter</td>
 * 	    <td>
 * 	        4 possible values (R:XXX, S:A, S:H, S:*). R:XXX - return entry with IEN XXX. S:A - return list of active immunizations. S:H - return list of [selectable for] historic immunizations. S:* - return all records regardless of their status.
 * 	    </td>
 * 	</tr>
 * 	<tr>
 * 	    <td>subfiles</td>
 * 	    <td>
 * 	        A value of 1 or Y indicates that all subfile multiples should be included.  The first record of the returned array contains the count of records being returned. Each record is a caret-delimited list of values.
 * 	    </td>
 * 	</tr>
 * </table>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */

module.exports.fetch = function (logger, configuration, callback, params) {

    var subfiles = _.get(params, 'subfiles') || '1';

    var pxvfilter = _.get(params, 'pxvfilter') || 'S:*';

    return rpcUtil.standardRPCCall(logger, configuration, 'PXVIMM IMMDATA', pxvfilter, subfiles, parse, callback);
};