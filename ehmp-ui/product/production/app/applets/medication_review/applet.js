define([
    'underscore',
    'backbone',
    'handlebars',
    'app/applets/medication_review/medicationFilter/medicationDateFilter',
    'app/applets/medication_review/medicationFilter/medicationTextFilter',
    'app/applets/medication_review/medicationsGroupedByType/superAccordionList/medTypeListView',
    'app/applets/medication_review/medicationsGroupedByType/superAccordionList/medTypeListCollection'
], function(_, Backbone, Handlebars, MedicationDateFilter, MedicationTextFilter, MedTypeListView, MedTypeListCollection) {
    'use strict';

    var HelpButtonView = Backbone.Marionette.ItemView.extend({
        events: {
            'click button': function(event) {
                // ADK.Messaging.getChannel('medication_review').trigger('help');
            }
        },
        template: Handlebars.compile('<button id="help" type="button" class="applet-help-button btn btn-xs btn-link"><i class="applet-help-button fa fa-question fa-lg"></i></button>'),
        tagName: 'span'
    });

    var medsReviewRootView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile('<div id="grid-filter-{{instanceId}}" class="panel-body all-padding-no collapse auto-height"><div class="grid-filter"></div></div><div class="meds-review-main-region hidden"></div><div class="loading-region"></div>'),
        className: 'grid-applet-panel',
        destroyImmediate: true,
        regions: {
            main: '.meds-review-main-region',
            appletToolbar: '.grid-toolbar',
            appletFilter: '.grid-filter',
            loading: '.loading-region'
        },
        initialize: function() {
            this.appletInstanceId = this.options.appletConfig.instanceId;
            this.initializeUngroupedMedsCollection();
            this.initializeDateFilter();
            this.initializeTextFilter();
            this.filterView = this.textFilter.filterView;
            this.appletConfig = this.options.appletConfig;
            this.appletOptions = this.textFilter.appletOptions;
            this.appletFilterInstanceId = this.textFilter.appletFilterInstanceId;

            this.expandedAppletId = this.options.appletConfig.instanceId;
            if (this.options.appletConfig.fullScreen) {
                this.parentWorkspace = ADK.Messaging.request('get:current:workspace');
                this.expandedAppletId = this.textFilter.expandedAppletId;
            }

            this.maximizedScreen = this.textFilter.maximizedScreen;
            this.model = this.textFilter.model;

            this.initializeMedTypeListViewAndCollection(this.appletInstanceId);
        },
        ungroupedMedsEvents: {
            'read:success': 'onInitialUngroupedFetch',
            'read:error': function(collection, resp) {
                var errorView = ADK.Views.Error.create({
                    model: new Backbone.Model(resp)
                });
                this.main.show(errorView);
            }
        },
        initializeUngroupedMedsCollection: function() {
            this.ungroupedMeds = new ADK.UIResources.Fetch.MedicationReview.Collection();
            this.bindEntityEvents(this.ungroupedMeds, this.ungroupedMedsEvents);
        },
        initializeDateFilter: function() {
            this.dateFilter = new MedicationDateFilter({
                view: this,
                collection: this.ungroupedMeds,
                dateModel: ADK.SessionStorage.getModel('globalDate')
            });
            this.listenTo(ADK.Messaging, 'globalDate:selected', _.bind(this.dateFilter.onDateChange, this.dateFilter));
        },
        initializeTextFilter: function() {
            this.textFilter = new MedicationTextFilter({
                view: this,
                collection: this.dateFilter.filteredCollection,
                appletConfig: this.options.appletConfig
            });
            this.textFilteredCollection = this.textFilter.textFilteredCollection;
            this.listenTo(this.textFilteredCollection, 'update', this.onTextFilteredCollectionUpdate);
        },
        initializeMedTypeListViewAndCollection: function(instanceId) {
            var medicationChannel = ADK.Messaging.getChannel("medication_review");
            this.groupedByTypeCollection = new MedTypeListCollection(this.textFilteredCollection, {
                channel: medicationChannel,
                parse: true,
                listOrder: this.listOrder()
            });
            this.medTypeListView = new MedTypeListView({
                collection: this.groupedByTypeCollection,
                appletInstanceId: instanceId
            });
        },
        eventMapper: {
            refresh: 'onRefresh'
        },
        onBeforeRender: function() {
            this.performInitialUngroupedFetch();
        },
        onDestroy: function() {
            this.loadingView.destroy();
            this.unbindEntityEvents(this.ungroupedMeds, this.ungroupedMedsEvents);
            this.ungroupedMeds.cleanUp();
        },
        onRender: function() {
            this.loadingView = ADK.Views.Loading.create();
            this.showLoading();
            if (this.filterView) {
                $(this.filterView.el).css({
                    marginLeft: '0px',
                    marginTop: '0px',
                    marginBottom: '6px'
                });

                this.appletFilter.show(this.filterView);

                var self = this;
                this.filterView.$el.find('input[type=search]').on('change', function() {
                    ADK.SessionStorage.setAppletStorageModel(self.expandedAppletId, 'filterText', $(this).val(), true);
                });
                this.filterView.$el.find('a[data-backgrid-action=clear]').on('click', function() {
                    ADK.SessionStorage.setAppletStorageModel(self.expandedAppletId, 'filterText', $(this).val(), true);
                });
            }
        },
        showFilterView: function() {
            var appletConfig = this.appletConfig;
            var expandedAppletId = this.appletConfig.instanceId;
            if (appletConfig.fullScreen) {
                this.parentWorkspace = ADK.Messaging.request('get:current:workspace');
                var expandedModel = ADK.SessionStorage.get.sessionModel('expandedAppletId');
                if (!_.isUndefined(expandedModel) && !_.isUndefined(expandedModel.get('id'))) {
                    expandedAppletId = expandedModel.get('id');
                    ADK.SessionStorage.set.sessionModel('expandedAppletId', new Backbone.Model({
                        'id': undefined
                    }));
                }
            }

            var filterText = ADK.SessionStorage.getAppletStorageModel(expandedAppletId, 'filterText', true, this.parentWorkspace);
            var filterTerms = _.get(this, 'filterView.userDefinedFilters');
            if (!_.isEmpty(filterText) || (!_.isEmpty(filterTerms) && filterTerms.length > 0)) {
                this.$el.find('#grid-filter-' + this.appletConfig.instanceId).toggleClass('collapse in');
                this.$el.find('input[name=\'q-' + this.appletConfig.instanceId + '\']').val(filterText);
                this.filterView.showClearButtonMaybe();
            } else if (this.appletOptions.filterDateRangeField && this.appletConfig.fullScreen) {
                this.$el.find('#grid-filter-' + this.appletConfig.instanceId).toggleClass('collapse in');
            }
        },
        onShow: function() {
            this.showFilterView();
        },
        onTextFilteredCollectionUpdate: function() {
            this.groupedByTypeCollection.set(this.textFilteredCollection, {
                parse: true,
                listOrder: this.listOrder()
            });

            this.medTypeListView.$el.find('.accordion-toggle:first-of-type > .collapse').collapse('show'); // necessary on gdp selection to expand first accordion
        },
        performInitialUngroupedFetch: function() {
            this.textFilteredCollection.once('reset', this.onInitialUngroupedFetch, this);
            var self = this;
            this.ungroupedMeds.performFetch({
                onSuccess: function(collection, resp) {
                    collection.trigger('read:success');
                },
                onError: function(collection, resp) {
                    collection.trigger('read:error');
                }
            });
        },
        onInitialUngroupedFetch: function() {
            if (this.main.currentView !== this.medTypeListView) {
                this.main.show(this.medTypeListView);
                this.hideLoading();
            }

            this.medTypeListView.$el.find('.accordion-toggle:first-of-type > .collapse').collapse('show'); // necessary on initial display to get the correct width for the graph header
        },
        showLoading: function() {
            this.main.$el.addClass('hidden');
            this.loading.show(this.loadingView);
            // need give the appearance of the view resetting, since the main
            // collection view is NOT re-rendered on refresh
            this.main.$el.find('.accordion-toggle:first-of-type > .collapse').collapse('show');
            this.main.$el.find('.accordion-toggle:not(:first-of-type) > .collapse.in').collapse('hide');
        },
        hideLoading: function() {
            this.main.$el.removeClass('hidden');
            this.loading.empty({ preventDestroy: true });
        },
        onRefresh: function() {
            this.showLoading();
            this.ungroupedMeds.refresh({
                expireCache: true,
                onSuccess: _.bind(this.hideLoading, this),
                onError: _.bind(this.hideLoading, this)
            });
        },
        listOrder: function() {
            var patientStatusClass = ADK.PatientRecordService.getCurrentPatient().patientStatusClass().toLowerCase();
            var finalValue = (patientStatusClass === 'outpatient') ? 'inpatient' : 'outpatient';
            var order = {
                type: [patientStatusClass, 'clinical', 'supply', finalValue],
                required: [{
                    requiredType: 'outpatient',
                    displayType: 'Outpatient and Non-VA'
                }, {
                    requiredType: 'clinical',
                    displayType: 'Clinic Order'
                }, {
                    requiredType: 'inpatient',
                    displayType: 'Inpatient'
                }]
            };
            return order;
        }
    });

    var medsReviewAppletConfig = {
        id: 'medication_review',
        viewTypes: [{
            type: 'expanded',
            view: medsReviewRootView,
            chromeEnabled: true
        }],
        defaultViewType: 'gist'
    };

    return medsReviewAppletConfig;
});
