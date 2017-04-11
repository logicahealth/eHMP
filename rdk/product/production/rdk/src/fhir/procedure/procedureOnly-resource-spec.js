'use strict';
var procedure = require('./procedure');
var inputValue = require('./procedureOnly-resource-spec-data').inputValue;
var fhirUtils = require('../common/utils/fhir-converter');

describe('Procedure FHIR Resource - testing FHIR conversion of non-educations procedure type data', function() {

    var req = {
        'pid': '9E7A;100599',
        originalUrl: '/fhir/patient/9E7A;100599/procedure?_tag=procedure',
        headers: {
            host: 'localhost:8888'
        },
        protocol: 'http'
    };

    var vprProcedures = inputValue.data.items;
    var fhirProcedureEntries = procedure.convertToFhir(vprProcedures, req);

    it('verifies that VPR test data exists', function() {
        expect(vprProcedures).to.not.be.undefined();
    });

    it('verifies that given a valid VPR Procedure Resource converts to a defined FHIR Procedure-procedure Resource object', function() {
        expect(fhirProcedureEntries).to.not.be.undefined();
    });

    var vprP = vprProcedures[0];
    var fhirP = fhirProcedureEntries[0];
    expect(fhirP).not.to.be.undefined();

    it('verifies total items converted (' + fhirProcedureEntries.length + ') matches total items from vpr (' + vprProcedures.length + ')', function() {
        expect(vprProcedures.length).to.equal(fhirProcedureEntries.length);
    });

    describe('found FHIR Procedure (' + vprP.uid + ') coresponds to the original VPR Procedure Resource', function() {

        // CHECKING REQUIRED PATIENT ID
        it('verifies that the pid from VPR Procedure Resource coresponds to the patient reference from the FHIR Procedure Resource', function() {
            expect(fhirP.patient.reference).to.equal('Patient/' + vprP.pid);
        });

        it('Verifies that Fhir structure contains all required attributes', function() {
            expect(fhirP.resourceType).to.equal('Procedure');
            expect(fhirP.patient.reference).to.equal('Patient/9E7A;100599');
            expect(fhirP.status).to.equal(procedure.jdsToFHIRStatusMap.get(vprP.statusName));
            expect(fhirP.type.coding[0].display).to.equal(vprP.name);
            expect(fhirP.identifier[0].value).to.equal('urn:va:procedure:9E7A:100599:8;MDD(702,');

        });

    }); // end-describe


}); // end-describe
