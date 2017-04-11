define([
    "jquery",
    "underscore",
    "backbone",
    "marionette",
    "handlebars",
    "api/Messaging",
    "api/ResourceService",
    'api/PatientRecordService',
    'main/Utils',
    'hbs!main/components/appletToolbar/templates/toolbarTemplate',
    'hbs!main/components/appletToolbar/templates/buttonTemplate',
], function($, _, Backbone, Marionette, Handlebars, Messaging, ResourceService, PatientRecordService, Utils, ToolbarTemplate, ButtonTemplate) {
    "use strict";

    var buttonFactory = function(bOptions, buttonType) {
        switch (buttonType.toLowerCase()) {
            case 'crsbutton':
                return {
                    index: 5,
                    icon: 'icon-concept-relationship',
                    srMessage: 'Press enter to view related concepts.',
                    view: ButtonView.extend({
                        behaviors: {
                            CRS: {}
                        },
                        options: bOptions,
                        onRender: function() {
                            var target = this.getOption('targetView') || this.getOption('targetElement');
                            if (!_.isEmpty(target)) {
                                var itemClickedCode = target.model.get('dataCode');
                                if (_.isEmpty(itemClickedCode)) {
                                    this.$el.prop('disabled', true);
                                }
                            }
                        },
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'tooltip-data-key': 'toolbar_crs',
                            'button-type': 'crs-button-toolbar'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            'click': function(e) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                var targetElement = this.getOption('targetView') || this.getOption('targetElement');
                                this.$el.trigger('fetch:crs', targetElement);
                            }
                        })
                    })
                };
            case 'detailsviewbutton':
                return {
                    index: 3,
                    icon: 'fa-file-text-o',
                    srMessage: 'Press enter to view details.',
                    view: ButtonView.extend({
                        options: bOptions,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'button-type': 'detailView-button-toolbar',
                            'tooltip-data-key': 'toolbar_detailview'
                        }),
                        onRender: function() {
                            var target = this.getOption('targetView') || this.getOption('targetElement');
                            if (!_.isEmpty(target) && target.model) {
                                if ((target.model.get('collection') && target.model.get('collection').length === 0) || !!this.options.detailsViewDisabled) {
                                    this.$el.prop('disabled', true);
                                }
                            }
                        },
                        events: _.extend({}, ButtonView.prototype.events, {
                            click: function(e) {
                                e.preventDefault();
                                var currentPatient = PatientRecordService.getCurrentPatient();
                                var targetElement = this.getOption('targetView') || this.getOption('targetElement');
                                var channelObject = {
                                    model: targetElement.model,
                                    collection: targetElement.collection || _.get(targetElement, 'model.collection'),
                                    uid: targetElement.model.get("uid"),
                                    patient: {
                                        icn: currentPatient.attributes.icn,
                                        pid: currentPatient.attributes.pid
                                    },
                                    $el: targetElement.$el
                                };

                                if (targetElement.applet) {
                                    channelObject.applet = targetElement.applet;
                                }
                                this.trigger('modal.show');
                                Messaging.getChannel('toolbar').trigger('close:quicklooks');
                                Messaging.getChannel(targetElement.model.get('applet_id')).trigger('detailView', channelObject);
                                this.$el.tooltip('hide');
                            }
                        }, bOptions.detailViewEvent)
                    })
                };
                //Create Note Object code implementation
            case 'notesobjectbutton':
                return {
                    index: 10,
                    icon: 'fa-sticky-note',
                    srMessage: 'Press enter to create a new note object.',
                    view: ButtonView.extend({
                        options: bOptions,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'button-type': 'notesObject-button-toolbar',
                            'tooltip-data-key': 'toolbar_note_object'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            click: function(e) {
                                e.preventDefault();
                                var currentPatient = PatientRecordService.getCurrentPatient();
                                var targetElement = this.getOption('targetView') || this.getOption('targetElement');
                                var channelObject = {
                                    model: targetElement.model,
                                    collection: targetElement.collection || _.get(targetElement, 'model.collection'),
                                    uid: targetElement.model.get("uid"),
                                    patient: {
                                        icn: currentPatient.attributes.icn,
                                        pid: currentPatient.attributes.pid
                                    },
                                    $el: targetElement.$el
                                };

                                if (targetElement.applet) {
                                    channelObject.applet = targetElement.applet;
                                }
                                this.trigger('modal.show');
                                Messaging.getChannel('toolbar').trigger('close:quicklooks');
                                Messaging.getChannel(targetElement.model.get('applet_id')).trigger('notesView', channelObject);
                                this.$el.tooltip('hide');
                            }
                        }, bOptions.detailViewEvent)
                    })
                };
                //
            case 'editviewbutton':
                return {
                    index: 7,
                    icon: 'fa-pencil',
                    srMessage: 'Press enter to edit.',
                    view: ButtonView.extend({
                        options: bOptions,
                        onRender: function() {
                            var targetElement = this.getOption('targetView') || this.getOption('targetElement');
                            var model = targetElement.model;

                            if (this.getOption('disableNonLocal')) {
                                var siteCode = ADK.UserService.getUserSession().get('site'),
                                    pidSiteCode = model.get('pid') ? model.get('pid').split(';')[0] : '';

                                if (siteCode !== pidSiteCode) {
                                    this.$el.prop('disabled', true);
                                }
                            }
                        },
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'button-type': 'editView-button-toolbar',
                            'tooltip-data-key': 'toolbar_edititem'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            click: function(e) {
                                e.preventDefault();
                                var currentPatient = PatientRecordService.getCurrentPatient();
                                var targetElement = this.getOption('targetView') || this.getOption('targetElement');
                                var channelObject = {
                                    model: targetElement.model,
                                    collection: targetElement.collection || _.get(targetElement, 'model.collection'),
                                    uid: targetElement.model.get("uid"),
                                    patient: {
                                        icn: currentPatient.attributes.icn,
                                        pid: currentPatient.attributes.pid
                                    },
                                    $el: targetElement.$el
                                };

                                if (targetElement.applet) {
                                    channelObject.applet = targetElement.applet;
                                }
                                Messaging.getChannel('toolbar').trigger('close:quicklooks');
                                Messaging.getChannel(targetElement.model.get('applet_id')).trigger('editView', channelObject);
                                this.$el.tooltip('hide');
                            }
                        })
                    })
                };
            case 'quicklookbutton':
                return {
                    index: 4,
                    icon: 'fa-eye',
                    srMessage: 'Press enter to open the quicklook table.',
                    view: ButtonView.extend({
                        options: bOptions,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'button-type': 'quick-look-button-toolbar',
                            'tooltip-data-key': 'toolbar_quicklook'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            'click': function(e) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                if (this.getOption('targetView')) {
                                    var targetView = this.getOption('targetView');
                                    targetView.trigger('toggle:quicklook');
                                } else {
                                    var targetElement = this.getOption('targetElement');
                                    var pop = targetElement.$('[data-toggle=popover]');
                                    pop.trigger('click');
                                }
                                this.quickLookState();
                                this.$el.focus();
                            },
                            'blur': function(){
                                if(this.$('.sr-only:contains("close")').length > 0) {
                                    Messaging.getChannel('toolbar').trigger('close:quicklooks');
                                    this.quickLookState();
                                }
                            }
                        }),
                        quickLookState: function(){
                            var toggleSrMessageText = (this.$('.sr-only:contains("open")').length > 0 ? 'close' : 'open');
                            this.$('.sr-only').text('Press enter to ' + toggleSrMessageText + ' the quicklook table');
                        },
                        initialize: function() {
                            ButtonView.prototype.initialize.apply(this, arguments);
                            var targetElement = this.getOption('targetView') || this.getOption('targetElement');
                            var pop = targetElement.$('[data-toggle=popover]');
                        },
                        onRender: function() {
                            if (!!this.options.quickLooksDisabled){
                                this.$el.prop('disabled', true);
                            }
                        }
                    })
                };
            case 'submenubutton':
                return {
                    index: 6,
                    icon: 'fa-tags',
                    srMessage: 'Press enter to view associated workspaces.',
                    view: Backbone.Marionette.LayoutView.extend({
                        template: Handlebars.compile('<div class="submenuButtonWrapper"></div>'),
                        regions: {
                            buttonRegion: '.submenuButtonWrapper'
                        },
                        className: 'btn-group',
                        initialize: function() {
                            var self = this;
                            this.collection = new Backbone.Collection();

                            if (bOptions.submenuItems instanceof Backbone.Collection && (bOptions.submenuItems.length > 0)) {
                                this.collection = bOptions.submenuItems;
                            } else if (!_.isUndefined(bOptions.targetView.model.get('snomedCode'))) {
                                this.setToolbarItems(this.collection, bOptions.targetView.model);
                            }
                        },
                        setToolbarItems: function(collection, model) {
                            ADK.UserDefinedScreens.getScreenBySnomedCt(model.get('snomedCode')).done(function(filteredScreenList) {
                                if (filteredScreenList.length > 0) {
                                    var currentScreen = ADK.Messaging.request('get:current:screen');
                                    var models = [];
                                    _.each(filteredScreenList, function(filteredScreen) {
                                        if (filteredScreen.id !== currentScreen.id) {
                                            var scrnObj = {
                                                displayText: filteredScreen.title,
                                                url: ('#' + filteredScreen.routeName)
                                            };
                                            models.push(new Backbone.Model(scrnObj));
                                        }
                                    });
                                    collection.reset(models);
                                }
                            });
                        },
                        collectionEvents: {
                            'add': 'setView',
                            'remove': 'setView',
                            'reset': 'setView'
                        },
                        onRender: function() {
                            this.setView();
                        },
                        setView: function() {
                            var SubmenuButtonView = this.getView(),
                                submenuButtonView = new SubmenuButtonView({
                                    model: this.model
                                });
                            this.listenTo(submenuButtonView, 'dropdown.show', function(e) {
                                this.trigger('dropdown.show', e);
                            });
                            this.listenTo(submenuButtonView, 'dropdown.shown', function(e) {
                                this.trigger('dropdown.shown', e);
                            });
                            this.listenTo(submenuButtonView, 'dropdown.hide', function(e) {
                                this.trigger('dropdown.hide', e);
                            });
                            this.listenTo(submenuButtonView, 'dropdown.hidden', function(e) {
                                this.trigger('dropdown.hidden', e);
                            });
                            this.buttonRegion.show(submenuButtonView);
                        },
                        getView: function() {
                            if (this.collection.length === 0) {
                                return ButtonView.extend({
                                    attributes: _.extend({}, ButtonView.prototype.attributes, {
                                        'button-type': 'submenu-button-toolbar',
                                        'disabled': true
                                    }),
                                    onRender: function() {
                                        this.$('i').attr('disabled', true);
                                    }
                                });
                            }
                            if (this.collection.length === 1) {
                                return ButtonView.extend({
                                    tagName: 'a',
                                    attributes: _.extend({}, ButtonView.prototype.attributes, {
                                        'button-type': 'submenu-button-toolbar',
                                        'tooltip-data-key': 'toolbar_associatedworkspace',
                                        'href': this.collection.models[0].get('url')
                                    }),
                                    events: _.extend({}, ButtonView.prototype.attributes, {
                                        'click': function(e) {
                                            e.preventDefault();
                                            this.destroy();
                                            this.$el.tooltip('destroy');
                                            ADK.Navigation.navigate(this.$el.attr('href'));
                                        },
                                        'keydown': function(e) {
                                            if (!/(13|32)/.test(e.which) || this.$el.is('.disabled, :disabled')) return;
                                            e.preventDefault();
                                            e.stopPropagation();
                                            this.$el.trigger('click');
                                        }
                                    })
                                });
                            }
                            return ADK.UI.Dropdown.extend({
                                yOffset: 25,
                                collection: this.collection,
                                icon: this.icon,
                                initialize: function() {
                                    //we need to add in a header
                                    if (!!this.collection.length && this.collection.at(0).get('header')) return;

                                    this.options.dropdownTitle = 'Select Associated Workspace';
                                },
                                position: 'auto',
                                container: 'body',
                                ButtonView: ButtonView.extend({
                                    attributes: _.extend({}, ButtonView.prototype.attributes, {
                                        'button-type': 'submenu-button-toolbar'
                                    })
                                })
                            });
                        }
                    })
                };
            case 'infobutton':
                return {
                    index: 2,
                    icon: 'fa-info',
                    srMessage: 'Press enter to view more information.',
                    view: ButtonView.extend({
                        options: bOptions,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'button-type': 'info-button-toolbar',
                            'tooltip-data-key': 'toolbar_infobutton'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            'click': function(e) {
                                e.preventDefault();
                                var currentPatient = PatientRecordService.getCurrentPatient(),
                                    targetElement = this.getOption('targetView') || this.getOption('targetElement'),
                                    model = targetElement.model;
                                var channelObject = {
                                    model: model,
                                    uid: model.get("uid"),
                                    patient: currentPatient
                                };
                                Utils.infoButtonUtils.callProvider(channelObject);
                            }
                        })
                    })
                };
            case 'deletestackedgraphbutton':
                return {
                    index: 8,
                    icon: 'fa-trash',
                    srMessage: 'Press enter to delete.',
                    view: ButtonView.extend({
                        options: bOptions,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'button-type': 'deletestackedgraph-button-toolbar',
                            'tooltip-data-key': 'toolbar_deletestackedgraph'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            click: function(e) {
                                e.preventDefault();
                                var targetElement = this.getOption('targetView') || this.getOption('targetElement');
                                Messaging.getChannel('stackedGraph').trigger('delete', {
                                    model: targetElement.model
                                });
                            }
                        })
                    })

                };
            case 'tilesortbutton':
                return {
                    index: 1,
                    icon: 'fa-arrows-v',
                    srMessage: 'Rearrange mode ',
                    view: ButtonView.extend({
                        options: bOptions,
                        className: 'tilesort-button-toolbar ' + ButtonView.prototype.className,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'button-type': 'tilesort-button-toolbar',
                            'tooltip-data-key': 'toolbar_tilesortbutton'
                        }),

                        activateTitleSort: function(e) {
                            var draggingClass, draggingRow, startTile, selectedTileIndex, itemList, tileNameList, tileName = '',
                                tile;
                            draggingClass = 'tilesort-keydown-dragging';
                            draggingRow = 'dragging-row';
                            startTile = this.$el.closest('.gist-item');
                            selectedTileIndex = $(startTile).parent().find('.gist-item').index(startTile);
                            itemList = this.$el.closest('.gist-item').parent();

                            tileNameList = $(itemList).find('[data-cell-tilesort="tilesort"]');

                            if (!this.$el.hasClass(draggingClass)) {
                                tile = this.$el.closest('.applet-toolbar').parent().closest('.gist-item');

                                if (tile.length) {
                                    switch (e.which) {
                                        case 1:
                                        case 13:
                                        case 32:
                                            e.preventDefault();
                                            e.stopPropagation();
                                            $(startTile).find('button.tilesort-button-toolbar').addClass('background-color-secondary-dark');
                                            this.$el.addClass(draggingClass);
                                            $(startTile).addClass(draggingRow);

                                            tileName = tileNameList[selectedTileIndex].textContent;

                                            this.$el.append("<span class=\"sr-only\">activated for " + tileName +
                                                " tile. Use the up or down arrow keys to move the tile, then press enter again to set tile</span>");

                                            this.$el.trigger('dragstart');

                                            break;
                                    }
                                }
                            } else {
                                e.preventDefault();
                                e.stopPropagation();
                                var itemListLen = tileNameList.length;

                                if (e.which === 1 || e.which === 32 || e.which === 13) {
                                    tileName = tileNameList[selectedTileIndex].textContent;
                                    this.$el.find('.sr-only').remove();
                                    this.$el.append("<span class=\"sr-only\">" + tileName + " tile was successfully set</span>");

                                    this.$el.removeClass(draggingClass);

                                    $(startTile).trigger('drop');
                                    $(startTile).find('button.tilesort-button-toolbar').removeClass('background-color-secondary-dark');
                                    $(startTile).removeClass(draggingRow);

                                } else {

                                    switch (e.which) {
                                        case 38: // up arrow
                                        case 87: // up arrow

                                            this.$el.find('.sr-only').remove();


                                            if (selectedTileIndex > 0) {
                                                $(itemList).children('.gist-item').eq(selectedTileIndex - 1).before($(itemList).children('.gist-item').eq(selectedTileIndex));
                                                tileName = tileNameList[selectedTileIndex - 1].textContent;
                                                this.$el.append("<span class=\"sr-only\">Current tile moved above the " + tileName + " tile</span>");

                                                selectedTileIndex--;
                                            } else {
                                                this.$el.append("<span class=\"sr-only\">Beginning of list</span>");
                                            }

                                            break;
                                        case 40: // down arrow
                                        case 90: // down arrow
                                            if (selectedTileIndex < itemListLen) {
                                                $(itemList).children('.gist-item').eq(selectedTileIndex + 1).after($(itemList).children('.gist-item').eq(selectedTileIndex));
                                                selectedTileIndex++;
                                            }

                                            this.$el.find('.sr-only').remove();
                                            if (tileNameList[selectedTileIndex]) {
                                                tileName = tileNameList[selectedTileIndex].textContent;
                                                this.$el.append("<span class=\"sr-only\">Current tile moved below the " + tileName + " tile</span>");
                                            } else {
                                                this.$el.append("<span class=\"sr-only\">End of list.</span>");
                                            }

                                            break;
                                        case 13:
                                        case 32:

                                            tileName = tileNameList[selectedTileIndex].textContent;
                                            this.$el.find('.sr-only').remove();
                                            this.$el.append("<span class=\"sr-only\">" + tileName + " tile was successfully set</span>");

                                            this.$el.removeClass(draggingClass);

                                            $(startTile).trigger('drop');
                                            $(startTile).find('button.tilesort-button-toolbar').removeClass('background-color-secondary-dark');
                                            $(startTile).removeClass(draggingRow);
                                            break;
                                    }
                                }
                                $(startTile).focus();
                                this.$el.focus();                                 
                            }
                        },
                        onDestroy: function() {
                            this.$el.closest('.toolbar-active').removeClass('dragging-row');
                        },
                        events: _.extend({}, ButtonView.prototype.events, {
                            click: 'activateTitleSort',
                            keydown: 'activateTitleSort'
                        })
                    })
                };
            case 'additembutton':
                return {
                    index: 9,
                    icon: 'fa-plus',
                    srMessage: 'Press enter to add new item.',
                    view: ButtonView.extend({
                        options: bOptions,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'button-type': 'additem-button-toolbar',
                            'tooltip-data-key': 'toolbar_addnewitem'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            'click': function(e) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                var targetElement = this.getOption('targetView') || this.getOption('targetElement');

                                var channelObject = {
                                    model: targetElement.model,
                                };

                                if (targetElement.applet) {
                                    channelObject.applet = targetElement.applet;
                                }
                                Messaging.getChannel('toolbar').trigger('close:quicklooks');
                                Messaging.getChannel(targetElement.model.get('applet_id')).trigger('addItem', channelObject);
                                this.$el.tooltip('hide');
                            }
                        })
                    })
                };
        }
        return {
            index: '',
            icon: '',
            srMessage: '',
            view: ButtonView.extend({
                options: bOptions,
                events: _.extend({}, ButtonView.prototype.events, {
                    click: function(e) {
                        e.preventDefault();
                    }
                })
            })
        };
    };

    var ButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        template: ButtonTemplate,
        className: 'btn btn-primary',
        initialize: function(options) {
            this.options = options;
        },
        events: {
            'focusin': 'handleTrigger',
            'click': function(e) {
                if (this.$el.is('.disabled, :disabled')) {
                    e.preventDefault();
                }
            },
            'keydown': function(e) {
                if (!/(13|32)/.test(e.which) || this.$el.is('.disabled, :disabled')) return;
                e.preventDefault();
                e.stopPropagation();
                this.$el.trigger('click');
            }
        },
        handleTrigger: function(e) {
            this.trigger('before:click');
        },
        behaviors: {
            Tooltip: {}
        }
    });

    var toolbarView = Backbone.Marionette.CompositeView.extend({
        fade: 100,
        template: ToolbarTemplate,
        className: 'applet-toolbar',
        childViewContainer: '.btn-group',
        childEvents: {
            'dropdown.show': function() {
                this.trigger('dropdown.show');
            },
            'dropdown.shown': function() {
                this.trigger('dropdown.shown');
            },
            'dropdown.hide': function() {
                this.trigger('dropdown.hide');
            },
            'dropdown.hidden': function() {
                this.trigger('dropdown.hidden');
            },
            'modal.show': function(e) {
                this.trigger('modal.show', e, 'modal.show');
            },
            'workflow.show': function(e) {
                this.trigger('workflow.show', e, 'workflow.show');
            }
        },
        events: {
            'dropdown.show': function() {
                var targetElement = this.getOption('targetView') || this.getOption('targetElement');
                var popup = targetElement.$el.find('[data-toggle=popover]');
                if (!!popup.length) popup.popup('hide');
            }
        },
        initialize: function(options) {
            var buttonTypes = this.getOption('buttonTypes');
            if (!this.collection)
                this.collection = (buttonTypes instanceof Backbone.Collection) ? butonTypes : new Backbone.Collection();
            if (_.isFunction(buttonTypes))
                buttonTypes = buttonTypes();

            var array_views = [];
            _.each(buttonTypes, function(type) {
                var button = buttonFactory(this.options, type);
                var btnModel = new Backbone.Model();
                array_views.push({
                    'index': button.index,
                    'icon': button.icon,
                    'srMessage': button.srMessage,
                    'view': button.view
                });
            }, this);

            this.collection.comparator = 'index';

            if (!this.collection.length) this.collection.set(array_views);
        },
        getChildView: function(child) {
            return child.get('view');
        },
        toggleSrMessageText: function($el, change) {
            var newSrMsg = 'Press enter to ' + change + ' the toolbar menu.';
            $el.find('.toolbar-instructions').text(newSrMsg);
        },
        show: function() {
            var $el = _.get(this.getOption('targetView'), '$el') || _.get(this.getOption('targetElement'), '$el');
            this.toggleSrMessageText($el, 'close');

            this.trigger('show:toolbar');
            this.$el.fadeIn(this.fade, _.bind(function(e) {
                this.trigger('shown:toolbar');
            }, this));
            this.options.targetView.$el.focus();
        },
        hide: function(e) {
            var $el = _.get(this.getOption('targetView'), '$el') || _.get(this.getOption('targetElement'), '$el');
            this.toggleSrMessageText($el, 'open');

            this.trigger('hide:toolbar');
            this.$el.fadeOut(this.fade, _.bind(function(e) {
                this.trigger('hidden:toolbar');
            }, this));
        },
        onDestroy: function(e) {
            this.hide(e);
        }
    });
    return toolbarView;
});