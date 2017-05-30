/*jslint node: true, nomen: true, unparam: true */
/*global window, jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

define([
    'require',
    'test/stubs',
    'jasminejquery',
    'underscore',
    'backbone'
], function(require, Stubs, jasminejquery, _, Backbone) {
    'use strict';


    describe('Setup Narrative Labs', function narrativeLabs() {
        var response = [];
        var DomainModel = _.get(window, ADK.ResourceService.DomainModel);
        var addFacilityMoniker = _.get(window, 'ADK.Enrichment.addFacilityMoniker');

        var Model;

        if (!DomainModel) {
            // This needs to exist before require a well
            _.set(window, 'ADK.ResourceService.DomainModel', Backbone.Model);
        }

        beforeEach(function(done) {
            _.set(window, 'ADK.ResourceService.DomainModel', Backbone.Model);
            _.set(window, 'ADK.Enrichment.addFacilityMoniker', function(response) {
                response.facilityMoniker = 'PAN';
                return response;
            });

            if (_.isUndefined(Model)) {
                require(['app/resources/fetch/narrative_labs/model'], function(model) {
                    Model = model;
                    return done();
                });
            } else {
                return done();
            }
        });

        afterEach(function() {
            _.set(window, 'ADK.ResourceService.DomainModel', DomainModel);
            _.set(window, 'ADK.Enrichment.addFacilityMoniker', addFacilityMoniker);
        });


        describe('Testing narrative labs model', function narrativeLabs() {
            beforeEach(function() {
                response = [{
                    'abnormal': false,
                    'categoryCode': 'urn:va:lab-category:EM',
                    'categoryName': 'Pathology',
                    'facilityCode': '500',
                    'facilityName': 'CAMP MASTER',
                    'groupName': 'EM 97 2',
                    'kind': 'Pathology',
                    'lastUpdateTime': '19971023000000',
                    'localId': 'EM;7028976',
                    'micro': false,
                    'observed': '19971023',
                    'organizerType': 'accession',
                    'pid': '9E7A;8',
                    'qualifiedName': '(urine, urine cath. wash)',
                    'resulted': '',
                    'results': [{
                        'localTitle': 'LR ELECTRON MICROSCOPY REPORT',
                        'resultUid': 'urn:va:document:9E7A:8:EM;7028976',
                        'uid': 'urn:va:lab:9E7A:8:EM;7028976'
                    }],
                    'specimen': 'urine, urine cath. wash',
                    'stampTime': '19971023000000',
                    'statusCode': 'urn:va:lab-status:completed',
                    'statusName': 'completed',
                    'summary': '(urine, urine cath. wash)',
                    'uid': 'urn:va:lab:9E7A:8:EM;7028976'
                }, {
                    'abnormal': false,
                    'categoryCode': 'urn:va:lab-category:SP',
                    'categoryName': 'Surgical Pathology',
                    'facilityCode': '500',
                    'facilityName': 'CAMP MASTER',
                    'groupName': 'SP 00 7',
                    'kind': 'Surgical Pathology',
                    'lastUpdateTime': '20000126000000',
                    'localId': 'SP;6999872.99996',
                    'micro': false,
                    'observed': '20000126000000',
                    'organizerType': 'accession',
                    'pid': '9E7A;8',
                    'qualifiedName': '(ear)',
                    'resulted': '',
                    'results': [{
                        'localTitle': 'LR SURGICAL PATHOLOGY REPORT',
                        'resultUid': 'urn:va:document:9E7A:8:SP;6999872.99996',
                        'uid': 'urn:va:lab:9E7A:8:SP;6999872.99996'
                    }],
                    'specimen': 'ear',
                    'stampTime': '20000126000000',
                    'statusCode': 'urn:va:lab-status:completed',
                    'statusName': 'completed',
                    'summary': '(ear)',
                    'uid': 'urn:va:lab:9E7A:8:SP;6999872.99996'
                }];
            });

            it('correctly parses the model', function() {
                var responseOne = response[0];
                var responseTwo = response[1];
                var responseThree = {};

                var modelOne = new Model(responseOne, {parse: true});
                var modelTwo = new Model(responseTwo, {parse: true});
                var modelThree = new Model(responseThree, {parse: true});

                expect(modelOne.get('displayTypeName')).toBe(responseOne.categoryName);
                expect(modelOne.get('narrativeDescription')).toBe(responseOne.results[0].localTitle);
                expect(modelOne.get('pathology')).toBe(true);
                expect(modelOne.get('loinc')).toBe(undefined);
                expect(modelOne.get('stdTestNames')).toBe(undefined);

                expect(modelTwo.get('displayTypeName')).toBe(responseTwo.categoryName);
                expect(modelTwo.get('narrativeDescription')).toBe(responseTwo.results[0].localTitle);
                expect(modelTwo.get('pathology')).toBe(true);
                expect(modelTwo.get('loinc')).toBe(undefined);
                expect(modelTwo.get('stdTestNames')).toBe(undefined);

                expect(modelThree.get('displayTypeName')).toBe('None');
                expect(modelThree.get('narrativeDescription')).toBe('None');
                expect(modelThree.get('pathology')).toBe(undefined);
                expect(modelThree.get('loinc')).toBe(undefined);
                expect(modelThree.get('stdTestNames')).toBe(undefined);
            });

            it('gets the correct category code', function() {
                var model = new Model(response[0], {parse: true});

                expect(model.getResponseCategoryCode()).toBe('EM');
                expect(model.getResponseCategoryCode(response[1].categoryCode)).toBe('SP');
            });

            it('checks if the response is in pathology correctly', function() {
                var model = new Model(response[0], {parse: true});

                expect(model.inPathology()).toBe(true);
                expect(model.inPathology(response[1].categoryCode)).toBe(true);
                expect(model.inPathology('AB')).toBe(false);
                expect(model.inPathology('CY')).toBe(true);
            });
        });

    });

});
