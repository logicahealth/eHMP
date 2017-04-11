define([
    'backbone',
    'marionette',
    'async',
    'app/applets/documents/detail/simple/docDetailView',
    'app/applets/documents/detail/complex/complexDetailView',
    'app/applets/documents/detail/dodComplexNoteUtil',
    'app/applets/documents/debugFlag',
    'app/applets/documents/appletHelper',
    'pdf'
], function(Backbone, Marionette, Async, DocDetailView, ComplexDetailView, DodComplexNoteUtil, DebugFlag, AppletHelper, pdf) {
    'use strict';

    var DEBUG = DebugFlag.flag;
    var ERROR_LOG = DebugFlag.errorLog;

    var getDodComplexNotes = function(models, parentCallback) {
        if (models.length !== 1) {
            parentCallback();
            return;
        }
        var model = models[0];
        var complexNoteUri = model.get('dodComplexNoteUri');
        if (complexNoteUri !== undefined && complexNoteUri !== null && !model.get('dodComplexNoteContent')) {
            if (DEBUG) console.log("Fetching DoD Complex Note...");

            //embed DoD pdf note within modal using an embed tag a point src to pdf url
            if (isPdfDocument(complexNoteUri)) {
                if (DEBUG) console.log("DoD Complex Note is format is PDF.");
                if(!model.get('dodComplexNotePdf')) model.set('dodComplexNotePdf', true);
                parentCallback();
                return;
            }
            //render DoD html complex note into an iframe
            else {
                var complexData = new Backbone.Collection();
                this.listenToOnce(complexData, 'fetch:success', function() {
                    this.stopListening(complexData, 'fetch:error');
                    model.set('dodComplexNoteContent', complexData.models[0].get('complexNote'));
                    return parentCallback(null, model);
                });
                this.listenToOnce(complexData, 'fetch:error', function() {
                    this.stopListening(complexData, 'fetch:success');
                    var errorMsg = "Documents: Error fetching DoD Complex Note";
                    if (ERROR_LOG) console.log(errorMsg);
                    return parentCallback(errorMsg);
                });

                if (DEBUG) console.log("DoD Complex Note format is HTML.");

                var complexNoteFetchOptions = {
                    resourceTitle: 'patient-record-complexnote-html',
                    criteria: {
                        uid: model.get('uid')

                    },
                    viewModel: {
                        parse: DodComplexNoteUtil.parseModel
                    },
                };
                ADK.PatientRecordService.fetchCollection(complexNoteFetchOptions, complexData);
            }
        } else {
            if (DEBUG) console.log("Already have DoD Complex Note, not re-fetching");
            parentCallback();
        }
    };

    function isPdfDocument(complexNoteUri) {
        if (complexNoteUri) {
            return complexNoteUri.toLowerCase().search('pdf') > -1;
        }

        return false;
    }

    function doGetView(model, docType, resultDocCollection, childDocCollection, callback) {
        if (DEBUG) console.log("Doc Details Displayer -----> doGetView");
        var dt = docType.toLowerCase();
        var isStub = model.attributes.stub && model.attributes.stub === 'true';
        var complexViews = ['consult', 'procedure', 'imaging', 'surgery'];

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
            var view, View;
            if (isStub) {
                View = DocDetailView.extend({
                    model: model
                });
            } else if (AppletHelper.hasChildDocs(model)) {
                View = ComplexDetailView.extend({
                    resultDocCollection: resultDocCollection,
                    childDocCollection: childDocCollection,
                    model: model
                });
            } else if(_.contains(complexViews, docType.toLowerCase())) {
                View = ComplexDetailView.extend({
                    resultDocCollection: resultDocCollection,
                    model: model
                });
            } else {
                View = DocDetailView.extend({
                    model: model
                });
            }

            view = new View();

            var documentClass = model.get('documentClass') || '';
            if (documentClass.toLowerCase() === 'progress notes') {
                injectSignatureBlock(view);
            }

            // call the callback with the view we just built
            callback(null, {
                view: view,
                title: DocDetailsDisplayer.getTitle(model, docType)
            });
            // build internal view (syncronous)
        }
    }

    function injectSignatureBlock(view) {
        if (_.isEmpty(view)) {
            return;
        }

        // Heal bad data
        if (!view.model) {
            view.model = new Backbone.Model();
        }

        if (!view.model.get('clinicians')) {
            return;
        }
        var signatures = getSignatures(view.model.get('clinicians'), view.model.get('status') === 'AMENDED');
        view.model.set('signature', signatures);

        _.each(view.model.get('text'), function(documentText) {
            documentText.signature = getSignatures(documentText.clinicians, false);
        });
    }

    function getSignatures(clinicians, amended) {
        if (!clinicians || !clinicians.length) {
            return '';
        }

        var signatures = '';

        _.each(clinicians, function(val, key) {
            var signer = val;
            if (!_.isEmpty(signer) && _.has(signer, 'role') && (signer.role === 'S' || signer.role === 'C')) {
                signatures += getSignature(signer);
            }
        });
        if (amended) {
            var asigners = _.filter(clinicians, function(item){
                return _.has(item, 'role') && item.role === 'AM';
            });
            //there can only be one amendment signer
            if (asigners.length > 0) {
                signatures += getSignature(asigners[0]);
            }
            else {
                signatures += '\nAMENDMENT FILED: \n N/A';
            }
        }

        return signatures;
    }

    function getSignature(signer) {
        var signedDateTime = moment(signer.signedDateTime, 'YYYYMMDDHHmmss').format('MM/DD/YYYY - HH:mm');
        var signatureSuffix = '';
        var signedText;

        if (signer.signaturePrintedName && signer.signatureTitle) {
            signatureSuffix = signer.signaturePrintedName + ' ' + signer.signatureTitle;
        } else {
            signatureSuffix = signer.signature;
        }
        if(signer.role === 'AM') {
            signedText = '\n' +signedDateTime + ' AMENDMENT FILED:\n' + signatureSuffix + '\n';
        }
        else {
            signedText = '\nSigned: ';
            if (signer.role === 'C') {
                signedText = '\nCosigned: ';
            }
            signedText += signedDateTime +
                    '\nBy: ' + signatureSuffix + '\n';
        }
        return signedText;
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
                    return model.get('displayTitle');
                default: //for the default case try to use the simple docDetailView
                    return model.get('displayTitle');
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
            var self = this;
            Async.series([

                // Fetch complex note content and store in model
                getDodComplexNotes.bind(self, complexNoteModels),

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