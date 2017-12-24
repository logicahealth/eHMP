define([
    'backbone',
    'marionette',
    'handlebars',
    'underscore',
    'main/components/quickMenu/quickMenuView',
    'main/components/behaviors/injectable'
], function(Backbone, Marionette, Handlebars, _, QuickMenuView, Injectable) {
    "use strict";

    var QuickMenu = Injectable.extend({
        className: 'quickmenu-container',
        component: 'quickmenu',
        childView: QuickMenuView,
        tagName: 'td',
        hoverClass: 'dropdown-hover',
        containerSelector: function() {
            return this.$el;
        },
        insertMethod: 'prepend',
        shouldShow: function() {
            var tileOptions = this.getOption('tileOptions') || {};
            return _.result(tileOptions, 'quickMenu.shouldShow', true);
        },
        events: {
            mouseenter: function(e) {
                this.$el.addClass(this.getOption('hoverClass'));
            },
            mouseleave: function(e) {
                this.$el.removeClass(this.getOption('hoverClass'));
            }
        }
    });

    return QuickMenu;
});