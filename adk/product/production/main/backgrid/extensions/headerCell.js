define([
    'backbone',
    '_assets/js/tooltipMappings',
    'backgrid'
], function(Backbone, TooltipMappings) {
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
                    header.sortedSR(header.$el, "desc");
                } else if (column.get('direction') === secondOrder) {
                    collection.trigger(event, col, null);
                    header.$el.attr('aria-sort', 'none');
                    header.sortedSR(header.$el, "none");
                } else {
                    collection.trigger(event, col, firstOrder);
                    header.$el.attr('aria-sort', firstOrder);
                    header.sortedSR(header.$el, "asc");
                }
            }

            function toggleSort(header, col) {
                if (column.get('direction') === firstOrder) {
                    collection.trigger(event, col, secondOrder);
                    header.$el.attr('aria-sort', secondOrder);
                    header.sortedSR(header.$el, "desc");
                } else {
                    collection.trigger(event, col, firstOrder);
                    header.$el.attr('aria-sort', firstOrder);
                    header.sortedSR(header.$el, "asc");
                }
            }

            var sortable = Backgrid.callByNeed(column.sortable(), column, this.collection);
            if (sortable) {
                var sortType = column.get('sortType');
                if (sortType === 'toggle') toggleSort(this, column);
                else cycleSort(this, column);
            }
        },
        sortedSR: function(header, dir) {
            if (header.parent().find('[aria-live]').length < 1) {
                header.parent().prepend('<div aria-live="polite" aria-atomic="true" class="sr-only applet-sorting"></div>');
            }
            var ariaRegion = header.parent().find('[aria-live]');
            if(dir === "asc") {
                ariaRegion.text('Sorted ascending. Press enter to sort descending');
                header.find('.sort-span').text("Sorted ascending. Press enter to sort descending");
            } else if (dir === "desc") {
                ariaRegion.text('Sorted descending. Press enter to sort ascending');
                header.find('.sort-span').text("Sorted descending. Press enter to sort ascending");
            } else {
                ariaRegion.text('Press enter to sort');
                header.find('.sort-span').text("Press enter to sort");
            }
            header.siblings().find('.sort-span').text('Press enter to sort');
        },
        render: function() {
            // Remove the label if we're using a custom header template
            if(this.column.get('headerCellTemplate')){
                this.column.set('label', '');
            }

            HeaderCell.__super__.render.apply(this, arguments);

            if(this.column.get('headerCellTemplate')){
                if(this.column.get('sortable')){
                    this.$('a').prepend(this.column.get('headerCellTemplate'));
                } else {
                    this.$el.append(this.column.get('headerCellTemplate'));
                }
            }

            if (this.column.get('flexWidth')) {
                this.el.className = this.el.className.replace(this.column.get('name'), this.column.get('flexWidth'), 'grid-header-' + this.column.get('name'));
            } else {
                this.el.className = this.el.className.replace(this.column.get('name'), 'grid-header-' + this.column.get('name'));
            }
            if(this.column.get('sortable')) {
                this.$('a').attr({'href': '#', 'role': 'button'}).append('<span class="sr-only sort-span">Press enter to sort</span>');
            } else if (this.column.get('srOnlyLabel')) {
                this.$el.append('<span class="sr-only">' + this.column.get('srOnlyLabel') + '. Not a sortable column</span>');
            }
            this.$el.attr('data-header-instanceid', this.column.get('appletId') + '-' + this.column.get('name'));

            if(this.column.get('hoverTip')) {
                this.$el.attr('tooltip-data-key', this.column.get('hoverTip'));
                this.$('.sort-caret').prepend('<span class="sr-only">( ' + TooltipMappings[this.column.get('hoverTip')] + ' )</span>');
            }

            return this;
        },
    });
    return HeaderCell;
});