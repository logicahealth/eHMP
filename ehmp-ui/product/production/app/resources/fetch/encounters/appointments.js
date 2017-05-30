define([
    'app/resources/fetch/encounters/appointment',
    'underscore'
], function (Appointment, _) {
    'use strict';

    var Appointments = ADK.Resources.Collection.extend({
        resource: 'patient-record-timeline',
        vpr: 'appointment',
        model: Appointment,
        parse: function (resp) {
            return _.get(resp, 'data.items');
        },
        getCriteria: function (timeRange) {
            return {
                filter: 'or(eq(kind, "Visit"),eq(kind, "Admission"),eq(kind, "Procedure"),eq(kind, "DoD Appointment"),eq(kind, "Appointment"),eq(kind, "DoD Encounter")),' + 'and(' + timeRange + ')',
                order: 'dateTime DESC'
            };
        },
        fetchCollection: function (timeRange) {
            var fetchOptions = {
                resourceTitle: this.resource,
                pageable: false,
                filterEnabled: true,
                cache: true,
                allowAbort: true,
                criteria: this.getCriteria(timeRange)
            };
            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return Appointments;
});