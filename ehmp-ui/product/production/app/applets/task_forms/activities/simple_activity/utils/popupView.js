define(['backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/simple_activity/templates/lockedModalTemplate'
], function(Backbone, Marionette, _, Handlebars, LockedModalTemplate) {
    "use strict";

    //Modal view that appears when a task is locked.
    var PopupView = Backbone.Marionette.ItemView.extend({
        tag: 'div',
        template: LockedModalTemplate,
        show: function() {
            this.render();
            this.$el.modal('show');
            $(this.dialog).show();
        },

        hide: function() {
            this.$el.modal('hide');
        },

        focus: function() {
            $(this.dialog).focus();
        },
    });

    return PopupView;
});
