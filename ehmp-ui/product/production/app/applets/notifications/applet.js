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
         title: 'Notifications Button. Press enter to view notifications.',
         orderIndex: 1,
         key: 'ApplicationHeaderNotificationIcon',
         view: NotificationsHeaderIcon
     });

     return applet;
 });