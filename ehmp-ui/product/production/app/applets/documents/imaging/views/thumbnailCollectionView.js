define(['backbone',
		'underscore',
		'marionette',
		'app/applets/documents/imaging/views/thumbnailView'], function(Backbone, _, Marionette, ThumbnailView) {
		"use strict";
		var ThumbnailCollectionView = Backbone.Marionette.CompositeView.extend({
			template: Handlebars.compile('<div class="col-sm-12"><h5 class="bottom-border-grey-dark">Series</h5></div>'),
			tagName: 'div',
			className: 'row',
			childView: ThumbnailView,
		});

		return ThumbnailCollectionView;
});
