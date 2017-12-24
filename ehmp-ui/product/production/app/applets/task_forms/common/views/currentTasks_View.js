define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'moment',
    'hbs!app/applets/task_forms/common/templates/currentTasks_Template',
    'hbs!app/applets/task_forms/common/templates/currentTasksRow_Template',
    'hbs!app/applets/task_forms/common/templates/currentTasksContainer_Template',
    'app/applets/task_forms/common/utils/utils',
    'app/applets/task_forms/activities/order.dischargefollowup/utils'
], function(Backbone, Marionette, _, Handlebars, moment, currentTasksTemplate, currentTasksRowTemplate, currentTasksContainer, TaskUtils, DischargeFollowUpUtils) {
    'use strict';
    var goToTask = function(model) {
        if (!model.get('readOnly')) {
            var isStaffView = ADK.WorkspaceContextRepository.currentContextId === 'staff';
            if (model.get('actionable')) {
                var navigation = model.get('NAVIGATION');
                var isDischargeFollowUp = model.get('DEFINITIONID') === DischargeFollowUpUtils.DISCHARGE_PROCESS_DEFINITION_ID;
                if (_.isObject(navigation)) {
                    ADK.UI.Modal.hide();
                    navigation.parameters.createdBy = {
                        CREATEDBYNAME: model.get('CREATEDBYNAME')
                    };
                    ADK.PatientRecordService.setCurrentPatient(model.get('PATIENTICN'), {
                        confirmationOptions: {
                            navigateToPatient: isStaffView || isDischargeFollowUp,
                            reconfirm: false
                        },
                        workspaceId: TaskUtils.getWorkspaceId(navigation),
                        staffnavAction: {
                            channel: navigation.channel,
                            event: navigation.event,
                            data: navigation.parameters
                        }
                    });
                } else {
                    //Temporary fallback until all tasks have a navigation node
                    //Trigger the activity management form router to open the appropriate form.
                    ADK.Messaging.getChannel('activity-management').trigger('show:form', {
                        taskId: model.get('TASKID'),
                        taskDefinitionId: model.get('DEFINITIONID'),
                        clinicalObjectUid: model.get('CLINICALOBJECTUID'),
                        triggerElement: this.$('.dropdown--quickmenu > button')
                    });
                }
            }
        }
    };
    var RowView = Backbone.Marionette.ItemView.extend({
        tagName: 'tr',
        template: currentTasksRowTemplate,
        serializeData: function() {
            var data = this.model.toJSON();
            if (this.getOption('showHighlights') && this.getOption('highlightKeywords')) {
                data.showHighlights = this.getOption('showHighlights');
                data.highlightKeywords = this.getOption('highlightKeywords');
            }
            var fieldsToHighlight = ['TASKNAME'];
            return ADK.Messaging.getChannel('task_forms').request('serialize_data', data, fieldsToHighlight);
        },
        className: 'table-row',
        behaviors: {
            Actions: {
                tagName: 'span',
                actionType: 'task'
            },
            Notifications: {
                container: '.notification-container'
            }
        },
        tileOptions: {
            actions: {
                enabled: true,
                disableAction: function(model) {
                    return model.get('readOnly');
                },
                actionType: 'task',
                shouldShow: function(model) {
                    return model.get('actionable');
                },
                onClickButton: function(event, model) {
                    goToTask(model);
                }
            },
            notifications: {
                enabled: true,
                titleAttr: 'NOTIFICATIONTITLE',
                shouldShow: function(model) {
                    return model.get('NOTIFICATION');
                }
            }
        },
        initialize: function() {
            this.model.set('readOnly', this.getOption('readOnly'));
        }
    });

    var CompositeView = Backbone.Marionette.CompositeView.extend({
        template: currentTasksTemplate,
        childView: RowView,
        childViewContainer: '.body',
        childViewOptions: function() {
            return {
                readOnly: this.model.get('readOnly'),
                highlightKeywords: this.model.get('highlightKeywords'),
                showHighlights: this.model.get('showHighlights')
            };
        }
    });

    return Backbone.Marionette.LayoutView.extend({
        template: currentTasksContainer,
        regions: {
            TasksList: '.activity-detail-task-table'
        },
        collectionEvents: {
            'read:success': 'showTasksList'
        },
        initialize: function(options) {
            this.collection = new ADK.UIResources.Fetch.Tasks.Current();

            this.collection.fetchCollection({
                processInstanceId: this.model.get('processId')
            });
        },
        showTasksList: function() {
            var region = this.getRegion('TasksList');
            if (this.collection.length) {
                region.show(new CompositeView({
                    collection: this.collection,
                    model: this.model
                }));
            } else {
                region.empty();
            }
        }
    });
});