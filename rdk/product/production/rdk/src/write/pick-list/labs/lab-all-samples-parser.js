'use strict';

var _ = require('lodash');
var rpcCategoryTransformer = require('../utils/rpc-categories-tilde-transformer');
var rpcUtil = require('../utils/rpc-util');

function addSampleTime(logger, retValue, categoryName, categoryFields) {
    var SAMP_FIELD_LENGTH_2 = 2;
    var SAMP_FIELD_LENGTH_1 = 1;
    var categoryType = categoryFields[0][0];
    var categoryEntry = {};

    if (categoryFields.length === SAMP_FIELD_LENGTH_2) {
        categoryType = 'i';

        categoryEntry = {
            ien: categoryFields[0],
            name: categoryFields[1]
        };
    } else if (categoryFields.length === SAMP_FIELD_LENGTH_1) {
        categoryEntry = categoryFields[0];
    } else if (categoryFields.length > SAMP_FIELD_LENGTH_2) {
        if(categoryFields[1]){
            categoryEntry.ien = categoryFields[1];
        }
        if(categoryFields[2]){
            categoryEntry.name = categoryFields[2];
        }
        if(categoryFields[3]){
            categoryEntry.specPtr = categoryFields[3];
        }
        if(categoryFields[4]){
            categoryEntry.tubeTop = categoryFields[4];
        }
        if(categoryFields[7]){
            categoryEntry.labCollect = categoryFields[7];
        }
        if(categoryFields[9]){
            categoryEntry.specName = categoryFields[9];
        }
    }

    addEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

function addEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry) {
    if (rpcCategoryTransformer.CATEGORY_DEFAULT_ENTRY === categoryType) {
        rpcCategoryTransformer.addCategoryDefaultEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
    } else {
        rpcCategoryTransformer.addCategoryRegularEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
    }
}


/**
 * Since we know the names of our categories, this method determines which method to call based on the category.
 */
function addCategoryEntry(logger, retValue, categoryName, categoryFields) {
    if (categoryName === null) {
        throw new Error('Cannot add a category entry if no category has been created: ' + categoryFields[0]);
    }
    if (!categoryFields && categoryFields.length === 0) {
        throw new Error('categoryFields must have at least one entry');
    }

    if (categoryFields.length === 2 || categoryFields.length === 8 || categoryFields.length === 10) {
        addSampleTime(logger, retValue, categoryName, categoryFields);
    }
    else {
        logger.error('The RPC "ORWDLR32 ALLSAMP" returned data but we couldn\'t understand it: unknown category entry "' + categoryName + '"');
    }
}

/**
 * Takes the return string from the RPC 'ORWDLR32 ALLSAMP' and parses out the data.<br/><br/>
 *
 * Each element is as follows:<br/>
 * ~CollSamp
 * List of all collection samples<br>/
 * ~Specimens
 * List of all specimens<br/>
 * @param logger The logger
 * @param rpcData The String from the RPC that you want parsed
 * @returns {Array}
 */
module.exports.parse = function(logger, rpcData) {
    logger.info({rpcData: rpcData});

    var retValue = [];
    var lines = rpcData.split('\r\n');
    var categoryName = null;
    lines = rpcUtil.removeEmptyValues(lines);

    _.each(lines, function(line) {
        var categoryFields = line.split('^');
        if (rpcCategoryTransformer.isCategoryEntry(categoryFields)) {
            categoryName = categoryFields[0].substring(1);
            var category = {
                categoryName: categoryName
            };

            logger.debug({categoryName: categoryName});
            retValue.push(category);
        }
        else {
            addCategoryEntry(logger, retValue, categoryName, categoryFields);
        }
    });

    logger.info({retValue: retValue});
    return retValue;
};
