define([
    'backbone',
    'underscore',
    'marionette',
    'app/applets/documents/imaging/views/thumbnailView'
], function(
    Backbone,
    _,
    Marionette,
    ThumbnailView
) {
    "use strict";
    var ThumbnailCollectionView = Backbone.Marionette.CollectionView.extend({
        tagName: 'div',
        className: 'row',
        childView: ThumbnailView,
        emptyView: ADK.Views.Loading.view,
        collectionEvents: {
            'error': function() {
                this.emptyView = ADK.Views.Error.view;
                this.render();
            },
            'success': function() {
                this.emptyView = Backbone.Marionette.ItemView.extend({
                    template: false
                });
                this.render();
            }
        },
        initialize: function(options) {
            if (!!this.getOption('avoidFetch')) {
                this.collection.trigger('success');
            } else {
                this.collection.fetch({
                    reset: true
                });
            }
        }
    });
    return ThumbnailCollectionView;
});