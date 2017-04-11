define([
    'moment'
], function(moment) {
    "use strict";

    var ValidationUtil = {

        validateModel: function(model){
            var errorMsg,
                selectedSignsSymptoms = this.getSelectedSignsSymptoms(model.get('signsSymptoms'));

            model.errorModel.clear();

            errorMsg = this.validateSignsSymptoms(selectedSignsSymptoms);
            if (errorMsg) model.errorModel.set({ 'signsSymptoms' : errorMsg });

            // if allergy type = observed a symptom must be selected
            errorMsg = this.validateAllergyType(model.get('allergyType'), selectedSignsSymptoms);
            if (errorMsg) model.errorModel.set({ 'signsSymptoms' : errorMsg });

            errorMsg = this.validateReactionDate(model.get('reaction-date'));
            if (errorMsg) model.errorModel.set({ 'reaction-date' : errorMsg });

            errorMsg = this.validateReactionTime(model.get('reaction-date'), model.get('reaction-time'));
            if (errorMsg) model.errorModel.set({ 'reaction-time' : errorMsg });

            if (!_.isEmpty(model.errorModel.toJSON())) {
                return 'Validation errors. Please fix.';
            }
        },
        getSelectedSignsSymptoms: function(signsSymptoms) {
            return signsSymptoms.where({ booleanValue : true });
        },
        validateSignsSymptoms: function(signsSymptoms){
            var self = this,
                errorMsg;

            _.each(signsSymptoms, function(symptom) {
                var symptomDate = symptom.get('symptom-date'),
                    symptomTime = symptom.get('symptom-time');

                if (symptomDate) {
                    if (self.isFutureDateTime(symptomDate, symptomTime)) {
                        errorMsg = 'Selected symptom date/time cannot be in the future';
                    }
                } else if (symptomTime) {
                    errorMsg = 'Selected symptom date is required with time';
                }
            });

            return errorMsg;
        },
        validateAllergyType: function(allergyType, signsSymptoms) {
            var errorMsg;

            if (allergyType === 'o' && (typeof signsSymptoms === 'undefined' || signsSymptoms.length === 0)) {
               errorMsg = 'A symptom must be selected when allergy type is observed';
            }

            return errorMsg;
        },
        isFutureDateTime: function(dateValue, timeValue) {
            var today = moment();
            var dateToCompare = dateValue;

            if(dateValue){
                var dateValueSplit = dateValue.split('/');

                if(dateValueSplit.length === 1){
                    dateToCompare = '01/01/' + dateValueSplit[0];
                } else if(dateValueSplit.length === 2){
                    dateToCompare = dateValueSplit[0] + '/01/' + dateValueSplit[1];
                }

                var dateMeasured = timeValue ? moment(dateToCompare + ' ' + timeValue, 'MM/DD/YYYY hh:mm a') : moment(dateToCompare, 'MM/DD/YYYY');

                if(dateMeasured.isAfter(today)){
                   return true;
                }
            }

            return false;
        },
        validateReactionDate: function(dateValue) {
            var errorMsg;

            if (this.isFutureDateTime(dateValue)) {
                errorMsg = 'Reaction date/time cannot be in the future';
            }

            return errorMsg;
        },
        validateReactionTime: function(dateValue, timeValue) {
            var errorMsg;

            if (dateValue) {
                if (dateValue.split('/').length > 2 && timeValue && this.isFutureDateTime(dateValue, timeValue)) {
                    errorMsg = 'Reaction date/time cannot be in the future';
                }
            } else if (timeValue) {
                errorMsg = 'Reaction date is required with time';
            }

            return errorMsg;
        }
    };

    return ValidationUtil;
});