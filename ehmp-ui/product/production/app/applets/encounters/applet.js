define([
    'handlebars',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'app/applets/encounters/GistView',
    'app/applets/encounters/appUtil',
    'app/applets/encounters/writeback/encounterForm',
    'app/applets/encounters/writeback/showEncounter',
    'app/applets/encounters/tray/trayView'
], function(Handlebars, _, Backbone, Marionette, moment, GistView, util, WriteBackForm, showEncounter) {
    'use strict';
    /* global ADK */

    var GridApplet = ADK.Applets.BaseGridApplet;
    var AppletLayoutView = GridApplet.extend({
        initialize: function(options) {
            this.collection = new ADK.UIResources.Fetch.Encounters.Aggregate();

            this.dataGridOptions = {
                enableModal: true,
                filterEnabled: true,
                shadowCollection: new Backbone.Collection(),
                collection: this.collection,
                refresh: _.bind(this._refresh, this),
                SummaryView: GistView,
                appletConfig: options.appletConfig
            };
            this.appletConfig = options.appletConfig;

            this._setListeners();

            GridApplet.prototype.initialize.apply(this, arguments);
        },
        onBeforeShow: function() {
            this.queryCollection(this, this.collection);
        },
        collectionEvents: {
            'error': 'onFetchError',
            'customfilter': 'onFilterCollection',
            'clear_customfilter': 'onClearFilter'
        },
        _refresh: function() {
            this.loading();
            this.queryCollection(this, this.dataGridOptions.collection);
        },
        _setListeners: function() {
            var messaging = ADK.Messaging;
            this.listenTo(messaging, 'globalDate:selected', this._refresh);
            this.listenTo(messaging.getChannel('enc_detail_v_a'), 'detailView', this.showVisitDetail);
            this.listenTo(messaging.getChannel('enc_detail_p'), 'detailView', this.showDocumentDetail);
        },
        queryCollection: function(obj, existingCollection) {
            existingCollection.reset(null, {
                silent: true
            });
            var timeRange;
            var toDate;

            var GDate = ADK.SessionStorage.getModel('globalDate');
            if (GDate.get('selectedId') === "allRangeGlobal") { // add 6 month ahead if selected All
                toDate = moment().add(6, 'M').format('MM/DD/YYYY');
                timeRange = obj.buildJdsDateFilter('dateTime', {
                    isOverrideGlobalDate: true,
                    fromDate: GDate.get('fromDate'),
                    toDate: toDate
                });
            } else {
                timeRange = obj.buildJdsDateFilter('dateTime');
            }

            existingCollection.fetchCollection(timeRange);
        },
        onFilterCollection: function(search) {
            if (this.search === search) return;
            var filter = function(item) {
                return !!item.get('collection').find(function(model) {
                    return search.test(model.get(util.FILTER_FIELD));
                });
            };
            this.dataGridOptions.filter = filter;
            var childView = this.dataGridView;
            if (childView) {
                childView.filter = this.dataGridOptions.filter;
                childView.render();
            }
            this.search = search;
        },
        onClearFilter: function(search) {
            if (search) {
                this.onFilterCollection(search);
            }
        },
        onFetchError: function(err, resp) {
            this.dataGridOptions.collection.trigger('error', err, resp);
        },
        showVisitDetail: function(params) {
            var recent = params.model.get('collection').at(0) || new Backbone.Model();
            if (!params.uid) params.uid = recent.uid;

            if (!_.isUndefined(params.model)) {
                var isCptDomain = recent.get('isCptDomain');
                if (isCptDomain) {
                    params.model.set("recent_model", util.getCPTprocedureDetailViewModel(this));
                }
            }
            util.showDetailView(params, "visitDetail");
        },
        showDocumentDetail: function(params) {
            util.showDetailView(params, "documents");
        },
        onBeforeDestroy: function() {
            delete this.dataGridOptions.refresh;
            delete this.dataGridOptions.shadowCollection;
            delete this.dataGridOptions.collection;
        }
    });

    var encounterChannel = ADK.Messaging.getChannel('encounterFormRequestChannel');
    encounterChannel.comply('openEncounterForm', showEncounter);

    return {
        id: "encounters",
        viewTypes: [{
            type: 'gist',
            view: AppletLayoutView,
            chromeEnabled: true
        }, {
            type: 'writeback',
            view: WriteBackForm,
            chromeEnabled: false
        }],
        defaultViewType: 'gist'
    };
});