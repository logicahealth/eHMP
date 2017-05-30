define([
    'backbone',
    'marionette',
    'async',
    'moment',
    'app/applets/documents/detail/simple/docDetailView',
    'app/applets/documents/detail/complex/complexDetailView',
    'app/applets/documents/detail/dodComplexNoteUtil',
    'app/applets/documents/appConfig',
    'app/applets/documents/appletHelper',
    'pdf'
], function(Backbone, Marionette, Async, moment, DocDetailView, ComplexDetailView, DodComplexNoteUtil, appConfig, AppletHelper, pdf) {
    'use strict';

    var DEBUG = appConfig.debug;
    var ERROR_LOG = appConfig.errorLog;
    var COMPLEX_VIEWS = appConfig.complexViews;

    var getDodComplexNotes = function(models) {
        if (models.length !== 1) {
            this.trigger('complexNotes');
            return;
        }
        var model = models[0];
        var complexNoteUri = model.get('dodComplexNoteUri');
        if (complexNoteUri !== undefined && complexNoteUri !== null && !model.get('dodComplexNoteContent')) {
            if (DEBUG) console.log("Fetching DoD Complex Note...");

            //embed DoD pdf note within modal using an embed tag a point src to pdf url
            if (isPdfDocument(complexNoteUri)) {
                if (DEBUG) console.log("DoD Complex Note is format is PDF.");
                if (!model.get('dodComplexNotePdf')) model.set('dodComplexNotePdf', true);
                this.trigger('complexNotes');
                return;
            }
            //render DoD html complex note into an iframe
            else {
                var complexData = new ADK.UIResources.Fetch.Document.ComplexNote.Collection();
                this.listenToOnce(complexData, 'fetch:success', function() {
                    this.stopListening(complexData, 'fetch:error');
                    model.set('dodComplexNoteContent', complexData.models[0].get('complexNote'));
                    this.trigger('complexNotes', model);
                    return;
                });
                this.listenToOnce(complexData, 'fetch:error', function() {
                    this.stopListening(complexData, 'fetch:success');
                    var errorMsg = "Documents: Error fetching DoD Complex Note";
                    if (ERROR_LOG) console.log(errorMsg);
                    this.trigger('complexNotes', errorMsg);
                    return;
                });

                if (DEBUG) console.log("DoD Complex Note format is HTML.");

                var complexNoteFetchOptions = {
                    criteria: {
                        uid: model.get('uid')
                    }
                };
                complexData.fetchCollection(complexNoteFetchOptions);
            }
        } else {
            if (DEBUG) console.log("Already have DoD Complex Note, not re-fetching");
            this.trigger('complexNotes');
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

        if (dt === 'discharge summary' && !isStub) {
            // request external view (asyncronous)
            var response = DocDetailsDisplayer.getExternalView(model, docType, resultDocCollection);
            return {
                view: response.view,
                title: response.title
            };
        } else {
            var View;
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
            } else if (_.contains(COMPLEX_VIEWS, docType.toLowerCase())) {
                View = ComplexDetailView.extend({
                    resultDocCollection: resultDocCollection,
                    childDocCollection: childDocCollection,
                    model: model
                });
            } else {
                View = DocDetailView.extend({
                    model: model
                });
            }

            var documentClass = model.get('documentClass') || '';
            if (documentClass.toLowerCase() === 'progress notes') {
                injectSignatureBlock(model);
            }

            return {
                view: View,
                title: DocDetailsDisplayer.getTitle(model, docType)
            };
        }
    }

    function injectSignatureBlock(model) {
        if (!_.get(model, 'attributes.clinicians')) {
            return;
        }
        var signatures = getSignatures(model.get('clinicians'), model.get('status') === 'AMENDED');
        model.set('signature', signatures);

        _.each(model.get('text'), function(documentText) {
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
            var asigners = _.filter(clinicians, function(item) {
                return _.has(item, 'role') && item.role === 'AM';
            });
            //there can only be one amendment signer
            if (asigners.length > 0) {
                signatures += getSignature(asigners[0]);
            } else {
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
        if (signer.role === 'AM') {
            signedText = '\n' + signedDateTime + ' AMENDMENT FILED:\n' + signatureSuffix + '\n';
        } else {
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
                case 'radiology report':
                    return model.get('localTitle');

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
            var response = extDetailChannel.request('extDetailView', {
                model: model,
                kind: docType,
                uid: model.get('uid')
            });

            return response;
        },

        getView: function(model, docType, resultDocCollection, childDocCollection, modalCollection) {
            var View = Backbone.Marionette.LayoutView.extend({
                collection: modalCollection,
                resultDocCollection: resultDocCollection,
                childDocCollection: childDocCollection,
                template: Handlebars.compile('<div class="detail-modal-content"></div>'),
                regions: {
                    'view': '.detail-modal-content'
                },
                'collectionEvents': {
                    'fetch:success': function(collection, response) {
                        if (!this.getRegion('view').hasView()) {
                            this.onBeforeShow();
                        }

                    }
                },
                initialize: function() {
                    this.bindEntityEvents(this.resultDocCollection, this.collectionEvents);
                    this.bindEntityEvents(this.childDocCollection, this.collectionEvents);
                    var Model = Backbone.Model.extend({
                        defaults: {
                            displayTitle: ''
                        }
                    });
                    if (!this.model) this.model = new Model();
                },
                childEvents: {
                    'render': function(view) {
                        if (view.model && view.model.get('dodPdfDocumentUri')) {
                            //prevent modal from displaying a scroll bar (needed to avoid display of two scroll bars)
                            $('#modal-body').css('max-height', '100%');
                        }
                    }
                },
                onBeforeShow: function() {
                    if (this.collection.isEmpty()) return;

                    var complexNoteModels = [];
                    this.model.set(_.get(this.collection.at(0), 'attributes'));

                    if (resultDocCollection && resultDocCollection.length > 0) {
                        complexNoteModels = resultDocCollection.models;
                    } else if (this.model.get('dodComplexNoteUri')) {
                        complexNoteModels = [this.model];
                    }
                    var response = doGetView(this.model, docType, this.resultDocCollection, this.childDocCollection);
                    this.responseView = response.view;

                    this.listenToOnce(this, 'complexNotes', function() {
                        var view = new this.responseView();
                        this.getRegion('view').show(view);
                    });
                    var view = new this.responseView();

                    if (_.isEmpty(complexNoteModels)) this.getRegion('view').show(view);
                    else getDodComplexNotes.call(this, complexNoteModels);
                },
                onBeforeDestroy: function() {
                    this.unbindEntityEvents(this.resultDocCollection, this.collectionEvents);
                    this.unbindEntityEvents(this.childDocCollection, this.collectionEvents);
                },
                title: function() {
                    return DocDetailsDisplayer.getTitle(this.model, docType);
                }
            });
            return {
                view: View,
                title: function() {
                    return DocDetailsDisplayer.getTitle(model, _.isString(docType) ? docType : model.get('kind'));
                }
            };
        }
    };
    return DocDetailsDisplayer;
});
