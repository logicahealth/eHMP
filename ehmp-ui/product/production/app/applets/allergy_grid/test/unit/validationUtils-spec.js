/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn,  afterEach */

'use strict';

define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'underscore',
    'moment',
    'testUtil',
    'app/applets/allergy_grid/writeback/validationUtils'
], function ($, Backbone, Marionette, Jasmine, _, moment, testUtil, ValidationUtils) {

    function getModel(){

        var model = new Backbone.Model();
        var signsSymptoms  = new Backbone.Collection([{
                id: '476',
                description: 'ATRIAL FIBRILLATION-FLUTTER',
                booleanValue : false
            },
            {
                booleanValue: false,
                description: 'ITCHING,WATERING EYES',
                id: '2'
            }, {
                booleanValue: false,
                description: 'ANOREXIA',
                id: '6'
            }]
        );

        model.set('signsSymptoms', signsSymptoms);

        model.errorModel = new Backbone.Model();

        return model;
    }

    describe('Test form validation for allergy writeback', function() {
        it('should validate allergy type', function() {
            var model,
                selectedSignsSymptoms;

            model = getModel();
            model.set('allergyType', 'o');
            selectedSignsSymptoms = model.get('signsSymptoms').where({ booleanValue : true });

            var error = ValidationUtils.validateAllergyType(model.get('allergyType'), selectedSignsSymptoms );
            expect(error).toBe('A symptom must be selected when allergy type is observed');
        });
        it('should validate reaction date', function() {
            var model = getModel(),
                tomorrow = moment().add(1,'days').format('MM/DD/YYYY');

            model.set('reaction-date', tomorrow);

            var error = ValidationUtils.validateReactionDate(model.get('reaction-date'));
            expect(error).toBe('Reaction date/time cannot be in the future');
         });
        it('should validate reaction time', function() {
            var model = getModel(),
                currentTime = moment().format('HH:mm'),
                nextHour = moment().add(1,'hours');

            model.set('reaction-time', currentTime);

            var error = ValidationUtils.validateReactionTime(model.get('reaction-date'), model.get('reaction-time'));
            expect(error).toBe('Reaction date is required with time');
         });
        it('should not validate reaction time if date is only YYYY or MM/YYYY', function() {
            var model = getModel(),
                currentTime = moment().format('HH:mm'),
                nextHour = moment().add(1,'hours');

            model.set('reaction-time', currentTime);

            var error = ValidationUtils.validateReactionTime('10/2060', model.get('reaction-time'));
            expect(error).toBe(undefined);
         });
        it('should validate isFutureDateTime function', function() {
            var tomorrow = moment().add(1,'days').format('MM/DD/YYYY'),
                currentTime = moment().format('HH:mm');

            var result = ValidationUtils.isFutureDateTime(tomorrow, currentTime);
            expect(result).toBe(true);
        });
        it('should validate isFutureDateTime function for fuzzy date of type MM/YYYY', function() {
            var result = ValidationUtils.isFutureDateTime('12/2060');
            expect(result).toBe(true);
        });
        it('should validate isFutureDateTime function for fuzzy date of type MM/YYYY', function() {
            var result = ValidationUtils.isFutureDateTime('2060');
            expect(result).toBe(true);
        });
        it('should validate getSelectedSignsSymptoms function', function() {
            var model;

            model = getModel();
            model.get('signsSymptoms').at(0).set('booleanValue', true);

            var result =  ValidationUtils.getSelectedSignsSymptoms(model.get('signsSymptoms'));
            expect(result.length).toBe(1);
            expect(result[0].id).toBe('476');
        });
        it('should validate validateModel function', function() {
            var model;

            model = getModel();
            model.set('allergen', 'opt2');
            model.set('allergyType','o');
            model.set('reaction-date', moment().format('MM/DD/YYYY'));
            model.get('signsSymptoms').at(0).set('booleanValue', true);

            var result = ValidationUtils.validateModel(model);
            expect(result).not.toBeDefined();
        });
    });

});