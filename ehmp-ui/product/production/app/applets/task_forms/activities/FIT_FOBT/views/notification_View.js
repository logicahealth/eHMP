define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/FIT_FOBT/templates/notification_Template'
],
function(Backbone, Marionette, _, Handlebars, NotificationTemplate) {
    "use strict";

    return Backbone.Marionette.LayoutView.extend({
        template: NotificationTemplate,
        initialize: function() {
            // Add datetime to model to be used on templates
            var expDate = this.model.get('EXPIRATIONTIME');
            if (expDate !== null) {
                this.model.set('dueDateTime', moment(expDate).format('lll'));
            } else {
                this.model.set('dueDateTime', '');
            }
        }
    });
});
