define([
    'underscore',
    'backbone',
    'handlebars',
    'api/SessionStorage',
    'app/applets/medication_review/medicationsUngrouped/medicationOrderCollection',
    'app/applets/medication_review/medicationFilter/medicationDateFilter',
    'app/applets/medication_review/medicationFilter/medicationTextFilter',
    'app/applets/medication_review/medicationsGroupedByType/superAccordionList/medTypeListView',
    'app/applets/medication_review/medicationsGroupedByType/superAccordionList/medTypeListCollection'
], function(_, Backbone, Handlebars, SessionStorage, MedicationOrderCollection, MedicationDateFilter, MedicationTextFilter, MedTypeListView, MedTypeListCollection) {
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

    var LoadingView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<p class="loading"><i class="fa fa-spinner fa-spin"></i> Loading...</p>')
    });

    var medsReviewRootView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile('<div id="grid-filter-{{instanceId}}" class="panel-body collapse"><div class="grid-filter"></div></div><div class="meds-review-main-region"></div>'),
        className: 'grid-applet-panel',
        destroyImmediate: true,
        regions: {
            main: '.meds-review-main-region',
            appletToolbar: '.grid-toolbar',
            appletFilter: '.grid-filter'
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
            this.expandedAppletId = this.textFilter.expandedAppletId;
            this.maximizedScreen = this.textFilter.maximizedScreen;
            this.model = this.textFilter.model;

            this.initializeMedTypeListViewAndCollection(this.appletInstanceId);
        },
        initializeUngroupedMedsCollection: function() {
            this.ungroupedMeds = new MedicationOrderCollection();
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
        onRender: function() {
            this.main.show(new LoadingView());
            if (this.filterView) {
                $(this.filterView.el).css({
                    marginLeft: '0px',
                    marginTop: '0px',
                    marginBottom: '6px'
                });

                this.appletFilter.show(this.filterView);
                var queryInputSelector = 'input[name=\'q-' + this.appletInstanceId + '\']';

                var self = this;
                this.filterView.$el.find('input[type=search]').on('change', function() {
                    SessionStorage.setAppletStorageModel(self.appletInstanceId, 'filterText', $(this).val(), true);
                });
                this.filterView.$el.find('a[data-backgrid-action=clear]').on('click', function() {
                    SessionStorage.setAppletStorageModel(self.appletInstanceId, 'filterText', $(this).val(), true);
                });
            }
        },
        onTextFilteredCollectionUpdate: function() {
            this.groupedByTypeCollection.set(this.textFilteredCollection, {
                parse: true,
                listOrder: this.listOrder()
            });
        },
        performInitialUngroupedFetch: function() {
            this.textFilteredCollection.once('reset', this.onInitialUngroupedFetch, this);
            var self = this;
            this.ungroupedMeds.performFetch({
                onSuccess: _.bind(this.onInitialUngroupedFetch, this),
                onError: function(collection, resp) {
                    var errorView = ADK.Views.Error.create({
                        model: new Backbone.Model(resp)
                    });
                    self.main.show(errorView);
                }
            });
        },
        onInitialUngroupedFetch: function() {
            if (this.main.currentView !== this.medTypeListView) {
                this.main.show(this.medTypeListView);
            }
        },
        onRefresh: function() {
            this.ungroupedMeds.refresh({
                expireCache: true
            });
        },
        listOrder: function() {
            var patientStatusClass = ADK.PatientRecordService.getCurrentPatient().get('patientStatusClass').toLowerCase();
            var finalValue = (patientStatusClass === 'outpatient') ? 'inpatient' : 'outpatient';
            var order = {
                type: [patientStatusClass, 'clinical', 'supply', finalValue],
                required: [{
                    requiredType: 'inpatient',
                    displayType: "INPATIENT MEDS"
                }, {
                    requiredType: 'clinical',
                    displayType: "CLINIC ORDER MEDS"
                }, {
                    requiredType: 'outpatient',
                    displayType: "OUTPATIENT MEDS"
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
