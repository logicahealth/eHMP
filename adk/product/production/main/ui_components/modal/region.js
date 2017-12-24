define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'api/Messaging'
], function(
    Backbone,
    Marionette,
    $,
    _,
    Handlebars,
    Messaging
) {
    "use strict";

    var BLOCKING_DEFAULT_VALUE = false;

    var QueueItem = Backbone.Model.extend({
        defaults: {
            view: null
        }
    });

    var Queue = Backbone.Collection.extend({
        model: QueueItem,
        comparator: function(model) {
            return !_.get(model.get('view'), 'modalLayoutView.modalOptions.blocking', BLOCKING_DEFAULT_VALUE);
        }
    });

    return Marionette.Region.extend({
        $triggerElement: null,
        swapping: false,
        initialize: function(options) {
            this._queue = new Queue();
            this.$el.on('empty.queue.modal.region', _.bind(this.clearQueue, this));
            this.listenTo(this._queue, 'add', this.onAddToQueue);
            this.turnOnHideListener();
        },
        turnOnHideListener: function() {
            this.$el.on('hidden.bs.modal.modal.region', _.bind(function(e) {
                if (!this.swapping) {
                    this.showNextInQueue();
                }
            }, this));
        },
        turnOffHideListener: function() {
            this.$el.off('hidden.bs.modal.modal.region');
        },
        isCurrentViewBlocking: function() {
            return this.hasView() && _.get(this, 'currentView.modalLayoutView.modalOptions.blocking', BLOCKING_DEFAULT_VALUE);
        },
        addToQueue: function(modalView, options) {
            if (modalView instanceof Backbone.View) {
                if (!_.get(modalView, 'modalLayoutView.modalOptions.blocking', BLOCKING_DEFAULT_VALUE)) {
                    this.clearQueue({ nonBlockingOnly: true });
                }
                this.updateTriggerElement(options);
                this._queue.add({ view: modalView });
            }
        },
        viewUpdated: function(options){
            this.updateTriggerElement.apply(this, arguments);
            if (!!_.get(this, 'currentView.modalLayoutView.modalOptions.callShow')) {
                this.currentView.$el.modal('show');
            }
        },
        updateTriggerElement: function(options) {
            var element = $(_.get(options, 'triggerElement', []));
            if (element.length && (_.isNull(this.$triggerElement) || !$.contains(this.el, element[0]))) {
                this.$triggerElement = element;
            }
        },
        onAddToQueue: function() {
            if (!this.isCurrentViewBlocking()) {
                this.showNextInQueue();
            }
        },
        show: function(view, options) {
            this.addToQueue(view, options);
        },
        showNextInQueue: function() {
            if (this.swapping) {
                this.swapping = false;
            } else if (!this._queue.isEmpty()) {
                // NOTE: Since the show method is overwritten and
                // the region is relying on this method to show a view,
                // no options are are passed through.
                this.empty();
                Marionette.Region.prototype.show.call(this, this._queue.shift().get('view'));
                if (!!_.get(this, 'currentView.modalLayoutView.modalOptions.callShow')) {
                    this.currentView.$el.modal('show');
                }
            } else {
                this.empty();
                if (!_.isNull(this.$triggerElement) && this.$triggerElement.length && _.isFunction(this.$triggerElement[0].focus)) {
                    this.$triggerElement[0].focus();
                }
                this.$triggerElement = null;
            }
        },
        clearQueue: function(options) {
            if (_.get(options, 'nonBlockingOnly', false)) {
                this._queue.remove(this._queue.filter(function(model) {
                    return !_.get(model.get('view'), 'modalLayoutView.modalOptions.blocking', BLOCKING_DEFAULT_VALUE);
                }));
            } else {
                this._queue.reset();
            }
        },
        onBeforeSwapOut: function() {
            this.swapping = true;
            this.currentView.$el.modal('hide');
        },
        onBeforeDestroy: function() {
            this.$el.off('empty.queue.modal.region');
            this.turnOffHideListener();
        }
    });
});
