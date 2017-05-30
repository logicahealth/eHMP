define([
    'backbone',
    'marionette',
    'underscore',
    'backgrid',
    'handlebars'
], function(
    Backbone,
    Marionette,
    _,
    Backgrid,
    Handlebars
) {
    'use strict';

    var ImageIndicatorView = Backgrid.Cell.extend({
        className: 'table-cell flex-width-0_5 ',
        render: function() {
            if (this.model.get('hasImages')) {
                this.$el.html('<i class="glyphicon glyphicon-picture"></i>');
            }
            return this;
        }
    });
    return ImageIndicatorView;
});
