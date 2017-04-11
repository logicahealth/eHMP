define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'api/Messaging',
    'main/Session',
    'main/adk_utils/resizeUtils'
], function(Backbone, Marionette, $, _, Handlebars, Messaging, Session, ResizeUtils) {
    'use strict';

    var getUID = $.prototype.tooltip.Constructor.prototype.getUID; //grab this from the bootstrap tooltip

    var defaultOptions = {
        //if no viewport is specified we are just going to stick it on the bottom of the button, and end it at the #center-region
        //'viewport': '#center-region',
        //'tray': TrayView, //some view definition
        //'buttonLabel': 'This is what my button says',
        'position': 'right',
        'preventFocusoutClose': false,
        'widthScale': 1 / 3,
        'iconClass': null,
        'buttonClass': null,
        'listenToWindowResize': true
    };

    var TRANSITION_SPEED = 200;

    var TrayView = Backbone.Marionette.LayoutView.extend({
        _eventPrefix: 'tray',
        template: Handlebars.compile([
            '<button type="button" id={{tray_id}} class="btn btn-default{{#if buttonClass}} {{buttonClass}}{{/if}}" data-toggle="sidebar-tray" title="Press enter to activate menu" aria-expanded="false">{{#if iconClass}}<i class="{{iconClass}}" aria-hidden="true"></i> {{/if}}{{buttonLabel}}</button>',
            '<div role="document" class="sidebar-tray {{position}}" aria-labelledby="{{tray_id}}" aria-hidden="true" tabindex="-1"/>'
        ].join('\r\n')),
        options: defaultOptions,
        attributes: function(e) {
            return {
                'id': this.tray_id
            };
        },
        className: 'sidebar',
        isOpen: function() {
            return this.$el.hasClass('open');
        },
        eventString: function() {
            return [
                'focusin.' + this.cid,
                'click.' + this.cid
            ].join(' ');
        },
        ui: {
            'ButtonContainer': '[data-toggle=sidebar-tray]',
            'TrayContainer': '.sidebar-tray'
        },
        regions: {
            'TrayRegion': '@ui.TrayContainer'
        },
        behaviors: {
            KeySelect: {}
        },
        // Defining the events hash this way to allow for the sub-tray component to extend
        // and customize the event names without having to rewrite and dublicate all the logic.
        events: function(eventPrefix) {
            var prefix = eventPrefix || this._eventPrefix;
            var eventsHash = {
                //action events
                'click @ui.ButtonContainer': function(e) {
                    this.toggle(e);
                },
                'keydown @ui.ButtonContainer': function(e) {
                    this.keyHandler(e, this.ui.ButtonContainer);
                },
                'keydown @ui.TrayContainer': function(e) {
                    this.keyHandler(e, this.ui.TrayContainer);
                },
                'click [data-dismiss=tray]': function(e) {
                    this.$el.trigger(prefix + '.hide', e);
                },
                'select2:open': function(e) {
                    //when a select2 is attached to body, we don't want to lose the dropdown until the select2
                    //operation finishes
                    delete this.tabOut;
                    if (!!this.getOption('preventFocusoutClose')) return;
                    this.options.preventFocusoutClose = true;
                    $(e.target).off('select2:close');
                    $(e.target).one('select2:close', _.bind(function() {
                        this.options.preventFocusoutClose = false;
                    }, this));
                },
                'keydown .modal,.select2,.dropdown': function(e) {
                    if (e.which === 27) {
                        e.preventDefault();
                    }
                }
            };

            //listen to the dom events and broadcast at the view level
            eventsHash[prefix + '.show'] = function(thisE, e) {
                this.trigger(prefix + '.show', e);
                if (!this.isOpen()) {
                    this.open(e);
                }
            };
            eventsHash[prefix + '.shown'] = function(thisE, e) {
                //this is how bootstrap handles closing dropdowns
                //rather than use focusout which also fires when the browser loses focus, instead look for focus or click on another element
                $(document).off(this.eventString(), 'body'); //don't add a duplicate
                $(document).on(this.eventString(), 'body', {
                    view: this
                }, _.bind(this.documentHandler, this));
                this.trigger(prefix + '.shown', e);
            };
            eventsHash[prefix + '.hide'] = function(thisE, e) {
                this.trigger(prefix + '.hide', e);
                if (this.isOpen()) {
                    this.close(e);
                }
            };
            eventsHash[prefix + '.hidden'] = function(thisE, e) {
                $(document).off(this.eventString(), 'body');
                this.ui.ButtonContainer.off('focusin');
                this.trigger(prefix + '.hidden', e);
            };
            eventsHash[prefix + '.reset'] = function(e) {
                e.stopPropagation();
                this.showChildView('TrayRegion', this.tray);
                this.setFocusToFirstMenuItem();
            };
            eventsHash[prefix + '.swap'] = function(e, View) {
                e.stopPropagation();
                if (!(View instanceof this.getOption('tray')) && !_.isUndefined(this.tray)) {
                    var viewToShow = (View instanceof Backbone.Marionette.View) ||
                        (View instanceof Backbone.Marionette.ItemView) ||
                        (View instanceof Backbone.Marionette.CollectionView) ||
                        (View instanceof Backbone.Marionette.CompositeView) ||
                        (View instanceof Backbone.Marionette.LayoutView) ? View : (typeof View === 'function') ? new View() : undefined;
                    if (!_.isUndefined(viewToShow)) {
                        this.TrayRegion.show(viewToShow, {
                            preventDestroy: true
                        });
                        this.setFocusToFirstMenuItem();
                    }
                }
            };
            return eventsHash;
        },
        isFocusInside: function(view, target) {
            var isSame = view.el === target, //same container as the parent view
                isIn = !!view.$(target).length, //inside the dropdown container
                dropdownFocused = this.isFocusInsideTray(view, target);

            if (isSame || isIn || dropdownFocused) {
                return true;
            }
            return false;
        },
        isFocusInsideButton: function(view, target) {
            var isSame = view.ui.ButtonContainer[0] === target,
                isIn = !!view.ui.ButtonContainer.find(target).length;
            return isSame || isIn;
        },
        isFocusInsideTray: function(view, target) {
            var isSame = view.ui.TrayContainer[0] === target,
                isIn = !!view.ui.TrayContainer.find(target).length;
            return isSame || isIn;
        },
        documentHandler: function(e) {
            //safer than using stopPropagation since stopProp would prevent the click from bubbling and wouldn't trigger the close
            //if another tray recieves focus or click
            var view = e.data.view;
            if (view.isFocusInside(view, e.target) || (!view.tabOut && view.getOption('preventFocusoutClose'))) return;
            view.stopListening(view, this._eventPrefix + '.hidden.' + view.cid);
            view.$el.trigger(this._eventPrefix + '.hide');
            delete view.tabOut;
        },
        keyHandler: function(e, el) {
            delete this.tabOut;
            if (e.isDefaultPrevented()) return;
            //This closely copied from the Bootstrap dropdown lib.  It has been very slightly modified to work with Marionette.
            //The original function can't be sourced from document data because the Paypal lib overwrites it.
            //We added the tab key to handle some edge cases and slightly changed some selectors to grab the appropriate elements.
            if (!/(27|9)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;

            var $this = el;

            var isActive = this.isOpen();
            var self = this;
            //edge cases for shift key--not in Bootstrap
            if (e.which == 9) {
                if (!isActive && !this.isFocusInsideTray(this, e.target)) return;
                if (e.shiftKey) {
                    //if it's active, shift key is pressed, and we are inside the tray container, or focused on the tray container itself
                    $(document).one('focusin.buttoncontainer.' + this.tray_id, 'body', {
                        'view': this
                    }, function(e) {
                        var view = e.data.view;
                        if (view.isFocusInsideButton(view, e.target)) { //focus is in or on our button
                            view.$el.trigger(self._eventPrefix + '.hide');
                        }
                    });
                } else {
                    this.tabOut = true;
                }
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if ($this.is('.disabled, :disabled')) return;

            if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
                if (e.which == 27)
                    return this.ui.ButtonContainer.trigger('focus').trigger('click');
                return $this.trigger('click');
            }
        },
        initialize: function() {
            this.tray_id = getUID('tray');
            if (!this.model) this.model = new Backbone.Model();
            this.model.set({
                'tray_id': this.tray_id,
                'buttonLabel': this.options.buttonLabel,
                'position': this.options.position,
                'iconClass': this.options.iconClass,
                'buttonClass': this.options.buttonClass
            });
            this.tray = (this.options.tray instanceof Backbone.Marionette.View) ? this.options.tray : (typeof this.options.tray === 'function') ? new this.options.tray() : undefined;

            var self = this;

            //TODO:  factor this out and use a global timing event
            //resize the tray if the window size changes
            //resize gets issued continuously while dragging the size grip so a timer stops the calculations
            if (this.getOption('listenToWindowResize')) {
                var resizer;
                $(window).on('resize.' + this.cid, function() {
                    if (!self.isOpen()) return;
                    if (resizer) clearTimeout(resizer); //prevent resize from going crazy
                    resizer = setTimeout(function() {
                        self.resetBounds();
                        self.resetContainerPosition();
                    }, 100);
                });
            }

            this.listenTo(ResizeUtils.dimensions.centerRegion, 'change:width', function(model) {
                this.resetContainerWidth(model.get('width'));
            }, this);

            //Close if I'm not the droid you are looking for
            this.listenTo(Messaging, this._eventPrefix + '.close', function(cid) {
                if (self.cid !== cid && self.isOpen()) {
                    self.close(this, true);
                }
            });

            this.listenTo(this, this._eventPrefix + '.show', function() {
                this.onAttach();
            });

            if (_.isString(this.getOption('eventChannelName'))) {
                this.listenTo(this, 'all', function(eventName, eventObject) {
                    Messaging.getChannel(self.getOption('eventChannelName')).trigger(eventName, eventObject);
                });
            }
            if (_.isFunction(this.onEndOfInitialize)) {
                this.onEndOfInitialize();
            }
        },
        onRender: function() {
            if (this.tray) {
                this.showChildView('TrayRegion', this.tray);
            }
            this.resetContainerWidth(ResizeUtils.dimensions.centerRegion.get('width'));
        },
        onAttach: function() {
            this.resetBounds();
            this.resetContainerPosition();
        },
        resetBounds: function() {
            //getBoundingClientRect is supposedly much faster than offset but it's read only hence why we need to clone it
            if (this.options.viewport) {
                this.containerBounds = _.pick($(this.options.viewport)[0].getBoundingClientRect(), ['bottom', 'height', 'left', 'right', 'top', 'width']);
            } else {
                //if viewport isn't specified, extend the tray from the bottom of the button to the bottom of the center region
                this.containerBounds = _.pick($('#center-region')[0].getBoundingClientRect(), ['bottom', 'height', 'left', 'right', 'top', 'width']);
                var buttonBounds = this.ui.ButtonContainer[0].getBoundingClientRect(),
                    ext = {
                        top: buttonBounds.bottom,
                        height: this.containerBounds.bottom - buttonBounds.bottom
                    };
                _.extend(this.containerBounds, ext);
            }
        },
        resetContainerWidth: function(regionWidth) {
            regionWidth = regionWidth * (this.getOption('widthScale'));
            if (regionWidth < 450) {
                regionWidth = 450;
            }
            this.ui.TrayContainer.width(regionWidth);
        },
        resetContainerPosition: function() {
            this.ui.TrayContainer.offset({
                top: this.containerBounds.top,
            }).height(this.containerBounds.height).width();
        },
        toggle: function(e) {
            var el = this.$el;
            if (this.isOpen()) {
                el.trigger(this._eventPrefix + '.hide', e);
            } else {
                el.trigger(this._eventPrefix + '.show', e);
            }
        },
        open: function(e, preventShiftFocus) {
            var el = this.$el;
            if (e && e.currentTarget) {
                this.triggerEl = e.currentTarget;
            } else {
                this.triggerEl = this.$('#' + this.tray_id);
            }

            Messaging.trigger(this._eventPrefix + '.close', this.cid); //close the other trays

            //set focus to the first menu item once the tray is open
            if (!preventShiftFocus) {
                this.listenToOnce(this, this._eventPrefix + '.shown', function() {
                    this.setFocusToFirstMenuItem();
                });
            }

            //use the built in bootstrap timer and event to wait for the CSS animation to complete
            this.ui.TrayContainer.off('bsTransitionEnd');
            var self = this;
            this.ui.TrayContainer.one('bsTransitionEnd', function() {
                $(this).attr('aria-hidden', 'false');
                el.trigger(self._eventPrefix + '.shown');
            }).emulateTransitionEnd(TRANSITION_SPEED);

            this.ui.ButtonContainer.attr('aria-expanded', true);
            el.addClass('open');
            Messaging.trigger(this._eventPrefix + '.opened', this.cid);
        },
        close: function(e, preventShiftFocus) {
            var el = this.$el,
                self = this;

            //set focus to the element that opened the tray when the tray is closed, unless it's told to close from another tray
            if (this.triggerEl && !this.tabOut) {
                this.listenToOnce(this, this._eventPrefix + '.hidden', function() {
                    this.triggerEl.focus();
                });
            }

            Messaging.trigger(this._eventPrefix + '.closed', this.cid);

            //use the built in bootstrap timer and event to wait for the CSS animation to complete
            this.ui.TrayContainer.off('bsTransitionEnd');
            this.ui.TrayContainer.one('bsTransitionEnd', function() {
                $(this).attr('aria-hidden', 'true');
                el.trigger(self._eventPrefix + '.hidden');
            }).emulateTransitionEnd(TRANSITION_SPEED);

            this.ui.ButtonContainer.attr('aria-expanded', false);
            el.removeClass('open');
        },
        setFocusToFirstMenuItem: function() {
            var firstmenuitem = this.$('[role=menuitem]:first:visible');
            if (!!firstmenuitem.length) firstmenuitem.trigger('focus');
            else this.ui.TrayContainer.trigger('focus');
        },
        setTrayView: function(view) {
            this.TrayRegion.show(view);
        },
        onBeforeDestroy: function() {
            this.tray.destroy();
        },
        onDestroy: function() {
            $(document).off(this.eventString(), 'body');
            $(document).off('focusin.buttoncontainer.' + this.tray_id, 'body');
            $(window).off('resize.' + this.cid);
        }
    });

    var Orig = TrayView,
        Modified = Orig.extend({
            constructor: function() {
                this.options = _.extend({}, defaultOptions, this.options);
                var args = Array.prototype.slice.call(arguments),
                    init = this.initialize,
                    onRender = this.onRender,
                    onAttach = this.onAttach,
                    onDestroy = this.onDestroy,
                    onBeforeDestroy = this.onBeforeDestroy,
                    events = this.events,
                    argEvents = (args[0]) ? _.extend({}, this.options.events || {}, args[0].events) : _.extend({}, this.options.events);
                this.initialize = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.initialize.apply(this, args);
                    if (Orig.prototype.initialize === init) return;
                    init.apply(this, args);
                };
                this.onRender = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.onRender.apply(this, args);
                    if (Orig.prototype.onRender === onRender) return;
                    onRender.apply(this, args);
                };
                this.onAttach = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.onAttach.apply(this, args);
                    if (Orig.prototype.onAttach === onAttach) return;
                    onAttach.apply(this, args);
                };
                this.onDestroy = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.onDestroy.apply(this, args);
                    if (Orig.prototype.onDestroy === onDestroy) return;
                    onDestroy.apply(this, args);
                };
                this.onBeforeDestroy = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.onBeforeDestroy.apply(this, args);
                    if (Orig.prototype.onBeforeDestroy === onBeforeDestroy) return;
                    onBeforeDestroy.apply(this, args);
                };
                this.events = _.extend({}, (typeof Orig.prototype.events == 'function') ? Orig.prototype.events(this._eventPrefix) : Orig.prototype.events, (typeof this.events == 'function') ? this.events() : this.events, (typeof argEvents == 'function') ? argEvents() : argEvents);
                if (args[0] && args[0].events) {
                    delete args[0].events; //required or else Backbone will destroy our inherited events
                }
                if (this.options.events) {
                    delete this.options.events; //required or else Backbone will destroy our inherited events
                }

                Orig.prototype.constructor.apply(this, args);
            }
        });
    TrayView = Modified;

    return TrayView;
});