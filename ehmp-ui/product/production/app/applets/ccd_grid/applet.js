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
        }
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
        }
    };
    var authorCol = {
        name: 'authorDisplayName',
        label: 'Authoring Institution',
        cell: 'string'
    };
    var descCol = {
        name: 'summary',
        label: 'Description',
        cell: 'string'
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
            var getDetailsView = function(params) {
                var modalViewOptions = {
                    model: params.model,
                    collection: dataGridOptions.collection,
                    initCount: 0
                };

                var view = new ModalView(modalViewOptions);

                var modalOptions = {
                    'size': 'xlarge',
                    'headerView': ModalHeader.extend({
                        model: params.model,
                        theView: view,
                        initCount: 0
                    }),
                    triggerElement: params.$el
                };

                var modal = new ADK.UI.Modal({
                    view: view,
                    options: modalOptions
                });
                modal.show();
            };
            this.tileOptions = {
                quickMenu: {
                    enabled: true,
                    buttons: [{
                        type: 'detailsviewbutton',
                        onClick: getDetailsView
                    }]
                },
                primaryAction: {
                    enabled: true,
                    onClick: getDetailsView
                }
            };
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
            size: "xlarge",
            view: ModalView.extend({
                initialize: function() {
                    this.highlights = this.model.get('highlights');
                    ModalView.prototype.initialize.apply(this, arguments);
                },
                collection: data,
                collectionEvents: {
                    'sync': function(collection) {
                        var model = collection.first() || this.model;
                        this.model.set(model.attributes);

                        this.synonyms = ADK.Messaging.getChannel('search').request('synonymsCollection');
                        this.listenToOnce(this.synonyms, 'fetch:success', this.getSynonyms);
                        this.getSynonyms();
                    }
                },
                getSynonyms: function(collection, response) {
                    if (response) {
                        this.updateView(_.get(response, 'data.synonyms', []));
                    } else if (!this.synonyms.isEmpty() && this.synonyms.first().has('synonyms')) {
                        this.updateView(this.synonyms.first().get('synonyms'));
                    }
                },
                updateView: function(synonymArray) {
                    if (this.model.get('fullHtml')) {
                        var fullHtml = this.model.get('fullHtml') || '';
                        var ccdContent = this.$('.ccd-content');
                        fullHtml = Util.highlightSearchTerm(fullHtml, synonymArray, this.highlights);
                        if (ccdContent.size() > 0) {
                            var iframeCcd = ccdContent[0].contentWindow.document;
                            iframeCcd.open();
                            iframeCcd.write(fullHtml);
                            iframeCcd.close();
                        }
                    }
                },
                onBeforeShow: function() {
                    this.collection.fetchCollection(fetchOptionsConfig);
                },
                model: params.model
            }),
            headerView: ModalHeader.extend({
                collection: data,
                model: params.model,
                initialize: function() {
                    this.isSynced = false;
                },
                onRender: function() {
                    this.$('#ccdPrevious').addClass('hidden');
                    this.$('#ccdNext').addClass('hidden');

                    if (!this.isSynced) {
                        this.$('#mainModalLabel').text('Loading...');
                    }
                },
                collectionEvents: {
                    'sync': function(collection, resp) {
                        this.isSynced = true;
                        var model = collection.first();
                        if (model) {
                            this.model.set(model.attributes);
                            this.render();
                        }
                    }
                }
            }),
            title: 'Loading...'
        };

    });

    return applet;
});