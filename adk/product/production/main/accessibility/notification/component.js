define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'api/Messaging'
], function(Backbone, Marionette, $, Handlebars, Messaging) {
    'use strict';

    var AriaLiveTypes = ["Polite", "Assertive"];
    var Notification = {
        _defaultOptions: {
            'type': AriaLiveTypes[0],
            'message': ''
        },
        showAriaLiveViews: function() {
            var NotificationView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile("{{message}}"),
                modelEvents: {
                    'change': 'render'
                },
                tagName: 'p'
            });
            _.each(AriaLiveTypes, function(type) {
                Messaging.request('get:adkApp:region', 'ariaLive'+type+'Region').show(new NotificationView({
                    model: new Backbone.Model({
                        'message': ''
                    })
                }));
            });
        }
    };

    Notification.new = function(options) {
        //add notification here
        options = _.defaults(options || {}, this._defaultOptions);
        if (_.indexOf(AriaLiveTypes, options.type) > -1){
            Messaging.request('get:adkApp:region', 'ariaLive' + options.type + 'Region').currentView.model.set('message', options.message);
            return true;
        }
        return false; // Error Occurred
    };
    Notification.clear = function(options) {
        //clear notification here
        options = _.defaults(options || {}, this._defaultOptions);
        if (_.indexOf(AriaLiveTypes, options.type) > -1){
            Messaging.request('get:adkApp:region', 'ariaLive' + options.type + 'Region').currentView.model.unset('message');
            return true;
        }
        return false; // Error Occurred
    };

    return Notification;
});