define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'api/Messaging',
], function(Backbone, Marionette, $, Handlebars, Messaging) {
    'use strict';

    var defaultOptions = {
        //'container': 'body', //if it's not defined, it will be inside of the view's .dropdown
        //'DropdownView': dropdownView, //some view definition
        //'ButtonView': dropdownView, //some view definition
        //'ButtonTemplate': 'This is what my button says',
        //'position': 'bottom', //bottom | top
        //'align': 'left', //left | right | middle
        //'preventFocusoutClose': false,
        'component': 'applet-dropdown'
    };

    var ButtonView = Marionette.ItemView.extend({
        tagName: 'button',
        className: 'btn btn-sm btn-link',
        attributes: function(){
            return {
                'aria-haspopup': 'true',
                'aria-expanded': 'false',
                'title': this.model.get('title'),
                'type': 'button'
            };
        }
    });

    var RowView = Marionette.ItemView.extend({
        tagName: 'li',
        template: Handlebars.compile('<a>{{label}}</a>'),
        attributes: function() {
            return {
                'title': this.model.get('title')
            };
        }
    });

    var DropdownListView = Marionette.CompositeView.extend({
        attributes: {
            role: 'menu'
        },
        template: Handlebars.compile([
            '{{#if dropdownTitle}}<div class="dropdown-header">',
            '<p>',
            '<strong>{{dropdownTitle}}</strong>',
            '</p>',
            '</div>{{/if}}',
            '<ul class="dropdown-body list-group"></ul>',
        ].join('\n')),
        className: function() {
            var classes = ['dropdown-menu', this.getOption('component') + '-menu'],
                rowClass = this.getOption('rowClass');

            if (rowClass) classes.push(rowClass);
            return classes.join(' ');
        },
        initialize: function() {
            this.model = new Backbone.Model();

            var dropdownTitle = this.getOption('dropdownTitle');
            if (dropdownTitle && !this.model.get('dropdownTitle')) { //in case it's already set on the model
                this.model.set({
                    dropdownTitle: (_.isFunction(dropdownTitle)) ? dropdownTitle.call(this) : dropdownTitle
                });
                this.$el.addClass('dropdown-complex');
            }
        },
        childViewContainer: '.dropdown-body',
        childView: Marionette.ItemView.extend({
            tagName: 'li',
            className: 'list-group-item',
            template: Handlebars.compile('<a href="{{url}}">{{displayText}}</a>')
        })
    });

    var DropdownFormView = Marionette.LayoutView.extend({
        tagName: 'form',
        regions: {
            'Form': 'form'
        },
        className: function() {
            var classes = ['dropdown-menu', this.getOption('component') + '-menu'],
                rowClass = this.getOption('rowClass');

            if (rowClass) classes.push(rowClass);
            return classes.join(' ');
        }
    });

    var dropdownView = Marionette.LayoutView.extend({
        template: function(options) {
            var type = options.component || defaultOptions.component;
            return Handlebars.compile('<div class="dropdown-toggle" data-toggle="' + type + '" />');
        },
        position: 'botton',
        align: 'left',
        options: defaultOptions,
        attributes: function(e) {
            return {
                'id': this.dropdown_id,
                'role': 'group'
            };
        },
        className: function() {
            return 'btn-group dropdown ' + this.getOption('component');
        },
        isOpen: function() {
            return this.getRegion('DropdownRegion').hasView();
        },
        eventString: function() {
            return [
                'focusin.' + this.getOption('drodown_id'),
                'click.' + this.getOption('drodown_id')
            ].join(' ');
        },
        regions: {
            'ButtonRegion': '@ui.ButtonContainer'
        },
        ButtonView: ButtonView,
        RowView: RowView,
        DropdownListView: DropdownListView,
        DropdownFormView: DropdownFormView,
        events: {
            'show': function(e) {
                this.$el.trigger('dropdown.show', e, this.$el);
            },
            'hide': function(e) {
                this.$el.trigger('dropdown.hide', e, this.$el);
            },
            'toggle': function() {
                this.$el.toggle.apply(this, arguments);
            },
            //listen to the dom events and broadcast at the view level
            'dropdown.show': function(thisE, e) {
                this.trigger('dropdown.show', e, this);
                if (!this.isOpen()) {
                    this.open(e);
                }
            },
            'dropdown.shown': function(thisE, e) {
                if (!this.getOption('preventFocusoutClose')) {
                    //this is how bootstrap handles closing dropdowns
                    //rather than use focusout which also fires when the browser loses focus, instead look for focus or click on another element
                    $(document).off(this.eventString(), 'body'); //don't add a duplicate
                    $(document).on(this.eventString(), 'body', {
                        view: this
                    }, this.documentHandler);
                }
                this.trigger('dropdown.shown', e, this);
            },
            'dropdown.hide': function(thisE, e) {
                this.trigger('dropdown.hide', e, this);
                if (this.isOpen()) {
                    this.close(e);
                }
            },
            'dropdown.hidden': function(thisE, e) {
                $(document).off(this.eventString(), 'body');
                this.ui.ButtonContainer.off('focusin');
                this.trigger('dropdown.hidden', e, this);
            },
            //action events
            'click @ui.ButtonContainer': function(e) {
                this.toggle(e);
            },
            'keydown @ui.ButtonContainer': function(e) {
                if (/(13|32)/.test(e.which)) this.$(e.target).trigger('click');
                this.keyHandler(e, this.ui.ButtonContainer);
            },
            'select2:open': function(e) {
                //when a select2 is attached to body, we don't want to lose the dropdown until the select2
                //operation finishes
                if (!!this.getOption('preventFocusoutClose')) return;
                this.preventFocusoutClose = true;
                $(e.target).off('select2:close');
                $(e.target).one('select2:close', _.bind(function() {
                    this.preventFocusoutClose = false;
                }, this));
            }
        },
        isFocusInside: function(view, target) {
            var isSame = view.el === target, //same container as the parent view
                isIn = !!view.$(target).length, //inside the dropdown container
                dropdownFocused = this.isFocusInsideDropdown(view, target),
                preventClose = view.getOption('preventFocusoutClose');

            if (isSame || isIn || dropdownFocused || preventClose) {
                return true;
            }
            return false;
        },
        isFocusInsideButton: function(view, target) {
            var isSame = view.ui.ButtonContainer[0] === target,
                isIn = !!view.ui.ButtonContainer.find(target).length;
            return isSame || isIn;
        },
        isFocusInsideDropdown: function(view, target) {
            var isSame = view.ui.DropdownContainer[0] === target,
                isIn = !!view.ui.DropdownContainer.find(target).length;
            return isSame || isIn;
        },
        giveButtonFocus: function() {
            this.ButtonRegion.$el.find('a, button').first().focus();
        },
        documentHandler: function(e) {
            //safer than using stopPropagation since stopProp would prevent the click from bubbling and wouldn't trigger the close
            //if another dropdown recieves focus or click

            var view = e.data.view;

            if (view.isFocusInside(view, e.target)) {
                return;
            }

            view.stopListening(view, 'dropdown.hidden.' + view.cid);
            delete view.triggerEl;

            view.$el.trigger('dropdown.hide', e);
        },
        keyHandler: function(e, el) {
            //This closely copied from the Bootstrap dropdown lib.  It has been very slightly modified to work with Marionette.
            //The original function can't be sourced from document data because the Paypal lib overwrites it.
            //We added the tab key to handle some edge cases and slightly changed some selectors to grab the appropriate elements.
            if (!/(38|40|27|32|9)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;

            var $this = el,
                $dropdown = this.ui.DropdownContainer;

            var isActive = this.isOpen();

            if (!isActive) return;

            e.preventDefault();
            e.stopPropagation();

            //tab and shift+tab out of the dropdown
            if (e.which == 9) {
                var inputs = $(':input, a, [tabindex]').filter(function() {
                    if (!this.tabIndex) return true;
                    return this.tabIndex >= 0;
                });

                if (!inputs.length) return;

                var increment = (event.shiftKey) ? 0 : 1;

                var nextInput = inputs.get(inputs.index(this.$('a, button').first()[0]) + increment);
                if (nextInput) {
                    nextInput.focus();
                    if(e.shiftKey) {
                        this.ui.ButtonContainer.trigger('dropdown.hide');
                    }
                }
                return;
            }

            if ($this.is('.disabled, :disabled')) return;

            if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
                if (e.which == 27) return this.ui.ButtonContainer.trigger('focus').trigger('click');
                return $this.trigger('click');
            }

            var desc = ' li:not(.disabled):visible a, li:not(.disabled):visible button';
            var role = $dropdown.attr('role'),
                $items = [];

            if (role === 'menu' || role === 'listbox') {
                $items = $dropdown.find(desc);
            }

            if (!$items.length) return;

            var index = $items.index(e.target);

            if (e.which == 38 && index > 0) index--; // up
            if (e.which == 40 && index < $items.length - 1) index++; // down
            if (!~index) index = 0;

            $items.eq(index).trigger('focus');
        },
        getMenu: function(view) {
            return (view.$el.is('ul')) ? view.$el : view.$('ul');
        },
        menuHandler: function(view, region, options) {
            //508 -- Bootstrap sets events on document that look for certain patterns.  If these patterns exist keyboard arrow nav is applied
            var menu = this.getMenu(view);
            if (!menu.is('ul')) {
                return;
            }
            menu.attr('role', 'menu');
            menu.attr('tabindex', '-1'); //required to hard set focus on this element
            menu.children().not('.dropdown-header, .dropdown-footer').attr('role', 'presentation');
            menu.find('[role=presentation]').children()
                .attr('role', 'menuitem')
                .attr('tabindex', '-1');
        },
        startResizer: function() {
            this.stopResizer();
            var resizing = false,
                drawing = false,
                ms_delay = 167, //6fps; ms_delay = (1/fps)*1000,
                positionDropdown = this.positionDropdown,
                view = this,
                update = function(time) {
                    if (resizing === true) {
                        resizing = false;
                        drawing = true;
                        _.delay(function() {
                            positionDropdown(view);
                        }, ms_delay); //for Chrome
                        requestAnimationFrame(update);
                    } else {
                        drawing = false;
                    }
                },
                resizer = function() {
                    if (drawing) return;
                    resizing = true;
                    update();
                };
            $(window).on('resize.' + this.cid, resizer);
        },
        stopResizer: function() {
            $(window).off('resize.' + this.cid);
        },
        initialize: function(opts) {
            this.options.dropdown_id = this.cid;
            var config = {
                    'dropdown_id': this.getOption('dropdown_id'),
                    'icon': this.getOption('icon') || 'fa-share-alt',
                    'position': this.getOption('position'),
                    'align': this.getOption('align')
                },
                OptionsDropdownView,
                OptionsButtonView,
                options;

            if (!this.model) this.model = new Backbone.Model(config);
            else _.defaults(this.model.attributes, config);
            this.triggerMethod('before:initialize', opts);

            OptionsDropdownView = this.getOption('DropdownView');
            OptionsButtonView = opts.ButtonView || this.getOption('ButtonView').extend({
                template: this.getOption('ButtonView').prototype.template || this.getOption('ButtonTemplate') || Handlebars.compile('<i class="fa {{icon}}"></i>'),
                model: this.model
            });

            options = _.defaults(opts, this.options, this.model.attributes);

            this.DropdownView = OptionsDropdownView || this.DropdownListView;
            this.ButtonView = OptionsButtonView;

            //Close if I'm not the droid you are looking for
            this.listenTo(Messaging, 'dropdown.close', function(cid) {
                if (this.cid !== cid && this.isOpen()) {
                    this.close(this, true);
                }
            });

            var key = this.getOption('key'),
                component = this.getOption('component'),
                channel;
            if(key && component) {
                channel = Messaging.getChannel(key);
                this.listenTo(channel, component + '.hide', function() {
                    this.$el.trigger('hide');
                });
                this.listenTo(channel, component + '.show', function() {
                    this.$el.trigger('show');
                });
            }

            return options;
        },
        configureDropdownView: function(options) {
            var collection = this.getOption('collection');
            this.DropdownView = this.DropdownView.extend({
                collection: (_.isArray(collection)) ? new Backbone.Collection(collection) : collection,
                options: _.omit(this.options, 'model'),
                childViewOptions: options.childViewOptions || _.omit(this.options, 'model', 'tagName'),
                'events': {
                    'click [data-dismiss=dropdown]': _.bind(function(e) {
                        this.$el.trigger('dropdown.hide', e, this.$el);
                    }, this)
                }
            });
        },
        onBeforeRender: function() {
            if (this.getRegion('DropdownRegion'))
                this.removeRegion('DropdownRegion');
        },
        onRender: function() {
            if (this.getRegion('DropdownRegion')) return;
            if (!this.getOption('container')) this.options.container = this.el;
            var nestDropdown = this.options.container !== this.el;
            this.addRegion('DropdownRegion', Marionette.Region.extend({
                el: this.getOption('container'),
                attachHtml: function(view) {
                    var $el = this.$el;
                    if (nestDropdown) {
                        var div = document.createElement('div');
                        div.className = 'open';
                        div.id = view.getOption('dropdown_id');
                        $el.append(div);
                        $el = $(div);
                    }
                    $el.append(view.el);
                }
            }));

            this.listenTo(this.getRegion('DropdownRegion'), 'before:show', this.menuHandler);
            this.listenTo(this.getRegion('DropdownRegion'), 'empty', function() {
                if (nestDropdown) {
                    this.getRegion('DropdownRegion').$el.find('#' + this.getOption('dropdown_id')).remove();
                }
            });

            this.ui.ButtonContainer.attr('data-target', this.getOption('dropdown_id'));
            this.$el.dropdown = this.$el.trigger;
        },
        onBeforeShow: function() {
            if (this.ButtonView) {
                this.showChildView('ButtonRegion', new this.ButtonView(_.omit(this.options, 'tagName')));
            }
        },
        setupDropdown: function(view, region) {
            this.ui.DropdownContainer = view.$el;
            this.positionDropdown(this);
        },
        positionDropdown: function(view) {
            var buttonBounds = view.ui.ButtonContainer[0].getBoundingClientRect(),
                dropdownBounds = view.ui.DropdownContainer[0].getBoundingClientRect(),
                config = {};

            switch (view.getOption('position')) { //handle vertical
                case 'top':
                    config.top = buttonBounds.top - dropdownBounds.height;
                    if (view.getOption('yOffset')) config.top += view.getOption('yOffset');
                    break;
                case 'bottom':
                    config.top = buttonBounds.bottom;
                    if (view.getOption('yOffset')) config.top += view.getOption('yOffset');
                    break;
                default: //auto--defaults to bottom--if the screen is just too small for it to fit anywhere it will go to the bottom
                    var top = buttonBounds.top - dropdownBounds.height + ((view.getOption('yOffset')) ? view.getOption('yOffset') : 0),
                        bottom = buttonBounds.bottom + ((view.getOption('yOffset')) ? view.getOption('yOffset') : 0),
                        offScreenBottom = bottom + dropdownBounds.height >= $('body').height(),
                        offScreenTop = top - dropdownBounds.height <= 0;

                    config.top = (offScreenBottom) ? ((offScreenTop) ? bottom : top) : bottom;
                    if (view.getOption('yOffset') && offScreenBottom) config.top -= view.getOption('yOffset');
            }

            switch (view.getOption('align')) { //handle horizontal
                case 'right':
                    config.left = buttonBounds.right - dropdownBounds.width;
                    break;
                case 'middle':
                    config.left = buttonBounds.left - (dropdownBounds.width/2 - buttonBounds.width/2);
                    break;
                default:
                    config.left = buttonBounds.left;
            }

            if (view.getOption('xOffset')) config.left += view.getOption('xOffset');

            view.ui.DropdownContainer.offset(config);
        },
        toggle: function(e) {
            var el = this.$el;
            if (this.isOpen()) {
                el.trigger('dropdown.hide', e);
            } else {
                el.trigger('dropdown.show', e);
            }
        },
        open: function(e, preventShiftFocus) {
            var View = this.DropdownView.extend({
                    $controller: this.$el,
                    keyHandler: _.bind(this.keyHandler, this),
                    events: _.extend({
                        'keydown': function(e) {
                            this.keyHandler(e, this.$el);
                        }
                    }, this.DropdownView.prototype.events)
                }),
                dropdownView = new View();

            this.triggerEl = (e) ? e.target || this.ui.ButtonContainer : this.ui.ButtonContainer;

            this.listenToOnce(dropdownView, 'attach', function(view, region) {
                //sets this.ui.DropdownContainer and calculates position
                this.setupDropdown(view, region);

                var firstmenuitem = view.$('[role=menuitem]:first:visible');

                Messaging.trigger('dropdown.close', this.cid); //close the other dropdowns

                //set focus to the first menu item once the dropdown is open
                this.$el.one('dropdown.shown', function() {
                    if (!!firstmenuitem.length) firstmenuitem.focus();
                    else view.el.focus();
                });

                this.ui.ButtonContainer.children('button').attr('aria-expanded', true);
                this.$el.addClass('open').trigger('dropdown.shown', e);
            });

            //required to allow show to execute in closure while allowing events to bubble
            _.delay(_.bind(function() {
                this.getRegion('DropdownRegion').show(dropdownView);
            }, this));
            this.startResizer();
        },
        close: function(e, preventShiftFocus) {
            //set focus to the element that opened the dropdown when the dropdown is closed,
            //unless it's told to close from another dropdown
            if (this.triggerEl && !preventShiftFocus && !this.isFocusInsideButton(this, document.activeElement)) {
                this.listenToOnce(this, 'dropdown.hidden', function() {
                    this.giveButtonFocus();
                });
            }

            var region = this.getRegion('DropdownRegion');
            if (region.currentView) region.empty();

            this.ui.ButtonContainer.children('button').attr('aria-expanded', false);
            this.$el.removeClass('open').trigger('dropdown.hidden', e);
            this.stopResizer();
        },
        setDropdownView: function(view) {
            this.DropdownRegion.show(view);
        },
        setButtonView: function(view) {
            this.ButtonRegion.show(view);
        },
        onDestroy: function() {
            $(document).off(this.eventString(), 'body').off('focusin.buttoncontainer.' + this.getOption('dropdown_id'), 'body');
            this.stopResizer();
        }
    });

    var Orig = dropdownView,
        Modified = Orig.extend({
            constructor: function() {
                this.options = _.extend({}, defaultOptions, this.options, {
                    'position': this.position,
                    'container': this.container
                });
                var args = Array.prototype.slice.call(arguments),
                    init = this.initialize,
                    onRender = this.onRender,
                    onAttach = this.onAttach,
                    onDestroy = this.onDestroy,
                    events = this.events,
                    argEvents = (args[0]) ? _.extend({}, this.options.events || {}, args[0].events) : _.extend({}, this.options.events);
                this.initialize = function() {
                    var opts = Orig.prototype.initialize.apply(this, arguments);
                    if (Orig.prototype.initialize !== init)
                        init.apply(this, arguments);
                    this.triggerMethod('initialize', opts);
                    this.configureDropdownView(opts);
                };
                this.onRender = function() {
                    Orig.prototype.onRender.apply(this, arguments);
                    if (Orig.prototype.onRender === onRender) return;
                    onRender.apply(this, arguments);
                };
                this.onDestroy = function() {
                    Orig.prototype.onDestroy.apply(this, arguments);
                    if (Orig.prototype.onDestroy === onDestroy) return;
                    onDestroy.apply(this, arguments);
                };

                this.events = _.extend({}, (typeof Orig.prototype.events == 'function') ? Orig.prototype.events() : Orig.prototype.events, (typeof this.events == 'function') ? this.events() : this.events, (typeof argEvents == 'function') ? argEvents() : argEvents);
                if (args[0] && args[0].events) {
                    delete args[0].events; //required or else Backbone will destroy our inherited events
                }
                if (this.options.events) {
                    delete this.options.events; //required or else Backbone will destroy our inherited events
                }

                this.ui = {
                    'ButtonContainer': '.dropdown-toggle',
                    'DropdownContainer': _.bind(function() {
                        return this.getOption('container');
                    }, this)
                };

                Orig.prototype.constructor.apply(this, args);
            }
        }),
        DropdownView = Modified;

    //attach these as options for the end user
    DropdownView.DropdownListView = DropdownListView;
    DropdownView.DropdownFormView = DropdownFormView;
    DropdownView.ButtonView = ButtonView;
    DropdownView.RowView = RowView;

    return DropdownView;
});