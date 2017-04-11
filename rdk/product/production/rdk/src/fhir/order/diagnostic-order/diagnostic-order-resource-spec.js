'use strict';

var rdk = require('../../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var constants = require('../../common/utils/constants');
var _ = require('lodash');
var diagnosticOrderResource = require('./diagnostic-order-resource');
var diagnosticOrder = require('./diagnostic-order');
var fhirConversion = require('../../common/utils/fhir-converter');
var input = require('./diagnostic-order-resource-spec-data').inputValue;
var singleRecord = input.data.items[0];

var req = {
    query: {
        pid: '9E7A;8'
    },
    headers: {
        host: 'localhost:8888'
    },
    protocol: 'http',
    originalUrl: '/fhir/patient/9E7A;8/diagnosticorder'
};

function findExtension(name, extensions) {
    return _.find(extensions, function(ext) {
        // extension urls follow this pattern:  http://vistacore.us/fhir/extensions/diagnosticorder#{name}
        return ext.url.split('#')[1] === name;
    });
}

function findContainedByReference(reference, fhirItem) {
    // reference is in this format:  #{id}
    var id = reference.substring(1);
    return _.find(fhirItem.contained, function(contained) {
        return contained.id === id;
    });
}

function findContainedPractitioner(clinician, fhirItem) {
    return _.find(fhirItem.contained, function(contained) {
        return contained.identifier && contained.identifier[0] &&
            contained.identifier[0].value === clinician.uid && contained.id !== fhirItem.orderer.reference.substring(1);
    });
}

function findContainedByType(type, fhirItem) {
    return _.find(fhirItem.contained, function(contained) {
        return contained.resourceType === type;
    });
}

function toFHIRStatus(status) {
    var vprItem = _.clone(singleRecord);
    vprItem.statusName = status;
    return diagnosticOrder.createDiagnosticOrder(vprItem)[0].status;
}

function findResourceInBundle(bundle, uid) {
    var entry = _.find(bundle.entry, function(entry) {
        return entry.resource.identifier[0].value === uid;
    });
    return entry ? entry.resource : null;
}

function findChildExtension(id, extensions) {
    return _.find(extensions, function(ext) {
        if (nullchecker.isNullish(ext.valueReference)) {
            // child relationship should have been recorded as a valueReference extension
            return false;
        }
        // extension urls follow this pattern:  http://vistacore.us/fhir/extensions/diagnosticorder#{name}
        var name = ext.url.split('#')[1];
        // reference is in this format:  #{id}
        var refId = ext.valueReference.reference.substring(1);
        return name === 'child' && refId === id;
    });
}

describe('DiagnosticOrder FHIR conversion methods', function() {
    var vprDocuments = input.data.items;
    var fhirBundle = diagnosticOrder.convertToFhir(input, req);
    var fhirDiagnosticOrders = fhirBundle.entry;

    it('bundle results correctly', function() {
        expect(fhirBundle.resourceType).to.equal('Bundle');
        expect(fhirBundle.type).to.equal('collection');
        expect(fhirBundle.id).to.not.be.undefined();
        expect(fhirBundle.link.length).to.equal(1);
        expect(fhirBundle.link[0].relation).to.equal('self');
        expect(fhirBundle.link[0].url).to.equal('http://localhost:8888/fhir/patient/9E7A;8/diagnosticorder');
        expect(fhirBundle.total).to.equal(695);
        expect(fhirBundle.entry).to.not.be.undefined();
        // There are three orders but one has four children. The children are mapped to individual resources and added
        // to the Bundle
        expect(fhirBundle.entry.length).to.equal(7);
    });

    it('sets status correctly', function() {
        expect(toFHIRStatus('COMPLETE')).to.equal('completed');
        expect(toFHIRStatus('PENDING')).to.equal('requested');
        expect(toFHIRStatus('DISCONTINUED')).to.equal('suspended');
        expect(toFHIRStatus('DISCONTINUED/EDIT')).to.equal('suspended');
        expect(toFHIRStatus('ACTIVE')).to.equal('in-progress');
        expect(toFHIRStatus('EXPIRED')).to.equal('failed');
        expect(toFHIRStatus('LAPSED')).to.equal('failed');
    });

    _.forEach(vprDocuments, function(vprItem) {
        var entry = _.find(fhirDiagnosticOrders, function(fhirOrder) {
            return fhirOrder.resource.identifier[0].value === vprItem.uid;
        });
        expect(entry).to.not.be.undefined();
        var fhirItem = entry.resource;
        expect(fhirItem).to.not.be.undefined();

        testDiagnosticOrderConversion(vprItem, fhirItem, fhirBundle);
    });
});

function testDiagnosticOrderConversion(vprItem, fhirItem, fhirBundle) {
    it('sets the id and resourceType correctly', function() {
        expect(fhirItem.id).to.not.be.undefined();
        expect(fhirItem.resourceType).to.equal('DiagnosticOrder');
    });
    it('sets text correctly', function() {
        expect(fhirItem.text).to.not.be.undefined();
        expect(fhirItem.text.div).to.equal('<div>' + _.escape(vprItem.oiName || vprItem.name) + '</div>');
        expect(fhirItem.text.status).to.equal('generated');
    });
    it('sets subject correctly', function() {
        expect(fhirItem.subject).to.not.be.undefined();
        expect(fhirItem.subject.reference).to.equal('Patient/' + vprItem.pid);
    });
    it('sets orderer correctly', function() {
        expect(fhirItem.orderer).to.not.be.undefined();
        expect(fhirItem.orderer.reference).to.not.be.undefined();
        var orderer = findContainedByReference(fhirItem.orderer.reference, fhirItem);
        expect(orderer).to.not.be.undefined();

        describe(':: Orderer (contained)', function() {
            it('sets the id and resourceType correctly', function() {
                expect(orderer.id).to.not.be.undefined();
                expect(orderer.resourceType).to.equal('Practitioner');
            });
            it('sets text correctly', function() {
                expect(orderer.text).to.not.be.undefined();
                expect(orderer.text.div).to.equal('<div>' + vprItem.providerDisplayName + '</div>');
                expect(orderer.text.status).to.equal('generated');
            });
            it('sets name correctly', function() {
                var names = vprItem.providerName.split(',');
                expect(orderer.name).to.not.be.undefined();
                expect(orderer.name.family[0]).to.equal(names[0]);
                expect(orderer.name.given[0]).to.equal(names[1]);
            });
            it('sets identifier correctly', function() {
                expect(orderer.identifier[0].system).to.equal(constants.fhir.UID_IDENTIFIER_SYSTEM);
                expect(orderer.identifier[0].value).to.equal(vprItem.providerUid);
            });
        });
    });
    it('sets identifier correctly', function() {
        expect(fhirItem.identifier).to.not.be.undefined();
        expect(fhirItem.identifier[0].value).to.equal(vprItem.uid);
        expect(fhirItem.identifier[0].system).to.equal(constants.fhir.FACILITIES_IDENTIFIER_SYSTEM);
    });
    it('sets events correctly', function() {
        expect(fhirItem.event).to.not.be.undefined();
        expect(fhirItem.event.length).to.equal(1);
        expect(fhirItem.event[0].status).to.equal(fhirItem.status);
        expect(fhirItem.event[0].description).to.equal(vprItem.content);
        expect(fhirItem.event[0].dateTime).to.equal(fhirConversion.convertToFhirDateTime(vprItem.entered));
    });
    it('sets item correctly', function() {
        expect(fhirItem.item).to.not.be.undefined();
        if (nullchecker.isNullish(vprItem.oiCode)) {
            expect(fhirItem.item.length).to.equal(0);
        } else {
            expect(fhirItem.item.length).to.equal(1);
            expect(fhirItem.item[0].code).to.not.be.undefined();
            expect(fhirItem.item[0].code.coding).to.not.be.undefined();
            expect(fhirItem.item[0].code.coding.length).to.equal(1);
            expect(fhirItem.item[0].code.coding[0].system).to.equal('oi-code');
            expect(fhirItem.item[0].code.coding[0].code).to.equal(vprItem.oiCode);
            expect(fhirItem.item[0].code.coding[0].display).to.equal(vprItem.oiName);
            expect(fhirItem.item[0].code.coding[0].extension).to.not.be.undefined();
            expect(fhirItem.item[0].code.coding[0].extension.length).to.equal(1);
            expect(fhirItem.item[0].code.coding[0].extension[0].valueString).to.equal(vprItem.oiPackageRef);
            expect(fhirItem.item[0].code.coding[0].extension[0].url).to.equal('http://vistacore.us/fhir/extensions/diagnosticorder#oiPackageRef');
        }
    });
    it('adds a Practitioner source as a contained resource for each clinician', function() {
        _.forEach(vprItem.clinicians, function(clinician) {
            var practitioner = findContainedPractitioner(clinician, fhirItem);
            expect(practitioner).to.not.be.undefined();
            describe(':: Practitioner (contained)', function() {
                expect(practitioner.id).to.not.be.undefined();

                it('sets text correctly', function() {
                    expect(practitioner.text).to.not.be.undefined();
                    expect(practitioner.text.div).to.equal('<div>' + clinician.name + '</div>');
                    expect(practitioner.text.status).to.equal('generated');
                });
                it('sets name correctly', function() {
                    var names = clinician.name.split(',');
                    expect(practitioner.name).to.not.be.undefined();
                    expect(practitioner.name.family[0]).to.equal(names[0]);
                    expect(practitioner.name.given[0]).to.equal(names[1]);
                });
                it('sets identifier correctly', function() {
                    expect(practitioner.identifier[0].system).to.equal(constants.fhir.UID_IDENTIFIER_SYSTEM);
                    expect(practitioner.identifier[0].value).to.equal(clinician.uid);
                });
                it('sets a role extension', function() {
                    var ext = findExtension('role', practitioner.extension);
                    expect(ext).to.not.be.undefined();
                    expect(ext.valueString).to.equal(clinician.role);
                });
                it('sets a signedDateTime extension', function() {
                    var ext = findExtension('signedDateTime', practitioner.extension);
                    expect(ext).to.not.be.undefined();
                    expect(ext.valueString).to.equal(clinician.signedDateTime);
                });

            });
        });
    });
    it('adds Organization as a contained resource', function() {
        var org = findContainedByType('Organization', fhirItem);
        expect(org).to.not.be.undefined();
        expect(org.id).to.not.be.undefined();
        expect(org.text).to.not.be.undefined();
        expect(org.text.div).to.equal('<div>' + vprItem.facilityName + '</div>');
        expect(org.text.status).to.equal('generated');
        expect(org.identifier).to.not.be.undefined();
        expect(org.identifier[0].value).to.equal(vprItem.facilityCode);
        expect(org.identifier[0].system).to.equal(constants.fhir.FACILITIES_IDENTIFIER_SYSTEM);
    });
    it('adds Location as a contained resource', function() {
        var location = findContainedByType('Location', fhirItem);
        expect(location).to.not.be.undefined();
        expect(location.id).to.not.be.undefined();
        expect(location.text).to.not.be.undefined();
        expect(location.text.div).to.equal('<div>' + vprItem.locationName + '</div>');
        expect(location.text.status).to.equal('generated');
        expect(location.identifier).to.not.be.undefined();
        expect(location.identifier[0].value).to.equal(vprItem.locationUid);
        expect(location.identifier[0].system).to.equal(constants.fhir.FACILITIES_IDENTIFIER_SYSTEM);
    });
    describe(':: extensions', function() {
        var propNames = [
            'kind', 'lastUpdateTime', 'localId', 'service', 'stampTime',
            'statusCode', 'statusVuid', 'displayGroup', 'start', 'stop',
            'name', 'result'
        ];

        _.forEach(propNames, function(propName) {
            var vprValue = vprItem[propName];
            if (nullchecker.isNotNullish(vprValue)) {
                it('adds an extension for ' + propName, function() {
                    var ext = findExtension(propName, fhirItem.extension);
                    expect(ext).to.not.be.undefined();
                    expect(ext.valueString).to.equal(vprValue);
                });
            }
        });
    });
    describe(':: children resources', function() {
        _.forEach(vprItem.children, function(child) {
            var fhirChild;

            it('creates a child resource and adds it to the FHIR bundle', function() {
                fhirChild = findResourceInBundle(fhirBundle, child.uid);
                expect(fhirChild).to.not.be.undefined();
            });
            it('child DiagnosticOrder is properly mapped', function() {
                testDiagnosticOrderConversion(child, fhirChild, fhirBundle);
            });
            it('adds a reference to the child as an extension in parent resource', function() {
                var ext = findChildExtension(fhirChild.id, fhirItem.extension);
                expect(ext).to.not.be.undefined();
            });
            it('adds a reference to the parent as an extension in the child resource', function() {
                var ext = findExtension('parent', fhirChild.extension);
                expect(ext).to.not.be.undefined();
                expect(ext.valueReference).to.not.be.undefined();
                expect(ext.valueReference.reference).to.equal('DiagnosticOrder/' + vprItem.uid);
            });
        });
    });
}
