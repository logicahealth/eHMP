define([
    'backbone',
    'marionette',
    'api/Messaging',
    'hbs!app/applets/ordersearch/orderSearchTemplate',
    'main/adk_utils/resizeUtils'
], function(Backbone, Marionette, Messaging, Tpl, ResizeUtils) {
    'use strict';

    var view = Backbone.Marionette.CompositeView.extend({
        template: Tpl,
        events: {
            'click #order-search-cancel-btn': function() {
                console.log('close!!');
                var TrayView = Messaging.request("tray:writeback:actions:trayView");
                if (TrayView) {
                    TrayView.$el.trigger('tray.reset');
                }
            }
        },
        className: 'order-search container-fluid panel panel-default',
        initialize: function() {},
        onShow: function() {
            var self = this;
            // adjust dimensions when the app is resized
            // (debounced to avoid costly calculations while the window size is in flux)
            this.listenTo(ResizeUtils.dimensions.centerRegion, 'change', _.debounce(this.adjustDimensions, 500), this);

            // initial adustment
            this.adjustDimensions();
        },
        adjustDimensions: function() {
            var $header = this.$el.find('#order-search-header');
            var $body = this.$el.find('#order-search-content');
            var $footer = this.$el.find('#order-search-footer');

            if (!_.isEmpty($body)) {
                var containerHeight = this.$el.parent().height();
                var headerHeight = _.isEmpty($header) ? 0 : $header.outerHeight();
                var footerHeight = _.isEmpty($footer) ? 0 : $footer.outerHeight();
                var bodyHeight = containerHeight - headerHeight - footerHeight;
                $body.css({
                    'height': bodyHeight + 'px'
                });
            }
        }
    });

    return view;
});