define([
    'backbone',
    'marionette',
    'hbs!app/applets/stackedGraph/list/pickListViewTemplate'

], function(Backbone, Marionette, PickListViewTemplate) {
    "use strict";

    var PickListView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        className: 'picklist',
        stackedGraphFilterButtonClass: 'stacked-graph-filter-button',
        stackedGraphSearchInputClass: 'stacked-graph-search-input',
        ieTooltipScrollClass: 'tt-dropdown-menu',
        template: PickListViewTemplate,
        initialize: function (options) {
            this.model = new Backbone.Model();
            this.model.set('inputId', 'stackedGraph' + options.model.cid);
        }, events: {
            'blur input': function(e){
                if (!_.isEmpty(e.relatedTarget) && !_.isEqual(e.relatedTarget.className, this.ieTooltipScrollClass) && this.$el.find(e.relatedTarget).html() !== this.$el.find('.' + this.stackedGraphFilterButtonClass).html()) {
                    this.$el.find('.' + this.stackedGraphFilterButtonClass).trigger('click');
                }
            },
            'blur .stacked-graph-filter-button': function(e) {
                if(this.$el.find('.dropdown').hasClass('open')){
                    if(!this.$(e.relatedTarget).hasClass(this.stackedGraphFilterButtonClass) && !this.$(e.relatedTarget).hasClass(this.stackedGraphSearchInputClass)){
                        this.$el.find('.' + this.stackedGraphFilterButtonClass).trigger('click');
                    }
                }
            }
        }
    });
    return PickListView;
});