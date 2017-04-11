define([
    'backbone',
    'moment',
    'app/applets/problems/writeback/validationUtils'
], function(Backbone, moment, validationUtils) {
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            statusRadioValue: 'A^ACTIVE',
            immediacyRadioValue: 'U^UNKNOWN',
            'onset-date': moment().format('MM/DD/YYYY'),
            noTreatmentFactors: false,
            resultsMessage: [],
            errorModel: new Backbone.Model()
        },
        validate: function(attributes, options) {
            return validationUtils.validateModel(this);
        }
    });
});

