/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'app/applets/lab_results_grid/appletHelpers',
    'app/applets/lab_results_grid/details/detailsView',
    'app/applets/orders/tray/labs/trayUtils',
    'app/applets/lab_results_grid/gridView',
    'hbs!app/applets/lab_results_grid/templates/tooltip'
], function(Backbone, Marionette, _, $, AppletHelper, DetailsView, LabOrderTrayUtils, GridView, tooltip) {
    'use strict';

    // NOTE: This file was split out from  app/applets/lab_results_grid/applet.js during f1175 refactoring.
    // The first commit to this file resembles the state it was in before refactoring, with some minor modifications.

    var AppletID = 'lab_results_grid';

    var GistView = ADK.Applets.BaseGridApplet.extend({
        tileOptions: {
            quickLooks: {
                enabled: true
            },
            quickMenu: function() {
                return {
                    buttons: [{
                        type: 'tilesortbutton',
                        shouldShow: function() {
                            return _.get(this, 'appletOptions.appletConfig.viewType') === 'gist' &&
                                !ADK.Messaging.request('get:current:screen').config.predefined;
                        }
                    }, {
                        type: 'detailsviewbutton'
                    }, {
                        type: 'infobutton'
                    }, {
                        type: 'notesobjectbutton',
                        shouldShow: function() {
                            return ADK.UserService.hasPermissions('add-lab-order') &&
                                ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista();
                        }
                    }]
                };
            }
        },
        dataGridOptions: {
            formattedFilterFields: {
                'observed': function(model, key) {
                    var val = model.get(key);
                    val = val.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, '$2/$3/$1 $4:$5');
                    return val;
                }
            },
            gistView: true,
            DetailsView: DetailsView,
            filterDateRangeEnabled: true,
            filterDateRangeField: {
                name: 'observed',
                label: 'Date',
                format: 'YYYYMMDD'
            }
        },
        gistConfiguration: {
            filterFields: [
                'observedFormatted',
                'typeName',
                'flag',
                'result',
                'specimen',
                'groupName',
                'isPanel',
                'units',
                'referenceRange',
                'facilityMoniker',
                'labs.models'
            ],
            gistModel: [{
                id: 'shortName',
                field: 'shortName'
            }, {
                id: 'specimenForTrend',
                field: 'specimenForTrend'
            }, {
                id: 'displayName',
                field: 'normalizedName'
            }, {
                id: 'result',
                field: 'result'
            }, {
                id: 'previousInterpretationCode',
                field: 'previousInterpretationCode'
            }, {
                id: 'previousResult',
                field: 'previousResult'
            }, {
                id: 'units',
                field: 'units'
            }, {
                id: 'timeSince',
                field: 'timeSince'
            }, {
                id: 'observationType',
                field: 'observationType'
            }, {
                id: 'tooltip',
                field: 'tooltip'
            }],
            gistHeaders: {
                header1: {
                    title: 'Lab Test',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'shortName'
                },
                header2: {
                    title: 'Result',
                    sortable: true,
                    sortType: 'numeric',
                    key: 'result'
                },
                header3: {
                    title: '',
                    sortable: false
                },
                header4: {
                    title: 'Last',
                    sortable: true,
                    sortType: 'date',
                    key: 'observed',
                    hoverTip: 'labresults_last'
                }
            },
            defaultView: 'observation',
            enableHeader: 'true',
            graphOptions: {
                height: '19',
                width: '90',
                id: '',
                hasCriticalInterpretation: true
            }
        },
        channels: {
            global: ADK.Messaging,
            applet: ADK.Messaging.getChannel(AppletID),
            addLab: ADK.Messaging.getChannel('addALabOrdersRequestChannel'),
            labResults: ADK.Messaging.getChannel('lab_results')
        },

        initialize: function(options) {
            var addPermission = 'add-lab-order';
            var filterFields = _.get(this.gistConfiguration, 'filterFields', []);

            filterFields.push(this.getLoincValues);
            this.collection = new ADK.UIResources.Fetch.Labs.TrendCollection();

            _.set(this.dataGridOptions, 'appletConfiguration', this.gistConfiguration);
            _.set(this.dataGridOptions, 'filterFields', filterFields);
            _.set(this.dataGridOptions, 'collection', this.collection);

            if (ADK.UserService.hasPermissions(addPermission) && ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista()) {
                _.set(this.dataGridOptions, 'onClickAdd', LabOrderTrayUtils.launchLabForm);
            }

            if (!this.isFullscreen && this.dataGridOptions.gistView === true) {
                this.setupSummaryView();
            }

            this.startListeners();

            this.collection.fetchCollection({
                criteria: {
                    filter: this.buildJdsDateFilter('observed') + ',eq(categoryCode , "urn:va:lab-category:CH")'
                }
            });

            GistView.__super__.initialize.apply(this, arguments);
        },

        startListeners: function startListeners() {
            var self = this;
            this.listenTo(this.channels.global, 'globalDate:selected', this.onGlobalDate);
            this.listenTo(this.channels.applet, 'detailView', this.expandOrOpenDetails);
            this.listenTo(this.channels.applet, 'addItem', this.addItem);
            this.channels.labResults.reply('gridCollection', function() {
                return self.gridCollection;
            });
        },

        addItem: function addItem(event) {
            this.channels.addLab.trigger('addLabOrdersModal', event);
        },

        onGlobalDate: function onGlobalDate() {
            var selectedId = ADK.SessionStorage.getModel('globalDate').get('selectedId');
            if (selectedId !== 'allRangeGlobal') {
                this.collection.fetchOptions.criteria.filter = this.buildJdsDateFilter('observed');
            } else {
                delete this.collection.fetchOptions.criteria.filter;
            }

            this.loading();
            this.createDataGridView();
            this.collection.fetchCollection(this.dataGridOptions.collection.fetchOptions);
        },

        setupSummaryView: function setupSummaryView() {
            this.dataGridOptions.SummaryView = ADK.Views.LabresultsGist.getView();
            var originalChildView = this.dataGridOptions.SummaryView.prototype.childView;
            this.dataGridOptions.SummaryView = this.dataGridOptions.SummaryView.extend({
                childView: originalChildView.extend({
                    serializeData: function() {
                        var data = AppletHelper.prepareNonPanelForRender(this.model);
                        AppletHelper.parseLabResponse(data);
                        var limit = 4;
                        if (data.oldValues) {
                            data.limitedoldValues = data.oldValues.splice(0, limit - 1);
                            if ((data.oldValues.length - data.limitedoldValues.length) > 0) {
                                data.moreresultsCount = data.oldValues.length - data.limitedoldValues.length;
                            }
                        }
                        data.limitedoldValues = _.map(data.limitedoldValues, function(item) {
                            var _data = AppletHelper.parseLabResponse(item);
                            if (_data.observed) {
                                _data.observedFormatted = AppletHelper.getObservedFormatted(_data.observed);
                            }
                            ADK.Enrichment.addFacilityMoniker(_data);
                            return AppletHelper.prepareNonPanelForRender(new Backbone.Model(_data));
                        });

                        data.tooltip = tooltip(data);
                        return data;
                    }
                })
            });
            var buttonTypes = ['infobutton', 'detailsviewbutton', 'quicklookbutton', 'notesobjectbutton'];
            if (!ADK.Messaging.request('get:current:screen').config.predefined) {
                buttonTypes.unshift('tilesortbutton');
            }
            this.dataGridOptions.SummaryViewOptions = {
                gistHeaders: this.gistConfiguration.gistHeaders,
                enableTileSorting: true,
                buttonTypes: buttonTypes,
                quickLooks: {
                    enabled: true
                }
            };
        },

        expandOrOpenDetails: function(channelObj) {
            var model = channelObj.model;
            var target = channelObj.$el;

            if (!this.$(target).length) {
                return;
            }

            if (model.get('isPanel')) {
                var event = {
                    preventDefault: _.noop,
                    currentTarget: target
                };
                var view = this.getRegion('appletContainer').currentView;
                this.onClickRow(false, model, event, view);
            }
        },

        onBeforeDestroy: function() {
            this.channels.labResults.stopReplying('gridCollection');
        },

        getLoincValues: function(json) {
            if (json.codes === undefined) return '';
            var codesWithLoincString = '';
            _.each(json.codes, function(item) {
                if (item.system === 'http://loinc.org') {
                    codesWithLoincString += ' ' + item.code;
                }
            });
            return codesWithLoincString;
        }

    });

    return GistView;
});