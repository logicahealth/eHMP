define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/documents/appletHelper',
    'app/applets/documents/detail/dodComplexNoteUtil',
    'app/applets/documents/detail/addendaView',
    'hbs!app/applets/documents/detail/simple/docDetailTemplate'
], function(Backbone, Marionette, _, appletHelper, dodComplexNoteUtil, AddendaView, detailTemplate) {
    'use strict';
    return Backbone.Marionette.LayoutView.extend({
        template: detailTemplate,
        events: {
            'click .detail-result-link': 'onClickResultLink',
            'keydown .detail-result-link': 'onEnter'
        },
        regions: {
            addendaRegion: '.document-detail-addenda-region',
            pdfViewer: '.pdf-viewer-container'
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
        }
    });
});
