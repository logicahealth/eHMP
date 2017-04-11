define([], function() {
    "use strict";

    var ValidationUtil = {
        validateHistorical: function(model, result){
            var patient = ADK.PatientRecordService.getCurrentPatient();
            var pid = patient.get("pid");
           
            var heightInput = model.get('heightInputValue');
            var weightInput = model.get('weightInputValue');

            if(!heightInput && !weightInput){
                result();
                return;
            }

            var siteCode = ADK.UserService.getUserSession().get('site');
            var vitalsRuleURL = ADK.ResourceService.buildUrl('vitals-vitalsRule');
            
            var data = { 'site': siteCode, 'pid': pid };
          
            var enteredHeight;
            var enteredWeight;
            
            if(heightInput){
                var heightUnits = heightInput.substring(heightInput.length - 2, heightInput.length);
                var height = Number(heightInput.substring(0, heightInput.length - 2));
                enteredHeight = height;
                if(heightUnits === 'cm'){
                    height = height * 2.54;
                }
                data.height = { 'value': height, 'units' : 'in', 'enteredHeight' : enteredHeight,  'enteredUnits' : heightUnits };
            }

            if(weightInput){
                var weightUnits = weightInput.substring(weightInput.length - 2, weightInput.length);
                var weight  = Number(weightInput.substring(0, weightInput.length - 2));
                enteredWeight = weight;
                if(weightUnits === 'kg'){
                    
                    weight = weight * 2.20462;
                }
                data.weight = { 'value': weight, 'units' : 'lb', 'enteredWeight': enteredWeight, 'enteredUnits' : weightUnits };
            }
            

            var temperatureInput = model.get('temperatureInputValue');
            if (temperatureInput){
                var temperatureUnits = temperatureInput.substring(temperatureInput.length - 1, temperatureInput.length);
                var temperature = Number(temperatureInput.substring(0, temperatureInput.length - 1));
                data.temperature = { 'value': temperature, 'units' : temperatureUnits };
            }
            
            var circumferencegirthInput = model.get('circumferencegirth');
            if (circumferencegirthInput){
                var circumferencegirthUnits = circumferencegirthInput.substring(circumferencegirthInput.length - 2, circumferencegirthInput.length);
                var circumferencegirth = Number(circumferencegirthInput.substring(0, circumferencegirthInput.length - 2));
                data.circumferencegirth = { 'value': circumferencegirth, 'units' : circumferencegirthUnits };
            }
            
            if (model.get('bpInputValue')) {
                data.bloodpressure = { 'value': model.get('bpInputValue') };  
            } 
            
            if (model.get('respirationInputValue')) {
                data.respiration = { 'value': Number(model.get('respirationInputValue')), 'units': '/min' };
            }
            
            if (model.get('pulseInputValue')) {
                data.pulse = { 'value': Number(model.get('pulseInputValue')), 'units': '/min' };
            }
            
            if (model.get('pain-value-po')) {
                data.pain = { 'value': Number(model.get('pain-value-po'))};
            }
            
            if (model.get('O2InputValue')) {
                data.pulseoximetry = { 'value': Number(model.get('02InputValue')), 'units': '%' };
            }
            
            
            var params = {
                url: vitalsRuleURL,
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                processData: false,
                data: JSON.stringify(data),
            };

            var cdsRequest = $.ajax(params);
         
            var heightSnowMed = '8302-2';
            var weightSnowMed = '29463-7';
            var self = this;
            cdsRequest.done(function( resp ) {
                if(resp && resp.data) {
                    var cdsResponse = resp.data;

                    var heightError = _.filter(cdsResponse.results, function (o) {
                        if (o.body.reason) {
                            return _.some(o.body.reason[0].coding, {
                                code: heightSnowMed
                            });
                        }
                    });
                    var previousHeightValue;
                    if(!_.isEmpty( heightError )){
                        previousHeightValue = _.filter(cdsResponse.results, function (o) {
                            if (o.body.code) {
                                return _.some(o.body.code.coding, {
                                    code: heightSnowMed
                                });
                            }
                        });
                    }
                    var weightError = _.filter(cdsResponse.results, function (o) {
                        if (o.body.reason) {
                            return _.some(o.body.reason[0].coding, {
                                code: weightSnowMed
                            });
                        }
                    });

                    var previousWeightValue = _.filter(cdsResponse.results, function (o) {
                            if (o.body.code) {
                                return _.some(o.body.code.coding, {
                                    code: weightSnowMed
                                });
                            }
                    });
                 
                    var showRulesMessage = false;
                    if(!_.isEmpty( previousHeightValue) || !_.isEmpty(previousWeightValue) ){
                        showRulesMessage = true;
                    }

                    var warningMessagesHTML = self.buildWarningMessage(data, heightError, previousHeightValue, weightError, previousWeightValue);

                    result(showRulesMessage, warningMessagesHTML);
                }
            });

            cdsRequest.fail(function(jqXHR, textStatus) {
                var warningMessagesHTML = '<p>Height (or Weight) difference from previous measurement could not be validated because the server is not available</p>';
                result(true, warningMessagesHTML);
            });
        },
        areAllDataFieldsEmpty: function(model, isPass){
            if(isPass || model.get('circumValue') || model.get('bpInputValue') || model.get('heightInputValue') || model.get('respirationInputValue') ||
                model.get('pulseInputValue') || model.get('weightInputValue') || model.get('O2InputValue') ||
                model.get('temperatureInputValue') || model.get('pain-value-po') || model.get('bp-radio-po') ||
                model.get('pulse-radio-po') || model.get('respiration-radio-po') || model.get('temperature-radio-po') ||
                model.get('height-radio-po') || model.get('weight-radio-po') || model.get('pain-radio-po') || model.get('cg-radio-po') ||
                model.get('po-radio-po') || model.get('pain-checkbox-po')){
                return false;
           }

            return true;
        },
        buildWarningMessage: function(data, heightError, previousHeightValue, weightError, previousWeightValue){

            var warningMessagesHTML = 'Warnings Exist: <ul>';
            if(!_.isEmpty( heightError )){
                warningMessagesHTML +=  '<li>' +  _.first(_.first(heightError).body.payload).contentString + ' </br>Just Entered: ' + data.height.enteredHeight + data.height.enteredUnits + ' in ' +
                                        moment().format('MM/DD/YYYY h:mm a');
                if(!_.isEmpty( previousHeightValue )){
                    warningMessagesHTML +=  '</br>Previous Value: ' + _.first(previousHeightValue).body.valueQuantity.value + _.first(previousHeightValue).body.valueQuantity.units + ' in ' +
                                            moment(_.first(previousHeightValue).body.issued).format('MM/DD/YYYY h:mm a');
                }
                warningMessagesHTML +=  '</li>';
            }

            if(!_.isEmpty( previousWeightValue )){
                warningMessagesHTML +=  '<li>The new weight value differs by 20% or more from previous values.</br>Just Entered: ' + data.weight.enteredWeight + data.weight.enteredUnits + ' in ' +
                                        moment().format('MM/DD/YYYY h:mm a') +
                                        '</br>Previous Value: ' + _.first(previousWeightValue).body.valueQuantity.value + _.first(previousWeightValue).body.valueQuantity.units + ' in ' +
                                        moment(_.first(previousWeightValue).body.issued).format('MM/DD/YYYY h:mm a') + '</li>';
            }

            warningMessagesHTML += '</ul> Check to ensure you have entered data for the correct patient\'s chart and in the correct units of measure. Do you want to save the new value?';

            return warningMessagesHTML;
        },
        validateModel: function(model){
            model.errorModel.clear();
            this.validateCircumferenceFields(model, model.get('circumValue'));
            this.validateBPFields(model, model.get('bpInputValue'));
            this.validateHeightFields(model, model.get('heightInputValue'));
            this.validateRespirationFields(model, model.get('respirationInputValue'));
            this.validatePulseFields(model, model.get('pulseInputValue'));
            this.validateWeightFields(model, model.get('weightInputValue'));
            this.validateSuppO2Fields(model, model.get('suppO2InputValue'));
            this.validateO2Fields(model, model.get('O2InputValue'));
            this.validateTemperatureFields(model, model.get('temperatureInputValue'));
            this.validateMeasuredDateAndTime(model, model.get('dateTakenInput'), model.get('time-taken'));
            this.validatePainFields(model, model.get('pain-value-po'));
            if (!_.isEmpty(model.errorModel.toJSON())) {
                var errorMessage = 'Validation errors. Please fix.';
                return errorMessage;
            }
        },
        validatePainFields: function(model, painValue){
            if(painValue){
                if(!ValidationUtil.validWholeNumber(painValue) || Number(painValue) < 0 || Number(painValue) > 10){
                    model.errorModel.set({'pain-value-po': 'Pain value must be a whole number between 0 and 10'});
                }
            }
        },
        validateCircumferenceFields: function(model, circumValue){
            if(circumValue){
                var units = circumValue.substring(circumValue.length - 2, circumValue.length);
                var circum = Number(circumValue.substring(0, circumValue.length - 2));

                if(!ValidationUtil.validDecimal(circum)){
                    model.errorModel.set({circumValue: 'Circumference must be a numeric value'});
                    return;
                }

                if(units === 'in'){
                    if(circum < 1 || circum > 200){
                        model.errorModel.set({circumValue: 'Circumference must be between 1 and 200 inches'});
                    }
                } else {
                    if(circum < 2.54 || circum > 508){
                        model.errorModel.set({circumValue: 'Circumference must be between 2.54 and 508 centimeters'});
                    }
                }
            }
        },
        validateBPFields: function(model, value){
            if(value){
                var bpRegExCommon = /^(\d{1,3})\/(\d{1,3})$/;
                var bpRegEx = /^(\d{1,3})\/(\d{1,3})\/(\d{1,3})$/;
                var validBpCommon = bpRegExCommon.test(value);
                var validBp = bpRegEx.test(value);
                if(!validBp && !validBpCommon)
                    model.errorModel.set({bpInputValue: 'Blood Pressure value must be a valid format: nnn/nnn or nnn/nnn/nnn'});

                var bpValues = value.split('/');
                var systolic = bpValues[0];
                var diastolic = bpValues[1];
                var intermediate = bpValues[1];
                if(bpValues.length == 3){
                    diastolic = bpValues[2];
                    if(Number(intermediate) < 0 || Number(intermediate) > 300){
                        model.errorModel.set({bpInputValue: 'Blood Pressure Intermediate value must be a number between 0 and 300'});
                    }
                }
                if(Number(systolic) < 0 || Number(systolic) > 300){
                    model.errorModel.set({bpInputValue: 'Blood Pressure Systolic value must be a number between 0 and 300'});
                }
                if(Number(diastolic) < 0 || Number(diastolic) > 300){
                    model.errorModel.set({bpInputValue: 'Blood Pressure Diastolic value must be a number between 0 and 300'});
                }

            }
        },
        validateHeightFields: function(model, value){
            if(value){
                var units = value.substring(value.length - 2, value.length);
                var numberValue = Number(value.substring(0, value.length - 2));

                if(!ValidationUtil.validDecimal(numberValue)){
                    model.errorModel.set({heightInputValue: 'Height must be a numeric value'});
                    return;
                }

                if(units === 'in'){
                    if(numberValue < 10 || numberValue > 100){
                        model.errorModel.set({heightInputValue: 'Height must be between 10 and 100 inches'});
                    }
                } else {
                    if(numberValue < 25.4 || numberValue > 254){
                        model.errorModel.set({heightInputValue: 'Height must be between 25.4 and 254 centimeters'});
                    }
                }
            }
        },
        validateRespirationFields: function(model, value){
            if(value){
                if(!ValidationUtil.validWholeNumber(value)){
                    model.errorModel.set({respirationInputValue: 'Respiration must be a whole numeric value'});
                    return;
                }
                var numberValue = Number(value);
                if(numberValue < 0 || numberValue > 100){
                    model.errorModel.set({respirationInputValue: 'Respiration must be between 0 and 100 /min'});
                }
            }
        },
        validatePulseFields: function(model, value){
            if(value){
                if(!ValidationUtil.validDecimal(value)){
                    model.errorModel.set({pulseInputValue: 'Beats must be a numeric value'});
                    return;
                }

                var numberValue = Number(value);
                if(numberValue < 0 || numberValue > 300){
                    model.errorModel.set({pulseInputValue: 'Beats must be between 0 and 300 /min'});
                }
            }
        },
        validateWeightFields: function(model, value){
            if(value){

                var units = value.substring(value.length - 2, value.length);
                var numberValue = Number(value.substring(0, value.length - 2));

                if(!ValidationUtil.validDecimal(numberValue)){
                    model.errorModel.set({weightInputValue: 'Weight must be a numeric value'});
                    return;
                }

                if(units === 'lb'){
                    if(numberValue < 0 || numberValue > 1500){
                        model.errorModel.set({weightInputValue: 'Weight must be between 0 and 1500 pounds'});
                    }
                } else {
                    if(numberValue < 0 || numberValue > 680.39){
                        model.errorModel.set({weightInputValue: 'Weight must be between 0 and 680.39 kilograms'});
                    }
                }
            }
        },
        validateSuppO2Fields: function(model, value){
            if(value){
                if(!ValidationUtil.validDecimal(value)){
                    model.errorModel.set({suppO2InputValue: 'Flow Rate must be a numeric value'});
                    return;
                }

                var numberValue = Number(value);
                if(numberValue < 0.5 || numberValue > 20){
                    model.errorModel.set({suppO2InputValue: 'Flow Rate must be between 0.5 and 20 (liters/minute)'});
                }
            }
        },
        validateO2Fields: function(model, value){
            if(value){
                if(!ValidationUtil.validWholeNumber(value)){
                    model.errorModel.set({O2InputValue: 'O2 Concentration must be a whole numeric value'});
                    return;
                }

                var numberValue = Number(value);
                if(numberValue < 21 || numberValue > 100){
                    model.errorModel.set({O2InputValue: 'O2 Concentration must be between 21 and 100'});
                }
            }
        },
        validateTemperatureFields: function(model, value){
            if(value){
                var units = value.substring(value.length - 1, value.length);
                var numberValue = Number(value.substring(0, value.length - 1));

                if(!ValidationUtil.validDecimal(numberValue)){
                    model.errorModel.set({temperatureInputValue: 'Temperature must be a numeric value'});
                    return;
                }

                if(units === 'F'){
                    if(numberValue < 45 || numberValue > 120){
                        model.errorModel.set({temperatureInputValue: 'Temperature must be between 45 and 120 degrees F'});
                    }
                } else {
                    if(numberValue < 7.2 || numberValue > 48.9){
                        model.errorModel.set({temperatureInputValue: 'Temperature must be between 7.2 and 48.9 degrees C'});
                    }
                }
            }
        },
        validateMeasuredDateAndTime: function(model, dateValue, timeValue){
            if(dateValue){
                var today = moment();

                if(timeValue){
                    var measured = moment(dateValue + ' ' + timeValue, 'MM/DD/YYYY hh:mm a');

                    if(measured.isAfter(today)){
                        if(measured.isSame(today, 'day')){
                            model.errorModel.set({'time-taken': 'Measured Date/Time must be in the past.'});
                        }else {
                            model.errorModel.set({'dateTakenInput': 'Measured Date/Time must be in the past.'});
                        }
                    }
                } else {
                    var dateMeasured = moment(dateValue, 'MM/DD/YYYY');

                    if(dateMeasured.isAfter(today)){
                        model.errorModel.set({'dateTakenInput': 'Measured Date/Time must be in the past.'});
                    }
                }
            }
        },
        validDecimal: function(value){
            var decimalRegEx = /^[+-]?\.?[0-9]{1,9}(?:\.[0-9]{1,10})?$/;
            return decimalRegEx.test(value);

        },
        validWholeNumber: function(value){
            if(/^-?\d+$/.test(value)){
                var n = Number(value);
                return !isNaN(n) && n % 1 === 0;
            }

            return false;
        }
    };

    return ValidationUtil;
});