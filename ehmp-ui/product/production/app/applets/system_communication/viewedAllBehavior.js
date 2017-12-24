define([
    'backbone',
    'marionette',
    'underscore'
], function(
    Backbone,
    Marionette,
    _
) {
    "use strict";

    var ViewedAll = Backbone.Marionette.Behavior.extend({
        initialize: function(options) {
            this.containerSelector = this.getOption('container');
            if (!_.isUndefined(this.getOption('event'))) {
                this.listenToOnce(this.view, this.getOption('event'), this._setScrollListener);
            } else {
                this.onAttach = this._onAttach;
            }
        },
        _onAttach: function() {
            this._setScrollListener();
        },
        onBeforeDestroy: function() {
            if (!_.isUndefined(this._scrollElement)) {
                this._scrollElement.off('scroll.viewed-all');
            }
        },
        /**
         * Registers a scroll listener on the DOM element specified by the
         * "container" option.
         * @private
         */
        _setScrollListener: function() {
            this._scrollElement = this.$(this.containerSelector);
            if (!_.isEmpty(this._scrollElement)) {
                if (!this._hasScrolling(this._scrollElement)) {
                    this._scrollElement.trigger('viewed-all');
                } else if (!_.isEmpty(this._scrollElement)) {
                    this._scrollElement.on('scroll.viewed-all', _.bind(this._onScroll, this));
                }
            }
        },
        /**
         * Determines if the container is able to scroll
         * @private
         */
        _hasScrolling: function(element) {
            return _.has(element, '[0]') && (element[0].clientHeight + 1) < element[0].scrollHeight;
        },
        /**
         * DOM scroll event callback that determines if the bottom
         * has been reached. When applicable, trigger "viewed-all" event.
         * @private
         */
        _onScroll: function(event) {
            this._scrollElement = this._scrollElement || this.$(this.containerSelector);
            var e = this._scrollElement[0];
            if ((e.scrollTop + e.clientHeight >= e.scrollHeight - 16)) {
                this._scrollElement.off('scroll.viewed-all');
                this._scrollElement.trigger('viewed-all');
            }
        }
    });
    return ViewedAll;
});
