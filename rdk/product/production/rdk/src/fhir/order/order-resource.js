'use strict';
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var fhirUtils = require('../common/utils/fhir-converter');
var constants = require('../common/utils/constants');
var helpers = require('../common/utils/helpers');
var fhirResource = require('../common/entities/fhir-resource');
var errors = require('../common/errors');
var order = require('./order');
var confUtils = require('../conformance/conformance-utils');
var conformance = require('../conformance/conformance-resource');

var fhirToJDSAttrMap = [{
    fhirName: 'subject.identifier',
    vprName: 'pid',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'Patient this order is about.',
    searchable: true
},{
    fhirName: 'detail.display',
    vprName: 'detail.display',
    dataType: 'string',
    definition: 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
    description: 'What action is being ordered.  Valid values are: DiagnosticOrder | MedicationPrescription | NutritionOrder | ProcedureRequest | DeviceUse',
    searchable: true
}];

// Issue call to Conformance registration
conformance.register(confUtils.domains.ORDER, createOrderConformanceData());

function createOrderConformanceData() {
   var resourceType = confUtils.domains.ORDER;
   var profileReference = 'http://www.hl7.org/FHIR/2015May/order.html';
   var interactions = [ 'read', 'search-type' ];

   return confUtils.createConformanceData(resourceType, profileReference,
           interactions, fhirToJDSAttrMap);
}

//TO DO:
// As JSON.parse and JSON.stringify work in a blocking manner perhaps we should switch to a streaming parser as this one:
// https://github.com/dominictarr/JSONStream

/*
 * Unsupported service(s):
     GMRC --> consult | document | procedure
     OR   --> ??
 */
var orderDetailMap = {
    'LR': 'DiagnosticOrder', // specifically "lab"
    'RA': 'DiagnosticOrder', // specifically "image"
    'PSO': 'MedicationPrescription',
    'PSJ': 'MedicationPrescription',
    'PSIV': 'MedicationPrescription',
    'PSH': 'MedicationPrescription'
};

var orderServiceMap = {
    'DiagnosticOrder': ['LR,RA'],
    'MedicationPrescription': ['PSO,PSJ,PSIV,PSH']
};

var clinicianRolePriority = {
    'S': 40,
    'N': 30,
    'C': 20,
    'R': 10
};

var statusDiagOrderMap = {
    'COMPLETE': 'completed',
    'PENDING': 'requested',
    'DISCONTINUED': 'suspended',
    'DISCONTINUED/EDIT': 'suspended',
    'ACTIVE': 'in-progress',
    'EXPIRED': 'failed',
    'LAPSED': 'failed'
};

var statusMedPrescriptionMap = {
    'COMPLETE': 'completed',
    'PENDING': 'active',
    'DISCONTINUED': 'stopped',
    'DISCONTINUED/EDIT': 'stopped',
    'ACTIVE': 'active',
    'EXPIRED': 'stopped'
};

function getResourceConfig() {
    return [{
        name: 'order-order',
        path: '',
        get: getFhirOrders,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        requiredPermissions: [],
        isPatientCentric: true,
        permitResponseFormat: true
    }];
}

function getFhirOrders(req, res) {
    getOrders(req, res);
}

function getOrders(req, res, startFrom, previousResults) {
    var pid = req.param('subject.identifier');
    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_request).send('Missing subject.identifier parameter');
    }

    startFrom = startFrom || 0;
    previousResults = previousResults || [];
    var limit = req.param('limit');

    //======================================
    // detail.display = DiagnosticOrder | MedicationPrescription | NutritionOrder | ProcedureRequest | DeviceUse
    // service =
    //======================================
    var services = orderServiceMap[req.param('detail.display')];

    var params = {
        start: startFrom,
        _count: limit,
    };

    order.getVprData(req.app.config, req.logger, pid, function(err, inputJSON) {
        var results = null;
        var bundle = null;

        if (err instanceof errors.NotFoundError) {
            res.status(rdk.httpstatus.not_found).send(err.error);
        } else if (err instanceof errors.FetchError) {
            req.logger.error(err.message);
            res.status(rdk.httpstatus.internal_server_error).send('There was an error processing your request. The error has been logged.');
        } else if (err) {
            res.status(rdk.httpstatus.internal_server_error).send(err.message);
        } else {
            //========================================
            // CONVERT VPR DATA TO FHIR FORMAT RESULT
            //========================================
            results = convertToFhir(inputJSON, req, previousResults, limit);

            //========================================
            // (recursively) Get VPR data when
            //   no limit OR total fhir results generated has reached limit OR no more
            //========================================
            if (!nullchecker.isNullish(limit) && limit > results.length && inputJSON.data.items && inputJSON.data.items.length > 0) {
                getOrders(req, res, startFrom + inputJSON.data.items.length, results);
            } else {
                bundle = buildBundle(results, req, inputJSON.data.totalItems);
                res.send(200, bundle);
            }
        }
    }, params, services);
}

