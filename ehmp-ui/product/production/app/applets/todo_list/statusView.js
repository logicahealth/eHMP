define(['backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/todo_list/templates/statusModalTemplate'
], function(Backbone, Marionette, _, Handlebars, StatusModalTemplate) {
    "use strict";

    var StatusView = Backbone.Marionette.LayoutView.extend({
        tag: 'div',
        template: StatusModalTemplate,
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

    return StatusView;
});
