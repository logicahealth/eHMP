/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore',
    'app/resources/fetch/problems/model'
], function (Backbone, Marionette, _, ProblemsModel) {
    "use strict";

    var ProblemsCollection = ADK.Resources.Collection.extend({
        model: ProblemsModel,
        vpr: 'problems',
        fetchOptions: {
            resourceTitle: 'patient-record-problem',
            pageable: false,
            criteria: {
                filter: 'ne(removed, true)'
            },
            cache: true
        },
        parse: function(response) {
            return _.get(response, 'data.items', response);
        },
        fetchCollection: function(options) {
            var fetchOptions = _.extend({}, options, this.fetchOptions);
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();

            _.set(fetchOptions, 'patient', currentPatient);

            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return ProblemsCollection;
});