function convertToFhir(inputJSON, req, previousResults, limit) {
    var outJSON = previousResults || [];
    var items = inputJSON.data.items;

    for (var i = 0; i < items.length; i++) {

        outJSON = outJSON.concat(createOrders(items[i], req));
        if (outJSON.length >= limit) {
            break;
        }
    }
    if (nullchecker.isNullish(limit)) {
        limit = outJSON.length;
    }
    return _.take(outJSON, limit);
}

function buildBundle(results, req, total) {
    var link = [];
    if (req) {
        link.push(new fhirResource.Link(req.protocol + '://' + req.headers.host + req.originalUrl, 'self'));
    }
    var b = new fhirResource.Bundle(link, null, total);

    for (var i in results) {
        if (nullchecker.isNotNullish(results[i])) {
            b.entry.push(new fhirResource.Entry(results[i]));
        }
    }

    return b;
}

/**
 *
 * @param item
 * @param req
 * @param parentUid  --> if this order is a child then this contains the parent order uid
 * @param orderId  --> the generated uid for this new order
 * @returns
 */
function createOrders(item, req, parentUid) {
    if (nullchecker.isNullish(item)) {
        return null;
    }

    var orderList = [];

    if (nullchecker.isNullish(item.service)) {
        return orderList;
    } else {
        if (nullchecker.isNullish(orderDetailMap[item.service])) {
            return orderList;
        }
    }

    var siteHash = fhirUtils.getSiteHash(item.uid);
    //=========================================================================
    // Every Order.id should be newly generated.
    // Any Child re-refencing should be done via the identifier attribute node
    //=========================================================================
    var order = new fhirResource.Order(helpers.generateUUID(), fhirUtils.convertToFhirDateTime(item.entered, siteHash));
    var childOrders = [];
    order.extension = [];

    var pid = item.pid || req._pid;

    //============================
    // identifier
    //============================
    order.identifier = [];
    order.identifier.push(new fhirResource.Identifier(item.uid, constants.fhir.UID_IDENTIFIER_SYSTEM, undefined, 'uid'));

    //=========================
    // text
    // remove any special char from
    //=========================
    var t = '<div>Request for ' + _.escape((item.kind || '') + ' (on patient \'' + (pid || '@null') + '\' @ ' + (item.providerDisplayName || '') + ')\r\n' + (item.summary || '')) + '</div>';
    order.text = new fhirResource.Narrative(t);

    //============================
    // subject
    //============================
    if (nullchecker.isNotNullish(pid)) {
        order.subject = new fhirResource.ReferenceResource(constants.ordersFhir.PATIENT_PREFIX + pid);
    }
    //============================
    // target
    // NO USEABLE JDS DATA GIVEN
    //============================
    //============================
    // reason[]
    // NO USEABLE JDS DATA GIVEN
    //============================
    //============================
    // authority
    // NO USEABLE JDS DATA GIVEN
    //============================

    //===============================================================
    // when.schedule
    // NOTE:  Checking being done for bad start date AFTER stop date
    //===============================================================
    if (nullchecker.isNotNullish(item.start) && nullchecker.isNotNullish(item.stop)) {

        if (item.start > item.stop) {
            // BAD DATA VALUES .. MAP TO EXTENSION
            req.logger.warn({
                item: _.pick(item, ['uid', 'start', 'stop'])
            }, 'Bad start date after stop date');

            order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'start', item.start, 'String'));
            order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'stop', item.stop, 'String'));


        } else {
            // MAP TO FHIR
            var period = new fhirResource.Period(fhirUtils.convertToFhirDateTime(item.start, siteHash),
                fhirUtils.convertToFhirDateTime(item.stop, siteHash));
            order.when = {
                schedule: new fhirResource.Schedule()
            };
            order.when.schedule = {
                repeat: {}
            };
            order.when.schedule.repeat = {
                bounds: period
            };
        }
    }

    //=========================
    // contained resources
    //=========================
    order.contained = [];
    order.detail = [];
    // - provider
    if (nullchecker.isNotNullish(item.providerName)) {
        var contPractProvider = new fhirResource.Practitioner(helpers.generateUUID());
        if (nullchecker.isNotNullish(item.providerDisplayName)) {
            contPractProvider.text = new fhirResource.Narrative('<div>' + _.escape(item.providerDisplayName) + '</div>');
        }
        contPractProvider.name = new fhirResource.HumanName(item.providerName);
        if (nullchecker.isNotNullish(item.providerUid)) {
            contPractProvider.identifier =
                [new fhirResource.Identifier(item.providerUid, constants.fhir.UID_IDENTIFIER_SYSTEM, undefined, 'provider-uid')];
        }

        order.contained.push(contPractProvider);
        //=========================
        // source
        //=========================
        order.source = new fhirResource.ReferenceResource('#' + (contPractProvider._id || contPractProvider.id || 'null'), contPractProvider.name.text);
    }

    //=========================
    // location
    //=========================
    if (nullchecker.isNotNullish(item.locationUid)) {
        var contLocLocation = new fhirResource.Location(helpers.generateUUID());
        if (nullchecker.isNotNullish(item.locationName)) {
            contLocLocation.text = new fhirResource.Narrative('<div>' + _.escape(item.locationName) + '</div>');
        }
        contLocLocation.name = item.locationName;
        contLocLocation.identifier =
            new fhirResource.Identifier(item.locationUid, constants.fhir.FACILITIES_IDENTIFIER_SYSTEM, undefined, 'location-uid');

        order.contained.push(contLocLocation);
    }
    //=========================
    // facility
    //=========================
    if (nullchecker.isNotNullish(item.facilityCode)) {
        var contOrgFacility = new fhirResource.Organization(helpers.generateUUID());
        if (nullchecker.isNotNullish(item.facilityName)) {
            contOrgFacility.text = new fhirResource.Narrative('<div>' + _.escape(item.facilityName) + '</div>');
        }
        contOrgFacility.name = item.facilityName;
        contOrgFacility.identifier =
            [new fhirResource.Identifier(item.facilityCode, constants.fhir.FACILITIES_IDENTIFIER_SYSTEM, undefined, 'facility-code')];

        order.contained.push(contOrgFacility);
    }
    //=========================
    // clinicians
    //=========================
    if (nullchecker.isNotNullish(item.clinicians)) {
        var sourcePractitioner = {
            rolePriority: -1,
            resource: null
        };
        _.each(item.clinicians, function(clinician) {
            var contPractClinician = new fhirResource.Practitioner(helpers.generateUUID());
            if (nullchecker.isNotNullish(clinician.name)) {
                contPractClinician.text = new fhirResource.Narrative('<div>' + _.escape(clinician.name) + '</div>');
            }
            contPractClinician.name = new fhirResource.HumanName(clinician.name);
            contPractClinician.identifier = [new fhirResource.Identifier(clinician.uid, constants.fhir.UID_IDENTIFIER_SYSTEM, undefined, 'uid')];
            if (nullchecker.isNotNullish(clinician.role)) {
                contPractClinician.extension = contPractClinician.extension || [];
                contPractClinician.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'clinicianRole', clinician.role, 'String'));
            }
            if (nullchecker.isNotNullish(clinician.signedDateTime)) {
                contPractClinician.extension = contPractClinician.extension || [];
                contPractClinician.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'clinicianSignedDateTime',
                    fhirUtils.convertToFhirDateTime(String(clinician.signedDateTime), siteHash), 'DateTime'));
            }

            order.contained.push(contPractClinician);
            if (sourcePractitioner.rolePriority < clinicianRolePriority[clinician.role]) {
                sourcePractitioner.resource = contPractClinician;
                sourcePractitioner.rolePriority = clinicianRolePriority[clinician.role];
            }
        });
        // source
        if (nullchecker.isNullish(order.source) && nullchecker.isNotNullish(sourcePractitioner.resource)) {
            order.source = new fhirResource.ReferenceResource('#' + (sourcePractitioner.resource._id || sourcePractitioner.resource.id || 'null'), sourcePractitioner.resource.name.text);
        }
    }
    //=========================
    // detail - ordered item
    //=========================
    if (orderDetailMap[item.service] === 'DiagnosticOrder') {
        var contDiagOrder = createDiagnosticOrder(item, order);
        order.contained.push(contDiagOrder);

        // detail
        var detailRef = new fhirResource.ReferenceResource(
            '#' + (contDiagOrder._id || contDiagOrder.id || 'null'),
            fhirUtils.removeDivFromText(contDiagOrder.text.div));
        //detailRef.id = item.uid;

        order.detail.push(detailRef);


    } else if (orderDetailMap[item.service] === 'MedicationPrescription') {
        var contMedPrescription = createMedicationPrescription(item, order);
        order.contained.push(contMedPrescription);
        // detail
        order.detail.push((new fhirResource.ReferenceResource(
            '#' + (contMedPrescription._id || contMedPrescription.id || 'null'),
            orderDetailMap[item.service]
            //fhirUtils.removeDivFromText(contMedPrescription.text.div)
        )));
    }

    if (order.contained.length === 0) {
        order.contained = undefined;
    }
    if (order.detail.length === 0) {
        order.detail = undefined;
    }

    //============================
    // extensions
    //============================

    if (nullchecker.isNotNullish(item.kind)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'kind', item.kind, 'String'));
    }
    if (nullchecker.isNotNullish(item.service)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'service', item.service, 'String'));
    }
    if (nullchecker.isNotNullish(item.stampTime)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'stampTime', item.stampTime, 'String'));
    }
    if (nullchecker.isNotNullish(item.statusCode)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'statusCode', item.statusCode, 'String'));
    }
    if (nullchecker.isNotNullish(item.lastUpdateTime)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'lastUpdateTime', item.lastUpdateTime, 'String'));
    }
    if (nullchecker.isNotNullish(item.content)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'content', item.content, 'String'));
    }
    if (nullchecker.isNotNullish(item.localId)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'localId', item.localId, 'String'));
    }
    if (nullchecker.isNotNullish(item.displayGroup)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'displayGroup', item.displayGroup, 'String'));
    }
    if (nullchecker.isNotNullish(item.predecessor)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'predecessor',
            new fhirResource.ReferenceResource(constants.ordersFhir.ORDER_PREFIX + item.predecessor),
            'Reference'));
    }
    if (nullchecker.isNotNullish(item.successor)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'successor',
            new fhirResource.ReferenceResource(constants.ordersFhir.ORDER_PREFIX + item.successor),
            'Reference'));
    }
    if (nullchecker.isNotNullish(parentUid)) {
        order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'parent',
            new fhirResource.ReferenceResource(constants.ordersFhir.ORDER_PREFIX + parentUid),
            'Reference'));
    }
    if (nullchecker.isNotNullish(item.children)) {
        //=============================================
        // For each child order,
        // Create an extension entry in this parents Order entry, referencing the child's JDS.uid
        // Then, create a new separate Order entry record (Child's Order) that will have:
        //      a newly generated Order record id,
        //      an Order indentifier record referencing this Child's JDS.uid,
        //      and an Order extension record referencing this Parent's JDS.uid
        //=============================================
        _.each(item.children, function(child) {
            order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'child',
                new fhirResource.ReferenceResource(constants.ordersFhir.ORDER_PREFIX + (child.uid || '@null')),
                'Reference'));
            //----------------------------------------
            // recursive add children of current order
            //----------------------------------------
            childOrders = childOrders.concat(createOrders(child, req, item.uid));
        });
    }
    if (nullchecker.isNotNullish(item.results)) {
        _.each(item.results, function(result) {
            if (nullchecker.isNotNullish(result.uid)) {
                order.extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'result', result.uid, 'String')); //this should be a reference to another FHIR resource
            }
        });
    }

    if (order.extension.length === 0) {
        order.extension = undefined;
    }

    //=========================
    // ADD IN ALL CHILDREN
    //=========================
    orderList.push(order);
    if (nullchecker.isNotNullish(childOrders) && childOrders.length > 0) {
        orderList = orderList.concat(childOrders);
    }

    return orderList;
}

