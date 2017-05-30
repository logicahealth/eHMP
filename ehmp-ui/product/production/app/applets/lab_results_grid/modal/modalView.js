/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'handlebars',
    'app/applets/lab_results_grid/modal/filterDateRangeView',
    'app/applets/lab_results_grid/modal/labsChartView',
    'app/applets/lab_results_grid/appletHelpers',
    'hbs!app/applets/lab_results_grid/modal/templates/modalTemplate',
    'hbs!app/applets/lab_results_grid/list/flagTemplate',
    'hbs!app/applets/lab_results_grid/modal/templates/itemTable'
], function(Backbone, Marionette, _, $, Handlebars, FilterView, ChartView, AppletHelper, template, flagTemplate, itemTemplate) {
    'use strict';

    var TotalView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{totalTests}}'),
        tagName: 'span',
        model: new Backbone.Model(),
        modelEvents: {
            'change': 'render'
        }
    });

    var ItemTable = Backbone.Marionette.ItemView.extend({
        template: itemTemplate,
        modelEvents: {
            'change': 'render'
        },
        serializeModel: function() {
            if (this.model.get('basicResult')) {
                return;
            }
            if (this.model.get('type') === 'panel') {
                return AppletHelper.preparePanelForRender(this.model);
            }
            return AppletHelper.prepareNonPanelForRender(this.model);
        }
    });

    //noinspection UnnecessaryLocalVariableJS
    var ModalView = Backbone.Marionette.LayoutView.extend({
        template: template,
        ui: {
            leftColumn: '.js-backgrid',
            chart: '#js-chart',
            totalTests: '#totalTests',
            dateRangeFilter: '#dateRangeFilter',
            itemTable: '.table-responsive'
        },
        regions: {
            leftColumn: '@ui.leftColumn',
            chart: '@ui.chart',
            totalTests: '@ui.totalTests',
            dateRangeFilter: '@ui.dateRangeFilter',
            itemTable: '@ui.itemTable'
        },
        events: {
            'mouseover.modalChart @ui.leftColumn tbody tr': function(event) {
                var region = this.getRegion('chart');
                if (region.hasView()) {
                    region.currentView.triggerMethod('mouse:over', event, this.$(event.currentTarget));
                }
            },
            'mouseout.modalChart @ui.leftColumn tbody tr': function(event) {
                var region = this.getRegion('chart');
                if (region.hasView()) {
                    region.currentView.triggerMethod('mouse:out', event, this.$(event.currentTarget));
                }
            }
        },
        modelEvents: {
            'change': 'render'
        },
        dataCollectionEvents: {
            'fetch:success': 'populateRegions'
        },
        childEvents: {
            'data:collection:fetch': 'reloadLeftColumn'
        },
        dataGridOptions: {
            columns: [{
                name: 'observed',
                label: 'Date',
                template: Handlebars.compile('{{formatDate observed "MM/DD/YYYY - HH:mm"}}'),
                cell: 'handlebars',
                sortable: false
            }, {
                name: 'flag',
                label: 'Flag',
                template: flagTemplate,
                cell: 'handlebars',
                sortable: false
            }, {
                name: 'result',
                label: 'Result',
                template: Handlebars.compile('{{result}} {{units}}'),
                cell: 'handlebars',
                sortable: false
            }, {
                name: 'facilityMoniker',
                label: 'Facility',
                template: Handlebars.compile('{{facilityMoniker}}'),
                cell: 'handlebars',
                sortable: false
            }],
            appletConfig: {
                name: 'lab_results_modal',
                id: 'lab_results_grid-modalView',
                simpleGrid: true
            },
            filterDateRangeEnabled: true
        },
        initialize: function initialize(options) {
            this.dataCollection = new ADK.UIResources.Fetch.Labs.Modal.Collection();
            this.bindEntityEvents(this.dataCollection, this.dataCollectionEvents);
            this.fullScreen = options.fullScreen;
            this.isFromPanel = options.isFromPanel;
            this.isFromNonPanel = options.isFromNonPanel;

            this.fullScreen = options.fullScreen;
        },
        _finishRender: function() {
            var title = 'This table represents the selected numeric lab result, ' + this.model.get('qualifiedName');
            _.set(this.gridOptions, 'appletConfig', title);
            if (this.showNavHeader) {
                this.model.set('navHeader', true);
            }
            this.getDataGridCollection(this.collection);
            this.showChildView('totalTests', new TotalView());
            this.showChildView('dateRangeFilter', new FilterView({fullScreen: this.fullScreen}));
            this.showChildView('itemTable', new ItemTable({model: this.model}));
        },
        onRender: function onRender() {
            if (this.collection.isEmpty()) {
                this.listenToOnce(this.collection, 'fetch:success', function(collection) {
                    this.model = collection.first();
                    this._finishRender();
                });
                this.collection.fetchCollection();
                return;
            }
            this._finishRender();
        },
        onShow: function onShow() {
            this.$el.find('.lab-results-next, .lab-results-prev').attr('disabled', false);
        },
        onDestroy: function onDestroy() {
            this.unbindEntityEvents(this.dataCollection, this.dataCollectionEvents);
        },
        populateRegions: function populateRegions(collection) {
            var fullCollection = collection.fullCollection;
            this.populateChart(fullCollection);
            this.populateNumberOfTests(fullCollection.length);
            this.populateLeftColumn(collection);
            this.populatePagination(collection);
            this.itemTable.show(new ItemTable({model: this.model}));
        },
        populateChart: function populateChart(collection) {
            if (!_.isEmpty(this.chart)) {
                this.chart.reset();
            }
            if (!collection.isEmpty() && this.hasResults(collection)) {
                this.$('#lrDataTableView').removeClass('col-md-12').addClass('col-md-5');
                this.$('#lrGraph').removeClass('hidden');
                this.chart.show(new ChartView({
                    chartOptions: _.cloneDeep(AppletHelper.chartOptions),
                    model: this.model,
                    collection: this.dataCollection
                }));
            } else {
                this.$('#lrDataTableView').removeClass('col-md-5').addClass('col-md-12');
                this.$('#lrGraph').addClass('hidden');
            }
        },
        hasResults: function hasResults(collection) {
            var _hasResults = false;

            var checkResult = function checkResults(model) {
                var result = model.get('result');
                var isNumber = _.isNaN(result * 1);
                if (!isNumber) {
                    _hasResults = true;
                }
                return isNumber;
            };

            collection.each(checkResult);
            return _hasResults;
        },
        populateNumberOfTests: function populateNumberOfTests(length) {
            var totalTests = this.getRegion('totalTests').currentView;
            var totalModel = totalTests.model;
            totalModel.set('totalTests', length);
        },
        populateLeftColumn: function populateLeftColumn(collection) {
            var dataGridOptions = _.extend({}, this.dataGridOptions, {collection: collection});
            var dataGrid = ADK.Views.DataGrid.create(dataGridOptions);

            this.leftColumn.show(dataGrid);
        },
        populatePagination: function(collection) {
            var collectionsPageSize = _.get(collection, 'state.pageSize', null);
            if (collection.length !== 0) {
                if (collection.fullCollection.length <= collectionsPageSize) {
                    this.$('.js-backgrid').append('<div class="backgrid-paginator"></div>');
                } else {
                    this.paginatorView = ADK.Views.Paginator.create({
                        collection: collection,
                        windowSize: 4
                    });
                    this.$('.js-backgrid').append(this.paginatorView.render().el);
                }
            } else {
                this.$('#data-grid-lab_results_grid-modalView').find('tbody').append($('<tr><td>No Records Found</td></tr>'));
            }
        },
        getDataGridCollection: function getDataGridCollection(collection, dateFilter) {
            if (_.isObject(dateFilter)) {
                dateFilter = ADK.Applets.BaseGridApplet.prototype.buildJdsDateFilter.call(null, 'observed', dateFilter);
            }
            if (collection.length) {
                var filter = this.getFilter();
                if (dateFilter) {
                    filter += ',' + dateFilter;
                }
                var fetchOptions = {
                    criteria: {
                        filter: filter,
                        filterHold: filter
                    }
                };
                this.dataCollection.fetchCollection(fetchOptions);
            }
        },
        getFilter: function getFilter() {
            var isDOD = this.model.get('facilityCode') === 'DOD';
            var codes = this.model.get('codes');
            var code = _.get(codes, '[0].code');
            if (isDOD && !_.isUndefined(code)) {
                return 'eq("codes[].code",' + code + ')';
            }
            var typeName = this.model.get('typeName');
            var specimen = this.model.get('specimen');
            var typeFilter = 'eq(typeName,"' + typeName + '")';
            var specimenFilter = 'eq(specimen,"' + specimen + '")';
            return typeFilter + ',' + specimenFilter;
        },
        reloadLeftColumn: function reloadLeftColumn(callingView, fetchOptions) {
            this.leftColumn.reset();
            this.leftColumn.show(ADK.Views.Loading.create());
            this.getDataGridCollection(this.collection, fetchOptions);
        }
    });

    return ModalView;
});