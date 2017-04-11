define([
    'backbone',
    'marionette',
    'jquery',
    'api/UserService',
    'api/Messaging',
    'api/UrlBuilder'
], function(Backbone, Marionette, $, UserService, Messaging, UrlBuilder) {
    'use strict';


    var RESOURCE_TITLE = 'communicationrequest-watchtube';
    var watchRequest, watchInterval;

    var Notifications = {

        watch: function() {
            var userSession = UserService.getUserSession();
            if (userSession.get('status') === UserService.STATUS.LOGGEDOUT) return;

            var siteCode = userSession.get('site'),
                duz = userSession.get('duz')[siteCode];
            var recipientId = siteCode + ';' + duz;

            var path = UrlBuilder.buildUrl(RESOURCE_TITLE),
                url = UrlBuilder.replaceURLRouteParams(path, {
                    recipientId: recipientId
                });

            var onSuccess = function(data, statusMessage, xhr) {
                Messaging.trigger('notifications:realtime', data);
                watchNotifications();
            };

            var watchNotifications = function() {
                if (!_.isUndefined(watchRequest) && watchRequest.state() === 'pending') {
                    watchRequest.abort();
                }
                if (UserService.checkUserSession()) {
                    watchRequest =
                        $.ajax({
                            url: url,
                            type: 'GET',
                            dataType: 'json',
                            success: onSuccess
                        });
                }
            };

            watchNotifications();
            watchInterval = setInterval(watchNotifications, 240000);
        },

        unwatch: function() {
            if (!_.isUndefined(watchRequest) && watchRequest.state() === 'pending') {
                watchRequest.abort();
            }
            clearInterval(watchInterval);
        }
    };

    return Notifications;
});