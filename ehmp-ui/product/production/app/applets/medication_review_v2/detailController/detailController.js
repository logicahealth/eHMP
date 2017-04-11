define([
    "backbone",
    "marionette",
    "app/applets/medication_review_v2/views/medicationDetailView",
    "hbs!app/applets/medication_review_v2/templates/detailTemplate",
    "app/applets/medication_review_v2/appletHelper",
    "app/applets/medication_review_v2/medicationCollectionFormatHelper"
], function(Backbone, Marionette, MedicationView, detailTemplate, AppletHelper, MedicationCollectionFormatHelper) {
    "use strict";

    var ExternalDetailView = MedicationView.extend({
        className: 'panel panel-success panel-body',
        template: detailTemplate,
        attributes: {
            'data-appletid': 'medication_review'
        }
    });

    var medicationViewModel = {
        defaults: {
            "fillsAllowed": "Unk"
        },
        parse: function(response) {
            return AppletHelper.parseMedResponse(response);
        }
    };

    function getMatchingMeds(params, medModel) {
        // get 'groupby' field
        var groupbyData = AppletHelper.getMedicationGroupbyData(medModel),
            filter = 'eq(' + groupbyData.groupbyField + ',"' + groupbyData.groupbyValue + '")',
            deferredResponse = $.Deferred();

        if (groupbyData.groupbyField === 'name') {
            filter = 'ilike(name,"' + groupbyData.groupbyValue + '%")';
        }

        // Request other med records that match groupby field
        // This is so we can display the order history in the detail view
        var fetchOptions = {
            cache: true,
            resourceTitle: 'patient-record-med',
            viewModel: medicationViewModel
        };

        fetchOptions.onSuccess = function(collection, resp) {
            var filteredItems = _.filter(collection.models, function(model) {
                return medModel.get('groupbyValue') === model.get('groupbyValue');
            });
            collection.reset(filteredItems);
            deferredResponse.resolve(collection);
        };

        ADK.PatientRecordService.fetchCollection(fetchOptions);

        return deferredResponse.promise();
    }


    var detailController = {
        initialize: function(appletId) {
            ADK.Messaging.getChannel(appletId).on('detailView', function(clickedResult) {
                if (!clickedResult.applet) return;

                var modal = new ADK.UI.Modal({
                    view: ADK.Views.Loading.create(),
                    options: {
                        size: 'large',
                        title: 'Medication - '+clickedResult.model.get('stackedGraphTypeName')
                    }
                });
                modal.show();

                var fetchOptions = {
                    cache: true,
                    criteria: {
                        uid: clickedResult.uid
                    },
                    resourceTitle: 'patient-record-med',
                    viewModel: medicationViewModel
                };
                fetchOptions.onSuccess = function(collection, resp) {
                    var matchingMedsDeferredResponse = getMatchingMeds(clickedResult, collection.at(0));

                    matchingMedsDeferredResponse.done(function(matchingMedsCollection) {
                        var channel = ADK.Messaging.getChannel('medication_review');
                        var deferredResponse = channel.request('detailView', { uid: matchingMedsCollection.first().get('uid') });

                        deferredResponse.done(function(response) {
                            var modal = new ADK.UI.Modal({
                                view: response.view,
                                options: {
                                    size: "large",
                                    title: 'Medication - '+clickedResult.model.get('stackedGraphTypeName')
                                }
                            });
                            modal.show();
                        });
                    });
                };

                ADK.PatientRecordService.fetchCollection(fetchOptions);
            });
        }
    };

    return detailController;
});