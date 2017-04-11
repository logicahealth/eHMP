'use strict';

var rdk = require('../../../core/rdk');
var _ = require('lodash');
var vitalsResource = require('./vitals-resource');
var inputValue = require('./vitals-resource-spec-data').inputValue;
var fhirUtils = require('../../common/utils/fhir-converter');

var pid = '11016V630869';
var jdsBase = '/vpr/' + pid + '/find/vital';
var jdsPath;
var config = {
    jdsServer: {}
};
var logger = {
    debug: nop,
    error: nop
};

function nop() {}

function createParams(_count, _sort, code, date) {
    return {
        _count: _count,
        _sort: _sort,
        code: code,
        date: date
    };
}

function createParam(propName, value) {
    var obj = {};
    obj[propName] = value;
    return obj;
}

function testJDSPath(params, queryStr) {
    vitalsResource.getVitalsData(config, logger, pid, params, nop);
    expect(jdsPath).to.equal(jdsBase + queryStr);
}

describe('Vitals FHIR Resource', function() {
    describe('FHIR API params', function() {
        beforeEach(function() {
            jdsPath = undefined;
            sinon.stub(rdk.utils.http, 'get', function(options) {
                jdsPath = options.url;
            });
        });

        it('calls JDS correctly - no parameters', function() {
            testJDSPath({}, '');
        });
        it('calls JDS correctly - _count', function() {
            testJDSPath(createParam('_count', '10'), '?limit=10');
        });
        it('calls JDS correctly - _sort', function() {
            // sort property 'foo' is not mapped to any JDS property so we expect not to be part of the query
            testJDSPath(createParam('_sort', 'foo'), '');
            testJDSPath(createParam('_sort', 'date'), '?order=observed');
            testJDSPath(createParam('_sort', 'identifier'), '?order=uid');
            testJDSPath(createParam('_sort', 'patient'), '?order=pid');
            testJDSPath(createParam('_sort', 'subject'), '?order=pid');
            testJDSPath(createParam('_sort', 'performer'), '?order=facilityName');
            testJDSPath(createParam('_sort', 'value-quantity'), '?order=result');
            testJDSPath(createParam('_sort:asc', 'value-quantity'), '?order=result');
            testJDSPath(createParam('_sort:dsc', 'value-quantity'), '?order=result%20DESC');
        });
        it('calls JDS correctly - code', function() {
            testJDSPath(createParam('code', '8310-5'), '?filter=' + encodeURIComponent('eq("codes[].code",8310-5)'));
        });
        it('calls JDS correctly - system & code', function() {
            testJDSPath(createParam('code', 'http://loinc.org|8310-5'), '?filter=' + encodeURIComponent('and(eq("codes[].system",http://loinc.org),eq("codes[].code",8310-5))'));
        });
        it('calls JDS correctly - multiple codes', function() {
            testJDSPath(createParam('code', '9279-1,8310-5'), '?filter=' + encodeURIComponent('or(eq("codes[].code",9279-1),eq("codes[].code",8310-5))'));
        });
        it('calls JDS correctly - one system & multiple codes', function() {
            testJDSPath(createParam('code', 'http://loinc.org|9279-1,8310-5'), '?filter=' + encodeURIComponent('or(and(eq("codes[].system",http://loinc.org),eq("codes[].code",9279-1)),eq("codes[].code",8310-5))'));
        });
        it('calls JDS correctly - multiple systems & codes', function() {
            testJDSPath(createParam('code', 'http://loinc.org|9279-1,http://loinc.org|8310-5'), '?filter=' + encodeURIComponent('or(and(eq("codes[].system",http://loinc.org),eq("codes[].code",9279-1)),and(eq("codes[].system",http://loinc.org),eq("codes[].code",8310-5)))'));
        });
        it('calls JDS correctly - code AND system is not specified', function() {
            testJDSPath(createParam('code', '|8310-5'), '?filter=' + encodeURIComponent('and(not(exists("codes[].system")),eq("codes[].code",8310-5))'));
        });
        it('calls JDS correctly - multiple codes AND mixed system values', function() {
            testJDSPath(createParam('code', 'http://loinc.org|9279-1,|8310-5'), '?filter=' + encodeURIComponent('or(and(eq("codes[].system",http://loinc.org),eq("codes[].code",9279-1)),and(not(exists("codes[].system")),eq("codes[].code",8310-5)))'));
        });

        it('calls JDS correctly - date', function() {
            testJDSPath(createParam('date', '2015'), '?filter=' + encodeURIComponent('gte(observed,201501010000),lt(observed,201601010000)'));
            testJDSPath(createParam('date', '2015-02'), '?filter=' + encodeURIComponent('gte(observed,201502010000),lt(observed,201503010000)'));
            testJDSPath(createParam('date', '2015-02-03'), '?filter=' + encodeURIComponent('gte(observed,201502030000),lt(observed,201502040000)'));
            testJDSPath(createParam('date', '2015-02-03T20:15:18'), '?filter=' + encodeURIComponent('eq(observed,201502032015)'));
            testJDSPath(createParam('date', '2015-02-03T20:15:18Z'), '?filter=' + encodeURIComponent('eq(observed,201502032015)'));
        });
        it('calls JDS correctly with parameters combined', function() {
            testJDSPath(createParams('1', 'date', '8310-5', '2015'), '?filter=' + encodeURIComponent('eq("codes[].code",8310-5),gte(observed,201501010000),lt(observed,201601010000)') + '&limit=1&order=observed');
            testJDSPath(createParams('10', 'identifier', 'http://loinc.org|8310-5', '2015'), '?filter=' + encodeURIComponent('and(eq("codes[].system",http://loinc.org),eq("codes[].code",8310-5)),gte(observed,201501010000),lt(observed,201601010000)') + '&limit=10&order=uid');
            testJDSPath(createParams('5', 'value-quantity', 'http://loinc.org|8310-5', '2015-02-03T20:15:18Z'), '?filter=' + encodeURIComponent('and(eq("codes[].system",http://loinc.org),eq("codes[].code",8310-5)),eq(observed,201502032015)') + '&limit=5&order=result');
        });
    });

    describe('FHIR DSTU2 Mapping', function() {

        it('verifies that VPR test data exists', function() {
            expect(vprVitals).to.not.be.undefined();
        });

        var req = {
            'pid': '10107V395912',
            originalUrl: '/fhir/patient/10107V395912/observation',
            headers: {
                host: 'localhost:8888'
            },
            protocol: 'http'
        };

        var vprVitals = inputValue.data.items;
        var fhirEntries = vitalsResource.getFhirItems(inputValue, req);

        it('verifies that given a valid VPR Vitals Resource converts to a defined FHIR Vitals Resource object', function() {
            expect(fhirEntries).to.not.be.undefined();
        });

        //------------------------------------------------------------
        //FOR EACH VPR HealthFactor found, do certain attribute checks.
        //------------------------------------------------------------
        _.each(vprVitals, function(vprV) {

            it('verifies that each VPR Vitals Resource has a coresponding FHIR Vitals Resource in the collection with the same uid', function() {
                var fhirVs = _.filter(fhirEntries, function(v) {
                    return v.resource.identifier[0].value === vprV.uid;
                });
                expect(fhirVs).to.not.be.undefined();

                _.each(fhirVs, function(fhirV) {
                    vitalResource(fhirV, vprV);
                });
            });
        });
    }); //end-describe('FHIR DSTU2 Mapping'

}); //end-describe('Vitals


