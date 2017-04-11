define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'api/Messaging',
], function(Backbone, Marionette, $, Handlebars, Messaging) {
    'use strict';

    var getUID = $.prototype.tooltip.Constructor.prototype.getUID; //grab this from the bootstrap tooltip

    var defaultOptions = {
        //'container': 'body', //if it's not defined, it will be inside of the view's .dropdown
        //'DropdownView': dropdownView, //some view definition
        //'ButtonView': dropdownView, //some view definition
        //'ButtonTemplate': 'This is what my button says',
        'position': 'bottom', //bottom | top
        'align': 'left', //left | right | middle
        'preventFocusoutClose': false
    };

    var dropdownView = Marionette.LayoutView.extend({
        template: Handlebars.compile('<div class="dropdown-toggle" data-toggle="applet-dropdown" />'),
        options: defaultOptions,
        attributes: function(e) {
            return {
                'id': this.dropdown_id,
                'role': 'group'
            };
        },
        className: 'btn-group dropdown applet-dropdown',
        isOpen: function() {
            return this.$el.hasClass('open');
        },
        eventString: function() {
            return [
                'focusin.' + this.cid,
                'click.' + this.cid
            ].join(' ');
        },
        regions: {
            'ButtonRegion': '@ui.ButtonContainer'
        },
        ButtonView: Marionette.ItemView.extend({
            tagName: 'a',
            className: 'btn btn-default',
            attributes: {
                'aria-haspopup': "true",
                'tabindex': '0'
            }
        }),
        DropdownListView: Marionette.CollectionView.extend({
            tagName: 'ul',
            className: function() {
                var classes = ['dropdown-menu', 'applet-dropdown-menu'],
                    rowClass = this.getOption('rowClass');

                if (rowClass) classes.push(rowClass);
                return classes.join(' ');
            },
            childView: Marionette.ItemView.extend({
                tagName: 'li',
                template: Handlebars.compile('<a>{{label}}</a>'),
                attributes: function() {
                    return {
                        'title': this.model.get('title')
                    };
                }
            })
        }),
        DropdownFormView: Marionette.LayoutView.extend({
            tagName: 'form',
            regions: {
                'Form': 'form'
            },
            className: function() {
                var classes = ['dropdown-menu', 'applet-dropdown-menu'],
                    rowClass = this.getOption('rowClass');

                if (rowClass) classes.push(rowClass);
                return classes.join(' ');
            }
        }),
        events: {
            'show': function(e) {
                this.$el.trigger('dropdown.show', e);
            },
            'hide': function(e) {
                this.$el.trigger('dropdown.hide', e);
            },
            'toggle': function() {
                this.$el.toggle.apply(this, arguments);
            },
            //listen to the dom events and broadcast at the view level
            'dropdown.show': function(thisE, e) {
                this.trigger('dropdown.show', e);
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
                this.trigger('dropdown.shown', e);
            },
            'dropdown.hide': function(thisE, e) {
                this.trigger('dropdown.hide', e);
                if (this.isOpen()) {
                    this.close(e);
                }
            },
            'dropdown.hidden': function(thisE, e) {
                $(document).off(this.eventString(), 'body');
                this.ui.ButtonContainer.off('focusin');
                this.trigger('dropdown.hidden', e);
            },
            //action events
            'click @ui.ButtonContainer': function(e) {
                this.toggle(e);
            },
            'keydown @ui.ButtonContainer': function(e) {
                this.keyHandler(e, this.ui.ButtonContainer);
            },
            'click [data-dismiss=dropdown]': function(e) {
                this.$el.trigger('dropdown.hide', e);
            },
            'select2:open': function(e) {
                //when a select2 is attached to body, we don't want to lose the dropdown until the select2
                //operation finishes
                if (!!this.getOption('preventFocusoutClose')) return;
                this.options.preventFocusoutClose = true;
                $(e.target).off('select2:close');
                $(e.target).one('select2:close', _.bind(function() {
                    this.options.preventFocusoutClose = false;
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
            view.$el.trigger('dropdown.hide');
        },
        keyHandler: function(e, el) {
            //This closely copied from the Bootstrap dropdown lib.  It has been very slightly modified to work with Marionette.
            //The original function can't be sourced from document data because the Paypal lib overwrites it.
            //We added the tab key to handle some edge cases and slightly changed some selectors to grab the appropriate elements.
            if (!/(38|40|27|32|9)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;

            var $this = el,
                $dropdown = this.ui.DropdownContainer;

            var isActive = this.isOpen();

            //edge cases for shift key--not in Bootstrap
            if (e.which == 9) {
                var firstmenuitem = this.$('[role=menuitem]:first:visible');
                if (!!firstmenuitem.length && isActive && this.isFocusInsideButton(this, e.target) && !this.getOption('preventFocusoutClose')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    firstmenuitem.trigger('focus');
                } else if (isActive && this.isFocusInsideDropdown(this, e.target)) {
                    if (e.shiftKey) {
                        //if it's active, shift key is pressed, and we are inside the dropdown container, or focused on the dropdown container itself
                        //when the button is in the same container as the dropdown, this method will close it
                        $(document).one('focusin.buttoncontainer.' + this.dropdown_id, 'body', {
                            button: this.ui.ButtonContainer[0],
                            external: this.getOption('container'),
                            '$el': this.$el
                        }, function(e) {
                            if (e.data.external) { //if focus has left the dropdown and the dropdown isn't inside this.$el
                                var $el = e.data.$el;
                                if (!$el.find(e.target).length) { //focus has left our container
                                    e.target = $el.find('a, button').first();
                                }
                                return;
                            }

                            //if focus lands on the button--will only happen when focus returns to the button
                            if (!!$(e.data.button).find(e.target).length || e.target === e.data.button) {
                                $(e.data.button).trigger('dropdown.hide');
                            }
                        });
                    } else {
                        $(document).one('focusin.buttoncontainer.' + this.dropdown_id, 'body', {
                            '$el': this.$el
                        }, function(e) {
                            var $el = e.data.$el;
                            if (!$el.find(e.target).length) { //focus has left our container
                                e.target = $el.find('a, button').first();
                            }
                        });
                    }
                }
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if ($this.is('.disabled, :disabled')) return;

            if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
                if (e.which == 27) return this.ui.ButtonContainer.trigger('focus').trigger('click');
                return $this.trigger('click');
            }

            var desc = ' li:not(.disabled):visible a';
            var role = $dropdown.attr('role'),
                $items;

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
        menuHandler: function(view, region, options) {
            //508 -- Bootstrap sets events on document that look for certain patterns.  If these patterns exist keyboard arrow nav is applied
            var menu = view.$el;
            if (!menu.is('ul')) {
                return;
            }
            menu.attr('role', 'menu');
            menu.attr('tabindex', '-1'); //required to hard set focus on this element
            menu.children().not('.dropdown-header').attr('role', 'presentation');
            menu.find('[role=presentation]').children()
                .attr('role', 'menuitem')
                .attr('tabindex', '-1').on('keydown', function(e) {
                    var k = e.which || e.keycode;
                    if (!/(13|32)/.test(k)) return;
                    this.click();
                });
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
                        setTimeout(function() {
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
            this.options.dropdown_id = getUID('dropdown');
            var config = {
                    'dropdown_id': this.getOption('dropdown_id'),
                    'icon': this.getOption('icon') || 'fa-share-alt',
                    'position': this.getOption('position'),
                    'align': this.getOption('align')
                },
                OptionsDropdownView,
                OptionsButtonView,
                options,
                collection;

            if (!this.model) this.model = new Backbone.Model(config);
            else _.defaults(this.model.attributes, config);

            OptionsDropdownView = this.getOption('DropdownView');
            OptionsButtonView = opts.ButtonView || this.getOption('ButtonView').extend({
                template: this.getOption('ButtonTemplate') || Handlebars.compile('<i class="fa {{icon}}"></i>'),
                model: this.model
            });

            options = _.defaults(opts, this.options, this.model.attributes);
            collection = options.collection || this.collection;

            this.DropdownView = OptionsDropdownView || this.DropdownListView;
            this.ButtonView = OptionsButtonView;

            this.DropdownView = this.DropdownView.extend({
                collection: (_.isArray(collection)) ? new Backbone.Collection(collection) : collection,
                options: _.omit(this.options, 'model'),
                childViewOptions: options.childViewOptions || _.omit(this.options, 'model')
            });

            //Close if I'm not the droid you are looking for
            this.listenTo(Messaging, 'dropdown.close', function(cid) {
                if (this.cid !== cid && this.isOpen()) {
                    this.close(this, true);
                }
            });
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

            this.$el.dropdown = this.$el.trigger;
        },
        onBeforeShow: function() {
            if (this.ButtonView) {
                this.showChildView('ButtonRegion', new this.ButtonView());
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
                    config.left = buttonBounds.right;
                    break;
                case 'middle':
                    config.left = buttonBounds.left + buttonBounds.width / 2;
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
                    keyHandler: _.bind(this.keyHandler, this),
                    events: {
                        'keydown': function(e) {
                            this.keyHandler(e, this.$el);
                        }
                    }
                }),
                dropdownView = new View();

            this.triggerEl = e.target;

            this.listenToOnce(dropdownView, 'attach', function(view, region) {
                //sets this.ui.DropdownContainer and calculates position
                this.setupDropdown(view, region);

                var firstmenuitem = view.$('[role=menuitem]:first:visible');

                Messaging.trigger('dropdown.close', this.cid); //close the other dropdowns

                //set focus to the first menu item once the dropdown is open
                if (!preventShiftFocus) {
                    this.listenToOnce(this, 'dropdown.shown', function() {
                        if (!!firstmenuitem.length) firstmenuitem.focus();
                        else view.el.focus();
                    });
                }

                this.ui.ButtonContainer.attr('aria-expanded', true);
                this.$el.addClass('open').trigger('dropdown.shown');
            });

            this.showChildView('DropdownRegion', dropdownView);
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

            this.ui.ButtonContainer.attr('aria-expanded', false);
            this.$el.removeClass('open').trigger('dropdown.hidden');
            this.stopResizer();
        },
        setDropdownView: function(view) {
            this.DropdownRegion.show(view);
        },
        setButtonView: function(view) {
            this.ButtonRegion.show(view);
        },
        onDestroy: function() {
            $(document).off(this.eventString(), 'body').off('focusin.buttoncontainer.' + this.dropdown_id, 'body');
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
                    Orig.prototype.initialize.apply(this, arguments);
                    if (Orig.prototype.initialize === init) return;
                    init.apply(this, arguments);
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

    return DropdownView;
});