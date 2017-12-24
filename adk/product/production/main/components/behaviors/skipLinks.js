define([
    'backbone',
    'marionette',
    'handlebars',
    'underscore',
    'main/accessibility/components'
], function(Backbone, Marionette, Handlebars, _, Accessibility) {
    "use strict";

    var SkipLinkBehavior = Backbone.Marionette.Behavior.extend({
        onBeforeAttach: function() {
            var items = this.getOption('items');
            if (_.isArray(items) && !_.isEmpty(items)) {
                _.each(items, _.bind(function(item) {
                    var focusEl = _.get(item, 'element');
                    if (_.isFunction(focusEl)) {
                        focusEl = focusEl.call(this.view);
                    }
                    var focusFirstTabbable = _.get(item, 'focusFirstTabbable', false);
                    if (!focusFirstTabbable && !focusEl.is(':focusable')) {
                        // :focusable only works with elements in DOM,
                        // thus using onAttach. If in onRender something like this
                        // could be used: focusEl.prop('tabindex') === -1
                        focusEl.attr('tabindex', '-1');
                    }
                    if (_.isEmpty(focusEl.attr('aria-label'))) {
                        focusEl.attr('aria-label', _.get(item, 'label'));
                    }
                    Accessibility.SkipLinks.add({
                        displayText: _.get(item, 'label'),
                        focusEl: focusEl,
                        rank: _.get(item, 'rank'),
                        focusFirstTabbable: focusFirstTabbable
                    });
                }, this));
            }
        },
        onBeforeDestroy: function() {
            var items = this.getOption('items');
            if (_.isArray(items) && !_.isEmpty(items)) {
                _.each(items, _.bind(function(item) {
                    Accessibility.SkipLinks.remove({
                        displayText: _.get(item, 'label')
                    });
                }, this));
            }
        },
        onToggleSkipLink: function(displayText, isVisable) {
            var skipLink = Accessibility.SkipLinks.get(displayText);
            if (skipLink) {
                skipLink.set('hidden', !isVisable);
            }
        }
    });

    return SkipLinkBehavior;
});
