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
        behaviors: {
            QuickMenu: {},
            Actions: {}
        },
        tagName: 'tr',
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
            var tileOptions = this.getOption('tileOptions', {});
            var primaryAction = _.result(tileOptions, 'primaryAction', true);
            if (primaryAction) {
                if (!_.result(primaryAction, 'enabled', true)) return;
                var onClick = _.get(primaryAction, 'onClick');
                if (onClick) {
                    return onClick.call(this, {
                        model: this.model,
                        collection: _.get(this, 'model.collection'),
                        $el: this.$('.dropdown--quickmenu > button')
                    }, event);
                }
            } else {
                return;
            }
            _.get(this, 'options.onClickRow', _.noop)(this.model, this);
        }
    });

    return TableBodyRow;
});