define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars
) {
    'use strict';
    var DefaultWorkspaceButton = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        attributes: function() {
            var descriptionText = 'Set ' + (this.model.get('title') || 'this workspace') + ' as the default workspace';
            return {
                'type': 'button',
                'title': descriptionText,
                'aria-label': descriptionText
            };
        },
        className: 'default-workspace-btn btn btn-icon color-primary',
        template: Handlebars.compile('<i class="fa {{iconClass}}"></i>'),
        templateHelpers: function() {
            return {
                iconClass: this.model.get('default') ? 'fa-star madeDefault' : 'fa-star-o'
            };
        },
        modelEvents: {
            'change:default': 'render'
        },
        events: {
            'click': function(e) {
                this.triggerMethod('click:default');
                this.$el.focus();
            }
        }
    });
    return DefaultWorkspaceButton;
});
