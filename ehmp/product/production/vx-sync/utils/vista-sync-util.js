'use strict';

//---------------------------------------------------------------------------------------------
// This is utility that contains shared code used when retrieving and manipulating Vista
// data as part of the sync process.
//
// @Author: Les Westberg
//---------------------------------------------------------------------------------------------

require('../env-setup');
var _ = require('underscore');

//-------------------------------------------------------------------------------------------
// If VistA sends back a response that  cannot be parsed as JSON, we need to see if we can
// find the allocationToken value in this - by simply locating it through a string search.
//
// rawResponse: The string form of the response from VistA.
//-------------------------------------------------------------------------------------------
function extractAllocationTokenFromRawResponse (log, rawResponse) {
    var allocationToken = null;
    if ((_.isString(rawResponse)) && (!_.isEmpty(rawResponse))) {
        // Quickest way to get this, is to extract just the allocationToken fields.  Ours should always be first.  So get them,
        // if we get an array of them throw away all but the first.  Wrap it in {} and parse it as JSON.
        //----------------------------------------------------------------------------------------------------------------
        var allocationTokenFields = rawResponse.match(/\"allocationToken\"\s*\:\s*\"\d+\"/g);
        if (_.isArray(allocationTokenFields)) {
            allocationTokenFields = allocationTokenFields[0];
        }
        if ((_.isString(allocationTokenFields)) && (!_.isEmpty(allocationTokenFields))) {
            var allocationTokenObj = null;
            try {
                allocationTokenObj = JSON.parse('{' + allocationTokenFields + '}');
                allocationToken = allocationTokenObj.allocationToken;
            }
            catch (e) {
                log.error('viata-record-poller._extractAllocationTokenFromRawResponse: Failed to extract the allocationToken value from the raw response.  rawResponse: %s', rawResponse);
            }
        }
    }

    return allocationToken;
}

module.exports.extractAllocationTokenFromRawResponse = extractAllocationTokenFromRawResponse;
