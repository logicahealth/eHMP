define([
    'app/resources/fetch/encounters/appointment',
    'app/resources/fetch/encounters/appointments',
    'app/resources/fetch/encounters/aggregate'
], function(Appointment, Appointments, Aggregate) {
    'use strict';

    return {
        Appointment: Appointment,
        Appointments: Appointments,
        Aggregate: Aggregate
    };
});