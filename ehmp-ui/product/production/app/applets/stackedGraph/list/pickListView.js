define([
    'backbone',
    'marionette',
    'hbs!app/applets/stackedGraph/list/pickListViewTemplate'

], function(Backbone, Marionette, PickListViewTemplate) {
    "use strict";

    var PickListView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        className: 'picklist',
        template: PickListViewTemplate,
        initialize: function (options) {
            this.model = new Backbone.Model();
            this.model.set('inputId', 'stackedGraph' + options.model.cid);
        }, events: {
            'blur input': function(e){
                if (this.$el.find(e.relatedTarget).html() != this.$el.find('.stacked-graph-filter-button').html()) {
                    this.$el.find('.stacked-graph-filter-button').trigger('click');
                }
            },
            'blur .stacked-graph-filter-button': function(e) {
                if(this.$el.find('.dropdown').hasClass('open')){
                    if(!this.$(e.relatedTarget).hasClass('stacked-graph-filter-button') && !this.$(e.relatedTarget).hasClass('stacked-graph-search-input')){
                        this.$el.find('.stacked-graph-filter-button').trigger('click');
                    }
                }
            }
        }
    });
    return PickListView;
});