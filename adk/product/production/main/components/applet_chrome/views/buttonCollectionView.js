define([
    'jquery',
    'underscore',
], function($, _) {
    'use strict';

    var ButtonCollectionView = Backbone.Marionette.CollectionView.extend({
        getChildView: function(item) {
            if(item.get('view')) {
                return item.get('view');
            } else {
                console.error('ButtonCollection item does not have a view to show');
            }
        }
    });

    return ButtonCollectionView;
});