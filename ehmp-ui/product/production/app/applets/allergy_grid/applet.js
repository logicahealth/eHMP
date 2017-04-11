define([
    'underscore',
    'handlebars',
    'hbs!app/applets/allergy_grid/details/detailsFooterTemplate',
    'app/applets/allergy_grid/modal/modalView',
    'app/applets/allergy_grid/writeback/addAllergy',
    'app/applets/allergy_grid/writeback/enteredInErrorView',
    'app/applets/allergy_grid/util',
    'app/applets/visit/writeback/addselectVisit',
    'app/applets/allergy_grid/writeback/addAllergyModel'
], function(_, Handlebars, detailsFooterTemplate, ModalView,
            addAllergy, EnteredInErrorView, Util, addselectEncounter, AddAllergyModel) {
    'use strict';
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

    var viewParseModel = {
        parse: function(response) {

            if (response.products) {
                response = ADK.utils.extract(response, response.products[0], {
                    name: 'name'
                });
            }

            if (response.observations) {
                response = ADK.utils.extract(response, response.observations[0], {
                    acuityName: 'severity',
                    observed: 'date'
                });
                response = Util.getAcuityName(response);

                if (response.observed && response.observed.length === 4) {
                    response.observedDate = response.observed;
                } else if (response.observed && response.observed.length === 6) {
                    response.observedDate = ADK.utils.formatDate(response.observed + '01', 'MMM YYYY');
                } else if (response.observed && response.observed.length == 8) {
                    if(response.observed.substring(response.observed.length - 4, response.observed.length) === '0000'){
                        response.observedDate = response.observed.substring(0, 4);
                    } else if(response.observed.substring(response.observed.length - 2, response.observed.length) === '00'){
                        response.observedDate = response.observed.substring(4, 6) + '/' + response.observed.substring(0, 4);
                    } else {
                        response.observedDate = ADK.utils.formatDate(response.observed, "MM/DD/YYYY");
                    }
                } else {
                    response.observedDate = ADK.utils.formatDate(response.observed, "MM/DD/YYYY - HH:mm");
                }
            }

            response = Util.getDrugClasses(response);
            if (response.entered) {
                response.originatedFormatted = ADK.utils.formatDate(response.entered, "MM/DD/YYYY - HH:mm");
            }
            //response = Util.getComments(response);

            response = Util.getReactions(response);
            response = Util.getFacilityColor(response);
            response = Util.getStandardizedName(response);
            response = Util.getSeverityCss(response);
            response = Util.getCommentBubble(response);
            //response = Util.getOriginatedFormatted(response);
            return response;
        },
        defaults: {
            'applet_id': 'allergy_grid'
        }
    };

    //Collection fetchOptions
    var fetchOptions = {
        resourceTitle: 'patient-record-allergy',
        viewModel: viewParseModel,
        criteria: {
            filter: 'ne(removed, true)'
        },
        cache: true,
        pageable: false,
        collectionConfig: {
            comparator: function(a, b) {
                var acuityNameA = a.get('acuityName') || '';
                var acuityNameB = b.get('acuityName') || '';
                if (acuityNameB.localeCompare(acuityNameA) !== 0) {
                    return acuityNameB.localeCompare(acuityNameA);
                } else {
                    var enteredA = a.get('entered') || '';
                    var enteredB = b.get('entered') || '';
                    return enteredB.localeCompare(enteredA);
                }
            }
        }
    };
    var defaultConfiguration = {
        fetchOptions: {
            resourceTitle: 'patient-record-allergy',
            viewModel: viewParseModel,
            criteria: {
                filter: 'ne(removed, true)'
            },
            cache: true,
            pageable: false,
            collectionConfig: {
                comparator: function(a, b) {
                    var acuityNameA = a.get('acuityName') || '';
                    var acuityNameB = b.get('acuityName') || '';
                    if (acuityNameB.localeCompare(acuityNameA) !== 0) {
                        return acuityNameB.localeCompare(acuityNameA);
                    } else {
                        var enteredA = a.get('entered') || '';
                        var enteredB = b.get('entered') || '';
                        return enteredB.localeCompare(enteredA);
                    }
                }
            }
        }
    };
    var gistModel = [{
        id: 'name',
        field: 'summary'
    }, {
        id: 'severity',
        field: 'severityCss'
    }];

    var gridView;
    var expandedViewCollection;

    var getDetailsModal = function(model, collection) {
        var view = new ModalView({
            model: model,
            collection: collection
        });

        var siteCode = ADK.UserService.getUserSession().get('site'),
            pidSiteCode = model.get('pid') ? model.get('pid').split(';')[0] : '';

        var modalOptions = {
            title: Util.getModalTitle(model),
            size: 'normal',
            nextPreviousCollection: collection,
            footerView: Backbone.Marionette.ItemView.extend({
                template: detailsFooterTemplate,
                onRender: function() {},
                events: {
                    'click #error': 'enteredInError'
                },
                enteredInError: function(event) {
                    ADK.UI.Modal.hide();
                    EnteredInErrorView.createAndShowEieView(model);
                },
                templateHelpers: function() {
                    if (ADK.UserService.hasPermission('eie-allergy') && pidSiteCode === siteCode) {
                        return {
                            data: true
                        };
                    } else {
                        return {
                            data: false
                        };
                    }
                }
            }),
            callShow: true
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
            stepTitle: 'Step 2'
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
            var dataGridOptions = {};
            dataGridOptions.enableModal = true;
            dataGridOptions.filterEnabled = false;
            dataGridOptions.tblRowSelector = '#data-grid-' + this.options.appletConfig.instanceId + ' tbody tr';
            if (this.columnsViewType === "summary") {
                dataGridOptions.columns = summaryColumns;
                dataGridOptions.gistView = false;
                dataGridOptions.appletConfiguration = defaultConfiguration;
            } else {
                fetchOptions.pageable = true;
                dataGridOptions.columns = fullScreenColumns;
                dataGridOptions.gistView = false;
                dataGridOptions.appletConfiguration = defaultConfiguration;
            }

            dataGridOptions.collection = ADK.PatientRecordService.fetchCollection(fetchOptions);
            expandedViewCollection = dataGridOptions.collection;

            this.listenTo(ADK.Messaging.getChannel('allergy_grid'), 'refreshGridView', function() {
                this.refresh({});
            });

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

            dataGridOptions.toolbarOptions = {
                buttonTypes: ['infobutton', 'detailsviewbutton'],
            };

            this.dataGridOptions = dataGridOptions;
            gridView = this;
            this._super.initialize.apply(this, arguments);
        },
        onRender: function() {
            this._super.onRender.apply(this, arguments);
        },
        onDestroy: function(){
            gridView = null; //allow view to be garbage collected.
        }
    });

    // expose detail view through messaging
    var searchAppletChannel = ADK.Messaging.getChannel("allergy_grid");
    searchAppletChannel.on('detailView', function(params) {
        var collection = params.collection || params.model.collection;
        getDetailsModal(params.model, collection);
    });
    var channel = ADK.Messaging.getChannel('allergy_grid');
    channel.reply('detailView', function(params) {
        var fetchOptions = {
            criteria: {
                "uid": params.uid
            },
            patient: ADK.PatientRecordService.getCurrentPatient(),
            resourceTitle: 'patient-record-allergy',
            viewModel: viewParseModel
        };

        var data = ADK.PatientRecordService.createEmptyCollection(fetchOptions),
            detailModel = new Backbone.Model();

        return {
            view: ModalView.extend({
                model: detailModel,
                collection: data
            }),
            title: Util.getModalTitle(params.model),
            modalSize: "medium",
            footerView: Backbone.Marionette.ItemView.extend({
                template: detailsFooterTemplate,
                collectionEvents: {
                    'sync': function(collection) {
                        detailModel.set(_.get(collection.first(), 'attributes'));
                    }
                },
                modelEvents: {
                    'change': 'render'
                },
                initialize: function() {
                    this.collection = data;
                    this.model = detailModel;
                },
                onBeforeShow: function() {
                    ADK.PatientRecordService.fetchCollection(fetchOptions, data);
                },
                events: {
                    'click #error': 'enteredInError'
                },
                enteredInError: function(event) {
                    ADK.UI.Modal.hide();
                    EnteredInErrorView.createAndShowEieView(model);
                },
                templateHelpers: function() {
                    var siteCode = ADK.UserService.getUserSession().get('site'),
                        pidSiteCode = detailModel.get('pid') ? detailModel.get('pid').split(';')[0] : '';
                    if (ADK.UserService.hasPermission('eie-allergy') && pidSiteCode === siteCode) {
                        return {
                            data: true
                        };
                    } else {
                        return {
                            data: false
                        };
                    }
                }
            })
        };
    });

    var gistConfiguration = {
        fetchOptions: {
            pageable: false
        }
    };

    var GistView = ADK.AppletViews.PillsGistView.extend({
        className: 'app-size',
        initialize: function(options) {
            var self = this;

            this._super = ADK.AppletViews.PillsGistView.prototype;

            _.extend(fetchOptions, gistConfiguration.fetchOptions);
            this.appletOptions = {
                gistModel: gistModel,
                collection: ADK.PatientRecordService.fetchCollection(fetchOptions)
            };

            if (ADK.UserService.hasPermission('add-allergy') && ADK.PatientRecordService.isPatientInPrimaryVista()) {
                this.appletOptions.onClickAdd = function(event) {
                    handleClickAdd(event);
                };
            }

            this.listenTo(ADK.Messaging.getChannel('allergy_grid'), 'refreshGridView', function() {
                this.refresh({});
            });

            gridView = this;

            this._super.initialize.apply(this, arguments);
        },
        onDestroy: function(){
            gridView = null;
        }
    });

    var applet = {
        id: 'allergy_grid',
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
