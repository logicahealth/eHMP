define([
    'backbone',
    'app/applets/video_visits/details/startVideoConfimationAlert'
], function(Backbone, ConfirmationAlert) {
    'use strict';

    var FooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{#if showStartVideoVisitButton}}',
            '<button type="button" data-action="StartVideoVisit" class="btn btn-default btn-sm valign-middle pull-left">Start Video Visit</button>',
            '{{/if}}',
            '<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Close</button>'
        ].join('\n')),
        templateHelpers: function() {
            return {
                showStartVideoVisitButton: function() {
                    return _.isEqual(this.appointmentKind, 'ADHOC') || _.isEqual(this.appointmentKind, 'MOBILE_ANY');
                }
            };
        },
        events: {
            'click [data-action="StartVideoVisit"]': 'onStartVideoVisit'
        },
        onStartVideoVisit: function() {
            var alert = new ConfirmationAlert({
                model: this.model
            });
            alert.show();
        }
    });

    return FooterView;
});
