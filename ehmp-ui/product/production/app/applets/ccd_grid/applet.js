define([
    'backbone',
    'marionette',
    'app/applets/ccd_grid/modal/modalView',
    'app/applets/ccd_grid/modal/modalHeaderView',
], function(Backbone, Marionette, ModalView, ModalHeader) {

    'use strict';
    //Data Grid Columns
    var dateTimeCol = {
        name: 'referenceDateTimeDisplay',
        label: 'Date',
        flexWidth: 'flex-width-date-time',
        cell: Backgrid.StringCell.extend ({
            className: 'string-cell flex-width-date-time'
        }),
        sortValue: function(model, sortKey) {
            return model.get("referenceDateTime");
        },
        hoverTip: 'chs_date'
    };
    var dateCol = {
        name: 'referenceDateDisplay',
        label: 'Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend ({
            className: 'string-cell flex-width-date'
        }),
        sortValue: function(model, sortKey) {
            return model.get("referenceDateTime");
        },
        hoverTip: 'chs_date'
    };
    var authorCol = {
        name: 'authorDisplayName',
        label: 'Authoring Institution',
        cell: 'string',
        hoverTip: 'chs_authoringinstitution'
    };
    var descCol = {
        name: 'summary',
        label: 'Description',
        cell: 'string',
        hoverTip: 'chs_description'
    };
    var summaryColumns = [dateCol, authorCol];

    var fullScreenColumns = [dateTimeCol, descCol, authorCol];

    var AppletID = 'ccd_grid',
        channel = ADK.Messaging.getChannel(AppletID);

    var viewParseModel = {
        parse: function(response) {
            if (response.name) {
                response.localTitle = response.name;
            }
            if (response.creationTime) {
                response.referenceDateTime = response.creationTime;
            } else if (response.dateTime) {
                response.referenceDateTime = response.dateTime;
            }
            response.referenceDateDisplay = ADK.utils.formatDate(response.referenceDateTime);
            if (response.referenceDateDisplay === '') {
                response.referenceDateDisplay = 'N/A';
            }

            response.referenceDateTimeDisplay = ADK.utils.formatDate(response.referenceDateTime, 'MM/DD/YYYY - HH:mm');
            if (response.referenceDateTimeDisplay === '') {
                response.referenceDateTimeDisplay = 'N/A';
            }

            if (response.authorList) {
                if (response.authorList.length > 0) {
                    if (response.authorList[0].institution) {
                        response.authorDisplayName = response.authorList[0].institution;
                    }
                } else {
                    response.authorDisplayName = "N/A";
                }
            }
            response.facilityName = "VLER";
            return response;
        }
    };

    //Collection fetchOptions
    var fetchOptions = {
        resourceTitle: 'patient-record-vlerdocument',
        pageable: true,
        viewModel: viewParseModel,
        cache: true,
        criteria: {
            callType: 'vler_list'
        }
    };

    var _super;
    var GridApplet = ADK.Applets.BaseGridApplet;

    var AppletLayoutView = GridApplet.extend({
        initialize: function(options) {
            _super = GridApplet.prototype;
            var dataGridOptions = {};
            dataGridOptions.filterEnabled = true; //Defaults to true
            dataGridOptions.filterFields = _.pluck(fullScreenColumns, 'name'); //Defaults to all columns
            if (this.columnsViewType === "summary") {
                dataGridOptions.columns = summaryColumns;
            } else if (this.columnsViewType === "expanded") {
                dataGridOptions.columns = fullScreenColumns;
            } else {
                dataGridOptions.summaryColumns = summaryColumns;
                dataGridOptions.fullScreenColumns = fullScreenColumns;
            }
            dataGridOptions.enableModal = true;

            var self = this;

            dataGridOptions.onClickRow = function(model, event, gridView) {
                event.preventDefault();
                var view = new ModalView({
                    model: model,
                    target: event.currentTarget,
                    collection: dataGridOptions.collection,
                    initCount: 0
                });

                var modalOptions = {
                    'size': 'xlarge',
                    'headerView': ModalHeader.extend({
                        model: model,
                        theView: view,
                        initCount: 0
                    })
                };

                var modal = new ADK.UI.Modal({
                    view: view,
                    options: modalOptions
                });
                modal.show();
            };

            dataGridOptions.collection = ADK.PatientRecordService.createEmptyCollection(fetchOptions);

            dataGridOptions.collection.fetchOptions = fetchOptions;
            this.dataGridOptions = dataGridOptions;
            _super.initialize.apply(this, arguments);

            this.fetchData();

            //Memory leak--fix added in onDestroy
            channel.reply('gridCollection', function() {
                return self.gridCollection;
            });


        },
        onBeforeDestroy: function() {
            channel.stopReplying('gridCollection');
            this.dataGridOptions.onClickRow = null;
        },
        onRender: function() {
            _super.onRender.apply(this, arguments);

        }
    });

    var applet = {
        id: AppletID,
        viewTypes: [{
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: AppletLayoutView.extend({
                columnsViewType: "expanded"
            }),
            chromeEnabled: true
        }],
        defaultViewType: 'summary'
    };

    // expose detail view through messaging
    channel.reply('detailView', function(params) {

        var fetchOptions = {
            criteria: {
                "uid": params.uid
            },
            patient: ADK.PatientRecordService.getCurrentPatient(),
            resourceTitle: 'patient-record-vlerdocument',
            viewModel: viewParseModel
        };


        var data = ADK.PatientRecordService.createEmptyCollection(fetchOptions);
        var detailModel = new Backbone.Model();
        return {
            view: ModalView.extend({
                collection: data,
                collectionEvents: {
                    'sync': function(collection, resp) {
                        var model = collection.first();
                        if(model) this.model.set(model.toJSON());
                    }
                },
                onBeforeShow: function() {
                    ADK.PatientRecordService.fetchCollection(fetchOptions, this.collection);
                },
                model: detailModel
            })
        };

    });

    return applet;
});
