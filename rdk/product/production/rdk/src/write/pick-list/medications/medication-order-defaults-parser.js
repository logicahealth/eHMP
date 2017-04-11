'use strict';

var _ = require('lodash');
var rpcCategoryTransformer = require('../utils/rpc-categories-tilde-transformer');
var rpcUtil = require('../utils/rpc-util');
var validate = require('../utils/validation-util');


//----------------------------------------------------------------------------------------------------------------------

/**
 * ~Medication<br/>
 * d+orderableItemIen^orderableItemName
 */
function addMedication(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        orderableItemIen: categoryFields[0],
        orderableItemName: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Verb<br/>
 * d+verb (example: dTAKE)
 */
function addVerb(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        verb: categoryFields[0]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Preposition<br/>
 * d+preposition (example: dBY)
 */
function addPreposition(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        preposition: categoryFields[0]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

function addPatientInstructionsRegular(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        patientInstructions: categoryFields[0]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * * ~PtInstr (Patient instructions)<br/>
 * i+PI<br/>
 * t+patientInstruction (may have multiple t lines returned)
 */
function addPatientInstructions(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName)) {
        return;
    }
    if (rpcCategoryTransformer.CATEGORY_TEXT_ENTRY === categoryType) {
        rpcCategoryTransformer.addCategoryTextEntry(logger, categories, categoryName, categoryType, categoryFields);
    }
    else {
        addPatientInstructionsRegular(logger, categories, categoryName, categoryType, categoryFields);
    }
}

/**
 * ~AllDoses<br/>
 * i+strength^nationalDrugId^prescriptionText
 */
function addAllDoses(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 3, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        strength: categoryFields[0],
        nationalDrugId: categoryFields[1],
        prescriptionText: categoryFields[2]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Dosage<br/>
 * i+drugName^strength^nationalDrugId^prescriptionText^strength^costPerUnit^refill^doseForm<br/><br/>
 *
 * Dosage has 2 entries for strength, why?<br/>
 * Example 1 tablet:  iACETAMINOPHEN 325MG TAB^325MG^^325&MG&1&TABLET&325MG&5591&325&MG^325MG^0.0029^11^TAB<br/>
 * Example 2 tablets: iACETAMINOPHEN 325MGTAB^325MG^^650&MG&2&TABLETS&650MG&5591&325&MG^650MG^0.0058^11^TAB<br/>
 * One is the strength of the individual unit and the other is the overall dosage, and the info relating to cost per
 * unit would bare this out. 325MG is the strength of the orderable item associated with the national drug ID 5591.
 * This selection is for 2 tablets for a total strength of 650MG.
 * The cost for 2 tablets is 0.0058 vs 0.0029 for one as demonstrated by the 325MG total dose.
 */
function addDosage(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 8, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        drugName: categoryFields[0],
        strengthIndividualUnit: categoryFields[1],
        nationalDrugId: categoryFields[2],
        prescriptionText: categoryFields[3],
        strengthOverallDosage: categoryFields[4],
        costPerUnit: categoryFields[5],
        refill: categoryFields[6],
        doseForm: categoryFields[7]
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Dispense<br/>
 * i+nationalDrugId^strength^units^drugName^splitTab (Note: splitTab is boolean 1 or 0)
 */
function addDispense(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 5, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        nationalDrugId: categoryFields[0],
        strength: categoryFields[1],
        units: categoryFields[2],
        drugName: categoryFields[3],
        splitTab: (categoryFields[4] === 1)
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

function addRouteRegular(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 5, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        routeIen: categoryFields[0],
        routeName: categoryFields[1],
        routeAbbrev: categoryFields[2],
        outpatientExpansion: categoryFields[3],
        IV: (categoryFields[4] === 1)
    };
    rpcCategoryTransformer.addCategoryRegularEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

function addRouteDefault(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 2, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        routeIen: categoryFields[0],
        routeName: categoryFields[1]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Route<br/>
 * i+routeIen^routeName^routeAbbrev^outpatientExpansion^IV (intravenous) flag<br/>
 * d+routeIen^routeName
 */
function addRoute(logger, categories, categoryName, categoryType, categoryFields) {
    if (rpcCategoryTransformer.CATEGORY_DEFAULT_ENTRY === categoryType) {
        addRouteDefault(logger, categories, categoryName, categoryType, categoryFields);
    }
    else {
        addRouteRegular(logger, categories, categoryName, categoryType, categoryFields);
    }
}

/**
 * ~Schedule<br/>
 * d+schedule
 */
function addSchedule(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        schedule: categoryFields[0]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

/**
 * ~Guideline<br/>
 * t+guideline (may have multiple t lines returned)
 */
function addGuideline(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName)) {
        return;
    }
    rpcCategoryTransformer.addCategoryTextEntry(logger, categories, categoryName, categoryType, categoryFields);
}

/**
 * ~Message<br/>
 * t+message (may have multiple t lines returned)
 */
function addMessage(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName)) {
        return;
    }
    rpcCategoryTransformer.addCategoryTextEntry(logger, categories, categoryName, categoryType, categoryFields);
}

/**
 * ~DEASchedule<br/>
 * d+drugSchedule (drugSchedule can be 1-4 or empty)
 */
function addDEASchedule(logger, categories, categoryName, categoryType, categoryFields) {
    if (!rpcCategoryTransformer.validateCategoryArraySize(logger, 1, categoryFields, categoryName)) {
        return;
    }
    var categoryEntry = {
        drugSchedule: categoryFields[0]
    };
    rpcCategoryTransformer.addCategoryDefaultEntry(logger, categories, categoryName, categoryType, categoryFields, categoryEntry);
}

//----------------------------------------------------------------------------------------------------------------------

function addCategoryEntry(logger, categories, categoryName, categoryFields) {
    if (!categoryFields && categoryFields.length === 0) {
        throw new Error('category entry for ' + categoryName + ' did not contain any categoryFields');
    }
    if (validate.isStringNullish(categoryName)) {
        throw new Error('Cannot add a category entry if no category has been created: ' + categoryFields.join('^'));
    }

    var categoryType = categoryFields[0][0];
    categoryFields[0] = categoryFields[0].substring(1); //Remove the categoryType from the first entry

    if (categoryName === 'Medication') {
        addMedication(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Verb') {
        addVerb(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Preposition') {
        addPreposition(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'PtInstr') {
        addPatientInstructions(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'AllDoses') {
        addAllDoses(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Dosage') {
        addDosage(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Dispense') {
        addDispense(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Route') {
        addRoute(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Schedule') {
        addSchedule(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Guideline') {
        addGuideline(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'Message') {
        addMessage(logger, categories, categoryName, categoryType, categoryFields);
    }
    else if (categoryName === 'DEASchedule') {
        addDEASchedule(logger, categories, categoryName, categoryType, categoryFields);
    }
    else {                               //This is an unknown entry
        logger.error('unknown category entry for ' + categoryName + ': rpcData=' + categoryType + '' + categoryFields.join('^'));
    }
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * The RPC returns data in the following format:<br/>
 * ~category<br/>
 * i+delimited string = entry<br/>
 * d+delimited string = default<br/>
 * t+string = text<br/><br/>
 *
 * Output element definitions:<br/>
 * ~Medication<br/>
 * d+orderableItemIen^orderableItemName<br/><br/>
 *
 * ~Verb<br/>
 * d+verb (example: dTAKE)<br/><br/>
 *
 * ~Preposition<br/>
 * d+preposition (example: dBY)<br/><br/>
 *
 * ~PtInstr (Patient instructions)<br/>
 * i+PI<br/>
 * t+patientInstruction (may have multiple t lines returned)<br/><br/>
 *
 * ~AllDoses<br/>
 * i+strength^nationalDrugId^prescriptionText<br/><br/>
 *
 * ~Dosage<br/>
 * i+drugName^strength^nationalDrugId^prescriptionText^strength^costPerUnit^refill^doseForm<br/><br/>
 *
 * ~Dispense<br/>
 * i+nationalDrugId^strength^units^drugName^splitTab (Note: splitTab is boolean 1 or 0)<br/><br/>
 *
 * ~Route<br/>
 * i+routeIen^routeName^routeAbbrev^outpatientExpansion^UNKNOWN<br/><br/>
 *
 * ~Schedule<br/>
 * d+schedule<br/><br/>
 *
 * ~Guideline<br/>
 * t+guideline (may have multiple t lines returned)<br/><br/>
 *
 * ~Message<br/>
 * t+message (may have multiple t lines returned)<br/><br/>
 *
 * ~DEASchedule<br/>
 * d+drugSchedule (drugSchedule can be 1-4 or empty)<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * ~Medication
 * d1348^ACETAMINOPHEN TAB
 * ~Verb
 * dTAKE
 * ~Preposition
 * dBY
 * ~PtInstr
 * ~AllDoses
 * i325MG^5591^325&MG&1&TABLET&325MG&5591&325&MG
 * i500MG^213^500&MG&1&TABLET&500MG&213&500&MG
 * i650MG^5591^650&MG&2&TABLETS&650MG&5591&325&MG
 * i1000MG^213^1000&MG&2&TABLETS&1000MG&213&500&MG
 * ~Dosage
 * iACETAMINOPHEN 325MG TAB^325MG^^325&MG&1&TABLET&325MG&5591&325&MG^325MG^0.0029^^TAB
 * iACETAMINOPHEN 500MG TAB^500MG^^500&MG&1&TABLET&500MG&213&500&MG^500MG^0.0062^^TAB
 * iACETAMINOPHEN 325MG TAB^325MG^^650&MG&2&TABLETS&650MG&5591&325&MG^650MG^0.0058^^TAB
 * iACETAMINOPHEN 500MG TAB^500MG^^1000&MG&2&TABLETS&1000MG&213&500&MG^1000MG^0.0124^^TAB
 * ~Dispense
 * i213^500^MG^ACETAMINOPHEN 500MG TAB^0
 * i5591^325^MG^ACETAMINOPHEN 325MG TAB^0
 * ~Route
 * i1^ORAL (BY MOUTH)^PO^MOUTH^0
 * d1^ORAL (BY MOUTH)
 * ~Schedule
 * dQ6H PRN
 * ~Guideline
 * ~Message
 * ~DEASchedule
 * d
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
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

    logger.info({categories: categories});
    return categories;
};
