'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var fhirResource = require('../common/entities/fhir-resource');
var fhirUtils = require('../common/utils/fhir-converter');
var nullchecker = rdk.utils.nullchecker;
var constants = require('../common/utils/constants');
var helpers = require('../common/utils/helpers');
var errors = require('../common/errors.js');
var domains = require('../common/domain-map.js');
var fhirToJDSSearch = require('../common/utils/fhir-to-jds-search');
var fhirResource = require('../common/entities/fhir-resource');
var confUtils = require('../conformance/conformance-utils');
var conformance = require('../conformance/conformance-resource');

var fhirToJDSAttrMap = [{
    fhirName: 'dateWritten',
    vprName: 'dateWritten',
    dataType: 'dateTime',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#dateTime',
    description: 'When prescription was authorized.',
    searchable: true
}];
confUtils.addCountAttribute(fhirToJDSAttrMap); //adding the _count attribute that is common to (almost) all endpoints.


// Issue call to Conformance registration
conformance.register(confUtils.domains.MEDICATION_PRESCRIPTION, createMedicationPrescriptionConformanceData());

function createMedicationPrescriptionConformanceData() {   
   var resourceType = confUtils.domains.MEDICATION_PRESCRIPTION;
   var profileReference = 'http://www.hl7.org/FHIR/2015May/medicationprescription.html';
   var interactions = [ 'read', 'search-type' ];

   return confUtils.createConformanceData(resourceType, profileReference,
           interactions, fhirToJDSAttrMap);
}

/**
 * FHIR to JDS mapping table for sortable FHIR parameters
 */
var fhirToJDSSortMap = {
    // datewritten: 'ordered', // mapped but not a sortable JDS property (nested property)
    // (NOT MAPPED) encounter: '',
    identifier: 'uid', // The unique Id for a particular observation
    // medication: '',  // mapped but not a sortable JDS property (nested property)
    patient: 'pid',
    // (NOT MAPPED) prescriber: '', // mapped but not a sortable JDS property (nested property)
    // status: '', // mapped but not a sortable JDS property
};

function buildJDSPath(pid, params) {
    var basePath = '/vpr/' + pid + '/index/' + domains.jds('med');
    var searchQuery = buildSearchQuery(params);
    return fhirToJDSSearch.buildJDSPath(basePath, searchQuery, params, fhirToJDSSortMap);
}

function buildSearchQuery(params) {
    var query = ['eq(vaType,O)'];
    var dateQuery;

    // ordered
    if (nullchecker.isNotNullish(params.datewritten)) {
        dateQuery = fhirToJDSSearch.buildDateQuery(params.datewritten, '\"orders[].ordered\"');
        if (dateQuery) {
            query.push(dateQuery);
        }
    }
    return fhirToJDSSearch.buildSearchQueryString(query);
}

function getData(req, pid, params, callback) {

    if (nullchecker.isNullish(pid)) {
        return callback(new Error('Missing required parameter: pid'));
    }

    req.audit.dataDomain = 'Medication Prescription';
    req.audit.logCategory = 'MEDICATION_PRESCRIPTION';

    // BUILD the JDS call pattern
    var jdsPath = buildJDSPath(pid, params);

    // console.log('\n\n\n ********** MED PRESCRIP - JDSPath: **********\n' + jdsPath + '\n *********************************************\n\n\n');

    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    rdk.utils.http.get(options, function(error, response, json) {
        if (error) {
            return callback(new errors.FetchError('Error fetching pid=' + pid + ' - ' + (error.message || error), error));
        }
        if ('data' in json) {
            return callback(null, json);
        }
        if (('error' in json) && errors.isNotFound(json)) {
            return callback(new errors.NotFoundError('Object not found'));
        }
        return callback(new Error('There was an error processing your request. The error has been logged.'));
    });
}

function convertToFhir(result, req) {
    var fhirResult = new fhirResource.Bundle([new fhirResource.Link('http://' + req._remoteAddress + req.url, 'self')]);

    var now = new Date();
    fhirResult.meta = {
        'lastUpdated': now.getFullYear() + '-' + ('0' + fhirUtils.generateMonth(now)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2) + 'T' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':' + ('0' + now.getSeconds()).slice(-2) + '.000-00:00'
    };

    fhirResult.entry = [];

    var items = result.data.items;

    _.forEach(items, function(item) {
        fhirResult.entry.push(convertToMedicationPrescription(item, req._pid));
    });

    fhirResult.total = result.data.totalItems;
    return fhirResult;


}


