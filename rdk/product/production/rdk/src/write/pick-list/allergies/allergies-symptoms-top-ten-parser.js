'use strict';

var _ = require('lodash');
var rpcCategoryTransformer = require('../utils/rpc-categories-tilde-transformer');
var rpcUtil = require('../utils/rpc-util');
var validate = require('../utils/validation-util');


//----------------------------------------------------------------------------------------------------------------------

/**
 * ~Allergy Types
 * iD^Drug
 * iF^Food
 * iO^Other
 * iDF^Drug,Food
 * iDO^Drug,Other
 * iFO^Food,Other
 * iDFO^Drug,Food,Other
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addAllergyTypes(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Reactions
 * iD^Drug
 * iF^Food
 * iO^Other
 * iDF^Drug,Food
 * iDO^Drug,Other
 * iFO^Food,Other
 * iDFO^Drug,Food,Other
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addReactions(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Nature of Reaction
 * iA^Allergy
 * iP^Pharmacological
 * iU^Unknown
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addNatureOfReaction(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Top Ten
 * i39^ANXIETY
 * i2^ITCHING,WATERING EYES
 * i6^ANOREXIA
 * i66^DROWSINESS
 * i8^NAUSEA,VOMITING
 * i9^DIARRHEA
 * i1^HIVES
 * i67^DRY MOUTH
 * i69^DRY NOSE
 * i133^RASH
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addTopTen(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Observ/Hist
 * io^Observed
 * ih^Historical
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addObservHist(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Severity
 * i3^Severe
 * i2^Moderate
 * i1^Mild
 *
 * @param logger The logger
 * @param categories The collection of categories that we want to add an entry to
 * @param categoryName The name of the current category that we are adding entries to
 * @param categoryType The type of category entry
 * @param categoryFields The fields to be added to an individual category entry.
 */
function addSeverity(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        ien: categoryFields[0],
        name: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
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

    if (categoryName === 'Allergy Types') {
        addAllergyTypes(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Reactions') {
        addReactions(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Nature of Reaction') {
        addNatureOfReaction(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Top Ten') {
        addTopTen(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Observ/Hist') {
        addObservHist(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Severity') {
        addSeverity(logger, categories, categoryName, categoryType, categoryFields);
    }
    else {                               //This is an unknown entry
    	logger.error('The RPC "ORWDAL32 DEF" returned data but we couldn\'t understand it: unknown category entry for "' + categoryName + '": rpcData=' + categoryType + '' + categoryFields.join('^'));
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
 * ~Allergy Types
 * iD^Drug
 * iF^Food
 * iO^Other
 * iDF^Drug,Food
 * iDO^Drug,Other
 * iFO^Food,Other
 * iDFO^Drug,Food,Other
 * ~Reactions
 * iD^Drug
 * iF^Food
 * iO^Other
 * iDF^Drug,Food
 * iDO^Drug,Other
 * iFO^Food,Other
 * iDFO^Drug,Food,Other
 * ~Nature of Reaction
 * iA^Allergy
 * iP^Pharmacological
 * iU^Unknown
 * ~Top Ten
 * i39^ANXIETY
 * i2^ITCHING,WATERING EYES
 * i6^ANOREXIA
 * i66^DROWSINESS
 * i8^NAUSEA,VOMITING
 * i9^DIARRHEA
 * i1^HIVES
 * i67^DRY MOUTH
 * i69^DRY NOSE
 * i133^RASH
 * ~Observ/Hist
 * io^Observed
 * ih^Historical
 * ~Severity
 * i3^Severe
 * i2^Moderate
 * i1^Mild
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
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
