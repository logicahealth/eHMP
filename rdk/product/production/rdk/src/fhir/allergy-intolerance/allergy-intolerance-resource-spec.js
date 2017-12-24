'use strict';

var _ = require('lodash');
var allergyResource = require('./allergy-intolerance-resource');
var inputValue = require('./allergy-intolerance-resource-spec-data').inputValue;
var fhirUtils = require('../common/utils/fhir-converter');
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var constants = require('../common/utils/constants');

describe('AllergyIntolerance FHIR Resource', function() {

    describe('FHIR DSTU2 Mapping', function() {

        var req = {
            'pid': '10107V395912',
            originalUrl: '/fhir/allergyintolerance?subject.identifier=10107V395912',
            headers: {
                host: 'localhost:PORT'
            },
            protocol: 'http'
        };

        var vprAllergies = inputValue.data.items;
        var fhirEntries = allergyResource.getFhirItems(inputValue, req);

        it('verifies that VPR test data exists', function() {
            expect(vprAllergies).to.not.be.undefined();
        });

        it('verifies that given a valid VPR Allergy Resource converts to a defined FHIR AllergyIntolerance Resource object', function() {
            expect(fhirEntries).to.not.be.undefined();
        });

        //------------------------------------------------------------
        //FOR EACH VPR AllergyIntolerance found, do certain attribute checks.
        //------------------------------------------------------------
        //CHECK Fhir mapped attributes
        _.each(vprAllergies, function(vprA) {

            it('verifies that each VPR Allergy Resource has a coresponding FHIR AllergyIntolerance Resource in the collection with the same uid', function() {
                var fhirAs = _.filter(fhirEntries, function(a) {
                    return a.resource.identifier[0].value === vprA.uid;
                });
                expect(fhirAs).to.not.be.undefined();

                //CHECKING Fhir attributes validity for each Fhir AllergyIntolerance resource item.
                _.each(fhirAs, function(fhirA) {
                    allergyIntoleranceResource(fhirA, vprA);
                });
            });
        });
    }); //end-describe('FHIR DSTU2 Mapping'

}); //end-describe('Vitals


function allergyIntoleranceResource(fhirAResoure, vprA) {
    var fhirA = fhirAResoure.resource;
    if (fhirA !== undefined) {
        describe('found FHIR AllergyIntolerance coresponds to the original VPR Allergy Resource', function() {

        //Site hash is stored in an extension
        var siteHash = fhirUtils.getSiteHash(fhirA.uid);
        for (var ext in fhirA.extension) {
            if (fhirA.extension[ext].url === constants.allergyintolerancefhir.ALLERGYINTOLERANCE_EXTENSION_URL_PREFIX + 'uid') {
                siteHash = fhirA.extension[ext].valueString;
            }
        }
        siteHash = fhirUtils.getSiteHash(siteHash);

          //CHECKING ENTERED DATETIME
          it('verifies that the entered datetime information from VPR Allergy Resource coresponds to the recordedDate from the FHIR Allergy Resource', function() {
              expect(fhirA.recordedDate.replace('-00:00', '')).to.equal(fhirUtils.convertToFhirDateTime(vprA.entered, siteHash));
          });

          //CHECKING REQUIRED PATIENT ID
          it('verifies that the pid from VPR Allergy Resource coresponds to the patient reference from the FHIR Allergy Resource', function() {
              expect(fhirA.patient.reference).to.equal('Patient/'+vprA.pid);
          });

          //CHECKING REQUIRED SUBSTANCE CODING
          if (nullchecker.isNotNullish(vprA.drugClasses) && vprA.drugClasses.length > 0) {
              it('verifies that the drugClasses coding from VPR Allergy Resource coresponds to the substance coding from the FHIR Allergy Resource', function() {
                  expect(fhirA.substance.coding[0].code).to.equal(vprA.drugClasses[0].code);
              });
          } else {
              it('verifies that the drugClasses coding from VPR Allergy Resource coresponds to the substance coding from the FHIR Allergy Resource', function() {
                  expect(fhirA.substance.coding[0].code).to.equal(vprA.codes[0].code);
              });
          }

          //CHECKING EVENTs
          it('verified that the allergy events from VPR Vitals Resource coresponds to the allergy events from the FHIR Vitals Resource', function() {
              expect(fhirA.event).to.not.be.undefined();
              expect(fhirA.event[0].substance.coding[0].code).to.equal(vprA.products[0].vuid);
              expect(fhirA.event[0].substance.coding[0].display).to.equal(vprA.products[0].name);
              expect(fhirA.event[0].manifestation.coding[0].code).to.equal(vprA.reactions[0].vuid);
              expect(fhirA.event[0].manifestation.coding[0].display).to.equal(vprA.reactions[0].name);
          });

          //CHECKING EXTENSIONS .. should always have a 'kind' extension
          it('verified that the known un-mappable attributes from VPR Vitals Resource coresponds to the from the extension attributes from FHIR Vitals Resource', function() {
              expect(fhirA.extension).to.not.be.undefined();

              _.each(fhirA.extension, function(fhirExt) {
                  if (fhirExt.url === 'http://vistacore.us/fhir/extensions/algyInt#kind') {
                      expect(fhirExt.valueString).to.equal(vprA.kind);
                      return;
                  }
              });

          });

        }); //end-describe
    }
}

describe('Composition FHIR conformance', function() {

    var conformanceData = allergyResource.createAllergyIntoleranceConformanceData();

    it('conformance data is returned', function() {
        expect(conformanceData.type).to.equal('allergyIntolerance');
        expect(conformanceData.profile.reference).to.equal('http://hl7.org/fhir/2015MAY/allergyintolerance.html');

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

        expect(conformanceData.searchParam[2].name).to.equal('identifier.value');
        expect(conformanceData.searchParam[2].type).to.equal('string');
        expect(conformanceData.searchParam[2].definition).to.equal('http://hl7.org/FHIR/2015May/datatypes.html#string');

    });

});
