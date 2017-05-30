define(['backbone',
    'app/resources/fetch/document/imaging/thumbnail'
], function(Backbone, Thumbnail) {
    "use strict";

    //A model for thumbnails for imaging studies
    var ThumbnailCollection = Backbone.Collection.extend({
        model: Thumbnail,
        initialize: function(models, options) {
            this.options = options;
        },
        url: function() {
            return ADK.ResourceService.buildUrl('vix-image', _.get(this, 'options.urlOptions'));
        }
    });
    return ThumbnailCollection;

});