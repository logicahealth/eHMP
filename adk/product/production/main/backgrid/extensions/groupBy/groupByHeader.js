define([
    'backbone',
    'backgrid',
    "main/backgrid/extensions/headerCell"
], function(Backbone, Backgrid, HeaderCell) {
    "use strict";

    _.each(["groupable"], function (key) {
        Backgrid.Column.prototype[key] = function () {
            var value = this.get(key);
            if (_.isString(value)) return this[value];
            else if (_.isFunction(value)) return value;
            return !!value;
        };
    });

    var GroupByHeader = HeaderCell.extend({

        initialize: function (options) {
            this._super = HeaderCell.prototype;
            this._super.initialize.apply(this, arguments);

            //if we're groupable, then reuse the sortable functionality for the LAF.
            if (Backgrid.callByNeed(this.column.groupable(), this.column, this.collection)) {
                this.$el.addClass("sortable");
            }
        },
        removeCellDirection: function() {
            this.$el.attr('aria-sort', 'none');
            this.column.set("direction", null);
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
        onClick: function(e) {
            e.preventDefault();
            var self = this;
            var column = this.column;
            var collection = this.collection;
            var event = "backgrid:groupBy";
            function cycleDirectionIndicator(header, col) {
                if (column.get("direction") === "ascending") {
                    collection.trigger(event, col, "descending");
                    header.$el.attr('aria-sort', "descending");
                    self.sortedSR(header.$el, "desc");
                }
                else if (column.get("direction") === "descending") {
                    collection.trigger(event, col, null);
                    header.$el.attr('aria-sort', 'none');
                    self.sortedSR(header.$el, "none");
                }
                else {
                    collection.trigger(event, col, "ascending");
                    header.$el.attr('aria-sort', "ascending");
                    self.sortedSR(header.$el, "asc");
                }
            }
            function toggleSort(header, col) {
                if (column.get("direction") === "ascending") {
                    collection.trigger(event, col, "descending");
                    header.$el.attr('aria-sort', "descending");
                    self.sortedSR(header.$el, "desc");
                }
                else {
                    collection.trigger(event, col, "ascending");
                    header.$el.attr('aria-sort', "ascending");
                    self.sortedSR(header.$el, "asc");
                }
            }
            var groupable = Backgrid.callByNeed(column.groupable(), column, collection);
            if (groupable) {
                var sortType = column.get("sortType");
                if (sortType === "toggle") toggleSort(this, column);
                else cycleDirectionIndicator(this, column);
            }
        }

    });

    return GroupByHeader;

});
