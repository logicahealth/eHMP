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
            return Handlebars.compile(JSON.parse(this.getOption('error').message));
        }
    });

    // tree root that renders recursive tree for each item in collection
    var TreeView = Backbone.Marionette.CollectionView.extend({
        emptyView: NoChildrenView,
        className: 'tree',
        tagName: 'ul',
        attributes: {
            role: 'tree'
        },
        hasChildren: function(item) {
            return item.get(this.options.attributeMapping.href) || item.get('nodes');
        },
        getChildView: function(item) {
            return this.hasChildren(item) ? TreeNodeView : TreeLeafView;
        },
        childViewOptions: function() {
            return {
                collection: this.options.collection,
                treeLevel: this.options.treeLevel,
                formModel: this.options.formModel,
                name: this.options.name,
                itemTemplate: this.options.itemTemplate,
                attributeMapping: this.options.attributeMapping,
                hasChildren: this.hasChildren,
                selectableNodes: this.options.selectableNodes,
                childViewOptions: this.childViewOptions  // pass further down into additional child nodes and leaves
            };
        },
        childEvents: {
            'tree:child:keyhandler': function(firstLevel, secondLevel) {
                var child = (secondLevel ? secondLevel : firstLevel);
                this.keyhandler(child);
            }
        },
        onShow: function() {
            this.setNodeList();
            this.$('[role=treeitem]:first').attr('tabindex', '0');
        },
        onAttach: function() {
            if (this.options.treeType === 'full') {
                this.$('.tree-node').children('.tree').slideUp(0);
            }
        },
        keyhandler: function(child) {
            if (!/(1|13|32|37|38|39|40)/.test(event.which)) return;

            event.preventDefault();
            switch(event.which) {
                case 1:
                    if(this.$(event.target).hasClass('node-icon')) this.toggleNode(child);
                    else this.selectNode(child);
                    break;
                case 13:
                    this.selectNode(child);
                    break;
                case 32:
                    if (child.$el.hasClass('tree-node')) this.toggleNode(child);
                    break;
                case 37:
                    if (child.$el.hasClass('expanded', 'tree-node')) this.toggleNode(child);
                    else this.resetFocus(child, 'parent');
                    break;
                case 38:
                    this.resetFocus(child, 'up');
                    break;
                case 39:
                    if (!child.$el.hasClass('expanded') && child.$el.hasClass('tree-node')) this.toggleNode(child);
                    break;
                case 40:
                    this.resetFocus(child, 'down');
                    break;
            }
        },
        setNodeList: function() {
            this.visibleNodes = this.$('li:visible');
            this.lastNodeIdx = this.visibleNodes.length - 1;
            this.lastNodeEl = this.visibleNodes.eq(this.lastNodeIdx);
        },
        toggleNode: function(childNode) {
            var self = this;
            var nodes = childNode.model.get('nodes');
            var childNodeTreeItem = childNode.$('> div');
            if (nodes.length > 0) {
                childNode.$('> ul').slideToggle('fast', function(){
                    self.setNodeList();
                });
                childNode.$el.toggleClass('expanded');
            } else {
                nodes.fetch({
                    treeContext: self,
                    success: function(model, response, options) {
                        options.treeContext.setNodeList();
                    }
                });
            }

            childNodeTreeItem.attr('aria-expanded', (childNodeTreeItem.attr('aria-expanded')==='true'? 'false' : 'true'));

            if(childNodeTreeItem.attr('tabindex') === '-1') {
                this.visibleNodes.find('[tabindex=0]').attr('tabindex', '-1');
                childNodeTreeItem.attr('tabindex', '0').focus();
            }
        },
        selectNode: function(child) {
            if (child.$el.hasClass('tree-leaf') || child.options.selectableNodes) {
                this.$('.tree-node.selected, .tree-leaf.selected').removeClass('selected').find('.sr-only').html("Press enter to select.");
                child.$el.addClass('selected').find('.sr-only').html("Press enter to deselect.");
                child.options.formModel.set(child.options.name, child.model);
                this.$el.trigger('treepicker.change.user.input');
            } else {
                this.toggleNode(child);
            }
        },
        resetFocus: function(currentNode, dir) {
            var thisNodeIdx = this.visibleNodes.index(currentNode.$el);
            var nextNodeIdx, $nextEl, endNodeIdx;
            if (dir == 'up' || dir == 'parent') {
                endNodeIdx = 0;
                nextNodeIdx = thisNodeIdx - 1;
            } else {
                endNodeIdx = this.lastNodeIdx;
                nextNodeIdx = thisNodeIdx + 1;
            }
            if (thisNodeIdx == endNodeIdx) {//if currentNode is last node
                return false; //don't do anything
            }

            if (dir == 'parent') {
                nextNodeIdx = this.visibleNodes.index(currentNode._parent.$el);
                nextNodeIdx = (nextNodeIdx === -1 ? 0 : nextNodeIdx);
            }

            $nextEl = this.$(this.visibleNodes.eq(nextNodeIdx)).find('> div');
            currentNode.$('> div').attr('tabindex', '-1');
            $nextEl.attr('tabindex', '0').focus();
        }
    });

    var TreeNodeView = Backbone.Marionette.CompositeView.extend({
        tagName: 'li',
        attributes: function() {
            var attrs = {
                role:'presentation',
                class: 'tree-node'
            };
            if (this.options.selectableNodes) attrs.class += ' selectable';
            return attrs;
        },
        childViewContainer: 'ul',
        getTemplate: function() {
            var nodeLabel = (this.options.itemTemplate ? this.options.itemTemplate : '{{'+this.options.attributeMapping.treeItemDescription + '}}');
            return Handlebars.compile([
                '<i class="node-icon fa fa-fw" aria-hidden="true"></i>',
                '<div role="treeitem" tabindex="-1" aria-expanded="false" aria-level="' + this.getOption('treeLevel') + '" ',
                'aria-setsize="' + this.parentCollection.length + '" aria-posinset="' + (this._index + 1) + '" ',
                '>'+ nodeLabel + '{{#if selectable}}<span class="sr-only">Press enter to select.</span>{{/if}}</div>',
                '<ul class="tree sub-tree" role="group"></ul>'
            ].join('\n'));
        },
        initialize: function(options) {
            this.options.treeLevel = this.getOption('treeLevel') + 1;
            this.model.set('selectable', this.options.selectableNodes);
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
            this.parentCollection = this.options.collection;
            this.options.collection = this.collection;

            this.hasChildren = options.hasChildren;
            this.childViewOptions = options.childViewOptions;

            this.loadingView = ADK.Views.Loading.create();
            this.loadingView.render();
        },
        getChildView: function(child) {
            return this.hasChildren(child) ? TreeNodeView : TreeLeafView;
        },
        childEvents: {
            'tree:child:keyhandler': function(firstLevel, secondLevel){
                var child = (secondLevel ? secondLevel : firstLevel);
                this.triggerMethod('tree:child:keyhandler', child);
            }
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
        events: {
            'click' : 'eventHandler',
            'keydown' : 'eventHandler'
        },
        eventHandler: function(e) {
            e.stopPropagation();
            this.triggerMethod('tree:child:keyhandler');
        }
    });

    var TreeLeafView = Backbone.Marionette.ItemView.extend({
        className: 'tree-leaf',
        tagName: 'li',
        getTemplate: function() {
            this.treeLevel = this.getOption('treeLevel') + 1;
            var nodeLabel = (this.options.itemTemplate ? this.options.itemTemplate : '{{'+this.options.attributeMapping.treeItemDescription + '}}');
            return Handlebars.compile([
                '<div role="treeitem" tabindex="-1" aria-level="' + this.treeLevel + '" ',
                'aria-setsize="' + this.options.collection.length + '" aria-posinset="' + (this._index + 1) + '" ',
                '>' + nodeLabel + '<span class="sr-only">Press enter to select.</span></div>'].join('\n'));
        },
        attributes: {
            role:'presentation'
        },
        events: {
            'click div': 'eventHandler',
            'keydown' : 'eventHandler'
        },
        eventHandler: function (e) {
            e.stopPropagation();
            this.triggerMethod('tree:child:keyhandler');
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
        template: Handlebars.compile('{{ui-form-label (add-required-indicator label required) forID=(clean-for-id name) classes=(is-sr-only-label srOnlyLabel)}}<div class="tree-region" role="presentation"></div>'),
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
                    selectableNodes: this.selectableNodes,
                    treeLevel: 0
                }));
            },
            'control:picklist:error': function(e, error) {
                this.showChildView('tree', new ErrorView({ error: error }));
            },
            'treepicker.change.user.input': function(events) {
                event.stopPropagation();
                this.onUserInput.apply(this, arguments);
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