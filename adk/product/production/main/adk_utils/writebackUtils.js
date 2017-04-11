define([
    'backbone',
    'underscore',
    'handlebars',
    'moment'
], function(Backbone, _, Handlebars, moment) {
    "use strict";

    var writebackUtils = {};

    writebackUtils.handleVisitWorkflow = function(workflowOptions, addVisitView) {
        var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');

        if (_.isUndefined(visit) || _.isUndefined(visit.selectedProvider) || _.isUndefined(visit.locationUid) || !moment(visit.dateTime, 'YYYYMMDDHHmmss').isValid()) {
            var formModel = new Backbone.Model({
                encounterProvider: 'Not Specified',
                encounterLocation: 'Not Specified',
                visit: {}
            });
            if (!_.isUndefined(workflowOptions) && !_.isUndefined(workflowOptions.steps)) {
                workflowOptions.steps.push({
                    view: addVisitView,
                    viewModel: formModel,
                    stepTitle: 'Set Encounter Context'
                });
            }
        }
    };

    writebackUtils.applyModalCloseHandler = function(workflow){
        var WritebackMessageView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('All unsaved changes will be lost. Are you sure you want to cancel?'),
            tagName: 'p'
        });

        var VisitMessageView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('You will lose all work in progress if you delete this task. Would you like to proceed?'),
            tagName: 'p'
        });

        var FooterView = Backbone.Marionette.ItemView.extend({
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
            title: 'Press enter to cancel',
            onClick: function(){
                var alertView;
                if(workflow.model.get('currentIndex') === 0 && workflow.model.get('steps').length > 1){
                     alertView = new ADK.UI.Alert({
                        title: 'Delete',
                        icon: 'icon-triangle-exclamation',
                        messageView: VisitMessageView,
                        footerView: FooterView.extend({
                            template: Handlebars.compile('{{ui-button "No" classes="btn-default btn-sm" title="Press enter to go back."}}{{ui-button "Yes" classes="btn-primary btn-sm" title="Press enter to delete."}}')
                        })
                    });
                }else {
                    alertView = new ADK.UI.Alert({
                        title: 'Cancel',
                        icon: 'icon-triangle-exclamation',
                        messageView: WritebackMessageView,
                        footerView: FooterView.extend({
                            template: Handlebars.compile('{{ui-button "No" classes="btn-default btn-sm" title="Press enter to go back."}}{{ui-button "Yes" classes="btn-primary btn-sm" title="Press enter to cancel."}}')
                        })
                    });
                }

                alertView.show();
            }
        });
    };

    return writebackUtils;
});