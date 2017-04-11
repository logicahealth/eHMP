/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['backbone', 'jasminejquery', 'moment', 'app/applets/immunizations/writeback/utils/validationUtil'],
    function (Backbone, Jasmine, moment, ValidationUtil) {
        var FormModel = Backbone.Model.extend({
            defaults: {
                errorModel: new Backbone.Model()
            },
            validate: function(attributes, options){
                return ValidationUtil.validateModel(this);
            }
        });

        function getFormModelInstance(properties){
            var formModel = new FormModel(properties);
            formModel.errorModel = formModel.get('errorModel');
            formModel.clear = function(){
                this.get('errorModel').clear();
            };
            formModel.clear();
            return formModel;
        }

        describe('Top level validation function to validate backbone model', function(){
            it('should fail validation if administering provider is not valid', function(){
                var model = getFormModelInstance({administeredBy: 'PROVIDER', administeredHistorical: 'administered'});
                var errorMessage = ValidationUtil.validateModel(model);
                expect(errorMessage).toEqual('Validation errors. Please fix.');
                expect(model.get('errorModel').get('administeredBy')).toEqual('Choose a valid provider');
            });

            it('should fail validation if dose is not valid', function(){
                var model = getFormModelInstance({dosage: 'xyzmL'});
                var errorMessage = ValidationUtil.validateModel(model);
                expect(errorMessage).toEqual('Validation errors. Please fix.');
                expect(model.get('errorModel').get('dosage')).toEqual('Must be a number greater than 0');
            });
            it('should fail validation if administration date is in the future', function(){
                var date = moment().add(1, 'days').format('MM/DD/YYYY');
                var model = getFormModelInstance({administrationDateHistorical: date, administeredHistorical: 'historical'});
                var errorMessage = ValidationUtil.validateModel(model);
                expect(errorMessage).toEqual('Validation errors. Please fix.');
                expect(model.get('errorModel').get('administrationDateHistorical')).toEqual('Administration Date must be in the past.');
            });
            it('should fail validation if vis date offered is in the future', function(){
                var date = moment().add(1, 'days').format('MM/DD/YYYY');
                var model = getFormModelInstance({visDateOffered: date, administeredHistorical: 'administered'});
                var errorMessage = ValidationUtil.validateModel(model);
                expect(errorMessage).toEqual('Validation errors. Please fix.');
                expect(model.get('errorModel').get('visDateOffered')).toEqual('VIS Date Offered must be in the past.');
            });
        });

        describe('Validation for administering provider', function(){
            it('Should pass if historical immunization', function(){
                var model = getFormModelInstance({immunizationOption: 'historical'});
                ValidationUtil.validateAdministeringProvider(model, '', 'historical');
                expect(model.get('errorModel').get('administeredBy')).toEqual(undefined);
            });

            it('Should fail if administered provider is not valid', function(){
                var model = getFormModelInstance({immunizationOption: 'administered', administeringProvider: 'PROVIDER'});
                ValidationUtil.validateAdministeringProvider(model, 'PROVIDER', 'administered');
                expect(model.get('errorModel').get('administeredBy')).toEqual('Choose a valid provider');
            });

            it('Should pass if administered provider is valid', function(){
                var model = getFormModelInstance({immunizationOption: 'administered', administeringProvider: '13;PROVIDER,NAME'});
                ValidationUtil.validateAdministeringProvider(model, '13;PROVIDER,NAME', 'administered');
                expect(model.get('errorModel').get('administeredBy')).toEqual(undefined);
            });
        });

        describe('Validation for dosage', function(){
            it('Should pass if dosage is unspecified', function(){
                var model = getFormModelInstance();
                ValidationUtil.validateDose(model, '');
                expect(model.get('errorModel').get('dosage')).toEqual(undefined);
            });

            it('Should pass if dosage is a valid number', function(){
                var model = getFormModelInstance({dose: '8'});
                ValidationUtil.validateDose(model, '8');
                expect(model.get('errorModel').get('dosage')).toEqual(undefined);
            });

            it('Should fail if dosage is not valid number', function(){
                var model = getFormModelInstance({dose: '8xymL'});
                ValidationUtil.validateDose(model, '8xymL');
                expect(model.get('errorModel').get('dosage')).toEqual('Must be a number greater than 0');
            });

            it('Should fail if dosage is 0', function(){
                var model = getFormModelInstance({dose: '0'});
                ValidationUtil.validateDose(model, '0');
                expect(model.get('errorModel').get('dosage')).toEqual('Must be a number greater than 0');
            });

            it('Should fail if dosage is negative', function(){
                var model = getFormModelInstance({dose: '-35'});
                ValidationUtil.validateDose(model, '-35');
                expect(model.get('errorModel').get('dosage')).toEqual('Must be a number greater than 0');
            });
        });

        describe('Validation for administration date', function(){
            it('Should pass if past or present date', function(){
                var model = getFormModelInstance({administrationDateHistorical: '10/18/2015'});
                ValidationUtil.validateAdminDate(model, '10/18/2015');
                expect(model.get('errorModel').get('administrationDateHistorical')).toEqual(undefined);
            });

            it('Should fail if future date - full date', function(){
                var date = moment().add(7, 'days').format('MM/DD/YYYY');
                var model = getFormModelInstance({administrationDateHistorical: date});
                ValidationUtil.validateAdminDate(model, date);
                expect(model.get('errorModel').get('administrationDateHistorical')).toEqual('Administration Date must be in the past.');
            });

            it('Should fail if future date - fuzzy year', function(){
                var date = moment().add(1, 'years').format('YYYY');
                var model = getFormModelInstance({administrationDateHistorical: date});
                ValidationUtil.validateAdminDate(model, date);
                expect(model.get('errorModel').get('administrationDateHistorical')).toEqual('Administration Date must be in the past.');
            });

            it('Should fail if future date - fuzzy month/year', function(){
                var date = moment().add(1, 'months').format('MM/YYYY');
                var model = getFormModelInstance({administrationDateHistorical: date});
                ValidationUtil.validateAdminDate(model, date);
                expect(model.get('errorModel').get('administrationDateHistorical')).toEqual('Administration Date must be in the past.');
            });
        });

        describe('Validation for VIS Date Offered', function(){
            it('Should pass if past or presentDate', function(){
                var model = getFormModelInstance({visDateOffered: '04/03/2016'});
                ValidationUtil.validateVisDate(model, '04/03/2016');
                expect(model.get('errorModel').get('visDateOffered')).toEqual(undefined);
            });

            it('Should fail if future date', function(){
                var date = moment().add(7, 'days').format('MM/DD/YYYY');
                var model = getFormModelInstance({visDateOffered: date});
                ValidationUtil.validateVisDate(model, date);
                expect(model.get('errorModel').get('visDateOffered')).toEqual('VIS Date Offered must be in the past.');
            });
        });
    });