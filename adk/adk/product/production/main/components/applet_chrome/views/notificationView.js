define([
    'backbone',
    'marionette',
    'handlebars'
], function(
    Backbone,
    Marionette,
    Handlebars
) {
    'use strict';

    var AppletChromeNotification = Backbone.Marionette.ItemView.extend({
        className: 'applet-chrome-notification',
        template: Handlebars.compile('{{#if count}}<strong class="badge">{{count}}</strong>{{/if}}'),
        serializeData: function serializeData() {
            var JSON = (this.model) ? this.model.toJSON() : {},
                count = this.getNotifications(this.collection);
            if (count) JSON.count = count;
            return JSON;
        },
        getNotifications: function getNotifications(collection) {
            return 0;
        },
        collectionEvents: {
            'change': 'render',
            'reset': 'render'
        },
        onDestroy: function() {
            //remove references in case something external owns the models
            delete this.model;
            delete this.collection;
        }
    });

    return AppletChromeNotification;

});