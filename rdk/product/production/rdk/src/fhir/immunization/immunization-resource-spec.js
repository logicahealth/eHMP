'use strict';

var _ = require('lodash');
var ImmunizationResource = require('./immunization-resource');
var fhirUtils = require('../common/utils/fhir-converter');
var immunization = require('./immunization-resource');
var immunizationIn = require('./immunization-resource-spec-data');


describe('Immunization Conformance Statement', function() {

    var testConformance = immunizationIn.conformanceData;
    var builtConformance = immunization.createConformanceData();

    it('verifies that a generated conformance statement exists', function() {
        expect(builtConformance).not.to.be.undefined();
    });

    describe('Immunization Conformance Details', function() {
        it('verifies metadata are valid', function() {
            expect(builtConformance.type).to.eql(testConformance.rest[0].resource[0].type);
            expect(builtConformance.profile.reference).to.eql(testConformance.rest[0].resource[0].profile.reference);
            expect(builtConformance.interaction[0].code).to.eql('read');
            expect(builtConformance.interaction[1].code).to.eql('search-type');
        });

        it('verifies conformance search parameters are valid', function() {
            expect(builtConformance.searchParam[0].name).to.eql('subject.identifier');
            expect(builtConformance.searchParam[1].name).to.eql('start');
            expect(builtConformance.searchParam[2].name).to.eql('_count');
        });
    });
});


describe('Immunization FHIR Resource', function() {

    var req = {
        '_pid': 'SITE;253',
        query: '/fhir/diagnosticreport?subject.identifier=SITE;253&domain=rad',
        headers: {
            host: 'localhost:PORT'
        },
        protocol: 'http'
    };
    var vprImmunizations = immunizationIn.inputValue.data.items;
    var fhirEntries = ImmunizationResource.getFhirItems(immunizationIn.inputValue, req);

    it('verifies that given a valid VPR Immunization Resource converts to a defined FHIR Immunization Resource object', function() {
        expect(fhirEntries).not.to.be.undefined();
    });

    //------------------------------------------------------------
    //FOR EACH VPR HealthFactor found, do certain attribute checks.
    //------------------------------------------------------------
    _.each(vprImmunizations, function(vprI) {

        it('verifies that each VPR Immunization Resource has a coresponding FHIR Immunization Resource in the collection with the same uid', function() {
            var fhirImmunes = _.filter(fhirEntries, function(i) {
                return i.resource.identifier[0].value === vprI.uid;
            });
            expect(fhirImmunes).to.not.be.undefined();

            _.each(fhirImmunes, function(fhirI) {
                checkImmuneResource(fhirI, vprI);
            });
        });
    });
}); // describe('Immunization FHIR Resource'


