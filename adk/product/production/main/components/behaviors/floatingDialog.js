define([
    'backbone',
    'marionette',
    'api/Messaging'
], function(Backbone, Marionette, Messaging) {
    "use strict";

    var ControllerView = Backbone.Marionette.LayoutView.extend({
        component: 'dialog',
        events: function() {
            var events = {};
            var component = this.getOption('component');
            events['before:show' + component] = function(e) {
                Messaging.getChannel(component).trigger('close:' + component);
                this.trigger('before:show' + component, e, this);
            };
            events['after:show' + component] = function(e) {
                this.DialogRegion.$el.addClass(component + '-open');
                this.$el.addClass(component + '-active');
                if (component === "toolbar") {
                    if(this.$el.prop("tagName") === "LI") {
                        this.$('.gist-item').addClass('background-color-primary-lighter');
                    } else {
                        this.$el.addClass('background-color-primary-lighter');
                    }
                }
                this.trigger('after:show' + component, e, this);
            };
            events['before:hide' + component] = function(e) {
                this.trigger('before:hide' + component, e, this);
            };
            events['after:hide' + component] = function(e) {
                this.DialogRegion.$el.removeClass(component + '-open');
                this.$el.removeClass(component + '-active');
                if (component === "toolbar") {
                    if(this.$el.prop("tagName") === "LI") {
                        this.$('.gist-item').removeClass('background-color-primary-lighter');
                    } else {
                        this.$el.removeClass('background-color-primary-lighter');
                    }
                }
                this.trigger('after:hide' + component, e, this);
            };
            return events;
        },
        //events fired on view which signifies the opening of a dialog
        dialogEventString: 'modal.show workflow.show',
        onRegionShow: function(child, region) {
            var component = this.getOption('component');

            //close all the others
            this.listenToOnce(Messaging.getChannel(component), 'close:' + component, this.closeDialog);

            //setup listener for modal/workflow
            this.listenTo(child, this.dialogEventString, function(child, evName) {
                this.trigger(evName, child, evName);
            });

            //setup things to do when we destroy it
            this.listenToOnce(child, 'before:destroy', function(child) {
                this.stopListening(child, this.dialogEventString);
                this.trigger('detach:' + component, child);
            });
            this.listenToOnce(child, 'destroy', function(e) {
                this.$el.trigger('after:hide' + component);
            });

            //trigger the $el that it's shown now
            this.$el.trigger('after:show' + component);
        },
        openDialog: function() {
            //create the view as we show it
            var component = this.getOption('component');

            this.$el.trigger('before:show' + component);

            this.listenToOnce(this.DialogRegion, 'show', this.onRegionShow);

            var View = this.getOption('DialogView'),
                view = new View(this.options);

            this.listenToOnce(view, 'attach', function(e) {
                this.trigger('attach:' + component, view);
            });

            view.delegate('keydown', this.keyHandler);
            this.DialogRegion.show(view);
        },
        closeDialog: function() {
            //destroy it when we hide it
            var component = this.getOption('component');

            this.$el.trigger('before:hide' + component);

            this.DialogRegion.empty();
        },
        isActive: function() {
            //if the region has a view, it's visible
            return this.DialogRegion.hasView();
        }
    });


    var FloatingDialog = Backbone.Marionette.Behavior.extend({
        components: 'dialog',
        position: 'top',
        events: function() {
            var events = {
                'dropdown.show': function(e, $dropdownEl) {
                    if (!!this.getOption('preventFocusoutClose')) return;
                    this.preventFocusoutClose = true;
                },
                'dropdown.hide': function(ev, passedEv) {
                    this.preventFocusoutClose = false;
                    this.documentHandler(passedEv);
                },
                'keydown': 'keyHandler'
            };
            var component = this.getOption('component');

            if (this.ui.TriggerEl && !!this.ui.TriggerEl.length) {
                events['click @ui.TriggerEl'] = function(e) {
                    if (this.shouldToggle())
                        this.$(e.target).trigger(component + '.show');
                    else
                        this.$(e.target).trigger(component + '.hide');
                };
                events[component + '.hide @ui.TriggerEl'] = 'deactivate';
                events[component + '.show @ui.TriggerEl'] = 'activate';
            } else {
                events.click = function(e) {
                    if (this.isTargetInsideDialog(e.target) || !this.isTargetInsideTriggerEl(e.target)) return;

                    if (this.shouldToggle())
                        this.$el.trigger(component + '.show');
                    else
                        this.$el.trigger(component + '.hide');
                };
                events[component + '.hide'] = 'deactivate';
                events[component + '.show'] = 'activate';
            }

            return events;
        },
        isActive: function() {
            return this.controller.isActive();
        },
        shouldToggle: function() {
            return !this.isActive();
        },
        activate: function(e) {
            if (e) {
                if (e.isDefaultPrevented()) return;
                e.preventDefault();
            }
            if (this.isActive()) this.controller.closeDialog();
            this.controller.openDialog();
        },
        deactivate: function(e) {
            if (e) {
                if (e.isDefaultPrevented()) return;
                e.preventDefault();
            }
            this.controller.closeDialog();
        },
        initialize: function(options, view) {
            this.options = _.extend({
                'DialogView': this.DialogView,
                'component': this.component,
                'position': this.position,
                'targetView': view
            }, options);
            this.options[this.component + '_id'] = view.cid;

            if (!this.getOption('DialogView')) throw new Error('DialogView must be specified:  A view definition must be set to the DialogView attribute on this behavior.');

            //if the 'triggerSelector' points to this.$el, the ui hash can't be set
            //so there is a provision for this case in the render listener
            this.ui.TriggerEl = this.getOption('triggerSelector') || view.el;
        },
        onBeforeRender: function() {
            if (!this.controller) return;
            //destroy the controller, release it, and stop listening to it
            this.stopListening(this.controller);
            this.controller.destroy();
            delete this.controller;
        },
        onRender: function(options) {
            var DialogContainer,
                component = this.getOption('component');

            if (this.getOption('DialogContainer')) {
                DialogContainer = ControllerView.extend({
                    el: this.el,
                    regions: {
                        'DialogRegion': this.getOption('DialogContainer')
                    },
                    'keyHandler': _.bind(this.keyHandler, this)
                });
            } else {
                DialogContainer = ControllerView.extend({
                    el: this.el,
                    regions: {
                        'DialogRegion': Backbone.Marionette.Region.extend({
                            'el': 'body',
                            attachHtml: function(view) {
                                this.el.appendChild(view.el);
                            }
                        })
                    },
                    'keyHandler': _.bind(this.keyHandler, this)
                });
            }
            this.controller = new DialogContainer(this.options);
            this.configureEvents(this.controller);

            //if we don't have a UI hash, we have to get our own ref
            //when the ui hash is setup in the render method, it wipes out the original and sets the references
            //to the hash attribute.  If it's empty, it means it wasn't found
            this.$triggerEl = (_.isEmpty(this.ui.TriggerEl)) ? this.$el : this.ui.TriggerEl;
            this.$triggerEl.attr('dialog-toggle', this.getOption('component'));
        },
        configureEvents: function(view) {
            var component = this.getOption('component');

            this.listenTo(view, 'attach:' + component, function(view) {
                this.positionDialog(view);
                if (!!this.$(this.controller.DialogRegion.el).length) {
                    return;
                }

                //handle resizing if the dialog is attached to something that isn't in our view
                this.external = true;
                this.listenToOnce(Messaging, 'gridster:resize', function() {
                    this.$el.trigger(component + '.hide');
                });
                $(window).one('resize.' + this.view.cid, _.bind(function() {
                    this.$el.trigger(component + '.hide');
                }, this));
            });

            this.listenTo(view, 'detach:' + component, function(view) {
                if (this.external) {
                    this.stopListening(Messaging, 'gridster:resize');
                    $(window).off('resize.' + this.view.cid);
                    delete this.external;
                }
            });

            this.listenTo(view, 'before:show' + component, function() {
                if (!this.getOption('preventFocusoutClose')) {
                    $(document).off(this.eventString(), 'body'); //don't add a duplicate
                    $(document).on(this.eventString(), 'body', _.bind(this.documentHandler, this));
                }
            });

            this.listenTo(view, 'before:hide' + component, function(e) {
                $(document).off(this.eventString(), 'body');
            });

            this.listenTo(view, ControllerView.prototype.dialogEventString, this.modalActive);

            //There are inconsistent methods for opening up a workflow modal.
            //This messaging is so all click handling persists as intended, regardless of how the modal is opened:
            this.listenTo(Messaging.getChannel('toolbar'), 'open:worflow:modal', function(el) {
                this.preventFocusoutClose = true;

                $('#workflow-region').one('hidden.bs.modal.' + this.view.cid, _.bind(function() {
                    delete this.preventFocusoutClose;
                }, this));
            });

            this.triggerMethod('configureEvents', view);
        },
        eventString: function() {
            return 'focusin.' + this.view.cid + ' click.' + this.view.cid;
        },
        documentHandler: function(e) {
            if (!e) return;
            if (this.preventHide(e.target) || e.target.tagName === 'TABLE') { //prevent JAWS from hijacking focus to a <table> element
                return;
            }
            this.$triggerEl.trigger(this.getOption('component') + '.hide');
        },
        keyHandler: function(event) {
            //enter and spacebar
            if (/(13|32)/.test(event.which)) {
                this.$triggerEl.trigger('click', event);
                event.preventDefault();
                return;
            }

            //tab
            if (!this.external || !/(9)/.test(event.which) || !this.controller.isActive()) return;

            //tab backward -- close toolbar
            if (event.shiftKey && this.isTargetInsideTriggerEl(event.target)) {
                this.$el.trigger(this.getOption('component') + '.hide');
                return;
            }

            //tabbing into the dialog
            if (this.isTargetInsideTriggerEl(event.target) && !event.shiftKey) {
                event.preventDefault();
                this.giveButtonFocus(this.controller.DialogRegion.currentView.$el);
                return;
            }

            //get every actionable item in the DOM
            var inputs = $(':input, a, [tabindex]').filter(function() {
                if (!this.tabIndex) return true;
                return this.tabIndex >= 0;
            });

            //no inputs, no point
            if (!inputs.length) return;

            var increment = (event.shiftKey) ? -1 : 1;

            //check to see if our next target is inside our container and eject if so
            var nextTabEl = inputs.get(inputs.index(document.activeElement) + increment);
            if (this.isTargetInsideDialog(nextTabEl)) return;

            var nextInput = (this.isTargetInsideDialog(event.target) && event.shiftKey) ? this.$triggerEl : inputs.get(inputs.index(this.$triggerEl[0]) + increment);
            if (nextInput) {
                nextInput.focus();
                event.preventDefault();
            }
        },
        modalActive: function(child, evName) {
            switch (evName) {
                case 'modal.show':
                    this.preventFocusoutClose = true;
                    $('#modal-region').one('hidden.bs.modal.' + this.view.cid, _.bind(function() {
                        child.$el.focus();
                        delete this.preventFocusoutClose;
                    }, this));
                    break;
                case 'workflow.show':
                    this.preventFocusoutClose = true;
                    $('#workflow-region').one('hidden.bs.modal.' + this.view.cid, _.bind(function() {
                        child.$el.focus();
                        delete this.preventFocusoutClose;
                    }, this));
                    break;
            }
        },
        preventHide: function(target) {
            return !!this.getOption('preventFocusoutClose') || this.el === target || !!this.$(target).length || this.el.parentElement.contains(target) || this.isTargetInsideDialog(target);
        },
        isTargetInsideTriggerEl: function(target) {
            return this.$triggerEl[0] === target || !!this.$triggerEl.find(target).length;
        },
        isTargetInsideDialog: function(target) {
            var currentView = this.controller.DialogRegion.currentView;
            if (!currentView) return false;
            return currentView.el === target || !!currentView.$(target).length;
        },
        isTargetInsideSibling: function(target) {
            return target.hasAttribute('dialog-toggle', this.getOption('component'));
        },
        giveButtonFocus: function(el) {
            var $el = el || this.$el;
            var inputs = el.find(':input, a, [tabindex]').filter(function() {
                if (!this.tabIndex) return true;
                return this.tabIndex >= 0;
            }).first().focus();
        },
        positionDialog: function(view) {
            var buttonBounds = this.$triggerEl[0].getBoundingClientRect(),
                dialogBounds = view.el.getBoundingClientRect(),
                config = {};

            switch (view.getOption('position')) { //handle vertical
                case 'top':
                    config.top = buttonBounds.top - dialogBounds.height;
                    if (view.getOption('yOffset')) config.top += view.getOption('yOffset');
                    break;
                case 'bottom':
                    config.top = buttonBounds.bottom;
                    if (view.getOption('yOffset')) config.top += view.getOption('yOffset');
                    break;
                default: //auto--defaults to bottom--if the screen is just too small for it to fit anywhere it will go to the bottom
                    var top = buttonBounds.top - dialogBounds.height + ((view.getOption('yOffset')) ? view.getOption('yOffset') : 0),
                        bottom = buttonBounds.bottom + ((view.getOption('yOffset')) ? view.getOption('yOffset') : 0),
                        offScreenBottom = bottom + dialogBounds.height >= $('body').height(),
                        offScreenTop = top - dialogBounds.height <= 0;

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

            view.$el.offset(config);
        },
        onBeforeDestroy: function() {
            $('#workflow-region').off('hidden.bs.modal.' + this.view.cid);
            $('#workflow-region').off('hidden.bs.modal.' + this.view.cid);
            $(document).off(this.eventString(), 'body');
        },
        onDestroy: function() {
            $(document).off(this.eventString(), 'body');
            this.controller.destroy();
            delete this.controller;
            delete this.$triggerEl;
        }
    });

    return FloatingDialog;
});