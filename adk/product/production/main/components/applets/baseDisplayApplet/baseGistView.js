define([
    'jquery',
    'underscore',
    'backbone',
    'main/Utils',
    'main/components/views/appletViews/TileSortManager',
    'api/Messaging'
], function($, _, Backbone, Utils, TileSortManager, Messaging) {
    'use strict';

    function getAppletId(options) {
        if (_.isUndefined(options.appletConfig.instanceId)) {
            if (_.isUndefined(options.appletConfig.gistSubName)) {
                return options.appletConfig.id;
            } else {
                return options.appletConfig.id + options.appletConfig.gistSubName;
            }
        } else {
            if (_.isUndefined(options.appletConfig.gistSubName)) {
                return options.appletConfig.instanceId;
            } else {
                return options.appletConfig.instanceId + options.appletConfig.gistSubName;
            }
        }
    }

    var BaseGistView = Backbone.Marionette.CompositeView.extend({
        manualOrder: false,
        reorderOnSort: true, //performance enhancement when inverting
        emptyView: Backbone.Marionette.ItemView.extend({
            template: _.template('<div class="empty-gist-list"><p class="color-grey-darkest" role="gridcell">No Records Found</p></div>'),
            attributes: {
                "aria-live":"assertive",
                "role":"row"
            }
        }),
        eventString: function() {
            return [
                'focusin.' + this.cid,
                'click.' + this.cid
            ].join(' ');
        },
        events: {
            'reorder': 'reorderRows',
            'click [data-event="tilesort_remove-sort"]': function(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.removeManualOrder();
            },
            'click .header .table-cell a': function(event) {
                var placeholder;
                event.preventDefault();
                event.stopImmediatePropagation();
                this.hidePopovers();
                this.sortCollection($(event.target));
            },
            'dropdown.show': function(e) {
                this.$('.auto-overflow-y').one('scroll.dropdown.' + this.cid, _.bind(function(event) {
                    this.$('.applet-dropdown.open').trigger('dropdown.hide');
                }, this));
            },
            'dropdown.hide': function(e) {
                this.$('.auto-overflow-y').off('scroll.dropdown.' + this.cid);
            }
        },
        childEvents: {
            'before:showtoolbar': function(e) {
                this.hidePopovers();
            },
            'after:showtoolbar': function(e, view) {
                this.activeToolbar = view;
            },
            'after:hidetoolbar': function(e) {
                this.activeToolbar = '';
                this.hidePopovers();
            },
            //reopens toolbar if open when repositioned
            'after:dragstart': function(e) {
                if (this.activeToolbar) {
                    this.sortItemModel = e.model;
                }
            },
            'after:drop': function(e) {
                if (this.sortItemModel) {
                    this.children.findByModel(this.sortItemModel).showToolbar();
                }
            },
            'toggle:quicklook': function(e) {
                var el = e.ui.popoverEl;
                this.setDocHandler();
                Messaging.getChannel('toolbar').trigger('close:quicklooks', el);
                el.popup('toggle');
            }
        },
        onAddChild: function(child) {
            if (!child.model.get('applet_id')) {
                child.model.set('applet_id', this.AppletID);
            }
        },
        setDocHandler: function() {
            $(document).off(this.eventString());
            $(document).on(this.eventString(), {
                view: this
            }, this.documentHandler);
        },
        documentHandler: function(e) {
            var view = e.data.view;
            if (view.preventFocusClose) {
                return;
            }
            if (!!view.$(e.target).length) {
                return;
            }

            Messaging.getChannel('toolbar').trigger('close:quicklooks');

            $(document).off(view.eventString());
        },
        initialize: function(options) {
            this.appletOptions = options;
            this.AppletID = getAppletId(options);

            this.listenTo(Messaging.getChannel('toolbar'), 'close:quicklooks', function(el) {
                this.$('[data-toggle=popover]').not(el).popup('hide');
            });
        },
        setUnsorted: function() {
                this.unsortedModels = this.collection.clone().models;
                if (!_.isUndefined(this.collection.fullCollection)) {
                    this.unsortedCollection = this.collection.fullCollection.clone().models;
                } else {
                    this.unsortedCollection = this.unsortedModels;
                }
        },
        render: function() {
            if (!this.appletOptions.enableTileSorting) {
                this.off('reorder');
                this.$el.unbind('[data-event="tilesort_remove-sort"]', 'click');
                this.$el.unbind('[data-event="tilesort_remove-sort"]', 'focus');
            }

            this.collection = this.collectionParser(this.collection);
            this.setUnsorted();
            this.applyTileSorting(true);
        },
        onRender: function() {
            var self = this;
            if (this.manualOrder) {
                this.addManualOrder();
            }

            this.listenTo(this.collection, 'fetch:success', function(collection) {
                if(self.manualOrder){
                    // Reapply tile sorting
                    self.applyTileSorting(false);
                }
            });

            if (this.appletOptions.enableTileSorting) {
                this.$('.gist-item-list').append('<div class="placeholder hidden"/>');
                this.registerPlaceholderListeners();

                // It took a while to figure out what this does, so I am documenting it for future readers.
                // This controls the scroll speed of the manual sort.
                var gridAppletPanel = $('#' + this.options.appletConfig.instanceId).find('.grid-applet-panel').first();
                var gridContentHeader = this.$('.header').first();
                var gridContentBody = this.$('.body').first();

                $('<div id="' + this.options.appletConfig.instanceId + '-scroll-bottom" class="grid-applet-container-1"/>').insertAfter($(gridContentBody)).on('dragenter', function(e) {
                    self.bottomInterval = setInterval(function() {
                        var newScrollTop = $(gridAppletPanel).find('.scrolling-content').scrollTop();
                        $(gridAppletPanel).find('.scrolling-content').scrollTop(newScrollTop + 10);
                    }, 25);
                }).on('dragleave', function(e) {
                    self.bottomInterval && clearInterval(self.bottomInterval);
                });

                $('<div id="' + this.options.appletConfig.instanceId + '-scroll-top" class="grid-applet-container-2"/>').insertBefore($(gridContentHeader)).on('dragenter', function(e) {
                    self.topInterval = setInterval(function() {
                        var newScrollTop = $(gridAppletPanel).find('.scrolling-content').scrollTop();
                        $(gridAppletPanel).find('.scrolling-content').scrollTop(newScrollTop - 10);
                    }, 25);
                }).on('dragleave', function(e) {
                    self.topInterval && clearInterval(self.topInterval);
                });
            }
        },
        applyTileSorting: function(callParentRender){
            var self = this;
            var sortId = this.options.appletConfig.instanceId + '_' + this.options.appletConfig.id;

            TileSortManager.getSortOptions(this.collection, sortId, this.appletOptions.tileSortingUniqueId, function(wasSorted, newCollection) {
                self.collection = newCollection;
                self.manualSortModels = newCollection.models;

                if (wasSorted && !self.manualOrder) {
                    self.manualOrder = true;
                    self.addManualOrder();
                    self.collection.comparator = null;
                }

                if(callParentRender){
                    Backbone.Marionette.CompositeView.prototype.render.apply(self, arguments);
                }
            });
        },
        registerPlaceholderListeners: function(){
            var self = this;
            this.$('.placeholder').on('dragover', function(e) {
                e.preventDefault();
            });

            this.$('.placeholder').on('drop', function(e) {
                var data = e.originalEvent.dataTransfer.getData('text');
                var startTileObject = JSON.parse(data);

                var originalAppletId = startTileObject.appletID;
                if (originalAppletId != self.AppletID)
                    return;

                var originalIndex = Number(startTileObject.startIndex);
                //targetIndex = this.$el.index();
                var targetIndex = $(this).index() - 1;
                $(this).addClass('hidden');

                if (originalIndex > targetIndex)
                    targetIndex++;

                var reorder = {
                    oldIndex: originalIndex,
                    newIndex: targetIndex,
                    listElement: self.$('.gist-item-list')
                };

                self.reorderRows(e, reorder);

                if (self.sortItemModel) {
                    self.children.findByModel(self.sortItemModel).showToolbar();
                }
            });
        },
        sortCollection: function(headerElement) {
            /* clear existing collection comparator to allow collection to rerender after sort */
            this.collection.comparator = null;
            var collection;
            if (headerElement.attr("sortable") === "true") {
                var nextSortOrder = '';
                switch (headerElement.attr("sortDirection")) {
                    case 'asc':
                        nextSortOrder = 'desc';
                        break;
                    case 'desc':
                        nextSortOrder = this.manualOrder ? 'manual' : 'none';
                        break;
                    case 'manual':
                        nextSortOrder = 'none';
                        break;
                    case 'none':
                        nextSortOrder = 'asc';
                        break;
                }

                this.$('.header .table-cell')
                    .attr('aria-sort', 'none')
                    .find('a').attr('sortdirection', 'none')
                    .children('i').removeClass('fa-caret-up fa-caret-down').addClass('hide');

                headerElement.attr("sortDirection", nextSortOrder);
                this.$('.tilesort-remove-sort').remove();

                if (nextSortOrder === "asc") {
                    if (headerElement.attr("sortShowReverse") === "true") {
                        headerElement.children('i').removeClass('hide').addClass('fa-caret-down');
                    } else {
                        headerElement.children('i').removeClass('hide').addClass('fa-caret-up');
                    }
                    headerElement.closest('[aria-sort]').attr('aria-sort', 'ascending');
                    this.sortedSR(headerElement, "asc");
                } else if (nextSortOrder === "desc") {
                    if (headerElement.attr("sortShowReverse") === "true") {
                        headerElement.children('i').removeClass('hide').addClass('fa-caret-up');
                    } else {
                        headerElement.children('i').removeClass('hide').addClass('fa-caret-down');
                    }
                    headerElement.closest('[aria-sort]').attr('aria-sort', 'descending');
                    this.sortedSR(headerElement, "desc");
                } else if (nextSortOrder === "manual") {
                    this.addManualOrder();
                    this.sortedSR(headerElement, "manual");
                }

                if (_.isUndefined(this.collection.fullCollection)) {
                    collection = this.collection;
                } else {
                    collection = this.collection.fullCollection;
                }

                if (nextSortOrder === 'none') {
                    collection.reset(this.unsortedCollection);
                    this.collection.trigger('baseGistView:sortNone', this.collection);
                    this.sortedSR(headerElement, "none");
                } else if (nextSortOrder === 'manual') {
                    collection.reset(this.manualSortModels);
                    this.collection.trigger('baseGistView:sortManual', collection);
                    this.sortedSR(headerElement, "asc");
                } else {
                    var sortType = headerElement.attr("sortType");
                    var key = headerElement.attr("sortKey");
                    Utils.CollectionTools.sort(collection, key, nextSortOrder, sortType);
                }
            }
        },
        sortedSR: function(header, dir) {
            var parentRow = header.closest('.table-row');
            if (parentRow.find('[aria-live]').length < 1) {
                parentRow.prepend('<div aria-live="polite" aria-atomic="true" class="sr-only applet-sorting"></div>');
            }
            var ariaRegion = parentRow.find('[aria-live]');
            parentRow.find('.sort-span').text('Press enter to sort');
            if (dir === "asc") {
                ariaRegion.text('Sorted ascending. Press enter to sort descending');
                header.find('.sort-span').text('Sorted ascending. Press enter to sort descending');
            } else if (dir === "desc") {
                ariaRegion.text('Sorted descending. Press enter to reset sort');
                header.find('.sort-span').text('Sorted descending. Press enter to reset sort');
            } else if (dir == "manual") {
                ariaRegion.text('Sorted manually. Press enter to sort');
                header.find('.sort-span').text('Sorted descending. Press enter to sort');
            } else {
                ariaRegion.text('Press enter to sort');
                header.find('.sort-span').text("Press enter to sort");
            }
        },
        reorderRows: function(target, reorderObj) {
            var self = this;
            var sortId = this.options.appletConfig.instanceId + '_' + this.options.appletConfig.id;
            TileSortManager.reorderRows(reorderObj, this.collection, sortId, this.appletOptions.tileSortingUniqueId, function() {
                self.manualSortModels = self.collection.models;
            });

            if (this.$('.tilesort-remove-sort').length === 0) {
                this.addManualOrder();

                this.$el.find('.header').find('[sortArrow=headerDirectionalIndicator]').removeClass('fa-caret-up');
                this.$el.find('.header').find('[sortArrow=headerDirectionalIndicator]').removeClass('fa-caret-down');
            }
        },
        addManualOrder: function() {
            this.manualOrder = true;
            this.$('.table-cell a:first').attr("sortDirection", 'manual');
            this.$('.header').find('[sortArrow=headerDirectionalIndicator]').addClass('hide');
            this.$('.table-cell:first div').append('<span class="tilesort-remove-sort">/Manual ' +
                '<button class="btn btn-icon btn-sm" data-event="tilesort_remove-sort" title="Press enter to clear your manual sort">' +
                '<i class="fa fa-times-circle"></i></button></span>');
        },
        removeManualOrder: function() {
            var instanceId = this.options.appletConfig.instanceId + '_' + this.options.appletConfig.id;

            this.manualOrder = false;
            var firstColumnHeader = this.$('.header .table-cell a:first');
            this.sortCollection(firstColumnHeader);
            TileSortManager.removeSort(instanceId);

            this.$('[data-toggle="tooltip"]').tooltip('hide');
            firstColumnHeader.focus();
        },
        hidePopovers: function(e) {
            Messaging.getChannel('toolbar').trigger('close:quicklooks');
        },
        onDestroy: function(e) {
            $(this.el).find('.placeholder').remove();
            this.$('[data-toggle="tooltip"]').tooltip('destroy');
            $('#' + this.options.appletConfig.instanceId + '-scroll-top').remove();
            $('#' + this.options.appletConfig.instanceId + '-scroll-bottom').remove();
            $(document).off(this.eventString());
        }
    });

    var Orig = BaseGistView, //create a new object structure so that children inherit the render and initialize functions
        Modified = Orig.extend({
            constructor: function() {
                if (!this.options) this.options = {};
                var args = Array.prototype.slice.call(arguments),
                    init = this.initialize,
                    onAddChild = this.onAddChild,
                    onRender = this.onRender,
                    onDestroy = this.onDestroy,
                    argEvents = (args[0]) ? _.extend({}, this.options.events || {}, args[0].events) : _.extend({}, this.options.events);
                this.initialize = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.initialize.apply(this, args);
                    if (Orig.prototype.initialize === init) return;
                    init.apply(this, args);
                };
                this.onAddChild = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.onAddChild.apply(this, args);
                    if (Orig.prototype.onAddChild === onAddChild) return;
                    onAddChild.apply(this, args);
                };
                this.onDestroy = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.onDestroy.apply(this, args);
                    if (Orig.prototype.onDestroy === onDestroy) return;
                    onDestroy.apply(this, args);
                };
                this.onRender = function() {
                    var args = Array.prototype.slice.call(arguments);
                    onRender.apply(this, args);
                    if (Orig.prototype.onRender === onRender) return;
                    Orig.prototype.onRender.apply(this, args);
                };
                this.events = _.extend({}, (typeof Orig.prototype.events == 'function') ? Orig.prototype.events() : Orig.prototype.events, (typeof this.events == 'function') ? this.events() : this.events, (typeof argEvents == 'function') ? argEvents() : argEvents);
                if (args[0] && args[0].events) {
                    delete args[0].events; //required or else Backbone will destroy our inherited events
                }
                if (this.options.events) {
                    delete this.options.events; //required or else Backbone will destroy our inherited events
                }
                Orig.prototype.constructor.apply(this, args);
            }
        });
    BaseGistView = Modified;

    return BaseGistView;
});