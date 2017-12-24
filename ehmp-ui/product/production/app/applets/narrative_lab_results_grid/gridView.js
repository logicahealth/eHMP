/* global ADK */

define([
    "backbone",
    "marionette",
    'underscore',
    "handlebars",
    "app/applets/orders/tray/labs/trayUtils"
], function (Backbone, Marionette, _, Handlebars, LabOrderTrayUtils) {
    "use strict";

    var LabsView = ADK.AppletViews.GridView.extend({
        channel: ADK.Messaging.getChannel('narrative_lab_results'),
        channelEvents: {
            gridCollection: 'getGridCollection'
        },
        appletOptions: {
            filterFields: ['observed', 'narrativeDescription', 'author', 'facilityMoniker', 'displayTypeName'],
            filterDateRangeField: {
                name: "observed",
                label: "Date",
                format: "YYYYMMDD"
            },
            tileOptions: {
                quickMenu: {
                    enabled: true,
                    buttons: [{
                        type: 'infobutton'
                    }, {
                        type: 'detailsviewbutton'
                    }]
                },
                primaryAction: {
                    enabled: true,
                    onClick: function(params) {
                        ADK.Messaging.getChannel('narrative_lab_results').trigger('detailView', params);
                    }
                }
            }
        },
        _columns: {
            date: {
                name: "observed",
                label: "Date",
                template: Handlebars.compile('{{formatDate observed "MM/DD/YYYY - HH:mm"}}'),
                cell: "handlebars"
            },
            facility: {
                name: "facilityMoniker",
                label: "Facility",
                template: Handlebars.compile('{{facilityMoniker}}'),
                cell: "handlebars"
            },
            description: {
                name: "narrativeDescription",
                label: "Description",
                template: Handlebars.compile('{{narrativeDescription}}'),
                cell: "handlebars"
            },
            author: {
                name: "author",
                label: "Author/Verifier",
                template: Handlebars.compile('None'),
                cell: "handlebars"
            },
            type: {
                name: "displayTypeName",
                label: "Type",
                template: Handlebars.compile('{{displayTypeName}}'),
                cell: "handlebars"
            }
        },
        summary: ['date', 'description', 'type', 'facility'],
        fullScreen: ['date', 'description', 'type', 'author', 'facility'],
        initialize: function (options) {
            Backbone.Marionette.bindEntityEvents(this, this.channel, this.channelEvents);

            var filterFields = _.get(this, 'appletOptions.filterFields');
            var instanceId = _.get(this, 'options.appletConfig.instanceId');
            var rowSelector = '#data-grid-' + instanceId + " tbody tr";
            var isFullscreen = _.get(options, 'appletConfig.fullScreen', false);

            filterFields.push(this.getLoincValues);

            _.set(this, 'appletOptions.formattedFilterFields.observed', this._formatObserved);
            _.set(this, 'appletOptions.tblRowSelector', rowSelector);
            _.set(this, 'isFullscreen', isFullscreen);

            if (ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista() && ADK.UserService.hasPermissions('add-lab-order')) {
                _.set(this.appletOptions, 'onClickAdd', LabOrderTrayUtils.launchLabForm);
            }

            if (this.columnsViewType === "expanded") {
                _.set(this, 'appletOptions.columns', this.getFullScreenColumns());
            } else if (this.columnsViewType === "summary") {
                _.set(this, 'appletOptions.columns', this.getSummaryColumns());
            } else {
                _.set(this, 'appletOptions.summaryColumns', this.getSummaryColumns());
                _.set(this, 'appletOptions.fullScreenColumns', this.getFullScreenColumns());
            }

            this.listenTo(ADK.Messaging, 'globalDate:selected', this.refresh);

            this.collection = this.appletOptions.collection = new ADK.UIResources.Fetch.NarrativeLabs.Collection([], {
                isClientInfinite: true
            });
            this._fetch();

            LabsView.__super__.initialize.apply(this, arguments);
        },
        refresh: function refresh(date) {
            if (date instanceof Backbone.Model) {
                var options = {
                    toDate: date.get('toDate'),
                    fromDate: date.get('fromDate')
                };
                this.date = this.buildJdsDateFilter('observed', options);
            } else if (!_.isString(date) && this.date === undefined) {
                this.date = this.buildJdsDateFilter('observed');
            } else if (_.isString(date)) {
                this.date = date;
            }

            var resourceTitle = _.get(this.collection, 'fetchOptions.resourceTitle');
            this.collection.fullCollection.reset();
            this.loading();
            this.setAppletView();
            ADK.ResourceService.clearCacheByResourceTitle(resourceTitle);
            this._fetch(this.date);
        },
        getFullScreenColumns: function getFullScreenColumns() {
            return this._getColumns(this.fullScreen);
        },
        getSummaryColumns: function getSummaryColumns() {
            return this._getColumns(this.summary);
        },
        getGridCollection: function getGridCollection() {
            return this.gridCollection;
        },
        onBeforeDestroy: function onBeforeDestroy() {
            Backbone.Marionette.unbindEntityEvents(this, this.channel, this.channelEvents);
        },
        getLoincValues: function (json) {
            if (json.codes === undefined) return '';
            var codesWithLoinc = _.filter(json.codes, function (item) {
                return item.system === 'http://loinc.org';
            });
            return _.pluck(codesWithLoinc, 'code').join(' ');
        },
        _fetch: function fetch(date) {
            date = date || this.buildJdsDateFilter('observed');
            var filter = _.get(this.collection, 'filter');
            this.collection.fetchCollection({
                criteria: {
                    filter: filter + ',' + date
                }
            });
        },
        dateRangeRefresh: function dateRangeRefresh(filterParameter, options) {
            var date = this.buildJdsDateFilter(filterParameter, options);
            this.refresh(date);
        },
        _getColumns: function getColumns(columnList) {
            return _.map(columnList, function mapColumns(key) {
                return this._columns[key];
            }, this);
        },
        _formatObserved: function formatObserved(model, key) {
            var val = model.get(key);
            val = val.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, '$2/$3/$1 $4:$5');
            return val;
        }
    });

    return LabsView;
});
