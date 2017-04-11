define([
    'backbone',
    'marionette',
    'hbs!app/applets/activities/toolbar/activitiesFilterTemplate'
], function(Backbone, Marionette, activitiesFilterTemplate) {
    'use strict';
    var fetchOptions;
    var self;
    var ToolBarView = Backbone.Marionette.ItemView.extend({
        initialize: function(options) {
            this.instanceId = options.instanceId;
            this.viewType = options.viewType;
            this.collection = options.collection;
            this.parentWorkspace = options.parentWorkspace;
            this.expandedAppletId = options.expandedAppletId;
            this.sharedModel = options.sharedModel;
            this.contextViewType = options.contextViewType;
        },
        template: activitiesFilterTemplate,
        className: 'toolbar-item',
        events: {
            'change select': 'filterChange'
        },
        onRender: function() {
            var primaryMenuItems = new Backbone.Collection();
            var secondaryMenuItems = new Backbone.Collection();

            if(this.contextViewType === 'patient'){
                primaryMenuItems.add(new Backbone.Model({name: 'Activities Related to Me', value: 'intendedForAndCreatedByMe'}));
                primaryMenuItems.add(new Backbone.Model({name: 'All Activities', value: 'none'}));
            } else {
                primaryMenuItems.add(new Backbone.Model({name: 'All Activities Related to Me', value: 'none'}));
            }
            primaryMenuItems.add(new Backbone.Model({name: 'Intended for Me or My Team(s)', value: 'intendedForMe'}));
            primaryMenuItems.add(new Backbone.Model({name: 'Created by Me', value: 'me'}));

            if(this.viewType === 'expanded'){
                secondaryMenuItems.add(new Backbone.Model({name: 'Open', value: 'open'}));
                secondaryMenuItems.add(new Backbone.Model({name: 'Open and Closed', value: 'openAndClosed'}));
                secondaryMenuItems.add(new Backbone.Model({name: 'Closed', value: 'closed'}));
            }

            var filterSplit = this.sharedModel.get('filter').split(';');
            var primarySelection = filterSplit[0];
            var secondarySelection = filterSplit[1];

            var primarySelectedMenuItem = primaryMenuItems.findWhere({value: primarySelection});
            var secondarySelectedMenuItem = secondaryMenuItems.findWhere({value: secondarySelection});

            if(!_.isUndefined(primarySelectedMenuItem)){
                primarySelectedMenuItem.set('selected', true);
            }

            if(!_.isUndefined(secondarySelectedMenuItem)){
                secondarySelectedMenuItem.set('selected', true);
            }

            this.$el.html(this.template({
                instanceId: this.instanceId,
                contextViewType: this.contextViewType,
                primaryItem: primaryMenuItems.toJSON(),
                secondaryItem: secondaryMenuItems.toJSON()
            }));
        },
        clearSearchText: function() {
            this.$el.parent().siblings('#grid-filter-' + this.instanceId).find('#input-filter-search-' + this.instanceId).val('');
            ADK.SessionStorage.setAppletStorageModel(this.expandedAppletId, 'filterText', '', true, this.parentWorkspace);
        },
        filterChange: function() {
            this.clearSearchText();
            var primaryDisplay = this.$('#' + this.instanceId + '-primary-filter-options').val();
            var secondaryDisplay = this.$('#' + this.instanceId + '-display-only-options').val();

            var display = {};
            if(!secondaryDisplay){
                secondaryDisplay = 'open';
            }

            this.sharedModel.set('filter', primaryDisplay + ';' + secondaryDisplay);
        }
    });

    return ToolBarView;

});