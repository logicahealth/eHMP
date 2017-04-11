define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!app/applets/visit/currentVisitContext/template",
], function(Backbone, Marionette, _, Template) {
    "use strict";

    var VisitContextView = Backbone.Marionette.ItemView.extend({
        template: Template,
        className: "btn-group encounter-info left-margin-sm",
        events: {
            'click button': 'setVisitContext'
        },
        modelEvents: {
            "change": "render"
        },
        initialize: function() {
            this.model = ADK.PatientRecordService.getCurrentPatient();
        },
        onRender: function() {
            var height = this.$el.outerHeight(true);
            if (!_.isUndefined(this.previousHeight)) {
                // If the height changes after the first time allow the screen
                // to resize so the workspace layout can correct itself
                if (height > this.previousHeight) {
                    this.previousHeight = height;
                    ADK.utils.resize.windowResize();
                }
            } else {
                // This is the first time so it shouldn't all resize
                this.previousHeight = height;
            }
        },
        setVisitContext: function() {
            ADK.Messaging.getChannel('visit').command('openVisitSelector', 'patientheader');
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "contextNavigationItem",
        group: ["patient", "patient-right"],
        key: "currentVisitContext",
        view: VisitContextView,
        orderIndex: 10,
        shouldShow: function() {
            return ADK.PatientRecordService.isPatientInPrimaryVista();
        }
    });

    return VisitContextView;
});