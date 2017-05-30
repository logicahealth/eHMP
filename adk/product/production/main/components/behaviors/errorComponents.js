define([
    'underscore',
    'backbone',
    'marionette',
    'api/Messaging'
], function(
    _,
    Backbone,
    Marionette,
    Messaging
) {
    'use strict';

    var ErrorComponentsView = Backbone.Marionette.CollectionView.extend({
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfType('errorItem') && child.shouldShow();
        },
        resortView: function() {},
        childViewOptions: function() {
            return {
                errorModel: this.getOption('errorModel')
            };
        },
        onAddChild: function(child) {
            child.listenTo(this, 'attach', _.bind(child.triggerMethod, child, 'attach'));
        }
    });

    var ErrorComponents = Backbone.Marionette.Behavior.extend({
        initialize: function() {
            this._errorComponentsRegions = new Backbone.Marionette.RegionManager();
            this.componentCollection = Messaging.request('get:components');
        },
        _showComponentsView: function() {
            if (_.isFunction(this.getOption('shouldShow')) && !this.getOption('shouldShow').call(this.view)) return;
            this.$container = this.getOption('container') ? this.$(this.getOption('container')) : this.view.$el;
            if (!this.$container.length) {
                console.warn('ErrorComponents Behavior: container must be a valid selector or element');
                return;
            }
            this.errorModel = _.isFunction(this.getOption('getModel')) ? this.getOption('getModel').call(this.view) : this.view.model;
            this._cleanUpRegions();
            this.$container.append('<div class="error-components-container"></div>');
            var ErrorComponentsRegion = Backbone.Marionette.Region.extend({
                el: this.$container.find('.error-components-container')
            });
            this._errorComponentsRegions.addRegions({
                'errorComponents': ErrorComponentsRegion
            });
            this._errorComponentsRegions.get('errorComponents').show(new ErrorComponentsView({
                collection: this.componentCollection,
                errorModel: this.errorModel
            }));
        },
        onRender: function() {
            this._showComponentsView();
        },
        onAttach: function() {
            if (this._errorComponentsRegions.length) {
                this._errorComponentsRegions.get('errorComponents').currentView.triggerMethod('attach');
            }
        },
        onBeforeDestroy: function() {
            this._cleanUpRegions();
            this._errorComponentsRegions.destroy();
        },
        _cleanUpRegions: function() {
            if (this._errorComponentsRegions.get('errorComponents')) {
                this._errorComponentsRegions.removeRegion('errorComponents');
            }
            if (this.$container && this.$container.children('error-components-container').length) {
                this.$container.children('error-components-container').remove();
            }
        }
    });

    return ErrorComponents;

});
