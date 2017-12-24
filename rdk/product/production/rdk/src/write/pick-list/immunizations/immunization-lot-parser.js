'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

var RCP_RESULT_MAP = [
    'ien',
    'lotNumber',
    ['manufacturerNumber', 'manufacturer'],
    ['statusNumber', 'status'],
    ['vaccineNumber', 'vaccine'],
    ['shortExpirationDate', 'expirationDate'],
    'doesUnused',
    'lowSupplyAlert',
    ['ndcInternal', 'ndcCodeVa'],
    ['facilityCode', 'associatedFacility']
];

var NO_RECORDS_FOUND_RESPONSE = '0 RECORDS\r\n';

/**
 * Returns with PXVI equal to 1:
 * PXVRETRN  - returned information is stored in ^TMP("PXVLST",$J))
 *
 * Each record is a caret-delimited list of values. Within the
 * caret-delimited list, for fields with different internal and external
 * values, both the internal and external values are included, delimited
 * by a tilde (~) as indicated below:
 *
 * Piece# Field# Field Name
 * ------ ------ ----------
 * 1             IEN
 * 2      .01    LOT NUMBER
 * 3      .02    MANUFACTURER  (Internal~External)
 * 4      .03    STATUS (Internal~External)
 * 5      .04    VACCINE (Internal~External)
 * 6      .09    EXPIRATION DATE (Internal~External)
 * 7      .12    DOSES UNUSED
 * 8      .15    LOW SUPPLY ALERT
 * 9      .18    NDC CODE (VA) (Internal~External)
 * 10      .1     ASSOCIATED VA FACILITY (Internal~External)
 *
 * Example Alternate Global Array:
 * ^TMP("PXVLST",$J,0)=1 RECORD
 *      6)="6^P92A8769LN^49~SCLAVO, INC.^0~ACTIVE^41~ANTHRAX^
 *           3161231~DEC 31, 2016^93^10^~^500~ALBANY"
 *
 * @param logger The logger
 * @param rpcData The string to parse
 */
module.exports.parse = function(logger, rpcData) {
    logger.debug({
        rpcData: rpcData
    });

    if (rpcData === NO_RECORDS_FOUND_RESPONSE) {
        return [];
    }

    var allRecords = rpcData.split('\r\n');

    allRecords = rpcUtil.removeEmptyValues(allRecords);
    if (!allRecords.length) {
        return [];
    }

    // The first value is the number of records returned we don't need that
    allRecords = allRecords.slice(1);

    return _.map(allRecords, function(val) {
        var data = val.split('^');
        if (data.length !== 10) {
            logger.info({
                val: val
            }, 'immunizations-lot-fetch-parse: Data did not meet preconditions');
            throw new Error('Parsing precondition not met');
        }

        var record = {};
        _.each(RCP_RESULT_MAP, function(key, index) {
            if (_.isString(key)) {
                record[key] = data[index];
            } else {
                var dataArr = data[index].split('~');
                record[key[0]] = dataArr[0];
                record[key[1]] = dataArr[1];
            }
        });
        return record;
    });
};
