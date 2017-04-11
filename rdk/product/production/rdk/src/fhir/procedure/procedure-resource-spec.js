'use strict';

var procedure = require('./procedure');
var inputValue = require('./procedure-resource-spec-data').inputValue;
var fhirUtils = require('../common/utils/fhir-converter');

describe('Procedure FHIR Resource', function() {

    var req = {
        'pid' : '9E7A;100599',
        originalUrl : '/fhir/procedure?subject.identifier=9E7A;100599',
        headers : {
            host : 'localhost:8888'
        },
        protocol : 'http'
    };

    var vprProcedures = inputValue.data.items;
    var fhirProcedures = procedure.convertToFhir(inputValue, req);

    it('verifies that VPR test data exists', function() {
        expect(vprProcedures).to.not.be.undefined();
    });

    it('verifies that given a valid VPR Procedure Resource converts to a defined FHIR Procedure Resource object',function() {
        expect(fhirProcedures).to.not.be.undefined();
    });

    var vprP = vprProcedures[0];
    var fhirP = fhirProcedures.entry[0].resource;
    expect(fhirP).not.to.be.undefined();

    if (fhirP !== undefined) {
        describe('found FHIR Procedure (' + vprP.uid+ ') coresponds to the original VPR Procedure Resource',function() {

            // CHECKING REQUIRED PATIENT ID
            it('verifies that the pid from VPR Procedure Resource coresponds to the patient reference from the FHIR Procedure Resource',
                function() {
                expect(fhirP.patient.reference).to.equal('Patient/' + vprP.pid);
            });
        }); // end-describe
    }

}); // end-describe
