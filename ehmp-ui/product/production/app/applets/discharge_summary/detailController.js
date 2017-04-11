define([
    'app/applets/discharge_summary/modal/modalView'
], function(ModalView) {
    "use strict";

    var detailController = {

        initialize: function(appletId) {

            // expose detail view through messaging
            var channel = ADK.Messaging.getChannel(appletId);
            channel.reply('detailView', function(params) {

                var response = $.Deferred();

                if (!params.model) {
                    var fetchOptions = {
                        criteria: {
                            'uid': params.uid
                        },
                        patient: ADK.PatientRecordService.getCurrentPatient(),
                        resourceTitle: 'patient-record-document-view',
                        viewModel: {
                            parse: AppletHelper.parseDocResponse
                        },
                        cache: true
                    };

                    var data = ADK.PatientRecordService.fetchCollection(fetchOptions);
                    data.on('sync', function() {
                        var detailModel = data.first();
                        response.resolve({
                            view: new ModalView({
                                model: detailModel
                            })
                        });
                    }, this);
                } else {
                    response.resolve({
                        view: new ModalView({
                            model: params.model
                        })
                    });
                }

                return response.promise();
            });
        }
    };

    return detailController;
});