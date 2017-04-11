define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/common/templates/nameStatus_Template'
    ], function(Backbone, Marionette, _, Handlebars, nameStatusTemplate) {
        'use strict';
        return Backbone.Marionette.ItemView.extend({
            template: nameStatusTemplate,
            onRender: function(){
                this.$el.find('[data-toggle="tooltip"]').tooltip();
            },
            onDestroy: function(){
                this.$el.find('[data-toggle="tooltip"]').tooltip('destroy');
            },
            behaviors: {
                Tooltip: {}
            }

        });
    });