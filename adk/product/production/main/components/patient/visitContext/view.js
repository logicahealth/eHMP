define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "api/Messaging",
    "hbs!main/components/patient/visitContext/template",
], function(Backbone, Marionette, _, Handlebars, Messaging, Template) {
    "use strict";

    var VisitContextView = Backbone.Marionette.ItemView.extend({
        template: Template,
        className: "panel-padding",
        attributes: {
            type: "button",
            tabindex: "0",
            title: "Press enter to add/edit visit information."
        },
        events: {
            'click': 'setVisitContext'
        },
        modelEvents: {
            "change": "render"
        },
        setVisitContext: function() {
            Messaging.getChannel('visit').command('openVisitSelector', 'patientheader');
        },
    });

    return VisitContextView;
});