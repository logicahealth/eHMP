'use strict';

var _ = require('lodash');
var rpcCategoryTransformer = require('../utils/rpc-categories-tilde-transformer');
var rpcUtil = require('../utils/rpc-util');
var validate = require('../utils/validation-util');


//----------------------------------------------------------------------------------------------------------------------

/**
 * ~Common Procedures
 * 'i5065^IVC FILTER REMOVAL^^n'​
 * ien=i5065
 * name=IVC FILTER REMOVAL
 * UNUSED ----- ​This is a hardcoded empty field.
 * UNKNOWN=n  ------  ​This field can by 'y', 'n', or empty.  If 'y', it means that the procedure requires radiologist approval.
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addCommonProcedures(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 4, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };

    if (categoryFields[3] === '1' || categoryFields[3] === 'y') {
        categoryEntry.requiresRadiologistApproval = true;
    }
    else if (categoryFields[3] === '0' || categoryFields[3] === 'n') {
        categoryEntry.requiresRadiologistApproval = false;
    }
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Last 7 Days:
 * i+ien^procedure name^case number^report status^imaging location IEN^imaging location name^contrast medium or media used
 * Note: Single characters indicate contrast involvement:
 * I=Iodinated ionic
 * N=Iodinated non-ionic
 * L=Gadolinium
 * C=Oral Cholecystographic
 * G=Gastrografin
 * B=Barium
 * M=unspecified contrast media​
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addLast7Days(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 7, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        ien: categoryFields[0],
        procedureName: categoryFields[1],
        caseNumber: categoryFields[2],
        reportStatus: categoryFields[3],
        imagingLocationIEN: categoryFields[4],
        imagingLocationName: categoryFields[5],
        contrastMedium: categoryFields[6]
    };

    if (categoryEntry.contrastMedium === 'I') {
        categoryEntry.constrastInvolvement = 'Iodinated ionic';
    }
    else if (categoryEntry.contrastMedium === 'N') {
        categoryEntry.constrastInvolvement = 'Iodinated non-ionic';
    }
    else if (categoryEntry.contrastMedium === 'L') {
        categoryEntry.constrastInvolvement = 'Gadolinium';
    }
    else if (categoryEntry.contrastMedium === 'C') {
        categoryEntry.constrastInvolvement = 'Oral Cholecystographic';
    }
    else if (categoryEntry.contrastMedium === 'G') {
        categoryEntry.constrastInvolvement = 'Gastrografin';
    }
    else if (categoryEntry.contrastMedium === 'B') {
        categoryEntry.constrastInvolvement = 'Barium';
    }
    else if (categoryEntry.contrastMedium === 'N') {
        categoryEntry.constrastInvolvement = 'unspecified contrast media​';
    }

    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}


/**
 * ~Submit to
 * i14^ANGIO SECTION^500^CAMP MASTER
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addSubmitToRegularEntry(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 4, categoryFields, categoryName)) {
        return;
    }

    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1],
        imagingLocation: categoryFields[2],
        institutionFile: categoryFields[3]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Submit to
 * d14^ANGIO SECTION
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addSubmitToDefaultEntry(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Submit to
 * i14^ANGIO SECTION^500^CAMP MASTER<br/>
 * d14^ANGIO SECTION
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addSubmitTo(logger, categories, categoryName, categoryType, categoryFields) {
    if (rpcCategoryTransformer.CATEGORY_DEFAULT_ENTRY === categoryType) {
        addSubmitToDefaultEntry(logger, categories, categoryName, categoryType, categoryFields);
    }
    else {
        addSubmitToRegularEntry(logger, categories, categoryName, categoryType, categoryFields);
    }
}

/**
 * Adds a category as either a default or a regular entry - expects to only have IEN and NAME as parameters.
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addCategoryIenName(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName)) {
        return;
    }

    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };
    if (rpcCategoryTransformer.CATEGORY_DEFAULT_ENTRY === categoryType) {
        rpcCategoryTransformer.addCategoryDefaultEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
    }
    else {
        rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
    }
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Since we know the names of our categories, this method determines which method to call based on the category.
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addCategoryEntry(logger, categories, categoryName, categoryFields) {
    if (!categoryFields && categoryFields.length === 0) {
        throw new Error('category entry for ' + categoryName + ' did not contain any fields');
    }
    if (validate.isStringNullish(categoryName)) {
        throw new Error('Cannot add a category entry if no category has been created: ' + categoryFields.join('^'));
    }

    var categoryType = categoryFields[0][0];
    categoryFields[0] = categoryFields[0].substring(1); //Remove the categoryType from the first entry

    if (categoryName === 'ShortList') {
        addCategoryIenName(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Common Procedures') {
        addCommonProcedures(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Modifiers') {
        addCategoryIenName(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Urgencies') {
        addCategoryIenName(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Transport') {
        addCategoryIenName(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Category') {
        addCategoryIenName(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Submit to') {
        addSubmitTo(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Ask Submit') {
        addCategoryIenName(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Last 7 Days') {
        addLast7Days(logger, categories, categoryName, categoryType, categoryFields);
    }
    else {                               //This is an unknown entry
    	logger.error('The RPC "ORWDRA32 DEF" returned data but we couldn\'t understand it: unknown category entry for "' + categoryName + '": rpcData=' + categoryType + '' + categoryFields.join('^'));
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
 * ~ShortList
 * ~Common Procedures
 * i5065^IVC FILTER REMOVAL^^n
 * ~Modifiers
 * ~Urgencies
 * i2^ASAP
 * i9^ROUTINE
 * i1^STAT
 * d9^ROUTINE
 * ~Transport
 * iA^AMBULATORY
 * iP^PORTABLE
 * iS^STRETCHER
 * iW^WHEELCHAIR
 * ~Category
 * iI^INPATIENT
 * iO^OUTPATIENT
 * iE^EMPLOYEE
 * iC^CONTRACT
 * iS^SHARING
 * iR^RESEARCH
 * ~Submit to
 * i14^ANGIO SECTION^500^CAMP MASTER
 * d14^ANGIO SECTION
 * ~Ask Submit
 * d1^YES
 * ~Last 7 Days
 * i6849096.8557-1^CT ABDOMEN W/CONT^59^Verified^232^CT SCAN^I
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
 *
 * ADDITIONAL NOTES:
 * ~ShortList and ~Modifiers = i+ien^name  and d+ien = default
 *
 * ~Common Procedures
 * 'i5065^IVC FILTER REMOVAL^^n'​
 * ien=i5065
 * name=IVC FILTER REMOVAL
 * UNUSED ----- ​This is a hardcoded empty field.
 * UNKNOWN=n  ------  ​This field is a boolean 0 or 1.  If = 1 means that the procedure requires radiologist approval.
 *
 * ​​~Last 7 Days:
 * i+ien^procedure name^case number^report status^imaging location IEN^imaging location name^
 * contrast medium or media used
 * Note: Single characters in parenthesis indicate contrast involvement:
 * (I)=Iodinated ionic;
 * (N)=Iodinated non-ionic;
 * (L)=Gadolinium;
 * (C)=Oral Cholecystographic;
 * (G)=Gastrografin;
 * (B)=Barium;
 * (M)=unspecified contrast media​
 *
 *
 * @param logger The logger
 * @param rpcData The String from the RPC that you want parsed
 */
module.exports.parse = function(logger, rpcData) {
    logger.info({rpcData: rpcData});

    var categories = [];
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
            categories.push(category);
        }
        else {
            addCategoryEntry(logger, categories, categoryName, categoryFields);
        }
    });

	//console.log(JSON.stringify(categories, null, 2));
    logger.info({categories: categories});
    return categories;
};
