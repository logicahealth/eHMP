define([
    'app/applets/documents/appletHelper',
    'app/applets/documents/docDetailsDisplayer',
    "app/applets/documents/appConfig"
], function(AppletHelper, DocDetailsDisplayer, appConfig) {
    "use strict";
    var ERROR_LOG = appConfig.errorLog;

    var detailCommunicator = {

        initialize: function(appletId) {
            // expose detail view through messaging
            var channel = ADK.Messaging.getChannel(appletId);
            channel.reply('detailView', function(params) {

                var fetchOptions = {
                    criteria: {
                        "uid": params.uid
                    },
                    patient: ADK.PatientRecordService.getCurrentPatient(),
                    onError: function(model, resp) {
                        if (ERROR_LOG) console.log("Documents detail communicator fetch Error");
                    },
                    onSuccess: function(collection) {
                        collection.trigger('patient-record-document-view:success', collection);
                    },
                    cache: true
                };

                var uidFetchOptions = {
                    criteria: {
                        uid: params.uid
                    },
                    patient: ADK.PatientRecordService.getCurrentPatient(),
                    resourceTitle: 'uid',
                    onError: function(model, response) {
                        if (ERROR_LOG) console.log("Documents detail communicator fetch Error");
                    },
                    onSuccess: function(collection) {
                        collection.trigger('uid:success', collection);
                    },
                    cache: true
                };

                var detailModel = params.model;
                if (detailModel) {
                    var docType = detailModel.get('kind');
                    var resultDocCollection = new ADK.UIResources.Fetch.Document.Collections.ResultsByUidCollection();
                    var childDocCollection = new ADK.UIResources.Fetch.Document.Collections.DocumentCollection();
                    var collection = new ADK.UIResources.Fetch.Document.DocumentViews.Collection();

                    var response = DocDetailsDisplayer.getView(detailModel, docType, resultDocCollection, childDocCollection, collection);
                    var view = response.view;
                    response.view = view.extend({
                        collectionEvents: _.extend(view.prototype.collectionEvents, {
                            'patient-record-document-view:success': function(collection) {
                                if(this.collection.isEmpty()) {
                                    return ADK.PatientRecordService.fetchCollection(uidFetchOptions, collection);
                                }
                                this.collection.trigger('read:success', collection);
                            },
                            'uid:success': function(collection) {
                                this.collection.trigger('read:success', collection);
                            },
                            'read:success': function(collection) {
                                //the model may have been a stub, if the collection has fetchOptions.resourceTitle, it's been fetched
                                // fetchOptions.resourceTitle is set when creating the collection. changing to fetchOptions.criteria
                                var model = collection.first();
                                if (model) this.model.set(model.toJSON());
                                if (!_.has(this.resultDocCollection, 'fetchOptions.criteria'))
                                    AppletHelper.getResultsFromUid(this.model, resultDocCollection);
                                if (!_.has(this.childDocCollection, 'fetchOptions.criteria'))
                                    AppletHelper.getChildDocs(this.model, childDocCollection);
                            }
                        }),
                        onShow: function() {
                            if (this.collection.isEmpty()) collection.fetchCollection(fetchOptions);
                            //if the model has enough data try to get the results immediately
                            AppletHelper.getResultsFromUid(detailModel, resultDocCollection);
                            AppletHelper.getChildDocs(detailModel, childDocCollection);
                        }
                    });

                    return response;
                }

                return null;
            });
        }
    };

    return detailCommunicator;
});