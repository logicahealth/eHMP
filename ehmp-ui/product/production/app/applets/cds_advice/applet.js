define([
    'underscore',
    'handlebars',
    'app/applets/cds_advice/util',
    'app/applets/cds_advice/modal/default/defaultModal',
    'app/applets/cds_advice/modal/error/errorModal',
    'app/applets/cds_advice/modal/advice/adviceModal',
    'app/applets/cds_advice/modal/reminder/reminderModal',
    'app/applets/cds_advice/modal/loading/loadingModal',
], function(_, Handlebars, Util, DefaultModal, ErrorModal, AdviceModal, ReminderModal, LoadingModal) {
    'use strict';
    //Data Grid Columns
    var priorityCol = {
        name: 'priorityText',
        label: 'Priority',
        cell: 'handlebars',
        template: Handlebars.compile('<span class="{{priorityCSS}}">{{priorityText}}</span>')
    };
    var typeCol = {
        name: 'typeText',
        label: 'Type',
        cell: 'string'
    };
    var titleCol = {
        name: 'title',
        label: 'Title',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        })
    };
    var dueCol = {
        name: 'dueDateFormatted',
        label: 'Due Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-date'
        }),
        sortValue: function(model, sortKey) {
            return model.get('dueDate');
        }
    };
    var doneCol = {
        name: 'doneDateFormatted',
        label: 'Done Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-date'
        }),
        sortValue: function(model, sortKey) {
            return model.get('doneDate');
        }
    };

    var summaryColumns = [priorityCol, titleCol, typeCol, dueCol];
    var fullScreenColumns = [priorityCol, titleCol, typeCol, dueCol, doneCol];

    // Disabling CDS Advice on dev branch to exclude the functionality from the coming production release.
    var selectedUse = 'providerInteractiveAdvice';
    var channel = ADK.Messaging.getChannel('cds_advice');
    var GridApplet = ADK.Applets.BaseGridApplet;
    var AppletLayoutView = GridApplet.extend({
        tileOptions: {
            primaryAction: {
                enabled: true,
                onClick: function(params, event) {
                    var targetElement = _.get(params, '$el');
                    channel.trigger('onClickRowHandler', params.model, targetElement);
                }
            },
            quickMenu: {
                enabled: true,
                buttons: [{
                    type: 'detailsviewbutton',
                    onClick: function(params, model) {
                        var targetElement = _.get(params, '$el', this.$('.dropdown--quickmenu > button'));
                        channel.trigger('onClickRowHandler', params.model, targetElement);
                    }
                }]
            }
        },
        initialize: function(options) {
            this._super = GridApplet.prototype;

            var dataGridOptions = {
                summaryColumns: summaryColumns,
                fullScreenColumns: fullScreenColumns,
                enableModal: true,
                filterEnabled: true,
                filterFields: _.pluck(fullScreenColumns, 'name'),
                collection: new ADK.UIResources.Fetch.CdsAdvice.List({ isClientInfinite: true })
            };
            this.dataGridOptions = dataGridOptions;
            this.dataGridOptions.collection.fetchCollection({ use: selectedUse, cache: true });
            this._super.initialize.call(this, options);
            this.listenTo(channel, 'onClickRowHandler', this.onClickRowHandler);
        },
        DataGrid: ADK.Applets.BaseGridApplet.DataGrid.extend({
            DataGridRow: ADK.Applets.BaseGridApplet.DataGrid.DataGridRow.extend({
                serializeModel: function() {
                    var data = this.model.toJSON();
                    data.priorityCSS = Util.getPriorityCSS(data.priority);
                    return data;
                }
            })
        }),
        refresh: function() {
            _.set(this, 'dataGridOptions.collection.fetchOptions.criteria.cache', false);
            this._super.refresh.apply(this, arguments);
            _.set(this, 'dataGridOptions.collection.fetchOptions.criteria.cache', true);
        },
        onClickRowHandler: function(model, targetElement) {
            if (model.get('details')) {
                // we got the details, show the popup
                this.showDetails(model, targetElement);
            } else {
                // show loading popup while we wait for the details
                LoadingModal.show(model, model.get('typeText'));
                this.getDetails(model, targetElement);
            }
        },
        getDetails: function(model, targetElement) {
            var details = new ADK.UIResources.Fetch.CdsAdvice.Detail({ id: model.get('id'), use: selectedUse });
            this.listenToOnce(details, 'sync', function(data) {
                delete model.xhr;
                model.set('details', data.toJSON());
                this.showDetails(model, targetElement);
            });
            model.xhr = details.fetch();
        },
        showDetails: function(model, targetElement) {
            switch (model.get('type')) {
                case Util.ADVICE_TYPE.REMINDER:
                    ReminderModal.show(model, targetElement);
                    break;

                case Util.ADVICE_TYPE.ADVICE:
                    AdviceModal.show(model, targetElement);
                    break;

                default:
                    DefaultModal.show(model, targetElement);
            }
        }
    });

    var applet = {
        id: 'cds_advice',
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
        defaultViewType: "summary"
    };

    return applet;
});
