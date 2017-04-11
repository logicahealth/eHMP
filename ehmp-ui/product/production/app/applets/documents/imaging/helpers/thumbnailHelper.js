define(['backbone',
		'underscore',
		'app/applets/documents/imaging/models/thumbnail',
		'app/applets/documents/imaging/models/thumbnailCollection'
], function(Backbone, _, Thumbnail, ThumbnailCollection) {
	"use strict";
	
	return {
		convertThumbnails: function(model) {
			var thumbnailsCollection = new ThumbnailCollection();
			var thumbnails = _.values(model.thumbnails);
			thumbnails.forEach(function(thumbnail){
				var options = {
					url: thumbnail,
					viewerUrl: model.viewerUrl,
					imageCount:model.imageCount
				};
				thumbnailsCollection.add(new Thumbnail(options));

			});
			model.thumbnails = thumbnailsCollection;
		}
	};

});