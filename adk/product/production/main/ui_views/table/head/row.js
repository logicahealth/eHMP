define([
    'backbone',
    'marionette',
    'main/ui_views/table/head/cell'
], function(Backbone, Marionette, Cell) {
    'use strict';

    // collection is columns
    var TableHead = Backbone.Marionette.CollectionView.extend({
        tagName: 'tr',
        childView: Cell,
        childViewOptions: function() {
            return {
                idSuffix: this.getOption('idSuffix'),
                sortModel: this.getOption('sortModel')
            };
        },
        childEvents: {
            'header:cell:click': 'onColumnSort'
        },
        onColumnSort: function(cell) {
            var targetColumn = cell.model;
            if (!targetColumn.has('sortKeys')) {
                // shouldn't get hit, since cell click should not trigger this function
                return;
            }
            var sortModel = this.getOption('sortModel');
            var target = targetColumn.get('name');
            var dataCollection = this.getOption('dataCollection');
            var wasSortedColumn = (target === sortModel.get('key'));
            sortModel._cycleToDefault = !_.isEqual(sortModel._defaultSortColumn, target);
            if (wasSortedColumn && sortModel._cycleToDefault && sortModel._cycleCount === 2) {
                // cycle finished, need to reset to original sort (empty call resorts to defaults)
                dataCollection.trigger('sort:user');
                sortModel.set(sortModel.defaults);
                return;
            }
            var direction;
            if (wasSortedColumn) {
                var lastDirection = sortModel.get('direction');
                if (lastDirection.length) {
                    direction = (lastDirection === 'asc' ? 'desc' : 'asc');
                }
                sortModel._cycleCount++;
            } else {
                sortModel._cycleCount = 1;
            }
            direction = direction || _.get(targetColumn.get('sortKeys'), 'defaultDirection', 'asc');
            dataCollection.trigger('sort:user', direction, targetColumn.toJSON());
            sortModel.set({ key: target, direction: direction });
        }
    });
    return TableHead;
});
