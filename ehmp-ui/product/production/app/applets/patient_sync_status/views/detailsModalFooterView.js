define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _){
    "use strict";

    return {
        getFooterView: function(ModalViewInstance, PatientSyncStatusView){
            return Backbone.Marionette.ItemView.extend({
                template: _.template('<div class="pull-left"><button id="sync-all-sources" type="button" title="Press enter to sync all sources to V X" class="btn btn-primary">Sync All Sources to VX</button><button id="sync-refresh-all" type="button" title="Press enter to refresh all data" class="btn btn-primary">Refresh All Data</button></div><button type="button" id="sync-modal-close" class="btn btn-default pull-right" data-dismiss="modal">Close</button>'),
                events: {
                    'click #sync-all-sources': 'syncAllSources',
                    'click #sync-refresh-all': 'refreshAll'
                },
                refreshAll: function(){
                    PatientSyncStatusView.refreshStatus();
                },
                syncAllSources: function(){
                    ModalViewInstance.forceSyncAll();
                }
            });
        }
    };
});