define([
	'backbone',
	'jquery',
	'jasminejquery',
	'test/stubs',
	'app/applets/vitals/writeback/validationUtils'
], function(Backbone, $, jasminejquery, Stubs, ValidationUtils) {
	'use strict';

	function getModel() {
		var model = new Backbone.Model();
		model.errorModel = new Backbone.Model();
		return model;
	}

	describe('Test vitals validationUtils function - validWholeNumber', function() {
		it('Should pass on valid whole numbers', function() {
			expect(ValidationUtils.validWholeNumber(1)).toEqual(true);
			expect(ValidationUtils.validWholeNumber(-1)).toEqual(true);
			expect(ValidationUtils.validWholeNumber('445')).toEqual(true);
		});

		it('Should fail on invalid whole numbers', function() {
			expect(ValidationUtils.validWholeNumber('xyz')).toEqual(false);
			expect(ValidationUtils.validWholeNumber(22.33)).toEqual(false);
			expect(ValidationUtils.validWholeNumber(null)).toEqual(false);
			expect(ValidationUtils.validWholeNumber(undefined)).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validDecimal', function() {
		it('Should pass on valid decimals', function() {
			expect(ValidationUtils.validDecimal(1.23)).toEqual(true);
			expect(ValidationUtils.validDecimal(-2.34)).toEqual(true);
			expect(ValidationUtils.validDecimal(-200)).toEqual(true);
			expect(ValidationUtils.validDecimal('23.33')).toEqual(true);
		});

		it('Should fail on invalid decimals', function() {
			expect(ValidationUtils.validDecimal(undefined)).toEqual(false);
			expect(ValidationUtils.validDecimal(null)).toEqual(false);
			expect(ValidationUtils.validDecimal('xyz')).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validateMeasuredDateAndTime', function() {
		it('Should update error model if no date is passed in', function() {
			var model = getModel();
			ValidationUtils.validateMeasuredDateAndTime(model);
			expect(model.errorModel.get('dateTakenInput')).toEqual('Enter a date');
		});

		it('Should not update error model for past date', function() {
			var model = getModel();
			ValidationUtils.validateMeasuredDateAndTime(model, '10/23/2015');
			expect(model.errorModel.has('dateTakenInput')).toEqual(false);
		});

		it('Should not update error model for past date/time', function() {
			var model = getModel();
			ValidationUtils.validateMeasuredDateAndTime(model, '07/20/2013', '23:01');
			expect(model.errorModel.has('dateTakenInput')).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validateTemperatureFields', function() {
		it('Should not update error model if value is undefined', function() {
			var model = getModel();
			ValidationUtils.validateTemperatureFields(model);
			expect(model.errorModel.has('temperatureInputValue')).toEqual(false);
		});

		it('Should update error model if value is not numeric', function() {
			var model = getModel();
			ValidationUtils.validateTemperatureFields(model, 'abc');
			expect(model.errorModel.get('temperatureInputValue')).toEqual('Temperature must be a numeric value');
		});

		it('Should update error model for Fahrenheit temperature not in the correct range', function() {
			var model = getModel();
			ValidationUtils.validateTemperatureFields(model, '140F');
			expect(model.errorModel.get('temperatureInputValue')).toEqual('Temperature must be between 45 and 120 degrees F');
		});

		it('Should update error model for Celsius temperature not in the correct range', function() {
			var model = getModel();
			ValidationUtils.validateTemperatureFields(model, '1C');
			expect(model.errorModel.get('temperatureInputValue')).toEqual('Temperature must be between 7.2 and 48.9 degrees C');
		});

		it('Should not update error model for valid temperature', function() {
			var model = getModel();
			ValidationUtils.validateTemperatureFields(model, '98.6F');
			expect(model.errorModel.has('temperatureInputValue')).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validateO2Fields', function() {
		it('Should not update error model if value is undefined', function() {
			var model = getModel();
			ValidationUtils.validateO2Fields(model);
			expect(model.errorModel.has('O2InputValue')).toEqual(false);
		});

		it('Should update error model if value is not a whole number', function() {
			var model = getModel();
			ValidationUtils.validateO2Fields(model, 'xyz');
			expect(model.errorModel.get('O2InputValue')).toEqual('O2 concentration must be a whole numeric value');
		});

		it('Should update error model if value is not in the required range', function() {
			var model = getModel();
			ValidationUtils.validateO2Fields(model, '190');
			expect(model.errorModel.get('O2InputValue')).toEqual('O2 concentration must be between 21 and 100');
		});

		it('Should not update error model if value is within range', function() {
			var model = getModel();
			ValidationUtils.validateO2Fields(model, '45');
			expect(model.errorModel.has('O2InputValue')).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validateSuppO2Fields', function() {
		it('Should not update error model if value is undefined', function() {
			var model = getModel();
			ValidationUtils.validateSuppO2Fields(model);
			expect(model.errorModel.has('suppO2InputValue')).toEqual(false);
		});

		it('Should update error model if value is not a decimal number', function() {
			var model = getModel();
			ValidationUtils.validateSuppO2Fields(model, 'xyz');
			expect(model.errorModel.get('suppO2InputValue')).toEqual('Flow Rate must be a numeric value');
		});

		it('Should update error model if value is not in the required range', function() {
			var model = getModel();
			ValidationUtils.validateSuppO2Fields(model, '.1');
			expect(model.errorModel.get('suppO2InputValue')).toEqual('Flow Rate must be between 0.5 and 20 (liters/minute)');
		});

		it('Should not update error model if value is within range', function() {
			var model = getModel();
			ValidationUtils.validateSuppO2Fields(model, '15.0');
			expect(model.errorModel.has('suppO2InputValue')).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validateWeightFields', function() {
		it('Should not update error model if value is undefined', function() {
			var model = getModel();
			ValidationUtils.validateWeightFields(model);
			expect(model.errorModel.has('weightInputValue')).toEqual(false);
		});

		it('Should update error model if value is not a decimal number', function() {
			var model = getModel();
			ValidationUtils.validateWeightFields(model, '23.00.9837kg');
			expect(model.errorModel.get('weightInputValue')).toEqual('Weight must be a numeric value');
		});

		it('Should update error model if pounds are not in range', function() {
			var model = getModel();
			ValidationUtils.validateWeightFields(model, '2000lb');
			expect(model.errorModel.get('weightInputValue')).toEqual('Weight must be between 0 and 1500 pounds');
		});

		it('Should update error model if kilograms are not in range', function() {
			var model = getModel();
			ValidationUtils.validateWeightFields(model, '700kg');
			expect(model.errorModel.get('weightInputValue')).toEqual('Weight must be between 0 and 680.39 kilograms');
		});

		it('Should not update error model if value is valid', function() {
			var model = getModel();
			ValidationUtils.validateWeightFields(model, '120lb');
			expect(model.errorModel.has('weightInputValue')).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validatePulseFields', function() {
		it('Should not update error model if value is undefined', function() {
			var model = getModel();
			ValidationUtils.validatePulseFields(model);
			expect(model.errorModel.has('pulseInputValue')).toEqual(false);
		});

		it('Should update error model if value is not valid whole number', function() {
			var model = getModel();
			ValidationUtils.validatePulseFields(model, '23.33');
			expect(model.errorModel.get('pulseInputValue')).toEqual('Beats must be a whole numeric value');
		});

		it('Should update error model if value is not in range', function() {
			var model = getModel();
			ValidationUtils.validatePulseFields(model, '2200');
			expect(model.errorModel.get('pulseInputValue')).toEqual('Beats must be between 0 and 300 /min');
		});
	});

	describe('Test vitals validationUtils function - validateRespirationFields', function() {
		it('Should not update error model if value is undefined', function() {
			var model = getModel();
			ValidationUtils.validateRespirationFields(model);
			expect(model.errorModel.has('respirationInputValue')).toEqual(false);
		});

		it('Should update error model if value is not valid whole number', function() {
			var model = getModel();
			ValidationUtils.validateRespirationFields(model, 'xyz');
			expect(model.errorModel.get('respirationInputValue')).toEqual('Respiration must be a whole numeric value');
		});

		it('Should update error model if value is not in range', function() {
			var model = getModel();
			ValidationUtils.validateRespirationFields(model, '300');
			expect(model.errorModel.get('respirationInputValue')).toEqual('Respiration must be between 0 and 100 /min');
		});

		it('Should not update error model if value is valid', function() {
			var model = getModel();
			ValidationUtils.validateRespirationFields(model, '100');
			expect(model.errorModel.has('respirationInputValue')).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validateHeightFields', function() {
		it('Should not update error model if value is undefined', function() {
			var model = getModel();
			ValidationUtils.validateHeightFields(model);
			expect(model.errorModel.has('heightInputValue')).toEqual(false);
		});

		it('Should update error model if value is not a valid decimal', function() {
			var model = getModel();
			ValidationUtils.validateHeightFields(model, 'xyz');
			expect(model.errorModel.get('heightInputValue')).toEqual('Height must be a numeric value');
		});

		it('Should update error model if inches value is not in range', function() {
			var model = getModel();
			ValidationUtils.validateHeightFields(model, '140in');
			expect(model.errorModel.get('heightInputValue')).toEqual('Height must be between 10 and 100 inches');
		});

		it('Should update error model if centimeters value is not in range', function() {
			var model = getModel();
			ValidationUtils.validateHeightFields(model, '12');
			expect(model.errorModel.get('heightInputValue')).toEqual('Height must be between 25.4 and 254 centimeters');
		});

		it('Should not update error model if value is valid', function() {
			var model = getModel();
			ValidationUtils.validateHeightFields(model, '80in');
			expect(model.errorModel.has('heightInputValue')).toEqual(false);
		});
	});

	describe('Test vitals validtionUtils function - validateBPFields', function() {
		it('Should not update error model if value is undefined', function() {
			var model = getModel();
			ValidationUtils.validateBPFields(model);
			expect(model.errorModel.has('bpInputValue')).toEqual(false);
		});

		it('Should update error model if value is not formatted correctly', function() {
			var model = getModel();
			ValidationUtils.validateBPFields(model, 'xyz/123');
			expect(model.errorModel.get('bpInputValue')).toEqual('Blood Pressure value must be a valid format: nnn/nnn or nnn/nnn/nnn');
		});

		it('Should update error model if intermediate value is not in range', function() {
			var model = getModel();
			ValidationUtils.validateBPFields(model, '120/400/200');
			expect(model.errorModel.get('bpInputValue')).toEqual('Blood pressure intermediate value must be a number between 0 and 300');
		});

		it('Should update error model if systolic value is not in range', function() {
			var model = getModel();
			ValidationUtils.validateBPFields(model, '-1/200');
			expect(model.errorModel.get('bpInputValue')).toEqual('Blood pressure systolic value must be a number between 0 and 300');
		});

		it('Should update error model if diastolic value is not in range', function() {
			var model = getModel();
			ValidationUtils.validateBPFields(model, '120/500');
			expect(model.errorModel.get('bpInputValue')).toEqual('Blood pressure diastolic value must be a number between 0 and 300');
		});

		it('Should not update error model if valid BP value', function() {
			var model = getModel();
			ValidationUtils.validateBPFields(model, '120/80');
			expect(model.errorModel.has('bpInputValue')).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validateCircumferenceFields', function() {
		it('Should not update error model if value is undefined', function() {
			var model = getModel();
			ValidationUtils.validateCircumferenceFields(model);
			expect(model.errorModel.has('circumValue')).toEqual(false);
		});

		it('Should update error model if not a valid decimal', function() {
			var model = getModel();
			ValidationUtils.validateCircumferenceFields(model, 'xyz');
			expect(model.errorModel.get('circumValue')).toEqual('Circumference must be a numeric value');
		});

		it('Should update error model if inches value not in range', function() {
			var model = getModel();
			ValidationUtils.validateCircumferenceFields(model, '0in');
			expect(model.errorModel.get('circumValue')).toEqual('Circumference must be between 1 and 200 inches');
		});

		it('Should update error model if centimeters value not in range', function() {
			var model = getModel();
			ValidationUtils.validateCircumferenceFields(model, '700cm');
			expect(model.errorModel.get('circumValue')).toEqual('Circumference must be between 2.54 and 508 centimeters');
		});

		it('Should not update error model if valid value', function() {
			var model = getModel();
			ValidationUtils.validateCircumferenceFields(model, '36in');
			expect(model.errorModel.has('circumValue')).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validatePainFields', function() {
		it('Should not update error model if value is undefined', function() {
			var model = getModel();
			ValidationUtils.validatePainFields(model);
			expect(model.errorModel.has('pain-value-po')).toEqual(false);
		});

		it('Should update error model if pain value is not a whole number', function() {
			var model = getModel();
			ValidationUtils.validatePainFields(model, 'xyz');
			expect(model.errorModel.get('pain-value-po')).toEqual('Pain value must be a whole number between 0 and 10');
		});

		it('Should update error model if pain value is not in range', function() {
			var model = getModel();
			ValidationUtils.validatePainFields(model, '11');
			expect(model.errorModel.get('pain-value-po')).toEqual('Pain value must be a whole number between 0 and 10');
		});

		it('Should not update error model if pain value is valid', function() {
			var model = getModel();
			ValidationUtils.validatePainFields(model, '4');
			expect(model.errorModel.has('pain-value-po')).toEqual(false);
		});
	});

	describe('Test vitals validationUtils function - validateModel', function() {
		it('Validate model with all required fields', function() {
			var model = getModel();
			model.set('dateTakenInput', '10/10/2010');
			ValidationUtils.validateModel(model);
			expect(model.errorModel.toJSON()).toEqual({});
		});

		it('Validate model with missing required fields', function() {
			var model = getModel();
			expect(ValidationUtils.validateModel(model)).toEqual('Validation errors. Please fix.');
		});
	});

	describe('Test vitals validationUtils function - kgToPounds', function() {
		it('Should convert kg to lbs correctly', function() {
			expect(ValidationUtils.kgToPounds(10)).toEqual(22.0462);
		});
	});

	describe('Test vitals validationUtils function - poundsToKg', function() {
		it('Should convert lbs to kg correctly', function() {
			expect(ValidationUtils.poundsToKg(10)).toEqual(4.53592);
		});
	});

	describe('Test vitals validationUtils function - inchToCm', function() {
		it('Should convert inches to cm correctly', function() {
			expect(ValidationUtils.inchToCm(10)).toEqual(25.4);
		});
	});

	describe('Test vitals validationUtils function - cmToInch', function() {
		it('Should convert cm to inches correctly', function() {
			expect(ValidationUtils.cmToInch(10)).toEqual(3.9370100000000003);
		});
	});

	describe('Test vitals validationUtils function - buildWarningMessage', function() {
		it('Should output correct warning message', function() {
			var data = {
				height: {
					enteredHeight: 80,
					enteredUnits: 'in'
				},
				weight: {
					enteredWeight: 300,
					enteredUnits: 'lb'
				}
			};

			var heightError = [{
				body: {
					payload: [{
						contentString: 'This is some error for height'
					}]
				}
			}];

			var previousHeightObj = [{
				body: {
					valueQuantity: {
						units: 'in',
						value: 60
					},
					issued: '201410200456'
				}
			}];

			var previousWeightObj = [{
				body: {
					valueQuantity: {
						units: 'lb',
						value: 150
					},
					issued: '201410200456'
				}
			}];

			// Test substrings of the message since the function uses moment to get today's date
			var htmlMessage = ValidationUtils.buildWarningMessage(data, heightError, previousHeightObj, 'Weight error', previousWeightObj);
			expect(htmlMessage.indexOf('Warnings Exist: <ul><li>This is some error for height </br>Just Entered: 80.00in in')).not.toBeLessThan(0);
			expect(htmlMessage.indexOf('</br>Previous Value: 60.00in in 10/20/2014 12:00 am</li><li>The new weight value differs by 20% or more from previous values.</br>Just Entered: 300.00lb in')).not.toBeLessThan(0);
			expect(htmlMessage.indexOf('</br>Previous Value: 150.00lb in 10/20/2014 12:00 am</li></ul> Check to ensure you have entered data for the correct patient\'s chart and in the correct units of measure. Do you want to save the new value?')).not.toBeLessThan(0);
		});
	});

	describe('Test vitals validationUtils function - areAllDataFieldsEmpty', function() {
		it('Should return false if pass is selected', function() {
			expect(ValidationUtils.areAllDataFieldsEmpty(getModel(), true)).toEqual(false);
		});

		it('Should return false if some value is empty in the model', function() {
			var model = getModel();
			model.set('circumValue', '32in');
			expect(ValidationUtils.areAllDataFieldsEmpty(model, false)).toEqual(false);
		});

		it('Should return true if all fields are empty', function() {
			expect(ValidationUtils.areAllDataFieldsEmpty(getModel(), false)).toEqual(true);
		});
	});

	describe('Test vitals validationUtils function - validateHistorical', function() {
		it('Should skip validation if height and weight are empty', function() {
			var result = function(error) {
				expect(error).toEqual(undefined);
			};

			ValidationUtils.validateHistorical(new Backbone.Model(), result);
		});

		it('Should show failure message if request fails', function() {
			var result = function(error, errorMessage) {
				expect(error).toEqual(true);
				expect(errorMessage).toEqual('<p>Height (or Weight) difference from previous measurement could not be validated because the server is not available</p>');
			};

			var model = new Backbone.Model({
				heightInputValue: '60in',
				weightInputValue: '150lb'
			});

			spyOn($, 'ajax').and.callFake(function() {
				var d = $.Deferred();
				d.reject('Request failed');
				return d.promise();
			});

			ValidationUtils.validateHistorical(model, result);
		});

		it('Should show error on CDS height validation failure response', function() {
			var result = function(error, errorMessage) {
				expect(error).toEqual(true);
				expect(errorMessage.indexOf('Warnings Exist')).not.toBeLessThan(0);
				expect(errorMessage.indexOf('This is some error for height')).not.toBeLessThan(0);
			};

			var model = new Backbone.Model({
				heightInputValue: '60in',
				weightInputValue: '300lb'
			});

			spyOn($, 'ajax').and.callFake(function() {
				var d = $.Deferred();
				d.resolve({
					data: {
						results: [{
							body: {
								reason: [{
									coding: [{
										code: '8302-2'
									}]
								}],
								code: {
									coding: [{
										code: '8302-2'
									}]
								},
								valueQuantity: {
									units: 'in',
									value: 60
								},
								issued: '201410200456',
								payload: [{
									contentString: 'This is some error for height'
								}]
							}
						}]
					}
				});
				return d.promise();
			});

			ValidationUtils.validateHistorical(model, result);
		});

		it('Should show error on CDS weight validation failure response', function() {
			var result = function(error, errorMessage) {
				expect(error).toEqual(true);
				expect(errorMessage.indexOf('Warnings Exist')).not.toBeLessThan(0);
				expect(errorMessage.indexOf('The new weight value differs by 20% or more from previous values.')).not.toBeLessThan(0);
			};

			var model = new Backbone.Model({
				heightInputValue: '60in',
				weightInputValue: '300lb'
			});

			spyOn($, 'ajax').and.callFake(function() {
				var d = $.Deferred();
				d.resolve({
					data: {
						results: [{
							body: {
								reason: [{
									coding: [{
										code: '29463-7'
									}]
								}],
								code: {
									coding: [{
										code: '29463-7'
									}]
								},
								valueQuantity: {
									units: 'lb',
									value: 150
								},
								issued: '201410200456',
								payload: [{
									contentString: 'This is some error for weight'
								}]
							}
						}]
					}
				});
				return d.promise();
			});

			ValidationUtils.validateHistorical(model, result);
		});

		it('Should not show error on CDS validation response', function() {
			var result = function(error, errorMessage) {
				expect(error).toEqual(undefined);
			};

			var model = new Backbone.Model({
				heightInputValue: '60in',
				weightInputValue: '300lb'
			});

			spyOn($, 'ajax').and.callFake(function() {
				var d = $.Deferred();
				d.resolve({
					data: {
						results: [{
							body: {
								reason: [{
									coding: [{
										code: 'xyz-123'
									}]
								}],
								code: {
									coding: [{
										code: 'xyz-123'
									}]
								}
							}
						}]
					}
				});
				return d.promise();
			});

			ValidationUtils.validateHistorical(model, result);
		});
	});
});