function createDiagnosticOrder(item, order) {

    //console.log('uid='+item.uid + 'order.sbject='+order.subject.reference + 'item.pid='+ item.pid);
    //fhirItem.subject = new fhirResource.ReferenceResource('Patient/' + pid); // REQUIRED
    var diagOrder = new fhirResource.DiagnosticOrder(helpers.generateUUID(),
        new fhirResource.ReferenceResource('Patient/' + item.pid),
        statusDiagOrderMap[item.statusName], order.source);

    diagOrder.text = new fhirResource.Narrative('<div>' + _.escape(item.oiName || item.name) + '</div>');

    if (nullchecker.isNotNullish(item.uid)) {
        diagOrder.identifier = diagOrder.identifier || [];
        diagOrder.identifier.push(new fhirResource.Identifier(item.uid, constants.fhir.FACILITIES_IDENTIFIER_SYSTEM, undefined, 'uid'));
    }
    diagOrder.item = [];
    var itemOI = {
        code: new fhirResource.CodeableConcept(item.oiName || item.name)
    };
    if (nullchecker.isNotNullish(item.oiCode)) {
        itemOI.code.coding = itemOI.code.coding || [];
        itemOI.code.coding.push(new fhirResource.Coding(item.oiCode, item.oiName, 'oi-code'));
        if (nullchecker.isNotNullish(item.oiPackageRef)) {
            itemOI.code.coding[0].extension = [];
            itemOI.code.coding[0].extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'oiPackageRef', item.oiPackageRef, 'String'));
        }
    }
    if (nullchecker.isNotNullish(item.codes)) {
        itemOI.code.coding = itemOI.code.coding || [];
        _.each(item.codes, function(code) {
            itemOI.code.coding.push(new fhirResource.Coding(code.code, code.display, code.system));
        });
    }
    if (nullchecker.isNotNullish(itemOI)) {
        diagOrder.item.push(itemOI);
    }

    return diagOrder;
}

