define([
    "underscore",
    "backbone",
    "app/applets/activeMeds/appUtil",
    "moment",
    "hbs!app/applets/activeMeds/templates/tooltip"
], function(_, Backbone, util, moment, tooltip) {
    "use strict";

    var DATE_FORMAT = 'YYYYMMDDHHmmSSsss';
    var DATE_LENGTH = DATE_FORMAT.length;
    var ZERO_FILL = DATE_FORMAT.replace(/./g, '0');

    var collectionHandler = {
        initialized: false,
        fetchMedsCollection: function(partialFetchOptions, viewType) {

            var filterOptions, calculatedFilter;
            var patientType = ADK.PatientRecordService.getCurrentPatient().patientStatusClass();
            if (patientType.toUpperCase() === 'INPATIENT') {
                filterOptions = 'and(ne(vaStatus,"CANCELLED"),or(eq(vaType, "I"),eq(vaType, "IV"),eq(vaType,"V")))';
                calculatedFilter = 'or(eq(recent,true),eq(calculatedStatus,"Expires"),eq(calculatedStatus,"Start"))';
            } else if (patientType.toUpperCase() === 'OUTPATIENT') {
                filterOptions = 'and(ne(vaStatus,"CANCELLED"),or(eq(vaType, "O"),eq(vaType, "N")))';
                calculatedFilter = 'or(eq(recent,true),eq(calculatedStatus,"Expires"),eq(calculatedStatus,"Start"))';
            }

            var fetchOptions = partialFetchOptions;
            fetchOptions.criteria.filter = filterOptions;
            fetchOptions.criteria.afterFilter = calculatedFilter;
            fetchOptions.patient = ADK.PatientRecordService.getCurrentPatient();
            fetchOptions.collectionConfig = {
                comparator : function(first, second) {
                    first = first.length === DATE_LENGTH ? first : String(first + ZERO_FILL).substr(0, DATE_LENGTH);
                    second = second.length === DATE_LENGTH ? second : String(second + ZERO_FILL).substr(0, DATE_LENGTH);

                    if (first < second) {
                        return 1;
                    } else if (first > second) {
                        return -1;
                    }
                    return 0;
                }

            };

            this.allMedications = ADK.PatientRecordService.fetchCollection(fetchOptions);

            return this.allMedications;
        }
    };
    _.extend(collectionHandler, Backbone.Events);
    return collectionHandler;
});