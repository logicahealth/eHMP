define([
    'underscore',
    'backbone',
    'marionette',
    'hbs!app/applets/task_forms/activities/order.dischargefollowup/templates/activityDetails_Template'
], function(_, Backbone, Marionette, RequestDetailsTemplate) {
    'use strict';

    return Backbone.Marionette.ItemView.extend({
        template: RequestDetailsTemplate,
        serializeData: function() {
            var data = this.model.toJSON();
            var discharge = _.get(this.model.get('clinicalObject'), 'data.discharge');
            _.set(data, 'admissionOnDate', _.get(discharge, 'admitDateTime') || 'N/A');
            _.set(data, 'dischargedOn', _.get(discharge, 'dateTime') || 'N/A');
            _.set(data, 'disposition', _.get(discharge, 'disposition') || 'N/A');
            _.set(data, 'fromFacilityName', _.get(discharge, 'fromFacilityDescription') || 'N/A');

            var diagnoses = _.get(this.model.get('clinicalObject'), 'data.discharge.diagnosis', '');
            var diagnosisDisplayText = '';

            if (_.isArray(diagnoses)) {
                diagnosisDisplayText = _.map(diagnoses, 'description').join(', ');
            } else {
                diagnosisDisplayText = _.get(diagnoses, 'description');
            }

            if (!diagnosisDisplayText) {
                diagnosisDisplayText = 'N/A';
            }

            _.set(data, 'diagnosisDisplayText', diagnosisDisplayText);

            return data;
        }
    });
});