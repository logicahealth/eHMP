/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['backbone', 'jasminejquery', 'moment', 'app/applets/problems/writeback/validationUtils'],
    function (Backbone, Jasmine, moment, ValidationUtil) {
        describe('Test on-set date form validation for problem writeback', function() {

            it('should invalidate future on-set date (MM/DD/YYYY)', function() {

                var formModel = new Backbone.Model();
                formModel.errorModel = new Backbone.Model();

                var errorModel = ValidationUtil.validateMeasuredDateAndTime(formModel, '12/1/2019' );
                expect(formModel.errorModel.get('onset-date')).toBe('Onset date must be in the past');
            });

            it('should validate past on-set date (MM/DD/YYYY)', function() {

                var formModel = new Backbone.Model();
                formModel.errorModel = new Backbone.Model();

                var errorModel = ValidationUtil.validateMeasuredDateAndTime(formModel, '12/1/2014' );
                expect(formModel.errorModel.get('onset-date')).toBe(undefined);
            });

            it('should invalidate future fuzzy on-set date (MM/YYYY)', function() {

                var formModel = new Backbone.Model();
                formModel.errorModel = new Backbone.Model();

                var errorModel = ValidationUtil.validateMeasuredDateAndTime(formModel, '12/2019' );
                expect(formModel.errorModel.get('onset-date')).toBe('Onset date must be in the past');
            });

            it('should validate past fuzzy on-set date (MM/YYYY)', function() {

                var formModel = new Backbone.Model();
                formModel.errorModel = new Backbone.Model();

                var errorModel = ValidationUtil.validateMeasuredDateAndTime(formModel, '12/2014' );
                expect(formModel.errorModel.get('onset-date')).toBe(undefined);
            });

            it('should invalidate future fuzzy on-set date (YYYY)', function() {

                var formModel = new Backbone.Model();
                formModel.errorModel = new Backbone.Model();

                var errorModel = ValidationUtil.validateMeasuredDateAndTime(formModel, '2019' );
                expect(formModel.errorModel.get('onset-date')).toBe('Onset date must be in the past');
            });

            it('should validate past fuzzy on-set date (YYYY)', function() {

                var formModel = new Backbone.Model();
                formModel.errorModel = new Backbone.Model();

                var errorModel = ValidationUtil.validateMeasuredDateAndTime(formModel, '2014' );
                expect(formModel.errorModel.get('onset-date')).toBe(undefined);
            });
        });

        describe('Test overall form validation function', function(){
            it('Should test invalid Date form entry', function(){
                var nextYearDate = moment().add(1, 'year').format('MM/DD/YYYY');
                var model = new Backbone.Model({'onset-date': nextYearDate, 'problemTerm': 'test'});
                model.errorModel = new Backbone.Model();
                expect(ValidationUtil.validateModel(model)).toEqual('Validation errors. Please fix.');
                expect(model.errorModel.get('onset-date')).toEqual('Onset date must be in the past');
            });

            it('Should test invalid problemTerm form entry', function(){
                var model = new Backbone.Model({'onset-date': moment().format('MM/DD/YYYY'), 'problemTerm': 'in', 'validateSearchTerm': true});
                model.errorModel = new Backbone.Model();
                expect(ValidationUtil.validateModel(model)).toEqual('Validation errors. Please fix.');
                expect(model.errorModel.get('problemTerm')).toEqual('Search string must contain at least 3 characters');
            });

            it('Should test valid on ignored problemTerm form entry', function(){
                var model = new Backbone.Model({'onset-date': moment().format('MM/DD/YYYY'), 'problemTerm': 'in', 'validateSearchTerm': false});
                model.errorModel = new Backbone.Model();
                ValidationUtil.validateModel(model);
                expect(model.errorModel.toJSON()).toEqual({});
            });

            it('Should test valid form entry', function(){
                var model = new Backbone.Model({'onset-date': moment().format('MM/DD/YYYY'), 'problemTerm': 'test'});
                model.errorModel = new Backbone.Model();
                ValidationUtil.validateModel(model);
                expect(model.errorModel.toJSON()).toEqual({});
            });
        });
});