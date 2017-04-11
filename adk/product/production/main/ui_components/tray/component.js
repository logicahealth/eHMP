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
        'listenToWindowResize': true,
        'containerHeightDifference': 0
    };

    var TRANSITION_SPEED = 200;
    var TRAY_LOADER_CLASS = 'tray-loader';

    var TrayView = Backbone.Marionette.LayoutView.extend({
        _eventPrefix: 'tray',
        template: Handlebars.compile([
            '<button type="button" id={{tray_id}} class="btn btn-default{{#if buttonClass}} {{buttonClass}}{{/if}}" data-toggle="sidebar-tray" title="Press enter to activate menu" aria-expanded="false">{{#if iconClass}}<i class="{{iconClass}}" aria-hidden="true"></i> {{/if}}{{buttonLabel}} <i class="icon fa fa-angle-double-{{position}}"></i></button>',
            '<div role="region" class="sidebar-tray {{position}}" aria-labelledby="{{tray_id}}" aria-hidden="true" tabindex="-1" data-tray-width-scale="{{widthScale}}"/>'
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
            'TrayRegion': '@ui.TrayContainer',
            'ButtonRegion': '@ui.ButtonContainer'
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
            eventsHash[prefix + '.loaderShow'] = function(thisE, options) {
                this.loaderShow(thisE, options);
            };
            eventsHash[prefix + '.loaderHide'] = function(thisE) {
                this.loaderHide(thisE);
            };
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
                        var showOptions = this.TrayRegion.currentView instanceof this.getOption('tray') ? {
                            preventDestroy: true
                        } : {};
                        this.TrayRegion.show(viewToShow, showOptions);
                        this.configureDateTimepickerEvents(this.TrayRegion.currentView);
                        this.setFocusToFirstMenuItem();
                    }
                }
            };
            return eventsHash;
        },
        _loaderTimeout: null,
        _loaderFocusedElement: null,
        loaderShow: function(tray, options) {
            // set default args and merge custom ones
            var args = _.extend({
                loadingString: 'Loading',
                delayString: 'Still loading, please wait',
                extraClasses: null,
                delayTimeout: null
            }, options);
            // verify if there's an active loader
            var loadingDiv = this.$('.' + TRAY_LOADER_CLASS);
            // the function to change the current message within an active loader
            var changeLoaderMessage = function(loader, message) {
                loader.find('.tray-loader-message').html(message);
            };
            // create/change the loader
            if (loadingDiv.length) {
                // if there's an active loader, just change the message
                changeLoaderMessage(loadingDiv, args.loadingString);
            } else {
                // create a new loader
                var loaderClass = TRAY_LOADER_CLASS;
                if (args.extraClasses) {
                    if (_.isString(args.extraClasses)) {
                        loaderClass += ' ' + args.extraClasses;
                    } else if (_.isArray(args.extraClasses)) {
                        loaderClass += (args.extraClasses.length ? ' ' : '') + args.extraClasses.join(' ');
                    }
                }
                var trayDiv = this.$('.sidebar-tray');
                loadingDiv = $('<div class="' + loaderClass + '" tabindex="0"><span class="tray-loader-animation"><i class="fa fa-spinner fa-spin loader-spinner" aria-hidden="true"></i> <span class="tray-loader-message" aria-live="polite"></span></span></div>');
                // check if the focused element is within the tray and hold it in the model to send focus back to it once loading has finished.
                this._loaderFocusedElement = this.$(':focus');
                // insert loader in the document
                trayDiv.append(loadingDiv);
                // prevent the tray/writeback elements from being focused by tabbing when loader in place
                trayDiv.on('keydown.trayFocusAction', function(e) {
                    // skip the tray and focus the loader directly if tab goes forward
                    if (e.keyCode === 9 && !e.shiftKey && !loadingDiv.is(':focus')) {
                        e.preventDefault();
                        e.stopPropagation();
                        loadingDiv.focus();
                    }
                });
                loadingDiv.on('keydown.loaderFocusHolder', function(e) {
                    //skip the tray elements and focus the tray element itself if tabbing backwards
                    if (e.keyCode === 9 && e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        trayDiv.focus();
                    }
                });
                var loadingMessageSpan = this.$el.find('.tray-loader-message');
                // show the loader and focus it if the focus was within the area to be loaded
                if (this._loaderFocusedElement.length) {
                    loadingMessageSpan.removeAttr('aria-live');
                    loadingDiv.focus();
                    loadingMessageSpan.html(args.loadingString);
                    loadingMessageSpan.attr('aria-live', 'polite');
                } else {
                    loadingMessageSpan.html(args.loadingString);
                }
                loadingDiv.animate({
                    opacity: '1'
                }, 300);
            }
            // if there's a delay value, set the timeout to express that the loading is taking longer than expected
            if (args.delayTimeout) {
                this._loaderTimeout = setTimeout(function() {
                    changeLoaderMessage(loadingDiv, args.delayString);
                }, args.delayTimeout);
            }
        },
        loaderHide: function(tray) {
            // loader removal function
            // remove loader delay timeout
            clearTimeout(this._loaderTimeout);
            // instantiate the loader element
            var theLoader = this.$('.' + TRAY_LOADER_CLASS);
            theLoader.off('**');
            // remove the tab interception from the tray
            var theTray = this.$('.sidebar-tray');
            theTray.off('keydown.trayFocusAction');
            // remove the loader
            theLoader.remove();
            if (this.isOpen()) {
                // if we took the focus from somewhere, send it back (if it's there and it is focusable)
                if (this._loaderFocusedElement && this._loaderFocusedElement.length && this._loaderFocusedElement.is(':focusable')) {
                    this._loaderFocusedElement.focus();
                } else {
                    // send it back to the tray, where it defaults to.
                    theTray.focus();
                }
            }
        },
        configureDateTimepickerEvents: function(view) {
            this.disableDateTimepickerEvents(view);
            view.$('form, .modal-body').on('scroll.datepicker', _.throttle(_.bind(function() {
                //these elements belong to children of the region's view so we can't listen to their events to set the state
                this.$('.datepicker-input').datepicker('hide');
                this.$('.bootstrap-timepicker > input').timepicker('hideWidget');
            }, this), 1000));
        },
        disableDateTimepickerEvents: function(view) {
            view.$('form, .modal-body').off('scroll.datepicker');
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
        isFocusInsideGrowl: function(target) {
            return (/growl-alert/).test(target.className) || !!$('.growl-alert').find(target).length;
        },
        documentHandler: function(e) {
            //safer than using stopPropagation since stopProp would prevent the click from bubbling and wouldn't trigger the close
            //if another tray recieves focus or click
            var view = e.data.view;
            if (view.isFocusInside(view, e.target) || (!view.tabOut && view.getOption('preventFocusoutClose')) || view.isFocusInsideGrowl(e.target)) return;
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
                if (/(13|32)/.test(e.which)) return $this.trigger('click');
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
                'buttonClass': this.options.buttonClass,
                'widthScale': _.round(this.options.widthScale, 2)
            });
            this.tray = (this.options.tray instanceof Backbone.Marionette.View) ? this.options.tray : (typeof this.options.tray === 'function') ? new this.options.tray() : undefined;

            var self = this;

            //resize the tray if the window size changes
            //resize gets issued continuously while dragging the size grip so a timer stops the calculations
            if (this.getOption('listenToWindowResize')) {
                this.listenTo(ResizeUtils.dimensions.contentRegion, 'change:width', function(model, value) {
                    this.resetContainerWidth(model.get('width'));
                    this.resetBounds();
                    this.resetContainerPosition();
                    this.$('.bootstrap-timepicker > input').timepicker('place');
                }, this);
            }

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
            $(document).on('show.bs.modal.' + this.cid, '.modal', _.bind(function(event) {
                this.modalShowHandler();
            }, this));
        },
        onBeforeShow: function() {
            if (this.tray) {
                this.showChildView('TrayRegion', this.tray);
            }
            var ButtonView = this.getOption('buttonView');
            if (_.isFunction(ButtonView)) {
                ButtonView = ButtonView.extend({
                    templateHelpers: {
                        buttonLabel: this.getOption('buttonLabel')
                    }
                });
                this.showChildView('ButtonRegion', new ButtonView());
            }
        },
        onRender: function() {
            this.resetContainerWidth();
        },
        onAttach: function() {
            this.resetContainerWidth();
            this.resetBounds();
            this.resetContainerPosition();
        },
        resetBounds: function() {
            //getBoundingClientRect is supposedly much faster than offset but it's read only hence why we need to clone it
            if (this.options.viewport) {
                this.containerBounds = _.pick($(this.options.viewport)[0].getBoundingClientRect(), ['bottom', 'height', 'left', 'right', 'top', 'width']);
            } else {
                //if viewport isn't specified, extend the tray from the bottom of the button to the bottom of the center region
                this.containerBounds = _.pick($('#content-region')[0].getBoundingClientRect(), ['bottom', 'height', 'left', 'right', 'top', 'width']);
                var buttonBounds = this.ui.ButtonContainer[0].getBoundingClientRect(),
                    ext = {
                        top: buttonBounds.bottom,
                        height: this.containerBounds.bottom - buttonBounds.bottom
                    };
                _.extend(this.containerBounds, ext);
            }
        },
        resetContainerWidth: function() {
            var regionWidth = 0;
            if (this.getOption('viewport') && $(this.getOption('viewport'))[0]) {
                regionWidth = $(this.getOption('viewport'))[0].getBoundingClientRect().width;
            } else {
                regionWidth = ResizeUtils.dimensions.contentRegion.get('width');
            }
            regionWidth = regionWidth - 5;
            regionWidth = regionWidth * (this.getOption('widthScale'));
            if (regionWidth < 363) {
                regionWidth = 363;
            }
            this.ui.TrayContainer.width(regionWidth).find('>').outerWidth(regionWidth).attr('data-tray-width', regionWidth);
        },
        resetContainerPosition: function() {
            var offset = 0;
            if (_.isEqual(this.options.position, 'right')) {
                offset = ResizeUtils.dimensions.viewport.get('width') - this.containerBounds.right || 0;
                this.ui.TrayContainer.css({
                    top: this.containerBounds.top,
                    right: offset
                }).height(this.containerBounds.height - this.options.containerHeightDifference).width();
            } else {
                offset = this.containerBounds.left || 0;
                this.ui.TrayContainer.css({
                    top: this.containerBounds.top,
                    left: offset
                }).height(this.containerBounds.height - this.options.containerHeightDifference).width();
            }
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
            clearTimeout(this._loaderTimeout);
            if (_.has(this, 'TrayRegion') && this.TrayRegion.hasView()) this.disableDateTimepickerEvents(this.TrayRegion.currentView);
            this.tray.destroy();
        },
        modalShowHandler: function(showEvent) {
            var previousPreventFocustoutClose = this.getOption('preventFocusoutClose');
            var tabOutEnabled = _.isBoolean(this.tabOut) && this.tabOut;
            this.options.preventFocusoutClose = true;
            delete this.tabOut;
            $(document).one('hidden.bs.modal.' + this.cid, '.modal', _.bind(function(hiddenEvent) {
                this.modalHiddenHandler(hiddenEvent, previousPreventFocustoutClose, tabOutEnabled);
            }, this));
        },
        modalHiddenHandler: function(event, previousPreventFocustoutClose, tabOutEnabled) {
            this.options.preventFocusoutClose = previousPreventFocustoutClose;
            if (tabOutEnabled) {
                this.tabOut = tabOutEnabled;
            }
        },
        onDestroy: function() {
            $(document).off(this.eventString(), 'body');
            $(document).off('focusin.buttoncontainer.' + this.tray_id, 'body');
            $(window).off('resize.' + this.cid);
            $(document).off('show.bs.modal.' + this.cid);
            $(document).off('hidden.bs.modal.' + this.cid);
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