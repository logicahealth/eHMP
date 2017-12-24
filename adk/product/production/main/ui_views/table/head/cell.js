define([
    'backbone',
    'marionette',
    'handlebars',
], function(Backbone, Marionette, Handlebars) {
    'use strict';

    var TableHeadCell = Backbone.Marionette.ItemView.extend({
        _setFocus: false,
        tagName: 'th',
        className: function() {
            return this.model.get('flexWidth');
        },
        attributes: function() {
            return {
                'id': this.model.get('name') + this.getOption('idSuffix'),
                'aria-sort': this.sortDirectionText,
                'scope': 'col',
                'aria-label': this.model.get('ariaLabel')
            };
        },
        template: Handlebars.compile([
            '{{#if isSortable}}',
            '<button class="btn" type="button">',
            '{{label}}{{#if isSorted}} <i class="fa fa-caret-{{getIconDirection}}" aria-hidden="true"></i>{{/if}}',
            '<span class="sr-only">Sortable Column</span></button>',
            '{{else}}<span>{{label}}</span>{{/if}}'
        ].join('\n')),
        templateHelpers: function() {
            return {
                isSortable: function() {
                    return !_.isEmpty(this.sortKeys);
                },
                isSorted: this.isSortedColumn,
                // these should be the sorted column due to isSorted being true
                getIconDirection: _.isEqual(this.getOption('sortModel').get('direction'), 'asc') ? 'up' : 'down',
            };
        },
        events: {
            'click button': function(event) {
                this._setFocus = true;
                this.triggerMethod('header:cell:click');
            }
        },
        sortModelEvents: {
            'change': function(sortModel, options) {
                var wasSortedColumn = this.isSortedColumn;
                this._setCurrent(sortModel);
                this._setSortDirectionText(sortModel);
                if (!wasSortedColumn && !this.isSortedColumn) {
                    // no need to re-render
                    return;
                }
                this.render();
            }
        },
        onDomRefresh: function() {
            if (this._setFocus) {
                this.$('button').focus();
            }
            this._setFocus = false;
        },
        _setSortDirectionText: function(sortModel) {
            if(this.isSortedColumn) {
                this.sortDirectionText = _.isEqual(sortModel.get('direction'), 'asc') ? 'ascending' : 'descending';
            } else {
                this.sortDirectionText = 'none';
            }
            this.$el.attr('aria-sort', this.sortDirectionText);
        },
        _setCurrent: function(sortModel) {
            this.isSortedColumn = _.isEqual(sortModel.get('key'), this.model.get('name'));
        },
        initialize: function() {
            this.bindEntityEvents(this.getOption('sortModel'), this.sortModelEvents);
            this._setCurrent(this.getOption('sortModel'));
            this._setSortDirectionText(this.getOption('sortModel'));
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.getOption('sortModel'), this.sortModelEvents);
        }
    });
    return TableHeadCell;
});
