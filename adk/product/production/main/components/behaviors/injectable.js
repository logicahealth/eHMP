define([
    'backbone',
    'marionette',
    'handlebars',
    'underscore'
], function(Backbone, Marionette, Handlebars, _) {
    "use strict";

    var Injectable = Backbone.Marionette.Behavior.extend({
        childView: false,
        insertMethod: 'prepend',
        shouldShow: true,
        tagName: 'div',
        getNewChildView: function(ChildView, child) {
            if (!ChildView) return;
            return new ChildView({
                targetView: child
            });
        },
        initialize: function(options) {
            this.triggerMethod('before:initialize', options);
            this._regionManager = new Backbone.Marionette.RegionManager();
            this.triggerMethod('after:initialize', options);
        },
        onRender: function(child) {
            var shouldShow = this.getOption('shouldShow');
            if (!((_.isFunction(shouldShow)) ? shouldShow.call(child) : shouldShow)) return;
            this._regionManager.removeRegions();
            var regionName = _.capitalize(this.component || 'mainRegion');
            var region;
            var containerSelector = this.getOption('containerSelector') || child.$el;
            var $containerSelector;
            var getNewChildView = this.getOption('getNewChildView') || _.noop;
            var config = {
                tagName: this.getOption('tagName'),
                className: this.getOption('className'),
                insertMethod: this.getOption('insertMethod'),
                attributes: this.getOption('attributes')
            };

            var $newObjectContainer = document.createElement(_.result(config, 'tagName'));
            $newObjectContainer.className = _.result(config, 'className');
            _.each(_.result(config, 'attributes'), function(val, attr) {
                $newObjectContainer.setAttribute(attr, val);
            });

            if (containerSelector === child.$el) {
                $containerSelector = containerSelector;
            } else {
                $containerSelector = (_.isFunction(containerSelector)) ? containerSelector.apply(this, arguments) : this.view.$(containerSelector);
                if(!($containerSelector instanceof jQuery)) $containerSelector = this.view.$($containerSelector);
            }
            if (!$containerSelector.length) return;
            $containerSelector[_.result(config, 'insertMethod')]($newObjectContainer);

            var childView = getNewChildView(this.getOption('childView'), child);
            if (!(childView instanceof Backbone.Marionette.View)) {
                return;
            }
            region = this._regionManager.addRegion(regionName, {
                el: $newObjectContainer
            });
            region.show(childView);
        },
        onDestroy: function() {
            this._regionManager.removeRegions();
        }
    });

    return Injectable;
});