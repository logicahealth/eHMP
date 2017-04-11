define([], function(){
    "use strict";

    return {
        validateModel: function(model){
            model.errorModel.clear();
            this.validateAdministeringProvider(model, model.get('administeredBy'), model.get('administeredHistorical'));
            this.validateDose(model, model.get('dosage'));

            if(model.get('administeredHistorical') === 'historical'){
                model.unset('visDateOffered');
                this.validateAdminDate(model, model.get('administrationDateHistorical'));
            } else {
                model.unset('administrationDateHistorical');
                this.validateVisDate(model, model.get('visDateOffered'));
            }

            if (!_.isEmpty(model.errorModel.toJSON())) {
                var errorMessage = 'Validation errors. Please fix.';
                return errorMessage;
            }
        },
        validateAdministeringProvider: function(model, administeringProvider, immunizationOption){
            if(immunizationOption === 'administered' && administeringProvider){
                if (administeringProvider.indexOf(';') === -1){
                    model.errorModel.set({administeredBy: 'Choose a valid provider'});
                }
            }
        },
        validateDose: function(model, doseValue){
            if(doseValue){
                var trimmedDoseValue = doseValue.trim();
                var num = Number(trimmedDoseValue);

                var decimalRegEx = /^-?[0-9]\d*(\.\d+)?$/;
                if(!decimalRegEx.test(num) || isNaN(num) || num <= 0){
                    model.errorModel.set({dosage: 'Must be a number greater than 0'});
                }
            }
        },
        validateAdminDate: function(model, adminDateValue) {
            var today = moment();
            var dateToCompare = adminDateValue;

            if(adminDateValue){
                var dateValueSplit = adminDateValue.split('/');

                if(dateValueSplit.length === 1){
                    dateToCompare = '01/01/' + dateValueSplit[0];
                } else if(dateValueSplit.length === 2){
                    dateToCompare = dateValueSplit[0] + '/01/' + dateValueSplit[1];
                }

                var dateMeasured = moment(dateToCompare, 'MM/DD/YYYY');
                if(dateMeasured.isAfter(today)){
                   model.errorModel.set({administrationDateHistorical: 'Administration Date must be in the past.'});
                }
            }
        },
        validateVisDate: function(model, visDateOffered){
            var today = moment();

            if(visDateOffered && moment(visDateOffered, 'MM/DD/YYYY').isAfter(moment())){
                model.errorModel.set({visDateOffered: 'VIS Date Offered must be in the past.'});
            }
        }
    };
});