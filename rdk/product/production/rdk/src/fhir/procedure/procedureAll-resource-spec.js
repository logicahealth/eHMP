'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var procedureResource = require('./procedure-resource');
var procedure = require('./procedure');
var educations = require('./educations');
var inputValueProcedure = require('./procedureAll-resource-spec-data').inputValueProcedure;
var inputValueEducations = require('./procedureAll-resource-spec-data').inputValueEducations;
var fhirUtils = require('../common/utils/fhir-converter');

var async = require('async');

var procedureJDSPath;
var educationsJDSPath;
var pid = '9E7A;227';
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


describe('FHIR Procedure DSTU2 Mapping', function() {

    it('Test Retrieval of All Procedure dataset.', function() {
        req = {
            query: {
                pid: pid
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


        sinon.stub(async, 'parallel', function(fcnArray, callback) {
            callback(null, [
                inputValueEducations,
                inputValueProcedure
            ]);
        });

        sinon.spy(res, 'status');
        procedureResource.getProcedure(req, res);

        expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();

    });

    it('Test Retrieval of invalid _tag parameter.', function() {
        req = {
            query: {
                pid: pid,
                _tag: 'unknown'
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


        sinon.stub(async, 'parallel', function(fcnArray, callback) {
            callback(null, [
                inputValueEducations,
                inputValueProcedure
            ]);
        });

        sinon.spy(res, 'status');
        procedureResource.getProcedure(req, res);

        expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

    });
});

describe('Composition FHIR conformance', function() {

    var conformanceData = procedureResource.createConformanceData();

    it('conformance data is returned', function() {
        expect(conformanceData.type).to.equal('procedure');
        expect(conformanceData.profile.reference).to.equal('http://www.hl7.org/FHIR/2015May/procedure.html');

        expect(conformanceData.interaction.length).to.equal(2);
        expect(conformanceData.interaction[0].code).to.equal('read');
        expect(conformanceData.interaction[1].code).to.equal('search-type');
    });

    it('conformance data searchParam is returned', function() {

        expect(conformanceData.searchParam.length).to.equal(5);

        expect(conformanceData.searchParam[0].name).to.equal('subject.identifier');
        expect(conformanceData.searchParam[0].type).to.equal('string');
        expect(conformanceData.searchParam[0].definition).to.equal('http://www.hl7.org/FHIR/2015May/datatypes.html#string');

        expect(conformanceData.searchParam[1].name).to.equal('pid');
        expect(conformanceData.searchParam[1].type).to.equal('string');
        expect(conformanceData.searchParam[1].definition).to.equal('http://www.hl7.org/FHIR/2015May/datatypes.html#string');

    });

});

// }); // end-describe
