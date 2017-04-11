define(['backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/todo_list/templates/statusNotCompletedModalTemplate'
], function(Backbone, Marionette, _, Handlebars, StatusNotCompletedModalTemplate) {
    "use strict";

    var StatusNotCompletedView = Backbone.Marionette.LayoutView.extend({
        tag: 'div',
        template: StatusNotCompletedModalTemplate,
        closeBtn: function(e) {
            e.preventDefault();
            this.hide();
        },


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

    return StatusNotCompletedView;
});
