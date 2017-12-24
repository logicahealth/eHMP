define([
    'handlebars',
    'app/contexts/workspace/patient_selection/behavior'
], function(
    Handlebars,
    PatientSelectionBehavior
) {
    'use strict';

    var ContextLayoutModel = Backbone.Model.extend({
        defaults: {
            mode: null
        }
    });

    var LayoutView = Backbone.Marionette.LayoutView.extend({
        behaviors: {
            SkipLinks: {
                items: [{
                    label: 'Main Content',
                    element: function() {
                        return this.$('#content-region');
                    },
                    rank: 0
                }]
            },
            PatientSelectionBehavior: {
                behaviorClass: PatientSelectionBehavior
            }
        },
        className: "container-fluid",
        template: Handlebars.compile('<div id="content-region" class="row left-padding-xs right-padding-xs top-padding-sm"></div>'),
        regions: {
            content_region: '#content-region'
        },
        initialize: function(options) {
            this.model = new ContextLayoutModel();
        },
        modelEvents: {
            'change:mode': 'updateLayout'
        },
        updateLayout: function(model, value) {
            this.triggerMethod('toggle:patient:selection', _.isEqual(value, 'patient-selection'));
            this.triggerMethod('toggle:skip:link', 'Main Content', !_.isEqual(value, 'patient-selection'));
        },
        onContextLayoutUpdate: function(options) {
            this.model.set(_.extend({ mode: null }, options));
        }
    });

    return LayoutView;
});
