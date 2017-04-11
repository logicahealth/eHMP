define([
    "jquery",
    "underscore",
    "backbone",
    "marionette",
    "handlebars",
    "api/Messaging",
    "api/ResourceService",
    'hbs!main/components/appletToolbar/templates/toolbarTemplate',
    'hbs!main/components/appletToolbar/templates/buttonTemplate',
    'hbs!main/components/appletToolbar/templates/dropdownTemplate'
], function($, _, Backbone, Marionette, Handlebars, Messaging, ResourceService, ToolbarTemplate, ButtonTemplate, DropdownTemplate) {
    "use strict";

    var buttonFactory = function(bOptions, buttonType) {
        switch (buttonType.toLowerCase()) {
            case 'detailsviewbutton':
                return {
                    icon: 'fa-file-text-o',
                    view: ButtonView.extend({
                        options: bOptions,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'tooltip-data-key': 'toolbar_detailview',
                            'button-type': 'detailView-button-toolbar'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            click: function(e) {
                                e.preventDefault();
                                var currentPatient = ResourceService.patientRecordService.getCurrentPatient();
                                var channelObject = {
                                    model: this.options.targetElement.model,
                                    uid: this.options.targetElement.model.get("uid"),
                                    patient: {
                                        icn: currentPatient.attributes.icn,
                                        pid: currentPatient.attributes.pid
                                    }
                                };

                                if (this.options.targetElement.applet) {
                                    channelObject.applet = this.options.targetElement.applet;
                                }
                                Messaging.getChannel('gists').trigger('close:quicklooks');
                                Messaging.getChannel(this.options.targetElement.model.get('applet_id')).trigger('detailView', channelObject);
                                this.$el.tooltip('hide');
                            }
                        }, bOptions.detailViewEvent)
                    })
                };
            case 'quicklookbutton':
                return {
                    icon: 'fa-eye',
                    view: ButtonView.extend({
                        options: bOptions,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'tooltip-data-key': 'toolbar_quicklook',
                            'button-type': 'quick-look-button-toolbar'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            'click': function(e) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                var pop = this.options.targetElement.$('[data-toggle=popover]');
                                pop.trigger('click');
                            }
                        }),
                        initialize: function() {
                            ButtonView.prototype.initialize.apply(this, arguments);
                            var self = this;
                            var pop = this.options.targetElement.$('[data-toggle=popover]');
                            $(document).on('click.' + self.cid, function(e) {
                                if (e.target === pop[0]) {
                                    return;
                                }

                                if (pop[0] && $.contains(pop[0], e.target)) {
                                    return;
                                }
                                if ($(e.target).is('.popover.gist-popover') || $(e.target).parents('.popover.gist-popover').length) {
                                    return;
                                }
                                pop.popover('hide');
                            });
                        },
                        onBeforeDestroy: function() {
                            $(document).off('click.' + this.cid);
                        }
                    })
                };
            case 'submenubutton':
                return {
                    icon: 'fa-tags',
                    view: Backbone.Marionette.LayoutView.extend({
                        template: Handlebars.compile('<div class="submenuButtonWrapper"></div>'),
                        regions: {
                            buttonRegion: '.submenuButtonWrapper'
                        },
                        className: 'btn-group',
                        initialize: function() {
                            var self = this;
                            this.collection = bOptions.submenuItems;
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
                                        'tooltip-data-key': 'toolbar_submenu',
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
                                        'tooltip-data-key': 'toolbar_submenu',
                                        'button-type': 'submenu-button-toolbar',
                                        'href': this.collection.models[0].get('url')
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
                                    var model = new Backbone.Model({
                                        header: 'true',
                                        displayText: 'Select Associated Workspace'
                                    });
                                    this.collection.add(model, {
                                        'silent': 'true',
                                        'at': 0
                                    });
                                },
                                itemClass: 'appletToolbar-submenu-title',
                                containerClass: 'appletToolbar-submenu-title appletToolbar',
                                DropdownView: ADK.UI.Dropdown.prototype.DropdownListView.extend({
                                    childView: Marionette.ItemView.extend({
                                        tagName: 'li',
                                        template: Handlebars.compile('<a href="{{url}}">{{displayText}}</a>'),
                                        attributes: function() {
                                            return {
                                                'title': this.model.get('displayText')
                                            };
                                        },
                                        className: function() {
                                            if (this.model.get('header')) {
                                                return 'dropdown-header appletToolbar-submenu-title';
                                            }
                                            return;
                                        },
                                        getTemplate: function() {
                                            if (this.model.get('header')) {
                                                return Handlebars.compile('<div>{{displayText}}</div>');
                                            }
                                            return this.getOption('template');
                                        }
                                    })
                                }),
                                attributes: _.extend({}, DropdownView.prototype.attributes, {
                                    'button-type': 'submenu-button-toolbar'
                                }),
                                'position': 'auto',
                                'container': 'body'
                            });
                        }
                    })
                };
            case 'infobutton':
                return {
                    icon: 'fa-info',
                    view: ButtonView.extend({
                        options: bOptions,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'tooltip-data-key': 'toolbar_infobutton',
                            'button-type': 'info-button-toolbar'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            'click': function(e) {
                                e.preventDefault();
                                var currentPatient = ResourceService.patientRecordService.getCurrentPatient();
                                var channelObject = {
                                    model: this.options.targetElement.model,
                                    uid: this.options.targetElement.model.get("uid"),
                                    patient: currentPatient
                                };
                                ADK.utils.infoButtonUtils.callProvider(channelObject);
                            }
                        })
                    })
                };
            case 'deletestackedgraphbutton':
                return {
                    icon: 'fa-times',
                    view: ButtonView.extend({
                        options: bOptions,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'tooltip-data-key': 'toolbar_deletestackedgraph',
                            'button-type': 'deletestackedgraph-button-toolbar'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            click: function(e) {
                                e.preventDefault();
                                Messaging.getChannel('stackedGraph').trigger('delete', {
                                    model: this.options.targetElement.model
                                });
                            }
                        })
                    })

                };
            case 'tilesortbutton':
                return {
                    icon: 'fa-arrows-v',
                    view: ButtonView.extend({
                        options: bOptions,
                        className: 'tilesort-button-toolbar ' + ButtonView.prototype.className,
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'tooltip-data-key': 'toolbar_tilesortbutton',
                            'button-type': 'tilesort-button-toolbar'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            click: function(e) {
                                e.preventDefault();
                            },
                            keydown: function(e) {
                                var draggingClass = 'tilesort-keydown-dragging';
                                var startTile = this.$el.closest('.gist-item');
                                var selectedTileIndex = $(startTile).parent().find('.gist-item').index(startTile);
                                var itemList = this.$el.closest('.gist-item').parent();

                                var tileNameList = $(itemList).find('.problem-name').length > 0 ? $(itemList).find('.problem-name') : $(itemList).find('[name="name"]');
                                var tileName = '';
                                if (!this.$el.hasClass(draggingClass)) {
                                    var tile;

                                    if (this.options.isStackedGraph) {
                                        tile = this.$el.closest('.appletToolbar').parent().parent().siblings('[draggable="true"]');
                                    } else {
                                        tile = this.$el.closest('.appletToolbar').parent().siblings('[draggable="true"]');
                                    }

                                    if (tile.length) {
                                        switch (e.which) {
                                            case 13:
                                            case 32:
                                                e.preventDefault();
                                                e.stopPropagation();

                                                this.$el.addClass(draggingClass);

                                                startTile.trigger('dragstart');

                                                this.$el.tooltip('destroy');

                                                tileName = tileNameList[selectedTileIndex].textContent;

                                                this.$el.append("<span class=\"sr-only\">You are on the Sort Tile button for the " + tileName +
                                                    " tile. To sort each tile, press enter on the sort tile button, then use the Up and Down arrow keys to reorder the selected tile. Press the enter key again to deselect the tile and lock into position. </span>");
                                                break;
                                        }
                                    }
                                } else {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    var itemListLen = tileNameList.length;

                                    switch (e.which) {
                                        case 38: // up arrow
                                        case 87: // up arrow

                                            this.$el.find('.sr-only').remove();
                                            if (selectedTileIndex > 0) {
                                                $(itemList).children('.gist-item').eq(selectedTileIndex - 1).before($(itemList).children('.gist-item').eq(selectedTileIndex));
                                                tileName = tileNameList[selectedTileIndex - 1].textContent;
                                                this.$el.append("<span class=\"sr-only\">You are above the " + tileName + " tile</span>");

                                                selectedTileIndex--;
                                            } else {
                                                this.$el.append("<span class=\"sr-only\">You've reached the top of the list</span>");
                                            }

                                            // drops out of focus after move
                                            this.$el.focus();
                                            this.$el.addClass(draggingClass);

                                            break;
                                        case 40: // down arrow
                                        case 90: // down arrow
                                            if (selectedTileIndex < itemListLen) {
                                                $(itemList).children('.gist-item').eq(selectedTileIndex + 1).after($(itemList).children('.gist-item').eq(selectedTileIndex));
                                                selectedTileIndex++;
                                            }

                                            // drops out of focus after move
                                            this.$el.focus();
                                            this.$el.addClass(draggingClass);

                                            this.$el.find('.sr-only').remove();
                                            if (tileNameList[selectedTileIndex]) {
                                                tileName = tileNameList[selectedTileIndex].textContent;
                                                this.$el.append("<span class=\"sr-only\">You are below the " + tileName + " tile</span>");
                                            } else {
                                                this.$el.append("<span class=\"sr-only\">You've reached the end of the list.</span>");
                                            }

                                            break;
                                        case 13:
                                        case 32:

                                            tileName = tileNameList[selectedTileIndex].textContent;
                                            this.$el.find('.sr-only').remove();
                                            this.$el.append("<span class=\"sr-only\">You just dropped the " + tileName + " tile</span>");

                                            this.$el.removeClass(draggingClass);

                                            var selectedTile = this.$el.closest('.gist-item');
                                            $(selectedTile).trigger('drop');
                                            $(selectedTile).focus();



                                            break;
                                    }

                                    this.$el.focus();
                                }
                            }
                        })
                    })
                };
            case 'additembutton':
                return {
                    icon: 'fa-plus',
                    view: ButtonView.extend({
                        options: bOptions,
                        className: 'btn additem-button-toolbar',
                        attributes: _.extend({}, ButtonView.prototype.attributes, {
                            'tooltip-data-key': 'toolbar_addorders',
                            'button-type': 'additem-button-toolbar'
                        }),
                        events: _.extend({}, ButtonView.prototype.events, {
                            'click': function(e) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                var channelObject = {
                                    model: this.options.targetElement.model,
                                };

                                if (this.options.targetElement.applet) {
                                    channelObject.applet = this.options.targetElement.applet;
                                }

                                e.preventDefault();
                                var writebackView = ADK.utils.appletUtils.getAppletView('orders', 'writeback');
                                var formModel = new Backbone.Model();
                                var workflowOptions = {
                                    size: "large",
                                    title: "Order a Lab Test",
                                    showProgress: false,
                                    keyboard: true,
                                    steps: [{
                                        view: writebackView,
                                        viewModel: formModel,
                                        stepTitle: 'Step 1'
                                    }]
                                };
                                ADK.UI.Workflow.show(workflowOptions);
                            }
                        })
                    })
                };
        }
        return {
            icon: '',
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
        attributes: {
            'data-toggle': 'tooltip',
            'data-container': 'body',
            'data-placement': 'auto top'
        },
        events: {
            'focusin': 'handleTrigger',
            'click': function(e) {
                if (this.$el.is('.disabled, :disabled') ) {
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
            this.$el.addClass('toolbar-btn-hover');
        },
        onDestroy: function(e) {
            this.$el.tooltip('destroy');
        }
    });

    var DropdownView = Backbone.Marionette.CompositeView.extend({
        template: DropdownTemplate,
        className: 'btn-group',
        attributes: {
            'role': 'group',
        },
        ui: {
            'dropdownEl': '[data-toggle=dropdown]'
        },
        events: {
            'keydown': function(e) {
                if (!/(13|32)/.test(e.which) || this.$el.is('.disabled, :disabled')) return;
                e.preventDefault();
                this.$el.trigger('click');
            }
        }
    });

    var toolbarView = Backbone.Marionette.CompositeView.extend({
        fade: 100,
        template: ToolbarTemplate,
        className: 'appletToolbar',
        childViewContainer: '.btn-group',
        childEvents: {
            'before:click': function(e) {
                this.$('.toolbar-btn-hover').removeClass('toolbar-btn-hover');
            },
            'focusout': function(e) {
                this.$('.toolbar-btn-hover').removeClass('toolbar-btn-hover');
            },
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
        },
        initialize: function(options) {
            this.options = options;

            if (!this.collection)
                this.collection = (this.options.buttonTypes instanceof Backbone.Collection) ? this.options.butonTypes : new Backbone.Collection();

            var array_views = [];
            _.each(this.options.buttonTypes, function(type) {
                var button = buttonFactory(this.options, type);
                array_views.push({
                    'icon': button.icon,
                    'view': button.view
                });
            }, this);

            if (!this.collection.length) this.collection.set(array_views);
        },
        getChildView: function(child) {
            return child.get('view');
        },
        show: function(e) {
            this.trigger('show:toolbar');
            this.$el.fadeIn(this.fade, _.bind(function(e) {
                this.trigger('shown:toolbar');
            }, this));
        },
        onDestroy: function() {
            this.$el.find('a').off('show.bs.tooltip');
        },
        hide: function(e) {
            this.trigger('hide:toolbar');
            this.$('.toolbar-btn-hover').removeClass('toolbar-btn-hover');
            this.$el.fadeOut(this.fade, _.bind(function(e) {
                this.trigger('hidden:toolbar');
            }, this));
        }
    });
    return toolbarView;
});