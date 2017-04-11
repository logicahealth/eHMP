define([
    'backbone',
    'backbone.radio'
], function(Backbone) {
    'use strict';

    // Channel reference type is being used in backbone.radio.js lib so it cannot be simply extended to create a new reference type. So there goes the need for saving the original reply function.
    var replyOriginal = Backbone.Radio.Channel.prototype.reply;
    var requestOriginal = Backbone.Radio.Channel.prototype.request;

    _.extend(Backbone.Radio.Channel.prototype, {
        getChannel: function (channelName) {
            return Backbone.Radio.channel(channelName);
        },
        reply: function (name, callback, context) {
            replyOriginal.apply(this, arguments);

            if (context && context.eventSuffix) {
                this.trigger(name + ':' + eventSuffix);
            }
        },
        request: function (name) {
            var lastArgument = _.last(arguments);

            if (arguments.length > 1 && _.isObject(lastArgument) && _.isFunction(lastArgument.eventCallback)) {
                var args = Array.prototype.slice.call(arguments); args.pop();
                var eventCallback = lastArgument.eventCallback;
                var resultObj = requestOriginal.apply(this, args);
                var eventListener = lastArgument.eventListener;

                if (_.isEmpty(resultObj)) {
                    var self = this;
                    var eventSuffix = lastArgument.eventSuffix;
                    eventListener.listenToOnce(this, name + ':' + eventSuffix, function () {
                        resultObj = requestOriginal.apply(self, args)
                        eventCallback.apply(eventListener, [resultObj]);
                    });
                } else {
                    eventCallback.apply(eventListener, [resultObj]);
                }
                // Notice this may be undefined, and the listenToOnce's callback might be executed later.
                return resultObj;
            } else {
                return requestOriginal.apply(this, arguments);
            }
        }
    });

    var Messaging = Backbone.Radio.channel('global');

    return Messaging;
});