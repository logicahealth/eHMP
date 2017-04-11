define([
    'app/applets/task_forms/common/views/action_modal/currentAppointment'
], function(CurrentAppointment) {
    'use strict';

    function createBodyView(model) {
        var CancellationReasonControls = [{
            control: "container",
            extraClasses: ['col-xs-6'],
            items: [{
                control: 'select',
                name: 'reason',
                label: 'Reason for Cancellation',
                placeholder: '-- None Selected --',
                title: 'Use up and down arrow keys to view options and press enter to select',
                required: true,
                disabled: false,
                pickList: [{
                    value: 'Patient canceled previous Appt.',
                    label: 'Patient canceled previous Appt.'
                }, {
                    value: 'Patient no-showed previous Appt.',
                    label: 'Patient no-showed previous Appt.'
                }, {
                    value: 'Patient left without being seen previous Appt.',
                    label: 'Patient left without being seen previous Appt.'
                }, {
                    value: 'Clinic canceled previous Appt.',
                    label: 'Clinic canceled previous Appt.'
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["col-xs-12", "top-margin-xs", "bottom-margin-md"],
            items: [{
                control: "textarea",
                name: 'comment',
                title: "Enter a comment for canceling the appointment",
                label: "Comment",
                rows: 3,
                required: false,
                maxlength: 200
            }]
        }];
        var BodyView = {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                modelListeners: [''],
                template: Handlebars.compile('<h5 class="top-margin-xs bottom-margin-xs bottom-padding-xs font-size-18">{{clinicalObject.displayName}}</h5>')
            }]
        };
        /**
         * Consult Clinical Object Data Spec
         *
         * Reference: https://wiki.vistacore.us/display/VACORE/Consult+Clinical+Object+Data+Specification
         */
        var currentAppt = _.last(dd(model.get('clinicalObject'))('data')('appointments').val);

        // Appt. Status: https://wiki.vistacore.us/pages/viewpage.action?pageId=15991103#ConsultAppointment(DataSpecification)-AppointmentStatus
        if (dd(currentAppt)('status')('id').val === '2' /*scheduled*/ ) {
            BodyView.items.push(CurrentAppointment.createView(model));
        }
        BodyView.items = BodyView.items.concat(CancellationReasonControls);

        return BodyView;
    }

    return {
        getBodyView: createBodyView,
        onAccept: function(model) {
            model.set('signalBody', {
                reason: model.get('reason'),
                comment: model.get('comment')
            });
        }
    };
});