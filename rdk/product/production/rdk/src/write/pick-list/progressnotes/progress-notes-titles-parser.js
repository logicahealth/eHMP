'use strict';

var _ = require('lodash');
var PROGRESS_NOTES_CLASS = 'CLINICAL DOCUMENTS->PROGRESS NOTES';
var ADDENDUM_CLASS = 'CLINICAL DOCUMENTS->ADDENDUM';
var CONSULT_CLASS = 'CLINICAL DOCUMENTS->PROGRESS NOTES->CONSULTS';
/**
 * @param logger The logger
 * @param line The string to parse
 */
function createProgressNotesTitles(logger, line) {
    logger.debug('progress notes title : ' + line);

    var FIELDS_LENGTH_EXPECTED = 2;

    var fields = line.split('^');
    if (fields.length < FIELDS_LENGTH_EXPECTED) {
        logger.error('The RPC returned data but we couldn\'t understand it: ' + line);
        return null;
    }

    var classes = fields.slice(2);
    var i;
    var classHierarchy = '';
    for (i = classes.length - 1; i > 0; i -= 2) {
        classHierarchy += classHierarchy.length > 0 ? '->' + classes[i] : classes[i];
    }

    if (classHierarchy.indexOf(PROGRESS_NOTES_CLASS) !== 0 && classHierarchy.indexOf(ADDENDUM_CLASS) !== 0 || classHierarchy.indexOf(CONSULT_CLASS) === 0) {
        logger.info({classHierarchy: classHierarchy}, 'Title, ' + fields[1] + ', rejected.');
        return null;
    }

    var obj = {
        ien: fields[0],
        name: fields[1]
    };

    logger.debug({
        obj: obj
    });
    return obj;
}

/**
 * Takes the return string from the RPC 'TIU LONG LIST OF TITLES' and parses out the data.
 *
 * @param logger The logger
 * @param rpcData The string to parse
 * @returns Array of (ien, name) pairs.
 */
module.exports.parse = function(logger, rpcData) {
    logger.info({
        rpcData: rpcData
    });

    var retValue = [];
    var filteredProgressNotesTitles = rpcData.split('\r\n');
    filteredProgressNotesTitles = _.filter(filteredProgressNotesTitles, Boolean); //Remove all of the empty Strings.

    _.each(filteredProgressNotesTitles, function(line) {
        var obj = createProgressNotesTitles(logger, line);
        if (obj) {
            retValue.push(obj);
        }
    });

    //console.log(JSON.stringify(retValue, null, 2));
    logger.info({
        retValue: retValue
    });
    return retValue;
};
