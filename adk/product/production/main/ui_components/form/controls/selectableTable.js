define([
    'backbone',
    'handlebars',
    'main/accessibility/components',
    'main/ui_components/form/controls/commentBox',
    'main/ui_components/form/control/controlService'
], function(
    Backbone,
    Handlebars,
    Accessibility,
    CommentBoxControl,
    ControlService
) {
    'use strict';

    var STRowItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(
            '{{#each columns}}' +
            '<div class="table-cell"><span class="sr-only">{{title}}: </span><span>{{value}}</span></div>' + //data
            '{{/each}}'),
        className: 'table-row',
        attributes: {
            'role': 'option',
            'aria-selected': 'false',
            'aria-describedby': '',
            'tabindex': '0' //we are using a clickable div here instead of a link because JAWS reads a link with role="option" twice
        },
        initialize: function(options) {
            this.field = options.field;
            this.formModel = options.formModel;
            this.parentDescriptionId = this.getOption('descriptionId');
        },
        onRender: function() {
            if (this.formModel.get(this.field.get('name')) && _.isEqual(this.model.attributes, this.formModel.get(this.field.get('name')).attributes)) {
                this.$el
                    .addClass('active')
                    .attr({
                    'aria-selected': 'true',
                    'aria-describedby': this.parentDescriptionId
                });
            }
        },
        serializeModel: function(model) {
            var attributes = model.toJSON();
            return {
                columns: _.map(this.field.get('columns'), function(column) {
                    return _.extend(column, {
                        value: attributes[column.id],
                        title: column.title
                    });
                }),
            };
        },
        events: {
            'click': 'assignModel',
            'keydown': 'handleKeydown'
        },
        handleKeydown: function(e) {
            if(/13|32/.test(e.which)){
                this.assignModel(e);
            }
        },
        assignModel: function(e) {
            e.preventDefault();
            this.formModel.set(this.field.get('name'), this.model);
            this.trigger('click:table:row', this);
        }
    });

    var SelectableTable = ControlService.CompositeViewControl.extend({
        getTemplate: function() {
            function wrapTemplate(template, className) {
                return template ? '<div class="' + className + '">' + template + '</div>' : '';
            }
            var defaultEmptyTemplate = '<p class="top-margin-sm">No {{#if label}}{{label}}{{else}}item{{/if}}s found.</p>';
            var defaultLoadingTemplate = '<p class="top-margin-sm"><i class="fa fa-spinner fa-spin"></i> Loading...</p>';

            return Handlebars.compile(
                '<div class="col-xs-12">' + // container
                '<div id="{{#if id}}{{clean-for-id id}}{{else}}{{clean-for-id name}}{{/if}}" class="faux-table-container">' + // wrapper for control
                '<div class="faux-table">' +
                '<div class="header" aria-hidden="true">' +
                '<div class="table-row">' +
                '{{#each columns}}' +
                '<div class="table-cell"><div>{{title}}</div></div>' +
                '{{/each}}' +
                '</div>' + // header row
                '</div>' + // header (composite's "item view")
                '<div class="body" role="listbox" aria-label="List of selectable options.{{#if label}} Select {{label}}{{/if}}"></div>' + // body (composite's "collection view")
                '</div>' + // faux-table
                wrapTemplate(this.field.get('loadingTemplate') || defaultLoadingTemplate, 'loading') +
                wrapTemplate(this.field.get('emptyTemplate') || defaultEmptyTemplate, 'no-results') +
                '</div>' + // wrapper for control
                '<span id="{{descriptionId}}" class="sr-only" aria-hidden="true">Selected</span>' +
                '</div>'); // container
        },
        ui: {
            'BodyContainer': '.faux-table-container .body',
            'LoadingMessage': '.loading',
            'EmptyMessage': '.no-results'
        },
        requiredFields: ['name', 'collection', 'columns'],
        initialize: function(options) {
            // takes in a collection to generate table (different from other controls)
            if (!(this.field.get('collection') instanceof Backbone.Collection)) {
                this.collection = new Backbone.Collection(this.field.get('collection'));
            } else {
                this.collection = this.field.get('collection') || new Backbone.Collection();
            }
            this.descriptionId = this.cid + "Description";
        },
        templateHelpers: function() {
            return {
                descriptionId: this.descriptionId
            };
        },
        childView: STRowItemView,
        childViewContainer: '@ui.BodyContainer',
        behaviors: _.omit(ControlService.CompositeViewControl.prototype.behaviors, ['ErrorMessages','UpdateConfig']),
        childViewOptions: function() {
            return {
                attributeMapping: this.attributeMapping,
                field: this.field,
                formModel: this.model,
                descriptionId: this.descriptionId
            };
        },
        onChildviewClickTableRow: function(child) {
            if (!child.$el.hasClass('active')) {
                this.children.each(function(view) {
                    view.$el
                        .removeClass('active')
                        .attr({
                            'aria-selected': 'false',
                            'aria-describedby': ''
                        });
                });
                child.$el
                    .addClass('active')
                    .attr({
                        'aria-selected': 'true',
                        'aria-describedby': this.descriptionId
                    });
            }
            var currentString = '';
            _.each(this.field.get('columns'), function(column) {
                currentString = currentString + ' ' + column.title + ': ' + this.model.get(this.field.get('name')).get(column.id);
            }, this);
            this.onUserInput.apply(this, arguments);
        },
        onRender: function() {
            this.toggleEmptyMessage();
        },
        collectionEvents: {
            update: 'toggleEmptyMessage',
            sync: 'toggleEmptyMessage',
            reset: 'toggleEmptyMessage'
        },
        events: _.defaults({
            'control:loading': 'toggleLoadingMessage',
        }, ControlService.CompositeViewControl.prototype.events),
        toggleLoadingMessage: function(e, booleanValue) {
            this.ui.EmptyMessage.toggle(!booleanValue && !this.collection.length);
            this.ui.LoadingMessage.toggle(booleanValue);
        },
        toggleEmptyMessage: function() {
            this.ui.LoadingMessage.hide();
            this.ui.EmptyMessage.toggle(this.field.get('showEmptyMessage') !== false && !this.collection.length);
        }
    });

    return SelectableTable;

});
