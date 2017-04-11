define([
    'backbone',
    'marionette',
    'hbs!app/applets/todo_list/toolbar/toolbarTemplate'
], function(Backbone, Marionette, toolbarTemplate) {
    'use strict';

    var ToolBarView = Backbone.Marionette.ItemView.extend({

        initialize: function(options) {
            this.instanceId = options.instanceId;
            this.assignedToOptions = options.assignedToOptions;
            this.statusOptions = options.statusOptions;
            this.sharedModel = options.sharedModel;
            this.expandedAppletId = options.expandedAppletId;
            this.parentWorkspace = options.parentWorkspace;
            this.isSummaryView = options.isSummaryView;
            this.isStaffView = options.isStaffView;
            this.assignedTo = ADK.SessionStorage.getAppletStorageModel(this.expandedAppletId, 'assignedTo', true, this.parentWorkspace) || 'teamroles';
            this.status = ADK.SessionStorage.getAppletStorageModel(this.expandedAppletId, 'status', true, this.parentWorkspace) || 'Active';
        },

        template: toolbarTemplate,
        className: 'toolbar-item',
        events: {
            'change select': 'filterChange'
        },
        setActiveType: function(activeOptionName, activeOptionValue, instanceId) {
            ADK.SessionStorage.setAppletStorageModel(instanceId, activeOptionName, activeOptionValue, true, this.parentWorkspace);
        },
        filterChange: function(event) {
            var target = event.currentTarget;
            var changedFieldId = target.id,
                changedFieldName = target.name;
            var changedFieldValue = this.$('#' + changedFieldId).val();
            this.setActiveType(changedFieldName, changedFieldValue, this.expandedAppletId);
            this.sharedModel.set(changedFieldName, changedFieldValue);
            this.$el.find("[name='assignedTo']").prop('disabled', true);
            this.$el.find("[name='status']").prop('disabled', true);
        },
        onRender: function() {

            // create the drop-down template HTML
            this.$el.html(this.template({
                instanceId: this.instanceId,
                assignedTo: this.assignedToOptions.toJSON(),
                status: this.statusOptions.toJSON(),
                isSummaryView: this.isSummaryView,
                isStaffView: this.isStaffView
            }));

            //set the drop-downs default values
            this.$('#' + this.instanceId + '-assigned-to-options').val(this.assignedTo || 'teamroles');
            this.$('#' + this.instanceId + '-status-options').val(this.status || 'Active');
        }

    });

    return ToolBarView;

});