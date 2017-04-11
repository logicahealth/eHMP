define([
    'backbone',
    'backgrid'
], function(Backbone) {
    'use strict';
    var HeaderCell = Backgrid.HeaderCell.extend({
        attributes: {
            'scope': 'col',
            'aria-sort': 'none',
            'role': 'columnheader'
        },
        removeCellDirection: function() {
            this.$el.attr('aria-sort', 'none');
            this.column.set("direction", null);
        },
        onClick: function(e) {
            e.preventDefault();

            var column = this.column;
            var collection = this.collection;
            var event = 'backgrid:sort';

            var firstOrder = 'ascending';
            var secondOrder = 'descending';

            if (this.column.get('type') === 'date') {
                firstOrder = 'descending';
                secondOrder = 'ascending';
            }

            function cycleSort(header, col) {
                if (column.get('direction') === firstOrder) {
                    collection.trigger(event, col, secondOrder);
                    header.$el.attr('aria-sort', secondOrder);
                } else if (column.get('direction') === secondOrder) {
                    collection.trigger(event, col, null);
                    header.$el.attr('aria-sort', 'none');
                } else {
                    collection.trigger(event, col, firstOrder);
                    header.$el.attr('aria-sort', firstOrder);
                }
            }

            function toggleSort(header, col) {
                if (column.get('direction') === firstOrder) {
                    collection.trigger(event, col, secondOrder);
                    header.$el.attr('aria-sort', secondOrder);
                } else {
                    collection.trigger(event, col, firstOrder);
                    header.$el.attr('aria-sort', firstOrder);
                }
            }

            var sortable = Backgrid.callByNeed(column.sortable(), column, this.collection);
            if (sortable) {
                var sortType = column.get('sortType');
                if (sortType === 'toggle') toggleSort(this, column);
                else cycleSort(this, column);
            }
        },
        render: function() {
            HeaderCell.__super__.render.apply(this, arguments);
            if (this.column.get('flexWidth')) {
                this.el.className = this.el.className.replace(this.column.get('name'), this.column.get('flexWidth'), 'grid-header-' + this.column.get('name'));
            } else {
                this.el.className = this.el.className.replace(this.column.get('name'), 'grid-header-' + this.column.get('name'));
            }
            if(this.column.get('sortable')) {
                this.$('a').attr({'href': '#', 'role': 'button'}).append('<span class="sr-only">Press enter to sort.</span>');
            } else if (this.column.get('srOnlyLabel')) {
                this.$el.append('<span class="sr-only">' + this.column.get('srOnlyLabel') + '. Not a sortable column</span>');
            }
            this.$el.attr('data-header-instanceid', this.column.get('appletId') + '-' + this.column.get('name'));
            return this;
        },
    });
    return HeaderCell;
});