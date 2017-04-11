define(['backbone',
		'underscore',
		'app/applets/documents/imaging/models/thumbnail'
],		function(Backbone, _, Thumbnail){
		"use strict";

		//A model for thumbnails for imaging studies
		var ThumbnailCollection = Backbone.Collection.extend({
			model: Thumbnail
		});
		return ThumbnailCollection;

});


