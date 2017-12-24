define([
   'backbone',
    'marionette',
    'underscore',
    'handlebars'
], function(Backbone, Marionette, _, Handlebars) {
    'use strict';

    var ENTER_KEY = 13;
    var SPACE_BAR = 32;


    return Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<i class="fa fa-caret-right right-margin-xs"></i>'),

        tagName: 'button',

        className: 'btn btn-accordion btn-accordion--large lab-panel-button left-side',

        attributes: {
            'aria-expanded': 'false',
            'title': 'Details Panel'
        },

        events: {
            'click': 'togglePanel',
            'keydown': 'keyEvent'
        },

        togglePanel: function(event) {
            event.preventDefault();
            event.stopPropagation();

            var targetView = this.getOption('targetView');
            var data = {
                model: _.get(targetView, 'model'),
                event: event,
                $el: targetView.$el
            };
            this.$el.trigger('numeric:labs:row:click', data);
        },

        keyEvent: function(event) {
            if (event.which === ENTER_KEY || event.which === SPACE_BAR) {
                event.stopImmediatePropagation();
                event.preventDefault();
                this.togglePanel(event);
            }
        }
    });
});