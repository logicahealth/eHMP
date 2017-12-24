define([
    'underscore',
    'backbone'
], function(
    _,
    Backbone
) {
    'use strict';

    var PatientDemographics = ADK.Models.BaseModel.extend({
        defaults: {
            emailAddress: '',
            phones: [],
            isPatientContactInfoChanged: false
        },
        fetchOptions: function() {
            return {
                resourceTitle: 'video-visit-patient-demographics-post'
            };
        },
        save: function(){
            var patientCriteria = ADK.utils.patient.setPatientFetchParams(ADK.PatientRecordService.getCurrentPatient(), patientCriteria) || {};
            this.set(_.get(patientCriteria, 'criteria', {}), {silent: true});
            ADK.Models.BaseModel.prototype.save.apply(this, arguments);
        }
    });
    return PatientDemographics;
});