function convertToMedicationPrescription(item, pid) {
    var mp = new fhirResource.MedicationPrescription_DSTU2(item.uid, item.vaStatus);
    mp.contained = [];

    // Identifier
    if (nullchecker.isNotNullish(item.uid)) {
        mp.identifier = [new fhirResource.Identifier(item.uid, constants.medPrescription.MED_PRESCRIPTION_UID_IDENTIFIER_SYSTEM)];
    }
    // Note
    mp.note = item.summary;

    // medication
    setMedication(mp, item);

    // patient
    if (nullchecker.isNotNullish(pid)) {
        mp.patient = new fhirResource.ReferenceResource(constants.medPrescription.PATIENT_PREFIX + pid);
    }

    // prescriber // dateWritten
    if (nullchecker.isNotNullish(item.orders) && item.orders.length > 0) {
        var order = item.orders[0];
        if (nullchecker.isNotNullish(order.ordered)) {
            mp.dateWritten = fhirUtils.convertToFhirDateTime(order.ordered, fhirUtils.getSiteHash(item.uid));
        }
        if (nullchecker.isNotNullish(order.providerUid)) {
            mp.prescriber = new fhirResource.ReferenceResource(constants.medPrescription.PRESCRIBER_PREFIX + order.providerUid);
        }
    }

    setDosageInstruction(mp, item);
    setDispense(mp, item);
    setExtensions(mp, item);
    return {
        resource: mp
    };
}

function createMedication(item) {
    var med = new fhirResource.Medication(helpers.generateUUID(), item.name);
    if (!_.isEmpty(item.codes)) {
        var c = item.codes[0];
        var coding = new fhirResource.Coding(c.code, c.display, c.system);
        med.code = new fhirResource.CodeableConcept(c.display, [coding]);
    }
    med.product = {
        form: {
            text: item.productFormName
        }
    };
    if (nullchecker.isNotNullish(item.products) && item.products.length > 0) {
        med.contained = [];
        med.product.ingredient = [];

        _.forEach(item.products, function(product) {
            var substance = createSubstance(product);
            med.contained.push(substance);
            med.product.ingredient.push({
                item: new fhirResource.ReferenceResource('#' + substance.id, item.products[0].ingredientName)
            });
        });

    }
    return med;
}

function setMedication(mp, item) {
    var med = createMedication(item);
    mp.contained.push(med);
    mp.medication = new fhirResource.ReferenceResource('#' + med.id);
}

function createSubstance(p) {
    var coding = [
        new fhirResource.Coding(p.ingredientCode, p.ingredientCodeName, constants.medPrescription.INGREDIENT_IDENTIFIER_SYSTEM),
        new fhirResource.Coding(p.ingredientRole, p.ingredientName, 'SNOMED-CT')
    ];
    var type = new fhirResource.CodeableConcept(p.suppliedName, coding);
    return new fhirResource.Substance(helpers.generateUUID(), type, p.suppliedName);
}

function setDosageInstruction(mp, item) {
    if (!_.isEmpty(item.dosages)) {
        mp.dosageInstruction = [createDosageInstruction(item.sig, item.dosages[0])];
    }
}

function createDosageInstruction(text, dosage) {
    return {
        text: text,
        scheduledTiming: {
            repeat: {
                frequency: dosage.amount,
                period: dosage.scheduleFreq,
                periodUnits: 's'
            },
            code: new fhirResource.CodeableConcept(dosage.scheduleName)
        },
        route: new fhirResource.CodeableConcept(dosage.routeName),
        doseQuantity: new fhirResource.Quantity(dosage.dose, dosage.units)
    };
}

function setDispense(mp, item) {
    var siteHash = fhirUtils.getSiteHash(item.uid);
    var d = {
        medication: mp.medication,
        validityPeriod: new fhirResource.Period(
            fhirUtils.convertToFhirDateTime(item.overallStart, siteHash),
            fhirUtils.convertToFhirDateTime(item.overallStop, siteHash)),
    };
    if (!_.isEmpty(item.orders)) {
        var order = item.orders[0];
        // Some order data coming from JDS have values of 0 for fillsAllowed. DSTU2 requires
        // numberOfRepeatsAllowed to be a positive integer (min. value = 1). So we skip it if
        // invalid.
        if (order.fillsAllowed > 0) {
            d.numberOfRepeatsAllowed = order.fillsAllowed;
        }
        d.quantity = new fhirResource.Quantity(order.quantityOrdered);
        d.expectedSupplyDuration = new fhirResource.Quantity(order.daysSupply, 'days');
    }
    mp.dispense = d;
}

function createExtension(key, valueX, x) {
    if (nullchecker.isNotNullish(valueX)) {
        return (new fhirResource.Extension(constants.medPrescription.MED_PRESCRIPTION_EXTENSION_URL_PREFIX + key, valueX, x));
    } else {
        return null;
    }
}

