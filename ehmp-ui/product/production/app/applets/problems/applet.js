define([
    'backbone',
    'underscore',
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
], function(Backbone, _, Handlebars, ModalView, modalHeader, modalFooter, Util, tooltip, GistView, AddEditProblemsView, ProblemSearchView, RequestFreeTextView, addselectEncounter, FormModel, WorkflowUtils) {
    'use strict';

    var UNICODE_MAX_HEX = 0xFFFFFFFF;
    var UNICODE_MAX_CHAR = String.fromCharCode(UNICODE_MAX_HEX);

    var problemChannel = ADK.Messaging.getChannel('problems');

    //Data Grid Columns
    var ProblemName = {
        name: 'problemText',
        label: 'Problem',
        flexWidth: 'flex-width-4',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-4'
        }),
        sortType: 'cycle'
    };
    var AcuityName = {
        name: 'acuityName',
        label: 'Acuity',
        cell: 'handlebars',
        sortType: 'cycle',
        template: Handlebars.compile('<span class="acuityType">{{acuityName}}</span>')
    };
    var StatusName = {
        name: 'statusName',
        label: 'Status',
        cell: 'string',
        sortType: 'cycle',
        sortValue: function(model) {
            var statusName = model.get('statusName') || '';
            statusName = statusName.toLowerCase().trim();
            var onset = model.get('onset') || UNICODE_MAX_CHAR;
            return statusName + onset;
        }
    };
    var OnsetFormatted = {
        name: 'onsetFormatted',
        label: 'Onset Date',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        }),
        sortType: 'cycle',
        sortValue: function(model) {
            return model.get("onset");
        }
    };
    var UpdatedFormatted = {
        name: 'updatedFormatted',
        label: 'Last Updated',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        }),
        sortType: 'cycle',
        sortValue: function(model) {
            return model.get("updated");
        }
    };
    var ProviderDisplayName = {
        name: 'providerDisplayName',
        label: 'Provider',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        }),
        sortType: 'cycle'
    };
    var FacilityMoniker = {
        name: 'facilityMoniker',
        label: 'Facility',
        cell: 'handlebars',
        sortType: 'cycle',
        template: Handlebars.compile(['<span class="facilityName">{{#if facilityMoniker}}',
            '{{facilityMoniker}}{{else if facilityCode}}{{facilityCode}}',
            '{{else}}{{facNameTruncated}}{{/if}}</span>'
        ].join("\n"))
    };
    var Comments = {
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
    };
    var StandardizedDescription = {
        name: 'standardizedDescription',
        label: 'Standardized Description',
        flexWidth: 'flex-width-4',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-4'
        }),
        sortType: 'cycle'
    };
    var summaryColumns = [ProblemName, StatusName, OnsetFormatted, Comments];
    var fullScreenColumns = [ProblemName, StandardizedDescription, AcuityName, StatusName, OnsetFormatted, UpdatedFormatted, ProviderDisplayName, FacilityMoniker, Comments];


    function comparator(a, b) {
        var statusNameA = a.get('statusName') || '';
        var statusNameB = b.get('statusName') || '';
        statusNameA = statusNameA.toLowerCase().trim();
        statusNameB = statusNameB.toLowerCase().trim();
        if (!_.isEqual(statusNameA, statusNameB)) {
            return statusNameA.localeCompare(statusNameB);
        }
        var textA = a.get('problemText') || '';
        var textB = b.get('problemText') || '';
        textA = textA.toLowerCase();
        textB = textB.toLowerCase();
        return textA.localeCompare(textB);
    }

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        tileOptions: {
            quickMenu: {
                enabled: true,
                buttons: [{
                    type: 'infobutton'
                }, {
                    type: 'detailsviewbutton'
                }, {
                    type: 'editviewbutton',
                    disableNonLocal: true,
                    shouldShow: function() {
                        return ADK.UserService.hasPermission('edit-condition-problem') &&
                            ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista();
                    }
                }, {
                    type: 'crsbutton'
                }, {
                    type: 'associatedworkspace'
                }]
            },
            primaryAction: {
                enabled: true
            }
        },
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
            dataGridOptions.toolbarOptions = {
                buttonTypes: ['infobutton', 'detailsviewbutton']
            };
            if (ADK.UserService.hasPermission('edit-condition-problem') && ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista()) {
                dataGridOptions.toolbarOptions.buttonTypes.push('editviewbutton');
                dataGridOptions.toolbarOptions.disableNonLocal = true;
            }
            dataGridOptions.toolbarOptions.buttonTypes.push('crsbutton');

            dataGridOptions.showLinksButton = true;
            dataGridOptions.toolbarOptions.buttonTypes.push('submenubutton');

            this.dataGridOptions = dataGridOptions;


            this.dataGridOptions.refresh = function() {
                self.loading();
                if (self.dataGridOptions.filterEnabled !== true) {
                    self.listenToOnce(this.dataGridOptions.collection, 'fetch:success', function() {
                        //repopulate backgrid where filter is not used
                        //when the filter mechanism is cleaned up to stop the multi-render, this will need to change
                        self.trigger('sort');
                    });
                }
                self.fetchData();
            };

            this.listenTo(ADK.Messaging.getChannel('problems'), 'refreshGridView', function() {
                this.refresh({});
            });

            dataGridOptions.collection = this.collection = new ADK.UIResources.Fetch.Problems.Collection();
            dataGridOptions.collection.fetchCollection(this.fetchOptions);

            this.listenTo(dataGridOptions.collection, 'sync', function(collection) {
                collection.each(function(model) {
                    model.set('instanceId', self.options.appletConfig.instanceId);
                });
            });

            dataGridOptions.collection.comparator = comparator;

            this.listenTo(problemChannel, 'detailView', function(channelObject) {
                if (channelObject.collection !== this.collection) {
                    // Testers like to stick two of the same applet on the screen at once
                    return;
                }

                var model = channelObject.model;
                model.attributes.exposure = self.exposure;
                var view = new ModalView({
                    model: model,
                    collection: dataGridOptions.collection
                });

                var $el = channelObject.$el;
                if (_.get($el, '[0].type') !== 'button') {
                    var dataRow = channelObject.uid.replace(/\:/g, '-');
                    $el = this.$('[data-row-instanceid="' + dataRow + '"]');
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
            });

            if (ADK.UserService.hasPermission('add-condition-problem') && ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista()) {
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
        },
        DataGrid: ADK.Applets.BaseGridApplet.DataGrid.extend({
            DataGridRow: ADK.Applets.BaseGridApplet.DataGrid.DataGridRow.extend({
                serializeModel: function() {
                    if (!this.model) {
                        return {};
                    }

                    var model = this.model;
                    var problemData = model.toJSON();

                    problemData.statusName = model.getStatusName(problemData.statusName);
                    problemData.problemText = model.getProblemText(problemData.problemText);
                    problemData.icdCode = model.getICDCode(problemData.icdCode);
                    problemData.enteredFormatted = ADK.utils.formatDate(problemData.entered);
                    return problemData;
                }
            })
        })
    });

    // expose detail view through messaging
    var channel = ADK.Messaging.getChannel('problems');
    channel.reply('detailView', function(params) {
        var fetchOptions = {
            criteria: {
                "uid": params.uid
            }
        };
        var data = new ADK.UIResources.Fetch.Problems.Collection();
        data.fetchOptions = _.extend({}, data.fetchOptions, fetchOptions);
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
        var fetchOptions = {
            resourceTitle: 'patient-record-problem',
            pageable: false,
            cache: true,
            viewModel: {}
        };
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
            return ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista() && ADK.UserService.hasPermissions('add-condition-problem');
        }
    });

    return applet;
});