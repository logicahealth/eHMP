define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'main/components/behaviors/injectable'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    Injectable
) {
    'use strict';

    var template = Handlebars.compile('<span class="sr-only">{{title}}</span>');

    var NotificationsView = Marionette.ItemView.extend({
        tagName: 'i',
        className: 'fa fa-bell color-tertiary-darker font-size-14',
        template: template,
        attributes: function() {
            var targetView = this.getOption('targetView');
            this.model = targetView.model;
            this.tileOptions = targetView.getOption('tileOptions');
            this.notificationOptions = _.result(this, 'tileOptions.notifications');
            this.model.set('title', this.model.get(_.get(this, 'notificationOptions.titleAttr', 'NOTIFICATIONTITLE')) || '');
            return {
                title: this.model.get('title')
            };
        }
    });

    return Injectable.extend({
        className: 'notification-container',
        component: 'notificationIcon',
        childView: NotificationsView,
        tagName: 'div',
        insertMethod: 'prepend',
        containerSelector: '.notification-container',
        shouldShow: function() {
            var tileOptions = this.getOption('tileOptions') || {};
            if (_.isFunction(_.get(tileOptions, 'notifications.shouldShow'))) {
                return tileOptions.notifications.shouldShow(this.model);
            }

            return _.result(tileOptions, 'notifications.shouldShow', true);
        }
    });
});