function setExtensions(mp, item) {
    var ext = [
        createExtension('IMO', item.IMO, 'Boolean'),
        createExtension('facilityCode', item.facilityCode, 'String'),
        createExtension('facilityName', item.facilityName, 'String'),
        createExtension('kind', item.kind, 'String'),
        createExtension('lastFilled', item.lastFilled, 'String'),
        createExtension('lastUpdateTime', item.lastUpdateTime, 'String'),
        createExtension('localId', item.localId, 'String'),
        createExtension('medStatus', item.medStatus, 'String'),
        createExtension('medStatusName', item.medStatusName, 'String'),
        createExtension('medType', item.medType, 'String'),
        createExtension('patientInstruction', item.patientInstruction, 'String'),
        createExtension('qualifiedName', item.qualifiedName, 'String'),
        createExtension('stampTime', item.stampTime, 'String'),
        createExtension('stopped', item.stopped, 'String'),
        createExtension('supply', item.supply, 'Boolean'),
        createExtension('type', item.type, 'String'),
        createExtension('units', item.units, 'String'),
        createExtension('vaType', item.vaType, 'String')
    ];
    setDosagesExtensions(ext, item);
    setFillsExtensions(ext, item);
    setOrdersExtensions(ext, item);
    setProductsExtensions(ext, item);

    mp.extension = _.compact(ext); // remove all null entries from ext
}

function setDosagesExtensions(ext, item) {
    if (nullchecker.isNotNullish(item.dosages)) {
        _.forEach(item.dosages, function(o, i) {
            ext.push(createExtension('dosages[' + i + ']]/instructions', o.instructions, 'String'));
            ext.push(createExtension('dosages[' + i + ']]/noun', o.noun, 'String'));
            ext.push(createExtension('dosages[' + i + ']]/relativeStart', o.relativeStart, 'Integer'));
            ext.push(createExtension('dosages[' + i + ']]/relativeStop', o.relativeStop, 'Integer'));
            ext.push(createExtension('dosages[' + i + ']]/scheduleType', o.scheduleType, 'String'));
            ext.push(createExtension('dosages[' + i + ']]/summary', o.summary, 'String'));
        });
    }
}

function setFillsExtensions(ext, item) {
    if (nullchecker.isNotNullish(item.fills)) {
        _.forEach(item.fills, function(o, i) {
            ext.push(createExtension('fills[' + i + ']/daysSupplyDispensed', o.daysSupplyDispensed, 'Integer'));
            ext.push(createExtension('fills[' + i + ']/dispenseDate', o.dispenseDate, 'String'));
            ext.push(createExtension('fills[' + i + ']/quantityDispensed', o.quantityDispensed, 'String'));
            ext.push(createExtension('fills[' + i + ']/releaseDate', o.releaseDate, 'String'));
            ext.push(createExtension('fills[' + i + ']/routing', o.routing, 'String'));
            ext.push(createExtension('fills[' + i + ']/summary', o.summary, 'String'));
        });
    }
}

function setOrdersExtensions(ext, item) {
    if (nullchecker.isNotNullish(item.orders)) {
        _.forEach(item.orders, function(o, i) {
            ext.push(createExtension('orders[' + i + ']/fillCost', o.fillCost, 'String'));
            ext.push(createExtension('orders[' + i + ']/fillsRemaining', o.fillsRemaining, 'Integer'));
            ext.push(createExtension('orders[' + i + ']/locationName', o.locationName, 'String'));
            ext.push(createExtension('orders[' + i + ']/locationUid', o.locationUid, 'String'));
            ext.push(createExtension('orders[' + i + ']/orderUid', o.orderUid, 'String'));
            ext.push(createExtension('orders[' + i + ']/pharmacistName', o.pharmacistName, 'String'));
            ext.push(createExtension('orders[' + i + ']/pharmacistUid', o.pharmacistUid, 'String'));
            ext.push(createExtension('orders[' + i + ']/prescriptionId', o.prescriptionId, 'String'));
            ext.push(createExtension('orders[' + i + ']/providerName', o.providerName, 'String'));
            ext.push(createExtension('orders[' + i + ']/summary', o.summary, 'String'));
            ext.push(createExtension('orders[' + i + ']/vaRouting', o.vaRouting, 'String'));
        });
    }
}

function setProductsExtensions(ext, item) {
    if (nullchecker.isNotNullish(item.products)) {
        _.forEach(item.products, function(o, i) {
            ext.push(createExtension('products[' + i + ']/drugClassCode', o.drugClassCode, 'String'));
            ext.push(createExtension('products[' + i + ']/ingredientRXNCode', o.ingredientRXNCode, 'String'));
            ext.push(createExtension('products[' + i + ']/strength', o.strength, 'String'));
            ext.push(createExtension('products[' + i + ']/summary', o.summary, 'String'));
            ext.push(createExtension('products[' + i + ']/suppliedCode', o.suppliedCode, 'String'));
        });
    }
}

function isSortCriteriaValid(params) {
    return fhirToJDSSearch.isSortCriteriaValid(params, fhirToJDSSortMap);
}


module.exports.convertToFhir = convertToFhir;
module.exports.convertToMedicationPrescription = convertToMedicationPrescription;
module.exports.getData = getData;
module.exports.isSortCriteriaValid = isSortCriteriaValid;
