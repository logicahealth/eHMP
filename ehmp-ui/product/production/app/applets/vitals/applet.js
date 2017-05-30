define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/vitals/util',
    'app/resources/fetch/vitals/utils',
    'app/applets/vitals/gistConfig',
    'app/applets/vitals/modal/modalView',
    'hbs!app/applets/vitals/list/gridTemplate',
    'hbs!app/applets/vitals/modal/detailsFooterTemplate',
    'hbs!app/applets/vitals/templates/tooltip',
    'app/applets/vitals/modal/stackedGraph',
    'app/applets/vitals/writeback/addVitals',
    'app/applets/visit/writeback/addselectVisit',
    'app/applets/vitals/writeback/enteredInErrorView'
], function(Backbone, Marionette, $, Handlebars, Util, ResourcePoolUtils, gistConfig, ModalView, gridTemplate, detailsFooterTemplate, tooltip, StackedGraph, AddVitals, AddSelectEncounter, EnteredInErrorView) {
    'use strict';
    
    var displayNameCol = {
        name: 'displayName',
        label: 'Vital',
        cell: 'string'
    };
    var resultCol = {
        name: 'resultUnitsMetricResultUnits',
        label: 'Result',
        cell: 'handlebars',
        template: Handlebars.compile('{{resultUnits}}{{#if metricResult}}<span class="color-grey-darker">({{metricResultUnits}})</span>{{/if}}'),
        hoverTip: 'vitals_result'
    };
    var observedFormattedCol = {
        name: 'observed',
        label: 'Observed',
        flexWidth: 'flex-width-date-time',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-date-time'
        }),
        template: Handlebars.compile('{{observedFormatted}}'),
        hoverTip: 'vitals_dateobserved'
    };
    var observedFormattedCoversheetCol = {
        name: 'observedFormattedCover',
        label: 'Date Observed',
        cell: 'string'
    };
    var facilityCodeCol = {
        name: 'facilityName',
        label: 'Facility',
        flexWidth: 'flex-width-date',
        cell: Backgrid.StringCell.extend({
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
    var resultedDateCol = {
        name: 'resulted',
        label: 'Entered',
        flexWidth: 'flex-width-date-time',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-date-time'
        }),
        template: Handlebars.compile('{{resultedFormatted}}'),
        hoverTip: 'vitals_dateentered'
    };
    var qualifierCol = {
        name: 'qualifierNames',
        label: 'Qualifiers',
        cell: 'string',
        hoverTip: 'vitals_qualifiers'
    };

    var summaryColumns = [displayNameCol, resultCol, observedFormattedCoversheetCol];
    var fullScreenColumns = [observedFormattedCol, typeNameCol, resultCol, resultedDateCol, qualifierCol, facilityCodeCol];

    function onAddVitals() {
        var writebackView = ADK.utils.appletUtils.getAppletView('vitals', 'writeback');
        var formModel = new Backbone.Model();
        var workflowView;
        var workflowOptions = {
            title: 'Enter Vitals',
            showProgress: false,
            keyboard: false,
            steps: [],
            backdrop: 'static'
        };

        ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, AddSelectEncounter.extend({
            inTray: true
        }));

        workflowOptions.steps.push({
            view: writebackView,
            viewModel: formModel,
            stepTitle: 'Step 2',
            helpMapping: 'vitals_form'
        });
        workflowView = new ADK.UI.Workflow(workflowOptions);
        workflowView.show({
            inTray: 'observations'
        });
        ADK.utils.writebackUtils.applyModalCloseHandler(workflowView);
    }

    var gistConfiguration = gistConfig;
    var vitalTypesForView = {
        expanded: ['BP', 'P', 'R', 'T', 'PO2', 'PN', 'WT', 'HT', 'BMI', 'CG'],
        summary: ['BP', 'P', 'R', 'T', 'PO2', 'PN', 'WT', 'BMI', 'HT', 'CG'],
        gist: ['BPS', 'BPD', 'P', 'R', 'T', 'PO2', 'PN', 'WT', 'HT', 'BMI', 'CG']
    };

    var AppletLayoutView = ADK.Applets.BaseGridApplet.extend({
        initialize: function(options) {
            this._super = ADK.Applets.BaseGridApplet.prototype;
            var dataGridOptions = {
                appletId: 'vitals',
                toolbarOptions: {
                    buttonTypes: ['infobutton', 'detailsviewbutton'],
                }
            };

            if (this.columnsViewType === 'expanded' || options.appletConfig.fullScreen) {
                dataGridOptions.columns = fullScreenColumns;
                dataGridOptions.filterEnabled = true;
                dataGridOptions.filterRemoved = true;
                this.isFullscreen = true;
                options.appletConfig.viewType = 'expanded';
            } else if (this.columnsViewType === 'gist') {
                dataGridOptions.columns = summaryColumns;
                dataGridOptions.filterEnabled = false;
                this.isFullscreen = false;
                dataGridOptions.gistView = true;
                dataGridOptions.appletConfiguration = gistConfiguration;
            } else {
                dataGridOptions.summaryColumns = summaryColumns;
                dataGridOptions.fullScreenColumns = fullScreenColumns;
                dataGridOptions.filterEnabled = false;
                this.isFullscreen = false;
                options.appletConfig.viewType = 'summary';
            }
            dataGridOptions.enableModal = true;
            this.splitBP = this.columnsViewType === 'gist';

            this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                this.loading();
                this.fetchCollection();
            });

            if (this.columnsViewType !== 'summary') {
                dataGridOptions.tblRowSelector = '#data-grid-' + options.appletConfig.instanceId + ' tbody tr';
                dataGridOptions.tblRowSelectorColumn = 'td:nth-child(2)';
            }
            this.dataGridOptions = dataGridOptions;
            if (this.columnsViewType === 'expanded') {
                this.dataGridOptions.collection = new ADK.UIResources.Fetch.Vitals.Collection.PageableCollection({isClientInfinite: true});
            } else {
                this.dataGridOptions.collection = new ADK.UIResources.Fetch.Vitals.Aggregate(null, {vitalTypes: vitalTypesForView[this.columnsViewType], splitBP: this.splitBP});
            }
            this.fetchCollection();

            this.listenTo(ADK.Messaging.getChannel('vitals'), 'refreshGridView', function() {
                this.refresh({});
            });

            if (ADK.UserService.hasPermission('add-vital') && ADK.PatientRecordService.isPatientInPrimaryVista()) {
                this.dataGridOptions.onClickAdd = function(e) {
                    e.preventDefault();
                    onAddVitals();
                };
            }

            this.dataGridOptions.onClickRow = function(model) {
                getDetailsModal(model);
            };

            var VitalsItemView = Backbone.Marionette.ItemView.extend({
                tagName: 'tr',
                initialize: function() {
                    var crsUtil = ADK.utils.crsUtil;
                    this.model.set(crsUtil.crsAttributes.CRSDOMAIN, crsUtil.domain.VITAL);
                },
                attributes: function() {
                    ADK.utils.crsUtil.applyConceptCodeId(this.model);

                    if (this.model.get('noRecordsFound')) {
                        return {
                            'class': this.model.get('observedDateLatest') + " no-records",
                            'data-code': this.model.get('dataCode')
                        };
                    } else {
                        return {
                            'tabindex': '0',
                            'class': 'latestVital clickable',
                            'data-code': this.model.get('dataCode')
                        };
                    }
                },
                template: Handlebars.compile(['<td>{{displayName}}{{#if vitalsRecord}}<span class="sr-only"> vital. Press enter to view additional details.</span>{{/if}}</td>',
                    '{{#if vitalsRecord}}',
                    '<td>{{resultUnitsMetricResultUnits}}</td>',
                    '<td>{{observedFormattedCover}}</td>',
                    '{{else}}',
                    '<td colspan="2" class="background-color-grey-lightest">{{resultUnitsMetricResultUnits}}</td>',
                    '{{/if}}'
                ].join('\n')),
                templateHelpers: function() {
                    if (this.model.get('noRecordsFound')) {
                        return {
                            vitalsRecord: false
                        };
                    } else {
                        return {
                            vitalsRecord: true
                        };
                    }
                },
                serializeModel: function(model) {
                    var data = model.toJSON();

                    if (data.observed) {
                        data.observedFormattedCover = ADK.utils.formatDate(data.observed, ADK.utils.dateUtils.defaultOptions().placeholder + ' - HH:mm');
                    }

                    return data;
                },
                events: {
                    'click td': function(e) {
                        if(!this.$el.hasClass('no-records')) {
                            getDetailsModal(this.model);
                        }
                    },
                    'keydown': function(e) {
                        if (e.keyCode === 13 && !this.$el.hasClass('no-records')) {
                            getDetailsModal(this.model);
                        }
                    }
                }
            });

            var VitalsCompositeView = Backbone.Marionette.CompositeView.extend({
                template: gridTemplate,
                childView: VitalsItemView,
                childViewContainer: 'tbody'
            });

            var VitalsLayoutView = Backbone.Marionette.LayoutView.extend({
                regions: {
                    leftTable: '.a-table',
                    rightTable: '.b-table'
                },
                template: Handlebars.compile([
                    '<div class="a-table"></div>',
                    '<div class="b-table"></div>'
                ].join('\n')),
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

            if(this.isFullscreen) {
                this.dataGridOptions.filterDateRangeEnabled = true;
                this.dataGridOptions.filterDateRangeField = {
                    name: 'observed',
                    label: 'Date',
                    format: 'YYYYMMDD'
                };
            } else {
                this.dataGridOptions.refresh = _.bind(this._refresh, this);

                if (this.dataGridOptions.gistView) {
                    var buttonTypes = ['infobutton', 'detailsviewbutton', 'quicklookbutton'];
                    if (!ADK.Messaging.request('get:current:screen').config.predefined) {
                        buttonTypes.unshift('tilesortbutton');
                    }

                    this.dataGridOptions.SummaryView = ADK.Views.VitalsGist.getView();
                    this.dataGridOptions.SummaryViewOptions = {
                        gistModel: gistConfiguration.gistModel,
                        gistHeaders: gistConfiguration.gistHeaders,
                        enableTileSorting: true,
                        tileSortingUniqueId: 'displayName',
                        buttonTypes: buttonTypes,
                        serializeData: function() {
                            var data = this.model.toJSON();

                            if (!_.isUndefined(data.result) && (data.displayName === 'BP' || !isNaN(data.result))) {
                                data.isValid = true;
                            }

                            var timeSince = ADK.utils.getTimeSince(data.observed, false);
                            if (!_.isUndefined(timeSince)) {
                                data.numericTime = timeSince.timeSinceDescription;
                            }

                            var vitalsCollection = this.model.get('collection');

                            if(!_.isUndefined(vitalsCollection) && !vitalsCollection.isEmpty()) {
                                if (vitalsCollection.length > 1) {
                                    var previousDisplayModel = vitalsCollection.at(vitalsCollection.length - 2);
                                    if (previousDisplayModel.has('result')) {
                                        data.previousResult = previousDisplayModel.get('result');
                                    }

                                    data.oldValues = vitalsCollection.models.reverse();
                                }
                                switch (data.displayName) {
                                    case 'WT':
                                        data.graphOptions = gistConfiguration.graphOptions.WT();
                                        break;
                                    case 'BMI':
                                        data.graphOptions = gistConfiguration.graphOptions.BMI();
                                        if (data.result <= 18.5) {                    
                                            data.interpretationField = 'underweight';                
                                        } else if (data.result > 18.5 && data.result <= 24.9) {                    
                                            data.interpretationField = 'normal';                
                                        } else if (data.result > 24.9 && data.result <= 29.9) {                    
                                            data.interpretationField = 'overweight';                
                                        } else data.interpretationField = 'obese';
                                        break;
                                    case 'PN':
                                        if (_.isNumber(data.result)) {
                                            data.result = data.result.toString();
                                        }

                                        data.graphOptions = gistConfiguration.graphOptions.PN();
                                        break;
                                    case 'PO2':
                                        data.graphOptions = gistConfiguration.graphOptions.PO2();
                                        break;
                                    case 'R':
                                        data.vitalsTypeName = 'Respiratory Rate';
                                        data.graphOptions = gistConfiguration.graphOptions;
                                        break;
                                    case 'HT':
                                        data.graphOptions = gistConfiguration.graphOptions.HT();
                                        break;
                                    default:
                                        data.graphOptions = gistConfiguration.graphOptions;
                                }
                            }

                            var limit = 4;
                            if (data.oldValues) {
                                data.limitedoldValues = data.oldValues.splice(1, limit);
                                if((data.oldValues.length - data.limitedoldValues.length) > 0) {
                                    data.moreresultsCount = data.oldValues.length = data.limitedoldValues.length;
                                }
                            }

                            data.tooltip = tooltip(data);
                            return data;
                        }
                    };
                } else {
                    this.dataGridOptions.SummaryView = VitalsLayoutView;
                }
            }

            this._super.initialize.apply(this, arguments);
        },
        fetchCollection: function() {
            // The comparator on the aggregate collection gets nuked on refresh for some reason
            if (this.columnsViewType !== 'expanded' && _.isNull(this.dataGridOptions.collection.comparator)) {
                this.dataGridOptions.collection.comparator = 'order';
            }

            var criteria = {};
            if (this.isFullscreen) {
                criteria.filter = 'and(ne(removed, true),' + this.buildJdsDateFilter('observed') + ')';
            } else {
                criteria.filter = 'and(ne(removed, true),' + this.buildJdsDateFilter('observed') + '), ne(result,Pass)';
            }

            this.dataGridOptions.collection.fetchCollection(criteria, this.splitBP, vitalTypesForView[this.columnsViewType]);
        },
        _refresh: function() {
            this.loading();
            this.fetchCollection();
        }
    });

    var getDetailsModal = function(model, collection) {
        var modalCollection = collection || model.collection;
        if (!model.has('vitalLongName')) {
            model.set('vitalLongName', Util.getVitalLongName(model.get('typeName')));
        }

        var view = new ModalView({
            model: model
        });

        var siteCode = ADK.UserService.getUserSession().get('site'),
            pidSiteCode = model.get('pid') ? model.get('pid').split(';')[0] : '';

        var modalOptions = {
            'title': model.get('vitalLongName'),
            'size': 'xlarge',
            'nextPreviousCollection': modalCollection,
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
                    var filteredModels = modalCollection.where({
                        observedFormatted: model.get('observedFormatted')
                    });
                    EnteredInErrorView.createAndShowEieView(filteredModels, model.get('observedFormatted'), model);
                }
            }),
            'regionName': 'vitalsDetailsDialog'
        };

        var modal = new ADK.UI.Modal({
            view: view,
            options: modalOptions,
            callbackFunction: getDetailsModal
        });
        modal.show();
    };

    var channel = ADK.Messaging.getChannel('vitals');
    channel.on('detailView', function(params) {
        getDetailsModal(params.model, params.collection);
    });

    channel.reply('detailView', function(params) {
        var detailModel = params.model;

        return {
            view: ModalView.extend({
                model: detailModel,
                navHeader: false
            }),
            resourceEntity: detailModel,
            modalSize: 'xlarge',
            title: function() {
                return this.resourceEntity.get('vitalLongName') || 'Loading';
            }
        };
    });

    //This is a problem as well--the model should be pulled from the resource pool and the graph handled in the stackedGraph
    //applet's scope.
    channel.reply('chartInfo', function(params) {
        var displayName = ResourcePoolUtils.getDisplayName({
            typeName: params.typeName
        });

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
            target: null,
            requestParams: params
        });

        response.resolve({
            view: stackedGraph
        });

        return response.promise();
    });

    var applet = {
        id: 'vitals',
        viewTypes: [{
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: 'summary'
            }),
            chromeEnabled: true
        }, {
            type: 'gist',
            view: AppletLayoutView.extend({
                columnsViewType: 'gist'
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: AppletLayoutView.extend({
                columnsViewType: 'expanded'
            }),
            chromeEnabled: true
        }, {
            type: 'writeback',
            view: AddVitals,
            chromeEnabled: false
        }],
        defaultViewType: 'summary'
    };

    ADK.Messaging.trigger('register:component:item', {
        type: 'tray',
        key: 'observations',
        label: 'Vital',
        onClick: onAddVitals,
        shouldShow: function() {
            return ADK.PatientRecordService.isPatientInPrimaryVista() && ADK.UserService.hasPermissions('add-vital');
        }
    });

    return applet;
});
