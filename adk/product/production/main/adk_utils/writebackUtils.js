define(['backbone', 'underscore', 'handlebars'], function(Backbone, _, Handlebars) {
    "use strict";

    var writebackUtils = {};

    writebackUtils.handleVisitWorkflow = function(workflowOptions, addVisitView){
        var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');

        if (!visit || !visit.selectedProvider || !visit.locationDisplayName) {
            var formModel = new Backbone.Model({
                encounterProvider: 'Not Specified',
                encounterLocation: 'Not Specified',
                visit: {}
            });
            workflowOptions.steps.push({
                view: addVisitView,
                viewModel: formModel,
                title: 'Step 1'
            });
        }
    };

    writebackUtils.applyModalCloseHandler = function(workflow){
        var WritebackMessageView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('You will lose your progress if you cancel. Would you like to proceed with ending this observation?'),
            tagName: 'p'
        });

        var VisitMessageView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('You will lose all work in progress if you delete this task. Would you like to proceed?'),
            tagName: 'p'
        });

        var CancelFooterView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('{{ui-button "Cancel" classes="btn-default" title="Press enter to cancel."}}{{ui-button "Continue" classes="btn-primary" title="Press enter to continue."}}'),
            events: {
                'click .btn-primary': function () {
                    ADK.UI.Alert.hide();
                    ADK.UI.Workflow.hide();
                    workflow.close();
                },
                'click .btn-default': function () {
                    ADK.UI.Alert.hide();
                }
            },
            tagName: 'span'
        });

        workflow.changeHeaderCloseButtonOptions({
            title: 'Click or press enter to cancel',
            onClick: function(){
                var alertView;
                if(workflow.model.get('currentIndex') === 0 && workflow.model.get('steps').length > 1){
                     alertView = new ADK.UI.Alert({
                        title: 'Are you sure you want to cancel?',
                        icon: 'fa-exclamation-triangle font-size-18 color-red',
                        messageView: VisitMessageView,
                        footerView: CancelFooterView
                    });
                }else {
                    alertView = new ADK.UI.Alert({
                        title: 'Are you sure you want to cancel?',
                        icon: 'fa-exclamation-triangle font-size-18 color-red',
                        messageView: WritebackMessageView,
                        footerView: CancelFooterView
                    });
                }

                alertView.show();
            }
        });
    };

    return writebackUtils;
});