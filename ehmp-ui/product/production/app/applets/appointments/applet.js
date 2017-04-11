define([
    'backbone',
    'underscore',
    'app/applets/appointments/util',
    'app/applets/appointments/modal/modalView',
    'app/applets/appointments/toolBar/toolBarView',
], function(Backbone, _, Util, ModalView, ToolBarView) {
    'use strict';
    //Data Grid Columns
    var dateTimeCol = {
        name: 'dateTimeFormatted',
        label: 'Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-date'
        }),
        sortValue: function(model) {
            return model.get('dateTime');
        },
        hoverTip: 'visits_date'
    };
    var dateTimeColFull = {
        name: 'dateTimeFormatted',
        flexWidth: 'flex-width-date-time',
        label: 'Date',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-date-time'
        }),
        sortValue: function(model) {
            return model.get('dateTime');
        },
        hoverTip: 'visits_date'
    };
    var categoryCol = {
        name: 'formattedDescription',
        label: 'Description',
        flexWidth: 'flex-width-2_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2_5'
        }),
        hoverTip: 'visits_description'
    };
    var locationCol = {
        name: 'locationName',
        label: 'Location',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        }),
        hoverTip: 'visits_location'
    };
    var statusCol = {
        name: 'status',
        label: 'Status',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        }),
        hoverTip: 'visits_status'
    };
    var facilityCol = {
        name: 'facilityMoniker',
        label: 'Facility',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1_5'
        }),
        hoverTip: 'visits_facility'
    };

    var typeCol = {
        name: 'formattedTypeName',
        label: 'Type',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        }),
        hoverTip: 'visits_type'
    };

    var reasonCol = {
        name: 'reasonName',
        label: 'Reason',
        flexWidth: 'flex-width-3',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-3'
        }),
        hoverTip: 'visits_reason'
    };

    var summaryColumns = [dateTimeCol, categoryCol, locationCol, statusCol, facilityCol];
    var fullScreenColumns = [dateTimeColFull, categoryCol, locationCol, statusCol, typeCol, reasonCol, facilityCol];
    var FILTER = 'and(ne(categoryName,"Admission"),ne(locationOos,true)';
    var PARTIAL_FILTER = FILTER + ',';
    var COMPLETE_FILTER = FILTER + ')';

    //Collection fetchOptions
    var fetchOptions = {
        pageable: true,
        resourceTitle: 'patient-record-appointment',
        cache: true,
        criteria: {
            filter: COMPLETE_FILTER
        },
        viewModel: {
            parse: function(response) {
                response = Util.getDateTimeFormatted(response);
                response = Util.getFormattedDisplayTypeName(response);
                response = Util.getFormattedDescription(response);
                response = Util.getFormattedStatus(response);
                if (response.reason && !response.reasonName) {
                    response.reasonName = response.reason;
                }
                return response;
            }
        }
    };

    var SiteMenuItem = Backbone.Model.extend({
        defaults: {
            'site': 'ALL',
            'siteLabel': 'All VA + DOD',
            'show': true,
            'active': true
        }
    });

    var SiteMenuItems = Backbone.Collection.extend({
        model: SiteMenuItem
    });

    var siteMenuItems = new SiteMenuItems([{
        'site': 'LOCAL',
        'siteLabel': 'Local VA',
        'show': true,
        'active': true
    }, {
        'site': 'ALLVA',
        'siteLabel': 'All VA',
        'show': true,
        'active': false
    }, {
        'site': 'ALL',
        'siteLabel': 'All VA + DOD',
        'show': true,
        'active': false
    }]);

    var GridApplet = ADK.Applets.BaseGridApplet;

    var AppletLayoutView = GridApplet.extend({
        siteHash: null,
        initialize: function(options) {
            var self = this;
            this.siteHash = ADK.UserService.getUserSession().get('site');
            var uidFilter = ':' + this.siteHash + ':';
            var instanceId = options.appletConfig.instanceId;

            this._super = GridApplet.prototype;

            var dataGridOptions = {};

            var toolBarView = new ToolBarView({
                filterValue: uidFilter,
                siteMenuItems: siteMenuItems,
                instanceId: instanceId
            });

            dataGridOptions.filterFields = _.pluck(fullScreenColumns, 'name');
            if (this.columnsViewType === 'expanded') {
                dataGridOptions.columns = fullScreenColumns;
                this.isFullscreen = true;
                dataGridOptions.toolbarView = toolBarView;
            } else if (this.columnsViewType === 'summary') {
                dataGridOptions.columns = summaryColumns;
                this.isFullscreen = false;
            } else {
                dataGridOptions.summaryColumns = summaryColumns;
                dataGridOptions.fullScreenColumns = fullScreenColumns;
                this.isFullscreen = false;
            }

            dataGridOptions.enableModal = true;
            dataGridOptions.filterEnabled = true;
            dataGridOptions.filterDateRangeEnabled = true;
            dataGridOptions.filterDateRangeField = {
                name: 'dateTime',
                label: 'Date',
                format: 'YYYYMMDD'
            };

            this.listenTo(ADK.Messaging, 'globalDate:selected', function() {
                self.dataGridOptions.collection.fetchOptions.criteria.filter = PARTIAL_FILTER + self.buildJdsDateFilter('dateTime') + ')';
                self.dataGridOptions.collection.fetchOptions.onSuccess = function(collection) {
                    if (self.isFullscreen) {
                        toolBarView.filterResultsDefault(collection);
                    }
                };

                var collection = self.dataGridOptions.collection;
                ADK.PatientRecordService.fetchCollection(collection.fetchOptions, collection);
            });

            //Row click event handler
            dataGridOptions.onClickRow = _.bind(function(model, event) {
                this.getDetailsModal(model, event);
            }, this);

            fetchOptions.criteria = {
                filter: PARTIAL_FILTER + self.buildJdsDateFilter('dateTime') + ')',
                customFilter: COMPLETE_FILTER,
                pid: ''
            };

            fetchOptions.onSuccess = function(collection) {
                if (self.isFullscreen) {
                    var siteItem = siteMenuItems.findWhere({
                        'active': true
                    });
                    var siteFilter = (siteItem.get('site'));
                    toolBarView.collection = collection;
                    toolBarView.apptSite = siteFilter;
                    toolBarView.filterValue = uidFilter;
                    toolBarView.filterResults(toolBarView.apptSite, toolBarView.collection, toolBarView.filterValue);
                }
            };

            dataGridOptions.collection = ADK.PatientRecordService.createEmptyCollection(fetchOptions);

            dataGridOptions.collection.fetchOptions = fetchOptions;
            this.dataGridOptions = dataGridOptions;
            this._super.initialize.call(this, options);
            this.fetchData();
        },
        onBeforeDestroy: function() {
            fetchOptions.onSuccess = null;
            this.dataGridOptions.onClickRow = null;
        },
        getDetailsModal: function(model, event) {
            var view = new ModalView({
                model: model,
            });

            var modalOptions = {
                'title': Util.getModalTitle(model),
                'size': 'normal',
                'nextPreviousCollection': this.dataGridOptions.collection
            };

            var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions,
                callbackView: this,
            });
            modal.show();
        },
        DataGrid: ADK.Applets.BaseGridApplet.DataGrid.extend({
            DataGridRow: ADK.Applets.BaseGridApplet.DataGrid.DataGridRow.extend({
                serializeModel: function() {
                    var data = this.model.toJSON();
                    data = Util.getFacilityColor(data);

                    return data;
                }
            })
        })
    });

    var applet = {
        id: 'appointments',
        viewTypes: [{
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: 'summary'
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: AppletLayoutView.extend({
                columnsViewType: 'expanded'
            }),
            chromeEnabled: true
        }],
        defaultViewType: 'summary'
    };

    return applet;
});