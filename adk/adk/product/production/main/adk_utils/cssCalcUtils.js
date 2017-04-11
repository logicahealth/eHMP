define([
    'jquery',
    'moment',
    'underscore'
], function($, Moment, _) {
    "use strict";

    var cssCalcUtils = {
        zIndex: {
            getNextLayer: function(options) {
                var opts = _.extend({
                    increment: 11,
                    startingIndex: 1200,
                    selectors: []
                }, options);
                _.forIn(this.selectors, function(value, key) {
                    opts.selectors.push(value);
                });
                var $stackedElements = $(opts.selectors.join(', '));
                $stackedElements.each(function(index) {
                    if (this.style.zIndex > opts.startingIndex) {
                        opts.startingIndex = parseInt(this.style.zIndex);
                    }
                });
                return opts.startingIndex + opts.increment;
            },
            selectors: {
                openUIModals: '.modal:visible:not(.autologoff)'
            }
        }
    };

    return cssCalcUtils;
});
