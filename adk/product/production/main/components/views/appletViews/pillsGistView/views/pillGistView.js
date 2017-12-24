define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!main/components/views/appletViews/pillsGistView/templates/pillGistChild",
    "hbs!main/components/views/appletViews/sharedTemplates/gistPopover",
    "api/ResourceService",
    "api/Messaging",
    'main/components/applets/baseDisplayApplet/baseDisplayAppletItem'
], function($, _, Backbone, pillGistChildTemplate, popoverTemplate, ResourceService, Messaging, BaseItem) {
    'use strict';
    var PillGistItem = BaseItem.extend({
        template: pillGistChildTemplate,
        tagName: 'li',
        className: '',
        attributes: {},
        tileOptions: {
            quickMenu: {
                buttons: [{
                    type: 'infobutton'
                }, {
                    type: 'detailsviewbutton'
                }]
            }
        },
        events: {
            'click button#closeGist': function(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
            },
            'click button.groupItem': function(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
            },
            'dropdown.show': function() {
                this.$el.find('.gist-item').addClass('quickmenu-open');
            },
            'dropdown.hide': function() {
                this.$el.find('.gist-item').removeClass('quickmenu-open');
            },
            'dropdown.hidden': 'manageFocusShift',
            'focusin button.dropdown-toggle': 'manageFocusShift'
        },
        manageFocusShift: function() {
            if (this.hasFocus) return;
            this.hasFocus = true;
            this.setUpDocumentListener();
            this.$('.gist-item').addClass('quickmenu-hasfocus');
        },
        setUpDocumentListener: function() {
            $(document).on(this.eventString(), 'body', _.bind(function(e) {
                if (this.$(e.target).length) return;
                this.$('.gist-item').removeClass('quickmenu-hasfocus');
                delete this.hasFocus;
                this.tearDownDocumentListener();
            }, this));
        },
        tearDownDocumentListener: function() {
            $(document).off(this.eventString(), 'body');
        },
        eventString: function() {
            return [
                'focusin.pillgist.' + this.getOption('cid'),
                'click.pillgist.' + this.getOption('cid')
            ].join(' ');
        },
        initialize: function(options) {
            this.AppletID = options.AppletID;
            this.model.set({
                'applet_id': this.AppletID,
                'qualifiedName': this.model.get('name')
            });
        },
        onBeforeDestroy: function() {
            this.tearDownDocumentListener();
        }
    });

    var PillGist = Backbone.Marionette.CollectionView.extend({
        behaviors: {
            QuickTile: {
                childContainerSelector: '.gist-item'
            }
        },
        attributes: function() {
            return {
                'gistviewtype': 'pills',
                'aria-label': this.getOption('appletId')
            };
        },
        childView: PillGistItem,
        childEvents: {
            'toggle:quicklook': function(e) {
                var el = e.ui.popoverEl;
                Messaging.getChannel('toolbar').trigger('close:quicklooks', el);
                el.popup('toggle');
            }
        },
        tagName: 'ul',
        emptyView: Backbone.Marionette.ItemView.extend({
            template: _.template('<div class="empty-gist-list"><p class="color-grey-darkest">No Records Found</p></div>'),
            attributes: {
                "aria-live": "assertive"
            },
            className: 'percent-height-100 gist-item-list'
        }),
        initialize: function(options) {
            var appletID = getAppletId(options);
            var instanceid = this.options.appletConfig.instanceId;
            this.childViewOptions = {
                AppletID: appletID,
                collection: options.collection
            };


            this.gistModel = options.gistModel;
            this.collectionParser = options.collectionParser || function(collection) {
                return collection;
            };

            this.collection = options.collection;

            //this is the model for the outer part of the composite view
            this.model = new Backbone.Model();
            this.model.set('instanceid', instanceid);

            this.listenTo(Messaging.getChannel('toolbar'), 'close:quicklooks', function(el) {
                this.$('[data-toggle=popover]').not(el).popup('hide');
            });
        },
        onBeforeRender: function() {
            this.collection.reset(this.collectionParser(this.collection).models, {
                silent: true
            });
            _.each(this.collection.models, function(item) {

                _.each(this.gistModel, function(object) {
                    var id = object.id;
                    item.set(object.id, item.get(object.field));
                });
            }, this);
        },
        onRender: function() {
            if (this.collection.isEmpty()) {
                this.$el.addClass('background-color-grey-lightest');
            }
        }
    });

    function getAppletId(options) {
        return options.appletConfig.id;
    }

    var PillGistView = {
        create: function(options) {
            var pillGistView = new PillGist(options);
            return pillGistView;
        },
        getView: function() {
            return PillGist;
        }
    };

    return PillGistView;
});
