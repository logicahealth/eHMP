define([
    'app/resources/fetch/narrative_labs/model',
    'app/resources/fetch/narrative_labs/collection'
], function(NarrativeLabsModel, NarrativeLabsCollection) {
    'use strict';

    return {
        Model: NarrativeLabsModel,
        Collection: NarrativeLabsCollection
    };
});
