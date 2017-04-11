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

                    var data = ADK.PatientRecordService.createEmptyCollection(fetchOptions);

                    return {
                        view: ModalView.extend({
                            model: new Backbone.Model(),
                            collection: data,
                            collectionEvents: {
                                'sync': function() {
                                    var model = collection.first();
                                    if (model) this.model.set(model.toJSON());
                                }
                            },
                            onBeforeShow: function() {
                                ADK.PatientRecordService.fetchCollection(fetchOptions, this.collection);
                            }
                        })
                    };
                } else {
                    return {
                        view: ModalView.extend({
                            model: params.model
                        })
                    };

                }
            });
        }
    };

    return detailController;
});