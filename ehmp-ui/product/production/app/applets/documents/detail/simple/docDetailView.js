define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/documents/appletHelper',
    'app/applets/documents/detail/dodComplexNoteUtil',
    'app/applets/documents/detail/addendaView',
    'hbs!app/applets/documents/detail/simple/docDetailTemplate',
    'app/applets/documents/imaging/views/thumbnailCollectionView'
], function(Backbone, Marionette, _, appletHelper, dodComplexNoteUtil, AddendaView, detailTemplate, ThumbnailCollectionView) {
    'use strict';

    return Backbone.Marionette.LayoutView.extend({
        template: detailTemplate,
        events: {
            'click .detail-result-link': 'onClickResultLink',
            'keydown .detail-result-link': 'onEnter'
        },
        regions: {
            addendaRegion: '.document-detail-addenda-region',
            pdfViewer: '.pdf-viewer-container',
            thumbnailRegion: '.thumbnails-region'
        },
        onClickResultLink: function(event) {
            var docUid = $(event.target).attr('data-doc-uid'),
                $targetResult = this.$el.find('.result-doc[data-doc-uid="' + docUid + '"]');

            if ($targetResult.length > 0) {
                // scroll to the selected result document
                appletHelper.scrollToResultDoc($(event.target), $targetResult);

                // focus first focusable element in the selected result document
                $targetResult.focus();
            }
        },
        onBeforeShow: function() {
            this.addendaRegion.show(new AddendaView({
                model: this.model
            }));
            if (this.model.has('dodComplexNotePdf'))
                this.pdfViewer.show(new ADK.UI.PdfViewer({
                    model: this.model
                }));
            if (this.model.get('hasImages')) {
                this.thumbnailRegion.show(new ThumbnailCollectionView({
                    collection: this.model.get('thumbnails'),
                }));
            }
        },
        onEnter: function(keyEvent) {
            if (keyEvent.keyCode === 13 || keyEvent.keyCode === 32) {
                keyEvent.preventDefault();
                $(keyEvent.target).click();
            }
        },
        onShow: function() {
            if (this.model.get('dodComplexNoteContent')) {
                dodComplexNoteUtil.showContent.call(this, this.model);
            }
        },
        getNextModal: function(model, view, resultDocCollection, childDocCollection) {
            var modals = model.collection.models;
            var next = _.indexOf(modals, model) + 1;
            var newModel = modals[next];
            var appletRows = _.filter($('[data-appletid="documents"] tbody tr'), function(item) { return !($(item).hasClass('group-by-header')); });
            appletRows[next].click();
        },
        getPrevModal: function(model, view, resultDocCollection, childDocCollection) {
            var modals = model.collection.models;
            var next = _.indexOf(modals, model) - 1;
            var newModel = modals[next];
            var appletRows = _.filter($('[data-appletid="documents"] tbody tr'), function(item) { return !($(item).hasClass('group-by-header')); });
            appletRows[next].click();
        }
    });
});
