define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'demo_files/feature_forms/featureStatus',
    'demo_files/feature_forms/formControls',
    'demo_files/feature_forms/components',
    'hbs!app/applets/ui_components_demo/featureStatusTemplate',
    'hbs!app/applets/ui_components_demo/formControlsTemplate',
    'hbs!app/applets/ui_components_demo/template',
    'demo_files/form_components_example/componentsDemo',
    'app/applets/ui_components_demo/writeback/eSignature_OutpatientMeds',
    'app/applets/ui_components_demo/writeback/eSignature_Default'
], function(Backbone, Marionette, $, Handlebars, FeatureStatus, FormControls, ADKComponents, FeatureStatusTemplate, FormControlsTemplate, FormTemplate, Demo_Form, eSignature_OutpatientMeds, eSignature_Default) {
    "use strict";

    var FeatureStatusChildView = Backbone.Marionette.ItemView.extend({
        template: FeatureStatusTemplate,
        className: "panel panel-default",
        templateHelpers: function() {
            return {
                buttonID: 'sample-form-F' + this.model.get('featureNumber'),
                buttonTitle: 'Click here to see demo form for F' + this.model.get('featureNumber'),
                trifectaHandOff: function() {
                    if (!_.isUndefined(this.handOff) && !_.isUndefined(this.handOff.trifecta)) {
                        if (this.handOff.trifecta && !this.handOff.dev) {
                            return true;
                        }
                    }
                    return false;
                },
                devHandOff: function() {
                    if (!_.isUndefined(this.handOff) && !_.isUndefined(this.handOff.dev)) {
                        if (this.handOff.dev) {
                            return true;
                        }
                    }
                    return false;
                },
                isDevelopmentCompleted: function() {
                    if (!(_.isUndefined(this.formControls()) && _.isUndefined(this.adkComponents()))) {
                        if (!(_.find(this.formControls(), {
                                developmentStatus: false
                            }))) {
                            return !(_.find(this.adkComponents(), {
                                developmentStatus: false
                            }));
                        }
                        return false;
                    }
                    return true;
                },
                isCometCompleted: function() {
                    if (!(_.isUndefined(this.formControls()) && _.isUndefined(this.adkComponents()))) {
                        if (!(_.find(this.formControls(), {
                                cometStatus: false
                            }))) {
                            return !(_.find(this.adkComponents(), {
                                cometStatus: false
                            }));
                        }
                        return false;
                    }
                    return true;
                },
                isCompleted: function() {
                    if (this.isDevelopmentCompleted() && this.isCometCompleted()) {
                        return true;
                    }
                    return false;
                },
                isPrototypeReady: function() {
                    if (this.isDevelopmentCompleted() && !this.isCometCompleted()) {
                        return true;
                    }
                    return false;
                },
                isInDevelopment: function() {
                    if (!this.isDevelopmentCompleted() && !this.isCometCompleted()) {
                        return true;
                    }
                    return false;
                },
                formControls: function() {
                    return _.map(this.controls, function(id) {
                        return _.where(FormControls, {
                            id: id
                        })[0];
                    });
                },
                adkComponents: function() {
                    return _.map(this.components, function(id) {
                        return _.where(ADKComponents, {
                            id: id
                        })[0];
                    });
                }
            };
        },
        events: {
            'click a.demo': function(e) {
                e.preventDefault();
                var self = this;
                if (!this.featureForm) {
                    require(['demo_files/feature_forms/F' + this.model.get('featureNumber')], function(featureForm) {
                        self.featureForm = featureForm;
                        self.featureForm.createForm();
                    });
                } else {
                    this.featureForm.createForm();
                }
            }
        }
    });

    var FeatureStatusView = Backbone.Marionette.CollectionView.extend({
        initialize: function(options) {
            this.collection = options.collection;
        },
        childView: FeatureStatusChildView,
        attributes: {
            'role': "tablist",
            'aria-multiselectable': "true"
        },
        className: "accordion-container panel-group small ftar"
    });

    var FormControlChildView = Backbone.Marionette.ItemView.extend({
        template: FormControlsTemplate,
        className: "table-row",
        templateHelpers: function() {
            return {
                buttonID: 'sample-control-' + this.model.get('id'),
                buttonTitle: 'Click here to see demo form for the' + this.model.get('label') + ' form control',
                isDevelopmentCompleted: function() {
                    if (!(_.isUndefined(this.developmentStatus))) {
                        if (this.developmentStatus) {
                            return true;
                        }
                        return false;
                    }
                    return true;
                },
                isCometCompleted: function() {
                    if (!(_.isUndefined(this.cometStatus))) {
                        if (this.cometStatus) {
                            return true;
                        }
                        return false;
                    }
                    return true;
                },
                isCompleted: function() {
                    if (this.isDevelopmentCompleted() && this.isCometCompleted()) {
                        return true;
                    }
                    return false;
                },
                isPrototypeReady: function() {
                    if (this.isDevelopmentCompleted() && !this.isCometCompleted()) {
                        return true;
                    }
                    return false;
                },
                isInDevelopment: function() {
                    if (!this.isDevelopmentCompleted() && !this.isCometCompleted()) {
                        return true;
                    }
                    return false;
                }
            };
        },
        events: {
            'click .control-label': function(e) {
                e.preventDefault();
                this.controlDemoModel = Demo_Form.show(this.model);
                this.listenTo(this.controlDemoModel, 'change', function() {
                    if (!_.has(this.controlDemoModel.changed, 'printedModelValues')) {
                        this.controlDemoModel.set('printedModelValues', JSON.stringify(this.controlDemoModel.changed, null, 2));
                    }
                    console.log('Changed Model:');
                    console.log(this.controlDemoModel);
                }, this);
            }
        }
    });

    var FormControlsView = Backbone.Marionette.CompositeView.extend({
        initialize: function(options) {
            this.collection = options.collection;
        },
        childView: FormControlChildView,
        className: 'faux-table top-margin-sm',
        ui: {
            'BodyContainer': '.body'
        },
        template: Handlebars.compile([
            '<div class="header table-row">',
            '<div class="table-cell pixel-width-60"><div>Status</div></div>',
            '<div class="table-cell"><div>Control Name</div></div>',
            '<div class="table-cell"><div>User Story</div></div>',
            '<div class="table-cell"><div>Documentation</div></div>',
            '</div>',
            '<div class="body"></div>'
        ].join("\n")),
        childViewContainer: '@ui.BodyContainer',
        addChild: function(child, ChildView, index) {
            if (child.get('exampleForm')) {
                Marionette.CollectionView.prototype.addChild.apply(this, arguments);
            }
        }
    });

    var ExtraView = FormControlsView.extend({
        addChild: function(child, ChildView, index) {
            if (!child.get('exampleForm')) {
                Marionette.CollectionView.prototype.addChild.apply(this, arguments);
            }
        }
    });

    var FormView = Backbone.Marionette.LayoutView.extend({
        template: FormTemplate,
        model: new Backbone.Model(),
        ui: {
            "FirstForm": ".formView",
            "formModelResults": ".formModel",
            "FeatureStatusSection": "#writeback-features-container",
            "FormControlsSection": "#form-controls-container",
            "ExtraFormControlsSection": "#extra-form-controls-container",
            "ExtraUIComponentsSection": "#extra-ui-components-container",
            "TabRegion": "#tab-region",
            "TrayRegion": "#tray-region",
            "CollapsibleContainerRegion": "#collapsible-container-region"
        },
        regions: {
            'Form1': '@ui.FirstForm',
            'FeatureStatus': '@ui.FeatureStatusSection',
            'TabRegion': '@ui.TabRegion',
            'FormControls': '@ui.FormControlsSection',
            'ExtraFormControls': '@ui.ExtraFormControlsSection',
            'ExtraUIComponents': '@ui.ExtraUIComponentsSection',
            'TrayRegion': '@ui.TrayRegion',
            'CollapsibleContainerRegion': '@ui.CollapsibleContainerRegion'
        },
        // This starts the code only for the demo e-Signatue -----------------------------------------------------
        events: {
            'click #growlBasic': 'growlAlert',
            'click #growlBasicNoAutoClose': 'growlAlert',
            'click #growlBasicIcon': 'growlAlert',
            'click #growlInfo': 'growlAlert',
            'click #growlWarning': 'growlAlert',
            'click #growlSuccess': 'growlAlert',
            'click #growlDanger': 'growlAlert'
        },
        growlAlert: function(e) {
            e.preventDefault();
            var buttonClicked = this.$(e.currentTarget);
            var icon = buttonClicked.attr('data-icon');
            var type = buttonClicked.attr('data-type');
            var autoClose = buttonClicked.data('auto-close');
            var message = 'Growl alert body text.';
            var callback;

            if (_.isBoolean(autoClose)) {
                message = 'Growl alert body text. Sticky.';
                callback = function() {
                    console.log('growl callback invoked');
                };
            } else {
                autoClose = true;
            }

            var saveAlertView = new ADK.UI.Notification({
                title: 'Growl Alert Title',
                icon: icon,
                message: message,
                type: type,
                autoClose: autoClose,
                onClick: callback
            });
            saveAlertView.show();
        },
        // This ends the code only for the demo e-Signatue -------------------------------------------------------
        onBeforeShow: function() {
            $('html').addClass('comet');

            this.testCollapsibleContainer = new ADK.UI.CollapsibleContainer({
                name: 'collapsible container',
                headerItems: {
                    label: 'header name',
                    view: Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile('<b>Header Content</b>')
                    })
                },

                collapseItems: {
                    label: 'container name',
                    view: Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile('Container Content')
                    })
                }
            });

            this.testTabs = new ADK.UI.Tabs({
                tabs: [{
                    label: 'Tab 1',
                    view: Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile('tab 1 content')
                    })
                }, {
                    label: 'Tab 2',
                    view: Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile('tab 2 content')
                    })
                }, {
                    label: 'Tab 3',
                    view: Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile('tab 3 content')
                    })
                }, {
                    label: 'Tab 4',
                    view: Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile('tab 4 content')
                    })
                }]
            });
            this.showChildView('TabRegion', this.testTabs);
            this.showChildView('CollapsibleContainerRegion', this.testCollapsibleContainer);

            var featureStatus = new Backbone.Collection();
            featureStatus.add(FeatureStatus);
            this.featureStatusView = new FeatureStatusView({
                collection: featureStatus
            });

            var formControls = new Backbone.Collection();
            formControls.comparator = 'label';
            formControls.add(FormControls);
            this.formControlsView = new FormControlsView({
                collection: formControls
            });
            this.extraFormControlsView = new ExtraView({
                collection: formControls
            });

            var adkComponents = new Backbone.Collection();
            adkComponents.comparator = 'label';
            adkComponents.add(ADKComponents);
            this.extraUIComponentsView = new ExtraView({
                collection: adkComponents
            });
            this.showChildView('FeatureStatus', this.featureStatusView);
            this.showChildView('FormControls', this.formControlsView);
            this.showChildView('ExtraFormControls', this.extraFormControlsView);
            this.showChildView('ExtraUIComponents', this.extraUIComponentsView);

        },
        onRender: function() {
            $('body div#center-region').css('overflow-y', 'scroll');
        },
        onBeforeDestroy: function() {
            $('html').removeClass('comet');
        }
    });

    var AlertDropdown = ADK.UI.AlertDropdown.extend({
        icon: 'fa-folder-open',
        dropdownTitle: 'Notifications For User',
        RowContentTemplate: '<p class="bottom-margin-no"><strong>{{label}}</strong></p><p class="bottom-margin-no">{{notificationStatus}}</p><p class="bottom-margin-no">{{notificationDue}}</p>',
        onBeforeInitialize: function() {
            this.collection = new Backbone.Collection([{
                'title': 'First Item. Press enter to view notification',
                'label': 'Eight, Patient (1234)',
                'notificationStatus': 'Triage - Rheumatology General',
                'notificationDue': 'Task is more than 7 days Past Due'
            }, {
                'title': 'Second Item. Press enter to view notification',
                'label': 'Smith, John-Henkinheimer (1234)',
                'notificationStatus': 'Scheduling - Physical Therapy',
                'notificationDue': 'Task is more than 7 days Past Due'
            }]);
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: 'applicationHeaderItem',
        title: 'Press enter to view notifications',
        orderIndex: 1,
        key: 'notification-demo',
        group: 'user-nav-alerts',
        view: AlertDropdown,
        shouldShow: function() {
            return ADK.Messaging.request('get:current:screen').config.id === 'ui-components-demo';
        }
    });
    ADK.Messaging.trigger('register:component', {
        type: 'applicationHeaderItem',
        title: 'Press enter to view notifications',
        orderIndex: 1,
        key: 'notification-demo-1',
        group: 'patient-nav-alerts',
        view: AlertDropdown.extend({
            dropdownTitle: 'Notifications For Patient',
            icon: 'fa-bell',
        }),
        shouldShow: function() {
            return ADK.Messaging.request('get:current:screen').config.id === 'ui-components-demo';
        }
    });

    var applet = {
        id: "ui_components_demo",
        viewTypes: [{
            type: 'summary',
            view: FormView
        }, {
            type: 'eSignatureDefault',
            view: eSignature_Default
        }, {
            type: 'eSignatureOutpatientMeds',
            view: eSignature_OutpatientMeds
        }],
        defaultViewType: 'summary'
    };

    return applet;
});