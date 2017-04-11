define([
    'backbone',
    'handlebars',
    'marionette'
], function(Backbone, Handlebars, Marionette) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        templateHelpers: function() {
            var self = this;
            return {
                uidUnderscored: this.model.getUid(),
                getEarlierStopAsMoment: function() {
                    if (self.model.get('vaType') === 'N') {
                        return 'Unknown';
                    } else {
                        return self.model.getEarlierStopAsMoment().format("MM/DD/YYYY");
                    }
                }
            };
        },
        template: Handlebars.compile('<a role="button" href="#qualifiedName-{{uidUnderscored}}" title="Press enter to view additional content">{{#if overallStart}}{{formatDate overallStart}}{{else}}No Data{{/if}} - {{#if getEarlierStopAsMoment}}{{getEarlierStopAsMoment}}{{else}}No Data{{/if}}</a>'),
        className: "order-dates right-margin-xs",
        attributes : {
            role : 'tab',
        },
        events: {
            'click': 'onClick'
        },
        onClick: function(event) {
            event.preventDefault();
            this.triggerMethod('on:click');
        }
    });
});