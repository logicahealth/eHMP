define([
    'backbone',
    'marionette',
    '_assets/js/tooltipMappings'
], function(Backbone, Marionette, TooltipMappings) {
    "use strict";

    var Tooltip = Backbone.Marionette.Behavior.extend({
        ui: {
            '$tooltip': '[tooltip-data-key], [data-toggle=tooltip]'
        },
        events: {
            'mouseenter.tooltip @ui.$tooltip': function(event) {
                //if we're nested in something with a tooltip
                event.preventDefault();
                event.stopPropagation();
            }
        },
        buildConfig: function($tip) {
            var dataKey = $tip.attr('tooltip-data-key'),
                tooltipMapping = TooltipMappings[dataKey],
                title = $tip.attr('title'),
                origTitle = $tip.attr('data-original-title'),
                tooltipDataPlacement = $tip.attr('tooltip-data-placement'),
                dataPlacement = $tip.attr('data-placement'),
                container = $tip.attr('data-container'),
                trigger = $tip.attr('data-trigger'),
                config = {
                    'delay': {
                        'show': 500,
                    },
                    'trigger': trigger || 'hover',
                    'title': tooltipMapping || title || origTitle || dataKey,
                    'container': container || 'body',
                    'placement': dataPlacement || tooltipDataPlacement || 'auto top',
                };
            return config;
        },
        onRender: function() {
            if (!this.ui.$tooltip.length) {
                //the tooltip might be this.$el and not a child, and if so, this.ui.$tooltip will be empty
                if (!!this.$el.attr('tooltip-data-key') || this.$el.attr('data-toggle') === 'tooltip')
                    this.ui.$tooltip = this.$el;
            }

            _.each(this.ui.$tooltip, function(tip) {
                var $tip = (tip === this.el) ? this.$el : this.$(tip);
                if ($tip.data('bs.tooltip')) return;
                var config = this.buildConfig($tip);
                $tip.attr('title', config.title);
                $tip.tooltip(_.defaults({}, this.options, config));
            }, this);
        },
        onBeforeDestroy: function() {
            this.ui.$tooltip.tooltip('destroy');
        }
    });

    return Tooltip;
});