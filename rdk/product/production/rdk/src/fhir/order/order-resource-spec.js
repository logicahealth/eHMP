'use strict';
var _ = require('lodash');
var OrderResource = require('./order-resource');
var OrderIn = require('./order-resource-spec-data').data;
var jdsInput = OrderIn.jdsData;
var singleRecord = OrderIn.singleRecord;
var fhirUtils = require('../common/utils/fhir-converter');

var statusDiagOrderMap = {
    'COMPLETE': 'completed',
    'PENDING': 'requested',
    'DISCONTINUED': 'suspended',
    'DISCONTINUED/EDIT': 'suspended',
    'ACTIVE': 'in progress',
    'EXPIRED': 'failed'
};

describe('Orders FHIR Resource', function() {
    it('Verifies correct resource name and path', function() {
        var config = OrderResource.getResourceConfig()[0];
        expect(config.name).to.equal('fhir-order');
        expect(config.path).to.equal('');
    });
});

describe('Order Resource FHIR conversion methods', function() {
    var req = {
        '_pid': 'SITE;253',
        originalUrl: '/resource/fhir/order?subject.identifier=11016V630869',
        headers: {
            host: 'localhost:PORT'
        },
        protocol: 'http'
    };
    var fhirBundle = OrderResource.buildBundle(jdsInput.data.items, req, jdsInput.data.totalItems);

    it('bundle results correctly', function() {
        expect(fhirBundle.resourceType).to.equal('Bundle');
        expect(fhirBundle.type).to.equal('collection');
        expect(fhirBundle.id).to.not.be.undefined();
        expect(fhirBundle.link).to.not.be.undefined();
        expect(fhirBundle.link.length).to.equal(1);
        expect(fhirBundle.link[0].relation).to.equal('self');
        expect(fhirBundle.link[0].url).to.equal('http://localhost:PORT/resource/fhir/order?subject.identifier=11016V630869');
        expect(fhirBundle.total).to.equal(2);
        expect(fhirBundle.entry).to.not.be.undefined();
        expect(fhirBundle.entry.length).to.equal(2);
    });

    describe(':: Order', function() {

        var fhirItems = OrderResource.convertToFhir(singleRecord, req._pid);
        var fhirItem = fhirItems[0]; // We get an array structure back.  Just look at the first item.

        it('sets the id and resourceType correctly', function() {
            expect(fhirItem.resourceType).to.equal('Order');
            expect(fhirItem.id).to.not.be.undefined();
        });

        var siteHash = fhirUtils.getSiteHash(singleRecord.data.items[0].uid);
        it('sets dateWritten correctly', function() {
            expect(fhirItem.date).to.equal(fhirUtils.convertToFhirDateTime(singleRecord.data.items[0].entered, siteHash));
        });

        it('sets text correctly', function() {
            expect(fhirItem.text).to.not.be.undefined();
            expect(fhirItem.text.status).to.equal('generated');

            var t = '<div>Request for ' + _.escape((singleRecord.data.items[0].kind || '') + ' (on patient \'' + (singleRecord.data.items[0].pid || '@null') + '\' @ ' + (singleRecord.data.items[0].providerDisplayName || '') + ')\r\n' + (singleRecord.data.items[0].summary || '')) + '</div>';

            expect(fhirItem.text.div).to.equal(t);
        });

        it('sets identifier correctly', function() {
            expect(fhirItem.identifier).to.not.be.undefined();
            expect(fhirItem.identifier.length).to.equal(1);
            expect(fhirItem.identifier[0].type).to.equal('uid');
            expect(fhirItem.identifier[0].value).to.equal(singleRecord.data.items[0].uid);
        });

        it('sets subject (patient) reference correctly', function() {
            expect(fhirItem.subject.reference).to.equal('Patient/' + req._pid);
        });

        it('sets \'when\' correctly', function() {
            expect(fhirItem.when).to.not.be.undefined();
            expect(fhirItem.when.schedule).to.not.be.undefined();
            expect(fhirItem.when.schedule.repeat).to.not.be.undefined();
            expect(fhirItem.when.schedule.repeat.bounds).to.not.be.undefined();

            var start = fhirItem.when.schedule.repeat.bounds.start;
            var end = fhirItem.when.schedule.repeat.bounds.end;

            expect(start).to.equal(fhirUtils.convertToFhirDateTime(singleRecord.data.items[0].start, siteHash));
            expect(end).to.equal(fhirUtils.convertToFhirDateTime(singleRecord.data.items[0].stop, siteHash));
        });

        it('sets detail correctly', function() { //for this data, a diagnostic order reference.
            expect(fhirItem.detail).to.not.be.undefined();
            expect(fhirItem.detail.length).to.equal(1);
            expect(fhirItem.detail[0].reference).to.not.be.undefined();
            expect(fhirItem.detail[0].display).to.not.be.undefined();
            expect(fhirItem.detail[0].display).to.equal(_.escape(singleRecord.data.items[0].oiName));
        });

        it('sets source correctly', function() { //for this test data, it creates a practitioner reference
            expect(fhirItem.source).to.not.be.undefined();
            expect(fhirItem.source.reference).to.not.be.undefined();
        });

        describe('Contained Resources', function() {

            it('sets (detail referenced) DiagnosticOrder correctly', function() {
                var diagnosticOrder = _.find(fhirItem.contained, function(item) {
                    return item.id === fhirItem.detail[0].reference.substr(1);
                });

                expect(diagnosticOrder).to.not.be.undefined();

                expect(diagnosticOrder.status).to.not.be.undefined();
                expect(diagnosticOrder.status).to.equal(statusDiagOrderMap[singleRecord.data.items[0].statusName]);
                expect(fhirItem.detail[0].reference).to.equal('#' + diagnosticOrder.id);

                expect(diagnosticOrder.subject).to.not.be.undefined();
                expect(diagnosticOrder.subject.reference).to.not.be.undefined();
                var pid = singleRecord.data.items[0].pid || req._pid;
                expect(diagnosticOrder.subject.reference).to.equal('Patient/' + pid);

                expect(diagnosticOrder.orderer).to.not.be.undefined();
                expect(diagnosticOrder.orderer.reference).to.not.be.undefined();
                //expect(diagnosticOrder.orderer.display).to.equal(singleRecord.data.items[0].providerName);

                expect(diagnosticOrder.item).to.not.be.undefined();
                expect(diagnosticOrder.item.length).to.equal(1);
                expect(diagnosticOrder.item[0].code).to.not.be.undefined();
                expect(diagnosticOrder.item[0].code.text).to.not.be.undefined();

                expect(diagnosticOrder.item[0].code.coding[0].system).to.not.be.undefined();
                expect(diagnosticOrder.item[0].code.coding[0].system).to.equal('oi-code');

                expect(diagnosticOrder.item[0].code.coding[0].code).to.not.be.undefined();
                expect(diagnosticOrder.item[0].code.coding[0].code).to.equal(singleRecord.data.items[0].oiCode);

                expect(diagnosticOrder.item[0].code.coding[0].display).to.not.be.undefined();
                expect(diagnosticOrder.item[0].code.coding[0].display).to.equal(singleRecord.data.items[0].oiName);

                expect(diagnosticOrder.text).to.not.be.undefined();
                expect(diagnosticOrder.text.status).to.not.be.undefined();
                expect(diagnosticOrder.text.status).to.equal('generated');
                var t = '<div>' + _.escape(singleRecord.data.items[0].oiName || singleRecord.data.items[0].name) + '</div>';
                expect(diagnosticOrder.text.div).to.equal(t);

                expect(diagnosticOrder.identifier).to.not.be.undefined();
                expect(diagnosticOrder.identifier.length).to.equal(1);
                expect(diagnosticOrder.identifier[0].type).to.not.be.undefined();
                expect(diagnosticOrder.identifier[0].type).to.equal('uid');
                expect(diagnosticOrder.identifier[0].value).to.not.be.undefined();
                expect(diagnosticOrder.identifier[0].value).to.equal(singleRecord.data.items[0].uid);

            });

            it('sets (source referenced) Practitioner correctly', function() {
                var practitioner = _.find(fhirItem.contained, function(item) {
                    return item.id === fhirItem.source.reference.substr(1);
                });

                expect(practitioner.text).to.not.be.undefined();
                expect(practitioner.text.status).to.not.be.undefined();
                expect(practitioner.text.status).to.equal('generated');
                expect(practitioner.text.div).to.not.be.undefined();
                var div = '<div>' + singleRecord.data.items[0].providerDisplayName + '</div>';
                expect(practitioner.text.div).to.equal(div);

                //we could optionally include the name parsing logic here,
                //or export it from order-resource to use here.  For now, lets
                //just check the strings.

                expect(practitioner.name.family).to.not.be.undefined();
                expect(practitioner.name.family.length).to.equal(1);
                expect(practitioner.name.family[0]).to.equal('PROVIDER');

                expect(practitioner.name.given).to.not.be.undefined();
                expect(practitioner.name.given.length).to.equal(1);
                expect(practitioner.name.given[0]).to.equal('TWOHUNDREDNINETYSEVEN');

                expect(practitioner.identifier).to.not.be.undefined();
                expect(practitioner.identifier.length).to.equal(1);
                expect(practitioner.identifier[0].type).to.not.be.undefined();
                expect(practitioner.identifier[0].type).to.equal('provider-uid');
                expect(practitioner.identifier[0].value).to.not.be.undefined();
                expect(practitioner.identifier[0].value).to.equal(singleRecord.data.items[0].providerUid);

            });

            //
            //'contained' items without direct references - checking those too...
            //

            it('sets (unreferenced) Practitioner from clinician data correctly', function() {

                var practitioner = _.find(fhirItem.contained, function(item) {
                    //NOTE: picking this one out is a little tricky since we have two entries
                    //for practitioners.  One is referenced, one has no connecting references.
                    //Adding code to make sure we get the one that is NOT the other one...
                    return item.resourceType === 'Practitioner' &&
                        item.id !== fhirItem.source.reference.substr(1);
                });

                expect(practitioner).to.not.be.undefined();

                expect(practitioner.text).to.not.be.undefined();
                expect(practitioner.text.status).to.not.be.undefined();
                expect(practitioner.text.status).to.equal('generated');
                expect(practitioner.text.div).to.not.be.undefined();
                var div = '<div>' + singleRecord.data.items[0].clinicians[0].name + '</div>';
                expect(practitioner.text.div).to.equal(div);

                expect(practitioner.name.family).to.not.be.undefined();
                expect(practitioner.name.family.length).to.equal(1);
                expect(practitioner.name.family[0]).to.equal('PROVIDER');

                expect(practitioner.name.given).to.not.be.undefined();
                expect(practitioner.name.given.length).to.equal(1);
                expect(practitioner.name.given[0]).to.equal('TWOHUNDREDNINETYSEVEN');

                expect(practitioner.identifier).to.not.be.undefined();
                expect(practitioner.identifier.length).to.equal(1);
                expect(practitioner.identifier[0].type).to.not.be.undefined();
                expect(practitioner.identifier[0].type).to.equal('uid');
                expect(practitioner.identifier[0].value).to.not.be.undefined();
                expect(practitioner.identifier[0].value).to.equal(singleRecord.data.items[0].clinicians[0].uid);

            });

            it('sets (unreferenced) Organization correctly', function() {

                var organization = _.find(fhirItem.contained, function(item) {
                    return item.resourceType === 'Organization';
                });

                expect(organization.name).to.not.be.undefined();
                expect(organization.name).to.equal(singleRecord.data.items[0].facilityName);

                expect(organization.text).to.not.be.undefined();
                expect(organization.text.status).to.equal('generated');
                expect(organization.text.div).to.equal('<div>' + singleRecord.data.items[0].facilityName + '</div>');

                expect(organization.identifier).to.not.be.undefined();
                expect(organization.identifier[0].type).to.not.be.undefined();
                expect(organization.identifier[0].type).to.equal('facility-code');
                expect(organization.identifier[0].value).to.not.be.undefined();
                expect(organization.identifier[0].value).to.equal(singleRecord.data.items[0].facilityCode);

                expect(organization).to.not.be.undefined();

            });

            it('sets (unreferenced) Location correctly', function() {

                var location = _.find(fhirItem.contained, function(item) {
                    return item.resourceType === 'Location';
                });

                expect(location).to.not.be.undefined();

                expect(location.name).to.not.be.undefined();
                expect(location.name).to.equal(singleRecord.data.items[0].locationName);

                expect(location.text).to.not.be.undefined();
                expect(location.text.status).to.equal('generated');
                expect(location.text.div).to.equal('<div>' + singleRecord.data.items[0].locationName + '</div>');

                expect(location.identifier).to.not.be.undefined();
                expect(location.identifier.type).to.not.be.undefined();
                expect(location.identifier.type).to.equal('location-uid');
                expect(location.identifier.value).to.not.be.undefined();
                expect(location.identifier.value).to.equal(singleRecord.data.items[0].locationUid);

            });

            //we can optionally include the un-referenced contained resources as well

        });

    });

});
