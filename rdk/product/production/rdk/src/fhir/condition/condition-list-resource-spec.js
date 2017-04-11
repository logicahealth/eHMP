'use strict';
var _ = require('lodash');
var problemlistResource = require('./condition-list-resource');
var fhirUtils = require('../common/utils/fhir-converter');
var inputValue = require('./condition-list-resource-spec-data').inputValue;

describe('Problem (Condition List) FHIR Resource', function() {
    var req = {
        query: {
            'subject.identifier': '9E7A;253'
        },
        headers: {
            host: 'localhost:8888'
        },
        protocol: 'http'
    };
    var vprProblemList = inputValue.data.items;
    var fhirProblemList = problemlistResource.convertToFhir(inputValue, req);

    //console.log(JSON.stringify(fhirProblemList));
    it('verifies that given a valid VPR ProblemList Resource converts to a defined FHIR ProblemList Resource object', function() {
        expect(fhirProblemList).to.not.be.undefined();
    });
    _.each(vprProblemList, function(vprP) {
        it('verifies that each VPR Problem Resource has a coresponding FHIR Problem Resource in the collection with the same uid', function() {
            var fhirP = _.filter(fhirProblemList, function(p) {
                return p._id === vprP.uid;
            })[0];
            //expect(fhirP).to.not.be.undefined();
            //expect(fhirP.status).to.equal('confirmed');
            if (fhirP !== undefined) {
                describe('found FHIR Problem coresponds to the original VPR Problem Resource - uid: ' + vprP.uid, function() {
                    it('verifies that the kind information from VPR Problem Resource coresponds to the category code from the FHIR Problem Resource', function() {
                        expect(fhirP.category.coding[0].code).to.equal('diagnosis');
                        expect(fhirP.category.coding[0].system).to.equal('2.16.840.1.113883.4.642.2.224');
                    });
                    it('verifies that the summary information from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                        expect(fhirP.stage.summary).to.equal(vprP.summary);
                    });
                    it('verifies that the patient id from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                        expect(fhirP.subject.reference).to.equal(vprP.pid);
                    });
                    describe('Contained Resources', function() {
                        it('verifies that the facility from the VPR Problem Resource exists in the contained resources from the FHIR Problem', function() {
                            var resEncounter = _.find(fhirP.contained, function(res) {
                                return res.resourceType === 'Encounter';
                            });
                            expect(resEncounter).to.not.be.undefined();
                            if (resEncounter !== undefined && vprP.facilityName !== undefined || vprP.facilityCode !== undefined) {
                                expect(resEncounter.text.status).to.equal('generated');
                                expect(resEncounter.text.div).to.equal('<div>Encounter with patient 9E7A;253</div>');
                                expect(resEncounter.location[0].resourceType).to.equal('Location');
                                expect(resEncounter.location[0].identifier.value).to.equal(vprP.facilityCode);
                                expect(resEncounter.location[0].Name).to.equal(vprP.facilityName);
                                expect(resEncounter.location[0].identifier.system).to.equal('urn:oid:2.16.840.1.113883.6.233');
                            }
                        });
                        if (vprP.providerUid !== undefined || vprP.providerName !== undefined) {
                            it('verifies that the practitioner from the VPR Problem Resource exists in the contained resources from the FHIR Problem', function() {
                                var resPractitioner = _.find(fhirP.contained, function(res) {
                                    return res.resourceType === 'Practitioner';
                                });
                                expect(resPractitioner).to.not.be.undefined();
                                if (resPractitioner !== undefined) {
                                    expect(resPractitioner.resourceType).to.equal('Practitioner');
                                    expect(resPractitioner.identifier.system).to.equal('urn:oid:2.16.840.1.113883.6.233');
                                    expect(resPractitioner.identifier.value).to.equal(vprP.providerUid);
                                    expect(resPractitioner.name).to.equal(vprP.providerName);
                                }
                                expect(fhirP.asserter.reference).to.equal('#' + resPractitioner._id);
                                expect(fhirP.asserter.display).to.equal(vprP.providerName);
                            });
                        }
                    });
                    it('verifies that the icd code and name information from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                        expect(fhirP.code.coding[0].code).to.equal(vprP.icdCode);
                        expect(fhirP.code.coding[0].display).to.equal(vprP.icdName);
                    });
                    describe('extensions', function() {
                        if (vprP.statusCode !== undefined) {
                            it('verifies that the status code from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                                var statusCode = _.find(fhirP.extension, function(ext) {
                                    return ext.url === 'http://vistacore.us/fhir/extensions/condition#statusCode';
                                });
                                expect(statusCode.valueString).to.equal(vprP.statusCode);
                            });
                        }
                        if (vprP.statusName !== undefined) {
                            it('verifies that the status name from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                                var statusName = _.find(fhirP.extension, function(ext) {
                                    return ext.url === 'http://vistacore.us/fhir/extensions/condition#statusName';
                                });
                                expect(statusName.valueString).to.equal(vprP.statusName);
                            });
                        }
                        if (vprP.statusName !== undefined) {
                            it('verifies that the status display name from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                                var statusDisplayName = _.find(fhirP.extension, function(ext) {
                                    return ext.url === 'http://vistacore.us/fhir/extensions/condition#statusDisplayName';
                                });
                                expect(statusDisplayName.valueString).to.equal(vprP.statusDisplayName);
                            });
                        }
                        if (vprP.serviceConnected !== undefined) {
                            it('verifies that the service conected flag from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                                var serviceConnected = _.find(fhirP.extension, function(ext) {
                                    return ext.url === 'http://vistacore.us/fhir/extensions/condition#serviceConnected';
                                });
                                expect(serviceConnected.valueBoolean).to.equal(vprP.serviceConnected);
                            });
                        }
                        if (vprP.service !== undefined) {
                            it('verifies that the service field from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                                var service = _.find(fhirP.extension, function(ext) {
                                    return ext.url === 'http://vistacore.us/fhir/extensions/condition#service';
                                });
                                expect(service.valueString).to.equal(vprP.service);
                            });
                        }
                        if (vprP.updated !== undefined) {
                            it('verifies that the updated field from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                                var updated = _.find(fhirP.extension, function(ext) {
                                    return ext.url === 'http://vistacore.us/fhir/extensions/condition#updated';
                                });
                                expect(updated.valueDateTime).to.equal(fhirUtils.convertToFhirDateTime(vprP.updated, fhirUtils.getSiteHash(vprP.uid)));
                            });
                        }
                        if (vprP.comments !== undefined) {
                            it('verifies that the summary from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                                var comments = _.find(fhirP.extension, function(ext) {
                                    return ext.url === 'http://vistacore.us/fhir/extensions/condition#comments';
                                });
                                var txt1 = '<li>' + 'entered:' + vprP.comments[0].entered + '</li>';
                                var txt2 = txt1 + '<li>' + 'enteredByName:' + vprP.comments[0].enteredByName + '</li>';
                                var txt3 = txt2 + '<li>' + 'enteredByCode:' + vprP.comments[0].enteredByCode + '</li>';
                                var txt4 = txt3 + '<li>' + 'comment:' + vprP.comments[0].comment + '</li>';
                                var txt = txt4 + '<li>' + 'summary:' + vprP.comments[0].summary + '</li></ul></div>';
                                expect(comments.valueString).to.equal('<div><ul>' + txt);
                            });
                        }
                    });
                    it('verifies that the entered date from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                        expect(fhirP.dateAsserted).to.equal(fhirUtils.convertToFhirDateTime(vprP.entered, fhirUtils.getSiteHash(vprP.uid)));
                    });
                    it('verifies that the onset date from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                        expect(fhirP.onsetDate).to.equal(fhirUtils.convertToFhirDateTime(vprP.onset, fhirUtils.getSiteHash(vprP.uid)));
                    });
                    if (vprP.resolved !== undefined) {
                        it('verifies that the resolved from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                            expect(fhirP.abatementDate).to.equal(fhirUtils.convertToFhirDateTime(vprP.resolved, fhirUtils.getSiteHash(vprP.uid)));
                        });
                    }
                    if (vprP.locationUid !== undefined) {
                        it('verifies that the locationUid from VPR Problem Resource coresponds to the one from the FHIR Problem Resource', function() {
                            expect(fhirP.provider.reference).to.equal('#' + vprP.locationUid);
                        });
                    }
                });
            }
        });
    });

