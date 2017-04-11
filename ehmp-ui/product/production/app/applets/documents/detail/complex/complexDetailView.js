define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/documents/debugFlag',
    'app/applets/documents/appletHelper',
    'app/applets/documents/detail/addendaView',
    'hbs!app/applets/documents/detail/complex/complexDetailWrapperTemplate',
    'hbs!app/applets/documents/detail/complex/resultsTemplate',
    'hbs!app/applets/documents/detail/complex/resultDocTemplate',
    'app/applets/documents/detail/dodComplexNoteUtil'
], function(Backbone, Marionette, _, Handlebars, DEV, appletHelper, AddendaView, complexDetailWrapperTemplate, resultsTemplate, resultDocTemplate, dodComplexNoteUtil) {
    'use strict';

    var DEBUG = DEV.flag;

    // An item view representing a shortcut link to a child/result document
    var ResultLinkItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<button type="button" class="detail-result-link btn btn-link btn-sm" data-doc-uid="{{uid}}" title="Press enter to view results">{{localTitle}}</button>'),
    });

    // An item view representing a single child/result document, of which there may be several
    var ResultDocItemView = Backbone.Marionette.LayoutView.extend({
        template: resultDocTemplate,
        regions: {
            addendaView: '.document-detail-addenda-region',
            pdfViewer: '.pdf-viewer-container'
        },
        onBeforeShow: function() {
            this.addendaView.show(new AddendaView({
                model: this.model
            }));
            if (this.model.has('dodComplexNotePdf'))
                this.pdfViewer.show(new ADK.UI.PdfViewer({
                    model: this.model,
                }));
        }
    });

    // A view representing the children/results portion of the detail view (the child/result documents and the corresponding shortcut links)
    var ResultLinksCollectionView = Backbone.Marionette.CollectionView.extend({
        childView: ResultLinkItemView
    });

    // A collection view for the child/result documents
    var ResultDocsCollectionView = Backbone.Marionette.CollectionView.extend({
        childView: ResultDocItemView
    });
    // Not available results view
    var NA_View = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<div class="row top-margin-sm"><div class="col-xs-12"><h5 class="bottom-border-grey-dark">Results</h5></div></div><p>N/A</p>')
    });
    // A mid-level view representing the results or child docs area, including shortcut links, document content, and header
    var ResultsView = Backbone.Marionette.LayoutView.extend({
        template: resultsTemplate,
        events: {
            'click .detail-result-link': 'onClickResultLink',
            'keydown .detail-result-link': 'onEnter'
        },
        regions: {
            resultLinksRegion: '.result-links-region',
            resultDocsRegion: '.result-docs-region'
        },
        initialize: function(options) {
            if (DEBUG) console.log("complexDetailView with %d items", options.resultDocCollection.length);
            this.resultDocCollection = options.resultDocCollection;
        },
        onEnter: function(keyEvent) {
            if (keyEvent.keyCode === 13 || keyEvent.keyCode === 32) {
                keyEvent.preventDefault();
                $(keyEvent.target).click();
            }
        },
        onClickResultLink: function(event) {
            // handle scrolling the view to the result document when the shortcut link is clicked
            var docUid = $(event.target).attr('data-doc-uid'),
                $targetResult = this.$el.find('.result-doc[data-doc-uid="' + docUid + '"]');

            if ($targetResult.length > 0) {
                // scroll to the selected result document
                appletHelper.scrollToResultDoc($(event.target), $targetResult);

                // focus first focusable element in the selected result document
                $targetResult.find('*[tabindex]').first().focus();
            }
        },
        onRender: function() {
            // show the shortcut links to the child/result documents
            this.resultLinksRegion.show(new ResultLinksCollectionView({
                collection: this.resultDocCollection
            }));
            // show the child/result documents
            this.resultDocsRegion.show(new ResultDocsCollectionView({
                collection: this.resultDocCollection
            }));
        }
    });

    // The top-level view representing a document detail view of a document with child/result documents
    var DocumentDetailView = Backbone.Marionette.LayoutView.extend({
        template: complexDetailWrapperTemplate,
        regions: {
            addendaRegion: '.document-detail-addenda-region',
            resultsRegion: '.results-region',
            childrenRegion: '.children-region'
        },
        initialize: function(options) {
            if (this.hasChildDocuments()) {
                this.listenToOnce(this.childDocCollection, 'fetch:success', this.onChildDocsReady);
                this.listenToOnce(this.childDocCollection, 'error', this.onChildDocsError);
            }
            if (this.hasResultDocuments()) {
                this.listenToOnce(this.resultDocCollection, 'fetch:success', this.onResultDocsReady);
                this.listenToOnce(this.resultDocCollection, 'error', this.onResultDocsError);
            }
        },
        hasResultDocuments: function() {
            return this.model.get('results') && this.model.get('results').length > 0;
        },
        hasChildDocuments: function() {
            return this.childDocCollection !== null && this.childDocCollection !== undefined;
        },
        onChildDocsError: function(resp) {
            var errorModel = new Backbone.Model(resp);
            this.childDocCollection.reset([errorModel]);
        },
        onResultDocsError: function(resp) {
            var errorModel = new Backbone.Model(resp);
            this.resultDocCollection.reset([errorModel]);
        },
        isError: function(collection) {
            var model;
            var status;
            if (collection.isEmpty()) {
                return false;
            } else {
                if (collection.length > 1) { return false; }
                model = collection.at(0);
                if (!_.isUndefined(model.get('status'))){
                    status = model.get('status');
                    // JDS or RDK error
                    if (((status.toString().length === 3) && (status !== 200)) || ((status.toString().length === 1) && (status === 0))) { 
                        return true;
                    }
                }
            }
            return false;
        },
        onResultDocsReady: function() {
            if (this.resultDocCollection.isEmpty()) {
                // if there were no results, hide the loading view and show nothing
                //this.resultsRegion.reset();
                this.resultsRegion.show(new NA_View());
            } else {
                if (this.isError(this.resultDocCollection)) {
                    // show the error view 
                    this.resultsRegion.show(ADK.Views.Error.create({
                        model: this.resultDocCollection.at(0)
                    }));
                } else {
                    // otherwise show the results
                    this.resultsRegion.show(new ResultsView({
                        resultDocCollection: this.resultDocCollection,
                        model: new Backbone.Model({
                            regionTitle: 'Results'
                        })
                    }));
                }
            }
            ADK.Messaging.getChannel('search').trigger('documentsLoaded', this.$el);
        },
        onChildDocsReady: function() {
            if (this.childDocCollection.isEmpty()) {
                // if there were no child documents, hide the loading view and show nothing
                this.childrenRegion.reset();
            } else {

                if (this.isError(this.childDocCollection)) {
                    // show the error view
                    this.resultsRegion.show(ADK.Views.Error.create({
                        model: this.childDocCollection.at(0)
                    }));
                } else {
                    // otherwise show the child documents
                    if (DEBUG) console.log("complexDetailView with %d items", this.childDocCollection.length);
                    this.childrenRegion.show(new ResultsView({
                        resultDocCollection: this.childDocCollection,
                        model: new Backbone.Model({
                            regionTitle: 'Child Documents'
                        })
                    }));
                }
            }
            ADK.Messaging.getChannel('search').trigger('documentsLoaded', this.$el);
        },
        onRender: function() {
            this.addendaRegion.show(new AddendaView({ model: this.model }));

            // if we're waiting for child documents to be fetched, show a loading view
            if (this.hasChildDocuments()) {
                if(!this.childDocCollection.xhr) {
                    this.onChildDocsReady();
                } else {
                    this.childrenRegion.show(ADK.Views.Loading.create());
                }
            }
            // if we're waiting for result documents to be fetched, show a loading view
            if (this.hasResultDocuments()) {
                if(!this.resultDocCollection.xhr) {
                    this.onChildDocsReady();
                }
                else {
                    this.resultsRegion.show(ADK.Views.Loading.create());
                }
            } else {
                // RESULTS N/A
                this.resultsRegion.show(new NA_View());
            }
        },
        onShow: function() {
            if (this.model.get('dodComplexNoteContent')) {
                dodComplexNoteUtil.showContent.call(this, this.model);
            }
        }
    });

    return DocumentDetailView;
});