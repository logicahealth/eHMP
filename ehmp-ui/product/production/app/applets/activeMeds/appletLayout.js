/* global ADK */
define([
    'underscore',
    'backgrid',
    'handlebars'
], function(_, Backgrid, Handlebars) {
    'use strict';

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({

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
                onClick: function(params, event) {
                    ADK.Messaging.getChannel('activeMeds').trigger('detailView', params);
                }
            }
        },

        appletOptions: {
            filterFields: ['normalizedName', 'lastAction', 'totalFillsRemaining', 'sig', 'drugClassName', 'facilityMoniker', 'vaStatus'],
            summaryColumns: [{
                name: 'normalizedName',
                label: 'Medication',
                flexWidth: 'flex-width-3',
                cell: Backgrid.HandlebarsCell.extend({
                    className: 'handlebars-cell flex-width-3'
                }),
                template: Handlebars.compile('<strong>{{normalizedName}}</strong><br>{{sig}}'),
                sortable: true
            }, {
                name: 'vaStatus',
                label: 'Status',
                cell: 'string',
                sortable: true
            }, {
                name: 'facilityMoniker',
                label: 'Facility',
                cell: 'string',
                sortable: true
            }],
            enableModal: true
        },
        initialize: function(options) {
            _.set(this.appletOptions, 'onRowClick', this._onRowClick);
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
        onCustomFilter: function(search) {
            var filters = this.appletOptions.filterFields;
            this.appletOptions.collection.customFilter(search, filters);
        },
        onClearCustomFilter: function(search) {
            var filters = this.appletOptions.filterFields;
            this.appletOptions.collection.clearFilter(search, filters);
        },
        refresh: function() {
            this.loading();
            this.collection.reset([], {silent: true});
            ADK.ResourceService.clearCacheByResourceTitle('patient-record-med');
            this._resource.fetchCollection();
        }
    });

    return AppletLayoutView;
});