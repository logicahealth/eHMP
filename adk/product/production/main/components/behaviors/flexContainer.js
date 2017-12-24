define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    "use strict";

    var FlexContainer = Backbone.Marionette.Behavior.extend({
        onRender: function() {
            var containerOption = this.getOption('container');
            if (_.isArray(containerOption)) {
                _.each(containerOption, function(containerItem) {
                    var configToPass = containerItem || {};
                    if (!_.isObject(containerItem)) {
                        configToPass = _.extend({}, this.options, { container: containerItem });
                    }
                    this.applyFlex(configToPass);
                }, this);
            } else {
                this.applyFlex(this.options);
            }
        },
        applyFlex: function(config, debugArray) {
            var containerOption = this.getValidContainer(_.get(config, 'container'));
            var $containerElement = containerOption ? containerOption : this.$el;
            $containerElement.addClass('flex-display inherit-height flex-direction-' + (_.get(config, 'direction') || 'column'));
            if (_.isString(_.get(config, 'alignItems'))) {
                $containerElement.addClass('flex-align-' + _.get(config, 'alignItems'));
            }
            if (_.isString(_.get(config, 'justifyContent'))) {
                $containerElement.addClass('flex-justify-' + _.get(config, 'justifyContent'));
            }
            _.each($containerElement.children(), function(item) {
                var $item = this.$(item);
                // assumes any element that doesn't specify a width as none.
                // Additional flex properties can be applied here as needed
                var flexWidth = $item.attr('data-flex-width') || 'none';
                $item.addClass('flex-width-' + flexWidth.replace('.', '_'));

                var flexOrder = $item.attr('data-flex-order') || '0';
                $item.addClass('flex-order-' + flexOrder.replace('.', '_'));
            }, this);
        },
        getValidContainer: function(container) {
            return container instanceof jQuery && !!container.length ?
                container :
                (_.isString(container) || _.isElement(container)) && !!this.$(container).length ?
                this.$(container) :
                _.isBoolean(container) && container ?
                this.$el : false;
        }
    });

    return FlexContainer;
});
