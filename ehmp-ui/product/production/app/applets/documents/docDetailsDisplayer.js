define([
    'backbone',
    'marionette',
    'async',
    'app/applets/documents/detail/simple/docDetailView',
    'app/applets/documents/detail/complex/complexDetailView',
    'app/applets/documents/detail/dodComplexNoteUtil',
    'app/applets/documents/debugFlag',
    'app/applets/documents/appletHelper'
], function(Backbone, Marionette, Async, DocDetailView, ComplexDetailView, DodComplexNoteUtil, DebugFlag, AppletHelper) {
    'use strict';

    var DEBUG = DebugFlag.flag;
    var ERROR_LOG = DebugFlag.errorLog;


    function getDodComplexNotes(models, parentCallback) {

        Async.forEach(models, function makeRequest(model, callback) {

            var complexNoteUri = model.get('dodComplexNoteUri');
            if (complexNoteUri !== undefined && complexNoteUri !== null && !model.get('dodComplexNoteContent')) {
                if (DEBUG) console.log("Fetching DoD Complex Note...");

                //embed DoD pdf note within modal using an embed tag a point src to pdf url
                if (isPdfDocument(complexNoteUri)) {
                    if (DEBUG) console.log("DoD Complex Note is format is PDF.");


                    var criteria = {
                        uid: model.get('uid')
                    };

                    var url = ADK.PatientRecordService.buildUrl('patient-record-complexnote-pdf', criteria);
                    model.set('dodPdfDocumentUri', url);
                    return callback();
                }
                //render DoD html complex note into an iframe
                else {

                    if (DEBUG) console.log("DoD Complex Note format is HTML.");

                    var complexNoteFetchOptions = {
                        resourceTitle: 'patient-record-complexnote-html',
                        criteria: {
                            uid: model.get('uid')
                        },
                        viewModel: {
                            parse: DodComplexNoteUtil.parseModel
                        },
                        onSuccess: function(response) {
                            // Store complex note content in model
                            if (response.models.length > 0) {
                                model.set('dodComplexNoteContent', response.models[0].get('complexNote'));
                            }
                            if (DEBUG) console.log("Success fetching DoD Complex Note content");

                            callback();
                        },
                        onError: function(model, response) {
                            var errorMsg = "Documents: Error fetching DoD Complex Note";
                            if (ERROR_LOG) console.log(errorMsg);
                            callback(errorMsg);
                        }
                    };
                    ADK.PatientRecordService.fetchCollection(complexNoteFetchOptions);
                }
            } else {
                if (DEBUG) console.log("Already have DoD Complex Note, not re-fetching");
                callback();
            }
        }, function onComplete(error) {
            parentCallback(error, models);
        });
    }

    function isPdfDocument(complexNoteUri) {
        if (complexNoteUri) {
            return complexNoteUri.toLowerCase().search('pdf') > -1;
        }

        return false;
    }

    function doGetView(model, docType, resultDocCollection, childDocCollection, callback) {
        var dt = docType.toLowerCase();
        var isStub = model.attributes.stub && model.attributes.stub === 'true';

        if (dt === 'discharge summary' && !isStub) {
            // request external view (asyncronous)
            var deferredResponse = DocDetailsDisplayer.getExternalView(model, docType, resultDocCollection);
            deferredResponse.done(function(results) {
                callback(null, results);
            });
            deferredResponse.fail(function(error) {
                callback(error);
            });

        } else {
            // build internal view (syncronous)
            var view;
            if (isStub) {
                view = new DocDetailView({
                    model: model
                });
            }
            else if (AppletHelper.hasChildDocs(model)) {
                view = new ComplexDetailView({
                    resultDocCollection: resultDocCollection,
                    childDocCollection: childDocCollection,
                    model: model
                });
            } else if (docType.toLowerCase() === 'advance directive') {
                view = new DocDetailView({
                    model: model
                });
            } else if (docType.toLowerCase() === 'administrative note') {
                view = new DocDetailView({
                    model: model
                });
            } else if (docType.toLowerCase() === 'consult') {
                view = new ComplexDetailView({
                    resultDocCollection: resultDocCollection,
                    model: model
                });
            } else if (docType.toLowerCase() === "crisis note") {
                view = new DocDetailView({
                    model: model
                });
            } else if (docType.toLowerCase() === "laboratory report") { //this might have a better template by another team. Feel free to replace this
                view = new DocDetailView({
                    model: model
                });
            } else if (docType.toLowerCase() === 'procedure') {
                view = new ComplexDetailView({
                    resultDocCollection: resultDocCollection,
                    model: model
                });
            } else if (docType.toLowerCase() === "progress note") {
                view = new DocDetailView({
                    model: model
                });
            } else if (docType.toLowerCase() === "radiology") {
                view = new DocDetailView({
                    model: model
                });
            } else if (docType.toLowerCase() === "imaging") { //||(docType === "Radiology"))
                view = new ComplexDetailView({
                    resultDocCollection: resultDocCollection,
                    model: model
                });
            } else if (docType.toLowerCase() === 'surgery') {
                view = new ComplexDetailView({
                    resultDocCollection: resultDocCollection,
                    model: model
                });
            } else if (docType.toLowerCase() === 'clinical procedure') {
                view = new DocDetailView({
                    model: model
                });
            } else {
                view = new DocDetailView({
                    model: model
                });
            }

            // call the callback with the view we just built
            callback(null, {
                view: view,
                title: DocDetailsDisplayer.getTitle(model, docType)
            });
        }
    }

    function doGetTitle(callback) {
        var title = DocDetailsDisplayer.getTitle(model, docType);
        callback(null, title);
    }

    var DocDetailsDisplayer = {

        getDocType: function(model) {
            return model.get('kind');
        },

        getDocId: function(model) {
            return model.get('uid');
        },

        getTitle: function(model, docType) {
            switch (docType.toLowerCase()) {

                // external detail view
                case 'clinical procedure':
                    return 'Clinical Procedure Details';
                case 'discharge summary':
                    return 'Discharge Summary Details';
                case 'surgery report':
                    return 'Surgery Report Details';

                // internal detail view
                case 'advance directive':
                case 'administrative note':
                case 'crisis note':
                case 'laboratory report':
                case 'progress note':
                case 'radiology':
                case 'consult':
                case 'procedure':
                case 'imaging':
                case 'surgery':
                    return model.get('displayTitle') + ' Details';
                default: //for the default case try to use the simple docDetailView
                    return model.get('displayTitle') + ' Details';
            }
        },

        getExternalView: function(model, docType, collection) {
            // request external detail view from screen controller
            var extDetailChannel = ADK.Messaging.getChannel('documents');
            var deferredResponse = extDetailChannel.request('extDetailView', {
                model: model,
                kind: docType,
                uid: model.get('uid')
            });

            return deferredResponse;
        },

        getView: function(model, docType, resultDocCollection, childDocCollection) {

            var deferredResponse = $.Deferred(),
                complexNoteModels = [];

            if (resultDocCollection && resultDocCollection.length > 0) {
                complexNoteModels = resultDocCollection.models;
            } else if (model.get('dodComplexNoteUri')) {
                complexNoteModels = [model];
            }

            Async.series([

                // Fetch complex note content and store in model
                getDodComplexNotes.bind(null, complexNoteModels),

                // Get the detail view
                doGetView.bind(null, model, docType, resultDocCollection, childDocCollection)

            ], function onComplete(error, results) {
                if (error) {
                    deferredResponse.reject(error);
                } else {
                    deferredResponse.resolve(results[1]);
                }
            });

            return deferredResponse.promise();
        }
    };
    return DocDetailsDisplayer;
});