function createMedicationPrescription(item, order) {
    var medPrescription = new fhirResource.MedicationPrescription(helpers.generateUUID(), order.subject, statusMedPrescriptionMap[item.statusName], order.source);

    medPrescription.text = new fhirResource.Narrative('<div>' + _.escape(item.oiName || item.name) + '</div>');

    if (nullchecker.isNotNullish(item.uid)) {
        medPrescription.identifier = medPrescription.identifier || [];
        medPrescription.identifier.push(new fhirResource.Identifier(item.uid, constants.fhir.FACILITIES_IDENTIFIER_SYSTEM, undefined, 'uid'));
    }
    var medicationOI = new fhirResource.Medication(helpers.generateUUID(), item.oiName || item.name, new fhirResource.CodeableConcept(item.oiName));
    if (nullchecker.isNotNullish(item.oiCode)) {
        medicationOI.code.coding = medicationOI.code.coding || [];
        medicationOI.code.coding.push(new fhirResource.Coding(item.oiCode, item.oiName, 'oi-code'));
        if (nullchecker.isNotNullish(item.oiPackageRef)) {
            medicationOI.code.coding[0].extension = [];
            medicationOI.code.coding[0].extension.push(new fhirResource.Extension(constants.ordersFhir.ORDER_EXTENSION_URL_PREFIX + 'oiPackageRef', item.oiPackageRef, 'String'));
        }
    }
    if (nullchecker.isNotNullish(item.codes)) {
        medicationOI.code.coding = medicationOI.code.coding || [];
        _.each(item.codes, function(code) {
            medicationOI.code.coding.push(new fhirResource.Coding(code.code, code.display, code.system));
        });
    }
    if (nullchecker.isNotNullish(medicationOI)) {
        order.contained = order.contained || [];
        order.contained.push(medicationOI);
        medPrescription.medication = new fhirResource.ReferenceResource('#' + (medicationOI._id || medicationOI.id || 'null'), medicationOI.name);
    }

    return medPrescription;
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.buildBundle = buildBundle;
module.exports.convertToFhir = convertToFhir;
