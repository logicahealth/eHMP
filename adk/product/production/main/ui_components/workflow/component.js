define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'api/Messaging',
    'main/ui_components/workflow/controllerView',
    'main/ui_components/workflow/containerView',
    'main/adk_utils/resizeUtils'
], function(Backbone, Marionette, $, _, Handlebars, Messaging, ControllerView, ContainerView, ResizeUtils) {
    "use strict";
    var HeaderModel = Backbone.Model.extend({
        defaults: {
            'title': '',
            'actionItems': false,
            'popOutToggle': false
        }
    });

    var SubTrayView = Backbone.Marionette.CompositeView.extend({
        template: Handlebars.compile('<div class="sub-tray-container all-padding-sm bottom-border-grey-light"></div>'),
        childViewContainer: '.sub-tray-container',
        getChildView: function(item) {
            var ButtonView = Backbone.Marionette.ItemView.extend({
                tagName: 'span',
                template: Handlebars.compile('<i class="fa fa-chevron-circle-right fa-stack-2x font-size-14"></i> {{buttonLabel}}')
            });
            var trayViewOptions = _.defaults(item.get('view').prototype.options, {
                preventFocusoutClose: true,
                eventChannelName: item.get('key')
            });
            trayViewOptions = _.defaults({
                viewport: this.getOption('viewport') || null,
                buttonClass: 'btn-sm',
                buttonView: ButtonView,
                position: 'left',
                listenToWindowResize: false,
                additionalTopPadding: 11,
                widthScale: 1
            }, trayViewOptions);
            return item.get('view').extend({
                options: trayViewOptions
            });
        },
        initialize: function() {
            this.collection = Messaging.request('get:components');
        },
        filter: function(child) {
            return child.isOfGroup('sub-tray', this.options.itemKey) && child.get('shouldShow')();
        },
        updateSubTraysMaxHeight: function(maxHeight) {
            this.children.each(function(view) {
                if (_.isFunction(view.resetContainerPosition)) {
                    view._maxHeight = maxHeight;
                    view.resetContainerPosition();
                }
            });
        },
        _buildEventString: function (itemKey, key) {
            return 'subTray:' + itemKey + ':' + key + ':subTrayView';
        },
        onAddChild: function(childView) {
            // work with the childView instance, here
            var key = childView.model.get('key');
            if(_.isString(key)) {
                var eventString = this._buildEventString(this.options.itemKey, key);
                Messaging.reply(eventString, function () { return childView;}, {ready: true});
            }
        },
        onBeforeRemoveChild: function(childView) {
            // work with the childView instance, here
            var key = childView.model.get('key');
            if(_.isString(key)) {
                var eventString = this._buildEventString(this.options.itemKey, key);
                Messaging.stopReplying(eventString, function(){ return childView;});
            }
        }
    });

    var WorkflowView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile([
            '<div class="{{classPrefix}}-content{{#if showProgress}} with-progress-indicator{{/if}}">',
            '{{#if showHeader}}<div class="workflow-header{{#if showInTray}} container-fluid{{/if}}"></div>{{/if}}',
            '{{#if showProgress}}<div class="workflow-progressIndicator"></div>{{/if}}',
            '<div class="subtray-container"></div>',
            '<div class="workflow-controller"></div>',
            '</div>',
        ].join("\n")),
        ui: {
            HeaderRegion: '.workflow-header',
            ProgressIndicatorRegion: '.workflow-progressIndicator',
            ControllerRegion: '.workflow-controller',
            SubTrayRegion: '.subtray-container'
        },
        regions: {
            ControllerRegion: '@ui.ControllerRegion',
            SubTrayRegion: '@ui.SubTrayRegion'
        },
        events: {
            'keydown input': function(e) {
                if (e.which === 13) { //Prevent IE bug which issues data-dismiss in a modal on enter key
                    e.preventDefault();
                }
            },
            'step:changed': function(e, stepModel) {
                e.stopPropagation();
                this.updateSubTrayView(stepModel);
            }
        },
        modelEvents: {
            'change:title': 'render',
            'change:showProgress': 'render',
            'change:showHeader': 'render'
        },
        workflowOptionsDefaults: {
            title: '',
            size: '',
            steps: [],
            backdrop: false,
            keyboard: true,
            headerOptions: {},
            startAtStep: 0,
            classPrefix: 'modal'
        },
        initialize: function(options) {
            this.workflowOptions = _.defaults(options, this.workflowOptionsDefaults);
            this.model = new Backbone.Model();
            this.model.set({
                title: this.workflowOptions.title,
                actionItems: this.workflowOptions.headerOptions.actionItems,
                closeButtonOptions: this.workflowOptions.headerOptions.closeButtonOptions,
                popOutToggle: this.workflowOptions.headerOptions.popOutToggle,
                steps: new Backbone.Collection(this.workflowOptions.steps),
                currentIndex: this.workflowOptions.startAtStep,
                showProgress: (this.workflowOptions.steps.length > 1 ? this.workflowOptions.showProgress || false : false),
                showHeader: (_.isBoolean(this.workflowOptions.showHeader) ? this.workflowOptions.showHeader : true),
                classPrefix: (_.isBoolean(this.workflowOptions.showInTray) && this.workflowOptions.showInTray) ? 'tray' : this.workflowOptions.classPrefix
            });
        },
        onBeforeShow: function() {
            var steps = this.model.get('steps');
            steps.at(0).set({
                'completed': true,
                'currentStep': true,
                'currentIndex': this.model.get('currentIndex') + 1
            });

            _.each(steps.models, function(step) {
                step.set('numberOfSteps', steps.length);
            });

            // Creation of Form Controller
            this.workflowControllerView = new ControllerView({
                model: this.model,
                parentViewInstance: this
            });

            // Creation of Header
            if (this.model.get('showHeader') === true) {
                this.showHeader();
            }
            // Creation of Progressbar View
            if (this.model.get('showProgress') === true) {
                this.showProgressBar();
            }

            // Show of Form Controller
            this.showChildView('ControllerRegion', this.workflowControllerView);

            // Show any sub trays for the first step
            this.updateSubTrayView();
        },
        onBeforeDestroy: function() {
            this.model.get('steps').each(function(stepModel) {
                var subTrayView = stepModel.get('subTrayView');
                if (!_.isUndefined(subTrayView) && (typeof subTrayView.destroy == 'function')) {
                    subTrayView.destroy();
                }
            });
        },
        getFormView: function(index) {
            return this.workflowControllerView.children.findByIndex(index);
        },
        showHeader: function() {
            this.addRegion('HeaderRegion', this.ui.HeaderRegion);
            var workflowTitle = this.model.get('title');
            var workflowpopOutToggle = this.model.get('popOutToggle');
            var workflowCloseButtonOptions = this.model.get('closeButtonOptions') || {};
            var workflowactionItems = this.model.get('actionItems');
            if (workflowTitle || workflowactionItems || this.workflowOptions.header) {
                if (this.workflowOptions.header) {
                    this.HeaderView = this.workflowOptions.header.extend({
                        className: this.model.get('classPrefix') + '-header'
                    });
                } else {
                    this.headerModel = new HeaderModel({
                        'title': workflowTitle,
                        'actionItems': workflowactionItems,
                        'popOutToggle': workflowpopOutToggle,
                        'closeButtonTitle': workflowCloseButtonOptions.title,
                        'defaultCloseButtonAction': !_.isFunction(workflowCloseButtonOptions.onClick),
                        'showCloseButton': true
                    });
                    workflowCloseButtonOptions = _.defaults(workflowCloseButtonOptions, {
                        title: "",
                        onClick: function() {}
                    });
                    this.HeaderView = Backbone.Marionette.ItemView.extend({
                        modelEvents: {
                            'change': 'render'
                        },
                        initialize: function(options) {
                            this.workflowControllerView = options.workflowControllerView;
                            this.model = options.model;
                        },
                        events: {
                            'click .dropdown-menu li a': function(e) {
                                e.preventDefault();
                                var menuOptionForClickedItem = this.model.get('actionItems')[this.$(e.currentTarget).attr('data-item-index')];
                                _.bind(menuOptionForClickedItem.onClick, this.workflowControllerView.getCurrentFormView())();
                            },
                            'click button.close.custom-on-close-method': function(e) {
                                e.preventDefault();
                                _.bind(workflowCloseButtonOptions.onClick, this.workflowControllerView.getCurrentFormView())(e);
                            }
                        },
                        template: Handlebars.compile([
                            '<div class="container-fluid">',
                            '<div class="row">',
                            '<div class="col-xs-10">',
                            '<h4 class="' + this.model.get('classPrefix') + '-title" id="main-workflow-label-{{clean-for-id title}}">{{title}}</h4>',
                            '</div>',
                            '<div class="col-xs-2">',
                            '<div class="header-btns pull-right">',
                            '{{#if actionItems}}',
                            '<div class="col-xs-6 all-padding-no">',
                            '<div class="dropdown">',
                            '<button class="btn btn-icon font-size-16 top-padding-no bottom-padding-no right-padding-sm left-padding-sm dropdown-toggle" type="button" id="action-items-dropdown" data-toggle="dropdown" aria-expanded="true" title="Press enter to view setting options">',
                            '<i class="fa fa-ellipsis-v"></i>',
                            '</button>',
                            '<ul class="dropdown-menu dropdown-menu-right" role="menu" aria-labelledby="action-items-dropdown">',
                            '{{#each actionItems}}',
                            '<li role="presentation"><a role="menuitem" data-item-index={{@index}} href="#">{{label}}</a></li>',
                            '{{/each}}',
                            '</ul>',
                            '</div>',
                            '</div>',
                            '{{/if}}',
                            '{{#if showCloseButton}}',
                            '<div class="text-right top-padding-xs right-padding-no{{#if actionItems}} left-padding-xs col-xs-6{{else}} col-xs-6 col-xs-offset-6{{/if}}">',
                            '<button type="button" class="close btn btn-icon btn-xs{{#if defaultCloseButtonAction}}" data-dismiss="modal"{{else}} custom-on-close-method"{{/if}} title="{{#if closeButtonTitle}}{{closeButtonTitle}}{{else}}Press enter to close.{{/if}}">',
                            '<i class="fa fa-times fa-lg"></i>',
                            '</button>',
                            '</div>',
                            '{{/if}}',
                            '</div>',
                            '</div>',
                            '</div>',
                            '</div>'
                        ].join("\n")),
                        className: this.model.get('classPrefix') + '-header'
                    });
                }
                this.headerView = new this.HeaderView({
                    workflowControllerView: this.workflowControllerView,
                    model: this.headerModel
                });
                this.showChildView('HeaderRegion', this.headerView);
            }
        },
        showProgressBar: function() {
            this.addRegion('ProgressIndicatorRegion', this.ui.ProgressIndicatorRegion);
            var ProgressIndicatorChildView = Backbone.Marionette.ItemView.extend({
                tagName: 'li',
                template: Handlebars.compile('<div{{#if completed}} class="completed"{{/if}}><span class="bubble"></span>{{stepTitle}}{{#if currentStep}}<span class="sr-only">You are currently on step {{currentIndex}} of {{numberOfSteps}}</span>{{/if}}'),
                modelEvents: {
                    'change': 'render'
                }
            });
            this.WorkflowProgressIndicatorView = Backbone.Marionette.CollectionView.extend({
                collection: this.model.get('steps'),
                tagName: 'ul',
                className: 'progress-indicator',
                childView: ProgressIndicatorChildView
            });
            this.workflowProgressIndicatorView = new this.WorkflowProgressIndicatorView();
            this.showChildView('ProgressIndicatorRegion', this.workflowProgressIndicatorView);
        },
        currentStepModel: function(){
            return this.model.get('steps').at(this.model.get('currentIndex'));
        },
        updateSubTrayView: function(stepModel) {
            // Find the backbone model that represents the current step
            var modelOfCurrentStep = stepModel || this.currentStepModel() || null;

            // Check to see if the current step has a sub tray key
            var subTrayKey = modelOfCurrentStep.get('subTrayGroup') || null;
            if (_.isString(subTrayKey)) {
                // The current step must support having sub trays

                // Check to see if a sub tray collection view has
                // already been created and saved on the current step's model,
                // else create and save a new one using the sub tray key.
                if (_.isUndefined(modelOfCurrentStep.get('subTrayView'))) {
                    modelOfCurrentStep.set('subTrayView', new SubTrayView({
                        itemKey: subTrayKey,
                        viewport: this.$el
                    }));
                    // Show the step's collection view of sub trays.
                    this.SubTrayRegion.show(modelOfCurrentStep.get('subTrayView'), {
                        preventDestroy: true
                    });
                } else {
                    // If the sub tray view was already created then attach the view
                    // and it's html to avoid re-rendering of itself or it's children
                    this.SubTrayRegion.empty({
                        preventDestroy: true
                    });

                    var existingViewToAttch = modelOfCurrentStep.get('subTrayView');
                    this.SubTrayRegion.attachView(existingViewToAttch);
                    this.SubTrayRegion.attachHtml(existingViewToAttch);
                }

            } else {
                // No sub tray key found on the current step's model,
                // so this step must be not support having any sub tray(s).

                // Empty the sub tray region to prevent other previously showed step's sub trays from showing.
                this.SubTrayRegion.empty({
                    preventDestroy: true
                });
            }
        },
        toggleSubTray: function(subTrayKey, booleanValue){
            if (this.SubTrayRegion.hasView() && _.isString(subTrayKey) && _.isBoolean(booleanValue)){
                var stepModel = this.currentStepModel() || null;
                if (!_.isUndefined(stepModel)){
                    var subTrayView = Messaging.request('subTray:'+ stepModel.get('subTrayGroup') + ':' + subTrayKey + ":subTrayView");
                    if (!_.isUndefined(subTrayView)){
                        var action = booleanValue ? 'show' : 'hide';
                        subTrayView.$el.trigger('subTray.' + action);
                        return true;
                    }
                }
            }
            return false;
        },
        show: function(showOptions) {
            if (!_.isUndefined(showOptions) && _.isString(showOptions.inTray)) {
                this.showInTray(showOptions.inTray);
            } else {
                var $triggerElem = $(':focus');

                var WorkflowRegion = Messaging.request('get:adkApp:region', 'workflowRegion');
                if (!_.isUndefined(WorkflowRegion)) {
                    var workflowContainerView = new ContainerView({
                        workflowOptions: this.workflowOptions,
                        controllerView: this
                    });
                    WorkflowRegion.show(workflowContainerView);

                    WorkflowRegion.currentView.$el.one('hidden.bs.modal', function(e) {
                        WorkflowRegion.empty();
                        $triggerElem.focus();
                    });
                    WorkflowRegion.currentView.$el.modal('show');
                }
            }
        },
        showInTray: function(trayKey) {
            var eventString = 'tray:writeback:' + trayKey + ':trayView';

            Messaging.request(eventString, {
                eventListener: this,
                eventSuffix: 'show',
                eventCallback: function(TrayView) {
                    this.TrayView = TrayView;
                    var TrayRegion = this.TrayView.TrayRegion;
                    var trayKeyString = trayKey.replace(/s$/, '');
                    if (!_.isUndefined(TrayRegion)) {
                        this.TrayView.listenTo(ResizeUtils.dimensions.contentRegion, 'change', _.bind(function(model) {
                            if(!_.isUndefined(this.SubTrayRegion)){
                                var $trayRegion = TrayView.TrayRegion.$el;
                                var contentRegionHeight = model.get('height');
                                this.adjustFormDimensions($trayRegion, contentRegionHeight);
                            }
                        }, this));

                        var self = this;
                        if (TrayRegion.currentView instanceof WorkflowView) {
                            var SimpleAlertItemView = Backbone.Marionette.ItemView.extend({
                                template: Handlebars.compile([
                                    '<h5>'+ trayKeyString + ' already in progress.</h5>',
                                    '<p>Complete the current workflow before starting a new ' + trayKeyString + '.</p>'
                                ].join('\n'))
                            });
                            var SimpleAlertFooterItemView = Backbone.Marionette.ItemView.extend({
                                template: Handlebars.compile([
                                    '{{ui-button "OK" classes="btn-primary alert-continue btn-sm" title="Press enter to close."}}'
                                ].join('\n')),
                                events: {
                                    'click button': function() {
                                        ADK.UI.Alert.hide();
                                        self.transferFocusToTrayContainer();
                                    }
                                }
                            });
                            var alertView = new ADK.UI.Alert({
                                title: 'Attention',
                                icon: 'icon-circle-exclamation',
                                messageView: SimpleAlertItemView,
                                footerView: SimpleAlertFooterItemView
                            });
                            alertView.show();
                            TrayView.$el.trigger('tray.show');
                        } else {
                            TrayView.$el.trigger('tray.swap', this);
                            this.headerModel.set('showCloseButton', false);
                            TrayView.$el.trigger('tray.show');
                            this.adjustFormDimensionsForTray();
                        }
                    } else {
                        console.error("Error when trying to show workflow inside : " + trayKeyString + " tray region.");
                    }
                }
            });
        },
        close: function() {
            this.$el.trigger('tray.reset');
        },
        changeHeaderTitle: function(newTitleString) {
            if (_.isString(newTitleString)) {
                this.headerModel.set('title', newTitleString);
            }
        },
        changeHeaderActionItems: function(newActionItemsArray) {
            if (_.isArray(newActionItemsArray)) {
                this.headerModel.set('actionItems', newActionItemsArray);
            }
        },
        changeHeaderCloseButtonOptions: function(newCloseButtonOptions) {
            if (_.isObject(newCloseButtonOptions) && (!_.isUndefined(this.workflowControllerView) || !_.isUndefined(this.headerModel))) {
                if (_.isFunction(newCloseButtonOptions.onClick)) {
                    var eventName = 'click';
                    var selector = 'button.close.custom-on-close-method';
                    var listener = _.bind(newCloseButtonOptions.onClick, this.workflowControllerView.getCurrentFormView());
                    this.delegate(eventName, selector, listener);

                    this.headerModel.set('defaultCloseButtonAction', false);
                } else {
                    this.headerModel.set('defaultCloseButtonAction', true);
                }
                if (_.isString(newCloseButtonOptions.title)) {
                    this.headerModel.set('closeButtonTitle', newCloseButtonOptions.title);
                }
            }
        },
        handleChangeToTrayContainer: function(adjustFormDimensions) {
            if (this.TrayView && this.TrayView.isOpen()) {
                this.transferFocusToTrayContainer();

                if (adjustFormDimensions) {
                    this.adjustFormDimensionsForTray();
                }
            }
        },
        transferFocusToTrayContainer: function(adjustFormDimensions) {
            this.TrayView.setFocusToFirstMenuItem();
        },
        adjustFormDimensionsForTray: function() {
            var $trayRegion = this.TrayView.TrayRegion.$el;
            this.adjustFormDimensions($trayRegion, ResizeUtils.dimensions.contentRegion.get('height'));
        },
        adjustFormDimensions: function($region, contentRegionHeight) {
            var Forms = $region.find('form:not(.hidden)');
            var maxSubTrayHeight = 0;
            _.each(Forms, function(form) {
                var $form = $(form);
                var $modalBody = $form.find('.modal-body');
                if (!_.isEmpty($modalBody)) {
                    var headerHeight = $form.closest('.workflow-controller').siblings('.workflow-header').outerHeight(true) || 0;
                    var footerHeight = $modalBody.siblings('.modal-footer').outerHeight(true) || 0;
                    var subTrayContainerHeight = this.ui.SubTrayRegion.outerHeight(true) || 0;
                    var height = contentRegionHeight - headerHeight - footerHeight - subTrayContainerHeight;
                    if (maxSubTrayHeight === 0 || height < maxSubTrayHeight) {
                        maxSubTrayHeight = height;
                    }
                    $modalBody.css({
                        'height': height + 'px'
                    });
                }
            }, this);
            if (this.SubTrayRegion.hasView()) {
                this.SubTrayRegion.currentView.updateSubTraysMaxHeight(maxSubTrayHeight);
            }
        }
    });

    WorkflowView.hide = function() {
        var currentView = Messaging.request('get:adkApp:region', 'workflowRegion').currentView;
        if (currentView) {
            currentView.$el.modal('hide');
        }
    };

    return WorkflowView;
});