define([
    'underscore',
    'backbone',
    'marionette',
    'hbs!app/applets/addApplets/list/switchboardTemplate',
], function(_, Backbone, Marionette, switchboardTemplate) {
    "use strict";

    var BeforeSwitchView = Backbone.Marionette.ItemView;
    var TitleView = Backbone.Marionette.ItemView;

    var SwitchboardLayoutView = Backbone.Marionette.LayoutView.extend({
        template: switchboardTemplate,
        className: 'view-switchboard',

        regions: {
            viewOptionsRegion: '.options-list',
            titleRegion: '.applet-title-switchboard'
        },
        initialize: function(options) {
            this.options = options;
            if (options.currentView) {
                this.currentView = options.currentView;
            }
            this.appletTitle = options.appletTitle.toUpperCase();
        },
        onBeforeShow: function() {
            var viewOptionsButtons = ADK.Messaging.request('switchboard : display', this.options);
            this.viewOptionsRegion.show(viewOptionsButtons);
            var titleHtml = this.appletTitle + " - SELECT A VIEW";
            TitleView = TitleView.extend({
                template: _.template(titleHtml),
                tagName: 'h5',
                className: 'top-padding-no bottom-padding-no'
            });
            this.titleRegion.show(new TitleView());
        },
        onShow: function() {
            this.$('.options-list ul li:first button:first').focus();
        },
        events: {
            'click .applet-exit-options-button': 'closeSwitchboard'
        },
        closeSwitchboard: function(e) {
            if (this.currentView) {
                var currentView = '<button type="button" aria-label="Press enter to open view options." class="btn btn-icon edit-applet applet-options-button"><i class="fa fa-cog"></i></button><br><h5 class="applet-title all-margin-no all-padding-no">' + this.options.appletTitle + '</h5>' + getViewTypeDisplay(this.currentView);
                currentView += '<span class="gs-resize-handle gs-resize-handle-both"></span>';
                BeforeSwitchView = BeforeSwitchView.extend({
                    template: _.template(currentView)
                });
                this.options.region.show(new BeforeSwitchView());
                this.options.region.$el.find('.edit-applet').focus();
            } else {
                console.error('Error: Cannot return to unspecified view');
            }

            function getViewTypeDisplay(type) {
                if (type === "gist") {
                    return "trend";
                } else {
                    return type;
                }
            }
        }
    });

    return SwitchboardLayoutView;

});