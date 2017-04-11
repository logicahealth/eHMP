'use strict';
var educations = require('./educations');
var inputValue = require('./educationsOnly-resource-spec-data').jdsInput;
var _ = require('lodash');


describe('Procedure FHIR Resource - testing FHIR conversion of educations type data', function() {
    var req = {
        'pid': '9E7A;253',
        originalUrl: '/fhir/patient/11016V630869/educations?_tag=educations',
        headers: {
            host: 'localhost:8888'
        },
        protocol: 'http'
    };

    var vprItems = inputValue.data.items;
    var fhirEntries = educations.convertToFhir(vprItems, req);

    it('verifies that VPR test data exists', function() {
        expect(vprItems).to.not.be.undefined();
    });

    it('verifies that given a valid VPR Procedure Resource converts to a defined FHIR Procedure-educations Resource object', function() {
        expect(fhirEntries).to.not.be.undefined();
    });

    var aVprItem = vprItems[0];
    var aFhir = fhirEntries[0];
    expect(aFhir).not.to.be.undefined();


    it('verifies total items converted (' + fhirEntries.length + ') matches total items from vpr (' + vprItems.length + ')', function() {
        expect(vprItems.length).to.equal(fhirEntries.length);
    });

    describe('found FHIR Procedure (' + aVprItem.uid + ') coresponds to the original VPR Procedure Resource', function() {

        // CHECKING REQUIRED PATIENT ID
        it('verifies that the pid from VPR Educations Resource corresponds to the patient reference from the FHIR Procedure-education Resource', function() {
            expect(aFhir.patient.reference).to.equal('Patient/' + aVprItem.pid);
        });

        it('Verifies that Fhir structure contains all required attributes', function() {
            expect(aFhir.resourceType).to.equal('Procedure');
            expect(aFhir.patient.reference).to.equal('Patient/9E7A;237');
            expect(aFhir.status).to.equal(educations.jdsToFHIRStatusMap.get('COMPLETE'));
            expect(aFhir.type.coding[0].display).to.equal(aVprItem.name);
            expect(aFhir.identifier[0].value).to.not.be.undefined();

        });

    }); // end-describe

});
