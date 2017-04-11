define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/vitals/util',
    "app/applets/vitals/gistConfig",
    'app/applets/vitals/vitalsCollectionHandler',
    'app/applets/vitals/modal/modalView',
    'hbs!app/applets/vitals/list/resultTemplate',
    'hbs!app/applets/vitals/list/observedTemplate',
    'hbs!app/applets/vitals/list/gridTemplate',
    'hbs!app/applets/vitals/list/qualifierTemplate',
    'hbs!app/applets/vitals/modal/detailsFooterTemplate',
    'app/applets/vitals/modal/modalHeaderView',
    'hbs!app/applets/vitals/templates/tooltip',
    'app/applets/vitals/modal/stackedGraph',
    'app/applets/vitals/writeback/addVitals',
    'app/applets/visit/writeback/addselectVisit',
    'app/applets/vitals/writeback/enteredInErrorView'
], function(Backbone, Marionette, $, Handlebars, Util, gistConfig, collectionHandler, ModalView, resultTemplate, observedTemplate, gridTemplate, qualifierTemplate, detailsFooterTemplate, modalHeader, tooltip, StackedGraph, addVitals, addselectEncounter, EnteredInErrorView) {

    'use strict';
    var model;
    //Data Grid Columns
    var displayNameCol = {
        name: 'displayName',
        label: 'Vital',
        cell: 'string'
    };
    var flagCol = {
        name: '',
        label: 'Flag',
        cell: 'string'
    };
    var resultCol = {
        name: 'resultUnitsMetricResultUnits',
        label: 'Result',
        cell: 'handlebars',
        template: resultTemplate,
        hoverTip: 'vitals_result'
    };
    var observedFormattedCol = {
        name: 'observed',
        label: 'Date Observed',
        flexWidth: 'flex-width-date-time',
        cell: Backgrid.HandlebarsCell.extend ({
            className: 'handlebars-cell flex-width-date-time'
        }),
        template: observedTemplate,
        hoverTip: 'vitals_dateobserved'
    };
    var observedFormattedCoversheetCol = {
        name: 'observedFormattedCover',
        label: 'Date Observed',
        cell: 'string'
    };
    var facilityCodeCol = {
        name: 'facilityMoniker',
        label: 'Facility',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend ({
            className: 'string-cell flex-width-date'
        }),
        hoverTip: 'vitals_facility'
    };
    var typeNameCol = {
        name: 'typeName',
        label: 'Type',
        cell: 'string',
        hoverTip: 'vitals_type'
    };
    var refRangeCol = {
        name: 'referenceRange',
        label: 'Reference Range',
        cell: 'string'
    };
    var resultedDateCol = {
        name: 'resulted',
        label: 'Date Entered',
        flexWidth: 'flex-width-date-time',
        cell: Backgrid.HandlebarsCell.extend ({
            className: 'handlebars-cell flex-width-date-time'
        }),
        template: Handlebars.compile('{{resultedFormatted}}'),
        hoverTip: 'vitals_dateentered'
    };
    var qualifierCol = {
        name: 'qualifiers',
        label: 'Qualifiers',
        cell: 'handlebars',
        template: qualifierTemplate,
        hoverTip: 'vitals_qualifiers'
    };

    var summaryColumns = [displayNameCol, resultCol, observedFormattedCoversheetCol];

    var fullScreenColumns = [observedFormattedCol, typeNameCol, resultCol, resultedDateCol, qualifierCol, facilityCodeCol];

    var gridCollectionStore;
    //Collection fetchOptions
    var fetchOptions = {
        resourceTitle: 'patient-record-vital',
        pageable: false,
        cache: true,
        criteria: {}
    };

    fetchOptions.viewModel = {
        parse: function(response) {
            return response;
        }
    };

    function parseModel(response) {
        response = Util.getObservedFormatted(response);
        response = Util.getFacilityColor(response);
        response = Util.getObservedFormattedCover(response);
        response = Util.getResultedFormatted(response);
        response = Util.getDisplayName(response);
        response = Util.getTypeName(response);
        response = Util.noVitlasNoRecord(response);
        response = Util.getFormattedHeight(response);
        response = Util.getResultUnits(response);
        response = Util.getMetricResultUnits(response);
        response = Util.getResultUnitsMetricResultUnits(response);
        response = Util.getReferenceRange(response);
        response = Util.getFormattedWeight(response);
        return response;
    }

    function onAddVitals() {
        var writebackView = ADK.utils.appletUtils.getAppletView('vitals', 'writeback');
        var formModel = new Backbone.Model();
        var workflowView;
        var workflowOptions = {
            title: "Enter Vitals",
            showProgress: false,
            keyboard: false,
            steps: [],
            backdrop: 'static'
        };

        ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, addselectEncounter.extend({
            inTray: true
        }));

        workflowOptions.steps.push({
            view: writebackView,
            viewModel: formModel,
            stepTitle: 'Step 2'
        });
        workflowView = new ADK.UI.Workflow(workflowOptions);
        workflowView.show({
            inTray: 'observations'
        });
        ADK.utils.writebackUtils.applyModalCloseHandler(workflowView);
    }

    var gistConfiguration = gistConfig;
    //Collection fetchOption

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        initialize: function(options) {
            var viewType = 'summary';
            var self = this;
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var dataGridOptions = {};

            if (this.columnsViewType === "expanded" || options.appletConfig.fullScreen) {
                dataGridOptions.columns = fullScreenColumns;
                fetchOptions.pageable = true;
                dataGridOptions.filterEnabled = true;
                dataGridOptions.filterRemoved = true;
                self.isFullscreen = true;
                options.appletConfig.viewType = 'expanded';
            } else if (this.columnsViewType === "gist") {
                dataGridOptions.columns = summaryColumns;
                dataGridOptions.filterEnabled = false;
                self.isFullscreen = false;
                dataGridOptions.gistView = true;
                dataGridOptions.appletConfiguration = gistConfiguration;
                fetchOptions.pageable = false;
            } else {
                dataGridOptions.summaryColumns = summaryColumns;
                dataGridOptions.fullScreenColumns = fullScreenColumns;
                dataGridOptions.filterEnabled = false;
                self.isFullscreen = false;
                options.appletConfig.viewType = 'summary';
            }
            options.appletConfig.tileSortingUniqueId = 'typeName';
            dataGridOptions.enableModal = true;

            this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                this.loading();
                if (self.isFullscreen) {
                    fetchOptions.criteria = {
                        filter: 'and(ne(removed, true),' + self.buildJdsDateFilter('observed') + ')'
                    };
                } else {
                    fetchOptions.criteria = {
                        filter: 'and(ne(removed, true),' + self.buildJdsDateFilter('observed') + '), ne(result,Pass)'
                    };
                }
                fetchOptions.collectionConfig = {
                    collectionParse: function() {
                        return self.filterCollection.apply(self, arguments);
                    }
                };

                fetchOptions.onSuccess = function(collection) {
                    collectionHandler.addTooltips(collection, 4);
                    if (self.isFullscreen) {
                        collection.trigger('reset');
                    } else {
                        collection.trigger('vitals:globalDateFetch');
                    }

                    var sortId = self.appletConfig.instanceId + '_' + self.appletConfig.id;
                    var uniqueId;

                    if (!_.isUndefined(self.dataGridOptions.appletConfiguration)) {
                        uniqueId = self.dataGridOptions.appletConfiguration.tileSortingUniqueId;
                    }

                    if (_.isUndefined(uniqueId) && !_.isUndefined(self.dataGridOptions.appletConfig.tileSortingUniqueId)) {
                        uniqueId = self.dataGridOptions.appletConfig.tileSortingUniqueId;
                    }

                    if (!_.isUndefined(uniqueId))
                        ADK.TileSortManager.getSortOptions(collection, sortId, uniqueId);
                };

                ADK.PatientRecordService.fetchCollection(fetchOptions, self.dataGridOptions.collection);
            });

            fetchOptions.collectionConfig = {
                collectionParse: function() {
                    return self.filterCollection.apply(self, arguments);
                }
            };

            if (self.isFullscreen) {
                fetchOptions.criteria = {
                    filter: 'and(ne(removed, true),' + self.buildJdsDateFilter('observed') + ')'
                };
            } else {
                fetchOptions.criteria = {
                    filter: 'and(ne(removed, true),' + self.buildJdsDateFilter('observed') + '), ne(result,Pass)'
                };
            }

            fetchOptions.onSuccess = function() {
                collectionHandler.addTooltips(dataGridOptions.collection, 4);
            };
            dataGridOptions.appletId = 'vitals';
            this.dataGridOptions = dataGridOptions;

            self.dataGridOptions.collection = ADK.PatientRecordService.fetchCollection(fetchOptions);

            this.listenTo(ADK.Messaging.getChannel('vitals'), 'refreshGridView', function() {
                this.refresh({});
            });

            if (ADK.UserService.hasPermission('add-vital') && ADK.PatientRecordService.isPatientInPrimaryVista()) {
                dataGridOptions.onClickAdd = function(e) {
                    e.preventDefault();
                    onAddVitals();
                };
            }

            var showModal = function(model, event, appletInstanceId) {
                event.preventDefault();
                var view = new ModalView({
                    model: model,
                    target: event.currentTarget,
                    gridCollection: dataGridOptions.collection,
                    fullScreen: self.isFullscreen,
                    instanceId: appletInstanceId
                });
                view.resetSharedModalDateRangeOptions();
                var modalTitleName;
                if (model.get('modalTitleName')) {
                    modalTitleName = model.get('modalTitleName');
                } else {
                    modalTitleName = Util.getVitalLongName(model.get('typeName'));
                }

                var siteCode = ADK.UserService.getUserSession().get('site'),
                    pidSiteCode = model.get('pid') ? model.get('pid').split(';')[0] : '';

                var modalOptions = {
                    'title': modalTitleName,
                    'size': 'xlarge',
                    'headerView': modalHeader.extend({
                        model: model,
                        theView: view
                    }),
                    footerView: Backbone.Marionette.ItemView.extend({
                        template: detailsFooterTemplate,
                        events: {
                            'click #error': 'enteredInError'
                        },
                        templateHelpers: function() {
                            if (pidSiteCode === siteCode) {
                                return {
                                    isLocalSite: true
                                };
                            } else {
                                return {
                                    isLocalSite: false
                                };
                            }
                        },
                        enteredInError: function(event) {
                            ADK.UI.Modal.hide();
                            var filteredModels = self.dataGridOptions.collection.where({
                                observedFormatted: model.get('observedFormatted')
                            });
                            EnteredInErrorView.createAndShowEieView(filteredModels, model.get('observedFormatted'), model);
                        }
                    }),
                    'regionName': 'vitalsDetailsDialog'
                };

                var modal = new ADK.UI.Modal({
                    view: view,
                    options: modalOptions
                });
                modal.show();
            };

            dataGridOptions.onClickRow = function(model, event, gridView) {
                showModal(model, event, this.appletConfig.instanceId);
            };

            var VitalsItemView = Backbone.Marionette.ItemView.extend({
                tagName: 'tr',
                attributes: function() {
                    if (this.model.get('observedDateLatest') !== undefined) {
                        return {
                            'tabindex': '0',
                            'class': this.model.get('observedDateLatest') + ' clickable'
                        };
                    } else {
                        return {
                            'class': this.model.get('observedDateLatest') + ''
                        };
                    }
                },
                template: Handlebars.compile(['<td>{{displayName}}{{#if vitalsRecord}}<span class="sr-only"> vital. Press enter to view additional details.</span>{{/if}}</td>',
                                              '<td>{{resultUnitsMetricResultUnits}}</td>',
                                              '<td>{{observedFormattedCover}}</td>'
                                              ].join('\n')),
                templateHelpers: function() {
                    if (this.model.get('resultUnitsMetricResultUnits') === "No Record") {
                        return {
                            vitalsRecord: false
                        };
                    } else {
                        return {
                            vitalsRecord: true
                        };
                    }
                },
                events: {
                    'click td': function(e) {

                        ADK.utils.infoButtonUtils.onClickFunc(this, e, baseOnClickRow);

                        function baseOnClickRow(that, event) {
                            if (that.model.get('resultUnitsMetricResultUnits') !== "No Record") {
                                showModal(that.model, event);
                            }
                        }
                    }
                }
            });

            var VitalsCompositeView = Backbone.Marionette.CompositeView.extend({
                initialize: function(options) {
                    this.collection = options.collection;
                },
                template: gridTemplate,
                childView: VitalsItemView,
                childViewContainer: 'tbody'
            });

            var VitalsLayoutView = Backbone.Marionette.LayoutView.extend({
                initialize: function(options) {
                    this.collection = options.collection;
                    this.listenTo(this.collection, 'vitals:globalDateFetch', this.render);
                    this.listenTo(this.collection, 'fetch:success', this.render);
                },
                regions: {
                    leftTable: '.a-table',
                    rightTable: '.b-table'
                },
                template: Handlebars.compile([
                    '<div class="a-table"></div>',
                    '<div class="b-table"></div>'
                    ].join("\n")),
                onRender: function() {
                    var count = this.collection.length;
                    var middle = Math.floor(count / 2);
                    var leftCol = new Backbone.Collection(this.collection.slice(0, middle));
                    var rightCol = new Backbone.Collection(this.collection.slice(middle, count));
                    if (this.collection.length > 0) {
                        this.leftTable.show(new VitalsCompositeView({
                            collection: leftCol
                        }));
                        this.rightTable.show(new VitalsCompositeView({
                            collection: rightCol
                        }));

                    } else {
                        this.$el.find('.a-table')
                            .after('<div>No Records Found</div>');
                    }

                }
            });

            dataGridOptions.filterDateRangeEnabled = true;
            dataGridOptions.filterDateRangeField = {
                name: "observed",
                label: "Date",
                format: "YYYYMMDD"
            };

            this.dataGridOptions = dataGridOptions;

            if (!self.isFullscreen) {
                if (this.dataGridOptions.gistView) {
                    this.dataGridOptions.GistView = VitalsLayoutView;
                    this.dataGridOptions.SummaryView = ADK.Views.VitalsGist.getView();
                    this.dataGridOptions.SummaryViewOptions = {
                        gistModel: gistConfiguration.gistModel,
                        gistHeaders: gistConfiguration.gistHeaders,
                        enableTileSorting: true,
                        tileSortingUniqueId: 'typeName'

                    };
                } else {
                    this.dataGridOptions.SummaryView = VitalsLayoutView;
                }
            }

            this._super.initialize.apply(this, arguments);
        },
        onRender: function() {
            this._super.onRender.apply(this, arguments);

        },
        onSync: function() {
            if (this.columnsViewType === 'summary') {
                this.dataGridOptions.tblRowSelector = '#grid-panel-vitals tbody tr';
                this.dataGridOptions.tblRowSelectorColumn = 'td:first';
            } else {
                this.dataGridOptions.tblRowSelector = '#data-grid-' + this.options.appletConfig.instanceId + ' tbody tr';
                this.dataGridOptions.tblRowSelectorColumn = 'td:nth-child(2)';
            }
            this._super.onSync.apply(this, arguments);
        },
        filterCollection: collectionHandler.filterCollection
    });

    // expose gist detail view through messaging
    var channel = ADK.Messaging.getChannel('vitals');

    //this should be in the scope of a view
    channel.on('detailView', function(params) {
        var vitalsTitle;
        if (params.model.get('typeName') == 'Blood Pressure Systolic' || params.model.get('typeName') == 'Blood Pressure Diastolic') {
            vitalsTitle = 'Blood Pressure';
        } else {
            vitalsTitle = params.model.get('typeName');
        }

        var siteCode = ADK.UserService.getUserSession().get('site'),
                    pidSiteCode = params.model.get('pid') ? params.model.get('pid').split(';')[0] : '';
        // todo need to check that I merge conflicted this properly
        var modal = new ADK.UI.Modal({
            view: new ModalView({
                model: params.model,
                navHeader: false,
                fullScreen: self.isFullscreen
            }),
            options: {
                size: "xlarge",
                title: vitalsTitle,
                footerView: Backbone.Marionette.ItemView.extend({
                        template: detailsFooterTemplate,
                        events: {
                            'click #error': 'enteredInError'
                        },
                        templateHelpers: function() {
                            if (pidSiteCode === siteCode) {
                                return {
                                    isLocalSite: true
                                };
                            } else {
                                return {
                                    isLocalSite: false
                                };
                            }
                        },
                        enteredInError: function(event) {
                            ADK.UI.Modal.hide();
                            var blah = this;
                            var filteredModels = params.model.collection.where({
                                observedFormatted: params.model.get('observedFormatted')
                            });

                            EnteredInErrorView.createAndShowEieView(filteredModels, params.model.get('observedFormatted'), params.model);
                        }
                    })
            }
        });
        modal.show();
    });

    //We shouldn't be passing views around or triggering displays outside of the scope of a Marionette.View
    //This should be refactored to be a view type in applet's config
    channel.reply('detailView', function(params) {
        var fetchOptions = {
            criteria: {
                "uid": params.uid
            },
            patient: ADK.PatientRecordService.getCurrentPatient(),
            resourceTitle: 'patient-record-vital'
        };

        var response = $.Deferred();

        var data = ADK.PatientRecordService.fetchCollection(fetchOptions),
            pidSiteCode,
            detailModel;
        data.on('sync', function() {
            detailModel = data.first();
            var siteCode = ADK.UserService.getUserSession().get('site'),
                pidSiteCode = detailModel.get('pid') ? detailModel.get('pid').split(';')[0] : '';
            var vitalsTitle;
            if (detailModel.get('typeName') == 'Blood Pressure Systolic' || detailModel.get('typeName') == 'Blood Pressure Diastolic') {
                vitalsTitle = 'Blood Pressure';
            } else {
                vitalsTitle = detailModel.get('typeName');
            }
            response.resolve({
                view: new ModalView({
                    model: detailModel,
                    collection: data,
                    navHeader: false,
                    fullScreen: self.isFullscreen
                }),
                title: vitalsTitle,
                modalSize: "xlarge",
            });
        }, this);

        return response.promise();
    });

    //This is a problem as well--the model should be pulled from the resource pool and the graph handled in the stackedGraph
    //applet's scope.
    channel.reply('chartInfo', function(params) {
        var displayName = Util.getDisplayName({
            typeName: params.typeName
        }).displayName;

        var VitalModel = Backbone.Model.extend({});
        var vitalModel = new VitalModel({
            typeName: params.typeName,
            displayName: displayName,
            requesterInstanceId: params.instanceId,
            graphType: params.graphType,
            applet_id: applet.id
        });

        var response = $.Deferred();

        var stackedGraph = new StackedGraph({
            model: vitalModel,
            target: null
        });

        response.resolve({
            view: stackedGraph
        });

        return response.promise();
    });

    var applet = {
        id: "vitals",
        viewTypes: [{
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }, {
            type: 'gist',
            view: AppletLayoutView.extend({
                columnsViewType: "gist"
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: AppletLayoutView.extend({
                columnsViewType: "expanded"
            }),
            chromeEnabled: true
        }, {
            //new writeback code added from ADK documentation
            type: 'writeback',
            view: addVitals,
            chromeEnabled: false
        }],
        defaultViewType: 'summary'
    };

    ADK.Messaging.trigger('register:component:item', {
        type: "tray",
        key: 'observations',
        label: 'Vital',
        onClick: onAddVitals,
        shouldShow: function() {
            return ADK.PatientRecordService.isPatientInPrimaryVista() && ADK.UserService.hasPermissions('add-vital');
        }
    });

    return applet;
});
