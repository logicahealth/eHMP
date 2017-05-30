'use strict';
var rdk = require('../../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var constants = require('../utils/constants');
var helpers = require('../utils/helpers');

var ProcedureOutcome = {
    'GOOD': 'Successful',
    'REFUSED': 'Unsuccessful',
    //  XXXX: 'Partially successful'  // as yet unmapped against VPR
    get: function(outcome) {
        return this[outcome];
    }
};
module.exports.ProcedureOutcome = ProcedureOutcome;

var ProcedureOutcomeCode = {
    'Successful': '385669000',
    'Unsuccessful': '385671000',
    'Partially successful': '385670004',
    get: function(outcomeCode) {
        return this[outcomeCode];
    }
};
module.exports.ProcedureOutcomeCode = ProcedureOutcomeCode;

var MedicationDispenseStatus = {
    'in-progress': 'in-progress',
    'on-hold': 'on-hold',
    'suspended': 'on-hold',
    'completed': 'completed',
    'entered in error': 'entered in error',
    'stopped': 'stopped'
};
module.exports.MedicationDispenseStatus = MedicationDispenseStatus;

var MedicationAdministrationStatus = {
    // vaStatus: DSTU2_MedicationAdministration_Status
    'discontinued': 'stopped',
    'complete': 'completed',
    'hold': 'on-hold',
    'flagged': 'on-hold',
    'pending': 'in-progress',
    'active': 'in-progress',
    'expired': 'completed',
    'delayed': 'on-hold',
    'unreleased': 'in-progress',
    'discontinued/edit': 'stopped',
    'cancelled': 'stopped',
    'lapsed': 'stopped',
    'renewed': 'in-progress',
    'no status': 'on-hold'
};

function getMedicationAdministrationStatus(vaStatus) {
    return MedicationAdministrationStatus[vaStatus.toLowerCase()];
}
module.exports.getMedicationAdministrationStatus = getMedicationAdministrationStatus;

var MedicationPrescriptionStatus = {
    // vaStatus: DSTU2_MedicationPrescription_Status
    'pending': 'active',
    'active': 'active',
    'unreleased': 'active',
    'renewed': 'active',
    'continued': 'active',
    'hold': 'on-hold',
    'flagged': 'on-hold',
    'delayed': 'on-hold',
    'no status': 'on-hold',
    'complete': 'completed',
    'discontinued': 'stopped',
    'discontinued/edit': 'stopped',
    'cancelled': 'stopped',
    'lapsed': 'stopped',
    'expired': 'stopped',
    'suspend': 'stopped'
};

function getMedicationPrescriptionStatus(vaStatus) {
    return MedicationPrescriptionStatus[vaStatus.toLowerCase()];
}
module.exports.getMedicationPrescriptionStatus = getMedicationPrescriptionStatus;

var DiagnosticReportStatus = {
    'registered': 'registered',
    'partial': 'partial',
    'final': 'final',
    'corrected': 'corrected',
    'amended': 'amended',
    'appended': 'appended',
    'cancelled': 'cancelled',
    'entered in error': 'entered in error'
};
module.exports.DiagnosticReportStatus = DiagnosticReportStatus;

//=================================
function ConformanceResourceHeader(conformanceStatementVersion, name, description, status, date, fhirVersion) {
    this.resourceType = 'Conformance';
    this.id = helpers.generateUUID();
    this.url = 'http://hl7.org/fhir/Conformance/ehmp';
    this.version = conformanceStatementVersion;
    this.name = name || 'EHMP FHIR Conformance Statement';
    this.description = description || 'This is a Conformance Statement for available ehmp FHIR Resources.';
    this.status = status || 'draft';
    this.date = date || new Date();
    this.fhirVersion = fhirVersion || '0.5.0';
    this.acceptUnknown = false;
    this.format = [];
    this.format[0] = 'json';
    this.rest = [];
    this.rest[0] = {};
    this.rest[0].mode = 'server';
    this.rest[0].documentation = 'A conformance statement';
    this.rest[0].resource = [];
}
module.exports.ConformanceResourceHeader = ConformanceResourceHeader;

function ConformanceResourceItem(resourceType, resourceProfile, interaction, searchParam) {
    this.type = resourceType;
    this.profile = resourceProfile || new ReferenceResource();
    this.interaction = interaction || [];
    this.searchParam = searchParam || [];
}
module.exports.ConformanceResourceItem = ConformanceResourceItem;

function Interaction(code, documentation) {
    if (nullchecker.isNotNullish(code)) {
        this.code = code;
    }
    if (nullchecker.isNotNullish(documentation)) {
        this.documentation = documentation;
    }
}
module.exports.Interaction = Interaction;

function SearchParam(name, type, definition, documentation, target, chain) {
    if (nullchecker.isNotNullish(name)) {
        this.name = name;
    }
    if (nullchecker.isNotNullish(definition)) {
        this.definition = definition;
    }
    if (nullchecker.isNotNullish(type)) {
        this.type = type;
    }
    if (nullchecker.isNotNullish(documentation)) {
        this.documentation = documentation;
    }
    if (nullchecker.isNotNullish(target)) {
        this.target = target;
    }
    if (nullchecker.isNotNullish(chain)) {
        this.chain = chain;
    }
}
module.exports.SearchParam = SearchParam;

function fixId(id) {
    return id.replace(/:|,|;|"|\(/g, '.');
}
module.exports.fixId = fixId;

//=================================
function Bundle(link, entry, totalResults) {
    this.resourceType = 'Bundle';
    this.type = 'collection';
    this.id = helpers.generateUUID();
    this.link = link || [];
    this.total = totalResults || 0;
    this.entry = entry || [];
}
module.exports.Bundle = Bundle;

function MedicationStatement(id, identifier, status, patient) {
    this.resourceType = 'MedicationStatement';
    this.id = fixId(id);
    this.status = status || '';
    this.patient = patient || new ReferenceResource();
}
module.exports.MedicationStatement = MedicationStatement;

function MedicationDispense(id, identifier, status, patient, dispenser) {
    this.resourceType = 'MedicationDispense';
    this.id = fixId(id);
    this.status = status || '';
    this.patient = patient || new ReferenceResource();
    this.dispenser = dispenser || new ReferenceResource();
}
module.exports.MedicationDispense = MedicationDispense;

function DiagnosticReport(id, name, status, issued, subject, performer) {
    this.resourceType = 'DiagnosticReport';
    this.id = fixId(id);
    this.name = name || new CodeableConcept();
    this.status = DiagnosticReportStatus[status] || '';
    this.issued = issued || null; //dateTime
    this.subject = subject || new ReferenceResource();
    this.performer = performer || new ReferenceResource();
}
module.exports.DiagnosticReport = DiagnosticReport;

function Encounter(id) {
    this.resourceType = 'Encounter';
    this.id = fixId(id) || '';
}
module.exports.Encounter = Encounter;

function Organization(id) {
    this.resourceType = 'Organization';
    this.id = fixId(id) || '';
}
module.exports.Organization = Organization;

function Location(id, name, identifier) {
    this.resourceType = 'Location';
    this.id = fixId(id) || '';
    if (nullchecker.isNotNullish(name)) {
        this.name = name;
        this.text = new Narrative('<div>' + _.escape(name) + '</div>');
    }
    if (nullchecker.isNotNullish(identifier)) {
        this.identifier = identifier;
    }
}
module.exports.Location = Location;

function Practitioner(id, name) {
    this.resourceType = 'Practitioner';
    this.id = fixId(id) || '';
    if (nullchecker.isNotNullish(name)) {
        this.name = name;
    }
}
module.exports.Practitioner = Practitioner;

function HumanName(fullName, text, use) {
    this.text = text;
    this.use = use;

    if (nullchecker.isNotNullish(fullName)) {
        var names = fullName.split(',');
        if (names.length === 2) {
            _.each(names[0].split(' '), function(familyName) {
                if (nullchecker.isNotNullish(familyName.trim())) {
                    if (this.family) {
                        this.family.push(familyName.trim());
                    } else {
                        this.family = [familyName.trim()];
                    }
                }
            }, this);
            _.each(names[1].split(' '), function(givenName) {
                if (nullchecker.isNotNullish(givenName.trim())) {
                    if (this.given) {
                        this.given.push(givenName.trim());
                    } else {
                        this.given = [givenName.trim()];
                    }
                }
            }, this);
        }
    }
}
module.exports.HumanName = HumanName;

function Specimen(id, subject, type, collectedDateTime, containerType) {
    this.resourceType = 'Specimen';
    this.id = fixId(id) || '';
    this.type = type;
    this.subject = subject || new ReferenceResource();
    if (collectedDateTime) {
        this.collection = {
            collectedDateTime: collectedDateTime
        };
    }
    if (nullchecker.isNotNullish(containerType)) {
        this.container = {};
        this.container.type = containerType;
    }
}
module.exports.Specimen = Specimen;

function Observation(id, code, status, reliability, valueX, x) {
    this.resourceType = 'Observation';
    this.id = fixId(id) || '';
    this.code = code || new CodeableConcept();
    this.status = status;
    if (nullchecker.isNotNullish(reliability)) {
        this.reliability = reliability;
    }
    this['value' + (x || 'String')] = valueX;
}
module.exports.Observation = Observation;

function Quantity(value, units, code, system, comparator) {
    if (nullchecker.isNotNullish(value)) {
        this.value = parseFloat(value);
    }
    if (nullchecker.isNotNullish(units)) {
        this.units = units;
    }
    if (nullchecker.isNotNullish(code)) {
        this.code = code;
    }
    if (nullchecker.isNotNullish(system)) {
        this.system = system;
    }
    if (nullchecker.isNotNullish(comparator)) {
        this.comparator = comparator;
    }
}
module.exports.Quantity = Quantity;

function Address(text, country, state, city, lines, zip, use, period) {
    this.text = text;
    this.country = country;
    this.state = state;
    this.city = city;
    this.lines = lines;
    this.zip = zip;
    this.use = use;
    this.period = period;
}
module.exports.Address = Address;

function CodeableConcept(text, coding) {
    if (nullchecker.isNotNullish(text)) {
        this.text = text;
    }
    if (nullchecker.isNotNullish(coding)) {
        this.coding = [];
        if (Object.prototype.toString.call(coding) === Object.prototype.toString.call([])) {
            this.coding = coding;
        } else {
            this.coding.push(coding);
        }
    }
}
module.exports.CodeableConcept = CodeableConcept;

function Coding(code, display, system, version, primary) {
    if (nullchecker.isNotNullish(system)) {
        this.system = system;
    }
    if (nullchecker.isNotNullish(version)) {
        this.version = version;
    }
    if (nullchecker.isNotNullish(code)) {
        this.code = code;
    }
    if (nullchecker.isNotNullish(display)) {
        this.display = display;
    }
    if (nullchecker.isNotNullish(primary)) {
        this.primary = primary;
    }
}
module.exports.Coding = Coding;


function RelatedResource(type, reference, display) {

    if (nullchecker.isNotNullish(type)) {
        this.type = type;
    }
    var t = {};
    if (nullchecker.isNotNullish(reference)) {
        t.reference = reference;
    }
    if (nullchecker.isNotNullish(display)) {
        t.display = display;
    }
    this.target = t;
}
module.exports.RelatedResource = RelatedResource;

function ReferenceResource(reference, display) {
    if (nullchecker.isNotNullish(reference)) {
        this.reference = reference;
    }
    if (nullchecker.isNotNullish(display)) {
        this.display = display;
    }
}
module.exports.ReferenceResource = ReferenceResource;

function Extension(url, valueX, x) {
    this.url = url || '';
    switch (x.toLowerCase()) {
        case 'string':
            this.valueString = valueX;
            break;
        case 'datetime':
            this.valueDateTime = valueX;
            break;
        default:
            this['value' + x] = valueX;
    }
}
module.exports.Extension = Extension;

function Identifier(value, system, use, type, assigner, period) {
    if (nullchecker.isNotNullish(use)) {
        this.use = use;
    }
    if (nullchecker.isNotNullish(type)) {
        this.type = type;
    }
    if (nullchecker.isNotNullish(system)) {
        this.system = system;
    }
    if (nullchecker.isNotNullish(value)) {
        this.value = value;
    }
    if (nullchecker.isNotNullish(period)) {
        this.period = period;
    }
    if (nullchecker.isNotNullish(assigner)) {
        this.assigner = assigner;
    }
}
module.exports.Identifier = Identifier;

var NarrativeStatus = {
    generated: 'generated',
    extensions: 'extensions',
    additional: 'additional'
};
module.exports.NarrativeStatus = NarrativeStatus;

function Narrative(div, status) {
    this.status = status || NarrativeStatus.generated;
    this.div = div;
}
module.exports.Narrative = Narrative;

function Link(url, relation) {
    this.relation = relation;
    this.url = url;
}
module.exports.Link = Link;

function Author(name, uri) {
    this.name = name || constants.application.APP_NAME;
    this.uri = uri || constants.application.APP_URI;
}
module.exports.Author = Author;

function Entry(resource) {
    this.resource = resource;
}
module.exports.Entry = Entry;

function Order(id, dateTime) {
    this.resourceType = 'Order';
    this.id = fixId(id) || '';
    this.date = dateTime;
}
module.exports.Order = Order;

function DiagnosticOrder(id, subject, status, orderer, items) {
    this.resourceType = 'DiagnosticOrder';
    this.id = fixId(id) || '';
    this.subject = subject || null;
    if (nullchecker.isNotNullish(status)) {
        this.status = status;
    }
    if (nullchecker.isNotNullish(orderer)) {
        this.orderer = orderer;
    }
    this.item = [];
    if (nullchecker.isNotNullish(items)) {
        if (Object.prototype.toString.call(items) === Object.prototype.toString.call([])) {
            this.item = items;
        } else {
            this.item.push(items);
        }
    }
}
module.exports.DiagnosticOrder = DiagnosticOrder;

function MedicationPrescription(id, patient, status, prescriber, medication) {
    this.resourceType = 'MedicationPrescription';
    this.id = fixId(id) || '';
    this.patient = patient || null;
    if (nullchecker.isNotNullish(status)) {
        this.status = status;
    }
    if (nullchecker.isNotNullish(prescriber)) {
        this.prescriber = prescriber;
    }
    if (nullchecker.isNotNullish(medication)) {
        this.medication = medication;
    }
}
module.exports.MedicationPrescription = MedicationPrescription;

function MedicationAdministration_DSTU2(id, vaStatus) {
    this.resourceType = 'MedicationAdministration';
    this.id = fixId(id) || '';

    if (nullchecker.isNotNullish(vaStatus)) {
        this.status = getMedicationAdministrationStatus(vaStatus);
    }
}
module.exports.MedicationAdministration_DSTU2 = MedicationAdministration_DSTU2;

function MedicationPrescription_DSTU2(id, vaStatus) {
    this.resourceType = 'MedicationPrescription';
    this.id = fixId(id) || '';

    if (nullchecker.isNotNullish(vaStatus)) {
        this.status = getMedicationPrescriptionStatus(vaStatus);
    }
}
module.exports.MedicationPrescription_DSTU2 = MedicationPrescription_DSTU2;

function Medication(id, name, code) {
    this.resourceType = 'Medication';
    this.id = fixId(id) || '';
    this.name = name;
    this.code = code;
}
module.exports.Medication = Medication;

function Substance(id, type, description) {
    this.resourceType = 'Substance';
    this.id = fixId(id) || '';
    if (nullchecker.isNotNullish(type)) {
        this.type = type;
    }
    if (nullchecker.isNotNullish(description)) {
        this.description = description;
    }
}
module.exports.Substance = Substance;

function Schedule() {}
module.exports.Schedule = Schedule;

function Period(start, end) {
    this.start = start;
    this.end = end;
}
module.exports.Period = Period;

function Composition(id, date, type, status, subject, author) {
    this.resourceType = 'Composition';
    this.id = fixId(id);
    if (nullchecker.isNotNullish(date)) {
        this.date = date;
    }
    if (nullchecker.isNotNullish(type)) {
        this.type = type;
    }
    if (nullchecker.isNotNullish(status)) {
        this.status = status;
    }
    if (nullchecker.isNotNullish(subject)) {
        this.subject = subject;
    }
    if (nullchecker.isNotNullish(author)) {
        this.author = author;
    }
}
module.exports.Composition = Composition;

function List(id, status, mode, text) {
    this.resourceType = 'List';
    this.id = fixId(id);
    this.status = status;
    this.mode = mode;
    this.text = {
        status: 'generated',
        div: '<div>' + _.escape(text) + '</div>'
    };
}
module.exports.List = List;

function ReferralRequest(id, status) {
    this.resourceType = 'ReferralRequest';
    this.id = fixId(id);
    this.status = status;
}
module.exports.ReferralRequest = ReferralRequest;

function Procedure(id, subject, status, orderer) {
    this.resourceType = 'Procedure';
    this.id = fixId(id) || '';
    //this.subject = subject || null;
    if (nullchecker.isNotNullish(status)) {
        this.status = status;
    }
    if (nullchecker.isNotNullish(orderer)) {
        this.orderer = orderer;
    }
}
module.exports.Procedure = Procedure;

function Performer(id, name, uid, role) {
    this.person = {};
    if (nullchecker.isNotNullish(name)) {
        this.person.display = name;
    }
    this.person.reference = 'Practitioner/' + uid;
    this.role = new CodeableConcept(null, new Coding(null, role));
}
module.exports.Performer = Performer;
