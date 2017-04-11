define([
    'backbone',
    'marionette',
    'hbs!app/applets/appointments/toolBar/apptsFilterTemplate'
], function(Backbone, Marionette, apptsFilterTemplate) {
    'use strict';

    var ToolBarView = Backbone.Marionette.ItemView.extend({

        apptSite: 'ALL',
        initialize: function(options) {
            this.collection = options.collection;
            this.siteMenuItems = options.siteMenuItems;
            this.filterValue = options.filterValue;
            this.setActiveSite(this.siteMenuItems, 'ALL');
            this.instanceId = options.instanceId;
        },
        template: apptsFilterTemplate,
        className: 'toolbar-item',
        events: {
            'change .appts-type-menu': 'filterBySite',

        },
        clearSearchText: function () {
            this.$el.parents('#grid-panel-' + this.instanceId).find('#input-filter-search-' + this.instanceId).val('');
            ADK.SessionStorage.setAppletStorageModel('appointments', 'filterText', '');
        },
        filterBySite: function (event) {
            this.apptSite = this.$('.appts-type-menu').val();
            // ADK.SessionStorage.setAppletStorageModel('appointments', 'siteFilter', this.apptSite);    

            this.filterResults(this.apptSite, this.collection, this.filterValue);
            this.setActiveSite(this.siteMenuItems, this.apptSite);
            var $target = $(event.currentTarget);
            $target.closest('.btn-group').find('[data-bind="label"]').text($target.text());
            this.clearSearchText(); //changing order type resets the search text

            event.preventDefault();
            return true;
        },
        setActiveSite: function (menuItems, activeSite) {
            for (var i = 0; i < menuItems.models.length; i++) {
                if (menuItems.models[i].get('site') === activeSite) {
                    menuItems.models[i].set('active', true);
                } else {
                    menuItems.models[i].set('active', false);
                }
            }
        },
        filterResults: function (apptSite, collection, filterValue) {
            var filterFunction;
            switch (apptSite) {
                case 'LOCAL':
                    ADK.utils.filterCollectionSubstring(collection, 'uid', filterValue);
                    break;
                case 'ALLVA':
                    ADK.utils.filterCollectionNoSubstring(collection, 'uid', ':DOD:');
                    break;
                default:
                    ADK.utils.resetCollection(collection);
                    break;
            }

        },
        filterResultsDefault: function (collection) {
            return this.filterResults(this.apptSite, collection, this.filterValue);
        },
        onRender: function () {
            //set the overflow: visible for the orders panel to allow
            //the drop-down to drop below the boundaries of the applet, if needed
            $('#grid-panel-appointments').css({
                'overflow': 'visible'
            });

            //create the drop-down template HTML
            this.$el.html(this.template({
                siteitems: this.siteMenuItems.toJSON(),
                instanceId: this.instanceId
            }));

            //set the drop-down button to the active item
            var siteitem = this.siteMenuItems.findWhere({
                'active': true
            });

            this.$('.appts-type-menu').val(siteitem.get('site'));
        }
    });

    return ToolBarView;

});
