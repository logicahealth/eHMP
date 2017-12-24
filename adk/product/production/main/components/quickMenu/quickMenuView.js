define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'api/Messaging',
    'api/ResourceService',
    'api/Navigation',
    'api/PatientRecordService',
    'main/Utils',
    'main/components/quickMenu/tileSortView',
    'hbs!main/components/quickMenu/templates/quickMenuButtonTemplate',
    'hbs!main/components/quickMenu/templates/quickMenuSubmenuTemplate',
    'hbs!main/components/quickMenu/templates/quickMenuItemTemplate'
], function($, _, Backbone, Marionette, Handlebars, Messaging, ResourceService, Navigation, PatientRecordService, Utils, TileSortView, QuickMenuButtonTemplate, SubmenuTemplate, QuickMenuItemTemplate) {
    "use strict";

    var MenuAbstract = Backbone.Marionette.LayoutView.extend({
        _resetRegion: function($el) {
            var regionName = this.getOption('regionName');
            if (this.getRegion(regionName)) {
                this.removeRegion(regionName);
            }
            var childClassName = this.getOption('childClassName');
            var view = this;
            this.addRegion(regionName, Backbone.Marionette.Region.extend({
                el: $el,
                attachHtml: function(child) {
                    var compiledClass = (_.isFunction(childClassName)) ? childClassName.call(view) : childClassName;
                    this.$el.find('.' + compiledClass).detach();
                    this.el.appendChild(child.el);
                }
            }));
        },
        resetRegion: function() {
            return this._resetRegion(this.$el);
        },
        onShowDropdown: function() {
            this.triggerMethod('before:show:dropdown');
            this.resetRegion();
            var options = _.result(this, 'childViewOptions');
            var View = this.getChildView(this.model);
            var view = new View(options);
            this.getRegion(this.getOption('regionName')).show(view);
            this.triggerMethod('after:show:dropdown');
        },
        onHideDropdown: function() {
            this.removeRegion(this.regionName);
        },
        serializeData: function() {
            return {
                uniqueId: this.cid,
                'aria-disabled': _.result(this, 'quickMenuOptions.disabled', false)
            };
        }
    });

    var MenuItem = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'list-group-item',
        behaviors: {
            KeySelect: {}
        },
        attributes: function() {
            var attributes = {
                role: 'presentation'
            };
            var disabled = this.getOption('disabled') || this.model.get('disabled');
            if ((_.isFunction(disabled) ? disabled.call(this.getOption('targetView')) : disabled)) {
                attributes['aria-disabled'] = true;
            }
            return attributes;
        },
        regionName: 'Contents',
        serializeData: function() {
            var modelJSON = this.model.toJSON();
            modelJSON.uniqueId = this.cid;
            return modelJSON;
        },
        template: QuickMenuItemTemplate,
        events: {
            'click :not([aria-disabled])': function(e) {
                var targetElement = this.getOption('targetView');
                var obj = {
                    model: targetElement.model,
                    collection: targetElement.collection || _.get(targetElement, 'model.collection'),
                    $el: targetElement.$('.dropdown--quickmenu > button')
                };
                e.stopPropagation();
                e.preventDefault();
                this.triggerMethod('click', obj, e);
                this.getOption('$triggerElement').trigger('dropdown.hide');
            }
        }
    });

    var buttons = {
        'detailsviewbutton': {
            index: 0,
            icon: 'fa-file-text-o',
            className: 'details-button-toolbar',
            displayName: 'details',
            view: MenuItem.extend({
                onRender: function() {
                    var target = this.getOption('targetView');
                    if (!_.isEmpty(target) && target.model) {
                        if ((target.model.get('collection') && target.model.get('collection').length === 0)) {
                            this.$el.prop('aria-disabled', true);
                        } else {
                            this.$('a').attr({
                                'data-toggle': 'modal',
                                'data-target': '#mainModal'
                            });
                        }
                    }
                },
                onClick: function(obj, e) {
                    var currentPatient = PatientRecordService.getCurrentPatient();
                    var targetElement = this.getOption('targetView');
                    var channelObject = _.extend({
                        uid: _.get(targetElement, 'model.attributes.uid'),
                        patient: {
                            icn: currentPatient.attributes.icn,
                            pid: currentPatient.attributes.pid
                        }
                    }, obj);

                    if (targetElement.applet) {
                        channelObject.applet = targetElement.applet;
                    }
                    Messaging.getChannel(targetElement.model.get('applet_id')).trigger('detailView', channelObject, e);
                }
            })
        },
        'gotoactionbutton': {
            index: 1,
            icon: 'icon-action-arrow',
            displayName: 'go to action',
            className: 'gototask-button-toolbar',
            view: MenuItem.extend({
                initialize: function() {
                    var actionType = this.model.get('actionType');
                    if(actionType) {
                        this.model.set('displayName', 'go to ' + actionType);
                    }
                },
                events: {
                    click: function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.triggerMethod('click', e, _.get(this.target, 'model'));
                    }
                },
                onRender: function() {
                    this.target = this.getOption('targetView');
                }
            })
        },
        'infobutton': {
            index: 2,
            icon: 'fa-info',
            displayName: 'more information',
            ariaLabel: 'More Information. External link',
            className: 'info-button-toolbar',
            view: MenuItem.extend({
                onClick: function(obj, e) {
                    this.getOption('$triggerElement').trigger('dropdown.hide');
                    var currentPatient = PatientRecordService.getCurrentPatient(),
                        targetElement = this.getOption('targetView'),
                        model = targetElement.model;
                    var channelObject = _.extend({
                        model: model,
                        uid: model.get("uid"),
                        patient: currentPatient
                    }, obj);
                    Utils.infoButtonUtils.callProvider(channelObject);
                }
            })
        },
        'tilesortbutton': {
            index: 3,
            icon: 'fa-arrows-v',
            displayName: 'manual sort',
            className: 'tilesort-button',
            srMessage: 'Rearrange mode ',
            view: MenuItem.extend({
                onClick: function(obj, e) {
                    var $target = this.getOption('$triggerElement');
                    $target.trigger('menu.hide');
                    $target.trigger('tilesort.create');
                }
            })
        },
        'additembutton': {
            index: 4,
            icon: 'fa-plus',
            displayName: 'add new item',
            className: 'additem-button-toolbar',
            view: MenuItem.extend({
                onClick: function(obj, e) {
                    var targetElement = this.getOption('targetView');

                    var channelObject = _.extend({
                        model: targetElement.model,
                    }, obj);

                    if (targetElement.applet) {
                        channelObject.applet = targetElement.applet;
                    }
                    Messaging.getChannel(targetElement.model.get('applet_id')).trigger('addItem', channelObject);
                }
            })
        },
        'notesobjectbutton': {
            index: 5,
            icon: 'fa-sticky-note',
            displayName: 'create note object',
            className: 'notes-button-toolbar',
            view: MenuItem.extend({
                onClick: function(obj, e) {
                    this.getOption('$triggerElement').trigger('dropdown.hide');
                    var currentPatient = PatientRecordService.getCurrentPatient();
                    var targetElement = this.getOption('targetView');
                    var channelObject = _.extend({
                        uid: _.get(targetElement, 'model.attributes.uid'),
                        patient: {
                            icn: currentPatient.attributes.icn,
                            pid: currentPatient.attributes.pid
                        },
                        $el: targetElement.$el
                    }, obj);

                    if (targetElement.applet) {
                        channelObject.applet = targetElement.applet;
                    }
                    this.trigger('modal.show');
                    Messaging.getChannel(targetElement.model.get('applet_id')).trigger('notesView', channelObject);
                }

            })
        },
        'crsbutton': {
            index: 6,
            icon: 'icon-concept-relationship',
            displayName: 'concept relationships',
            className: 'crs-button-toolbar',
            view: MenuItem.extend({
                behaviors: {
                    CRS: {},
                    KeySelect: {}
                },
                onRender: function() {
                    var target = this.getOption('targetView');
                    if (!_.isEmpty(target)) {
                        var itemClickedCode = target.model.get('dataCode');
                        if (_.isEmpty(itemClickedCode)) {
                            this.$el.prop('aria-disabled', true);
                        }
                    }
                },
                onClick: function(obj, e) {
                    var targetElement = this.getOption('targetView');
                    this.$el.trigger('fetch:crs', targetElement);
                }
            })
        },
        'associatedworkspace': {
            index: 7,
            icon: 'fa-tags',
            displayName: 'associated workspace',
            className: 'associatedworkspace-button-toolbar',
            view: MenuAbstract.extend({
                regionName: 'SubMenu',
                getTemplate: function() {
                    if (_.get(this, 'collection.length', 0) > 1) {
                        return SubmenuTemplate;
                    }
                    return QuickMenuItemTemplate;
                },
                behaviors: {
                    KeySelect: {}
                },
                childClassName: 'dropdown-menu',
                className: 'list-group-item',
                attributes: {
                    role: 'presentation'
                },
                tagName: 'li',
                isOpen: false,
                serializeData: function() {
                    var modelJSON = this.model.toJSON();
                    modelJSON.uniqueId = this.cid;
                    return modelJSON;
                },
                initialize: function() {
                    this.collection = new Backbone.Collection();
                    var subAnchors = this.getOption('subAnchors');

                    if (subAnchors instanceof Backbone.Collection && (subAnchors.length > 0)) {
                        this.collection = subAnchors;
                    } else if (!_.isUndefined(_.get(this.getOption('targetView') || {}, 'model.attributes.snomedCode'))) {
                        this.setToolbarItems(this.collection, this.getOption('targetView').model);
                    }
                },
                onRender: function() {
                    this.configureAnchor();
                },
                configureAnchor: function() {
                    var attributes = {};
                    switch (this.collection.length) {
                        case 0:
                            attributes['aria-disabled'] = true;
                            break;
                        case 1:
                            attributes.href = this.collection.at(0).get('url');
                            attributes.role = 'menuitem';
                            attributes['aria-label'] = 'Associated Workspace. Link. Navigate to workspace';
                            break;
                        default:
                            this.$el.addClass('dropdown-submenu');
                            this.$el.prop('role', 'menu');
                            return;
                    }
                    this.ui.button.attr(attributes);
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
                            collection.reset(models); //in case they aren't loaded yet
                        }
                    });
                },
                childViewOptions: function() {
                    return {
                        uniqueId: this.cid,
                        collection: this.collection
                    };
                },
                getChildView: function() {
                    return this.CollectionView;
                },
                CollectionView: Backbone.Marionette.CollectionView.extend({
                    tagName: 'ul',
                    className: 'dropdown-menu dropdown-menu--quick-menu list-group',
                    attributes: function() {
                        return {
                            'aria-labelledby': 'submenu' + this.getOption('uniqueId'),
                            'role': 'menu'
                        };
                    },
                    childView: Backbone.Marionette.ItemView.extend({
                        tagName: 'li',
                        className: 'list-group-item',
                        events: {
                            'click': function(e) {
                                var href = this.$(e.target).attr('href');
                                if (href) {
                                    Navigation.navigate(href);
                                }
                                e.stopPropagation();
                                e.preventDefault();
                            }
                        },
                        attributes: {
                            role: 'presentation'
                        },
                        template: Handlebars.compile('<a href="{{url}}" role="menuitem" tabindex="-1" className="transform-text-capitalize">{{displayText}}<span class="sr-only"> Link</span></a>')
                    })
                }),
                ui: {
                    dropdownMenu: '.dropdown-menu',
                    button: 'a'
                },
                onClick: function(obj, e) {
                    var len = _.get(this, 'collection.length', 0);
                    if (!len) return;
                    if (len > 1) {
                        this.toggle();
                        return;
                    }
                    var href = this.$(e.target).attr('href');
                    if (href) {
                        Navigation.navigate(href);
                    }
                },
                events: {
                    'click :not([aria-disabled])': function(e) {
                        var targetElement = this.getOption('targetView');
                        var obj = {
                            model: targetElement.model,
                            collection: targetElement.collection || _.get(targetElement, 'model.collection'),
                            $el: targetElement.$('.dropdown--quickmenu > button')
                        };
                        e.stopPropagation();
                        e.preventDefault();
                        this.triggerMethod('click', obj, e);
                    },
                    'submenu.dropdown.hide': function(e) {
                        this.$('.dropdown-menu').toggle({
                            duration: 0,
                            complete: _.bind(function() {
                                this.$el.removeClass('open');
                                this.ui.button.attr('aria-expanded', false);
                                this.$el.trigger('submenu.dropdown.hidden', e);
                            }, this)
                        });
                    },
                    'submenu.dropdown.hidden': function(e) {
                        this.isOpen = this.$el.hasClass('open');
                        this.triggerMethod('hide:dropdown');
                    },
                    'submenu.dropdown.show': function(e) {
                        this.triggerMethod('show:dropdown');
                        this.$('.dropdown-menu').toggle({
                            duration: 0,
                            complete: _.bind(function() {
                                this.$el.addClass('open');
                                this.ui.button.attr('aria-expanded', true);
                                this.$el.trigger('submenu.dropdown.shown', e);
                            }, this)
                        });
                    },
                    'submenu.dropdown.shown': function(e) {
                        this.isOpen = this.$el.hasClass('open');
                        this.$('ul>li:first>a').focus();
                    },
                    'keydown .dropdown-menu': function(e) {
                        if (e.which !== 27) return; //esc
                        this.$el.trigger('submenu.dropdown.hide');
                        this.ui.button.focus();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                },
                toggle: function(e) {
                    if (this.isOpen) {
                        this.$el.trigger('submenu.dropdown.hide', e);
                    } else {
                        this.$el.trigger('submenu.dropdown.show', e);
                    }
                }
            })
        },
        'editviewbutton': {
            index: 8,
            icon: 'fa-pencil',
            displayName: 'edit form',
            className: 'edit-button-toolbar',
            view: MenuItem.extend({
                onRender: function() {
                    var targetElement = this.getOption('targetView');
                    var model = targetElement.model;
                    var disableNonLocal = this.model.get('disableNonLocal');

                    if ((_.isFunction(disableNonLocal) ? disableNonLocal.call(this.getOption('targetView')) : disableNonLocal)) {
                        var siteCode = ADK.UserService.getUserSession().get('site');
                        var pidSiteCode = model.get('pid') ? model.get('pid').split(';')[0] : '';

                        if (siteCode !== pidSiteCode) {
                            this.$('a.edit-button-toolbar').attr('aria-disabled', true);
                        }
                    }
                },
                onClick: function(obj, e) {
                    this.getOption('$triggerElement').trigger('dropdown.hide');
                    var currentPatient = PatientRecordService.getCurrentPatient();
                    var targetElement = this.getOption('targetView');
                    var channelObject = _.extend({
                        uid: _.get(targetElement, 'model.attributes.uid'),
                        patient: {
                            icn: currentPatient.attributes.icn,
                            pid: currentPatient.attributes.pid
                        },
                    }, obj);

                    if (targetElement.applet) {
                        channelObject.applet = targetElement.applet;
                    }
                    Messaging.getChannel(targetElement.model.get('applet_id')).trigger('editView', channelObject);
                }
            })
        },
        'deletestackedgraphbutton': {
            index: 9,
            icon: 'fa-trash',
            displayName: 'delete stacked graph',
            className: 'deletestackedgraph-button-toolbar',
            view: MenuItem.extend({
                onClick: function(obj, e) {
                    Messaging.getChannel('stackedGraph').trigger('delete', obj);
                }
            })
        }
    };

    var MenuView = Backbone.Marionette.CompositeView.extend({
        tagName: 'div',
        template: Handlebars.compile('<ul role="menu" aria-labelledby="menuButton{{uniqueId}}">'),
        viewComparator: 'index',
        reorderOnSort: true,
        serializeData: function() {
            return {
                uniqueId: this.getOption('uniqueId')
            };
        },
        childViewContainer: 'ul',
        attributes: function() {
            return {
                id: 'menu' + this.getOption('uniqueId')
            };
        },
        initialize: function() {
            this.collection = new Backbone.Collection();
            this.setupDocumentEvents();
        },
        onDestroy: function() {
            this.tearDownDocumentEvents();
        },
        onBeforeRender: function() {
            this.collection.reset(null, {
                silent: true
            });
            var buttonTypes = _.result(this, 'options.quickMenuOptions.buttons', []);
            _.each(_.isFunction(buttonTypes) ? buttonTypes.call(this.view, this.getOption('targetView')) : buttonTypes, function(buttonType) {
                var type = _.get(buttonType, 'type', '');
                var config = _.get(buttons, type);
                var shouldShow;
                if (!config) {
                    console.error('QuickMenu is unable to locate button ' + type);
                    return;
                }
                shouldShow = _.get(buttonType, 'shouldShow', true);
                if (!(_.isFunction(shouldShow) ? shouldShow.call(this.getOption('targetView'), config) : shouldShow)) {
                    return;
                }
                this.collection.add(_.omit(_.extend({}, config, buttonType), 'view'));
            }, this);
        },
        events: {
            keydown: function(e) {
                if (!/(27|9)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;
                switch (e.which) {
                    case 27: //escape
                        this.getOption('$triggerElement').trigger('dropdown.hide', e);
                        this.getOption('$triggerElement').focus();
                        break;
                    case 9: //spacebar
                        this.getOption('$triggerElement').trigger('dropdown.hide', e);
                        if (e.shiftKey) {
                            this.getOption('$triggerElement').focus();
                        } else {
                            this.getOption('$triggerElement').trigger('tabNext');
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                }
            }
        },
        childViewOptions: function() {
            return _.omit(this.options, 'className');
        },
        getChildView: function(child) {
            var config = {};
            var View = _.get(buttons, [
                [child.get('type')], 'view'
            ]);
            if (child.get('events')) {
                _.set(config, 'events', _.extend({}, View.prototype.events, child.get('events')));
                child.unset('events');
            }
            if (_.isFunction(child.get('onClick'))) {
                _.set(config, 'onClick', _.bind(child.get('onClick'), this.getOption('targetView')));
                child.unset('onClick');
            }
            if (!_.isEmpty(config)) {
                return View.extend(config);
            }
            return View;
        },
        eventString: function() {
            return [
                'focusin.quickmenu.' + this.getOption('uniqueId'),
                'click.quickmenu.' + this.getOption('uniqueId')
            ].join(' ');
        },
        scrollHandler: function(e) {
            var $triggerElement = this.getOption('$triggerElement');
            if ($(e.target).find($triggerElement).length) {
                $triggerElement.trigger('dropdown.hide', e);
            }
        },
        setupDocumentEvents: function() {
            $(document).on(this.eventString(), 'body', _.bind(function(e) {
                if (e.target === this.el || this.$(e.target).length) return;
                this.getOption('$triggerElement').trigger('dropdown.hide', e);
            }, this));
            this.scrollEventHandler = _.throttle(_.bind(this.scrollHandler, this), 100);
            //for non-side scrollable contenxts
            document.addEventListener('scroll', this.scrollEventHandler, true);
            //for side scrollable contenxts
            $(document).on('scroll.quickmenu.' + this.getOption('uniqueId'), this.scrollEventHandler);
        },
        tearDownDocumentEvents: function() {
            $(document).off(this.eventString(), 'body');
            document.removeEventListener('scroll', this.scrollEventHandler, true);
            $(document).off('scroll.quickmenu.' + this.getOption('uniqueId'));
        }
    });


    var QuickMenuView = MenuAbstract.extend({
        tagName: 'div',
        className: 'dropdown dropdown--quickmenu',
        childClassName: 'dropdown-menu dropdown-menu--quick-menu list-group',
        template: QuickMenuButtonTemplate,
        regionName: 'DropdownRegion',
        ui: {
            dropdownToggle: 'button.dropdown-toggle',
            tileSort: '.tilesort'
        },
        regions: {
            tileSort: '@ui.tileSort',
        },
        resetRegion: function() {
            return this._resetRegion($('body'));
        },
        behaviors: {
            KeySelect: {}
        },
        isMenuOpen: false,
        onMenuOpen: function() {
            this.$el.addClass('open');
            this.isMenuOpen = true;
            var view = _.get(this.getRegion(this.regionName), 'currentView', this);
            view.$('ul>li:first>a').focus();
        },
        onMenuClose: function() {
            this.$el.removeClass('open');
            this.isMenuOpen = false;
        },
        toggleDropdown: function(e) {
            if (!this.isMenuOpen) {
                this.triggerMethod('show:dropdown');
                var $dropdownEl = _.get(this.getRegion(this.regionName), 'currentView.$el', $.fn);
                $dropdownEl.dropdown('toggle', e);
                this.positionDropdown();
                this.triggerMethod('menu:open');
                this.$el.trigger('quicklooks:disable:all');
            } else {
                if (this.$childDropdownOpen) {
                    this.$childDropdownOpen.trigger('submenu.dropdown.hide', e);
                }
                _.get(this.getRegion(this.regionName), 'currentView.$el', $.fn).dropdown('toggle', e);
                this.triggerMethod('hide:dropdown');
                this.triggerMethod('menu:close');
                this.$el.trigger('quicklooks:enable:all');
            }
        },
        events: {
            'click @ui.dropdownToggle': function(e) {
                e.stopPropagation();
                e.preventDefault();
                if (this.isMenuOpen) this.$el.trigger('dropdown.hide', e);
                else this.$el.trigger('dropdown.show', e);
            },
            focusin: function(e) {
                if (!this.isMenuOpen) return;
                e.stopPropagation();
                e.preventDefault();
            },
            tabNext: function() {
                var inputs = $(':input, a, [tabindex]').filter(function() {
                    if (!this.tabIndex) return true;
                    return this.tabIndex >= 0;
                });

                if (!inputs.length) return;

                var increment = (event.shiftKey) ? 0 : 1;

                var nextInput = inputs.get(inputs.index(this.getToggleNode()) + increment);
                if (nextInput) {
                    nextInput.focus();
                }
            },
            'dropdown.hide': function(e) {
                if (this.isMenuOpen) {
                    this.toggleDropdown(e);
                    this.$el.trigger('dropdown.hidden', e);
                }
            },
            'dropdown.show': function(e) {
                if (!this.isMenuOpen) {
                    this.toggleDropdown(e);
                    this.$el.trigger('dropdown.shown', e);
                }
            },
            'submenu.dropdown.hidden': function(e) {
                delete this.$childDropdownOpen;
            },
            'submenu.dropdown.shown': function(e) {
                this.$childDropdownOpen = this.$(e.target);
            },
            'menu.hide': function(e) {
                this.ui.dropdownToggle.hide();
                this.$el.trigger('dropdown.hide', e);
            },
            'menu.show': function() {
                this.ui.dropdownToggle.show();
            },
            'tilesort.create': function() {
                // Check if tileSort is destroyed
                var options = {
                    uniqueId: this.cid,
                    collection: this.collection,
                    targetView: this.getOption('targetView')
                };
                this.tileSort.show(new TileSortView(options));
                this.listenToOnce(this.tileSort, 'empty', function() {
                    this.$el.trigger('menu.show');
                    this.ui.dropdownToggle.focus();
                });
            }
        },
        childViewOptions: function() {
            return {
                uniqueId: this.cid,
                className: this.getOption('childClassName'),
                targetView: this.getOption('targetView'),
                $triggerElement: this.ui.dropdownToggle,
                quickMenuOptions: this.quickMenuOptions
            };
        },
        initialize: function(options) {
            var targetView = this.getOption('targetView');
            this.tileOptions = targetView.getOption('tileOptions');
            this.quickMenuOptions = _.result(this, 'tileOptions.quickMenu');
        },
        getChildView: function(child) {
            return MenuView;
        },
        getToggleNode: function() {
            return _.get(this, 'ui.dropdownToggle[0]');
        },
        positionDropdown: function() {
            var $dropdownEl = _.get(this.getRegion(this.regionName), 'currentView.$el'),
                dropdownNode = $dropdownEl[0],
                buttonBounds = this.getToggleNode().getBoundingClientRect(),
                dropdownBounds = dropdownNode.getBoundingClientRect(),
                config = {};

            switch (this.getOption('position')) { //handle vertical
                case 'top':
                    config.top = buttonBounds.top - dropdownBounds.height;
                    if (this.getOption('yOffset')) config.top += this.getOption('yOffset');
                    break;
                case 'bottom':
                    config.top = buttonBounds.bottom;
                    if (this.getOption('yOffset')) config.top += this.getOption('yOffset');
                    break;
                default: //auto--defaults to bottom--if the screen is just too small for it to fit anywhere it will go to the bottom
                    var top = buttonBounds.top - dropdownBounds.height + ((this.getOption('yOffset')) ? this.getOption('yOffset') : 0),
                        bottom = buttonBounds.bottom + ((this.getOption('yOffset')) ? this.getOption('yOffset') : 0),
                        offScreenBottom = bottom + dropdownBounds.height >= $('body').height(),
                        offScreenTop = top - dropdownBounds.height <= 0;

                    config.top = (offScreenBottom) ? ((offScreenTop) ? bottom : top) : bottom;
                    if (this.getOption('yOffset') && offScreenBottom) config.top -= this.getOption('yOffset');
            }

            switch (this.getOption('align')) { //handle horizontal
                case 'right':
                    config.left = buttonBounds.right - dropdownBounds.width;
                    break;
                case 'middle':
                    config.left = buttonBounds.left - (dropdownBounds.width / 2 - buttonBounds.width / 2);
                    break;
                default:
                    config.left = buttonBounds.left;
            }

            if (this.getOption('xOffset')) config.left += this.getOption('xOffset');

            $dropdownEl.offset(config);
        },
    });

    return QuickMenuView;
});