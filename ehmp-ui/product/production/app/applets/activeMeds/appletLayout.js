define([
    "app/applets/activeMeds/medicationCollectionHandler"
], function(CollectionHandler) {
    "use strict";

    var summaryConfiguration = {
        fetchOptions: {
            resourceTitle: 'patient-record-med',
            cache: true,
            criteria: {
                filter: ''
            },
            pageable: false,
            viewModel: {
                parse: function(response) {
                    var name = response.name;
                    var sig = " " + response.sig;
                    var crsUtil = ADK.utils.crsUtil;
                    response.name = name.concat(sig);
                    response[crsUtil.crsAttributes.CRSDOMAIN] = crsUtil.domain.MEDICATION;
                    response.applet_id = 'activeMeds';
                    response.infobuttonContext ='MLREV';
                    return response;
                }
            }
        },
        summaryColumns: [{
            name: 'name',
            label: 'Medication',
            flexWidth: 'flex-width-3',
            cell: Backgrid.StringCell.extend ({
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
        }]
    };

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        initialize: function(options) {
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var patientType = ADK.PatientRecordService.getCurrentPatient().patientStatusClass(),
                viewType = 'summary';

            if (options.appletConfig.viewType !== undefined) {
                viewType = options.appletConfig.viewType;
            }

            this.appletOptions = {
                filterEnabled: true, // removed for demo purposes due to it not working well with the timeline
                filterFields: ['normalizedName', 'age', 'totalFillsRemaining', 'sig', 'drugClassName', 'facilityMoniker', 'vaStatus'],
                summaryColumns: summaryConfiguration.summaryColumns,
                appletConfiguration: summaryConfiguration,
                enableModal: true,
                onClickRow: function(model, event) {
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
                collection: CollectionHandler.fetchMedsCollection(summaryConfiguration.fetchOptions, patientType, viewType)

            };

            this.listenTo(this.appletOptions.collection, 'customfilter', this.onCustomFilter);
            this.listenTo(this.appletOptions.collection, 'clear_customfilter', this.onClearCustomFilter);

            this.dataGridOptions = this.appletOptions;
            this.dataGridOptions.tblRowSelector = '#data-grid-' + this.options.appletConfig.instanceId + ' tbody tr';

            this.dataGridOptions.toolbarOptions = {
                buttonTypes: ['infobutton', 'detailsviewbutton']
            };

            this._super.initialize.apply(this, arguments);
        },
        onCustomFilter: function(search) {
            var self = this;

            var filtered = _.filter(this.appletOptions.collection.originalModels,function(item) {
                var filterString = '';
                _.each(self.appletOptions.filterFields, function(field) {
                    if (field === 'drugClassName') {
                        var productLength = item.products !== undefined ? item.products.length : 0;
                        for (var i = 0; i < productLength; i++) {
                            if (item.products[i].drugClassName !== undefined) {
                                filterString = filterString + ' ' + item.products[i].drugClassName;
                            }
                        }
                    } else {
                        filterString = filterString + ' ' + item[field];
                    }

                });
                if (search) {
                    return search.test(filterString);
                } else {
                    return true;
                }
            });

            this.appletOptions.collection.reset(filtered);
        },
        onClearCustomFilter: function(search) {
            this.appletOptions.collection.reset(this.appletOptions.collection.originalModels);
            if (search) {
                this.onCustomFilter(search);
            }
        },
        onRender: function() {
            this._super.onRender.apply(this, arguments);
        },
        refresh: function() {
            ADK.ResourceService.clearCacheByResourceTitle('patient-record-med');
            this._super.refresh.apply(this, arguments);
        }
    });

    return AppletLayoutView;
});