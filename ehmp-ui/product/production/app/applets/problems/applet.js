define([
    'backbone',
    'handlebars',
    'app/applets/problems/modalView/modalView',
    'app/applets/problems/modalView/modalHeaderView',
    'app/applets/problems/modalView/modalFooterView',
    'app/applets/problems/util',
    'hbs!app/applets/problems/list/tooltip',
    "app/applets/problems/gistView",
    'app/applets/problems/writeback/AddEditProblems',
    'app/applets/problems/writeback/ProblemSearch',
    'app/applets/problems/writeback/RequestFreeText',
    'app/applets/visit/writeback/addselectVisit',
    'app/applets/problems/writeback/formModel',
    'app/applets/problems/writeback/workflowUtils'
], function(Backbone, Handlebars, ModalView, modalHeader, modalFooter, Util, tooltip, GistView, AddEditProblemsView, ProblemSearchView, RequestFreeTextView, addselectEncounter, FormModel, WorkflowUtils) {
    'use strict';
    var problemChannel = ADK.Messaging.getChannel('problems');
    var allEncounterDateArray = [];
    //Data Grid Columns
    var summaryColumns = [{
        name: 'problemText',
        label: 'Description',
        flexWidth: 'flex-width-4',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-4'
        }),
        sortType: 'cycle',
        hoverTip: 'conditions_description'
    }, {
        name: 'acuityName',
        label: 'Acuity',
        cell: 'handlebars',
        sortType: 'cycle',
        template: Handlebars.compile('<span class="acuityType">{{acuityName}}</span>'),
        hoverTip: 'conditions_acuity'
    }, {
        name: 'statusName',
        label: 'Status',
        cell: 'string',
        sortType: 'cycle',
        hoverTip: 'conditions_status'
    }, ];

    var fullScreenColumns =
        summaryColumns.concat([{
            name: 'onsetFormatted',
            label: 'Onset Date',
            flexWidth: 'flex-width-2',
            cell: Backgrid.StringCell.extend({
                className: 'string-cell flex-width-2'
            }),
            sortType: 'cycle',
            sortValue: function(model, sortKey) {
                return model.get("onset");
            },
            hoverTip: 'conditions_onsetdate'
        }, {
            name: 'updatedFormatted',
            label: 'Last Updated',
            flexWidth: 'flex-width-2',
            cell: Backgrid.StringCell.extend({
                className: 'string-cell flex-width-2'
            }),
            sortType: 'cycle',
            sortValue: function(model, sortKey) {
                return model.get("updated");
            },
            hoverTip: 'conditions_lastupdated'
        }, {
            name: 'providerDisplayName',
            label: 'Provider',
            flexWidth: 'flex-width-2',
            cell: Backgrid.StringCell.extend({
                className: 'string-cell flex-width-2'
            }),
            sortType: 'cycle',
            hoverTip: 'conditions_provider'
        }, {
            name: 'facilityMoniker',
            label: 'Facility',
            cell: 'handlebars',
            sortType: 'cycle',
            hoverTip: 'conditions_facility',
            template: Handlebars.compile(['<span class="facilityName">{{#if facilityMoniker}}',
                '{{facilityMoniker}}{{else if facilityCode}}{{facilityCode}}',
                '{{else}}{{facNameTruncated}}{{/if}}</span>'
            ].join("\n"))
        }, {
            name: 'comments',
            label: '',
            flexWidth: 'flex-width-0_5 ',
            sortable: false,
            srOnlyLabel: 'Comments',
            cell: Backgrid.HandlebarsCell.extend({
                className: 'handlebars-cell flex-width-0_5'
            }),
            template: Handlebars.compile([
                '{{#if commentBubble}}',
                '<i class="fa fa-comment"></i>',
                '<span class="sr-only">Comments</span>',
                '{{/if}}'
            ].join("\n"))
        }]);

    fullScreenColumns.splice(1, 0, {
        name: 'standardizedDescription',
        label: 'Standardized Description',
        flexWidth: 'flex-width-4',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-4'
        }),
        sortType: 'cycle',
        hoverTip: 'conditions_standardizeddescription'
    });

    var viewParseModel = {
        parse: function(response) {
            var crsUtil = ADK.utils.crsUtil;
            response = Util.getStandardizedDescription(response);
            response = Util.getStatusName(response);
            response = Util.getServiceConnected(response);
            response = Util.getProblemText(response);
            response = Util.getICDCode(response);
            response = Util.getAcuityName(response);
            response = Util.getFacilityColor(response);
            response = Util.getOnsetFormatted(response);
            response = Util.getEnteredFormatted(response);
            response = Util.getUpdatedFormatted(response);
            response = Util.getCommentBubble(response);
            response = Util.getICDName(response);
            response = Util.getTimeSince(response);
            response = Util.getStatusName(response);
            response[crsUtil.crsAttributes.CRSDOMAIN] = crsUtil.domain.PROBLEM;
            response.applet_id = 'problems';
            response.facNameTruncated = response.facilityName.substring(0, 3);
            response.enteredBy = response.enteredBy;
            response.recordedBy = response.recordedBy;
            response.recordedOn = response.recordedOn;

            return response;
        }
    };

    //Collection fetchOptions
    var fetchOptions = {
        resourceTitle: 'patient-record-problem',
        pageable: false,
        criteria: {
            filter: 'ne(removed, true)'
        },
        cache: true,
        viewModel: viewParseModel
    };

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        className: '',
        initialize: function(options) {
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var dataGridOptions = {};
            dataGridOptions.filterEnabled = true;
            dataGridOptions.enableModal = true;
            dataGridOptions.tblRowSelector = '#data-grid-' + this.options.appletConfig.instanceId + ' tbody tr';
            dataGridOptions.filterFields = _.pluck(fullScreenColumns, 'name'); //Defaults to all columns
            if (this.columnsViewType === "expanded") {
                dataGridOptions.columns = fullScreenColumns;
            } else if (this.columnsViewType === "summary") {
                dataGridOptions.columns = summaryColumns;
            } else {
                dataGridOptions.summaryColumns = summaryColumns;
                dataGridOptions.fullScreenColumns = fullScreenColumns;
            }
            var self = this;
            var patientExposure = ADK.PatientRecordService.getCurrentPatient().get('exposure') || [];
            self.exposure = Util.parseExposure(patientExposure);
            this.fetchOptions = fetchOptions;
            dataGridOptions.toolbarOptions = {
                buttonTypes: ['infobutton', 'detailsviewbutton']
            };
            if (ADK.UserService.hasPermission('edit-condition-problem') && ADK.PatientRecordService.isPatientInPrimaryVista()) {
                dataGridOptions.toolbarOptions.buttonTypes.push('editviewbutton');
                dataGridOptions.toolbarOptions.disableNonLocal = true;
            }
            dataGridOptions.toolbarOptions.buttonTypes.push('crsbutton');

            dataGridOptions.showLinksButton = true;
            dataGridOptions.toolbarOptions.buttonTypes.push('submenubutton');

            this.dataGridOptions = dataGridOptions;

            this.listenTo(ADK.Messaging.getChannel('problems'), 'refreshGridView', function() {
                this.refresh({});
            });

            dataGridOptions.collection = ADK.PatientRecordService.fetchCollection(this.fetchOptions);

            this.listenTo(dataGridOptions.collection, 'sync', function(collection) {
                collection.each(function(model) {
                    model.set('instanceId', self.options.appletConfig.instanceId);
                });
            });

            dataGridOptions.collection.comparator = function(a, b) {
                var statusNameA = a.get('statusName') || '';
                var statusNameB = b.get('statusName') || '';
                if (!_.isEqual(statusNameA, statusNameB)) {
                    return -statusNameB.localeCompare(statusNameA);
                } else {
                    var uidA = a.get('uid') || '';
                    var uidB = b.get('uid') || '';
                    return uidA.localeCompare(uidB);
                }
            };
            this.listenTo(problemChannel, 'detailView', function(channelObject) {
                var model = channelObject.model;
                model.attributes.exposure = self.exposure;
                var view = new ModalView({
                    model: model,
                    collection: dataGridOptions.collection
                });

                var modalOptions;
                modalOptions = {
                    'title': Util.getModalTitle(model),
                    'size': 'normal',
                    'headerView': modalHeader.extend({
                        model: model,
                        theView: view
                    }),
                    'footerView': modalFooter.extend({
                        model: model
                    }),
                };

                var modal = new ADK.UI.Modal({
                    view: view,
                    options: modalOptions
                });
                modal.show();
            });

            if (ADK.UserService.hasPermission('add-condition-problem') && ADK.PatientRecordService.isPatientInPrimaryVista()) {
                dataGridOptions.onClickAdd = function(e) {
                    e.preventDefault();
                    onAddProblems();
                };
            }

            this.listenTo(ADK.Messaging.getChannel('problems'), 'editView', function(channelObj) {
                var existingProblemModel = channelObj.model;
                if (existingProblemModel.get('instanceId') === self.options.appletConfig.instanceId) {
                    ADK.UI.Modal.hide();
                    WorkflowUtils.startEditProblemsWorkflow(AddEditProblemsView, existingProblemModel);
                }
            });


            this._super.initialize.apply(this, arguments);
        },
        onBeforeDestroy: function() {
            problemChannel.stopComplying('addProblemListModel');
            this.dataGridOptions.collection.off('sync');
            this.dataGridOptions.collection.comparator = null;
            this.dataGridOptions.onClickRow = null;
            this.dataGridOptions.onClickAdd = null;
        },
        onDestroy: function() {
            ADK.utils.crsUtil.removeStyle(this);
        }
    });

    // expose detail view through messaging
    var channel = ADK.Messaging.getChannel('problems');
    channel.reply('detailView', function(params) {
        var fetchOptions = {
            criteria: {
                "uid": params.uid
            },
            patient: ADK.PatientRecordService.getCurrentPatient(),
            resourceTitle: 'patient-record-problem',
            viewModel: viewParseModel
        };

        var data = ADK.PatientRecordService.createEmptyCollection(fetchOptions);
        var detailModel = params.model.clone();
        return {
            view: ModalView.extend({
                model: detailModel,
                collection: data
            }),
            title: _.bind(function() {
                return Util.getModalTitle(this) || "Loading";
            }, detailModel),
            footerView: modalFooter.extend({
                model: detailModel
            })
        };

    });

    channel.reply('finalizeConsultOrder', function() {
        return {
            fetchOptions: fetchOptions
        };
    });

    function onAddProblems() {
        WorkflowUtils.startAddProblemsWorkflow(AddEditProblemsView);
    }

    var applet = {
        id: 'problems',
        viewTypes: [{
            type: 'gist',
            view: GistView,
            chromeEnabled: true
        }, {
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
        }, {
            type: 'writeback',
            view: ProblemSearchView,
            chromeEnabled: false
        }],
        defaultViewType: 'summary'
    };

    ADK.Messaging.trigger('register:component:item', {
        type: "tray",
        key: 'observations',
        label: 'Problem',
        onClick: onAddProblems,
        shouldShow: function() {
            return ADK.PatientRecordService.isPatientInPrimaryVista() && ADK.UserService.hasPermissions('add-condition-problem');
        }
    });

    return applet;
});