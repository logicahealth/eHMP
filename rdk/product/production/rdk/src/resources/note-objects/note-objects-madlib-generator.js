'use strict';

var _ = require('lodash');
var generateMadlibImmunization = require('./note-objects-madlib-generator-immunization');
var generateMadlibOrder = require('./note-objects-madlib-generator-lab-order');
var generateMadlibNumericLabResult = require('./note-objects-madlib-generator-numeric-lab-result');
var generateMadlibConsult = require('./note-objects-madlib-generator-consult');
var generateMadlibActivityRequest = require('./note-objects-madlib-generator-request-activity');

var domainMadlibGenerators = {
    // domain-specific validation functions
    // keys must correspond to the output of detectDomain
    'ehmp-observationimmunization': generateMadlibImmunization.getMadlibString,
    'ehmp-orderlaboratory': generateMadlibOrder.getMadlibString,
    'ehmp-observationlabResult': generateMadlibNumericLabResult.getMadlibString,
    'ehmp-activityconsult': generateMadlibConsult.getMadlibString,
    'ehmp-activityrequest': generateMadlibActivityRequest.getMadlibString,
    'invalid': handleInvalidDomain
};

/**
 * Generates the madlib text based on the domain + subDomain
 *
 * @param {array} errorMessages An array to store error messages
 * @param {object} noteObject The note object to be updated with the madlib string
 * @param {object} sourceClinicalObject The source clinical object passed to
 *        the domain specific madlib generator
 * @param {object} appConfig Reference to the RDK config object
 */
module.exports.generateMadlibString = function(errorMessages, noteObject, sourceClinicalObject, appConfig) {
    var domain = detectDomain(sourceClinicalObject);
    var domainMadlibGenerator = _.get(domainMadlibGenerators, domain, handleInvalidDomain);
    var madlibString = domainMadlibGenerator(errorMessages, sourceClinicalObject, appConfig);

    if (!_.isEmpty(errorMessages)) {
        return errorMessages;
    }

    noteObject.data.madlib = madlibString;
};

function detectDomain(body) {
    return body.domain + body.subDomain || 'invalid';
}

function handleInvalidDomain(errorMessages) {
    errorMessages.push('invalid domain/subdomain combination');
}
