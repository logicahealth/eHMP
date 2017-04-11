define([
    "app/applets/activeMeds/appletLayout",
    "app/applets/activeMeds/gistView"
], function(AppletLayoutView, GistView) {
    "use strict";
    var DETAIL_VIEW_CHANNEL = "medication_review";
    var applet = {
        id: "activeMeds",
        viewTypes: [{
            type: 'gist',
            view: GistView,
            chromeEnabled: true
        }, {
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }],
        defaultViewType: 'summary'
    };

    (function initMessaging() {
        ADK.Messaging.getChannel(applet.id).on('detailView',
            function(clickedResult) {
                var channelName = DETAIL_VIEW_CHANNEL;
                // display spinner in modal while detail view is loading
                var modal = new ADK.UI.Modal({
                    view: ADK.Views.Loading.create(),
                    options: {
                        size: "large",
                        title: "Loading..."
                    }
                });
                modal.show();

                // request detail view from whatever applet is listening for this domain
                var channel = ADK.Messaging.getChannel(channelName);
                var deferredResponse = channel.request('detailView', clickedResult);

                deferredResponse.done(function(response) {
                    var modal = new ADK.UI.Modal({
                        view: response.view,
                        options: {
                            size: "large",
                            title: response.title
                        }
                    });
                    modal.show();
                });
            }
        );
    })();

    return applet;
});