define([
    'handlebars',
    'backgrid',
    'backgrid-moment-cell'
], function(Handlebars, backgrid, backgridMomentCell) {
    'use strict';

    //Custom Cells
    Backgrid.HandlebarsCell = Backgrid.Cell.extend({
        className: 'handlebars-cell',
        render: function(modelJSON) {
            this.$el.empty();
            if (_.isString(this.column.get('template'))) {
                this.column.set('template', Handlebars.compile(this.column.get('template')));
            }

            this.$el.html(this.column.get('template')(modelJSON));
            this.delegateEvents();
            return this;
        }
    });

    Backgrid.StringCell = Backgrid.Cell.extend({
        className: 'string-cell',
        render: function(modelJSON) {
            this.$el.empty();

            var string = '';
            var column = this.column.get('name');

            if (_.isString(column)) {
                if (modelJSON) {
                    string = modelJSON[column];
                } else {
                    string = this.model.get(column);
                }
            }
            this.$el.html(Handlebars.Utils.escapeExpression(string));
            this.delegateEvents();
            return this;
        }
    });
});