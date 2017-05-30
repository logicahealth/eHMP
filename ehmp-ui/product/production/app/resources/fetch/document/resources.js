define([
    'app/resources/fetch/document/collection',
    'app/resources/fetch/document/document_view/collection',
    'app/resources/fetch/document/complex_note/collection'
], function(
    Collections, DocumentViews, ComplexNote
) {
    'use strict';

    return {
        Collections: Collections,
        DocumentViews: DocumentViews,
        ComplexNote: ComplexNote
    };
});