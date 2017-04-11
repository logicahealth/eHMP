define([], function() {
    'use strict';

    function createView(model) {
        var currentAppt = _.last(dd(model.get('clinicalObject'))('data')('appointments').val);

        var CurrentAppointment = {
            control: 'container',
            extraClasses: ['col-xs-12', 'bottom-margin-sm', 'top-margin-sm'],
            template: [
                '<h5 class="bottom-margin-xs bottom-border-grey">Current Appointment Info</h5>',
                '<div class="row">',
                '    <div class="col-xs-4"><p><strong class="color-grey-darker">Scheduled Date</strong><br />' + Handlebars.helpers.formatDate(dd(currentAppt)('date').val, 'MM/DD/YYYY') + '</p></div>',
                '    <div class="col-xs-4"><p><strong class="color-grey-darker">Clinic</strong><br />' + dd(currentAppt)('clinic')('name').val + '</p></div>',
                '    <div class="col-xs-4"><p><strong class="color-grey-darker">Provider</strong><br />' + dd(currentAppt)('provider').val + '</p></div>',
                '</div>'
            ].join('')
        };
        return CurrentAppointment;
    }

    return {
        createView: createView
    };
});