function vitalResource(fhirVResoure, vprV) {
    var fhirV = fhirVResoure.resource;
    if (fhirV !== undefined) {
        describe('found FHIR Vitals coresponds to the original VPR Vitals Resource', function() {

            it('verifies that the facility information from VPR Vitals Resource coresponds to the one from the FHIR Vitals Resource', function() {
                var organization = _.find(fhirV.contained, function(cont) {
                    return cont.resourceType === 'Organization';
                });
                expect(organization.name).to.equal(vprV.facilityName);
                expect(organization.identifier[0].value).to.equal(vprV.facilityCode);
            });

            it('verifies that the observed datetime information from VPR Vitals Resource coresponds to the one from the FHIR Vitals Resource', function() {
                expect(fhirV.appliesDateTime.replace('-00:00', '')).to.equal(fhirUtils.convertToFhirDateTime(vprV.observed));
            });

            if (fhirV.issued !== undefined) {
                it('verifies that the resulted datetime information from VPR Vitals Resource coresponds to the one from the FHIR Vitals Resource', function() {
                    expect(fhirV.issued.replace('-00:00', '')).to.equal(fhirUtils.convertToFhirDateTime(vprV.resulted));
                });
            }

            it('verifies that the summary from the VPR Vitals Resource coresponds to the text in the FHIR Vitals Resource', function() {
                expect(fhirV.text).to.not.be.undefined();

                var htmlformattedSumary;
                if (vprV.typeName !== 'BLOOD PRESSURE') {
                    htmlformattedSumary = '<div>' + vprV.summary + '</div>';
                    expect(fhirV.text.div).to.equal(htmlformattedSumary);
                } else {

                    // Format div html to have date/time pattern:  dd-MON YYYY 24HH:mm
                    var splitValues = vprV.result.split('/');
                    var splitLow = [],
                        splitHigh = [];
                    if (vprV.low !== undefined) {
                        splitLow = vprV.low.split('/');
                    }
                    if (vprV.high !== undefined) {
                        splitHigh = vprV.high.split('/');
                    }
                    var divDate = '';
                    if (vprV.observed !== undefined) {
                        divDate = ((vprV.observed.toString().substring(6, 8)[0] === '0') ? vprV.observed.toString().substring(7, 8) : vprV.observed.toString().substring(6, 8)) + '-' + fhirUtils.generateMonthName(vprV.observed.toString().substring(4, 6)) + ' ' + vprV.observed.toString().substring(0, 4) + ' ' +
                            ((vprV.observed.toString().substring(8, 10)[0] === '0') ? vprV.observed.toString().substring(9, 10) : vprV.observed.toString().substring(8, 10)) + ':' + ((vprV.observed.toString().substring(10, 12)[0] === '0') ? vprV.observed.toString().substring(11, 12) : vprV.observed.toString().substring(10, 12)) + ' : ';
                    }
                    htmlformattedSumary = '<div>' + divDate + 'Systolic blood pressure ' + splitValues[0].toString() + ' ' + vprV.units + '</div>';
                    //console.log('htmlformattedSumary='+ htmlformattedSumary);
                }

            });

            var coding = fhirV.code.coding[0];

            it('verifies that the code from VPR Vitals Resource coresponds to the one from FHIR Vitals Resource', function() {

                if (coding !== undefined) {

                    //----------------------------------------------------
                    //CHECK for mapped code. Note that
                    //given loinc code (urn:va:vuid:4500634) results in
                    //referenced lookup of coding value.
                    //----------------------------------------------------
                    if (vprV.typeCode !== 'urn:va:vuid:4500634') {
                        expect(coding.code).to.equal(vprV.typeCode);
                        expect(coding.display).to.equal(vprV.typeName);
                    } else {
                        if (coding.code === '55284-4') {
                            //check that there exists a contained of SYSTOLIC
                            expect(fhirV.contained[1].code.coding[0].code).to.equal('8480-6');

                            //check that there exists a contained of DIASTOLIC
                            expect(fhirV.contained[2].code.coding[0].code).to.equal('8462-4');
                        }
                    }
                }
            });

            it('verifies that the result from VPR Vitals Resource coresponds to the one from FHIR Vitals Resource', function() {
                if (vprV.typeCode !== 'urn:va:vuid:4500634') {
                    expect(fhirV.valueQuantity.value + '').to.equal(vprV.result);
                } else {
                    if (coding.code === '55284-4') {
                        //check that there exists a contained of SYSTOLIC
                        expect('' + fhirV.contained[1].valueQuantity.value).to.equal(vprV.result.split('/')[0]);

                        //check that there exists a contained of DIASTOLIC
                        expect('' + fhirV.contained[2].valueQuantity.value).to.equal(vprV.result.split('/')[1]);

                        expect(fhirV.valueString).to.equal(vprV.result);
                    }
                }
            });

            it('verifies that the units from VPR Vitals Resource coresponds to the one from FHIR Vitals Resource', function() {
                if (vprV.typeCode !== 'urn:va:vuid:4500634') {
                    if (vprV.units === '') {
                        expect(fhirV.valueQuantity.units).not.to.not.be.undefined();
                    } else {
                        expect(fhirV.valueQuantity.units).to.equal(vprV.units);
                    }
                }
            });

            it('verifies that the low value of the reference range from VPR Vitals Resource coresponds to the one from FHIR Vitals Resource', function() {
                if (vprV.typeCode !== 'urn:va:vuid:4500634') {
                    _.each(fhirV.referenceRange, function(val) {
                        var part = 0;
                        //                        if (vprV.typeCode === 'urn:va:vuid:4500634' && coding.code === '8462-4') {
                        //                            part = 1;
                        //                        }
                        if (val.low) {
                            expect('' + val.low.value).to.equal(vprV.low.split('/')[part]);
                        } else if (val.high) {
                            expect('' + val.high.value).to.equal(vprV.high.split('/')[part]);
                        }
                        expect(val.low.units).to.equal(vprV.units);
                        expect(val.high.units).to.equal(vprV.units);
                    });
                } else {
                    //CHECKING SYSTOLIC REFERENCE RANGE
                    var systolicRefRange = fhirV.contained[1].referenceRange[0];
                    expect('' + systolicRefRange.low.value).to.equal(vprV.low.split('/')[0]);

                    expect('' + systolicRefRange.high.value).to.equal(vprV.high.split('/')[0]);

                    expect(systolicRefRange.low.units).to.equal(vprV.units);
                    expect(systolicRefRange.high.units).to.equal(vprV.units);

                    //CHECKING DIASTOLIC REFERENCE RANGE
                    var diastolicRefRange = fhirV.contained[2].referenceRange[0];
                    expect('' + diastolicRefRange.low.value).to.equal(vprV.low.split('/')[1]);

                    expect('' + diastolicRefRange.high.value).to.equal(vprV.high.split('/')[1]);

                    expect(diastolicRefRange.low.units).to.equal(vprV.units);
                    expect(diastolicRefRange.high.units).to.equal(vprV.units);
                }
            });

            it('verifies that the facility from the VPR Vitals exists in the contained resources from the FHIR Vitals', function() {
                var resFacility = _.find(fhirV.contained, function(res) {
                    return res.resourceType === 'Organization' && res.identifier !== undefined; //&& res.identifier[0].label === 'facility-code';
                });
                expect(resFacility).to.not.be.undefined();
                expect(resFacility.identifier[0].value).to.equal(vprV.facilityCode);
                expect(resFacility.name).to.equal(vprV.facilityName);
            });

            it('verifies that the uid from VPR Vitals Resource coresponds to the one from FHIR Vitals Resource', function() {
                expect(fhirV.identifier[0].use).to.equal('official');
                expect(fhirV.identifier[0].system).to.equal('http://vistacore.us/fhir/id/uid');
                expect(fhirV.identifier[0].value).to.equal(vprV.uid);
            });

        }); //end-describe
    }
}
