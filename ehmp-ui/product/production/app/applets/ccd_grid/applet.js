define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/ccd_grid/modal/modalView',
    'app/applets/ccd_grid/modal/modalHeaderView',
    'app/applets/ccd_grid/util'
], function(Backbone, Marionette, _, ModalView, ModalHeader, Util) {

    'use strict';
    //Data Grid Columns
    var dateTimeCol = {
        name: 'referenceDateTimeDisplay',
        label: 'Date',
        flexWidth: 'flex-width-date-time',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-date-time'
        }),
        sortValue: function(model) {
            return model.get('ccdDateTime');
        },
        hoverTip: 'chs_date'
    };
    var dateCol = {
        name: 'referenceDateDisplay',
        label: 'Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-date'
        }),
        sortValue: function(model) {
            return model.get('ccdDateTime');
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

    var GridApplet = ADK.Applets.BaseGridApplet;

    var AppletLayoutView = GridApplet.extend({
        initialize: function(options) {
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var fetchOptionsConfig = { 
                criteria: {
                    callType: 'vler_list'
                }
            };
            var dataGridOptions = {};
            dataGridOptions.filterEnabled = true; //Defaults to true
            dataGridOptions.filterFields = _.pluck(fullScreenColumns, 'name'); //Defaults to all columns
            if (this.columnsViewType === 'summary') {
                dataGridOptions.columns = summaryColumns;
            } else if (this.columnsViewType === 'expanded') {
                dataGridOptions.columns = fullScreenColumns;
            } else {
                dataGridOptions.summaryColumns = summaryColumns;
                dataGridOptions.fullScreenColumns = fullScreenColumns;
            }
            dataGridOptions.enableModal = true;
            dataGridOptions.collection = new ADK.UIResources.Fetch.CommunityHealthSummaries.Collection();
            dataGridOptions.collection.fetchCollection(fetchOptionsConfig);

            dataGridOptions.onClickRow = function(model, event) {
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

            this.dataGridOptions = dataGridOptions;
            this._super.initialize.call(this, arguments);
        },
        onBeforeDestroy: function() {
            this.dataGridOptions.onClickRow = null;
        },
        DataGrid: ADK.Applets.BaseGridApplet.DataGrid.extend({
            DataGridRow: ADK.Applets.BaseGridApplet.DataGrid.DataGridRow.extend({
                serializeModel: function() {
                    if (!this.model) {
                        return {};
                    }
                    var modelJSON = _.cloneDeep(this.model.attributes);
                    modelJSON = Util.serializeObject(modelJSON);
                    return modelJSON;
                }
            })
        })
    });

    var applet = {
        id: AppletID,
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

    // expose detail view through messaging
    channel.reply('detailView', function(params) {

        var fetchOptionsConfig = {
            criteria: {
                'uid': params.uid
            },
            patient: ADK.PatientRecordService.getCurrentPatient()
        };

        var data = new ADK.UIResources.Fetch.CommunityHealthSummaries.Collection();
        return {
            view: ModalView.extend({
                collection: data,
                collectionEvents: {
                    'sync': function(collection, resp) {
                        var model = collection.first();
                        if (model) this.model.set(model.toJSON());
                    }
                },
                onBeforeShow: function() {
                    dataGridOptions.collection.fetchCollection(fetchOptionsConfig);
                    ADK.PatientRecordService.fetchCollection(fetchOptions, this.collection);
                },
                model: params.model
            })
        };

    });

    return applet;
});
