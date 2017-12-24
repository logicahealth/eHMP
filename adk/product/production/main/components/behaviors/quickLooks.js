define([
    'backbone',
    'marionette',
    'underscore',
    'api/Messaging',
    'hbs!main/components/views/appletViews/sharedTemplates/gistPopover'
], function(Backbone, Marionette, _, Messaging, popoverTemplate) {
    'use strict';

    var channel = Messaging.getChannel('quickLooks');


    /**
     * Controls when to hide and show the the quick looks toolbar.
     * This can be added onto any view which has a template using the bootstrap data-toggle=popover
     */
    return Marionette.Behavior.extend({
        defaults: {
            timeout: 2000
        },

        ui: {
            popoverEl: '[data-toggle=popover]'
        },

        events: {
            'popover:disable': function() {
                this.ui.popoverEl.popover('disable');
                this.ui.popoverEl.popover('hide');
            },
            'popover:enable': function() {
                this.ui.popoverEl.popover('enable');
            },
            'popover:hide': 'hidePopover',
            'click': 'hidePopover'
        },

        hidePopover: function() {
            this.ui.popoverEl.popover('hide');
        },

        /**
         * Sets up the popover
         */
        onRender: function() {
            var timeout = this.getOption('timeout');
            var data = _.get(this, 'view.serializedData');
            var el = this.$el.attr('data-toggle') === 'popover' ? this.$el : this.ui.popoverEl;
            this.ui.popoverEl = el;
            el.popup({
                trigger: 'hover',
                html: 'true',
                delay: {show: timeout, hide: 0},
                container: 'body',
                template: popoverTemplate(data),
                placement: 'bottom',
                autoHandler: _.bind(this.autoHandler, this)
            });
            this.ui.popoverEl.on('shown.bs.popover', _.bind(this.onPopOverShown, this));
            this.ui.popoverEl.on('hidden.bs.popover', _.bind(this.onPopOverHidden, this));
            this.listenTo(channel, 'enableAll', function() {
                this.ui.popoverEl.popover('enable');
            });
            this.listenTo(channel, 'disableAll', function() {
                this.ui.popoverEl.popover('disable');
            });
        },

        /**
         * Wrapper to call the autoHandler the correct way
         *
         * @param {Array} args The arguments passed to getCalculatedOffset in popup.js, for some stupid reason they
         * invoke the autoHandler with autoHandler.call(this, arguments) instead of autoHandler.apply(this, arguments).
         * @returns {String}
         */
        autoHandler: function autoHandler(args) {
            return this._autoHandler.apply(this, args);
        },

        /**
         * Determines where to place the quick look popup
         * @param {String} placement top, bottom, left, and right
         * @param {Object} position The CSS properties about the quick looks current placement in the DOM
         * @param {Number} actualWidth
         * @param {Number} actualHeight
         * @returns {String}
         * @private
         */
        _autoHandler: function(placement, position, actualWidth, actualHeight) {
            var bufferSize = 50;
            var popoverBottom = _.get(position, 'bottom');
            var windowSize;
            var popoverSize;

            if (_.isUndefined(actualHeight) || _.isUndefined(popoverBottom)) {
                return 'bottom';
            }

            windowSize = window.innerHeight || $(window).height();
            windowSize -= bufferSize;
            popoverSize = actualHeight + popoverBottom;

            if (popoverSize > windowSize) {
                return 'top';
            }
            return 'bottom';
        },

        /**
         * Listen for any resizing events and hide the popOver
         */
        onPopOverShown: function onPopOverShown() {
            var cid = _.get(this, 'view.cid');

            $(window).off('resize.popover.' + cid);

            $(window).one('resize.popover.' + cid, _.bind(function hidePopup() {
                this.ui.popoverEl.popup('hide');
            }, this));
        },

        /**
         * Turn off all listeners
         */
        onPopOverHidden: function onPopOverHidden() {
            var cid = _.get(this, 'view.cid');

            $(window).off('resize.popover.' + cid);
            this.stopListening(Messaging, 'gridster:resize');
        },

        /**
         * Clearing out all jQuery based listeners that don't destroy themselves.
         */
        onDestroy: function onDestroy() {
            var cid = _.get(this, 'view.cid');

            this.ui.popoverEl.off('shown.bs.popover');
            this.ui.popoverEl.off('hidden.bs.popover');
            this.ui.popoverEl.popup('destroy');
            this.$('[data-toggle=popover]').popover('destroy');

            $(window).off('resize.popover' + cid);
        }
    });
});