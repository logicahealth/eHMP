define([
    'backbone',
    'marionette',
    'hbs!app/applets/orders/toolBar/ordersFilterTemplate'
], function(Backbone, Marionette, ordersFilterTemplate) {
    'use strict';
    var fetchOptions;
    var self;
    var ToolBarView = Backbone.Marionette.ItemView.extend({
        initialize: function(options) {
            this.instanceId = options.instanceId;
            this.collection = options.collection;
            this.menuItems = options.menuItems;
            this.sharedModel = options.sharedModel;
            this.expandedAppletId = options.expandedAppletId;
            this.parentWorkspace = options.parentWorkspace;
            this.displayGroup = ADK.SessionStorage.getAppletStorageModel(this.expandedAppletId, 'activeMenuItem', true, this.parentWorkspace) || 'ALL';
        },
        template: ordersFilterTemplate,
        className: 'toolbar-item',
        events: {
            'change select': 'filterChange'
        },
        clearSearchText: function() {
            this.$el.closest('.grid-toolbar').siblings('#grid-filter-' + this.instanceId).find('#input-filter-search-' + this.instanceId).val('');
            ADK.SessionStorage.setAppletStorageModel(this.expandedAppletId, 'filterText', '', true, this.parentWorkspace);
        },
        setActiveType: function(menuItems, activeDisplayGroup, instanceId) {
            ADK.SessionStorage.setAppletStorageModel(instanceId, 'activeMenuItem', activeDisplayGroup, true, this.parentWorkspace);
        },
        filterChange: function() {
            this.clearSearchText();
            this.displayGroup = this.$('#' + this.instanceId + '-type-options').val();
            this.setActiveType(this.menuItems, this.displayGroup, this.expandedAppletId);
            this.sharedModel.set('displayGroup', this.displayGroup);
        },
        onRender: function() {
            // create the drop-down template HTML
            this.$el.html(this.template({
                instanceId: this.instanceId,
                item: this.menuItems.toJSON()
            }));

            //set the drop-down default to the active item
            this.$('#' + this.instanceId + '-type-options').val(ADK.SessionStorage.getAppletStorageModel(this.expandedAppletId, 'activeMenuItem', true, this.parentWorkspace) || 'ALL');
        }
    });
    return ToolBarView;
});