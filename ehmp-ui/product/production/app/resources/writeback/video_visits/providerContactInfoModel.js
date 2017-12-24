define([
    'underscore',
    'backbone'
], function(
    _,
    Backbone
) {
    'use strict';

    var ProviderContactModel = ADK.Models.BaseModel.extend({
        defaults: {
            email: '',
            phone: ''
        },
        fetchOptions: function() {
            return {
                resourceTitle: 'video-visit-provider-contact-post'
            };
        },
        save: function() {
            var patientCriteria = ADK.utils.patient.setPatientFetchParams(ADK.PatientRecordService.getCurrentPatient(), patientCriteria) || {};
            this.set(_.get(patientCriteria, 'criteria', {}), { silent: true });
            ADK.Models.BaseModel.prototype.save.apply(this, arguments);
        }
    });
    return ProviderContactModel;
});
