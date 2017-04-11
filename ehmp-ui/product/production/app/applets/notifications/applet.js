 define([
     'app/applets/notifications/applicationHeaderIcon'
 ], function(NotificationsHeaderIcon) {
     "use strict";

     var applet = {
         id: "notifications"
     };

     ADK.Messaging.trigger('register:component', {
         type: 'applicationHeaderItem',
         group: "user-nav-alerts",
         title: 'Notifications. Press enter to access and then use the up and down arrows to view options.',
         orderIndex: 1,
         key: 'ApplicationHeaderNotificationIcon',
         view: NotificationsHeaderIcon
     });

     return applet;
 });