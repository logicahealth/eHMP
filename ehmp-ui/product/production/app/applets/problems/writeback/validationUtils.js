define([
    'moment'
], function(moment) {
    "use strict";
    var ValidationUtil = {
        validateModel: function(model){
            model.errorModel.clear();
            this.validateMeasuredDateAndTime(model, model.get('onset-date'));

            if (!_.isEmpty(model.errorModel.toJSON())) {
                var errorMessage = 'Validation errors. Please fix.';
                return errorMessage;
            }
        },
        validateMeasuredDateAndTime: function(model, dateValue){
            if(dateValue){
                var today = moment();

                var dateMeasured = moment(dateValue, 'MM/DD/YYYY');

                if(dateValue.length === 4){
                    dateMeasured = moment(dateValue, 'YYYY');
                }else if(dateValue.length === 7){
                    dateMeasured = moment(dateValue, 'MM/YYYY');
                }

                if(dateMeasured.isAfter(today)){
                    model.errorModel.set({'onset-date': 'Onset date must be in the past'});
                }
            }
        }
    };
    return ValidationUtil;
});