function checkImmuneResource(fhirIEntry, vprI) {
    var fhirI = fhirIEntry.resource;
    if (fhirI !== undefined) {
        describe('found FHIR Immune coresponds to the original VPR Immune Resource', function() {

            it('verifies that the facility information from VPR Immune Resource coresponds to the one from the FHIR Immune Resource', function() {
                var organization = _.find(fhirI.contained, function(cont) {
                    return cont.resourceType === 'Organization';
                });
                expect(organization.name).to.equal(vprI.facilityName);
                expect(organization.identifier[0].value).to.equal(vprI.facilityCode);
            });

            it('verifies that the administered date time from VPR Immunization Resource coresponds to the one from the FHIR Immunization Resource', function() {
                expect(fhirI.date).to.equal(fhirUtils.convertToFhirDateTime(vprI.administeredDateTime, fhirUtils.getSiteHash(vprI.uid)));
            });


            it('verifies that the summary from the VPR Immunization Resource coresponds to the text in the FHIR Immunization Resource', function() {
                expect(fhirI.text).to.not.be.undefined();
                expect(fhirI.text.div).to.equal( '<div>' + vprI.summary + '</div>');
            });

            expect(fhirI.vaccineType).to.not.be.undefined();

            //check and get first mapped codes
            expect(fhirI.vaccineType.coding[0]).to.not.be.undefined();
            var coding = fhirI.vaccineType.coding;

            it('verifies that the code from VPR Immunization Resource coresponds to the one from FHIR Immunization Resource', function() {
                if (coding !== undefined) {
                    //----------------------------------------------------
                    //CHECK for mapped code. Note that
                    //codes could be from either vprI.codes or from vpr.cptCode, or both
                    //----------------------------------------------------
                    if (vprI.codes === undefined) {
                        //codes from cptCode
                        expect(coding[0].code).to.equal(vprI.cptCode);
                        expect(coding[0].display).to.equal(vprI.cptName);
                    } else {
                        //codes from codes
                        expect(coding[0].code).to.equal(vprI.codes[0].code);
                        expect(coding[0].display).to.equal(vprI.codes[0].display);

                        if (vprI.cptCode !== undefined) {
                            //codes from cptCode
                            expect(coding[1].code).to.equal(vprI.cptCode);
                            expect(coding[1].display).to.equal(vprI.cptName);
                        }
                    }
                }
            });

            it('verifies that the performer uid from VPR Immunization Resource coresponds to the one from the FHIR Immunization Resource', function() {
                var pUid = _.find(fhirI.contained, function(c) {
                    return c.resourceType === 'Practitioner';
                });
                expect(pUid.identifier[0].value).to.equal(vprI.performerUid);
                expect(pUid.text.status).to.equal('generated');
                expect(pUid.name).to.equal(vprI.performerName);
                expect(fhirUtils.removeDivFromText(pUid.text.div)).to.equal(vprI.performerName);
                expect(pUid.identifier[0].system).to.equal('http://vistacore.us/fhir/id/uid');
            });

            it('verifies that the encounter uid from VPR Immunization Resource coresponds to the one from the FHIR Immunization Resource', function() {
                var encounter = _.find(fhirI.contained, function(cont) {
                    return cont.resourceType === 'Encounter';
                });
                expect(encounter.identifier[0].value).to.equal(vprI.encounterUid);
                expect(encounter.text.status).to.equal('generated');
                expect(fhirUtils.removeDivFromText(encounter.text.div)).to.equal(vprI.encounterName);
                expect(encounter.identifier[0].system).to.equal('http://vistacore.us/fhir/id/uid');
                expect(encounter.status).to.equal('finished');
            });

            it('verifies that the pid from VPR Immunization Resource coresponds to the one from the FHIR Immunization Resource', function() {
                expect(fhirI.patient.reference).to.equal('Patient/' + vprI.pid);
            });

            it('verifies that the contraindicated information from VPR Immunization Resource coresponds to the one from the FHIR Immunization Resource', function() {
                var contra = _.find(fhirI.extension, function(e) {
                    return e.url === 'http://vistacore.us/fhir/extensions/immunization#contraindicated';
                });
                expect(contra.valueBoolean).to.equal(vprI.contraindicated);
            });

            it('verifies that the series name from VPR Immunization Resource corresponds to the one from the FHIR Immunization Resource', function() {
                var eSeries = _.find(fhirI.extension, function(e) {
                   return e.url === 'http://vistacore.us/fhir/extensions/immunization#seriesName';
                });
                expect(eSeries.valueString).to.equal(vprI.seriesName);
            });

            it('verifies that the seriesCode from VPR Immunization Resource coresponds to the one from the FHIR Immunization Resource', function() {
                var comm = _.find(fhirI.extension, function(e) {
                   return e.url === 'http://vistacore.us/fhir/extensions/immunization#seriesCode';
                });
                expect(comm.valueString).to.equal(vprI.seriesCode);
            });

            it('verifies that the location name from VPR Immunization Resource coresponds to the one from the FHIR Immunization Resource', function() {
                var lUid = _.find(fhirI.contained, function(c) {
                    return c.resourceType === 'Location';
                });
                expect(lUid.identifier[0].value).to.equal(vprI.locationUid);
                expect(lUid.text.status).to.equal('generated');
                expect(lUid.name).to.equal(vprI.locationName);
                expect(fhirUtils.removeDivFromText(lUid.text.div)).to.equal(vprI.locationName);
                expect(lUid.identifier[0].system).to.equal('http://vistacore.us/fhir/id/uid');
            });

            if (vprI.reactionCode !== undefined) {
                it('verifies that the reaction uid from VPR Immunization Resource coresponds to the one from the FHIR Immunization Resource', function() {
                    var reaction = _.find(fhirI.contained, function(cont) {
                        return cont.resourceType === 'Observation';
                    });
                    expect(reaction.code.coding[0].code).to.equal(vprI.reactionCode);
                    expect(reaction.code.coding[0].display).to.equal(vprI.reactionName);
                    expect(reaction.text.status).to.equal('generated');
                    expect(reaction.reliability).to.equal('unknown');
                    expect(reaction.valueString).to.equal(vprI.reactionName);
                    expect(fhirUtils.removeDivFromText(reaction.text.div)).to.equal(vprI.reactionName);
                });
            }
        });//end-describe
    }
}

//                    it('verifies that the series name from VPR Immunization Resource coresponds to the one from the FHIR Immunization Resource', function() {
//                        expect(fhirIm.content.reaction.detail.symptom.code.text).to.equal(vprIm.reactionName);
//                    });
//                });
//            }


