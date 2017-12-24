define([
    'backbone',
    'underscore',
    'app/applets/problems/modalView/modalView',
    'app/applets/problems/modalView/modalHeaderView',
    'app/applets/problems/modalView/modalFooterView',
    'app/applets/problems/util',
    'hbs!app/applets/problems/list/tooltip',
    'moment',
    'app/applets/problems/writeback/AddEditProblems',
    'app/applets/problems/writeback/workflowUtils',
    'hbs!app/applets/problems/list/gistViewLayout',
    'hbs!app/applets/problems/list/gistChildLayout'
], function(Backbone, _, ModalView, modalHeader, modalFooter, Util, tooltip, moment, AddEditProblemsView, WorkflowUtils, gistViewLayout, gistChildLayout) {
    'use strict';


    var GistViewItem = ADK.Views.EventGist.getRowItem().extend({
        template: gistChildLayout,
        behaviors: {
            QuickLooks: {}
        }
    });


    var ExtendedGistView = ADK.Views.EventGist.getView().extend({
        template: gistViewLayout,
        childView: GistViewItem
    });


    return ADK.AppletViews.EventsGistView.extend({
        appletOptions: {
            gistHeaders: {
                name: {
                    title: 'Problem',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'groupName'
                },
                onsetDate: {
                    title: 'Onset Date',
                    sortable: true,
                    sortType: 'date',
                    key: 'onset'
                },
                statusName: {
                    title: 'Status',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'statusName'
                }
            },
            gistModel: [{
                id: 'groupName',
                field: 'groupName'
            }, {
                id: 'statusName',
                field: 'statusName'
            }, {
                id: 'onsetDate',
                field: 'onsetFormatted'
            }, {
                id: 'problemText',
                field: 'problemText'
            }],
            filterFields: ['problemText', 'standardizedDescription', 'acuityName', 'statusName', 'onsetFormatted', 'updatedFormatted', 'providerDisplayName']
        },

        initialize: function(options) {
            var __super__ = ADK.AppletViews.EventsGistView.prototype;
            var channel = ADK.Messaging.getChannel('problems');
            var instanceId = this.options.appletConfig.instanceId;
            var collection = new ADK.UIResources.Fetch.Problems.GroupingCollection(null, {instanceId: instanceId});


            this.appletOptions.enableTileSorting = true;
            this.appletOptions.serializeData = this._serializeData;
            this.appletOptions.showLinksButton = true;
            this.appletOptions.showCrsButton = true;
            this.appletOptions.AppletView = ExtendedGistView;
            this.appletOptions.refresh = this.refresh;

            if (this.hasAddPermission()) {
                this.appletOptions.onClickAdd = this._onClickAdd;
            }

            if (this.hasEditPermission()) {
                this.appletOptions.showEditButton = true;
                this.appletOptions.disableNonLocal = true;
            }

            this.listenTo(channel, 'editView', this.editProblem);
            this.listenTo(channel, 'detailView', this.showDetailsView);
            this.listenTo(channel, 'refreshGridView', this.refresh);

            this.appletOptions.collection = this.collection = collection;
            this.collection.fetchCollection();

            __super__.initialize.apply(this, arguments);
        },

        refresh: function() {
            this.loading();
            this.setAppletView();
            this.collection.fetchCollection();
        },

        editProblem: function(channelObj) {
            var existingProblemModel = channelObj.model;
            if (existingProblemModel.get('instanceId') === this.options.appletConfig.instanceId) {
                ADK.UI.Modal.hide();
                WorkflowUtils.startEditProblemsWorkflow(AddEditProblemsView, existingProblemModel);
            }
        },

        showDetailsView: function(params) {
            var model = params.model;
            var view = new ModalView({
                model: model,
                collection: params.collection
            });

            var $el = params.$el;
            if ($el && $el[0].type !== 'button') {
                $el = $el.find('.dropdown--quickmenu > button');
            }

            var modalOptions = {
                triggerElement: $el,
                'title': Util.getModalTitle(model),
                'size': 'normal',
                'headerView': modalHeader.extend({
                    model: model,
                    theView: view
                }),
                'footerView': modalFooter.extend({
                    model: model
                })
            };
            var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions
            });
            modal.show();
        },

        hasAddPermission: function() {
            return ADK.UserService.hasPermission('add-condition-problem') && ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista();
        },

        hasEditPermission: function() {
            return ADK.UserService.hasPermission('edit-condition-problem') && ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista();
        },

        _onClickAdd: function(event) {
            event.preventDefault();
            WorkflowUtils.startAddProblemsWorkflow(AddEditProblemsView);
        },

        _serializeData: function serializeData() {
            var model = this.model;
            var problemData = model.toJSON();

            problemData.statusName = model.getStatusName(problemData.statusName);
            problemData.problemText = model.getProblemText(problemData.problemText);
            problemData.icdCode = model.getICDCode(problemData.icdCode);
            problemData.enteredFormatted = ADK.utils.formatDate(problemData.entered);
            return problemData;
        },

        onDestroy: function() {
            ADK.utils.crsUtil.removeStyle(this);
        }
    });
});