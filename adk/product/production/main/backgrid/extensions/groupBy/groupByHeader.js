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
        onClick: function(e) {
            e.preventDefault();
            var column = this.column;
            var collection = this.collection;
            var event = "backgrid:groupBy";
            if (Backbone.PageableCollection && this.collection instanceof Backbone.PageableCollection) {
                if (collection.state.pageSize < this.collection.fullCollection.length) {
                    collection.state.pageSize = this.collection.fullCollection.length;
                    collection.reset(this.collection.fullCollection.models,{silent:true});
                } 
            }
            function cycleDirectionIndicator(header, col) {
                if (column.get("direction") === "ascending") {
                    collection.trigger(event, col, "descending");
                    header.$el.attr('aria-sort', "descending");
                }
                else if (column.get("direction") === "descending") {
                    collection.trigger(event, col, null);
                    header.$el.attr('aria-sort', 'none');
                }
                else {
                    collection.trigger(event, col, "ascending");
                    header.$el.attr('aria-sort', "ascending");
                }
            }
            function toggleSort(header, col) {
                if (column.get("direction") === "ascending") {
                    collection.trigger(event, col, "descending");
                    header.$el.attr('aria-sort', "descending");
                }
                else {
                    collection.trigger(event, col, "ascending");
                    header.$el.attr('aria-sort', "ascending");
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