define([
    'backbone',
    'marionette',
    'handlebars',
    'main/ui_views/table/body/cell'
], function(Backbone, Marionette, Handlebars, Cell) {
    'use strict';

    var ENTER_KEY = 13;
    var SPACE_KEY = 32;

    var TableBodyRow = Backbone.Marionette.CollectionView.extend({
        tagName: 'tr',
        attributes: {
            tabIndex: 0
        },
        childView: Cell,
        events: {
            'click': 'onClickRow',
            'keydown': 'onClickRow'
        },
        childViewOptions: function() {
            return {
                dataModel: this.model,
                idSuffix: this.getOption('idSuffix'),
                helpers: this.getOption('helpers'),
                groupId: this.getOption('groupId')
            };
        },
        onClickRow: function(event) {
            if (_.has(event, 'keyCode') && (event.keyCode !== ENTER_KEY && event.keyCode !== SPACE_KEY)) {
                return;
            }
            _.get(this, 'options.onClickRow', _.noop)(this.model, this);
        }
    });

    return TableBodyRow;
});
