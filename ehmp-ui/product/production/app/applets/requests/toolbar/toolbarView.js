define([], function() {
    'use strict';
    var ToolBarView = ADK.UI.Form.extend({
        fields: [],
        modelEvents: {
            'change:primarySelection': 'onChangePrimarySelection',
            'change:mode': 'onChangeMode',
            'change:onlyShowFlaggedRequests': 'onChangeOnlyShowFlaggedRequests'
        },
        onInitialize: function(options) {
            this.expandedAppletId = _.get(options, 'appletConfig.instanceId');
            this.parentWorkspace = ADK.WorkspaceContextRepository.currentContextId + 'Requests';
            var fullScreen = _.get(options, 'appletConfig.fullScreen');
            if (fullScreen) {
                var expandedModel = ADK.SessionStorage.get.sessionModel('expandedAppletId');
                if (expandedModel instanceof Backbone.Model && _.isString(expandedModel.get('id'))) {
                    this.expandedAppletId = expandedModel.get('id');
                }
            }
            this.onChangeOnlyShowFlaggedRequests();
            this.onChangePrimarySelection();
            this.onChangeMode();
        },
        setAppletStorageModel: function(storageModelID, modelAttribute){
            if(!_.isUndefined(this.expandedAppletId)){
                ADK.SessionStorage.setAppletStorageModel(this.expandedAppletId, storageModelID, this.model.get(modelAttribute), true, this.parentWorkspace);
            }
        },
        onChangeOnlyShowFlaggedRequests: function(){
            this.setAppletStorageModel('onlyShowFlagged','onlyShowFlaggedRequests');
        },
        onChangePrimarySelection: function() {
            this.setAppletStorageModel('primarySelection', 'primarySelection');
        },
        onChangeMode: function() {
            this.setAppletStorageModel('mode','mode');
        }
    });

    return ToolBarView;

});