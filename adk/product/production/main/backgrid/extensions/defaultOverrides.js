define([
    'handlebars',
    'backgrid',
    'backgrid-moment-cell',
    'main/backgrid/extensions/screenReaderCell'
], function(Handlebars, backgrid, backgridMomentCell, screenReaderCell) {
    'use strict';

    //Custom Cells
    Backgrid.HandlebarsCell = Backgrid.Cell.extend({
        className: 'handlebars-cell',
        render: function() {
            this.$el.empty();
            // todo: temporarily commenting this out to fix the build
            //screenReaderCell.setTemplateWithScreenReaderText(this);

            if (_.isString(this.column.get('template'))) {
                this.column.set('template', Handlebars.compile(this.column.get('template')));
            }

            this.$el.html(this.column.get('template')(this.model.toJSON()));
            this.delegateEvents();
            return this;
        }
    });
});