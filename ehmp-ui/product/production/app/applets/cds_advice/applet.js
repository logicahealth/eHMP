define([
    'handlebars',
    'app/applets/cds_advice/util',
    'app/applets/cds_advice/modal/default/defaultModal',
    'app/applets/cds_advice/modal/error/errorModal',
    'app/applets/cds_advice/modal/advice/adviceModal',
    'app/applets/cds_advice/modal/reminder/reminderModal',
    'app/applets/cds_advice/modal/loading/loadingModal',
], function(Handlebars,Util, DefaultModal, ErrorModal, AdviceModal, ReminderModal, LoadingModal) {
    'use strict';
    //Data Grid Columns
    var priorityCol = {
        name: 'priorityText',
        label: 'Priority',
        cell: 'handlebars',
        template: Handlebars.compile('<span class="{{priorityCSS}}">{{priorityText}}</span>'),
        hoverTip: 'clinicalreminders_priority'
    };
    var typeCol = {
        name: 'typeText',
        label: 'Type',
        cell: 'string',
        hoverTip: 'clinicalreminders_type'
    };
    var titleCol = {
        name: 'title',
        label: 'Title',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend ({
            className: 'string-cell flex-width-2'
        }),
        hoverTip: 'clinicalreminders_title'
    };
    var dueCol = {
        name: 'dueDateFormatted',
        label: 'Due Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend ({
            className: 'string-cell flex-width-date'
        }),
        sortValue: function(model, sortKey) {
            return model.get('dueDate');
        },
        hoverTip: 'clinicalreminders_duedate'
    };
    var doneCol = {
        name: 'doneDateFormatted',
        label: 'Done Date',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend ({
            className: 'string-cell flex-width-date'
        }),
        sortValue: function(model, sortKey) {
            return model.get('doneDate');
        },
        hoverTip: 'clinicalreminders_donedate'
    };

    var summaryColumns = [priorityCol, titleCol, typeCol, dueCol];

    var fullScreenColumns = [priorityCol, titleCol, typeCol, dueCol, doneCol];

    // Disabling CDS Advice on dev branch to exclude the functionality from the coming production release.
    var selectedUse = 'providerInteractiveAdvice';
    var GridApplet = ADK.Applets.BaseGridApplet;

    var AppletLayoutView = GridApplet.extend({
        initialize: function(options) {
            this._super = GridApplet.prototype;

            var dataGridOptions = {
                summaryColumns: summaryColumns,
                fullScreenColumns: fullScreenColumns,
                enableModal: true,
                filterEnabled: true,
                filterFields: _.pluck(fullScreenColumns, 'name'),
                onClickRow: _.bind(this.onClickRowHandler, this),
                collection: new ADK.UIResources.Fetch.CdsAdvice.List({isClientInfinite: true})
            };
            this.dataGridOptions = dataGridOptions;
            this.dataGridOptions.collection.fetchCollection({use: selectedUse, cache: true});
            this._super.initialize.call(this, options);
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
        onClickRowHandler: function(model, event) {
            if (model.get('details')) {
                // we got the details, show the popup
                this.showDetails(model);
            } else {
                // show loading popup while we wait for the details
                LoadingModal.show(model, model.get('typeText'));
                this.getDetails(model);
            }
        },
        getDetails: function(model) {
            var details = new ADK.UIResources.Fetch.CdsAdvice.Detail({id: model.get('id'), use: selectedUse});
            this.listenToOnce(details, 'sync', function(data) {
                delete model.xhr;
                model.set('details', data.toJSON());
                this.showDetails(model);
            });
            model.xhr = details.fetch();
        },
        showDetails: function(model) {
            switch (model.get('type')) {
                case Util.ADVICE_TYPE.REMINDER:
                    ReminderModal.show(model);
                    break;

                case Util.ADVICE_TYPE.ADVICE:
                    AdviceModal.show(model);
                    break;

                default:
                    DefaultModal.show(model);
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
