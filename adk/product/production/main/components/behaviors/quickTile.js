define([
    'backbone',
    'marionette',
    'handlebars',
    'underscore',
    'main/components/behaviors/childBehaviors',
    'main/components/behaviors/quickMenu',
    'api/Messaging'
], function(Backbone, Marionette, Handlebars, _, ChildBehaviors, QuickMenu, Messaging) {
    "use strict";

    var channel = Messaging.getChannel('quickLooks');

    var QuickTile = ChildBehaviors.extend({
        insertMethod: 'prepend',
        events: {
            'quicklooks:disable:all': function(event) {
                this.view.$(event.target).trigger('popover:hide');
                channel.trigger('disableAll');
            },
            'quicklooks:enable:all': function() {
                channel.trigger('enableAll');
            }
        },
        childViewOptions: function() {
            return {
                tileOptions: this.view.getOption('tileOptions')
            };
        },
        _childBehaviors: {},
        childViewBehaviors: function() {
            var shouldShow = this.getOption('shouldShow');
            if (!(_.isFunction(shouldShow) ? shouldShow.call(this.view) : shouldShow) || !this.isEnabled()) return;
            this._childBehaviors.QuickMenu = {
                className: this.getOption('rowContainerClassName'),
                tagName: this.getOption('rowTagName'),
                containerSelector: this.getOption('childContainerSelector'),
                insertMethod: this.getOption('insertMethod'),
                attributes: this.getOption('rowAttributes')
            };

            return this._childBehaviors;
        },
        behaviors: function() {
            var shouldShow = this.getOption('shouldShow');
            if (!(_.isFunction(shouldShow) ? shouldShow.call(this.view) : shouldShow) || !this.isEnabled()) return;
            var headerContainerSelector = this.getOption('headerContainerSelector') || _.noop;

            return {
                'Injectable': {
                    className: this.getOption('headerContainerClassName'),
                    component: 'quickmenu',
                    tagName: this.getOption('headerTagName'),
                    containerSelector: function() {
                        this.shouldShow = false; //only show for header
                        return _.isFunction(headerContainerSelector) ? headerContainerSelector.apply(this, arguments) : headerContainerSelector;
                    },
                    insertMethod: this.getOption('insertMethod'),
                    attributes: this.getOption('headerAttributes')
                }
            };
        },
        rowContainerClassName: 'quickmenu-container',
        headerContainerClassName: 'quickmenu-header',
        headerTagName: 'div',
        rowTagName: 'div',
        rowAttributes: {},
        headerAttributes: {},
        initialize: function() {
            if (this.isQuickLooksEnabled()) {
                this._childBehaviors.QuickLooks = _.get(this.view.getOption('tileOptions'), 'quickLooks');
            }
            if (this.isActionButtonEnabled()) {
                this._childBehaviors.Actions = this.view.getOption('actions');
            }
			if (this.isNotificationsEnabled()) {
                this._childBehaviors.Notifications = this.view.getOption('notifications');
            }
            ChildBehaviors.prototype.initialize.apply(this, arguments);
        },
        headerContainerSelector: function(child) {
            return child.$('.header');
        },
        childContainerSelector: function(child) {
            return child.$('.table-row');
        },
        onRender: function(child) {
            child.$el.addClass('quick-menu-table');
        },
        childEvents: {
            render: function(child) {
                child.$el.addClass('quick-menu-row');
            }
        },
        isEnabled: function() {
            var enabled = _.get(this, 'view.tileOptions.enabled', this.getOption('enabled'));
            return (_.isFunction(enabled) ? enabled.call(this.view) : enabled);
        },

        isMenuEnabled: function() {
            var enabled = _.get(this, 'view.tileOptions.quickMenu.enabled', this.getOption('menuEnabled'));
            return (_.isFunction(enabled) ? enabled.call(this.view) : enabled);
        },

        isQuickLooksEnabled: function() {
            var tileOptions = this.view.getOption('tileOptions');
            return _.get(tileOptions, 'quickLooks.enabled', false);
        },
        isActionButtonEnabled: function() {
            var actionEnabled = _.get(this, 'view.tileOptions.actions', false);
            if (actionEnabled) {
                var actions = this.view.getOption('actions');
                return _.get(actions, 'enabled', false);
            }
            return actionEnabled;
        },
		isNotificationsEnabled: function() {
            var supportsNotifications = _.get(this, 'view.tileOptions.notifications', false);
            if (supportsNotifications) {
                var notifications = this.view.getOption('notifications');
                return _.get(notifications, 'enabled', false);
            }
            return supportsNotifications;
        },
        menuEnabled: true,
        enabled: true,
        shouldShow: true
    });

    return QuickTile;
});