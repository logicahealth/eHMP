/* global ADK */
define([
    "underscore",
    "backgrid"
], function (_, Backgrid) {
    "use strict";

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        appletOptions: {
            filterFields: ['normalizedName', 'lastAction', 'totalFillsRemaining', 'sig', 'drugClassName', 'facilityMoniker', 'vaStatus'],
            summaryColumns: [{
                name: 'normalizedName',
                label: 'Medication',
                flexWidth: 'flex-width-3',
                cell: Backgrid.StringCell.extend({
                    className: 'string-cell flex-width-3'
                }),
                sortable: true,
                hoverTip: 'medications_medication'
            }, {
                name: 'vaStatus',
                label: 'Status',
                cell: 'string',
                sortable: true,
                hoverTip: 'medications_status'
            }, {
                name: 'facilityMoniker',
                label: 'Facility',
                cell: 'string',
                sortable: true,
                hoverTip: 'medications_facility'
            }],
            enableModal: true
        },
        initialize: function (options) {
            _.set(this.appletOptions, 'onRowClick', this._onRowClick);
            _.set(this.appletOptions, 'refresh', this._refresh);
            this._resource = new ADK.UIResources.Fetch.ActiveMeds.ResourceCollection();
            this.collection = this.appletOptions.collection = new ADK.UIResources.Fetch.ActiveMeds.Pageable([], {
                mode: 'client',
                state: {
                    pageSize: 40
                },
                collection: this._resource
            });

            this.listenTo(this._resource, 'fetch:success', this._updateCollection);
            this._resource.fetchCollection();

            this.listenTo(this.appletOptions.collection, 'customfilter', this.onCustomFilter);
            this.listenTo(this.appletOptions.collection, 'clear_customfilter', this.onClearCustomFilter);

            this.dataGridOptions = this.appletOptions;
            this.dataGridOptions.tblRowSelector = '#data-grid-' + this.options.appletConfig.instanceId + ' tbody tr';

            this.dataGridOptions.toolbarOptions = {
                buttonTypes: ['infobutton', 'detailsviewbutton']
            };
            AppletLayoutView.__super__.initialize.apply(this, arguments);
        },
        _updateCollection: function updateCollection(collection, response) {
            this.collection.setClientInfinite(false);
            this.collection.add(collection.models);
            this.collection.setClientInfinite(true);
            this.collection.trigger("fetch:success", collection, response);
        },
        _onRowClick: function onRowClick(model) {
            var uid = model.get('uid');
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            ADK.Messaging.getChannel("activeMeds").trigger('detailView', {
                uid: uid,
                patient: {
                    icn: currentPatient.attributes.icn,
                    pid: currentPatient.attributes.pid
                }
            });
        },
        onCustomFilter: function (search) {
            var filters = this.appletOptions.filterFields;
            this.appletOptions.collection.customFilter(search, filters);
        },
        onClearCustomFilter: function (search) {
            var filters = this.appletOptions.filterFields;
            this.appletOptions.collection.clearFilter(search, filters);
        },
        refresh: function () {
            this.loading();
            this.collection.reset({silent: true});
            ADK.ResourceService.clearCacheByResourceTitle('patient-record-med');
            this._resource.fetchCollection();
        }
    });

    return AppletLayoutView;
});