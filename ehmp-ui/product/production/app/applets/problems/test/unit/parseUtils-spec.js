/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */
 
'use strict';
 
define(['backbone', 'jasminejquery', 'app/applets/problems/writeback/parseUtils'],
   function (Backbone, Jasmine, ParseUtils) {

    describe('Test utility function findUser', function(){
        it('Should return undefined if it cannot find the provider', function(){
            var user = new Backbone.Model({duz: {'9E7A': '100000027'}, site: '9E7A'});
            var providerList = new Backbone.Collection([{code: '123456789', name: 'TEST,USER'}]);
            expect(ParseUtils.findUser(providerList, user)).toBeUndefined();
        });

        it('Should return the correct provider in the list', function(){
            var user = new Backbone.Model({duz: {'9E7A': '100000027'}, site: '9E7A'});
            var providerList = new Backbone.Collection([{code: '123456789', name: 'TEST,USER'}, {code: '100000027', name: 'USER,PANORAMA'}]);
            var result = ParseUtils.findUser(providerList, user);
            expect(result.get('code')).toEqual('100000027');
            expect(result.get('name')).toEqual('USER,PANORAMA');
        });
    });

    describe('Test utility function getClinic', function(){
        it('Should return empty list ofnot items in response', function(){
            expect(ParseUtils.getClinic({data: {}})).toEqual([]);
        });

        it('Should return the proper clincs', function(){
            var response = {
                data: {
                    items: [{
                        name: 'AUDIOLOGY',
                        localId: '12'
                    },
                    {
                        name: 'GENERAL MEDICINE',
                        localId: '34'
                    }]
                }
            };

            var clinicList = ParseUtils.getClinic(response);
            expect(clinicList.length).toEqual(2);
            expect(clinicList[0].label).toEqual('AUDIOLOGY');
            expect(clinicList[0].value).toEqual('12');
            expect(clinicList[1].label).toEqual('GENERAL MEDICINE');
            expect(clinicList[1].value).toEqual('34');
        });
    });

    describe('Test utility function getTreatmentFactors', function(){
        it('Should return an empty list when there are not exposures', function(){
            expect(ParseUtils.getTreatmentFactors(new Backbone.Model())).toEqual([]);
        });

        it('Should return the relevant exposures', function(){
            var patient = new Backbone.Model();
            var exposures = [{
                name: 'No',
                uid: 'urn:va:agent-orange:N'
            },
            {
                name: 'Yes',
                uid: 'urn:va:ionizing-radiation:Y'
            },
            {
                name: 'Unknown',
                uid: 'urn:va:head-neck-cancer:U'
            }];
            patient.set('exposure', exposures);
            patient.set('serviceConnected', true);

            var pickList = ParseUtils.getTreatmentFactors(patient);
            expect(pickList.length).toEqual(2);
            expect(pickList[0].name).toEqual('serviceConnected');
            expect(pickList[0].label).toEqual('Service Connected');
            expect(pickList[0].value).toEqual(false);
            expect(pickList[1].name).toEqual('ionizing-radiation');
            expect(pickList[1].label).toEqual('Radiation');
            expect(pickList[1].value).toEqual(false);
        });

        it('Should handle population of existing values', function(){
            var patient = new Backbone.Model();
            var exposures = [{
                name: 'Yes',
                uid: 'urn:va:agent-orange:N'
            },
            {
                name: 'Yes',
                uid: 'urn:va:ionizing-radiation:Y'
            },
            {
                name: 'Yes',
                uid: 'urn:va:head-neck-cancer:U'
            }];
            patient.set('exposure', exposures);
            patient.set('serviceConnected', true);

            var pickList = ParseUtils.getTreatmentFactors(patient, {radiation: 'YES', headNeckCancer: 'YES', agentOrange: 'YES', serviceConnected: true});
            expect(pickList.length).toEqual(4);
            expect(pickList[0].name).toEqual('serviceConnected');
            expect(pickList[0].value).toEqual(true);
            expect(pickList[0].label).toEqual('Service Connected');
            expect(pickList[1].name).toEqual('agent-orange');
            expect(pickList[1].label).toEqual('Agent Orange');
            expect(pickList[1].value).toEqual(true);
            expect(pickList[2].name).toEqual('ionizing-radiation');
            expect(pickList[2].label).toEqual('Radiation');
            expect(pickList[2].value).toEqual(true);
            expect(pickList[3].name).toEqual('head-neck-cancer');
            expect(pickList[3].label).toEqual('Head and/or Neck Cancer');
            expect(pickList[3].value).toEqual(true);
        });
    });

    describe('Test utility function get formatSearchErrorMessage', function(){
        it('Should return generic response if search failed', function(){
            var errorMessages = ParseUtils.formatSearchErrorMessage({});
            expect(errorMessages[0]).toEqual('An unexpected error occurred during your search. Try again');
        });

        it('Should format error message if too many results', function(){
            var errorMessages = ParseUtils.formatSearchErrorMessage({responseText:'{"message":"Your search HEA matched 18171 records, too many to Display. Refine your search","status":456}', status: 456});
            expect(errorMessages[0]).toEqual('Your search HEA matched 18171 records, too many to display.');
            expect(errorMessages[1]).toEqual('');
            expect(errorMessages[2]).toEqual('Suggestions:');
            expect(errorMessages[3]).toEqual('* Refine your search by adding more characters or words');
            expect(errorMessages[4]).toEqual('* Try different search terms');
        });

        it('Should format error message if code search fails', function(){
            var errorMessages = ParseUtils.formatSearchErrorMessage({responseText:'{"message":"Code search failed","status":456}', status: 456});
            expect(errorMessages[0]).toEqual('Code search failed.');
        });

        it('Should throw unexpected error if response status is not 456', function(){
            var errorMessages = ParseUtils.formatSearchErrorMessage({responseText:'{"message":"Internal server error.","status":500}', status: 500});
            expect(errorMessages[0]).toEqual('An unexpected error occurred during your search. Try again');
        });
    });

    describe('Test utility function buildSearchResults', function(){
        it('Should return an empty collection if there are no results', function(){
            expect(ParseUtils.buildSearchResults(new Backbone.Collection()).length).toEqual(0);
        });

        it('Should return results nested and sorted correctly', function(){
            var collection = new Backbone.Collection();
            collection.add(new Backbone.Model({prefText: 'B condition', conceptId: '54321'}));
            collection.add(new Backbone.Model({prefText: 'A condition', conceptId: '12345'}));
            collection.add(new Backbone.Model({prefText: 'C condition', conceptId: '98765'}));
            collection.add(new Backbone.Model({prefText: 'E condition', conceptId: '98765'}));
            collection.add(new Backbone.Model({prefText: 'D condition', conceptId: '98765'}));

            var newCollection = ParseUtils.buildSearchResults(collection);
            expect(newCollection.at(0).get('prefText')).toEqual('A condition');
            expect(newCollection.at(1).get('prefText')).toEqual('B condition');
            expect(newCollection.at(2).get('prefText')).toEqual('C condition');
            expect(newCollection.at(2).get('nodes').length).toEqual(2);
            expect(newCollection.at(2).get('nodes')[0].get('prefText')).toEqual('D condition');
            expect(newCollection.at(2).get('nodes')[1].get('prefText')).toEqual('E condition');
        });
    });

    describe('Parse utility function for building the edit problem model', function(){
        it('Test copying properties from detail model to the edit model - bare minimum', function(){
            var formModel = new Backbone.Model();
            var existingModel = new Backbone.Model();
            existingModel.set('updated', '20151230');
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);

            expect(formModel.get('editMode')).toEqual(true);
        });

        it('Test copying onset property', function(){
            var formModel = new Backbone.Model();
            var existingModel = new Backbone.Model({onset: '2015'});
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('onset-date')).toEqual('2015');

            existingModel.set('onset', '201503');
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('onset-date')).toEqual('03/2015');

            existingModel.set('onset', '20150201');
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('onset-date')).toEqual('02/01/2015');
        });

        it('Test copying status property', function(){
            var formModel = new Backbone.Model();
            var existingModel = new Backbone.Model({statusName: 'active'});
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('statusRadioValue')).toEqual('A^ACTIVE');

            existingModel.set('statusName', 'inactive');
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('statusRadioValue')).toEqual('I^INACTIVE');
        });

        it('Test copying acuity property', function(){
            var formModel = new Backbone.Model();
            var existingModel = new Backbone.Model({acuityName: 'chronic'});
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('immediacyRadioValue')).toEqual('C^CHRONIC');

            existingModel.set('acuityName', 'acute');
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('immediacyRadioValue')).toEqual('A^ACUTE');

            existingModel.set('acuityName', 'unknown');
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('immediacyRadioValue')).toEqual('U^UNKNOWN');
        });

        it('Test copying provider property', function(){
            var formModel = new Backbone.Model();
            var existingModel = new Backbone.Model({providerUid: 'urn:va:user:9E7A:1234'});
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('existingProviderId')).toEqual('1234');
        });

        it('Test copying location property', function(){
            var formModel = new Backbone.Model();
            var existingModel = new Backbone.Model({locationUid: 'urn:va:location:9E7A:64'});
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('existingLocationId')).toEqual('64');
            expect(formModel.get('existingLocationName')).toBeUndefined();

            var secondFormModel = new Backbone.Model();
            var secondExistingModel = new Backbone.Model({service: 'AUDIOLOGY'});
            ParseUtils.copyModelPropertiesForEdit(secondExistingModel, secondFormModel);
            expect(secondFormModel.get('existingLocationId')).toBeUndefined();
            expect(secondFormModel.get('existingLocationName')).toEqual('AUDIOLOGY');
        });

        it('Test copying comments property', function(){
            var formModel = new Backbone.Model();
            var existingModel = new Backbone.Model();

            var comments = [
                {
                    comment: 'test comment 1',
                    entered: 20151228,
                    enteredByCode: 'urn:va:user:9E7A:123456789',
                    enteredByName: 'TEST,USERONE'
                },
                {
                    comment: 'test comment 2',
                    entered: 20151230,
                    enteredByCode: 'urn:va:user:9E7A:987654321',
                    enteredByName: 'TEST,USERTWO'
                }
            ];
            existingModel.set('comments', comments);
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('annotations').at(0).get('commentString')).toEqual('test comment 1');
            expect(formModel.get('annotations').at(1).get('commentString')).toEqual('test comment 2');
            expect(formModel.get('annotations').at(0).get('author')).toEqual({name: 'TEST,USERONE', duz: {'9E7A': '123456789'}});
            expect(formModel.get('annotations').at(1).get('author')).toEqual({name: 'TEST,USERTWO', duz: {'9E7A': '987654321'}});
            expect(formModel.get('annotations').at(0).get('timeStamp')).toEqual('12/28/2015');
            expect(formModel.get('annotations').at(1).get('timeStamp')).toEqual('12/30/2015');
        });

        it('Test copying ien property', function(){
            var formModel = new Backbone.Model();
            var existingModel = new Backbone.Model({uid: 'urn:va:problem:9E7A:3:12345'});
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('problemIEN')).toEqual('12345');
        });

        it('Test copying problem text', function(){
            var formModel = new Backbone.Model();
            var existingModel = new Backbone.Model({problemText: 'test problem'});
            ParseUtils.copyModelPropertiesForEdit(existingModel, formModel);
            expect(formModel.get('problemText')).toEqual('test problem');
        });
    });
});