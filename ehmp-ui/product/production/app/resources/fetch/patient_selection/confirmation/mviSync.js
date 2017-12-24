define([
    'app/resources/fetch/patient_selection/confirmation/collection'
], function(
    BaseCollection
) {
    'use strict';

    var MviSync = ADK.Resources.Model.extend({
        childParse: false,
        initialize: function(options) {
            this.patient = _.get(this, 'patient', _.get(options, 'patient'));
        },
        resource: 'search-mvi-global-patient-sync',
        fetch: function(options) {
            this.patient = this.patient || ADK.PatientRecordService.getCurrentPatient();
            var opts = ADK.utils.patient.setPatientFetchParams(this.patient, options);
            opts = _.extend({
                data: opts.criteria,
                type: 'GET',
                contentType: 'application/json'
            }, opts);
            return ADK.Resources.Collection.prototype.fetch.call(this, opts);
        }
    });

    return MviSync;
});