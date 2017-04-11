define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!main/components/views/appletViews/pillsGistView/templates/pillGistChild",
    "hbs!main/components/views/appletViews/sharedTemplates/gistPopover",
    "api/ResourceService",
    "api/Messaging"
], function($, _, Backbone, pillGistChildTemplate, popoverTemplate, ResourceService, Messaging) {
    'use strict';
    var PillGistItem = Backbone.Marionette.ItemView.extend({
        template: pillGistChildTemplate,
        tagName: 'li',
        behaviors: {
            FloatingToolbar: {
                buttonTypes: ['infobutton', 'detailsviewbutton'],
                triggerSelector: '[data-infobutton]'
            }
        },
        ui: {
            popoverEl: '[data-toggle=popover]'
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
            'hover div.gist-item': function(event) {
                this.$(event.target).blur();
            },
            'click div.gist-item': function(event) {
                this.$('[data-toggle=popover]').popover('hide');
            },
            'after:hidetoolbar': function() {
                this.trigger('after:hidetoolbar');
            }
        },
        initialize: function(options) {
            this.AppletID = options.AppletID;
            this.model.set({
                'applet_id': this.AppletID,
                'qualifiedName': this.model.get('name')
            });
        },
        setPopover: function() {
            this.$('[data-toggle=popover]').popover({
                trigger: 'manual',
                html: 'true',
                container: 'body',
                template: popoverTemplate(this.model),
                placement: 'bottom'
            });
        },
        onRender: function() {
            this.setPopover();
        },
        onDestroy: function() {
            this.$('[data-toggle=popover]').popover('destroy');
        }
    });
    var PillGist = Backbone.Marionette.CollectionView.extend({
        attributes: {
            'gistviewtype': 'pills'
        },
        childView: PillGistItem,
        childEvents: {
            'toggle:quicklook': function(e) {
                var el = e.ui.popoverEl;
                Messaging.getChannel('toolbar').trigger('close:quicklooks', el);
                el.popup('toggle');
            },
            'after:hidetoolbar': function(e){
                Messaging.getChannel('toolbar').trigger('close:quicklooks');
            }
        },
        tagName: 'ul',
        className: 'all-padding-no',
        emptyView: Backbone.Marionette.ItemView.extend({
            template: _.template('<p class="color-grey-darkest top-padding-xs left-padding-xs" role="gridcell">No Records Found</p>'),
            attributes: {
                "aria-live":"assertive",
                "role":"row"
            },
            className: 'percent-height-100 background-color-grey-lightest'
        }),
        initialize: function(options) {
            var appletID = getAppletId(options);
            var instanceid = this.options.appletConfig.instanceId;
            this.childViewOptions = {
                AppletID: appletID,
                collection: options.collection
            };
            if (this.getOption('toolbarOptions')) {
                this.childView = this.childView.extend({
                    behaviors: _.extend({}, this.childView.prototype.behaviors, {
                        FloatingToolbar: this.getOption('toolbarOptions')
                    })
                });
            }
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
