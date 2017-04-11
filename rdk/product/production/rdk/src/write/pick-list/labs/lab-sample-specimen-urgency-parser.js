'use strict';

var _ = require('lodash');
var rpcUtil = require('../utils/rpc-util');
var rpcCategoryTransformer = require('../utils/rpc-categories-tilde-transformer');


//----------------------------------------------------------------------------------------------------------------------

/**
 * ~Test Name
 * d1,25-DIHYDROXYVIT D
 */
function addTestName(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName);
    var categoryEntry = {
        name: categoryFields[0]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Item ID
 * d431^CH
 */
function addItemID(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName);
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~OIMessage
 * tTest is sent out to Nishols Inst. Allow 4-6 weeks for results.
 */
function addOIMessage(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName);
    rpcCategoryTransformer.addCategoryTextEntry(logger, retValue, categoryName, categoryType, categoryFields);
}

function addCollSampRegularEntry(logger, retValue, categoryName, categoryType, categoryFields) {
    if (categoryFields.length === 9) {
        rpcCategoryTransformer.validateCategoryArraySize(logger, 9, categoryFields, categoryName);
    }
    else {
        rpcCategoryTransformer.validateCategoryArraySize(logger, 10, categoryFields, categoryName);
    }
    var categoryEntry = {
        n: categoryFields[0],
        ien: categoryFields[1],
        name: categoryFields[2],
        specPtr: categoryFields[3],
        tubeTop: categoryFields[4],
        //"Looking at the code it is hard coded with those ^^^ pieces. This is typically done to add more data or due to
        //data being removed from the call and to prevent having to change every parser when it gets removed." Christopher Edwards.
        unused1: categoryFields[5],
        unused2: categoryFields[6],
        labCollect: categoryFields[7],
        unused3: categoryFields[8]
    };

    //The case of having 10 entries means the specName is known.  If it's not, CPRS displays the word "Other" and when
    //they select it a new dialog comes up for them to select from.
    if (categoryFields.length === 10) {
        categoryEntry.specName = categoryFields[9];
    }
    rpcCategoryTransformer.addCategoryRegularEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

function addCollSampTextEntry(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName);
    rpcCategoryTransformer.addCategoryTextEntry(logger, retValue, categoryName, categoryType, categoryFields);
}
/**
 * ~CollSamp
 * i1^1^BLOOD  ^72^GOLD TOP^^^1^^SERUM
 * tTEST OF WARD REMARKS FIELD !!!
 *
 * From here: https://github.com/OSEHRA/VistA-M/blob/master/Packages/Order%20Entry%20Results%20Reporting/Routines/ORWDLR32.m
 * n^SampIEN^SampName^SpecPtr^TubeTop^^^LabCollect^^SpecName
 */
function addCollSamp(logger, retValue, categoryName, categoryType, categoryFields) {
    if (rpcCategoryTransformer.CATEGORY_REGULAR_ENTRY === categoryType) {
        addCollSampRegularEntry(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (rpcCategoryTransformer.CATEGORY_TEXT_ENTRY === categoryType) {
        addCollSampTextEntry(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else {
        throw new Error('Unknown categoryType within category: "' + categoryName + '": categoryType=' + categoryType);
    }
}

/**
 * ~Default CollSamp
 * d1
 */
function addDefaultCollSamp(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName);
    var categoryEntry = {
        value: categoryFields[0]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~GenWardInstructions
 * tTest is sent out to Nishols Inst. Allow 4-6 weeks for results.
 */
function addGenWardInstructions(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName);
    rpcCategoryTransformer.addCategoryTextEntry(logger, retValue, categoryName, categoryType, categoryFields);
}

/**
 * ~Lab CollSamp
 * d1
 */
function addLabCollSamp(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName);
    var categoryEntry = {
        value: categoryFields[0]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~ReqCom
 * dANTICOAGULATION
 */
function addReqCom(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName);
    var categoryEntry = {
        name: categoryFields[0]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Specimens
 * i72^SERUM
 */
function addSpecimens(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName);
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Unique CollSamp
 * d1
 */
function addUniqueCollSamp(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName);
    var categoryEntry = {
        value: categoryFields[0]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Urgencies
 * i9^ROUTINE^1
 */
function addUrgencies(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 3, categoryFields, categoryName);
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1],
        parent: categoryFields[2]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Default Urgency
 * d9^ROUTINE^1
 */
function addDefaultUrgencies(logger, retValue, categoryName, categoryType, categoryFields) {
    rpcCategoryTransformer.validateCategoryArraySize(logger, 3, categoryFields, categoryName);
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1],
        parent: categoryFields[2]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, retValue, categoryName, categoryType, categoryFields, categoryEntry);
}

//----------------------------------------------------------------------------------------------------------------------

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

    var categoryType = categoryFields[0][0];
    categoryFields[0] = categoryFields[0].substring(1); //Remove the categoryType from the first entry

    if (categoryName === 'Test Name') {
        addTestName(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Item ID') {
        addItemID(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'OIMessage') {
        addOIMessage(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'CollSamp') {
        addCollSamp(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Default CollSamp') {
        addDefaultCollSamp(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'GenWardInstructions') {
        addGenWardInstructions(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Lab CollSamp') {
        addLabCollSamp(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'ReqCom') {
        addReqCom(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Specimens') {
        addSpecimens(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Unique CollSamp') {
        addUniqueCollSamp(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Urgencies') {
        addUrgencies(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Default Urgency') {
        addDefaultUrgencies(logger, retValue, categoryName, categoryType, categoryFields);
    }
    else {                               //This is an unknown entry
        throw new Error('The RPC "ORWDLR32 LOAD" returned data but we couldn\'t understand it: unknown category entry "' + categoryName + '"');
    }
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * The RPC returns data in the following format:<br/>
 * ~category<br/>
 * i+delimited string = entry<br/>
 * d+delimited string = default<br/>
 * t+string = text<br/><br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * ~Test Name
 * d1,25-DIHYDROXYVIT D
 * ~Item ID
 * d431^CH
 * ~OIMessage
 * tTest is sent out to Nishols Inst. Allow 4-6 weeks for results.
 * ~CollSamp
 * i1^1^BLOOD  ^72^GOLD TOP^^^1^^SERUM
 * ~Default CollSamp
 * d1
 * ~GenWardInstructions
 * tTest is sent out to Nishols Inst. Allow 4-6 weeks for results.
 * ~Lab CollSamp
 * d1
 * ~ReqCom
 * dANTICOAGULATION
 * ~Specimens
 * i72^SERUM
 * ~Unique CollSamp
 * d1
 * ~Urgencies
 * i9^ROUTINE^1
 * ~Default Urgency
 * d9^ROUTINE^1
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
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

    //console.log(JSON.stringify(retValue, null, 2));
    logger.info({retValue: retValue});
    return retValue;
};
