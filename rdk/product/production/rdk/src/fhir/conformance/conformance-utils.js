'use strict';
var rdk = require('../../core/rdk');
var fhirResource = require('../common/entities/fhir-resource');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');

var domains = {
    ALLERGY_INTOLERANCE: 'allergyIntolerance',
    CONDITION: 'condition',
    COMPOSITION: 'composition',
    DIAGNOSTIC_ORDER: 'diagnosticOrder',
    MEDICATION_STATEMENT: 'medicationStatement',
    MEDICATION_PRESCRIPTION: 'medicationPrescription',
    OBSERVATION: 'observation',
    ORDER: 'order',
    PATIENT: 'patient',
    PROCEDURE: 'procedure',
    REFERRALREQUEST: 'referralrequest',
    DIAGNOSTIC_REPORT: 'diagnosticreport',
    IMMUNIZATION: 'immunization',
    MEDICATION_ADMINISTRATION: 'medicationadministration',
    MEDICATION_DISPENSE: 'medicationdispense'
};

/**
 * Create resource level Conformance node per incoming details.
 *
 * @param resource = string of the resourceType
 * @param profileRef = string of Profile Reference link
 * @param iActions = an array of interactions i.e.  ['X', 'Y']
 * @param attrMap  = array of mapped attributes (initially for search and/or sort)
 * @returns {fhirResource.ConformanceResourceItem}
 */
function createConformanceData(resource, profileRef, iActions, attrMap) {

    //------------------------------------------------
    // Set resource type & profile info
    //------------------------------------------------
    var resourceType = resource;
    var profile = new fhirResource.ReferenceResource(profileRef);

    //------------------------------------------------
    // Set the Interactions
    //------------------------------------------------
    var interactions = [];
    _.each(iActions, function(action) {
        interactions.push(new fhirResource.Interaction(action));
    });

    //------------------------------------------------
    // Set the Search Parameters object
    //
    // GET ONLY PARAMS WITH searchable = true
    // found = list of all params
    //------------------------------------------------
    var found = _.filter(attrMap,{ 'searchable': true });
    var searchParams = _.map(found, function(param) {
        return {
            name: param.fhirName,
            type: param.dataType,
            definition: param.definition,
            documentation: param.description
        };
    });

    //------------------------------------------------
    // Set Conformance item
    //------------------------------------------------
    var conform = new fhirResource.ConformanceResourceItem(resourceType, profile, interactions, searchParams);
    return conform;
}

module.exports.createConformanceData = createConformanceData;
module.exports.domains = domains;
