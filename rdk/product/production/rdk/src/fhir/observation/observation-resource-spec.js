'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var observationResource = require('./observation-resource');
var vitalsResource = require('./vitals/vitals-resource');
var healthFactors = require('./health-factors/health-factors');
var vitalsInputValue = require('./vitals-spec-data').inputValue;
var healthFactorsInputValue = require('./health-factors-spec-data').inputValue;
var fhirUtils = require('../common/utils/fhir-converter');

var vitalsJDSPath;
var healthFactorsJDSPath;
var pid = '11016V630869';

var req;
var res = {
    status: function() {
        return this;
    },
    rdkSend: function() {
        return this;
    },
    send: function() {
        return this;
    },
    end: function() {
        return this;
    }
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

function testJDSPath(params, vitalsQueryStr, healthFactorsQueryStr) {
    vitalsJDSPath = healthFactorsJDSPath = undefined;

    req.query = _.extend({
        pid: pid
    }, params);
    observationResource.getObservation(req, res);
    if (vitalsQueryStr === null) {
        expect(vitalsJDSPath).to.equal(undefined);
    } else {
        expect(vitalsJDSPath).to.equal('/vpr/' + pid + '/find/vital' + vitalsQueryStr);
    }
    if (healthFactorsQueryStr === null) {
        expect(healthFactorsJDSPath).to.equal(undefined);
    } else {
        expect(healthFactorsJDSPath).to.equal('/vpr/' + pid + '/find/factor/' + healthFactorsQueryStr);
    }
}

describe('Vitals FHIR Resource', function() {
    describe('FHIR API params', function() {
        beforeEach(function() {
            req = {
                query: {
                    pid: '11016V630869'
                },
                app: {
                    config: {
                        jdsServer: {}
                    }
                },
                logger: {
                    debug: nop,
                    error: nop
                },
                headers: {
                    host: 'localhost:8888'
                },
                protocol: 'http'
            };

            vitalsJDSPath = undefined;
            sinon.stub(rdk.utils.http, 'get', function(options) {
                if (_.contains(options.url, '/find/vital')) {
                    vitalsJDSPath = options.url;
                } else {
                    healthFactorsJDSPath = options.url;
                }
            });
        });

        it('calls JDS correctly - no parameters', function() {
            testJDSPath({}, '', '');
        });
        it('requests just Vitals when using _tag=vital-signs', function() {
            testJDSPath(createParam('_tag', 'vital-signs'), '', null);
        });
        it('requests just HealthFactors when using _tag=social-history', function() {
            testJDSPath(createParam('_tag', 'social-history'), null, '');
        });
        it('responds with Bad Request when using _tag with invalid domain', function() {
            req.query = _.extend({
                pid: pid
            }, createParam('_tag', 'foo'));
            sinon.spy(res, 'status');
            observationResource.getObservation(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('calls JDS correctly - _count', function() {
            testJDSPath(createParam('_count', '10'), '?limit=10', '?limit=10');
        });
        it('responds with Bad Request when sorting by unsupported values', function() {
            // sort property 'foo' is not mapped to any JDS property, we expect a Bad Request response
            req.query = _.extend({
                pid: pid
            }, createParam('_sort', 'foo'));
            sinon.spy(res, 'status');
            observationResource.getObservation(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('calls JDS correctly - _sort', function() {
            testJDSPath(createParam('_sort', 'date'), '?order=observed', '?order=entered');
            testJDSPath(createParam('_sort', 'identifier'), '?order=uid', '?order=uid');
            testJDSPath(createParam('_sort', 'patient'), '?order=pid', '?order=pid');
            testJDSPath(createParam('_sort', 'subject'), '?order=pid', '?order=pid');
            testJDSPath(createParam('_sort', 'performer'), '?order=facilityName', '?order=facilityName');

            // health-factors doesn't support value-quantity sorting
            testJDSPath(createParam('_sort', 'value-quantity'), '?order=result', '');
            testJDSPath(createParam('_sort:asc', 'value-quantity'), '?order=result', '');
            testJDSPath(createParam('_sort:desc', 'value-quantity'), '?order=result%20DESC', '');
        });
        it('calls JDS correctly - code', function() {
            // this query yields no results for HealthFactors so it gets short-circuited and the request is never made to JDS
            testJDSPath(createParam('code', '8310-5'), '?filter=' + encodeURIComponent('eq("codes[].code",8310-5)'), null);
            testJDSPath(createParam('code', '/concept/HF.foo'), '?filter=' + encodeURIComponent('eq("codes[].code",/concept/HF.foo)'), '?filter=' + encodeURIComponent('eq(name,"foo")'));
        });
        it('calls JDS correctly - system & code', function() {
            // this query yields no results for HealthFactors so it gets short-circuited and the request is never made to JDS
            testJDSPath(createParam('code', 'http://loinc.org|8310-5'), '?filter=' + encodeURIComponent('and(eq("codes[].system",http://loinc.org),eq("codes[].code",8310-5))'), null);
        });
        it('calls JDS correctly - multiple codes', function() {
            // this query yields no results for HealthFactors so it gets short-circuited and the request is never made to JDS
            testJDSPath(createParam('code', '9279-1,8310-5'), '?filter=' + encodeURIComponent('or(eq("codes[].code",9279-1),eq("codes[].code",8310-5))'), null);
        });
        it('calls JDS correctly - one system & multiple codes', function() {
            // this query yields no results for HealthFactors so it gets short-circuited and the request is never made to JDS
            testJDSPath(createParam('code', 'http://loinc.org|9279-1,8310-5'), '?filter=' + encodeURIComponent('or(and(eq("codes[].system",http://loinc.org),eq("codes[].code",9279-1)),eq("codes[].code",8310-5))'), null);
        });
        it('calls JDS correctly - multiple systems & codes', function() {
            // this query yields no results for HealthFactors so it gets short-circuited and the request is never made to JDS
            testJDSPath(createParam('code', 'http://loinc.org|9279-1,http://loinc.org|8310-5'), '?filter=' + encodeURIComponent('or(and(eq("codes[].system",http://loinc.org),eq("codes[].code",9279-1)),and(eq("codes[].system",http://loinc.org),eq("codes[].code",8310-5)))'), null);
        });
        it('calls JDS correctly - code AND system is not specified', function() {
            // this query yields no results for HealthFactors so it gets short-circuited and the request is never made to JDS
            testJDSPath(createParam('code', '|8310-5'), '?filter=' + encodeURIComponent('and(not(exists("codes[].system")),eq("codes[].code",8310-5))'), null);
        });
        it('calls JDS correctly - multiple codes AND mixed system values', function() {
            // this query yields no results for HealthFactors so it gets short-circuited and the request is never made to JDS
            testJDSPath(createParam('code', 'http://loinc.org|9279-1,|8310-5'), '?filter=' + encodeURIComponent('or(and(eq("codes[].system",http://loinc.org),eq("codes[].code",9279-1)),and(not(exists("codes[].system")),eq("codes[].code",8310-5)))'), null);
        });

        it('calls JDS correctly - date', function() {
            testJDSPath(createParam('date', '2015'), '?filter=' + encodeURIComponent('dgte(observed,\"201501010000\"),dlt(observed,\"201601010000\")'), '?filter=' + encodeURIComponent('dgte(entered,\"20150101000000\"),dlt(entered,\"20160101000000\")'));
            testJDSPath(createParam('date', '2015-02'), '?filter=' + encodeURIComponent('dgte(observed,\"201502010000\"),dlt(observed,\"201503010000\")'), '?filter=' + encodeURIComponent('dgte(entered,\"20150201000000\"),dlt(entered,\"20150301000000\")'));
            testJDSPath(createParam('date', '2015-02-03'), '?filter=' + encodeURIComponent('dgte(observed,\"201502030000\"),dlt(observed,\"201502040000\")'), '?filter=' + encodeURIComponent('dgte(entered,\"20150203000000\"),dlt(entered,\"20150204000000\")'));
            testJDSPath(createParam('date', '2015-02-03T20:15:18'), '?filter=' + encodeURIComponent('deq(observed,\"20150203201518\")'), '?filter=' + encodeURIComponent('deq(entered,\"20150203201518\")'));
            testJDSPath(createParam('date', '2015-02-03T20:15:18Z'), '?filter=' + encodeURIComponent('deq(observed,\"20150203201518\")'), '?filter=' + encodeURIComponent('deq(entered,\"20150203201518\")'));
        });
        it('calls JDS correctly with parameters combined', function() {
            // the following queries filter by codes that do not exist in the HealthFactors domain so requests are never made for those to JDS
            testJDSPath(createParams('1', 'date', '8310-5', '2015'), '?filter=' + encodeURIComponent('eq("codes[].code",8310-5),dgte(observed,\"201501010000\"),dlt(observed,\"201601010000\")') + '&limit=1&order=observed', null);
            testJDSPath(createParams('10', 'identifier', 'http://loinc.org|8310-5', '2015'), '?filter=' + encodeURIComponent('and(eq("codes[].system",http://loinc.org),eq("codes[].code",8310-5)),dgte(observed,\"201501010000\"),dlt(observed,\"201601010000\")') + '&limit=10&order=uid', null);
            testJDSPath(createParams('5', 'value-quantity', 'http://loinc.org|8310-5', '2015-02-03T20:15:18Z'), '?filter=' + encodeURIComponent('and(eq("codes[].system",http://loinc.org),eq("codes[].code",8310-5)),deq(observed,\"20150203201518\")') + '&limit=5&order=result', null);
        });
    });

    describe('FHIR Vitals DSTU2 Mapping', function() {
        var req = {
            'pid': '10107V395912',
            originalUrl: '/fhir/patient/10107V395912/observation',
            headers: {
                host: 'localhost:8888'
            },
            protocol: 'http'
        };
        var vprVitals = vitalsInputValue.data.items;
        var fhirEntries = vitalsResource.convertToFHIRObservations(vprVitals, req);

        it('verifies that given a valid VPR, Vitals Resource converts to FHIR Observation Resource objects', function() {
            expect(fhirEntries).to.not.be.undefined();
        });
        //------------------------------------------------------------
        //FOR EACH VPR record found, do certain attribute checks.
        //------------------------------------------------------------
        _.each(vprVitals, function(vprV) {

            it('verifies that each VPR Vitals Resource has a coresponding FHIR Observation Resource in the collection with the same uid', function() {
                var fhirVs = _.filter(fhirEntries, function(v) {
                    return v.resource.identifier[0].value === vprV.uid;
                });
                expect(fhirVs).to.not.be.undefined();

                _.each(fhirVs, function(fhirV) {
                    testVitalFHIRConversion(fhirV, vprV);
                });
            });
        });
    });

    describe('FHIR HealthFactors DSTU2 Mapping', function() {
        var req = {
            'pid': '10107V395912',
            originalUrl: '/fhir/patient/10107V395912/observation',
            headers: {
                host: 'localhost:8888'
            },
            protocol: 'http'
        };
        var vprHealthFactors = healthFactorsInputValue.data.items;
        var fhirEntries = healthFactors.convertToFHIRObservations(vprHealthFactors, req);

        it('verifies that given a valid VPR HealthFactors Resource converts to FHIR Observation Resource objects', function() {
            expect(fhirEntries).to.not.be.undefined();
        });
        //------------------------------------------------------------
        //FOR EACH VPR record found, do certain attribute checks.
        //------------------------------------------------------------
        _.each(vprHealthFactors, function(vprV) {

            it('verifies that each VPR HealthFactors Resource has a coresponding FHIR Observation Resource in the collection with the same uid', function() {
                var fhirVs = _.filter(fhirEntries, function(v) {
                    return v.resource.identifier[0].value === vprV.uid;
                });
                expect(fhirVs).to.not.be.undefined();

                _.each(fhirVs, function(fhirV) {
                    testHealthFactorsFHIRConversion(fhirV, vprV);
                });
            });
        });
    });
});


function testVitalFHIRConversion(fhirVResoure, vprV) {
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

            var siteHash = fhirUtils.getSiteHash(vprV.uid);
            it('verifies that the observed datetime information from VPR Vitals Resource coresponds to the one from the FHIR Vitals Resource', function() {
                expect(fhirV.appliesDateTime.replace('-00:00', '')).to.equal(fhirUtils.convertToFhirDateTime(vprV.observed, siteHash));
            });

            if (fhirV.issued !== undefined) {
                it('verifies that the resulted datetime information from VPR Vitals Resource coresponds to the one from the FHIR Vitals Resource', function() {
                    expect(fhirV.issued.replace('-00:00', '')).to.equal(fhirUtils.convertToFhirDateTime(vprV.resulted, siteHash));
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

function testHealthFactorsFHIRConversion(fhirHFResource, vprV) {
    if (fhirHFResource !== undefined) {
        describe('Factor resource attributes', function() {
            //CHECKING coding
            expect(fhirHFResource.resource.code.coding[0].display).to.eql(vprV.name);

            //CHECKING status
            expect(fhirHFResource.resource.status).to.eql('final');

            //CHECK appliesDateTime vs stampTime
            it('verifies that the healh factor entered date from VPR HealthFactor Resource corresponds to the one from the FHIR HealthFactor Resource', function() {
                expect(fhirHFResource.resource.appliesDateTime).to.eql(fhirUtils.convertToFhirDateTime(vprV.entered, fhirUtils.getSiteHash(vprV.uid)));
            });

            //CHECK performer vs Facility
            expect(fhirHFResource.resource.performer[0].display).to.eql(vprV.facilityName);
        });

        //CHECK contained
        describe('Contained Resources', function() {
            it('verifies that the Organization from the VPR HealthFactor Resource exists in the contained resources from the FHIR HealthFactor Resource', function() {
                var resOrganization = _.find(fhirHFResource.resource.contained, function(res) {
                    return res.resourceType === 'Organization';
                });
                expect(resOrganization).not.to.be.undefined();

                if (resOrganization !== undefined && vprV.facilityName !== undefined || vprV.facilityCode !== undefined) {
                    expect(resOrganization.id).not.to.be.undefined();
                    expect(resOrganization.identifier[0].value).to.eql(vprV.facilityCode);
                    expect(resOrganization.name).to.eql(vprV.facilityName);
                }
            });
        });
    } //end-if (fhirHFResource
}
