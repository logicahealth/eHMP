define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/discharge_summary/modal/modalTemplate'
], function(Backbone, Marionette, _, modalTemplate) {
    'use strict';

    return Backbone.Marionette.ItemView.extend({
        template: modalTemplate,
        modelEvents: {
            'change': 'render'
        },
        serializeModel: function(model) {
            var JSON = model.toJSON();
            var summaryStatusClass = '',
                lcName = _.get(JSON, 'statusDisplayName', '').toLowerCase();

            if (lcName === 'completed' || JSON.summaryStatusDisplayName === 'complete' ) {
                JSON.summaryStatusDisplayName = 'Completed';
            } else {
                JSON.summaryStatusDisplayName = JSON.statusDisplayName;
                if (lcName === 'retracted') {
                    summaryStatusClass = 'text-danger';
                }
            }
            JSON.filterDocId = JSON.uid;
            JSON.summaryFacilityName = JSON.facilityName;
            JSON.summaryLocalTitle = JSON.localTitle;
            JSON.summaryDateTime = JSON.referenceDateTime;
            JSON.summaryKind = JSON.kind;
            JSON.summaryEntered = JSON.entered;
            JSON.summaryAuthorDisplayName = JSON.authorDisplayName;
            JSON.summaryCosignerDisplayName = JSON.cosignerDisplayName;
            JSON.summaryAttendingDisplayName = JSON.attendingDisplayName;
            JSON.summaryStatusClass = summaryStatusClass;
            JSON.summaryText = _.get(JSON.text[0], 'content');
            return JSON;
        }
    });
});
