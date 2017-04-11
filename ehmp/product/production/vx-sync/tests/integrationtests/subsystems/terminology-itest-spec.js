'use strict';

require('../../../env-setup');

var request = require('request');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var querystring = require('querystring');
var util = require('util');
var wConfig = require(global.VX_ROOT + 'worker-config');
var config = JSON.parse(JSON.stringify(wConfig));            // Make sure we are not using a shared copy of this so we can make changes later and not side effect some other test.

var TerminologyUtil = require(global.VX_SUBSYSTEMS + '/terminology/terminology-utils');
var vx_sync_ip = require(global.VX_INTTESTS + 'test-config');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

config.terminology.host = vx_sync_ip;

var terminologyUtil = new TerminologyUtil(log, log, config);
describe('terminology subsystem', function() {
    var jlvParams = {
        type: 'AllergyVUIDtoUMLSCui',
        code: '4022084'
    };
    var drugParams = {
        concept: 'urn:ndfrt:N0000000001'
    };
    var lncParams = {
        concept: 'urn:lnc:1-8'
    };

    var jlvUrl = util.format('%s://%s:%s%s?%s',
        config.terminology.protocol,
        config.terminology.host,
        config.terminology.port,
        config.terminology.jlvPath,
        querystring.stringify(jlvParams));

    var drugUrl = util.format('%s://%s:%s%s?%s',
        config.terminology.protocol,
        config.terminology.host,
        config.terminology.port,
        config.terminology.drugPath,
        querystring.stringify(drugParams));

    var lncUrl = util.format('%s://%s:%s%s?%s',
        config.terminology.protocol,
        config.terminology.host,
        config.terminology.port,
        config.terminology.lncPath,
        querystring.stringify(lncParams));

    // console.log('jlvUrl=%s', jlvUrl);
    // console.log('drugUrl=%s', drugUrl);
    // console.log('lncUrl=%s', lncUrl);

    it('soap-handler jlv terminology', function() {
        var finished = false;
        var options = {
            url: jlvUrl
        };

        runs(function() {
            request(options, function(error, response, body) {
                expect(response).toBeDefined();
                expect(error).toBeFalsy();
                expect(body).toBeDefined();

                expect(val(response, 'statusCode')).toBe(200);

                try {
                    body = JSON.parse(body);
                } catch (error) {
                    body = undefined;
                }
                expect(body).toBeDefined();
                expect(val(body, 'code')).toBeDefined();
                expect(val(body, 'codeSystem')).toBeDefined();
                expect(val(body, 'displayText')).toBeDefined();

                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'terminology response', 6000);
    });
    it('soap-handler drug terminology', function() {
        var finished = false;
        var options = {
            url: drugUrl
        };

        runs(function() {
            request(options, function(error, response, body) {
                expect(response).toBeDefined();
                expect(body).toBeDefined();
                expect(error).toBeFalsy();

                expect(val(response, 'statusCode')).toBe(200);

                try {
                    body = JSON.parse(body);
                } catch (error) {
                    body = undefined;
                }
                expect(body).toBeDefined();
                expect(val(body, 'code')).toBeDefined();
                expect(val(body, 'terms')).toBeDefined();
                expect(val(body, 'description')).toBeDefined();

                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'terminology response', 6000);
    });
    it('soap-handler lnc terminology', function() {
        var finished = false;
        var options = {
            url: lncUrl
        };

        runs(function() {
            request(options, function(error, response, body) {
                expect(response).toBeDefined();
                expect(body).toBeDefined();
                expect(error).toBeFalsy();

                expect(val(response, 'statusCode')).toBe(200);

                try {
                    body = JSON.parse(body);
                } catch (error) {
                    body = undefined;
                }
                expect(body).toBeDefined();
                expect(val(body, 'codeSystem')).toBeDefined();
                expect(val(body, 'terms')).toBeDefined();
                expect(val(body, 'description')).toBeDefined();

                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'terminology response', 6000);
    });

    it('terminology subsystem drug lookup', function() {
        var finished = false;
        runs(function() {
            terminologyUtil.getVADrugConcept(drugParams.concept, function(error, concept) {
                expect(concept).toBeDefined();
                expect(error).toBeFalsy();
                expect(val(concept, 'code')).toBeDefined();
                expect(val(concept, 'terms')).toBeDefined();
                expect(val(concept, 'description')).toBeDefined();

                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'terminology response', 6000);
    });
    it('terminology subsystem jlv lookup', function() {
        var finished = false;
        runs(function() {
            terminologyUtil.getJlvMappedCode(jlvParams.type, jlvParams.code, function(error, concept) {
                expect(concept).toBeDefined();
                expect(error).toBeFalsy();
                expect(val(concept, 'code')).toBeDefined();
                expect(val(concept, 'codeSystem')).toBeDefined();
                expect(val(concept, 'displayText')).toBeDefined();

                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'terminology response', 6000);
    });
    it('terminology subsystem jlv lookup no content', function() {
        var finished = false;
        runs(function() {
            terminologyUtil.getJlvMappedCode('AllergyCHCSIenToUMLSCui', '1825400', function(error, concept) {
                expect(concept).toBeNull();
                expect(error).toBeFalsy();
                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'terminology response', 6000);
    });
    it('terminology subsystem lnc lookup', function() {
        var finished = false;
        runs(function() {
            terminologyUtil.getVALoincConcept(lncParams.concept, function(error, concept) {
                expect(error).toBeFalsy();
                expect(concept).toBeDefined();
                expect(val(concept, 'codeSystem')).toBeDefined();
                expect(val(concept, 'terms')).toBeDefined();
                expect(val(concept, 'description')).toBeDefined();

                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'terminology response', 6000);
    });

    it('terminology subsystem drug getConceptMappingTo()', function() {
        var finished = false;
        runs(function() {
            terminologyUtil.getVADrugConcept('urn:vandf:4000624', function(error, concept) {
                expect(concept).toBeDefined();
                expect(error).toBeFalsy();
                expect(val(concept, 'code')).toBeDefined();
                expect(val(concept, 'terms')).toBeDefined();
                expect(val(concept, 'description')).toBeDefined();
                expect(val(concept, 'sameas')).toBeDefined();

                terminologyUtil.getVAConceptMappingTo(concept, 'rxnorm', function(error, mappedConcept) {
                    expect(error).toBeFalsy();
                    expect(mappedConcept).toBeDefined();
                    expect(val(mappedConcept, 'urn')).toEqual('urn:rxnorm:1190692');
                });

                finished = true;
            });
        });
        waitsFor(function() {
            return finished;
        }, 'terminology response', 6000);
    });

});