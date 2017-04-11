'use strict';

var resource = require('./notes-vista-writer');

describe('write-back notes vista writer', function() {
    describe('tests encounterObj()', function() {
        it('returns expected object when model contains a encounterServiceCategory, encounterDateTime, and locationIEN', function() {
            var model = {
                'authorUid': '10000000255',
                'documentDefUid': 'urn:va:doc-def:9E7A:40',
                'encounterDateTime': '199310131400',
                'encounterServiceCategory': 'A',
                'locationIEN': '32',
                'patientIcn': '10110V004877',
                'pid': '9E7A;8',
                'status': 'UNSIGNED'
            };
            var expectedObj = {
                location: '32',
                dateTime: '2931013.140000',
                category: 'A'
            };
            var retObj = resource._encounterObj(model);
            expect(retObj).to.eql(expectedObj);
        });
        it('returns empty object when model is missing encounterLocalId', function() {
            var model = {
                'authorUid': '10000000255',
                'documentDefUid': 'urn:va:doc-def:9E7A:40',
                'locationIEN': '32',
                'patientIcn': '10110V004877',
                'pid': '9E7A;8',
                'status': 'UNSIGNED'
            };
            var expectedObj = {};
            var retObj = resource._encounterObj(model);
            expect(retObj).to.eql(expectedObj);
        });
        it('returns empty object when model is missing encounterDateTime', function() {
            var model = {
                'authorUid': '10000000255',
                'documentDefUid': 'urn:va:doc-def:9E7A:40',
                'locationIEN': '32',
                'patientIcn': '10110V004877',
                'pid': '9E7A;8',
                'status': 'UNSIGNED'
            };
            var expectedObj = {};
            var retObj = resource._encounterObj(model);
            expect(retObj).to.eql(expectedObj);
        });
        it('returns empty object when model is missing locationIEN', function() {
            var model = {
                'authorUid': '10000000255',
                'documentDefUid': 'urn:va:doc-def:9E7A:40',
                'encounterDateTime': '199310131400',
                'patientIcn': '10110V004877',
                'pid': '9E7A;8',
                'status': 'UNSIGNED'
            };
            var expectedObj = {};
            var retObj = resource._encounterObj(model);
            expect(retObj).to.eql(expectedObj);
        });
    });
    // describe('tests getStub()', function() {
    //     it('returns expected array when model contains bare minimum ', function() {
    //         var model = {
    //             'authorUid': '10000000255',
    //             'documentDefUid': 'urn:va:doc-def:9E7A:40',
    //             'patientIcn': '10110V004877',
    //             'pid': '9E7A;8',
    //             'status': 'UNSIGNED'
    //         };
    //         var expectedArray = [{
    //             '\"data\"': '8^40^^^^10000000255^^^',
    //             '\"text\",1': 'This is a stub of an Unsigned note created in eHMP.',
    //             '\"text\",2': 'Please do not delete, edit, or sign this note here.',
    //             '\"text\",3': 'Please make any updates to the note in eHMP.',
    //             '\"text\",4': 'Changes here will not be saved in eHMP and may be overwritten.'
    //         }];
    //         var retObj = resource._getStub(model);
    //         expect(retObj).to.eql(expectedArray);
    //     });
    //     it('returns expected array when model contains referenceDateTime', function() {
    //         var model = {
    //             'authorUid': '10000000255',
    //             'documentDefUid': 'urn:va:doc-def:9E7A:40',
    //             'referenceDateTime': '201507101410',
    //             'patientIcn': '10110V004877',
    //             'pid': '9E7A;8',
    //             'status': 'UNSIGNED'
    //         };
    //         var expectedArray = [{
    //             '\"data\"': '8^40^^^^10000000255^3150710.1410^^',
    //             '\"text\",1': 'This is a stub of an Unsigned note created in eHMP.',
    //             '\"text\",2': 'Please do not delete, edit, or sign this note here.',
    //             '\"text\",3': 'Please make any updates to the note in eHMP.',
    //             '\"text\",4': 'Changes here will not be saved in eHMP and may be overwritten.'
    //         }];
    //         var retObj = resource._getStub(model);
    //         expect(retObj).to.eql(expectedArray);
    //     });
    //     it('returns expected array when model contains encounter information', function() {
    //         var model = {
    //             'authorUid': '10000000255',
    //             'documentDefUid': 'urn:va:doc-def:9E7A:40',
    //             'encounterUid': 'H2931013',
    //             'encounterDateTime': '199310131400',
    //             'referenceDateTime': '201507101410',
    //             'locationUid': 'urn:va:location:9E7A:32',
    //             'patientIcn': '10110V004877',
    //             'pid': '9E7A;8',
    //             'status': 'UNSIGNED'
    //         };
    //         var expectedArray = [{
    //             '\"data\"': '8^40^2931013.1400^32^^10000000255^3150710.1410^^32;2931013.1400;H',
    //             '\"text\",1': 'This is a stub of an Unsigned note created in eHMP.',
    //             '\"text\",2': 'Please do not delete, edit, or sign this note here.',
    //             '\"text\",3': 'Please make any updates to the note in eHMP.',
    //             '\"text\",4': 'Changes here will not be saved in eHMP and may be overwritten.'
    //         }];
    //         var retObj = resource._getStub(model);
    //         expect(retObj).to.eql(expectedArray);
    //     });
    // });
});