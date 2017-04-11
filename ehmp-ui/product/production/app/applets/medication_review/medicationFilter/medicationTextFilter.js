define([
    'underscore',
    'backbone',
    'marionette',
    'main/backgrid/customFilter',
    'api/SessionStorage'
], function(_, Backbone, Marionette, CustomFilter, SessionStorage) {
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
        onResetDateFilteredCollection: function() {
            this.textFilteredCollection.reset(this.dateFilteredCollection.models);
        },
        initializeFilterView: function(appletConfig) {
            this.appletFilterInstanceId = appletConfig.instanceId;

            this.maximizedScreen = false;
            var maximizedApplet = ADK.Messaging.request('applet:maximized');
            if (maximizedApplet && maximizedApplet.get('instanceId').indexOf(appletConfig.id) != -1) {
                this.maximizedScreen = true;
                appletConfig.filterName = maximizedApplet.get('filterName');
                ADK.Messaging.reply("applet:maximized", function() {
                    return undefined;
                });
            }

            this.expandedAppletId = this.view.options.appletConfig.instanceId;
            if (appletConfig.fullScreen) {
                this.parentWorkspace = ADK.Messaging.request('get:current:workspace');
                var expandedModel = SessionStorage.get.sessionModel('expandedAppletId');
                if (!_.isUndefined(expandedModel) && !_.isUndefined(expandedModel.get('id'))) {
                    this.expandedAppletId = expandedModel.get('id');
                    SessionStorage.set.sessionModel('expandedAppletId', new Backbone.Model({
                        'id': undefined
                    }));
                }
            }

            //Set applet's fullScreen option in session
            if (appletConfig.fullScreen) {
                SessionStorage.setAppletStorageModel(appletConfig.instanceId, 'fullScreen', true);
            } else {
                SessionStorage.setAppletStorageModel(appletConfig.instanceId, 'fullScreen', false);
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
                    model: this.model
                };

                this.filterView = CustomFilter.doFilter(filterOptions);

                this.appletOptions.appletId = appletConfig.id;
                this.appletOptions.instanceId = appletConfig.instanceId;
            }
        }
    });
});