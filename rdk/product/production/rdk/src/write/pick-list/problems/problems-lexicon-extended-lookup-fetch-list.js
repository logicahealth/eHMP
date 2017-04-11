'use strict';
var fetch = require('../multifunction/orqqpl4-lex-lookup-fetch-list').getOrqqpl4LexLookUp;
var validate = require('./../utils/validation-util');
var dateConverter = require('../../../utils/fileman-date-converter');
var _ = require('lodash');


/**
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>searchString</td>
 * 		<td>
 * 			used when an RPC call requires a minimum of 3 characters in order to return data<br/>
 * 			This is not a filter - it is a search string.  For example, searching for RAD may return RADIACARE;<br/>
 * 			however, searching for DIA will not return RADIACARE.  Also, the search term may not always be the<br/>
 * 			first 3 characters.  For example, DIA will also return "CONTRAST MEDIA <DIAGNOSTIC DYES>".
 * 		</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>date</td>
 * 		<td>
 * 			If not supplied will default to zero (which means today)
 * 		</td>
 * 	</tr>
 * </table>
 * <br/><br/>
 *
 *
 * Returns the following data for Problems:<br/>
 * lexIen<br/>
 * prefText<br/>
 * icdCodes<br/>
 * icdIen<br/>
 * codeSys<br/>
 * conceptId<br/>
 * desigId<br/>
 * icdVer
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var searchString = _.get(params, 'searchString');
    var date = _.get(params, 'date');
    var synonym = _.get(params, 'synonym');
    var limit = _.get(params, 'limit');
    var noMinimumLength = _.get(params, 'noMinimumLength');


    if (validate.isStringNullish(date)) {
        date = 0;
    } else {
        date = dateConverter.getFilemanDateWithArgAsStr(date);
    }

    if (validate.isStringNullish(synonym)) {
        synonym = 0;
    }

    if (validate.isStringNullish(limit)) {
        limit = 0;
    } else {
        limit = parseInt(limit, 10) || 0;
    }

    var view = 'CLF';

    fetch(logger, configuration, searchString, view, date, synonym, noMinimumLength, function(err, results, statusCode){
        if (err) {
            if (! _.isUndefined(results) && ! _.isUndefined(statusCode)) {
                return callback(err, null, statusCode);
            } else {
                logger.error('problem fetch failed: %s', err);
                return callback(err);
            }
        }

        if (results.length === 1) {
            // no records found and it is only an RPC message
            logger.debug(results[0]);
            return callback(results[0], null, 456);

        }
        var resultCount = results.length - 1; // it contains a line returning a number of records found
        if (limit !== 0 && limit < resultCount) {
            var message = 'Your search ' + searchString +  ' returns more records than your limit. Refine your search and try again';
            logger.debug('limit reached, limit: %d, number of records returned: %d', limit, results.length);

            return callback(message, null, 456);
        }

        return callback(err, results);
    });
};
