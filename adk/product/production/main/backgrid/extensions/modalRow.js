define([
    'backbone',
    'backgrid'
], function(Backbone) {
    'use strict';
    var ModelRow = Backgrid.Row.extend({
        className: "selectable",
        attributes: {
            'tabindex': '0',
            'title': 'Press enter to view additional details'
        },
        render: function() {
            ModelRow.__super__.render.apply(this, arguments);
            this.$el.data('model', this.model);
            var id = this.model.get('id') || this.model.get('uid');
            if (id) {
                this.$el.attr('data-row-instanceid', id.replace(/:/g, '-').replace(/;/g, '-').replace(/\./g, '-'));
            }
            return this;
        },
        events: {
            //'keydown': 'clickRow'
        },
        clickRow: function(event) {
            if (event.which == 13) {
            }
        }
    });
    return ModelRow;
});