describe('Condition FHIR conformance', function() {

    var conformanceData = problemlistResource.createConditionConformanceData();

    it('conformance data is returned', function() {
        expect(conformanceData.type).to.equal('condition');
        expect(conformanceData.profile.reference).to.equal('http://hl7.org/fhir/2015MAY/condition.html');

        expect(conformanceData.interaction.length).to.equal(2);
        expect(conformanceData.interaction[0].code).to.equal('read');
        expect(conformanceData.interaction[1].code).to.equal('search-type');
    });

    it('conformance data searchParam is returned', function() {

        expect(conformanceData.searchParam.length).to.equal(4);

        expect(conformanceData.searchParam[0].name).to.equal('subject.identifier');
        expect(conformanceData.searchParam[0].type).to.equal('string');
        expect(conformanceData.searchParam[0].definition).to.equal('http://hl7.org/FHIR/2015May/datatypes.html#string');

        expect(conformanceData.searchParam[1].name).to.equal('pid');
        expect(conformanceData.searchParam[1].type).to.equal('string');
        expect(conformanceData.searchParam[1].definition).to.equal('http://hl7.org/FHIR/2015May/datatypes.html#string');

        expect(conformanceData.searchParam[2].name).to.equal('date-asserted');
        expect(conformanceData.searchParam[2].type).to.equal('dateTime');
        expect(conformanceData.searchParam[2].definition).to.equal('http://hl7.org/fhir/2015MAY/datatypes.html#dateTime');

        expect(conformanceData.searchParam[3].name).to.equal('onset');
        expect(conformanceData.searchParam[3].type).to.equal('dateTime');
        expect(conformanceData.searchParam[3].definition).to.equal('http://hl7.org/fhir/2015MAY/datatypes.html#dateTime');

    });

});

});
