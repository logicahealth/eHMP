'use strict';

require('../../../../env-setup');

//------------------------------------------------------------------------
// This is a unit test for terminology-utils.js.
//
// Author: Les Westberg
//------------------------------------------------------------------------

const nock = require('nock');

let log = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//  name: 'test',
//  level: 'debug',
//  child: logUtil._createLogger
// });

const TerminologyUtil = require(global.VX_SUBSYSTEMS + 'terminology/terminology-utils');

let config = {
    terminology: {
        'protocol': 'http',
        'host': '1.2.3.4',
        'port': '5678',
        'timeout': 60000,
        'lncPath': '/term/lnc',
        'drugPath': '/term/drug',
        'jlvPath': '/term/jlv',
        'jlvListPath': '/term/jlvList'
    }
};

describe('terminology-utils.js', function() {
    describe('_isMappingTypeValid', function() {
        let terminologyUtil = new TerminologyUtil(log, log, {});

        it('invalid JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('hi2u')).toBeFalsy();
        });
        it('null JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid(null)).toBeFalsy();
        });
        it('AllergyVUIDtoUMLSCui JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('AllergyVUIDtoUMLSCui')).toBeTruthy();
        });
        it('AllergyCHCSIenToUMLSCui JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('AllergyCHCSIenToUMLSCui')).toBeTruthy();
        });
        it('AllergyDODNcidToUMLSCui JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('AllergyDODNcidToUMLSCui')).toBeTruthy();
        });
        it('LabUseLOINCtoGetText JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('LabUseLOINCtoGetText')).toBeTruthy();
        });
        it('LabDODNcidToLOINC JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('LabDODNcidToLOINC')).toBeTruthy();
        });
        it('VitalsVuidToLoinc JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('VitalsVuidToLoinc')).toBeTruthy();
        });
        it('VitalsDODNcidToLoinc JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('VitalsDODNcidToLoinc')).toBeTruthy();
        });
        it('ProblemsIcd9ToSnomedCT JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('ProblemsIcd9ToSnomedCT')).toBeTruthy();
        });
        it('ProblemsMedcinIdToSnomedCT JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('ProblemsMedcinIdToSnomedCT')).toBeTruthy();
        });
        it('MedicationVuidToRxNorm JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('MedicationVuidToRxNorm')).toBeTruthy();
        });
        it('MedicationDodNcidToRxNorm JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('MedicationDodNcidToRxNorm')).toBeTruthy();
        });
        it('NotesVuidToLoinc JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('NotesVuidToLoinc')).toBeTruthy();
        });
        it('NotesDodNcidToLoinc JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('NotesDodNcidToLoinc')).toBeTruthy();
        });
        it('ImmunizationCptToCvx JLV mapping code', function() {
            expect(terminologyUtil._isMappingTypeValid('ImmunizationCptToCvx')).toBeTruthy();
        });
        it('All valid mapping types tested', function() {
            expect(TerminologyUtil.validTypes.length).toEqual(14);
        });
    });

    describe('getVALoincConcept', function() {
        it('null concept', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVALoincConcept(null, function(error, result) {
               expect(error).toBe(null);
               expect(result).toBe(null);

               done();
            });
        });
        it('empty string concept', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVALoincConcept('', function(error, result) {
               expect(error).toBe(null);
               expect(result).toBe(null);

               done();
            });
        });
        it('Error path: unexpected statusCode returned by terminology service', function(done) {
            nock('http://1.2.3.4:5678').get('/term/lnc?concept=testcode').replyWithError('Error!');
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVALoincConcept('testcode', function(error, result) {
                expect(error).toBeTruthy();
                expect(error || '').toContain('Received error response from terminology service');
                expect(error || '').toContain('Error!');
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Error path: unexpected statusCode returned by terminology service', function(done) {
            nock('http://1.2.3.4:5678').get('/term/lnc?concept=testcode').reply(500, 'Error!');
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVALoincConcept('testcode', function(error, result) {
                expect(error).toBeTruthy();
                expect(error || '').toContain('Received error response from terminology service');
                expect(error || '').toContain('"statusCode":500');
                expect(error || '').toContain('body: "Error!"');
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Normal path: 204 empty response', function(done) {
            nock('http://1.2.3.4:5678').get('/term/lnc?concept=testcode').reply(204);
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVALoincConcept('testcode', function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Normal path: 200 response', function(done) {
            let mapResult = {
                'urn': 'urn:lnc:TEST-0',
                'parents': [],
                'codeSystem': 'LNC',
                'rels': {
                    'urn:lnc:67801-1': ['RB|has_member']
                },
                'description': 'Test',
                'terms': [],
                'sameas': [],
                'ancestors': [],
                'cui': 'C000000',
                'code': 'TEST-0',
                'aui': 'A0000000'
            };
            nock('http://1.2.3.4:5678').get('/term/lnc?concept=urn%3Alnc%3ATEST-0').reply(200, JSON.stringify(mapResult));
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVALoincConcept('urn:lnc:TEST-0', function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(result || {}).toEqual(jasmine.objectContaining(mapResult));
                done();
            });
        });
    });

    describe('getVADrugConcept', function(){
        it('null concept', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVADrugConcept(null, function(error, result) {
               expect(error).toBe(null);
               expect(result).toBe(null);

               done();
            });
        });
        it('empty string concept', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVADrugConcept('', function(error, result) {
               expect(error).toBe(null);
               expect(result).toBe(null);

               done();
            });
        });
        it('Error path: unexpected statusCode returned by terminology service', function(done) {
            nock('http://1.2.3.4:5678').get('/term/drug?concept=testcode').replyWithError('Error!');
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVADrugConcept('testcode', function(error, result) {
                expect(error).toBeTruthy();
                expect(error || '').toContain('Received error response from terminology service');
                expect(error || '').toContain('Error!');
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Error path: unexpected statusCode returned by terminology service', function(done) {
            nock('http://1.2.3.4:5678').get('/term/drug?concept=testcode').reply(500, 'Error!');
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVADrugConcept('testcode', function(error, result) {
                expect(error).toBeTruthy();
                expect(error || '').toContain('Received error response from terminology service');
                expect(error || '').toContain('"statusCode":500');
                expect(error || '').toContain('body: "Error!"');
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Normal path: 204 empty response', function(done) {
            nock('http://1.2.3.4:5678').get('/term/drug?concept=testcode').reply(204);
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVADrugConcept('testcode', function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Normal path: 200 response', function(done) {
            let mapResult = {
                'urn': 'urn:lnc:DRUG-0'
            };
            nock('http://1.2.3.4:5678').get('/term/drug?concept=urn%3Alnc%3ADRUG-0').reply(200, JSON.stringify(mapResult));
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getVADrugConcept('urn:lnc:DRUG-0', function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(result || {}).toEqual(jasmine.objectContaining(mapResult));
                done();
            });
        });
    });

    describe('getVAConceptMappingTo', function(){
        it('handles concept not having sameas list', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);
            let concept = {};

            spyOn(terminologyUtil, 'getVADrugConcept').andCallFake(function(targetUrn, callback){callback();});

            terminologyUtil.getVAConceptMappingTo(concept, 'ndrft', function(error, response){
                expect(terminologyUtil.getVADrugConcept).not.toHaveBeenCalled();
                expect(error).toBe(null);
                expect(response).toBe(null);
                done();
            });
        });
        it('handles finding matching concept in sameas list', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);
            let concept = {
                sameas: ['urn:test1:1234', 'urn:test2:1234', 'urn:ndrft:12345', 'urn:test3:1234']
            };

            let matchConcept = {
                urn: 'urn:ndrft:12345'
            };

            spyOn(terminologyUtil, 'getVADrugConcept').andCallFake(function(targetUrn, callback){callback(null, matchConcept);});

            terminologyUtil.getVAConceptMappingTo(concept, 'ndrft', function(error, response){
                expect(terminologyUtil.getVADrugConcept).toHaveBeenCalledWith('urn:ndrft:12345', jasmine.any(Function));
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(response || {}).toEqual(jasmine.objectContaining(matchConcept));
                done();
            });
        });
        it('handles not finding matching concept in sameas list', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);
            let concept = {
                sameas: ['urn:test1:1234', 'urn:test2:1234', 'urn:test3:1234']
            };

            spyOn(terminologyUtil, 'getVADrugConcept').andCallFake(function(targetUrn, callback){callback();});

            terminologyUtil.getVAConceptMappingTo(concept, 'ndrft', function(error, response){
                expect(terminologyUtil.getVADrugConcept).not.toHaveBeenCalled();
                expect(error).toBe(null);
                expect(response).toBe(null);
                done();
            });
        });
    });

    describe('getJlvMappedCode', function(){
        it('null code', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCode('AllergyVUIDtoUMLSCui', null, function(error, result) {
               expect(error).toBe(null);
               expect(result).toBe(null);

               done();
            });
        });
        it('empty string code', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCode('AllergyVUIDtoUMLSCui', '', function(error, result) {
               expect(error).toBe(null);
               expect(result).toBe(null);

               done();
            });
        });
        it('Error path: invalid mapping type', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCode('invalid mapping type', 'test', function(error, result) {
               expect(error).toBeTruthy();
               expect(error || '').toContain('Invalid mapping type requested');
               expect(result).toBeFalsy();

               done();
            });
        });
        it('Error path: unexpected statusCode returned by terminology service', function(done) {
            nock('http://1.2.3.4:5678').get('/term/jlv?type=AllergyVUIDtoUMLSCui&code=testcode').replyWithError('Error!');
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCode('AllergyVUIDtoUMLSCui', 'testcode', function(error, result) {
                expect(error).toBeTruthy();
                expect(error || '').toContain('Received error response from terminology service');
                expect(error || '').toContain('Error!');
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Error path: unexpected statusCode returned by terminology service', function(done) {
            nock('http://1.2.3.4:5678').get('/term/jlv?type=AllergyVUIDtoUMLSCui&code=testcode').reply(500, 'Error!');
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCode('AllergyVUIDtoUMLSCui', 'testcode', function(error, result) {
                expect(error).toBeTruthy();
                expect(error || '').toContain('Received error response from terminology service');
                expect(error || '').toContain('"statusCode":500');
                expect(error || '').toContain('body: "Error!"');
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Normal path: 204 empty response', function(done) {
            nock('http://1.2.3.4:5678').get('/term/jlv?type=AllergyVUIDtoUMLSCui&code=testcode').reply(204);
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCode('AllergyVUIDtoUMLSCui', 'testcode', function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Normal path: 200 response', function(done) {
            let mapResult = {
                'urn': 'urn:lnc:CODE-0'
            };
            nock('http://1.2.3.4:5678').get('/term/jlv?type=AllergyVUIDtoUMLSCui&code=urn%3Alnc%3ACODE-0').reply(200, JSON.stringify(mapResult));
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCode('AllergyVUIDtoUMLSCui', 'urn:lnc:CODE-0', function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(result || {}).toEqual(jasmine.objectContaining(mapResult));
                done();
            });
        });
    });
    describe('getJlvMappedCodeList', function(){
        it('null code', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCodeList('AllergyVUIDtoUMLSCui', null, function(error, result) {
               expect(error).toBe(null);
               expect(result).toBe(null);

               done();
            });
        });
        it('empty string code', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCodeList('AllergyVUIDtoUMLSCui', '', function(error, result) {
               expect(error).toBe(null);
               expect(result).toBe(null);

               done();
            });
        });
        it('Error path: invalid mapping type', function(done){
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCodeList('invalid mapping type', 'test', function(error, result) {
               expect(error).toBeTruthy();
               expect(error || '').toContain('Invalid mapping type requested');
               expect(result).toBeFalsy();

               done();
            });
        });
        it('Error path: unexpected statusCode returned by terminology service', function(done) {
            nock('http://1.2.3.4:5678').get('/term/jlvList?type=AllergyVUIDtoUMLSCui&code=testcode').replyWithError('Error!');
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCodeList('AllergyVUIDtoUMLSCui', 'testcode', function(error, result) {
                expect(error).toBeTruthy();
                expect(error || '').toContain('Received error response from terminology service');
                expect(error || '').toContain('Error!');
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Error path: unexpected statusCode returned by terminology service', function(done) {
            nock('http://1.2.3.4:5678').get('/term/jlvList?type=AllergyVUIDtoUMLSCui&code=testcode').reply(500, 'Error!');
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCodeList('AllergyVUIDtoUMLSCui', 'testcode', function(error, result) {
                expect(error).toBeTruthy();
                expect(error || '').toContain('Received error response from terminology service');
                expect(error || '').toContain('"statusCode":500');
                expect(error || '').toContain('body: "Error!"');
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Normal path: 204 empty response', function(done) {
            nock('http://1.2.3.4:5678').get('/term/jlvList?type=AllergyVUIDtoUMLSCui&code=testcode').reply(204);
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCodeList('AllergyVUIDtoUMLSCui', 'testcode', function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeFalsy();
                done();
            });
        });
        it('Normal path: 200 response', function(done) {
            let mapResult = {
                'urn': 'urn:lnc:CODE-0'
            };
            nock('http://1.2.3.4:5678').get('/term/jlvList?type=AllergyVUIDtoUMLSCui&code=urn%3Alnc%3ACODE-0').reply(200, JSON.stringify(mapResult));
            let terminologyUtil = new TerminologyUtil(log, log, config);

            terminologyUtil.getJlvMappedCodeList('AllergyVUIDtoUMLSCui', 'urn:lnc:CODE-0', function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(result || {}).toEqual(jasmine.objectContaining(mapResult));
                done();
            });
        });
    });
});