define([], function() {
    'use strict';
    var ToolBarView = ADK.UI.Form.extend({
        fields: [],
        modelEvents: {
            'change:primarySelection': 'onChangePrimarySelection',
            'change:mode': 'onChangeMode'
        },
        onInitialize: function(options) {
            this.expandedAppletId = _.get(options, 'appletConfig.instanceId');
            var fullScreen = _.get(options, 'appletConfig.fullScreen') || false;
            this.parentWorkspace = ADK.WorkspaceContextRepository.currentContextId + 'Activities';
            if (fullScreen) {
                var expandedModel = ADK.SessionStorage.get.sessionModel('expandedAppletId');
                if (expandedModel instanceof Backbone.Model && _.isString(expandedModel.get('id'))) {
                    this.expandedAppletId = expandedModel.get('id');
                }
            }
            this.onChangePrimarySelection();
            this.onChangeMode();
        },
        setAppletStorageModel: function(modelAttribute) {
            if (!_.isUndefined(this.expandedAppletId)) {
                ADK.SessionStorage.setAppletStorageModel(this.expandedAppletId, modelAttribute, this.model.get(modelAttribute), true, this.parentWorkspace);
            }
        },
        onChangePrimarySelection: function() {
            this.setAppletStorageModel('primarySelection');
        },
        onChangeMode: function() {
            this.setAppletStorageModel('mode');
        }
    });

    return ToolBarView;

});