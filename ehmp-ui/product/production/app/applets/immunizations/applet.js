define([
    'backbone',
    'marionette',
    'handlebars',
    'app/applets/immunizations/util',
    'app/resources/fetch/immunizations/utils',
    'app/applets/immunizations/modal/modalView',
    'app/applets/immunizations/writeback/addImmunization',
    'app/applets/immunizations/writeback/loadWorkflow',
    'app/applets/visit/writeback/addselectVisit',
    'hbs!app/applets/immunizations/templates/tooltip'
], function(Backbone, Marionette, Handlebars, Util, ResourcePoolUtils, ModalView, AddImmunizationView, LoadWorkflowView, addselectEncounter, tooltip) {
    'use strict';

    var IMMUNIZATIONS = 'immunizations';

    var summaryAdminDateCol = {
        name: 'administeredFormatted',
        label: 'Administered Date',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        }),
        sortValue: function(model, sortKey) {
            return model.get("administeredDateTime");
        },
        hoverTip: 'immuninizations_date'
    };

    var summaryColumns = [{
        name: 'name',
        label: 'Vaccine Name',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        }),
        hoverTip: 'immunizations_vaccinename'
    }, {
        name: 'reactionName',
        label: 'Reaction',
        cell: 'handlebars',
        template: Handlebars.compile('<p><em>{{reactionName}}</em></p>'),
        hoverTip: 'immunizations_reaction'
    }, summaryAdminDateCol, {
        name: 'facilityName',
        label: 'Facility',
        cell: 'string',
        hoverTip: 'immuninizations_facility'
    }];

    var fullScreenColumns =
        summaryColumns.concat([{
            name: 'comments',
            label: '',
            flexWidth: 'flex-width-comment ',
            sortable: false,
            srOnlyLabel: 'Comments',
            cell: Backgrid.HandlebarsCell.extend({
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
        label: 'Standardized Name',
        flexWidth: 'flex-width-4',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-4'
        }),
        hoverTip: 'immuninizations_standardizedname'
    });

    fullScreenColumns.splice(3, 0, {
        name: 'seriesName',
        label: 'Series',
        cell: 'string',
        hoverTip: 'immuninizations_series'
    }, {
        name: 'contraindicatedDisplay',
        label: 'Repeat Contraindicated',
        flexWidth: 'flex-width-3',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-3'
        }),
        hoverTip: 'immuninizations_repeatcontraindicated'
    });

    fullScreenColumns.splice(5, 1, _.extend({}, summaryAdminDateCol, {
        flexWidth: 'flex-width-3',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-3'
        })
    }));

    var PanelModel = Backbone.Model.extend({
        defaults: {
            type: 'panel'
        }
    });

    function setupAddHandler(options) {
        channel.off('addItem');
        if (ADK.UserService.hasPermission('add-immunization') && ADK.PatientRecordService.isPatientInPrimaryVista()) {
            // handles applet add (+)
            options.onClickAdd = function(e) {
                e.preventDefault();
                triggerAddImmunization();
            };
            // handles row item add(+)
            if (!(channel._events && channel._events.addItem)) {
                channel.on('addItem', function(channelObj) {
                    triggerAddImmunization(channelObj);
                });
            }
        }
    }

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        initialize: function(options) {
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var dataGridOptions = {};
            dataGridOptions.filterFields = _.pluck(fullScreenColumns, 'name');
            if (this.columnsViewType === "expanded") {
                dataGridOptions.columns = fullScreenColumns;
            } else if (this.columnsViewType === "summary") {
                dataGridOptions.columns = summaryColumns;
            } else {
                dataGridOptions.summaryColumns = summaryColumns;
                dataGridOptions.fullScreenColumns = fullScreenColumns;
            }
            dataGridOptions.enableModal = true;

            setupAddHandler(dataGridOptions);

            dataGridOptions.tblRowSelector = '#data-grid-' + this.options.appletConfig.instanceId + ' tbody tr';

            var buttonTypes = ['infobutton', 'detailsviewbutton'];

            if (ADK.UserService.hasPermissions('add-immunization')) {
                buttonTypes.push('additembutton');
            }

            dataGridOptions.toolbarOptions = {
                buttonTypes: buttonTypes,
                triggerSelector: '[data-infobutton]',
                position: 'top'
            };

            dataGridOptions.onClickRow = function(model, event, gridView) {
                event.preventDefault();

                if (model instanceof PanelModel) {
                    if (!$(event.currentTarget).data('isOpen')) {
                        $(event.currentTarget).data('isOpen', true);
                    } else {
                        var k = $(event.currentTarget).data('isOpen');
                        k = !k;
                        $(event.currentTarget).data('isOpen', k);
                    }

                    var i = $(event.currentTarget).find('.js-has-panel i');
                    if (i.length) {
                        if (i.hasClass('fa-chevron-up')) {
                            i.removeClass('fa-chevron-up')
                                .addClass('fa-chevron-down');
                            $(event.currentTarget).data('isOpen', true);
                        } else {
                            i.removeClass('fa-chevron-down')
                                .addClass('fa-chevron-up');
                            $(event.currentTarget).data('isOpen', false);
                        }
                    }
                    gridView.expandRow(model, event);
                } else {
                    model.set('isNotAPanel', true);
                    getDetailsModal(model);
                }
            };

            this.dataGridOptions = dataGridOptions;
            this.dataGridOptions.collection = new ADK.UIResources.Fetch.Immunizations.Collection([], {
                isClientInfinite: true
            });
            this.dataGridOptions.collection.fetchCollection(this.columnsViewType);

            this.listenTo(ADK.Messaging.getChannel(IMMUNIZATIONS), 'refreshGridView', function() {
                this.refresh({});
            });

            this._super.initialize.apply(this, arguments);

        },
        DataGrid: ADK.Applets.BaseGridApplet.DataGrid.extend({
            DataGridRow: ADK.Applets.BaseGridApplet.DataGrid.DataGridRow.extend({
                serializeModel: function() {
                    var data = this.model.toJSON();
                    data = Util.getTimeSinceDate(data);
                    data = Util.getContraindicated(data);
                    data = Util.getFacilityColor(data);
                    data = Util.hasCommentBubble(data);
                    return data;
                }
            })
        })
    });

    var getDetailsModal = function(model, collection) {
        var view = new ModalView({
            model: model,
            navHeader: true,
            gridCollection: collection || model.collection
        });

        view.resetSharedModalDateRangeOptions();

        var modalOptions = {
            'title': Util.getModalTitle(model),
            'size': 'xlarge',
            'nextPreviousCollection': collection || model.collection
        };

        var modal = new ADK.UI.Modal({
            view: view,
            options: modalOptions,
            callbackFunction: getDetailsModal
        });
        modal.show();
    };

    // expose gist detail view through messaging
    var channel = ADK.Messaging.getChannel(IMMUNIZATIONS);


    channel.on('detailView', function(params) {
        getDetailsModal(params.model, params.collection);
    });

    // expose detail view through messaging
    channel.reply('detailView', function(params) {

        var gridCollection = params.collection || params.model.collection;
        if (params.model) params.model.set('name', params.model.get('summary'));

        return {
            view: ModalView.extend({
                model: new Backbone.Model(_.get(params, 'model.attributes')),
                navHeader: false,
                gridCollection: gridCollection,
                modelCollectionFlag: true,
                uid: params.uid
            }),
            title: function() {
                return Util.getModalTitle(this.model || this.view.prototype.model);
            },
        };
    });

    var GistView = ADK.AppletViews.PillsGistView.extend({
        className: 'app-size',
        initialize: function(options) {
            this._super = ADK.AppletViews.PillsGistView.prototype;
            var buttonTypes = ['infobutton', 'detailsviewbutton', 'quicklookbutton'];

            if (ADK.UserService.hasPermissions('add-immunization')) {
                buttonTypes.push('additembutton');
            }

            var CollectionDef = ADK.UIResources.Fetch.Immunizations.Collection.extend({
                model: Backbone.Model.extend({
                    parse: function(response) {
                        ResourcePoolUtils.getAdministeredFormatted(response);
                        Util.getTimeSinceDate(response);
                        response.isReaction = Util.isReaction(_.get(response, 'reactionName', ''));
                        response.seriesNorm = Util.seriesNormalization(_.get(response, 'seriesName', ''));
                        return response;
                    }
                }),
            });

            this.collection = new CollectionDef([], {
                isClientInfinite: true
            });

            this.collection.fetchCollection();

            this.appletOptions = {
                filterFields: _.pluck(fullScreenColumns, 'name'),
                collectionParser: function(collection) {
                    var set = collection.groupBy('name');

                    var models = [];
                    _.each(set, function(val, key) {
                        var recent = _.max(val, function(model) {
                            return model.get('administeredDateTime');
                        });
                        recent.set('group', val);
                        models.push(recent);
                    });

                    collection.reset(models, {silent:true});

                    return collection;
                },
                gistModel: [{
                    id: 'name',
                    field: 'name'
                }, {
                    id: 'seriesNorm',
                    field: 'seriesNorm'
                }, {
                    id: 'age',
                    field: 'timeSinceDate'
                }],
                collection: this.collection,
                toolbarOptions: {
                    buttonTypes: buttonTypes,
                    triggerSelector: '[data-infobutton]'
                },
            };

            setupAddHandler(this.appletOptions);

            this._super.initialize.apply(this, arguments);

            var OriginalPillGist = this.appletOptions.AppletView;
            var PillGist = OriginalPillGist.extend({
                childView: OriginalPillGist.prototype.childView.extend({
                    serializeModel: function() {
                        var modelJSON = this.model.toJSON();
                        modelJSON.tooltip = tooltip(modelJSON);
                        return modelJSON;
                    }
                })
            });
            this.appletOptions.AppletView = PillGist;
            this.setAppletView();
        }
    });

    function triggerAddImmunization(channelObj) {
        var workflowOptions = {
            title: "Enter Immunization",
            showProgress: false,
            keyboard: false,
            steps: []
        };

        var formModel = new Backbone.Model();

        if (channelObj && channelObj.model)
            formModel = channelObj.model;

        workflowOptions.steps.push({
            view: LoadWorkflowView,
            viewModel: formModel,
            stepTitle: 'Load Workflow',
            helpMapping: 'immunizations_form'
        });

        var workflowView = new ADK.UI.Workflow(workflowOptions);
        workflowView.show({
            inTray: 'observations'
        });
        ADK.utils.writebackUtils.applyModalCloseHandler(workflowView);
    }

    var applet = {
        id: IMMUNIZATIONS,
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
            view: AddImmunizationView,
            chromeEnabled: false
        }],
        defaultViewType: 'summary'
    };

    ADK.Messaging.trigger('register:component:item', {
        type: "tray",
        key: 'observations',
        label: 'Immunization',
        onClick: triggerAddImmunization,
        shouldShow: function() {
            return ADK.PatientRecordService.isPatientInPrimaryVista() && ADK.UserService.hasPermissions('add-immunization');
        }
    });

    return applet;
});