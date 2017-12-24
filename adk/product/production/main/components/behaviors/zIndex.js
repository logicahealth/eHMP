define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'main/Utils'
], function(Backbone, Marionette, _, $, Utils) {
    "use strict";

    var ZIndex = Backbone.Marionette.Behavior.extend({
        events: function() {
            var events = {};
            var selectors = this.getOption('selectors');
            var getNextLayerOptions = {};
            if (_.isArray(selectors)) { _.set(getNextLayerOptions, 'selectors', selectors); }
            if (_.isString(this.getOption('eventString'))) {
                events[this.getOption('eventString')] = function(event) {
                    var namspaceIncluded = event.type + (_.isEmpty(event.namespace) ? '' : '.' + event.namespace);
                    if (_.isEqual(namspaceIncluded, this.getOption('eventString'))) {
                        var zIndex = Utils.cssCalc.zIndex.getNextLayer(getNextLayerOptions);
                        this.getElement(event).css('z-index', zIndex);
                    }
                };
            }
            if (_.isString(this.getOption('cleanupEventString'))) {
                events[this.getOption('cleanupEventString')] = function(event) {
                    var namspaceIncluded = event.type + (_.isEmpty(event.namespace) ? '' : '.' + event.namespace);
                    if (_.isEqual(namspaceIncluded, this.getOption('cleanupEventString'))) {
                        this.getElement(event).css('z-index', '');
                    }
                };
            }
            return events;
        },
        getElement: function(event) {
            var error = {
                css: _.bind(function() {
                    if (!this.getOption('failSilently')) {
                        console.error('Invalid selector or element -- ZIndex behavior');
                    }
                }, this)
            };
            var $element = this.$el;
            var elementOption = this.getOption('element');
            if (_.isString(elementOption)) {
                $element = this.$(elementOption);
            } else if (_.isFunction(elementOption)) {
                var elementValue = _.bind(elementOption, this.view)(event);
                $element = _.isString(elementValue) ? this.$(elementValue) :
                    elementValue instanceof $ ? elementValue :
                    elementValue instanceof HTMLElement ? $(elementValue) : error;
            }
            if (_.isEmpty($element)) {
                $element = error;
            }
            return $element;
        }
    });

    return ZIndex;
});
