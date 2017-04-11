define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/stackedGraph/list/pickListViewTemplate'

], function(Backbone, Marionette, _, PickListViewTemplate) {
    "use strict";

    var PickListView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        className: 'pickList',
        template: PickListViewTemplate,
        events: {
            'click button': 'eventFunction'
        },
        onShow: function() {
            
        }
    });
    return PickListView;
});