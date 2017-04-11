define([
    'backbone',
    'puppetForm',
    'handlebars',
    'main/accessibility/components',
    'main/ui_components/forms/controls/commentBox'
], function(Backbone, PuppetForm, Handlebars, Accessibility) {
    'use strict';

    var STRowItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(
            '<span class="sr-only">{{#if label}}Press enter to set this as the {{label}}.{{else}}Press enter to select this row.{{/if}}</span>' +
            '{{#each columns}}' +
            '<div class="table-cell"><span>{{value}}</span></div>' + //data
            '{{/each}}'),
        tagName: 'a',
        className: 'table-row',
        attributes: {
            'href': '#'
        },
        initialize: function(options) {
            this.field = options.field;
            this.formModel = options.formModel;
        },
        onRender: function() {
            if (this.formModel.get(this.field.get('name')) && _.isEqual(this.model.attributes, this.formModel.get(this.field.get('name')).attributes)) {
                this.$el.addClass('active');
            }
        },
        serializeModel: function(model) {
            var attributes = model.toJSON();
            return {
                columns: _.map(this.field.get('columns'), function(column) {
                    return _.extend(column, {
                        value: attributes[column.id]
                    });
                }),
                label: this.field.get('label')
            };
        },
        events: {
            'click': 'assignModel'
        },
        assignModel: function(e) {
            e.preventDefault();
            this.formModel.set(this.field.get('name'), this.model);
            this.trigger('click:table:row', this);
        }
    });

    var SelectableTablePrototype = {
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
                '<div class="header">' +
                '<div class="table-row">' +
                '{{#each columns}}' +
                '<div class="table-cell"><div>{{title}}</div></div>' +
                '{{/each}}' +
                '</div>' + // header row
                '</div>' + // header (composite's "item view")
                '<div class="body"></div>' + // body (composite's "collection view")
                '</div>' + // faux-table
                wrapTemplate(this.field.get('loadingTemplate') || defaultLoadingTemplate, 'loading') +
                wrapTemplate(this.field.get('emptyTemplate') || defaultEmptyTemplate, 'no-results') +
                '</div>' + // wrapper for control
                '</div>'); // container
        },
        ui: {
            'BodyContainer': '.faux-table-container .body',
            'LoadingMessage': '.loading',
            'EmptyMessage': '.no-results'
        },
        requiredFields: ['name', 'collection', 'columns'],
        initialize: function(options) {
            this.initOptions(options);
            this.hasAllRequiredOptionsDefined();
            this.setAttributeMapping();
            this.setFormatter();
            this.setExtraClasses();
            // takes in a collection to generate table (different from other controls)
            if (!(this.field.get('collection') instanceof Backbone.Collection)) {
                this.collection = new Backbone.Collection(this.field.get('collection'));
            } else {
                this.collection = this.field.get('collection') || new Backbone.Collection();
            }
        },
        childView: STRowItemView,
        childViewContainer: '@ui.BodyContainer',
        childViewOptions: function() {
            return {
                attributeMapping: this.attributeMapping,
                field: this.field,
                formModel: this.model
            };
        },
        onChildviewClickTableRow: function(child) {
            if (!child.$el.hasClass('active')) {
                this.children.each(function(view) {
                    view.$el.removeClass('active');
                });
                child.$el.addClass('active');
            }
            var currentString = '';
            _.each(this.field.get('columns'), function(column) {
                currentString = currentString + ' ' + column.title + ': ' + this.model.get(this.field.get('name')).get(column.id);
            }, this);
            Accessibility.Notification.new({
                type: 'Assertive',
                message: (this.field.get("label") ? this.field.get('label') + ' has been set' : 'Row has been selected') + ' with content of:' + currentString
            });
            this.onUserInput.apply(this, arguments);
        },
        onRender: function() {
            PuppetForm.CommonPrototype.onRender.apply(this);
            this.toggleEmptyMessage();
        },
        collectionEvents: {
            update: 'toggleEmptyMessage',
            sync: 'toggleEmptyMessage',
            reset: 'toggleEmptyMessage'
        },
        events: _.defaults({
            'control:loading': 'toggleLoadingMessage',
        }, PuppetForm.CommonPrototype.events),
        toggleLoadingMessage: function(e, booleanValue) {
            this.ui.EmptyMessage.toggle(!booleanValue && !this.collection.length);
            this.ui.LoadingMessage.toggle(booleanValue);
        },
        toggleEmptyMessage: function() {
            this.ui.LoadingMessage.hide();
            this.ui.EmptyMessage.toggle(this.field.get('showEmptyMessage') !== false && !this.collection.length);
        }
    };

    var SelectableTable = PuppetForm.SelectableTableControl = Backbone.Marionette.CompositeView.extend(
        _.defaults(SelectableTablePrototype, _.defaults(PuppetForm.CommonPrototype, PuppetForm.CommonEventsFunctions))
    );

    return SelectableTable;

});
