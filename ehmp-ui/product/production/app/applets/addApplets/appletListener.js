define([
    'underscore',
    'app/applets/addApplets/appletLayoutView'
], function(_, AppletLayoutView) {
   'use strict';


    var CHANNEL_NAME = 'addAppletsChannel';
    var CHANNEL_EVENT = 'addApplets';


    var channel = ADK.Messaging.getChannel(CHANNEL_NAME);
    var Overlay = ADK.UI.FullScreenOverlay;
    var AddAppletOverlay = Overlay.extend({
        events: getEvents()
    });


    function getEvents() {
        var originalEvents = _.get(Overlay.prototype, 'events');
        var addtionalEvents = {
            'shown.bs.modal': function() {
                this.$('#mainOverlayRegion').focus();
            },
            'focusin.bs.modal': function(e) {
                e.stopPropagation();
            }
        };

        if (_.isFunction(originalEvents)) {
            return function() {
                var events = originalEvents.apply(this, arguments);
                return _.extend({}, events, addtionalEvents);
            };
        }
        return _.extend({}, originalEvents, addtionalEvents);
    }


    function showOverlay(modalShowOptions) {
        var view = new AddAppletOverlay({
            view: new AppletLayoutView(),
            options: {
                'callShow': true,
                'keyboard': false
            }
        });
        view.show(modalShowOptions);
    }


    return {
        start: function() {
            channel.off(CHANNEL_EVENT);
            channel.on(CHANNEL_EVENT, showOverlay);
        },
        stop: function() {
            channel.off(CHANNEL_EVENT);
        }
    };
});