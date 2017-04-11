define([
    'backbone',
    'marionette',
    'handlebars',
    'app/applets/immunizations/util',
    'app/applets/immunizations/modal/modalView',
    'app/applets/immunizations/writeback/addImmunization',
    'app/applets/visit/writeback/addselectVisit',
    "app/applets/immunizations/modal/modalHeaderView",
    "app/applets/immunizations/appConfig",
    "app/applets/immunizations/gistUtil",
    "hbs!app/applets/immunizations/templates/tooltip"
], function(Backbone, Marionette, Handlebars, Util, ModalView, AddImmunizationView, addselectEncounter, modalHeader, CONFIG, gUtil, tooltip) {

    'use strict';
    // Switch ON/OFF debug info
    var DEBUG = CONFIG.debug;
    //Data Grid Columns

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
        flexWidth: 'flex-width-3',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-3'
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
                '{{else}}',
                '<i class="fa fa-transparent-comment"></i>',
                '<span class="sr-only">No Comments</span>',
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

    fullScreenColumns.splice(5, 1, _.extend({},summaryAdminDateCol, {
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
    var gistParseModel = {
        parse: function(response) {
            if (DEBUG) console.log("gistParseModel----->>");
            if (DEBUG) console.log(response);
            response.tooltip = tooltip(response);
            return response;
        }
    };

    var comparator = function(modelOne, modelTwo){
        return -modelOne.get('administeredDateTime').localeCompare(modelTwo.get('administeredDateTime'));
    };

    var gistConfiguration = {
        transformCollection: function(collection) {
            collection.comparator = comparator;
            if (DEBUG) console.log("ImmunGist ----->> preare collection (grouping)");
            var shallowCollection = collection.clone();
            var i_group = [];
            var arr_cid = [];
            var remove = [];
            var i, k;
            // parse model
            for (i = 0; i < shallowCollection.length; i++) {
                // model parsing
                collection.at(i).set({
                    administeredFormatted: shallowCollection.at(i).get("administeredFormatted"),
                    timeSince: shallowCollection.at(i).get("timeSinceDate"),
                    isReaction: gUtil.isReaction(shallowCollection.at(i).get("reactionName")),
                    seriesNorm: gUtil.seriesNormalization(shallowCollection.at(i).get("seriesName"))
                });
                //-------------
                if (DEBUG) console.log(shallowCollection.at(i).get("name"));
                if (!_.contains(arr_cid, shallowCollection.at(i).cid)) {
                    i_group = shallowCollection.where({
                        name: shallowCollection.at(i).get("name")
                    });
                    for (k = 0; k < i_group.length; k++) {
                        arr_cid.push(i_group[k].cid);
                    }
                    i_group = _.without(i_group, shallowCollection.at(i));
                    remove = _.union(remove, i_group);
                    shallowCollection.at(i).set({
                        group: i_group,
                        group_items: i_group.length + 1
                    });
                }
            }
            // remove groupped models
            shallowCollection.remove(remove);
            collection.reset(shallowCollection.models, {
                reindex: true,
                silent: true
            });

            _.each(collection.models, function(model) {
                model.set('tooltip', tooltip(model.attributes));

            });
            //------------------------
            return collection;
        },
        gistModel: [{
            id: 'name',
            field: 'name'
        }, {
            id: 'seriesNorm',
            field: 'seriesNorm' //'series'
        }, {
            id: 'age',
            field: 'timeSince' //'age'
        }],
        defaultView: 'pill' //'intervention'
    };
    var viewParseModel = {
        parse: function(response) {
            response = Util.getAdministeredFormatted(response);
            response = Util.getTimeSinceDate(response);
            response = Util.getContraindicated(response);
            response = Util.getFacilityColor(response);
            response = Util.getStandardizedName(response);
            response = Util.getCommentBubble(response);
            return response;
        },
        defaults: {
            'applet_id': 'immunizations'
        }
    };

    //Collection fetchOptions
    var summaryConfiguration = {
        fetchOptions: {
            resourceTitle: 'patient-record-immunization',
            pageable: true,
            viewModel: viewParseModel,
            criteria: {
                filter: 'ne(removed, true)'
            },
            cache: true
        }
    };
    var _fetchOptions = {
        resourceTitle: 'patient-record-immunization',
        pageable: true,
        viewModel: viewParseModel,
        cache: true
    };

    function setupAddHandler(options) {
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
        } else {
            channel.off('addItem');
        }
    }

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        initialize: function(options) {
            var fetchOptions = _.clone(_fetchOptions);
            if (DEBUG) console.log("Immunizations initialization ----->>");
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var dataGridOptions = {};
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
            var self = this;

            var buttonTypes = ['infobutton', 'detailsviewbutton'];

            if(ADK.UserService.hasPermissions('add-immunization')){
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
                    var view = new ModalView({
                        model: model,
                        target: event.currentTarget,
                        navHeader: true,
                        gridCollection: dataGridOptions.collection
                    });

                    view.resetSharedModalDateRangeOptions();

                    var modalOptions = {
                        'title': Util.getModalTitle(model),
                        'size': 'xlarge',
                        'headerView': modalHeader.extend({
                            model: model,
                            theView: view
                        })
                    };

                    var modal = new ADK.UI.Modal({
                        view: view,
                        options: modalOptions
                    });
                    modal.show();


                }
            };

            fetchOptions.onSuccess = function() {
                if (dataGridOptions.collection.length > 0) {
                    $('#data-grid-' + dataGridOptions.instanceId + ' tbody tr').each(function() {
                        $(this).attr("data-infobutton", $(this).find('td:first').text());
                    });
                }
            };

            dataGridOptions.collection = (_.isUndefined(dataGridOptions.collection)) ? new Backbone.Collection() : dataGridOptions.collection;
            dataGridOptions.collection.model = dataGridOptions.collection.model.extend({
                defaults: {
                    'applet_id': 'immunizations'
                }
            });
            dataGridOptions.collection.comparator = comparator;
            dataGridOptions.collection.fetchOptions = fetchOptions;
            this.dataGridOptions = dataGridOptions;

            ADK.PatientRecordService.fetchCollection(this.dataGridOptions.collection.fetchOptions, this.dataGridOptions.collection);

            this.listenTo(ADK.Messaging.getChannel('immunization'), 'refreshGridView', function() {
                this.refresh({});
            });

            this._super.initialize.apply(this, arguments);

        },
        onRender: function() {
            this._super.onRender.apply(this, arguments);
        },
        onBeforeDestroy: function() {
            channel.off('addItem');
        }

    });
    // expose gist detail view through messaging
    var channel = ADK.Messaging.getChannel('immunizations');


    channel.on('detailView', function(params) {
        if (DEBUG) console.log("Immunizations gistDetailView ----->>");
        var view = new ModalView({
            model: params.model,
            navHeader: true,
            gridCollection: params.collection || params.model.collection
        });

        view.resetSharedModalDateRangeOptions();

        var modalOptions = {
            'title': Util.getModalTitle(params.model),
            'size': 'xlarge',
            'headerView': modalHeader.extend({
                model: params.model,
                theView: view
            })
        };
        var modal = new ADK.UI.Modal({
            view: view,
            options: modalOptions
        });
        modal.show();
    });
    // expose detail view through messaging
    channel.reply('detailView', function(params) {

        var fetchOptions = {
            criteria: {
                "uid": params.uid
            },
            patient: ADK.PatientRecordService.getCurrentPatient(),
            resourceTitle: 'patient-record-immunization',
            viewModel: viewParseModel
        };

        var response = $.Deferred();

        var data = ADK.PatientRecordService.fetchCollection(fetchOptions);
        data.on('sync', function() {
            var detailModel = data.first();
            response.resolve({
                view: new ModalView({
                    model: detailModel,
                    navHeader: false
                }),
                title: Util.getModalTitle(detailModel)
            });
        }, this);

        return response.promise();
    });

    var GistView = ADK.AppletViews.PillsGistView.extend({
        className: 'app-size',
        initialize: function(options) {
            var self = this;
            this._super = ADK.AppletViews.PillsGistView.prototype;
            var buttonTypes = ['infobutton', 'detailsviewbutton', 'quicklookbutton'];

            if(ADK.UserService.hasPermissions('add-immunization')){
                buttonTypes.push('additembutton');
            }

            this.appletOptions = {
                filterFields: ["name"],
                collectionParser: gistConfiguration.transformCollection,
                gistModel: gistConfiguration.gistModel,
                collection: ADK.PatientRecordService.fetchCollection(_fetchOptions),
                toolbarOptions: {
                    buttonTypes: buttonTypes,
                    triggerSelector: '[data-infobutton]'
                },
            };

            setupAddHandler(this.appletOptions);

            this.listenTo(ADK.Messaging.getChannel('immunization'), 'refreshGridView', function() {
                this.refresh({});
            });

            this._super.initialize.apply(this, arguments);
        },
        onBeforeDestroy: function() {
            channel.off('addItem');
        }
    });

    function triggerAddImmunization(channelObj) {
        var workflowOptions = {
            size: "xlarge",
            title: "Enter Immunization",
            showProgress: false,
            keyboard: false,
            steps: []
        };

        ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, addselectEncounter.extend({
            inTray: true
        }));

        var formModel = new Backbone.Model();

        if (channelObj && channelObj.model)
            formModel = channelObj.model;

        workflowOptions.steps.push({
            view: AddImmunizationView,
            viewModel: formModel,
            stepTitle: 'Step 2'
        });
        var workflowView = new ADK.UI.Workflow(workflowOptions);
        workflowView.show({
            inTray: 'observations'
        });
        ADK.utils.writebackUtils.applyModalCloseHandler(workflowView);
    }

    var applet = {
        id: "immunizations",
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