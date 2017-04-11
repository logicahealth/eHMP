define([
    'backbone',
    'handlebars',
    'marionette'
], function(Backbone, Handlebars, Marionette) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        templateHelpers: function() {
            return {
                uidUnderscored: this.model.getUid(),
                getEarlierStopAsMoment: this.model.getEarlierStop().stoppedMoment.format("MM/DD/YYYY")
            };
        },
        template: Handlebars.compile('<a href="#qualifiedName-{{uidUnderscored}}">{{formatDate overallStart}} - {{getEarlierStopAsMoment}}</a>'),
        className: "order-dates",
        events: {
            'click': 'onClick'
        },
        onClick: function(event) {
            event.preventDefault();
            this.triggerMethod('on:click');
        }
    });
});