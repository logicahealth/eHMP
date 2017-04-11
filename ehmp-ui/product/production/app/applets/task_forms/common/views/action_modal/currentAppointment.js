define([
    'underscore'
], function(_) {
    'use strict';

    function createView(model) {
        var currentAppt = _.last(_.get(model.get('clinicalObject'), 'data.appointments'));

        var CurrentAppointment = {
            control: 'container',
            extraClasses: ['col-xs-12', 'bottom-margin-sm', 'top-margin-sm'],
            template: [
                '<h5 class="bottom-margin-xs bottom-border-grey">Current Appointment Info</h5>',
                '<div class="row">',
                '    <div class="col-xs-4"><p><strong class="color-grey-darker">Scheduled Date</strong><br />' + Handlebars.helpers.formatDate(_.get(currentAppt, 'date'), 'MM/DD/YYYY') + '</p></div>',
                '    <div class="col-xs-4"><p><strong class="color-grey-darker">Clinic</strong><br />' + _.get(currentAppt, 'clinic.name') + '</p></div>',
                '    <div class="col-xs-4"><p><strong class="color-grey-darker">Provider</strong><br />' + _.get(currentAppt, 'provider') + '</p></div>',
                '</div>'
            ].join('')
        };
        return CurrentAppointment;
    }

    return {
        createView: createView
    };
});
