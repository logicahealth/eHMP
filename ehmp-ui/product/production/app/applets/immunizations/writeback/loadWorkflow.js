define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/immunizations/writeback/addImmunization',
    'app/applets/visit/writeback/addselectVisit',
], function(Backbone, Marionette, $, Handlebars, AddImmunizationView, addselectEncounter) {
    "use strict";

    var LoadWorkflowMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('Resources required by the Add Immunization form could not be loaded. Please try again later.'),
        tagName: 'p'
    });

    var LoadWorkflowFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "OK" classes="btn-primary btn-sm"}}'),
        events: {
            'click .btn-primary': function () {
                ADK.UI.Alert.hide();
                ADK.UI.Workflow.hide();          
                this.getOption('workflow').close();
            }
        },
        tagName: 'span'
    });

    var LoadWorkflowFields = [{
        control: 'container',
        extraClasses: ['modal-body'],
        items: [{
            control: 'container',
            name: 'loadWorkflowContainer'
        }]
    }];

    var loadWorkflowView = ADK.UI.Form.extend({
        onInitialize: function() {
            this.loadWorkflowResource = new ADK.UIResources.Picklist.Immunizations.RoutesOfAdministration();
            this.bindEntityEvents(this.loadWorkflowResource, this.loadWorkflowResourceEvents);
        },
        ui: {
            'loadWorkflowContainer': '.loadWorkflowContainer'
        },
        fields: LoadWorkflowFields,
        loadWorkflowResourceEvents: {
            'read:error': function(collection, response) {
                this.$el.trigger('tray.loaderHide');
                var loadWorkflowAlertView = new ADK.UI.Alert({
                    title: 'Error',
                    icon: 'icon-circle-exclamation',
                    messageView: LoadWorkflowMessageView,
                    footerView: LoadWorkflowFooterView,
                    workflow: this.options.workflow
                });
                loadWorkflowAlertView.show();   
            },
            'read:success': function(collection, response) {

                var formModel = this.model;

                this.getOption('workflow').close();

                var workflowOptions = {
                    size: "xlarge",
                    title: "Enter Immunization",
                    showProgress: false,
                    keyboard: false,
                    steps: []
                };
                
                ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, addselectEncounter.extend({
                    inTray: true
                }));

                workflowOptions.steps.push({
                    view: AddImmunizationView,
                    viewModel: formModel,
                    stepTitle: 'Step 2',
                    helpMapping: 'immunizations_form'
                });

                var workflowView = new ADK.UI.Workflow(workflowOptions);
                workflowView.show({
                    inTray: 'observations'
                });
                ADK.utils.writebackUtils.applyModalCloseHandler(workflowView);
            }
        },
        onRender: function() {
            this.loadWorkflowResource.fetch();
        },
        onAttach: function() {
             this.initLoader();
        },
        initLoader: function() {
            this.$el.trigger('tray.loaderShow',{
                loadingString:'Loading'
            });
        },
        onDestroy: function(){               
            this.unbindEntityEvents(this.loadWorkflowResource, this.loadWorkflowResourceEvents);
        }
    });

    return loadWorkflowView;
});