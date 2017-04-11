/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn,  afterEach */

'use strict';

define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'testUtil',
    'app/applets/allergy_grid/writeback/writebackUtils'
], function ($, Backbone, Marionette, Jasmine, testUtil, WritebackUtils) {

    function getResponse(){
        var response = {
            data: {
                topTen: [],
                allSymptoms: []
            }
        };

        response.data.topTen = new Backbone.Collection();
        var reactions = [{
            'ien': 'A',
            'name': 'Allergy'
        },
        {
            'ien': 'P',
            'name': 'Pharmacological'
        },
        {
            'ien': 'U',
            'name': 'Unknown'
        }];
        response.data.topTen.add(new Backbone.Model({categoryName: 'Nature of Reaction', values: new Backbone.Collection(reactions)}));

        var severities = [{
            'ien': '3',
            'name': 'Severe'
        },
        {
            'ien': '2',
            'name': 'Moderate'
        },
        {
            'ien': '1',
            'name': 'Mild'
        }];
        response.data.topTen.add(new Backbone.Model({categoryName: 'Severity', values: new Backbone.Collection(severities)}));

        var topTen = [{
            'ien': '39',
            'name': 'ANXIETY'
        },
        {
            'ien': '2',
            'name': 'ITCHING,WATERING EYES'
        },
        {
            'ien': '6',
            'name': 'ANOREXIA'
        },
        {
            'ien': '66',
            'name': 'DROWSINESS'
        },
        {
            'ien': '8',
            'name': 'NAUSEA,VOMITING'
        },
        {
            'ien': '9',
            'name': 'DIARRHEA'
        },
        {
            'ien': '1',
            'name': 'HIVES'
        },
        {
            'ien': '67',
            'name': 'DRY MOUTH'
        },
        {
            'ien': '69',
            'name': 'DRY NOSE'
        },
        {
            'ien': '133',
            'name': 'RASH'
        }];
        response.data.topTen.add(new Backbone.Model({categoryName: 'Top Ten', values: new Backbone.Collection(topTen)}));

        var allSymptoms = [{
            'ien': '476',
            'synonym': 'A FIB-FLUTTER\t<ATRIAL FIBRILLATION-FLUTTER>',
            'name': 'ATRIAL FIBRILLATION-FLUTTER'
        },
        {
            'ien': '237',
            'synonym': 'ABDOMINAL BLOATING',
            'name': 'ABDOMINAL BLOATING'
        },
        {
            'ien': '236',
            'synonym': 'ABDOMINAL CRAMPS',
            'name': 'ABDOMINAL CRAMPS'
        },
        {
            'ien': '429',
            'synonym': 'ABDOMINAL DISCOMFORT',
            'name': 'ABDOMINAL DISCOMFORT'
        }];

        response.data.allSymptoms = new Backbone.Collection(allSymptoms);
        /*var response = {
            data : {
                topTen: [{
                    'categoryName': 'Nature of Reaction',
                    'values': [{
                        'ien': 'A',
                        'name': 'Allergy'
                    },
                    {
                        'ien': 'P',
                        'name': 'Pharmacological'
                    },
                    {
                        'ien': 'U',
                        'name': 'Unknown'
                    }],
                },
                {
                    'categoryName': 'Severity',
                    'values': [{
                        'ien': '3',
                        'name': 'Severe'
                    },
                    {
                        'ien': '2',
                        'name': 'Moderate'
                    },
                    {
                        'ien': '1',
                        'name': 'Mild'
                    }]
                },
                {
                    'categoryName': 'Top Ten',
                    'values': [
                      {
                        'ien': '39',
                        'name': 'ANXIETY'
                      },
                      {
                        'ien': '2',
                        'name': 'ITCHING,WATERING EYES'
                      },
                      {
                        'ien': '6',
                        'name': 'ANOREXIA'
                      },
                      {
                        'ien': '66',
                        'name': 'DROWSINESS'
                      },
                      {
                        'ien': '8',
                        'name': 'NAUSEA,VOMITING'
                      },
                      {
                        'ien': '9',
                        'name': 'DIARRHEA'
                      },
                      {
                        'ien': '1',
                        'name': 'HIVES'
                      },
                      {
                        'ien': '67',
                        'name': 'DRY MOUTH'
                      },
                      {
                        'ien': '69',
                        'name': 'DRY NOSE'
                      },
                      {
                        'ien': '133',
                        'name': 'RASH'
                      }]
                }],
                allSymptoms: [{
                    'ien': '476',
                    'synonym': 'A FIB-FLUTTER\t<ATRIAL FIBRILLATION-FLUTTER>',
                    'name': 'ATRIAL FIBRILLATION-FLUTTER'
                },
                {
                    'ien': '237',
                    'synonym': 'ABDOMINAL BLOATING',
                    'name': 'ABDOMINAL BLOATING'
                },
                {
                    'ien': '236',
                    'synonym': 'ABDOMINAL CRAMPS',
                    'name': 'ABDOMINAL CRAMPS'
                },
                {
                    'ien': '429',
                    'synonym': 'ABDOMINAL DISCOMFORT',
                    'name': 'ABDOMINAL DISCOMFORT'
                }]
            }
        };*/

        return response;
    }

    function setSignsSymptoms(id, description, symptomDate, symptomTime, boolValue){
        var model = new Backbone.Model();
        model.set('id', id);
        model.set('description', description);
        model.set('symptom-date', symptomDate);
        model.set('symptom-time', symptomTime);
        model.set('booleanValue', boolValue);

        return model;
    }

    function getModel(allergen, allergyType, natureOfReaction, reactionTime, reactionDate, labelAllergen, labelNR, saveSignsSymptomsArray ){
        var model = new Backbone.Model();
        var labelModel = new Backbone.Model();
        model.set('allergen', allergen);
        model.set('allergyType', allergyType);
        model.set('nature-of-reaction', natureOfReaction);
        model.set('reaction-time', reactionTime);
        model.set('reaction-date', reactionDate);

        labelModel.set('allergen', labelAllergen);
        labelModel.set('nature-of-reaction', labelNR);
        model.set('_labelsForSelectedValues', labelModel);

        model.set('signsSymptoms', saveSignsSymptomsArray);

        return model;
    }

    function getUser(){
        var user = new Backbone.Model();
        user.set('site', '9E7A');
        user.set('duz', {'9E7A': '1234'});
        return user;
    }

    function getCurrentPatient(){
        var patient = new Backbone.Model();
        patient.set('pid', '9E7A;1234');
        patient.set('visit', {uid: 'urn:va:user:1234', refId: '1234'});
        return patient;
    }

    describe('Test parse of operational data list for allergy writeback ', function() {
        var response = null;

        beforeEach(function() {
            response = getResponse();
        });

        afterEach(function() {
            response = null;
        });

        it('should validate nature of reaction operational list', function() {
            var reactionList = WritebackUtils.parseOperationalDataList(response,'Nature of Reaction');
            expect(reactionList.length).toEqual(3);
            expect(reactionList[0].label).toEqual('Allergy');
            expect(reactionList[1].label).toEqual('Pharmacological');
            expect(reactionList[2].label).toEqual('Unknown');
        });

        it('should validate severity operational list', function() {
            var severityList = WritebackUtils.parseOperationalDataList(response, 'Severity');
            expect(severityList.length).toEqual(3);
            expect(severityList[0].label).toEqual('Severe');
            expect(severityList[1].label).toEqual('Moderate');
            expect(severityList[2].label).toEqual('Mild');
        });
    });

    describe('Test parse of symptom list for allergy writeback', function() {
        var response = null;

        beforeEach(function() {
            response = getResponse();
        });

        afterEach(function() {
            response = null;
        });

        it('should validate the symptom list', function() {
            var symptomCollection = WritebackUtils.parseSymptomList(response);
            expect(symptomCollection.size()).toEqual(14);
            expect(symptomCollection.at(0).get('id')).toEqual('39');
            expect(symptomCollection.at(0).get('description')).toEqual('ANXIETY');
            expect(symptomCollection.at(0).get('booleanValue')).toEqual(false);
        });
    });

    describe('Test parsing of allergen list', function(){
        it('should return an empty array if there are no data in the response', function(){
            var allergenList = WritebackUtils.parseAllergenResponse([], false);
            expect(allergenList.length).toEqual(0);
        });

        it('should return the properly formatted allergen array', function(){
            var response = [{
                group: 'VA Allergies',
                pickList: [{
                    value: '1;FileLoc1',
                    label: 'Allergy 1'
                },
                {
                    value: '2;FileLoc2',
                    label: 'Allergy 2'
                }]
            },
            {
                group: 'National Drug File',
                pickList: [{
                    value: '3;FileLoc3',
                    label: 'National Allergy'
                }]
            },
            {
                group: 'Empty Category'
            }];

            var allergenList = WritebackUtils.parseAllergenResponse(response, false);
            expect(allergenList.length).toEqual(2);
            expect(allergenList[0].group).toEqual('VA Allergies (2)');
            expect(allergenList[1].group).toEqual('National Drug File (1)');
            expect(allergenList[0].pickList.length).toEqual(2);
            expect(allergenList[0].pickList[0].value).toEqual('1;FileLoc1');
            expect(allergenList[0].pickList[1].value).toEqual('2;FileLoc2');
            expect(allergenList[0].pickList[0].label).toEqual('Allergy 1');
            expect(allergenList[0].pickList[1].label).toEqual('Allergy 2');
            expect(allergenList[1].pickList.length).toEqual(1);
            expect(allergenList[1].pickList[0].value).toEqual('3;FileLoc3');
            expect(allergenList[1].pickList[0].label).toEqual('National Allergy');
        });

        it('should remove no known allergies allergen and group when flag is true', function(){
            var response = [{
                group: 'VA Allergies',
                pickList: [{
                    value: '1;FileLoc1',
                    label: 'Allergy 1'
                },
                {
                    value: '2;FileLoc2',
                    label: 'Allergy 2'
                }]
            },
            {
                group: 'National Drug File',
                pickList: [{
                    value: '3;FileLoc3',
                    label: 'NO KNOWN ALLERGIES <NO ALLERGIES>'
                }]
            }];

            var allergenList = WritebackUtils.parseAllergenResponse(response, true);
            expect(allergenList.length).toEqual(1);
            expect(allergenList[0].group).toEqual('VA Allergies (2)');
            expect(allergenList[0].pickList.length).toEqual(2);
            expect(allergenList[0].pickList[0].value).toEqual('1;FileLoc1');
            expect(allergenList[0].pickList[1].value).toEqual('2;FileLoc2');
            expect(allergenList[0].pickList[0].label).toEqual('Allergy 1');
            expect(allergenList[0].pickList[1].label).toEqual('Allergy 2');
        });

    it('should remove no known allergies when flag is true', function(){
            var response = [{
                group: 'VA Allergies',
                pickList: [{
                    value: '1;FileLoc1',
                    label: 'Allergy 1'
                },
                {
                    value: '2;FileLoc2',
                    label: 'Allergy 2'
                }]
            },
            {
                group: 'National Drug File',
                pickList: [{
                    value: '3;FileLoc3',
                    label: 'NO KNOWN ALLERGIES <NO ALLERGIES>'
                },
                {
                    value: '4;FileLoc4',
                    label: 'National Allergy'
                }]
            }];

            var allergenList = WritebackUtils.parseAllergenResponse(response, true);
            expect(allergenList.length).toEqual(2);
            expect(allergenList[0].group).toEqual('VA Allergies (2)');
            expect(allergenList[1].group).toEqual('National Drug File (1)');
            expect(allergenList[0].pickList.length).toEqual(2);
            expect(allergenList[0].pickList[0].value).toEqual('1;FileLoc1');
            expect(allergenList[0].pickList[1].value).toEqual('2;FileLoc2');
            expect(allergenList[0].pickList[0].label).toEqual('Allergy 1');
            expect(allergenList[0].pickList[1].label).toEqual('Allergy 2');
            expect(allergenList[1].pickList.length).toEqual(1);
            expect(allergenList[1].pickList[0].value).toEqual('4;FileLoc4');
            expect(allergenList[1].pickList[0].label).toEqual('National Allergy');
        });
    });



    describe('Test writeback utility buildSaveAllergyModel function', function() {
        it('should build the allergy save model given signs/symptoms and observatoin data', function() {
            var symptom1 = setSignsSymptoms('1', 'CROSS-EYED', '09/17/2012', '11:02', true);
            var symptom2 = setSignsSymptoms('2', 'MONOTONESS', '08/17/2012', '12:01', false);
            var symptom3 = setSignsSymptoms('3', 'JAZZHANDS', '11/17/2012', '13:11', true);
            var saveSignsSymptomsArray = [symptom1, symptom2, symptom3];
            var signsSymptomsColl = new Backbone.Collection(saveSignsSymptomsArray);

            var model = getModel('123;TEST', 'o', 'P', '10:00', '10/17/2012', 'APPLES', 'Pharmacological', signsSymptomsColl);
            var saveAllergyModel = new Backbone.Model();
            var allergyModel = WritebackUtils.buildSaveAllergyModel(model, getUser(), getCurrentPatient(), saveAllergyModel);

            expect(allergyModel.get('observedDate')).toEqual('201210171000');
            expect(allergyModel.get('pid')).toEqual('9E7A;1234');
            expect(allergyModel.get('enteredBy')).toEqual('1234');
            expect(allergyModel.get('IEN')).toEqual('123');
            expect(allergyModel.get('allergyName')).toEqual('APPLES^123;TEST');
            expect(allergyModel.get('natureOfReaction')).toEqual('P^Pharmacological');
            expect(allergyModel.get('historicalOrObserved')).toEqual('o^OBSERVED');
            expect(allergyModel.get('symptoms').length).toEqual(2);
            expect(allergyModel.get('symptoms')[0].dateTime).toEqual('201209171102');
            expect(allergyModel.get('symptoms')[1].dateTime).toEqual('201211171311');
        });
    });


});