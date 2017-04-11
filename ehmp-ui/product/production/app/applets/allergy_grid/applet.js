define([
    'underscore',
    'handlebars',
    'app/applets/allergy_grid/modal/modalView',
    'app/applets/allergy_grid/modal/footerView',
    'app/applets/allergy_grid/writeback/addAllergy',
    'app/applets/allergy_grid/writeback/enteredInErrorView',
    'app/applets/allergy_grid/util',
    'app/applets/visit/writeback/addselectVisit',
    'app/applets/allergy_grid/writeback/addAllergyModel'
], function(_, Handlebars, ModalView, ModalFooterView, addAllergy, EnteredInErrorView, Util, addselectEncounter, AddAllergyModel) {
    'use strict';

    var ALLERGY_GRID = 'allergy_grid';

    //Data Grid Columns
    var summaryColumns = [{
        name: 'summary',
        label: 'Allergen Name',
        cell: 'string',
        hoverTip: 'allergies_allergenName'
    }, {
        name: 'reaction',
        label: 'Reaction',
        flexWidth: 'flex-width-1',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1'
        }),
        hoverTip: 'allergies_reaction'
    }, {
        name: 'acuityName',
        label: 'Severity',
        cell: 'handlebars',
        template: Handlebars.compile([
            '{{#if acuityName}}',
            '<span class="label label-{{#if severe}}error{{else if moderate}}warning{{else}}info{{/if}}">{{acuityName}}</span>',
            '{{/if}}'
            ].join('\n')),
        hoverTip: 'allergies_severity'
    }];

    var fullScreenColumns =
        summaryColumns.concat([{
            name: 'drugClassesNames',
            label: 'Drug Class',
            cell: 'string',
            hoverTip: 'allergies_drugClass'
        }, {
            name: 'originatorName',
            label: 'Entered By',
            cell: 'string',
            hoverTip: 'allergies_enteredBy'
        }, {
            name: 'facilityName',
            label: 'Facility',
            cell: 'string',
            hoverTip: 'allergies_facility'
        }, {
            name: 'comments',
            label: '',
            flexWidth: 'flex-width-comment ',
            sortable: false,
            srOnlyLabel: 'Comments',
            cell: Backgrid.HandlebarsCell.extend ({
                className: 'handlebars-cell flex-width-comment'
            }),
            template: Handlebars.compile([
                '{{#if commentBubble}}',
                '<i class="fa fa-comment"></i>',
                '<span class="sr-only">Comments</span>',
                '{{/if}}'
            ].join("\n"))
        }]);

    fullScreenColumns.splice(1, 0, {
        name: 'standardizedName',
        label: 'Standardized Allergen',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1_5'
        }),
        hoverTip: 'allergies_standardizedAllergen'
    });

    var getDetailsModal = function(model, collection) {
        var view = new ModalView({
            model: model,
            collection: collection
        });

        var modalOptions = {
            title: Util.getModalTitle(model),
            nextPreviousCollection: collection,
            footerView: ModalFooterView.extend({
                model: model
            })
        };

        var modal = new ADK.UI.Modal({
            view: view,
            callbackFunction: getDetailsModal,
            options: modalOptions
        });
        modal.show();
    };

    function handleClickAdd() {
        var formModel = new AddAllergyModel();
        var workflowOptions = {
            size: "large",
            title: "Allergies",
            showProgress: false,
            keyboard: false,
            steps: []
        };

        ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, addselectEncounter.extend({
            inTray: true
        }));

        workflowOptions.steps.push({
            view: addAllergy,
            viewModel: formModel,
            stepTitle: 'Step 2',
            helpMapping: 'allergies_form'
        });
        var workflowView = new ADK.UI.Workflow(workflowOptions);
        workflowView.show({
            inTray: 'observations'
        });
        // This is not needed for tray becuase there is no close butotn ("X") as part of the workflow
        // ADK.utils.writebackUtils.applyModalCloseHandler(workflowView);
    }


    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        className: 'app-size',
        initialize: function(options) {
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var fetchOptionsConfig = {
                includeCollectionConfig: true
            };

            var dataGridOptions = {};
            dataGridOptions.collection = new ADK.UIResources.Fetch.Allergies.Collection();
            dataGridOptions.enableModal = true;
            dataGridOptions.filterEnabled = false;
            dataGridOptions.tblRowSelector = '#data-grid-' + this.options.appletConfig.instanceId + ' tbody tr';
            dataGridOptions.gistView = false;
            dataGridOptions.appletConfiguration = {
                fetchOptions: dataGridOptions.collection.getFetchOptions(fetchOptionsConfig)
            };

            dataGridOptions.toolbarOptions = {
                buttonTypes: ['infobutton', 'detailsviewbutton'],
            };

            if (this.columnsViewType === "summary") {
                dataGridOptions.columns = summaryColumns;
            } else {
                fetchOptionsConfig.isPageable = true;
                dataGridOptions.columns = fullScreenColumns;
            }

            dataGridOptions.collection.fetchCollection(fetchOptionsConfig);

            if (ADK.UserService.hasPermission('add-allergy') && ADK.PatientRecordService.isPatientInPrimaryVista()) {
                dataGridOptions.onClickAdd = function(event) {
                    event.preventDefault();
                    handleClickAdd();
                };
            }

            //Row click event handler
            dataGridOptions.onClickRow = function(model) {
                getDetailsModal(model, this.collection);
            };

            this.dataGridOptions = dataGridOptions;

            this.listenTo(ADK.Messaging.getChannel(ALLERGY_GRID), 'refreshGridView', function() {
                this.refresh({});
            });

            this._super.initialize.apply(this, arguments);
        },
        DataGrid: ADK.Applets.BaseGridApplet.DataGrid.extend({
            DataGridRow: ADK.Applets.BaseGridApplet.DataGrid.DataGridRow.extend({
                serializeModel: function() {
                    if (!this.model) {
                        return {};
                    }

                    var modelJSON = _.cloneDeep(this.model.attributes);
                    modelJSON = Util.processAllergyObject(modelJSON);
                    return modelJSON;
                }
            })
        })
    });

    // expose detail view through messaging
    var searchAppletChannel = ADK.Messaging.getChannel(ALLERGY_GRID);
    searchAppletChannel.on('detailView', function(params) {
        var collection = params.collection || params.model.collection;
        getDetailsModal(params.model, collection);
    });
    var channel = ADK.Messaging.getChannel(ALLERGY_GRID);
    channel.reply('detailView', function(params) {
        var fetchOptionsConfig = {
            criteria: {
                uid: params.uid
            }
        };

        var detailModel = params.model;

        return {
            view: ModalView.extend({
                model: detailModel,
                fetchOptions: fetchOptionsConfig
            }),
            title: Util.getModalTitle(params.model),
            footerView: ModalFooterView.extend({
                model: detailModel
            })
        };
    });

    var GistView = ADK.AppletViews.PillsGistView.extend({
        className: 'app-size',
        initialize: function(options) {
            this._super = ADK.AppletViews.PillsGistView.prototype;

            var fetchOptionsConfig = {
                includeCollectionConfig: true
            };

            var allergies = new ADK.UIResources.Fetch.Allergies.Collection();

            this.appletOptions = {
                gistModel: [{
                    id: 'name',
                    field: 'summary'
                }, {
                    id: 'severity',
                    field: 'severityCss'
                }],
                collection: allergies.fetchCollection(fetchOptionsConfig)
            };

            if (ADK.UserService.hasPermission('add-allergy') && ADK.PatientRecordService.isPatientInPrimaryVista()) {
                this.appletOptions.onClickAdd = function(event) {
                    handleClickAdd(event);
                };
            }

            this.listenTo(ADK.Messaging.getChannel(ALLERGY_GRID), 'refreshGridView', function() {
                this.refresh({});
            });

            this._super.initialize.apply(this, arguments);
        }
    });

    var applet = {
        id: ALLERGY_GRID,
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
            view: addAllergy,
            chromeEnabled: false
        }],
        defaultViewType: "summary"
    };

    ADK.Messaging.trigger('register:component:item', {
        type: "tray",
        key: 'observations',
        label: 'Allergy',
        onClick: handleClickAdd,
        shouldShow: function() {
            return ADK.PatientRecordService.isPatientInPrimaryVista() && ADK.UserService.hasPermissions('add-allergy');
        }
    });

    return applet;
});
