define([
    'backbone',
    'marionette',
    'handlebars',
    'app/applets/task_forms/common/views/action_modal/actionHandlerMap',
    'app/applets/task_forms/common/utils/writebackUtil',
    'app/applets/task_forms/common/utils/signalNames',
], function(Backbone, Marionette, Handlebars, ActionHandlerMap, Writeback, SignalNames) {
    'use strict';

    var DiscontinueformCheck = ADK.Checks.CheckModel.extend({
        validate: function(attributes, validationOptions) {
            ADK.Checks.unregister('discontinue-consult-form-id');
            ADK.UI.Workflow.hide();
            ADK.UI.Modal.hide();
        },
    });

    var LoadingView = ADK.UI.Form.extend({
        model: new Backbone.Model.extend({}),
        fields: [{
            control: "container",
            template: '<div class="modal-body loading font-size-14 panel-padding all-padding-xs"><i class="fa fa-spinner fa-spin"></i> Loading...</div>',
        }]
    });

    function buildModalView(model) {
        var signalName = model.get('signalName');
        var bodyContainer;

        if (_.isFunction(ActionHandlerMap[signalName].getModalBody)) {
            bodyContainer = ActionHandlerMap[signalName].getModalBody(model);
        }

        var modalFields = [{
            control: 'container',
            extraClasses: ['modal-body'],
            items: [{
                control: 'container',
                extraClasses: ['container-fluid'],
                items: [bodyContainer]
            }]
        }, {
            control: 'container',
            extraClasses: ['modal-footer'],
            items: [{
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12'],
                    items: [{
                        control: 'button',
                        id: 'form-cancel-btn',
                        extraClasses: ['btn-primary', 'btn-sm'],
                        type: 'button',
                        label: 'Cancel',
                        title: 'Press enter to cancel'
                    }, {
                        control: 'button',
                        disabled: true,
                        extraClasses: ['btn-primary', 'btn-sm'],
                        label: 'Accept',
                        name: 'submit-accept',
                        id: 'submit-accept',
                        title: 'Press enter to accept'
                    }]
                }]
            }]
        }];

        return ADK.UI.Form.extend({
            fields: modalFields,
            onBeforeShow: function() {
                // set the correct state for the action button
                this.toggleAcceptButton();
            },
            events: {
                'click #form-cancel-btn': function(e) {
                    e.preventDefault();
                    ADK.Checks.unregister('discontinue-consult-form-id');
                    ADK.UI.Workflow.hide();
                },
                'click #submit-accept': function(e) {
                    var self = this;
                    e.preventDefault();

                    var onAccept = ActionHandlerMap[self.model.get('signalName')].onAccept;
                    if (_.isFunction(onAccept)) {
                        // give a chance to the signal handler to perform anything it needs
                        // prior to triggering the writeback
                        onAccept(self.model);
                    }

                    Writeback.acceptAction(self.model, function() {
                            ADK.UI.Workflow.hide();
                            ADK.UI.Modal.hide();
                            ADK.Checks.unregister('discontinue-consult-form-id');
                            ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                                processId: self.model.get('processId')
                            });
                        },
                        function() {
                            console.log('Could not update activity signal');
                            this.$('#submit-accept,#form-cancel-btn').attr('disabled', false);
                        });
                    // disable both buttons while the request is made
                    this.$('#submit-accept,#form-cancel-btn').attr('disabled', true);
                }
            },
            modelEvents: {
                'change': function(model) {
                    this.toggleAcceptButton();
                }
            },
            toggleAcceptButton: function() {
                var allRequired = true; // defaults to true, in case there are no required fields
                var view = this;
                this.$('[required]').each(function(i, requiredField) {
                    if (!view.model.get(requiredField.name)) {
                        allRequired = false;
                        return false;
                    }
                });
                this.$('#submit-accept').attr('disabled', !allRequired);
            }
        });
    }

    function fetchDataForActionWorkflow(model, error, success) {
        var signalName = model.get('signalName');
        var fetchData = ActionHandlerMap[signalName].fetchData;
        if (_.isFunction(fetchData)) {
            fetchData(model, error, success);
        } else {
            // nothing to fetch
            success();
        }
    }

    function _launchActionWorkflow(model) {
        var signalName = model.get('signalName');
        var title = ActionHandlerMap[signalName].title;

        var workflow = new ADK.UI.Workflow({
            title: _.isFunction(title) ? title(model) : title, // some signal handlers have dynamic titles
            steps: [{
                view: LoadingView,
                viewModel: model
            }, {
                view: buildModalView(model),
                viewModel: model
            }],
            backdrop: true
        });

        ADK.Checks.register(new DiscontinueformCheck({
            id: 'discontinue-consult-form-id',
            label: 'Discontinue Activity Form',
            failureMessage: 'Discontinue Activity Writeback In Progress! Any unsaved changes will be lost if you continue.'
        }));

        workflow.show();
        return workflow;
    }

    return {
        launchActionWorkflow: function(model) {
            // clone the model to prevent the action modals from polluting the original
            model = model.clone();

            var workflow = _launchActionWorkflow(model);

            fetchDataForActionWorkflow(model, function() {
                    // error
                    // TODO: Handle error
                    console.log('Error fetching data in preparation for Action Workflow');
                },
                function() {
                    // success, move from loading step
                    workflow.workflowControllerView.goToIndex(1);
                });
        }
    };
});