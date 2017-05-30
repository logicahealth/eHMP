define([
    'underscore',
    'handlebars'
], function(
    _,
    Handlebars
) {
    "use strict";

    var FilterListItemView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'udaf-tag left-padding-no',
        template: Handlebars.compile(
            '{{#if removable}}<button' +
            ' type="button"' +
            ' title="Press enter to remove {{text}}."{{else}}<span{{/if}}' +
            ' class="clear-udaf-tag btn btn-info btn-filter-item bottom-margin-xs"' +
            '>{{text}}' +
            '{{#if removable}}<i class="fa fa-times-circle left-margin-xs color-white"></i>' +
            '</button>{{else}}</span>{{/if}}'
        ),
        events: {
            'click button': function() {
                this.model.collection.remove(this.model);
            }
        }
    });

    var FilterListView = Backbone.Marionette.CompositeView.extend({
        className: 'container-fluid right-padding-sm left-padding-sm',
        template: Handlebars.compile(
            '<ul class="list-inline bottom-margin-no top-margin-xs udaf" data-flex-width="1"></ul>' +
            '{{#unless isEmpty}}<button class="btn btn-default btn-xs font-size-12 bottom-margin-xs top-margin-xs btn-clear-all remove-all" title="Press enter to remove all filters.">Remove All</button>{{/unless}}'
        ),
        modelEvents: {
            'change:isEmpty': 'render'
        },
        collectionEvents: {
            'update': function() {
                this.model.set('isEmpty', _.isEmpty(this.collection.where({
                    removable: true
                })));
            }
        },
        initialize: function() {
            this.model = new Backbone.Model({
                isEmpty: _.isEmpty(this.collection.where({
                    removable: true
                }))
            });
        },
        childViewContainer: 'ul',
        childView: FilterListItemView,
        behaviors: {
            FlexContainer: {
                direction: 'row',
                alignItems: 'flex-start'
            }
        },
        events: {
            'click button.btn-clear-all': function() {
                this.collection.remove(this.collection.where({
                    removable: true
                }));
            }
        }
    });

    return FilterListView;
});
