define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'api/Messaging',
    'main/ui_components/applet_dropdown/alert_dropdown/component',
], function(_, Backbone, Marionette, Handlebars, Messaging, UIDropdown) {
    'use strict';

    var Links = Backbone.Collection.extend({
        model: Backbone.Model.extend({ idAttribute: 'displayText', defaults: { hidden: false } }),
        comparator: 'rank'
    });
    // Behavior for events to avoid any conflicts
    var DropdownFocusManagement = Backbone.Marionette.Behavior.extend({
        events: {
            'focusin button': function(e) {
                this.$el.addClass('focused');
            },
            'focusout button': function(e) {
                if (!this.$el.hasClass('open')) {
                    this.$el.removeClass('focused');
                }
            },
            'dropdown.hide': function(e) {
                if (!this.$('button').is(':focus')) {
                    this.$el.removeClass('focused');
                }
            }
        }
    });

    var SkipLinks = UIDropdown.extend({
        Collection: Links,
        behaviors: {
            DropdownFocusManagement: {
                behaviorClass: DropdownFocusManagement
            },
            ZIndex: {
                cleanupEventString: 'focusout',
                eventString: 'focusin'
            }
        },
        className: function() {
            var classes = 'skip-link-navigation-dropdown';
            return classes;
        },
        align: 'left',
        DropdownListView: UIDropdown.prototype.DropdownListView.extend({
            className: function() {
                var origClassName = UIDropdown.prototype.DropdownListView.prototype.className;
                var classes = _.isFunction(origClassName) ? origClassName.apply(this, arguments) : origClassName || '';
                return classes + ' skip-link-dropdown-menu';
            },
            filter: function(child, index, collection) {
                return !child.get('hidden');
            },
            emptyView: Backbone.Marionette.ItemView.extend({
                className: 'list-group-item',
                tagName: 'li',
                template: Handlebars.compile('<span class="all-padding-xs block-display">No items available.</span>')
            })
        }),
        RowView: UIDropdown.RowView.extend({
            tagName: 'li',
            className: 'list-group-item',
            template: Handlebars.compile([
                '<a href="{{url}}" target="_blank">',
                '{{displayText}}</a>'
            ].join('\n')),
            events: {
                'click a': function(e) {
                    e.preventDefault();
                    if (this.model.get('focusFirstTabbable')) {
                        this.model.get('focusEl').find(':focusable:first').focus();
                    } else {
                        this.model.get('focusEl').focus();
                    }
                },
                'focusin a': 'addHighlight',
                'focusout a': 'removeHighlight'
            },
            addHighlight: function(e) {
                this.model.get('focusEl').addClass('skip-link-navigation-highlight');
            },
            removeHighlight: function(e) {
                this.model.get('focusEl').removeClass('skip-link-navigation-highlight');
            }
        }),
        ButtonView: UIDropdown.prototype.ButtonView.extend({
            template: Handlebars.compile('Skip to:'),
            className: 'btn btn-warning'
        }),
        onRender: function() {
            if (this.collection && !this.collection.length) this.$el.addClass('hidden');
        },
        collectionEvents: {
            'update reset': function() {
                if (this.collection.length) {
                    this.$el.removeClass('hidden');
                    return;
                }
                this.$el.addClass('hidden');
            }
        }
    });
    return SkipLinks;
});
