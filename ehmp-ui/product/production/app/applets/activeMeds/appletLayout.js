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
                    response.name = name.concat(sig);
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

    var filterFields = _.pluck(summaryConfiguration.summaryColumns, 'name');
    filterFields.push('drugClassName');

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        initialize: function(options) {
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var self = this,
                patientType = ADK.PatientRecordService.getCurrentPatient().attributes.patientStatusClass,
                viewType = 'summary';

            if (options.appletConfig.viewType !== undefined) {
                viewType = options.appletConfig.viewType;
            }

            CollectionHandler.initCollections();
            this.appletOptions = {
                filterEnabled: true, // removed for demo purposes due to it not working well with the timeline
                summaryColumns: summaryConfiguration.summaryColumns,
                appletConfiguration: summaryConfiguration,
                enableModal: true,
                onClickRow: function(model, event) {
                    var uid = model.get('uid'),
                        currentPatient = ADK.PatientRecordService.getCurrentPatient();
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

            this.appletOptions.collection.on('sync', function(collection) {
                self.shadowCollection = collection.clone();
            });


            this.listenTo(this.appletOptions.collection, 'customfilter', this.onCustomFilter);
            this.listenTo(this.appletOptions.collection, 'clear_customfilter', this.onClearCustomFilter);

            this.dataGridOptions = this.appletOptions;
            this.dataGridOptions.tblRowSelector = '#data-grid-' + this.options.appletConfig.instanceId + ' tbody tr';
            this._super.initialize.apply(this, arguments);
        },
        onCustomFilter: function(search) {
            var self = this;
            if (self.shadowCollection === undefined) {
                return;
            }

            var filtered = self.shadowCollection.filter(function(item) {
                var filterString = '';
                _.each(filterFields, function(field) {
                    if (field === 'drugClassName') {
                        var productLength = item.get('products') !== undefined ? item.get('products').length : 0;
                        for (var i = 0; i < productLength; i++) {
                            if (item.get('products')[i].drugClassName !== undefined) {
                                filterString = filterString + ' ' + item.get('products')[i].drugClassName;
                            }
                        }
                    } else {
                        filterString = filterString + ' ' + item.get(field);
                    }

                });
                if (search) {
                    return search.test(filterString);
                } else {
                    return true;
                }
            });
            var filteredCollection = new Backbone.Collection();
            filteredCollection.reset(filtered);
            this.appletOptions.collection.reset(filteredCollection.models);
        },
        onClearCustomFilter: function(search) {
            this.appletOptions.collection.reset(this.shadowCollection.models);
            if (search) {
                this.onCustomFilter(search);
            }
        },
        onRender: function() {
            this._super.onRender.apply(this, arguments);
        }
    });

    return AppletLayoutView;
});