define([
    "app/applets/newsfeed/visitDetail/visitDetailView"
], function(VisitDetailView) {
    "use strict";

    var VisitDetailController = {
        initialize: function () {
            var channel = ADK.Messaging.getChannel('visitDetail');
            channel.reply('detailView', function (params) {
                if (params.model !== undefined) {
                    return {
                        view: VisitDetailView.extend({
                            model: params.model
                        }),
                        title: params.model.get('summary') || params.model.get('typeDisplayName')

                    };
                }
            });
        }
    };
    return VisitDetailController;
});
