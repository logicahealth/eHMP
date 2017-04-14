define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
], function(Backbone, Marionette, $, Handlebars) {
    'use strict';
    var defaultOptions = {
        onClick: function(e) {
            console.log('Sub tray button has been clicked!', arguments);
            return true;
        },
        label: 'Button'
    };
    var SubTrayButtonView = Backbone.Marionette.ItemView.extend({
        className: 'sidebar inline-display',
        template: Handlebars.compile('<button class="btn btn-default btn-sm">{{getLabel}}</button>'),
        templateHelpers: function() {
            var self = this;
            return {
                getLabel: function() {
                    return _.isString(self.getOption('label')) ? self.getOption('label') : defaultOptions.label;
                }
            };
        },
        events: {
            'click button': function(e) {
                e.preventDefault();
                if (_.isFunction(this.getOption('onClick'))) {
                    this.getOption('onClick').call(this, arguments);
                }
            }
        }
    });

    var Orig = SubTrayButtonView,
        Modified = Orig.extend({
            constructor: function() {
                this.options = _.extend({}, defaultOptions, this.options);
                var args = Array.prototype.slice.call(arguments);
                Orig.prototype.constructor.apply(this, args);
            }
        });
    SubTrayButtonView = Modified;
    return SubTrayButtonView;
});
