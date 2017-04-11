define([
    'underscore',
    'backbone',
    'marionette',
    'main/backgrid/customFilter'
], function(_, Backbone, Marionette, CustomFilter) {
    'use strict';
    return Backbone.Marionette.Controller.extend({
        initialize: function(options) {
            this.view = options.view;
            this.dateFilteredCollection = options.collection;
            this.textFilteredCollection = new Backbone.Collection();
            this.initializeFilterView(options.appletConfig);

            this.view.listenTo(this.dateFilteredCollection, 'update', _.bind(this.onUpdateDateFilteredCollection, this));
        },
        onUpdateDateFilteredCollection: function() {
            this.filterView.doSearch();
        },
        initializeFilterView: function(appletConfig) {
            this.appletFilterInstanceId = appletConfig.instanceId;

            this.maximizedScreen = false;
            var maximizedApplet = ADK.Messaging.request('applet:maximized');
            if (maximizedApplet) {
                this.maximizedScreen = true;
                appletConfig.filterName = maximizedApplet.get('filterName');
                appletConfig.filterText = maximizedApplet.get('filterText');
                ADK.Messaging.reply("applet:maximized", function() {
                    return undefined;
                });
            }

            //Set applet's fullScreen option in session
            if (appletConfig.fullScreen) {
                ADK.SessionStorage.setAppletStorageModel(appletConfig.instanceId, 'fullScreen', true);
            } else {
                ADK.SessionStorage.setAppletStorageModel(appletConfig.instanceId, 'fullScreen', false);
            }

            // Used for template
            this.model = new Backbone.Model({
                instanceId: appletConfig.instanceId,
                workspaceId: ADK.Messaging.request('get:current:screen').config.id
            });

            this.appletOptions = {
                filterFields: ['name', 'sig', 'standardizedVaStatus', 'drugClassName']
            };

            //Create Filter and Filter Button View
            if (this.appletOptions.filterFields) {
                var filterFields, filterDateRangeField, dateRangeEnabled = false;
                if (this.appletOptions.filterFields) {
                    filterFields = this.appletOptions.filterFields;
                }

                var filterOptions = {
                    id: appletConfig.instanceId,
                    workspaceId: ADK.Messaging.request('get:current:screen').config.id,
                    maximizedScreen: this.maximizedScreen,
                    fullScreen: appletConfig.fullScreen,
                    collection: this.dateFilteredCollection,
                    destinationCollection: this.textFilteredCollection,
                    filterFields: filterFields,
                    filterName: appletConfig.filterName,
                    filterText: appletConfig.filterText,
                    model: this.model
                };

                this.filterView = CustomFilter.doFilter(filterOptions);

                this.appletOptions = {
                    appletId : appletConfig.id,
                    instanceId : appletConfig.instanceId
                };


            }
        }
    });
});