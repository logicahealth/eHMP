define([
    'underscore'
], function(_) {
    'use strict';

    var PatientRecordAppointment = ADK.ResourceService.PageableCollection.extend({
        mode: 'client',
        state: {
            pageSize: 40
        },
        fetchOptions: {
            resourceTitle: 'patient-record-appointment',
            pageable: true,
            cache: true
        },
        parse: function(response) {
            return _.get(response, 'data.items', response);
        },
        fetchCollection: function(options) {
            var appointmentFetchOptions = _.extend({}, options, this.fetchOptions);
            return ADK.PatientRecordService.fetchCollection(appointmentFetchOptions, this);
        }
    });

    return PatientRecordAppointment;
});
