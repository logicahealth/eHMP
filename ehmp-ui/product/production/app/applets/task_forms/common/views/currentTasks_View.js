define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'moment',
    'hbs!app/applets/task_forms/common/templates/currentTasks_Template',
    'hbs!app/applets/task_forms/common/templates/currentTasksRow_Template',
    'hbs!app/applets/task_forms/common/templates/currentTasksContainer_Template'
], function(Backbone, Marionette, _, Handlebars, moment, currentTasksTemplate, currentTasksRowTemplate, currentTasksContainer) {
    'use strict';

    var RowView = Backbone.Marionette.ItemView.extend({
        tagName: 'a',
        template: currentTasksRowTemplate,
        attributes: function() {
            return {
                href: '#',
                'data-taskid': this.model.get('TASKID'),
                title: 'Press enter to view task'
            };
        },
        className: 'table-row',
        events: {
            'click': function(e) {
                e.preventDefault();
                if (!this.getOption('readOnly')) {
                    var isStaffView = ADK.WorkspaceContextRepository.currentContextId === 'staff';
                    if (this.model.get('hasPermissions')) {
                        var navigation = this.model.get('NAVIGATION');
                        if (_.isObject(navigation)) {
                            ADK.UI.Modal.hide();
                            navigation.parameters.createdBy = {
                                CREATEDBYNAME: this.model.get('CREATEDBYNAME')
                            };
                            ADK.PatientRecordService.setCurrentPatient(this.model.get('PATIENTICN'), {
                                reconfirm: isStaffView,
                                navigation: isStaffView,
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
                                taskId: this.model.get('TASKID'),
                                taskDefinitionId: this.model.get('DEFINITIONID'),
                                clinicalObjectUid: this.model.get('CLINICALOBJECTUID')
                            });
                        }
                    }
                }
            }
        }
    });

    var CompositeView = Backbone.Marionette.CompositeView.extend({
        template: currentTasksTemplate,
        childView: RowView,
        childViewContainer: '.body',
        childViewOptions: function() {
            return {
                readOnly: this.model.get('readOnly')
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