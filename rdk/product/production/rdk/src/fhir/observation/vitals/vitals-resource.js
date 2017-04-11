'use strict';
var rdk = require('../../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var helpers = require('../../common/utils/helpers.js');
var fhirUtils = require('../../common/utils/fhir-converter');
var fhirToJDSSearch = require('../../common/utils/fhir-to-jds-search');
var fhirResource = require('../../common/entities/fhir-resource');

var fhirToJDSMap = {
    // ** code          // Not supported - pending clarification of the FHIR standard.
    // ** code-value-x  // Not supported - pending clarification of the FHIR standard.
    // (NOT MAPPED) data-absent-reason
    date: 'observed', // Obtained date/time (e.g. Observation.appliesDateTime)
    // (NOT MAPPED) device
    // (NOT MAPPED) encounter
    identifier: 'uid', // The unique Id for a particular observation
    // patient
    patient: 'pid', // the subject that the observation is about (if patient)
    performer: 'facilityName', // Who performed the observation
    // (NOT MAPPED) related
    // (NOT MAPPED) related-target
    // (NOT MAPPED) related-type
    // (NOT MAPPED - hardcoded to 'unknown') reliability
    // (NOT MAPPED) specimen
    // (NOT MAPPED - harcoded to 'final') status
    subject: 'pid', // the subject that the observation is about
    // (NOT MAPPED value-concept
    // (NOT MAPPED value-date
    // (NOT MAPPED value-string
    'value-quantity': 'result' // Sorting by result does not work for Body Temperature (8310-5) (DE2035)
};


function buildJDSPath(pid, params) {
    var basePath = '/vpr/' + pid + '/find/vital';
    var searchQuery = buildSearchQuery(params);
    return fhirToJDSSearch.buildJDSPath(basePath, searchQuery, params, fhirToJDSMap);
}

function buildSearchQuery(params) {
    var query = [];
    var dateQuery;

    // system & code
    if (nullchecker.isNotNullish(params.code)) {
        query.push(fhirToJDSSearch.buildCodeAndSystemQuery(params.code));
    }
    // date
    if (nullchecker.isNotNullish(params.date)) {
        dateQuery = fhirToJDSSearch.buildDateQuery(params.date, 'observed');
        if (dateQuery) {
            query.push(dateQuery);
        }
    }
    return fhirToJDSSearch.buildSearchQueryString(query);
}

function getVitalsData(appConfig, logger, pid, params, callback) {
    // check for required pid param
    if (nullchecker.isNullish(pid)) {
        return callback(new Error('Missing required parameter: pid'));
    }

    var jdsPath = buildJDSPath(pid, params);
    var options = _.extend({}, appConfig.jdsServer, {
        url: jdsPath,
        logger: logger,
        json: true
    });

    rdk.utils.http.get(options, function(error, response, body) {
        callback(error, body);
    });
}

function convertToFHIRObservations(vprItems, req) {
    return _.map(vprItems, function(vprItem) {
        if (vprItem.typeName !== 'BLOOD PRESSURE') {
            return createVital(vprItem);
        } else {
            return createVitalBP(vprItem);
        }
    });
}

function createVital(jdsItem) {
    var fhirItem = {};

    fhirItem.resource = {};
    fhirItem.resource.resourceType = 'Observation';
    fhirItem.resource.id = jdsItem.uid;
    fhirItem.resource.text = {
        'status': 'generated',
        'div': '<div>' + _.escape(jdsItem.summary) + '</div>'
    };
    var orgUid = helpers.generateUUID();

    //------------------------------------------
    //   FUTURE-TODO:  Investigate
    //   WHY ARE WE ONLY PULLING one code set?
    //   WHAT if JDS returns more?
    //------------------------------------------
    fhirItem.resource.code = {};
    fhirItem.resource.code.coding = [{
        'system': 'urn:oid:2.16.840.1.113883.6.233',
        'code': jdsItem.typeCode,
        'display': jdsItem.typeName
    }, {
        'system': jdsItem.codes[0].system,
        'code': jdsItem.codes[0].code,
        'display': jdsItem.codes[0].display
    }];

    //RESOURCE.VALUE
    fhirItem.resource.valueQuantity = {};
    if (jdsItem.result !== undefined) {
        fhirItem.resource.valueQuantity.value = Number(jdsItem.result);
    }
    if (jdsItem.units !== undefined && jdsItem.units !== '') {
        fhirItem.resource.valueQuantity.units = jdsItem.units;
    }

    var siteHash = fhirUtils.getSiteHash(jdsItem.uid);

    // RESOURCE.APPLIESDATETIME
    if (jdsItem.observed !== undefined) {
        fhirItem.resource.appliesDateTime = fhirUtils.convertToFhirDateTime(jdsItem.observed, siteHash);
    }

    if (jdsItem.resulted !== undefined) {
        fhirItem.resource.issued = fhirUtils.convertToFhirDateTime(jdsItem.resulted, siteHash);
    }
    fhirItem.resource.status = 'final';
    fhirItem.resource.reliability = 'unknown';
    fhirItem.resource.identifier = [{
        'use': 'official',
        //'label': 'uid',
        'system': 'http://vistacore.us/fhir/id/uid',
        'value': jdsItem.uid
    }];
    var splitUid = jdsItem.uid.split(':');
    if (splitUid.length > 5) {
        fhirItem.resource.subject = {
            'reference': 'Patient/' + splitUid[4]
        };
    }
    fhirItem.resource.performer = [{
        'reference': orgUid,
        'display': jdsItem.facilityName
    }];

    //================================
    // SET ORGANIZATION REFERENCE
    //================================
    fhirItem.resource.contained = [];
    var organization = new fhirResource.Organization(orgUid);
    organization.identifier = [{
        'system': 'urn:oid:2.16.840.1.113883.6.233',
        'value': jdsItem.facilityCode
    }];
    organization.name = jdsItem.facilityName;
    fhirItem.resource.contained.push(organization);

    if (jdsItem.low !== undefined || jdsItem.high !== undefined) {
        fhirItem.resource.referenceRange = [];
        fhirItem.resource.referenceRange.push({});
        if (jdsItem.low !== undefined) {
            var lowReferenceFhir = {};
            lowReferenceFhir = {
                'value': Number(jdsItem.low)
            };
            if (jdsItem.units !== undefined && jdsItem.units !== '') {
                lowReferenceFhir.units = jdsItem.units;
            }
            fhirItem.resource.referenceRange[0].low = {};
            fhirItem.resource.referenceRange[0].low = lowReferenceFhir;
        }
        if (jdsItem.high !== undefined) {
            var highReferenceFhir = {};
            highReferenceFhir = {
                'value': Number(jdsItem.high)
            };
            if (jdsItem.units !== undefined && jdsItem.units !== '') {
                highReferenceFhir.units = jdsItem.units;
            }

            fhirItem.resource.referenceRange[0].high = {};
            fhirItem.resource.referenceRange[0].high = highReferenceFhir;
        }
        fhirItem.resource.referenceRange[0].meaning = {};
        fhirItem.resource.referenceRange[0].meaning.coding = [];
        fhirItem.resource.referenceRange[0].meaning.coding.push(fhirUtils.generateReferenceMeaning(jdsItem.typeName));
    }
    return fhirItem;
}

/**
 * setContainedItemsAndRelatedReferences
 *
 * @param fhirItem
 * @param orgUid
 * @param jdsItem
 */
function setBPContainedItemsAndRelatedReferences(fhirItem, orgUid, jdsItem) {
    var quantityValue;
    var splitValues;
    var fhirContained = fhirItem.contained;
    var fhirRelated = fhirItem.related;

    //================================
    // SET ORGANIZATION REFERENCE
    //================================
    var organization = new fhirResource.Organization(orgUid);
    organization.identifier = [{
        'system': 'urn:oid:2.16.840.1.113883.6.233',
        'value': jdsItem.facilityCode
    }];
    organization.name = jdsItem.facilityName;
    fhirContained.push(organization);

    //====================================================================
    // SET BP RELATED OBSERVATIONs
    // Check for BP code in code[] before setting related and contained BP
    // loop thru all codes and flag if found LOINC code for BP:  55284-4
    //====================================================================
    var i;
    for (i = 0; i < jdsItem.codes.length; i++) {

        if (jdsItem.codes[i].code === '55284-4') {

            //===================================
            // SET BP SYSTOLIC CONTAINED RESOURCE
            //===================================
            // CREATE A related REFERENCE ATTRIBUTE TO THE OBSVERATION SYSTOLIC RESOURCE
            var related = new fhirResource.RelatedResource('has-component', '#systolic', null);
            fhirRelated.push(related);

            quantityValue = null;
            splitValues = jdsItem.result.split('/');
            if (splitValues.length > 1 && jdsItem.units !== undefined && jdsItem.units !== '') {
                quantityValue = splitValues[0];
            }

            //----------------------------------------------------------
            // PREP referenceRange TO NEW BP SYSTOLIC CONTAINED RESOURCE
            //----------------------------------------------------------
            var splitLow = [],
                splitHigh = [];
            if (jdsItem.low !== undefined) {
                splitLow = jdsItem.low.split('/');
            }
            if (jdsItem.high !== undefined) {
                splitHigh = jdsItem.high.split('/');
            }

            //----------------------------------------------------------
            // CREATE AN OBSVERATION SYSTOLIC RESOURCE
            //----------------------------------------------------------
            var systolic = createContainedForRelatedObsv(
                jdsItem, 'BLOOD PRESSURE SYSTOLIC', quantityValue, 'Systolic', splitLow[0], splitHigh[0]);

            //----------------------------------------------------------
            // ADD THE CONTAINED OBSV SYSTOLIC RESOURCE TO THE CONTAINED ATTRIBUTE
            //----------------------------------------------------------
            fhirContained.push(systolic);

            //================================
            // SET BP DIASTOLIC REFERENCE
            //================================
            // CREATE A related REFERENCE ATTRIBUTE TO THE OBSVERATION DIASTOLIC RESOURCE
            related = new fhirResource.RelatedResource('has-component', '#diastolic', null);
            fhirRelated.push(related);

            // CREATE AN OBSVERATION DIASTOLIC RESOURCE
            quantityValue = null;
            splitValues = jdsItem.result.split('/');
            if (splitValues.length > 1 && jdsItem.units !== undefined && jdsItem.units !== '') {
                quantityValue = splitValues[1];
            }

            var diastolic = createContainedForRelatedObsv(
                jdsItem, 'BLOOD PRESSURE DIASTOLIC', quantityValue, 'Diastolic', splitLow[1], splitHigh[1]);

            //ADD THE OBSVERATION DIASTOLIC RESOURCE TO THE CONTAINED ATTRIBUTE
            fhirContained.push(diastolic);

            break;
        }
    }

}
/**
 * Build a Contained Obsv Resource for BP Systolic info.
 * referenceFlag = ['BLOOD PRESSURE SYSTOLIC' | 'BLOOD PRESSURE DIASTOLIC']
 *
 */
function createContainedForRelatedObsv(jdsItem, referenceFlag, value, comments, splitLow, splitHigh) {
    //PREP code
    var coding = [];
    coding.push(fhirUtils.generateResultMeaning(referenceFlag));
    var code = {
        'coding': coding
    };

    //PREP valueQuantity
    var valueQuantityValues = {
        'value': Number(value),
        'units': jdsItem.units
    };
    //PREP comment, id, and identifier value
    var id = null;
    if (nullchecker.isNotNullish(comments)) {
        id = comments.toLowerCase();
    }

    //CREATE obsveration resource for contained entry
    var obsv = new fhirResource.Observation(id, code, 'final', 'unknown', valueQuantityValues, 'Quantity');

    //SET comments and identifier
    obsv.comments = comments;
    obsv.identifier = [{
        'value': id
    }];

    //SET issued date
    if (jdsItem.resulted !== undefined) {
        obsv.issued = fhirUtils.convertToFhirDateTime(jdsItem.resulted, fhirUtils.getSiteHash(jdsItem.uid));
    }

    obsv.referenceRange = [];
    obsv.referenceRange.push({});
    var lowReferenceFhir = {};
    lowReferenceFhir = {
        'value': Number(splitLow)
    };
    if (jdsItem.units !== undefined && jdsItem.units !== '') {
        lowReferenceFhir.units = jdsItem.units;
    }
    obsv.referenceRange[0].low = {};
    obsv.referenceRange[0].low = lowReferenceFhir;
    var highReferenceFhir = {};
    highReferenceFhir = {
        'value': Number(splitHigh)
    };
    if (jdsItem.units !== undefined && jdsItem.units !== '') {
        highReferenceFhir.units = jdsItem.units;
    }
    obsv.referenceRange[0].high = highReferenceFhir;
    obsv.referenceRange[0].meaning = {
        coding: [
            fhirUtils.generateReferenceMeaning(referenceFlag)
        ]
    };
    return obsv;
}

function createVitalBP(jdsItem) {
    var fhirItem = {};

    fhirItem.resource = {};
    var orgUid = helpers.generateUUID();

    var divDate = '';
    if (jdsItem.observed !== undefined) {
        //This is not a FHIR Datetime - it is a custom format used for HTML output (YYYYMMDDHHMMSS --> DD-MMM YYYY HH:MM)
        divDate = ((jdsItem.observed.toString().substring(6, 8)[0] === '0') ? jdsItem.observed.toString().substring(7, 8) : jdsItem.observed.toString().substring(6, 8)) + '-' + fhirUtils.generateMonthName(jdsItem.observed.toString().substring(4, 6)) + ' ' + jdsItem.observed.toString().substring(0, 4) + ' ' +
            ((jdsItem.observed.toString().substring(8, 10)[0] === '0') ? jdsItem.observed.toString().substring(9, 10) : jdsItem.observed.toString().substring(8, 10)) + ':' + ((jdsItem.observed.toString().substring(10, 12)[0] === '0') ? jdsItem.observed.toString().substring(11, 12) : jdsItem.observed.toString().substring(10, 12)) + ' : ';
    }

    //------------------------------------------
    // SETTING RESOURCETYPE and TEXT
    //------------------------------------------
    fhirItem.resource.resourceType = 'Observation';
    fhirItem.resource.id = jdsItem.uid;
    fhirItem.resource.text = {
        'status': 'generated',
        'div': '<div>' + _.escape(divDate + jdsItem.codes[0].display + ' ' + jdsItem.result.toString() + ' ' + jdsItem.units) + '</div>'
    };

    //------------------------------------------
    // SETTING PARENT CODES and RESULT VALUE
    //------------------------------------------
    fhirItem.resource.code = {};
    fhirItem.resource.code.coding = [];
    fhirItem.resource.code.coding.push(jdsItem.codes[0]);

    fhirItem.resource.valueString = jdsItem.result;

    //------------------------------------------
    // SETTING DATES
    //------------------------------------------
    var siteHash = fhirUtils.getSiteHash(jdsItem.uid);
    if (jdsItem.observed !== undefined) {
        fhirItem.resource.appliesDateTime = fhirUtils.convertToFhirDateTime(jdsItem.observed, siteHash);
    }

    if (jdsItem.resulted !== undefined) {
        fhirItem.resource.issued = fhirUtils.convertToFhirDateTime(jdsItem.resulted, siteHash);
    }
    fhirItem.resource.status = 'final';
    fhirItem.resource.reliability = 'unknown';

    //------------------------------------------
    //SET ITEM UID
    //------------------------------------------
    fhirItem.resource.identifier = [{
        'use': 'official',
        'system': 'http://vistacore.us/fhir/id/uid',
        'value': jdsItem.uid
    }];

    //------------------------------------------
    //SET PATIENT ID
    //------------------------------------------
    var splitUid = jdsItem.uid.split(':');
    if (splitUid.length > 5) {
        fhirItem.resource.subject = {
            'reference': 'Patient/' + splitUid[4]
        };
    }

    //------------------------------------------
    //SET PERFORMER
    //------------------------------------------
    fhirItem.resource.performer = [{
        'reference': orgUid,
        'display': jdsItem.facilityName
    }];

    //------------------------------------------
    // SETTING CONTAINED ITEMS
    //------------------------------------------
    fhirItem.resource.related = [];
    fhirItem.resource.contained = [];
    setBPContainedItemsAndRelatedReferences(fhirItem.resource, orgUid, jdsItem);

    return fhirItem;
}

function isSortCriteriaValid(params) {
    return fhirToJDSSearch.isSortCriteriaValid(params, fhirToJDSMap);
}

module.exports.convertToFHIRObservations = convertToFHIRObservations;
module.exports.getVitalsData = getVitalsData;
module.exports.isSortCriteriaValid = isSortCriteriaValid;
