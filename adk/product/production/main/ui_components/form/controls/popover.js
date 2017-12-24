define([
    'backbone',
    'handlebars',
    'underscore',
    'main/ui_components/form/control/controlService',
    'main/ui_components/form/controls/button'
], function(
    Backbone,
    Handlebars,
    _,
    ControlService,
    ButtonControl
) {
    'use strict';

    var PopoverConfirmationBehavior = Backbone.Marionette.Behavior.extend({
        initialize: function() {
            this.eventString = _.get(this.options, 'eventToTrigger', null);
            if (_.isString(this.eventString)) {
                this.view.onShow = function() {};
                this.view.items = this.getContent();
            } else {
                console.error("Failed to add Confirmation Behavior to ADK.UI.Form's Popover Control. Missing required 'eventToTrigger' string.\nInvalid 'eventToTrigger' string: ", this.eventToTrigger);
            }
        },
        getContent: function() {
            return new ControlService.Fields([{
                control: 'container',
                template: _.get(this.options, 'message', 'All unsaved changes will be lost. Are you sure you want to cancel?'),
                extraClasses: ['all-padding-sm']
            }, {
                control: 'container',
                tagName: 'div',
                extraClasses: ['popover-confirmation-footer'],
                items: [{
                    control: 'button',
                    name: 'confirm-dismiss-button',
                    label: _.get(this.options, 'dismissButtonLabel', 'No'),
                    type: 'button',
                    extraClasses: ['btn-default', 'btn-sm', 'close']
                }, {
                    control: "button",
                    name: 'confirm-cancel-button',
                    label: _.get(this.options, 'confirmButtonLabel', 'Yes'),
                    type: "button",
                    extraClasses: ['btn-default', 'btn-sm']
                }]
            }], { formView: _.get(this, 'field.formView') });
        },
        triggerEvent: function() {
            if (_.isString(this.eventString)) {
                var workflow = _.get(this.view, 'model._formView.workflow', null);
                var currentFormView = workflow.getCurrentFormView || null;
                if (_.isFunction(currentFormView)) {
                    currentFormView = _.bind(currentFormView, workflow)() || {};
                    if (currentFormView.$el) {
                        currentFormView.$el.trigger(this.eventString);
                    } else {
                        console.error('Error Retrieveing Current Form View');
                    }
                } else {
                    console.error('Error Retrieveing Current Workflow');
                }
            }
        },
        onShow: function() {
            var behavior = this;
            var popoverView = this.view;
            var customOptions = popoverView.field.get('options') || {};
            popoverView.parentButtonView = popoverView._parentLayoutView().popoverButton;
            var popoverParentElement = popoverView.parentButtonView.$el;
            var popoverHeaderTemplate = '<span aria-hidden="true" class="fa fa-warning color-orange-dark font-size-14 right-margin-xs"></span><h3 class="popover-title"></h3>';
            var popoverOptions = {
                html: true,
                title: _.get(this.options, 'title', undefined) || '',
                content: popoverView.$('>'),
                placement: 'top',
                trigger: customOptions.trigger,
                delay: customOptions.delay,
                template: '<div class="popover popover--confirmation" role="tooltip" tabindex="-1"><div class="arrow"></div><div class="popover--confirmation-header">' + popoverHeaderTemplate + '</div><div class="popover-content"></div></div>'
            };
            if (!_.isUndefined(customOptions.container) && !_.isUndefined(customOptions.viewport)) {
                popoverOptions.container = customOptions.container;
                popoverOptions.viewport = customOptions.viewport;
                popoverOptions.content = popoverView.$('>').clone(true, true);
            }
            var popoverButton = popoverParentElement.find('button').first();
            var headerString = _.get(this.options, 'title', undefined);
            if (_.isString(headerString)) {
                popoverButton.attr('title', headerString);
            }
            // instantiate the popover
            popoverView.popover = popoverButton.popover(popoverOptions);
            // define popover methods
            popoverView.popover.on("shown.bs.popover", function(event) {
                var triggerButton = $(event.target);
                popoverParentElement.find('.close').click(function() {
                    triggerButton.popover('hide').focus();
                });
                triggerButton.addClass('popover-shown');
                popoverParentElement.find('.popover--confirmation').focus();
                popoverParentElement.find('.confirm-cancel-button button').on('click.confirm-cancel', function() {
                    triggerButton.popover('hide').focus();
                    _.bind(behavior.triggerEvent, behavior)();
                });
                // click outside hider
                $(document).on('click.hideConfirmationPopover', function(e) {
                    var jTarget = $(e.target);
                    if ((jTarget !== triggerButton) && (!popoverParentElement.find(jTarget).length)) {
                        triggerButton.popover('hide').focus();
                    }
                });
                // focus within/outside cancellation of popover
                $(document).on('keyup.hideConfirmationPopover', function(e) {
                    if (e.keyCode === 9) {
                        // define newly focused element
                        var focusedElement = popoverParentElement.find(':focus');
                        if (!focusedElement.length || (focusedElement[0] === triggerButton[0])) {
                            triggerButton.popover('hide');
                        }
                    }
                });
            });
            popoverView.popover.on("hide.bs.popover", function(event) {
                var triggerButton = $(event.target);
                $(document).off('.hideConfirmationPopover');
                popoverParentElement.find('.confirm-cancel-button button').off('click.confirm-cancel');
                triggerButton.removeClass('popover-shown');
                triggerButton.data("bs.popover").inState.click = false;
            });
            popoverView.field.on("change:popover:button:disabled", function(booleanValue, target) {
                if (!!booleanValue) {
                    $(target).find('button.popover-shown').popover('hide');
                }
            });
        },
        onBeforeDestroy: function() {
            var popoverView = this.view;
            var popoverParentElement = popoverView.parentButtonView.$el;
            $(document).off('.hideConfirmationPopover');
            popoverParentElement.off('click.confirm-cancel');
            popoverView.popover.off("shown.bs.popover").off("hide.bs.popover");
            popoverView.field.off("change:popover:button:disabled");
        }
    });

    //Collection view for the content in the actual popover
    var PopoverView = ControlService.CollectionViewControl.extend({
        className: function() {
            return 'hidden';
        },
        attributes: {
            'aria-hidden': 'true'
        },
        behaviors: _.defaults({
            NestableContainer: {
                behaviorClass: ControlService.Behaviors.NestableContainer
            }
        }, _.omit(ControlService.CompositeViewControl.prototype.behaviors, ['HideEvent', 'ErrorMessages'])),
        getChildView: function(item) {
            return (item.get('control'));
        },
        childViewOptions: function(model, index) {
            return {
                field: model,
                model: this.model
            };
        },
        constructor: function(options) {
            var originalBehaviors = this.behaviors;
            this.behaviors = _.get(options, 'field.attributes.behaviors', {});
            _.forOwn(this.behaviors, function(value, key) {
                if (_.isEqual(key, 'Confirmation')) {
                    value.behaviorClass = PopoverConfirmationBehavior;
                }
            });
            _.extend(this.behaviors, originalBehaviors);
            ControlService.CollectionViewControl.prototype.constructor.apply(this, arguments);
        },
        initialize: function(options) {
            this.model = options.model;
            this.field = options.field || undefined;
            this.containerTemplate = this.field.get('template') || undefined;
            this.containerTemplate = this.template || undefined;
            if (this.containerTemplate) {
                this.template = (_.isFunction(this.containerTemplate) ? this.containerTemplate : Handlebars.compile(this.containerTemplate));
            }

            this.items = this.items || this.field.get("items") || this.defaults.items;
            if (!(this.items instanceof Backbone.Collection))
                this.items = new ControlService.Fields(this.items, { formView: _.get(this, 'field.formView') });
            this.collection = this.items;

            this.collection.bind('remove', this.render);
        },
        onShow: function() {
            var customOptions = this.field.get('options') || {};
            this.parentButtonView = this._parentLayoutView().popoverButton;
            var self = this;
            var popoverOptions = {
                html: true,
                content: self.$('>'),
                placement: customOptions.placement,
                trigger: customOptions.trigger,
                template: '<div accesskey="p" class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div><div class="sr-only">End of tooltip. Escape to exit.</div></div>',
                delay: customOptions.delay
            };
            if (!_.isUndefined(customOptions.container) && !_.isUndefined(customOptions.viewport)) {
                popoverOptions.container = customOptions.container;
                popoverOptions.viewport = customOptions.viewport;
                popoverOptions.content = self.$('>').clone(true, true);
            }

            var onPopoverKeydown = function onPopoverKeydown(event) {
                if (event.which === 27) {
                    event.stopPropagation();
                    self.popover.popover('hide');
                    self.popover.focus();
                }
            };

            self.popover = self.parentButtonView.$el.find('button').first()
                .popover(popoverOptions);
            self.popover.on("show.bs.popover", function(event) {
                self.parentButtonView.$el.find('button').addClass('popover-shown');
            });
            self.popover.on("shown.bs.popover", function(event) {
                self.popover.data('bs.popover').$tip.on('keydown', onPopoverKeydown);
            });
            self.popover.on("hide.bs.popover", function(event) {
                self.parentButtonView.$el.find('button').removeClass('popover-shown');
                var popover = self.parentButtonView.$el.find('.popover');
                popover.hide();
                self.$el.append(popover.find('.popover-content >'));
                self.popover.data('bs.popover').$tip.off('keydown', onPopoverKeydown);
            });
         
            self.parentButtonView.$el.find('button').first().attr('data-original-title', this.field.get('header'));
        }
    });
    //Define Popover Control Prototype
    var PopoverControl = ControlService.LayoutViewControl.extend({
        regions: {
            popoverButton: ".popover-button-region",
            popoverContent: ".popover-content-region"
        },
        defaults: {
            options: {
                trigger: "click",
                label: 'popover',
                type: 'button',
                header: "",
                content: "",
                placement: "right",
                delay: 0,
                tabable: true
            },
            items: [],
            extraClasses: []
        },
        template: Handlebars.compile([
            '<div class="popover-button-region"></div>',
            '<div class="popover-content-region"></div>'
        ].join('\n')),
        behaviors: _.omit(ControlService.Control.prototype.behaviors, ['ExtraClasses', 'DefaultClasses', 'ErrorMessages']),
        initialize: function(options) {
            this.initOptions(options);
            this.setFormatter();
            this.listenToFieldName();
            this.field = options.field;
            this.model = options.model;
            //Override the popover button type to just be a button
            this.field.set('type', 'button');
            var ButtonView = ButtonControl.extend({
                events: _.defaults({
                    "control:disabled": function(event, booleanValue) {
                        if (_.isBoolean(booleanValue)) {
                            this.setBooleanFieldOption("disabled", booleanValue, event, {
                                silent: true
                            });
                            this.$('> button').attr('disabled', booleanValue);
                            this.field.trigger('change:popover:button:disabled', booleanValue, event.currentTarget);
                        }

                    }
                }, ButtonControl.prototype.events),
            });
            this.buttonView = new ButtonView(options);
            this.popoverContentView = new PopoverView({
                field: this.field,
                model: this.model
            });
        },
        onRender: function() {
            // Don't pass this.region to this function. Marionette does it for you
            // under the covers.
            this.showChildView("popoverButton", this.buttonView);
            this.showChildView("popoverContent", this.popoverContentView);
        },
        events: _.defaults({
            "control:popover:hidden": function(event, shouldHide) {
                if (_.isBoolean(shouldHide)) {
                    if (shouldHide) {
                        if (this.popoverButton.$el.find('button').hasClass('popover-shown')) {
                            this.popoverButton.$el.find('button').first().click();
                        }
                    } else {
                        this.popoverButton.$el.find('button').first().popover('show');
                    }
                }
            }
        }, ControlService.LayoutViewControl.prototype.events),
        className: function() {
            return "control";
        }
    });

    return PopoverControl;
});