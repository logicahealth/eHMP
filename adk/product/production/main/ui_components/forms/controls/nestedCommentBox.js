define([
    'backbone',
    'puppetForm',
    'handlebars',
    'main/ui_components/forms/controls/commentBox'
], function(Backbone, PuppetForm, Handlebars) {
    'use strict';

    var NCBShowCommentButtonItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{#if comments.models}}<button type="button" class="btn btn-icon show-comments-button" ' +
            'aria-exanded="true" title="Press enter to view comments">' +
            '<i class="fa fa-file-text"><span class="sr-only">Press enter to expand or collapse the comments for this row</span></i></button>' +
            '{{else}}<button type="button" aria-expanded="false" class="btn btn-icon bottom-margin-xs all-padding-no show-comments-button" title="Press enter to add a comment">Add</button>{{/if}}'
        ].join('\n')),
        initialize: function(options) {
            this.attributeMapping = options.attributeMapping;
            this.listenTo(this.model.get(this.attributeMapping.commentsCollection), 'add remove', this.render);
        },
        ui: {
            'ShowCommentsButton': '.show-comments-button'
        },
        events: {
            'click @ui.ShowCommentsButton': 'toggleComments'
        },
        toggleComments: function(e) {
            e.preventDefault();
            this.triggerMethod('toggle:comments');
        },
        serializeModel: function(model) {
            var attributes = model.toJSON(),
                data = {
                    comments: attributes[this.attributeMapping.commentsCollection]
                };
            return data;
        }
    });

    var NCBDescriptiveTextItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{label}}'
        ].join('\n')),
        initialize: function(options) {
            this.attributeMapping = options.attributeMapping;
            this.field = options.field;
        },
        serializeModel: function(model) {
            var attributes = model.toJSON();
            var data = {
                value: attributes[this.attributeMapping.value],
                label: attributes[this.attributeMapping.label]
            };
            return data;
        },
        tagName: 'span'

    });

    var NCBRemoveButtonItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            // '{{ui-button "" classes="btn btn-icon remove-panel-button" type="button" icon="fa-times"}}'
            '<button type="button" class="btn btn-link btn-block all-padding-no remove-panel-button color-red-dark" title="Press enter to remove this item">Remove</button>'
        ].join('\n')),
        ui: {
            'RemoveButton': '.remove-panel-button'
        },
        events: {
            'click @ui.RemoveButton': function(e) {
                e.preventDefault();
                this.triggerMethod('remove:panel');
            }
        }
    });

    var NCBPanelView = Backbone.Marionette.LayoutView.extend({
        defaults: {
            additionalColumns: []
        },
        ui: {
            'NCBCommentContainerRegion': '.ncb-comment-container-region',
            'NCBShowCommentsButtonRegion': '.ncb-show-comment-button-region',
            'NCBDescriptiveTextRegion': '.ncb-descriptive-text-region',
            'NCBCommentCollapseContainer': '.ncb-comment-collapse-container',
            'NCBRemoveButtonRegion': '.ncb-remove-button-region'
        },
        regions: {
            'NCBCommentContainerRegion': '@ui.NCBCommentContainerRegion',
            'NCBShowCommentsButtonRegion': '@ui.NCBShowCommentsButtonRegion',
            'NCBDescriptiveTextRegion': '@ui.NCBDescriptiveTextRegion',
            'NCBRemoveButtonRegion': '@ui.NCBRemoveButtonRegion'
        },
        template: Handlebars.compile([
            '{{#if value}}' +
            '<div class="panel-heading">',
            '<div class="panel-title">',
            '<div class="sr-only"><span>This list represents the summary of your selections that contains available options such as adding and viewing comments.</span></div>',
            '<div class="table-cell ncb-descriptive-text-region{{#each itemColumn.columnClasses}} {{this}}{{/each}}"></div>',
            '<div class="table-cell ncb-show-comment-button-region{{#each commentColumn.columnClasses}} {{this}}{{/each}}"></div>',
            '{{#each additionalColumns}}' +
            '<div class="table-cell {{clean-for-id columnTitle}}-region{{#each columnClasses}} {{this}}{{/each}}"></div>' +
            '{{/each}}' +
            '<div class="table-cell ncb-remove-button-region pixel-width-45 all-padding-no"></div>',
            '</div>',
            '</div>',
            '<div class="ncb-comment-collapse-container panel-collapse collapse" role="tabpanel" aria-expanded="true"><div class="ncb-comment-container-region panel-body top-padding-no bottom-padding-no"></div></div>' +
            '{{/if}}'
        ].join("\n")),
        className: 'panel panel-default ncb-row-item',
        attributes: {
            role: "tab"
        },
        events: {
            'click:additional:comment:button': function(e) {
                e.stopPropagation();
                this.toggleCommentsContainer();
            }
        },
        childEvents: {
            'toggle:comments': function(child) {
                var self = this;
                this.ui.NCBCommentCollapseContainer.one('shown.bs.collapse', function() {
                    if (child.model.get(self.attributeMapping.commentsCollection).length === 0) {
                        self.commentView.$el.find('input').focus();
                    }
                });
                this.ui.NCBCommentCollapseContainer.one('hidden.bs.collapse', function() {
                    self.ui.NCBCommentCollapseContainer.off('shown.bs.collapse');
                });
                this.toggleCommentsContainer();
            },
            'remove:panel': function(child) {
                this.$el.trigger('ncb.change.user.input');
                this.model.set(this.attributeMapping.value, false);
                this.formModel.trigger('change', this.formModel);
                this.parent.setFocusNextRow(this);
            }
        },
        toggleCommentsContainer: function() {
            this.ui.NCBShowCommentsButtonRegion.find('.show-comments-button').focus();
            this.ui.NCBCommentCollapseContainer.collapse('toggle');
        },
        initialize: function(options) {
            this.parent = options.parent;
            this.formModel = options.formModel;
            this.attributeMapping = options.attributeMapping;
            this.field = options.field;

            this.field.set('additionalAddCommentButton', {
                label: "Close"
            }, {
                silent: true
            });
            if (!this.model.get(this.attributeMapping.commentsCollection)) {
                this.model.set(this.attributeMapping.commentsCollection, new Backbone.Collection());
            }
            this.commentsCollection = this.model.get(this.attributeMapping.commentsCollection);
            this.commentView = new PuppetForm.CommentBoxControl({
                attributeMapping: this.attributeMapping,
                collection: this.commentsCollection,
                formModel: this.formModel,
                field: this.field,
                model: this.model
            });
            this.showCommentButtonView = new NCBShowCommentButtonItemView({
                attributeMapping: this.attributeMapping,
                model: this.model
            });
            this.descriptiveTextView = new NCBDescriptiveTextItemView({
                attributeMapping: this.attributeMapping,
                model: this.model
            });
            _.each(this.field.get('additionalColumns'), function(column) {
                column.columnTitle = column.columnTitle || "";
                var id = column.columnTitle.replace(/[^A-Z0-9]+/ig, "-");
                this.addRegion(id + 'Region', '.' + id + '-region');

                var Control = PuppetForm.resolveNameToClass(column.control, 'Control').extend({
                    getSelectedLabelFromDOM: null
                });
                this[id + 'View'] = new Control({
                    field: new PuppetForm.Field(_.defaults({
                        prependToDomId: this.model.get(this.attributeMapping.unique) + '-'
                    }, column), this),
                    model: this.model
                });
            }, this);
            this.removeButtonView = new NCBRemoveButtonItemView();

            this.listenTo(this.commentsCollection, 'change add remove', function() {
                this.model.trigger('change', this.model);
            });
            this.listenTo(this.model, 'change.inputted', function() {
                this.$el.trigger('ncb.change.user.input');
            });
        },
        onRender: function() {
            if (this.model.get(this.attributeMapping.value)) {
                this.showChildView('NCBCommentContainerRegion', this.commentView);
                this.showChildView('NCBShowCommentsButtonRegion', this.showCommentButtonView);
                this.showChildView('NCBDescriptiveTextRegion', this.descriptiveTextView);
                _.each(this.field.get('additionalColumns'), function(column) {
                    column.columnTitle = column.columnTitle || "";
                    var id = column.columnTitle.replace(/[^A-Z0-9]+/ig, "-");
                    this.showChildView(id + 'Region', this[id + 'View']);
                }, this);
                this.showChildView('NCBRemoveButtonRegion', this.removeButtonView);
            }
        },
        serializeModel: function(model) {
            var attributes = model.toJSON(),
                data = {
                    itemColumn: this.field.get(this.attributeMapping.itemColumn),
                    commentColumn: this.field.get(this.attributeMapping.commentColumn),
                    additionalColumns: this.field.get(this.attributeMapping.additionalColumns),
                    unique: attributes[this.attributeMapping.unique],
                    value: attributes[this.attributeMapping.value],
                    label: attributes[this.attributeMapping.label],
                    comments: attributes[this.attributeMapping.commentsCollection]
                };
            return data;
        },
        onDestroy: function() {
            this.ui.NCBCommentCollapseContainer.off();
        }
    });

    var NCBBodyView = Backbone.Marionette.CollectionView.extend({
        childView: NCBPanelView,
        addChild: function(child, ChildView, index) {
            if (child.get(this.attributeMapping.value) && _.isBoolean(child.get(this.attributeMapping.value))) {
                Marionette.CollectionView.prototype.addChild.apply(this, arguments);
            }
        },
        setFocusNextRow: function(child) {
            // the child passed in has now been deleted, so it's index would represent the next row
            if (!_.isUndefined(child._index) && child._index === this.children.length) {
                this.parent.setFocusNextRow(this);
            } else if (!_.isUndefined(child._index) && this.children.length > child._index) {
                var nextRowView = this.children.findByIndex(child._index);
                nextRowView.ui.NCBRemoveButtonRegion.find('button').focus();
            }
        },
        childViewOptions: function() {
            return {
                attributeMapping: this.attributeMapping,
                formModel: this.formModel,
                field: this.field,
                parent: this
            };
        },
        buildCollection: function(faux_collection, collection) {
            var self = this;
            _.each(faux_collection.models, function(model) {
                if (model._changing) {
                    if (model.attributes[self.attributeMapping.value]) {
                        collection.add(model);
                    } else {
                        collection.remove(model);
                    }
                }
            });
            return collection;
        },
        initialize: function(options) {
            this.parent = options.parent;
            this.collection = new Backbone.Collection();
            this.formModel = options.formModel;
            this.attributeMapping = options.attributeMapping;
            this.field = options.field;
            this.faux_collection = this.model.get(this.attributeMapping.collection);
            var self = this;
            _.each(this.faux_collection.models, function(model) {
                if (model.attributes[self.attributeMapping.value]) {
                    self.collection.add(model);
                }
            });
            this.listenTo(this.faux_collection, 'change', function() {
                self.model.trigger('change', self.model);
            });
            this.listenTo(this.faux_collection, 'change:' + this.attributeMapping.value, function() {
                this.buildCollection(this.faux_collection, this.collection);
            });
        },
        className: 'panel-container',
        attributes: {
            role: "tab"
        },
        onRemoveChild: function() {
            if (this.children.length < 1) {
                this.parent.setIsEmpty();
            }
            this.parent.rowAddedOrRemoved();
        },
        onAddChild: function() {
            if (this.children.length < 2) {
                this.parent.setIsEmpty();
            }
            this.parent.rowAddedOrRemoved();
        }
    });

    var EmptyView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{#if isEmpty}}<div class="panel-group accordion-container small ftar">',
            '<div class="panel-container"><div class="panel panel-default">',
            '<div class="panel-heading"><div class="panel-title">',
            '<p class="ncb-empty-message top-padding-xs left-padding-sm bottom-padding-xs" aria-hidden="true">No items selected</p>',
            '<p class="ncb-empty-message-sr-only sr-only" tabindex="-1">No items selected</p>',
            '</div></div></div></div></div>{{/if}}'
        ].join('\n')),
        ui: {
            'EmptyMessageText': '.ncb-empty-message-sr-only'
        },
        initialize: function(options) {
            this.field = options.field;
            this.attributeMapping = options.attributeMapping;
            this.listenTo(this.model, 'change:isEmpty', this.render);
        },
        serializeModel: function(model) {
            var attributes = model.toJSON();
            var data = _.defaults({
                itemColumn: this.field.get(this.attributeMapping.itemColumn)
            }, attributes);
            return data;
        }
    });

    var NCBBodyCollectionView = Backbone.Marionette.CollectionView.extend({
        childView: NCBBodyView,
        childViewOptions: function() {
            return {
                attributeMapping: this.attributeMapping,
                formModel: this.model,
                field: this.field,
                parent: this
            };
        },
        initialize: function(options) {
            this.attributeMapping = options.attributeMapping;
            this.field = options.field;
            this.emptyModel = options.emptyModel;
            this.parent = options.parent;
        },
        onRender: function() {
            this.setIsEmpty();
        },
        setIsEmpty: function() {
            var childrenAreEmpty = this.isChildrenEmpty();
            if (childrenAreEmpty && !this.emptyModel.get('isEmpty')) {
                this.emptyModel.set('isEmpty', true);
            } else if (!childrenAreEmpty && this.emptyModel.get('isEmpty')) {
                this.emptyModel.set('isEmpty', false);
            }
        },
        isChildrenEmpty: function() {
            return this.children.every(function(child) {
                return (child && child.children && child.children.length < 1);
            });
        },
        getNonEmptyChildrenCount: function(selectedChild) {
            var nonEmptyIndex = 0;
            var nonEmptyCount = 0;
            if (this.children) {
                this.children.each(function(child) {
                    child.nonEmptyIndex = null;
                    if (child.children.length > 0) {
                        child.nonEmptyIndex = nonEmptyIndex;
                        nonEmptyIndex++;
                        nonEmptyCount++;
                    } else if (child == selectedChild) {
                        // child is empty but needs to keep index relative to others
                        child.nonEmptyIndex = nonEmptyIndex;
                        nonEmptyIndex++;
                    }
                });
            }
            return nonEmptyCount;
        },
        unsetNonEmptyIndex: function() {
            if (this.children) {
                this.children.each(function(child) {
                    child.nonEmptyIndex = null;
                });
            }
        },
        setFocusNextRow: function(child) {
            var nonEmptyChildrenCount = this.getNonEmptyChildrenCount(child);
            // this is only getting called because the last child in the originating
            // collection was removed, so we need to check if there is a non-empty
            // collection after the one clicked and set focus to the first child in that.
            if (nonEmptyChildrenCount > 0) {
                var nextRowView;
                // must NOT be completely empty
                if ((nonEmptyChildrenCount > (child.nonEmptyIndex + 1) && child.children.length > 0) || (nonEmptyChildrenCount > child.nonEmptyIndex && child.children.length === 0)) {
                    // there is a child after this child collection
                    // There should be another child after this one
                    var nextChild = this.children.find(function(item) {
                        return item.nonEmptyIndex == (child.nonEmptyIndex + 1);
                    });
                    nextRowView = nextChild.children.findByIndex(0);
                } else {
                    // must be the last non-empty child
                    if (child.children.length === 0) {
                        // must have been last child in child collection
                        // That child should be empty, but there should be more non-empty children above!
                        var previousChild = this.children.find(function(item) {
                            return item.nonEmptyIndex == (child.nonEmptyIndex - 1);
                        });
                        nextRowView = previousChild.children.findByIndex(previousChild.children.length - 1);
                    } else {
                        // must be other children in originating child collection, but is the last one
                        // That child should have more of its own children other than the one clicked!
                        nextRowView = child.children.findByIndex(child.children.length - 1);
                    }
                }
                if (nextRowView) {
                    nextRowView.ui.NCBRemoveButtonRegion.find('button').focus();
                }
            } else {
                // must be completely empty, set focus to empty view text
                this.parent.emptyBodyView.ui.EmptyMessageText.focus();
            }
            this.unsetNonEmptyIndex();
        },
        rowAddedOrRemoved: function() {
            this.$('.panel-default.ncb-row-item').filter(':even:not(.odd)').addClass('odd');
            this.$('.panel-default.ncb-row-item').filter(':odd.odd').removeClass('odd');
        }
    });

    var NestedCommentBoxPrototype = {
        template: Handlebars.compile([
            '<div class="main-header ncb-header-region">',
            '<div class="table-cell{{#each itemColumn.columnClasses}} {{this}}{{/each}}"><span>{{itemColumn.columnTitle}}</span></div>',
            '<div class="table-cell{{#each commentColumn.columnClasses}} {{this}}{{/each}}"><span>{{commentColumn.columnTitle}}</span></div>',
            '{{#each additionalColumns}}' +
            '<div class="table-cell{{#each columnClasses}} {{this}}{{/each}}"><span>{{columnTitle}}</span></div>' +
            '{{/each}}',
            '<div class="table-cell pixel-width-45"></div>',
            '</div>',
            '<div class="empty-view-region"></div>',
            '<div class="panel-group accordion-container small ftar ncb-body-region" ' +
            'aria-multiselectable="true" role="tablist"></div>'
        ].join("\n")),
        className: function() {
            return PuppetForm.CommonPrototype.className() + ' ftar-container';
        },
        ui: {
            'NCBBodyCollectionRegion': '.ncb-body-region',
            'NCBEmptyViewRegion': '.empty-view-region'
        },
        events: _.defaults({
            'ncb.change.user.input': function(event) {
                event.stopPropagation();
                this.onUserInput.apply(this, arguments);
            }
        }, PuppetForm.CommonPrototype.events),
        regions: {
            'NCBBodyCollectionRegion': '@ui.NCBBodyCollectionRegion',
            'NCBEmptyViewRegion': '@ui.NCBEmptyViewRegion'
        },
        attributeMappingDefaults: {
            unique: 'id',
            value: 'value',
            label: 'label',
            collection: 'listItems',
            commentsCollection: 'comments',
            comment: 'comment',
            author: 'author',
            timeStamp: 'timeStamp',
            additionalColumns: 'additionalColumns',
            itemColumn: 'itemColumn',
            commentColumn: 'commentColumn'
        },
        initialize: function(options) {
            this.initOptions(options);
            this.setAttributeMapping();
            this.setFormatter();
            this.setExtraClasses();
            this.initCollection('collection');
            this.listenToFieldName();

            var name = this.getComponentInstanceName();
            this.stopListening(this.model, "change:" + name, this.onModelChange);
            this.model.set(name, this.collection);
            this.listenTo(this.model, "change:" + name, this.onModelChange);

            this.listenTo(this.collection, 'change', function() {
                this.model.trigger('change', this.model);
            });
            this.emptyModel = new Backbone.Model({
                isEmpty: false
            });
            this.emptyBodyView = new EmptyView({
                model: this.emptyModel,
                attributeMapping: this.attributeMapping,
                field: this.field
            });
            this.bodyCollectionView = new NCBBodyCollectionView({
                model: this.model,
                collection: this.collection,
                attributeMapping: this.attributeMapping,
                field: this.field,
                emptyModel: this.emptyModel,
                parent: this
            });
        },
        commonOnRender: PuppetForm.CommonPrototype.onRender,
        onRender: function() {
            this.commonOnRender();
            this.showChildView('NCBEmptyViewRegion', this.emptyBodyView);
            this.showChildView('NCBBodyCollectionRegion', this.bodyCollectionView);
        }
    };

    var NestedCommentBox = PuppetForm.NestedCommentBoxControl = Backbone.Marionette.LayoutView.extend(
        _.defaults(NestedCommentBoxPrototype, _.defaults(PuppetForm.CommonPrototype, PuppetForm.CommonEventsFunctions))
    );

    return NestedCommentBox;

});
