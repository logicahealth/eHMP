define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _){
    "use strict";

    return {
        getFooterView: function(ModalViewInstance, PatientSyncStatusView){
            return Backbone.Marionette.ItemView.extend({
                template: _.template([
                    '<div class="pull-left">',
                    '<button type="button" id="sync-all-sources" class="btn btn-default btn-sm" title="Press enter to sync.">Sync All Sources to VX</button>',
                    '<button type="button" id="sync-refresh-all" class="btn btn-default btn-sm" title="Press enter to refresh.">Refresh All Data</button>',
                    '</div>',
                    '<button id="sync-modal-close" class="btn btn-default pull-right" data-dismiss="modal" title="Press enter to close.">Close</button>'
                ].join('\n')),
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