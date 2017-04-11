/**
 * Created by alexluong on 12/21/15.
 */

define([
    'backbone',
    'puppetForm',
    'handlebars',
    'api/UserService'
], function(Backbone, PuppetForm, Handlebars, UserService) {
    'use strict';

    var NoChildrenView = Marionette.ItemView.extend({
        tagName: 'p',
        template: Handlebars.compile('No results.')
    });

    var ErrorView = Backbone.Marionette.ItemView.extend({
        tagName: 'p',
        getTemplate: function() {
            return Handlebars.compile(JSON.parse(this.options.error).message);
        }
    });

    // tree root that renders recursive tree for each item in collection
    var TreeView = Backbone.Marionette.CollectionView.extend({
        className: 'tree',
        tagName: 'ul',
        hasChildren: function(item) {
            return item.get(this.options.attributeMapping.href) || item.get('nodes');
        },
        getChildView: function(item) {
            return this.hasChildren(item) ? TreeNodeView : TreeLeafView;
        },
        childViewOptions: function() {
            return {
                collection: this.options.collection,
                formModel: this.options.formModel,
                name: this.options.name,
                itemTemplate: this.options.itemTemplate,
                attributeMapping: this.options.attributeMapping,
                hasChildren: this.hasChildren,
                selectableNodes: this.options.selectableNodes,
                childViewOptions: this.childViewOptions  // pass further down into additional child nodes and leaves
            };
        },
        emptyView: NoChildrenView,
        onAttach: function() {
            if (this.options.treeType === 'full') {
                this.$('.tree-node').children('.tree').slideUp(0);
            }
        }
    });

    var TreeNodeView = Backbone.Marionette.CompositeView.extend({
        className: 'tree-node',
        tagName: 'li',
        childViewContainer: 'ul',
        getTemplate: function() {
            if (this.options.itemTemplate) {
                return Handlebars.compile('<span>'+this.options.itemTemplate+'</span><ul class="tree"></ul>');
            }
            return Handlebars.compile('<span>{{'+this.options.attributeMapping.treeItemDescription+'}}</span><ul class="tree"></ul>');
        },
        initialize: function(options) {
            if (this.model.get('nodes')) {
                this.collection = this.model.get('nodes');
            } else {
                var parsedCollectionModel = this.options.collection.model;
                var FetchedTreeNodeCollection = Backbone.Collection.extend({
                    model: parsedCollectionModel,
                    url: this.model.get(options.attributeMapping.href)+'&site='+UserService.getUserSession().get('site')
                });
                this.collection = new FetchedTreeNodeCollection();
                this.model.set('nodes', this.collection);
            }

            this.hasChildren = options.hasChildren;
            this.childViewOptions = options.childViewOptions;

            this.loadingView = ADK.Views.Loading.create();
            this.loadingView.render();

            if (options.selectableNodes) {
                this.$el.addClass('selectable');
            }
        },
        getChildView: function(child) {
            return this.hasChildren(child) ? TreeNodeView : TreeLeafView;
        },
        collectionEvents: {
            request: function() {
                this.$el.append(this.loadingView.$el);
            },
            sync: function() {
                this.loadingView.$el.remove();
                this.$el.toggleClass('expanded');
            }
        },
        attributes: {
            tabIndex: 0
        },
        events: {
            'keyup': 'processKey',
            'click': 'toggleNode',
            'click span': 'selectNode'
        },
        processKey: function(e) {
            if (e.which === 13) {  // enter key
                if (this.options.selectableNodes) {
                    this.selectNode(e);
                }
                this.toggleNode(e);
            }
        },
        toggleNode: function(e) {
            e.preventDefault();
            e.stopPropagation();

            var nodes = this.model.get('nodes');
            if (nodes.length > 0) {
                this.$('> ul').slideToggle('fast');
                this.$el.toggleClass('expanded');
            } else {
                nodes.fetch();
            }
        },
        selectNode: function(e) {
            if (this.options.selectableNodes) {
                e.preventDefault();
                e.stopPropagation();

                $('.tree .tree-node').not(this).removeClass('selected');
                $('.tree .tree-leaf').removeClass('selected');
                this.$el.addClass('selected');

                this.options.formModel.set(this.options.name, this.model);
            }
        }
    });

    var TreeLeafView = Backbone.Marionette.ItemView.extend({
        className: 'tree-leaf',
        tagName: 'li',
        getTemplate: function() {  // todo: figure out how to fully use Handlebars templating instead of passing in data value
            if (this.options.itemTemplate) {
                return Handlebars.compile('<span>'+this.options.itemTemplate+'</span>');
            }
            return Handlebars.compile('<span>{{'+this.options.attributeMapping.treeItemDescription+'}}</span>');
        },
        attributes: {
            tabIndex: 0
        },
        events: {
            'click span': 'selectLeaf',
            'keyup': 'processKey'
        },
        processKey: function(e) {
            if (e.which === 13) {
                this.selectLeaf(e);
            }
        },
        selectLeaf: function(e) {
            e.preventDefault();
            e.stopPropagation();

            $('.tree .tree-node').removeClass('selected');
            $('.tree .tree-leaf').not(this).removeClass('selected');
            this.$el.addClass('selected');

            this.options.formModel.set(this.options.name, this.model);
        }
    });

    var TreepickerPrototype = {
        defaults: {
            label: '',
            extraClasses: [],
            srOnlyLabel: false
        },
        attributeMappingDefaults: {
            treeItemDescription: 'description',
            treeItemNodes: 'nodes',
            href: 'href'
        },
        template: Handlebars.compile('{{ui-form-label (add-required-indicator label required) forID=(clean-for-id name) classes=(is-sr-only-label srOnlyLabel)}}<div class="tree-region col-xs-12"'+'></div>'),
        className: function() {
            return PuppetForm.CommonPrototype.className();
        },
        initialize: function(options) {
            this.initOptions(options);
            this.setAttributeMapping();
            this.setFormatter();
            this.setExtraClasses();
            this.listenToFieldOptions();
            this.name = this.getComponentInstanceName();
            this.itemTemplate = this.field.get('itemTemplate') || null;
            this.selectableNodes = this.field.get('selectableNodes') || false;
        },
        events: {
            'control:loading:show': function(e) {
                this.showChildView('tree', ADK.Views.Loading.create());
            },
            'control:picklist:set': function(e, collection) {
                var treeType;
                if (collection instanceof Backbone.Collection) {
                    var treeItemNodes = this.attributeMapping.treeItemNodes;
                    treeType = _.any(collection.models, function(model) { return model.get(treeItemNodes); }) ? 'full' : 'fetchable';
                    if (treeType === 'full') {
                        var FullTreeNodeCollection = Backbone.Collection.extend({
                            model: Backbone.Model.extend({
                                initialize: function(options) {
                                    var nodes = this.get(treeItemNodes);
                                    if (nodes) {
                                        this.set('nodes', new FullTreeNodeCollection(nodes));
                                    }
                                }
                            })
                        });
                        collection = new FullTreeNodeCollection(collection.toJSON());
                    }
                }
                this.showChildView('tree', new TreeView({
                    collection: collection,
                    attributeMapping: this.attributeMapping,
                    formModel: this.model,
                    name: this.name,
                    itemTemplate: this.itemTemplate,
                    treeType: treeType,
                    selectableNodes: this.selectableNodes
                }));
            },
            'control:picklist:error': function(e, error) {
                this.showChildView('tree', new ErrorView({ error: error }));
            }
        },
        regions: {
            tree: '.tree-region'
        }
    };

    var Treepicker = PuppetForm.TreepickerControl = Backbone.Marionette.LayoutView.extend(
        _.defaults(TreepickerPrototype, _.defaults(PuppetForm.CommonPrototype, PuppetForm.CommonEventsFunctions))
    );

    return Treepicker;
});