define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/short_cuts/collectionHandler'
], function(Backbone, Marionette, _, Handlebars, ShortCutsCollection) {
    "use strict";

    var AlertDropdown = ADK.UI.AlertDropdown.extend({
        icon: 'fa-bookmark',
        dropdownTitle: 'Shortcuts',
        ButtonTemplate: Handlebars.compile([
            '<i class="fa {{icon}} font-size-18"></i>',
        ].join('\n')),
        RowView: ADK.UI.AlertDropdown.RowView.extend({
            tagName: 'li',
            className: 'list-group-item',
            template: Handlebars.compile([
                '<a href="{{url}}" target="_blank" aria-label="{{title}}. External link">',
                '<i class="fa fa-external-link fa-fw"></i>',
                '{{label}}</a>'
            ].join('\n'))
        }),
        collection: new ShortCutsCollection(),
        onBeforeInitialize: function() {
            this.collection.doFetch();
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: 'applicationHeaderItem',
        title: 'Short cuts',
        orderIndex: 1,
        key: 'short-cuts',
        group: 'user-nav-alerts',
        view: AlertDropdown,
        shouldShow: function() {
            return ADK.UserService.getStatus() !== 'loggedout';
        }
    });

    return AlertDropdown;
});