define([
    'jquery',
    'underscore',
    'backbone',
    'api/Messaging',
    'main/components/appletToolbar/appletToolbarView',
    'hbs!main/components/views/appletViews/sharedTemplates/gistPopover',
    'main/adk_utils/crsUtil'
], function($, _, Backbone, Messaging, ToolbarView, popoverTemplate, CrsUtil) {
    'use strict';

    var originalDraggedTileAppletId, dragged;
    var dragDropEvents = {
        'dragstart': function(event) {
            var index = $(this.el).parent().find('.gist-item').index(this.el).toString();
            if (event.originalEvent) {
                dragged = event.currentTarget;
                // IE requires the first parameter to be text or URL. You can't give it a custom name.
                var startTile = {
                    startIndex: index,
                    appletID: this.options.AppletID
                };
                originalDraggedTileAppletId = this.options.AppletID;
                event.originalEvent.dataTransfer.setData('text', JSON.stringify(startTile));
            } else {
                this.performManualDragStart(index);
            }
            this.trigger('after:dragstart');
        },
        'dragover': function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var draggingTile = this.options.AppletID;
            if (draggingTile != originalDraggedTileAppletId)
                return;

            dragged.style.display = 'none';

            if (event.target.className === 'placeholder') return;

            var placeholder = $(this.el).parent().find('.placeholder');
            $(placeholder).removeClass('hidden');
            if ($(this.el).parent().find('.gist-item:first-child').is($(this.el))) {
                $(placeholder).insertBefore($(this.el));
            } else {
                $(placeholder).insertAfter($(this.el));
            }
        },
        'drop': function(event) {
            // This event will only be called for the 508 version of tile sorting
            event.preventDefault();
            event.stopImmediatePropagation();
            var originalIndex = this.manualOriginalIndex;
            var targetIndex = $(this.el).parent().find('.gist-item').index(this.el);

            var reorder = {
                oldIndex: originalIndex,
                newIndex: targetIndex
            };

            this.$el.trigger('reorder', reorder);
            this.trigger('after:drop');
        },
        'dragend': function(event) {
            // Handle when dropped outside of placeholder
            event.preventDefault();
            $(this.el).parent().find('.placeholder').addClass('hidden');
            dragged.style.display = 'block';
        }
    };

    var BaseAppletItem = Backbone.Marionette.LayoutView.extend({
        className: 'gist-item table-row-toolbar',
        behaviors: {
            FloatingToolbar: {
                triggerSelector: '.selectable:not([data-toggle=popover])',
                DialogContainer: '.toolbar-container'
            }
        },
        attributes: function() {
            var rowId = (this.model.has('displayName') ? 'row_' + this.model.get('displayName') : 'row_' + this.model.get('uid'));
            CrsUtil.applyConceptCodeId(this.model);

            return {
                'role': 'presentation',
                'tabindex': 0,
                'data-row-instanceid': rowId,
                'data-code': this.model.get('dataCode')
            };
        },

        serializeData: function () {
            var modelJSON = this.model.toJSON();
            var gistModel = _.get(this, 'appletOptions.gistModel');
            if (gistModel)
                _.each(gistModel, function (object) {
                    modelJSON[object.id] = modelJSON[object.field];
                });
            return modelJSON;
        },

        ui: {
            popoverEl: '[data-toggle=popover]',
            toolbarToggler: '.selectable:not([data-toggle=popover])'
        },
        chartPointer: null,
        events: {
            'click @ui.popoverEl': function(e) {
                this.trigger('toggle:quicklook');
            },
            'blur @ui.popoverEl': function(e) {
                if (this.$('[data-toggle=popover]')[0].hasAttribute('aria-describedby')) {
                    this.trigger('toggle:quicklook');
                }
            },
            'keydown @ui.popoverEl': function(e) {
                var k = e.which || e.keydode;
                if (!/(13|32)/.test(k)) return;
                $(e.target).trigger('click');
                e.preventDefault();
                e.stopPropagation();
            },
            'before:showtoolbar': function() {
                this.$el.addClass('toolbar-active background-color-primary-lighter');
                this.trigger('before:showtoolbar');
            },
            'before:hidetoolbar': function() {
                this.$el.removeClass('toolbar-active background-color-primary-lighter');
                this.trigger('before:hidetoolbar');
            },
            'after:showtoolbar': function() {
                this.trigger('after:showtoolbar');
            },
            'after:hidetoolbar': function() {
                this.trigger('after:hidetoolbar');
            }
        },
        initialize: function(options) {
            this.appletOptions = options.appletOptions;
            if (this.model) {
                this.model.set('userWorkspace', this._enableTileSorting);
            }
        },
        createPopover: function() {
            var self = this;
            this.ui.popoverEl.popup({
                trigger: 'manual',
                html: 'true',
                container: 'body',
                template: popoverTemplate(this.model),
                referenceEl: this.$el,
                placement: 'bottom',
                yoffset: function(placement) {
                    if (self.isToolbarActive() && placement === 'top') {
                        return -self.$('.btn-toolbar').height();
                    }
                    return 0;
                },
                autoHandler: function(e) {
                    if (e[3] + e[1].bottom > $(window).height()) {
                        return 'top';
                    }
                    return 'bottom';
                }
            });

            this.ui.popoverEl.on('shown.bs.popover', _.bind(function() {
                $(window).one('resize.popover.' + this.cid, _.bind(function() {
                    this.ui.popoverEl.popup('hide');
                }, this));
                this.listenToOnce(Messaging, 'gridster:resize', function() {
                    this.ui.popoverEl.popup('hide');
                });
            }, this));
            this.ui.popoverEl.on('hidden.bs.popover', _.bind(function() {
                $(window).off('resize.popover.' + this.cid);
                this.stopListening(Messaging, 'gridster:resize');
            }, this));
        },
        isToolbarActive: function() {
            return this.$el.hasClass('toolbar-active');
        },
        performManualDragStart: function(originalIndex) {
            this.manualOriginalIndex = originalIndex;
        },
        onDestroy: function() {
            //likely not required but better safe since we bound the view to the scope
            this.ui.popoverEl.off('shown.bs.popover');
            this.ui.popoverEl.off('hidden.bs.popover');
            this.ui.popoverEl.popup('destroy');
            $(window).off('resize.popover' + this.cid);
        },
        onRender: function() {
            this.createPopover();
        }
    });

    var Orig = BaseAppletItem, //create a new object structure so that children inherit the render and initialize functions
        Modified = Orig.extend({
            constructor: function() {
                if (!this.options) this.options = {};
                var args = Array.prototype.slice.call(arguments),
                    init = this.initialize,
                    onDestroy = this.onDestroy,
                    onRender = this.onRender,
                    currentScreen = Messaging.request('get:current:screen'),
                    predefined = (currentScreen.config) ? currentScreen.config.predefined | '' : true,
                    options = (args[0]) ? args[0] : null,
                    appletOptions = (options && options.appletOptions) ? options.appletOptions : {},
                    model = (options && options.model) ? options.model : new Backbone.Model(),
                    enableTileSorting = (appletOptions.enableTileSorting && !predefined) ? true : false,
                    argEvents = (args[0]) ? _.extend({}, this.options.events || {}, args[0].events) : _.extend({}, this.options.events),
                    events = (enableTileSorting) ? dragDropEvents : {};
                this.initialize = function() {
                    var args = Array.prototype.slice.call(arguments);
                    this._enableTileSorting = enableTileSorting;
                    Orig.prototype.initialize.apply(this, args);
                    if (Orig.prototype.initialize === init) return;
                    init.apply(this, args);
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
                this.events = _.extend({}, (typeof Orig.prototype.events == 'function') ? Orig.prototype.events() : Orig.prototype.events, (typeof this.events == 'function') ? this.events() : this.events, (typeof argEvents == 'function') ? argEvents() : argEvents, events);
                if (args[0] && args[0].events) {
                    delete args[0].events; //required or else Backbone will destroy our inherited events
                }
                if (this.options.events) {
                    delete this.options.events; //required or else Backbone will destroy our inherited events
                }

                Orig.prototype.constructor.apply(this, args);
            }
        });
    BaseAppletItem = Modified;

    return BaseAppletItem;
});