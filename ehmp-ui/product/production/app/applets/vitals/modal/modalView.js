define([
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'highcharts',
    'handlebars',
    'moment',
    'app/applets/vitals/util',
    'app/applets/vitals/appletHelpers',
    'app/applets/vitals/modal/filterDateRangeView',
    'hbs!app/applets/vitals/modal/modalTemplate'
], function($,
    Backbone,
    Marionette,
    _,
    Highcharts,
    Handlebars,
    moment,
    Util,
    AppletHelper,
    FilterDateRangeView,
    modalTemplate
) {
    'use strict';

    var columns = [{
        name: 'observed',
        label: 'Observed',
        template: Handlebars.compile('{{formatDate observed "MM/DD/YYYY - HH:mm"}}'),
        cell: 'handlebars',
        sortable: false
    }, {
        name: 'resultUnitsMetricResultUnits',
        label: 'Result',
        template: Handlebars.compile('{{resultUnits}}{{#if metricResult}}<span class="color-grey-darker">({{metricResultUnits}})</span>{{/if}}'),
        cell: 'handlebars',
        sortable: false
    }, {
        name: 'facilityMoniker',
        label: 'Facility',
        template: Handlebars.compile('<span>{{facilityMoniker}}</span>'),
        cell: 'handlebars',
        sortable: false
    }];

    var DateRangeModel = Backbone.Model.extend({
        defaults: {
            fromDate: moment().subtract('years', 2).format(ADK.utils.dateUtils.defaultOptions().placeholder),
            toDate: moment().format(ADK.utils.dateUtils.defaultOptions().placeholder)
        }
    });

    var ChartView = Backbone.Marionette.ItemView.extend({
        template: '<div></div>',
        id: 'chart-container',
        initialize: function(options) {
            if (!_.isEmpty(_.get(this.collection, 'models'))) {
                this.first = this.collection.first();
            }

            this.chartOptions = _.clone(options.chartOptions, {
                deep: true
            });

            this.fullCollection = this.collection.clone();

            var low = this.fullCollection.pluck('low');
            var high = this.fullCollection.pluck('high');

            if (this.modalDisplayName !== 'BP') {
                low = _.map(low, function(num) {
                    return parseFloat(num);
                });

                high = _.map(high, function(num) {
                    return parseFloat(num);
                });
            } else {
                var bpSplitData;
                low = _.map(low, function(num) {
                    if (!_.isEmpty(num)) {
                        bpSplitData = num.split('/');
                        return parseFloat(bpSplitData[bpSplitData.length - 1]);
                    } else {
                        return undefined;
                    }
                });

                high = _.map(high, function(num) {
                    if (!_.isEmpty(num)) {
                        bpSplitData = num.split('/');
                        return parseFloat(bpSplitData[0]);
                    } else {
                        return undefined;
                    }
                });
            }

            var categories = this.fullCollection.pluck('observed');
            categories = _.map(categories, function(observed) {
                return moment(observed, 'YYYYMMDDHHmmss').format('MM/DD/YYYY - HH:mm');
            });
            categories.reverse();

            var data = this.fullCollection.pluck('result');
            var units = this.fullCollection.pluck('units');
            var bpDiatolicData = [];
            var bpSystolicData = [];
            var cleanData = [];
            _.each(data, function(e, i) {
                if (this.modalDisplayName !== 'BP') {
                    if (_.isNaN(data[i] * 1)) {
                        cleanData.push(null);
                    } else {
                        if (this.modalDisplayName === 'PN' && e === '99') {
                            cleanData.push(null);
                        } else if (this.modalDisplayName !== 'HT') {
                            cleanData.push(data[i] * 1);
                        } else {
                            if (units[i] !== 'in' && units[i] !== 'inches') {
                                cleanData.push(Math.floor(data[i] * 0.4));
                            } else {
                                cleanData.push(data[i] * 1);
                            }
                        }
                    }
                } else {
                    var bpSplitData;
                    if (!_.isUndefined(data[i])) {
                        if (_.isNaN(data[i] * 1) && data[i].indexOf('/') === -1) {
                            //Currently does not display TextOnly data
                            bpDiatolicData.push(null);
                            bpSystolicData.push(null);
                            cleanData.push(null);
                        } else {
                            bpSplitData = data[i].split('/');
                            bpDiatolicData.push(parseFloat(bpSplitData[bpSplitData.length - 1]));
                            bpSystolicData.push(parseFloat(bpSplitData[0]));
                            cleanData.push(parseFloat(bpSplitData[0]));
                        }
                    } else {
                        bpDiatolicData.push(null);
                        bpSystolicData.push(null);
                        cleanData.push(null);
                    }
                }
            }, this);

            var highLow = [];

            //Parsing out bad data
            if (this.modalDisplayName !== 'WT' && this.modalDisplayName !== 'HT' && this.modalDisplayName !== 'PN' && this.modalDisplayName !== 'BMI') {
                _.each(cleanData, function(e, i) {
                    var dataNumber = parseFloat(cleanData[i]);

                    if (this.modalDisplayName === 'BP') {
                        var bpDataNumber = parseFloat(bpDiatolicData[i]);
                        if (!isNaN(bpDataNumber) && !isNaN(dataNumber)) {
                            if (!isNaN(low[i]) && !isNaN(high[i])) {
                                highLow.push([low[i], high[i]]);
                            } else {
                                highLow.push([null, null]);
                            }
                        } else {
                            highLow.push([null, null]);
                        }
                    } else {
                        if (!isNaN(dataNumber)) {
                            if (!isNaN(low[i]) && !isNaN(high[i])) {
                                highLow.push([low[i], high[i]]);
                            } else {
                                highLow.push([null, null]);
                            }
                        }
                    }
                }, this);
            }

            //Reverse the graph so that the x and y line up
            bpSystolicData.reverse();
            bpDiatolicData.reverse();
            data = cleanData;
            data.reverse();
            highLow.reverse();
            var onlyNumData = [];
            //Checks the count of data that is chartable
            _.each(cleanData, function(e, i) {
                var dataNumber = parseFloat(cleanData[i]);
                if (!_.isUndefined(dataNumber) && !isNaN(dataNumber) && dataNumber !== null) {
                    onlyNumData.push(dataNumber);
                }
            });
            //If there is chartable data show the chart
            if (this.modalDisplayName !== 'BP') {
                this.setGraphable(onlyNumData);
            } else {
                this.setGraphable(bpSystolicData);
            }

            this.chartOptions.series[0].data = [];

            if (this.modalDisplayName !== 'BP') {
                _.forEach(data, function(e, i) {
                    this.chartOptions.series[0].data.push({
                        y: data[i],
                        dataLabels: {
                            enabled: false
                        }
                    });
                }, this);
            } else {
                _.forEach(bpSystolicData, function(e, i) {
                    this.chartOptions.series[0].data.push({
                        y: bpSystolicData[i],
                        dataLabels: {
                            enabled: false
                        }
                    });
                }, this);
            }

            this.chartOptions.xAxis.tickPositioner = function() {
                var tickPositions = [];

                if (this.categories.length > 0) {
                    if (this.categories.length === 1) {
                        this.tickLength = 0;
                        this.tickAmount = 1;
                        return [0];
                    } else if (this.categories.length > 60) {
                        this.tickInterval = 10;
                    } else if (this.categories.length > 35) {
                        this.tickInterval = 7;
                    } else if (this.categories.length > 10) {
                        this.tickInterval = 5;
                    }

                    var catLength = this.categories.length;
                    var stepSize = (catLength - 1) / this.tickInterval;
                    this.tickLength = Math.round(stepSize);
                    var iterator = 0;
                    var arrayLength = 0;
                    while (catLength >= arrayLength) {
                        arrayLength = Math.round(iterator * (stepSize));
                        tickPositions.push(arrayLength);
                        iterator++;
                    }
                    this.tickAmount = tickPositions.length;
                }

                return tickPositions;
            };

            this.chartOptions.xAxis.startOnTick = false;
            this.chartOptions.xAxis.tickmarkPlacement = 'on';
            this.chartOptions.xAxis.endOnTick = false;
            this.chartOptions.xAxis.categories = categories;
            this.chartOptions.xAxis.labels.formatter = function() {
                return moment(this.value, 'MM/DD/YYYY HH:mm').format('MMM DD YYYY');
            };
            this.chartOptions.series[0].zIndex = 1;

            var unitsEl;
            if (this.first) {
                unitsEl = this.first.get('units');
            }

            this.chartOptions.yAxis.title.text = unitsEl ? unitsEl : this.model.get('typeName');

            if (this.modalDisplayName === 'BP') {
                this.chartOptions.series[0].name = 'SBP';
            } else if (this.modalDisplayName === 'WT') {
                this.chartOptions.series[0].name = 'Weight';
            } else {
                this.chartOptions.series[0].name = this.typeName;
            }

            var graphUnits = '';
            if (this.modalDisplayName !== 'BMI' && unitsEl) {
                graphUnits = unitsEl;
            }

            this.chartOptions.tooltip = {
                valueSuffix: ' ' + graphUnits,
                crosshairs: true,
                shared: true,
                style: {
                    padding: 10,
                    zIndex: 9999
                },
                useHTML: true
            };

            if (this.chartOptions.series[2]) {
                this.chartOptions.series[2].data = [];
            }

            if (this.chartOptions.series[1]) {
                this.chartOptions.series[1].data = [];
            }

            if (this.modalDisplayName === 'BP') {
                this.chartOptions.series[1] = {
                    name: 'DBP',
                    data: bpDiatolicData,
                    type: 'line',
                    linkedTo: ':previous',
                    zIndex: 1,
                    showInLegend: false,
                    dataLabels: {
                        enabled: false
                    }
                };

                this.chartOptions.series[2] = {
                    name: 'Ref Range',
                    data: highLow,
                    type: 'arearange',
                    lineWidth: 0,
                    linkedTo: ':previous',
                    color: '#5CB85C',
                    fillOpacity: 0.3,
                    zIndex: 0,
                    showInLegend: false
                };
            } else if (highLow.length > 0) {
                this.chartOptions.series[1] = {
                    name: 'Ref Range',
                    data: highLow,
                    type: 'arearange',
                    lineWidth: 0,
                    linkedTo: ':previous',
                    color: '#5CB85C',
                    fillOpacity: 0.3,
                    zIndex: 0,
                    showInLegend: false
                };
            }
        },
        onDomRefresh: function() {
            this.Chart = new Highcharts.Chart(this.chartOptions);
            this.$el.find('svg').attr('focusable', false);
            this.$el.find('svg').attr('aria-hidden', true);
        },
        events: {
            'mouseover #data-grid-vitals-modalView tbody tr': 'highLightChartPoint',
            'mouseout #data-grid-vitals-modalView tbody tr': 'removeCrosshair'
        },
        removeCrosshair: function() {
            this.Chart.tooltip.shared = true;
            this.Chart.xAxis[0].removePlotLine('plot-line');
        },
        highLightChartPoint: function(e) {
            switch (e.type) {
                case 'mouseover':
                    this.Chart.tooltip.shared = false;
                    this.Chart.xAxis[0].removePlotLine('plot-line');
                    var $this = $(this),
                        $td1 = $this.find('td:eq(0)'),
                        index, points = [];
                    if (this.modalDisplayName !== 'BP') {
                        var result = $this.data('model').get('result') * 1,
                            high = $this.data('model').get('high') * 1,
                            low = $this.data('model').get('low') * 1,
                            date = moment($td1.text()).format('MMM DD YYYY');

                        index = this.Chart.series[0].points.length - $this.data('model').get('index') - 1;
                        $.each(this.Chart.series[0].points, function(i, point) {
                            if (point.y === result && point.category.name === date && i === index) {
                                points.push(point);
                                return false;
                            }
                        });
                        if (!_.isUndefined(this.Chart.series[1])) {
                            $.each(this.Chart.series[1].points, function(i, point) {
                                if (point.high === high && point.low === low && point.category.name === date && i === index) {
                                    points.push(point);
                                    return false;
                                }
                            });
                        }
                    } else {
                        var bpResult = $this.data('model').get('result').split('/'),
                            bpHigh = $this.data('model').get('high').split('/'),
                            bpLow = $this.data('model').get('low').split('/'),
                            bpDate = moment($td1.text()).format('MMM DD YYYY'),
                            bpSystolicResult = parseFloat(bpResult[0]),
                            bpDiatolicResult = parseFloat(bpResult[bpResult.length - 1]),
                            bpHighResult = parseFloat(bpHigh[0]),
                            bpLowResult = parseFloat(bpLow[bpLow.length - 1]);

                        index = this.Chart.series[0].points.length - $this.data('model').get('index') - 1;
                        $.each(this.Chart.series[0].points, function(i, point) {
                            if (point.y === bpSystolicResult && point.category.name === bpDate && i === index) {
                                points.push(point);
                                return false;
                            }
                        });
                        $.each(this.Chart.series[1].points, function(i, point) {
                            if (point.y === bpDiatolicResult && point.category.name === bpDate && i === index) {
                                points.push(point);
                                return false;
                            }
                        });
                        $.each(this.Chart.series[2].points, function(i, point) {
                            if (point.high === bpHighResult && point.low === bpLowResult && point.category.name === bpDate && i === index) {
                                points.push(point);
                                return false;
                            }
                        });
                    }
                    if (points.length > 0) {
                        e.chartY = points[0].plotY - 10;
                        e.chartX = points[0].plotX - 10;
                        points[0].onMouseOver();
                        this.Chart.tooltip.shared = true;
                        this.Chart.tooltip.refresh(points, e);
                        this.Chart.xAxis[0].addPlotLine({
                            value: points[0].x,
                            color: 'gray',
                            width: 0.6,
                            id: 'plot-line'
                        });
                        return false;
                    }
                    break;
                default:
                    this.Chart.tooltip.shared = true;
                    break;
            }
        }
    });

    var TotalView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{totalTests}}'),
        tagName: 'span',
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        }

    });

    var TotalTestModel = Backbone.Model.extend({
        defaults: {
            totalTests: 0
        }
    });

    var ModalView = Backbone.Marionette.LayoutView.extend({
        template: modalTemplate,
        totalTestModel: new TotalTestModel(),
        modelEvents: {
            'change': 'render'
        },
        modelFetchCollectionEvents: {
            'fetch:success': function(collection, resp) {
                this.model.trigger('request');
                this.model.set(_.get(collection.first(), 'attributes'));
                this.model.set('vitalLongName', Util.getVitalLongName(this.model.get('typeName')));
                this.model.trigger('read:success');
                this.fetchCollection();
            },
            'fetch:error': function(collection, resp) {
                this.collection.trigger('fetch:error', collection, resp);
            }
        },
        serializeData: function() {
            var data = this.model.toJSON();
            if (!_.isUndefined(data.displayName)) {
                if (data.displayName.toLowerCase().indexOf('po2') >= 0) {
                    data.normalizedName = 'SpO2';
                } else {
                    data.normalizedName = data.displayName.replace(/\W/g, '_');
                }
            }

            return data;
        },
        collectionEvents: {
            'fetch:success': function(collection, resp) {
                // Special case for BMI where we need to filter out height/weight records
                if(this.fetchName === 'Body Mass Index') {
                    var filteredCollection = collection.where({typeName: 'BMI'});
                    collection.fullCollection.reset(filteredCollection);
                }
                _.each(collection.fullCollection.models, function(element, index) {
                    element.set('index', index);
                });

                if (!_.isEmpty(this.chart)) {
                    this.chart.reset();
                }

                this.gridOptions.collection = collection;
                this.gridOptions.filterDateRangeEnabled = true;
                this.totalTestModel.set('totalTests', collection.fullCollection.length);

                if (!this.chart.hasView()) this.postProcess();
            },
            'fetch:error': function(collection, resp) {
                var errorModel = new Backbone.Model(resp);
                this.leftColumn.show(ADK.Views.Error.create({
                    model: errorModel
                }));
                this.chart.show(ADK.Views.Error.create({
                    model: errorModel
                }));
            }
        },
        setGraphable: function(e) {
            this.graphable = e.length > 0;
        },
        isGraphable: function(e) {
            return this.graphable;
        },
        postProcess: function() {
            var DataGrid = ADK.Views.DataGrid.returnView();
            DataGrid = DataGrid.extend({
                DataGridRow: DataGrid.DataGridRow.extend({
                    serializeModel: function() {
                        var data = this.model.toJSON();
                        return data;
                    }
                })
            });
            this.dataGrid = new DataGrid(this.gridOptions);
            this.paginator.reset();

            if (this.collection.length !== 0) {
                var Chart = ChartView.extend({
                    setGraphable: _.bind(this.setGraphable, this),
                    modalDisplayName: this.modalDisplayName,
                    typeName: this.typeName
                });
                var vitalsChart = new Chart({
                    chartOptions: $.extend(true, {}, _.clone(AppletHelper.chartOptions)),
                    model: this.model,
                    collection: this.collection
                });
                if (this.isGraphable()) {
                    this.$('#lrDataTableView').removeClass('col-md-12').addClass('col-md-5');
                    this.$('#lrGraph').removeClass('hidden');
                    if (!_.isEmpty(this.chart)) {
                        this.chart.show(vitalsChart);
                    }
                } else {
                    this.$('#lrDataTableView').removeClass('col-md-5').addClass('col-md-12');
                    this.$('#lrGraph').addClass('hidden');
                }

                if (!_.isEmpty(this.leftColumn)) {
                    this.leftColumn.show(this.dataGrid);
                }
                var collectionsPageSize = _.get(this.collection, 'state.pageSize', null);
                if (this.collection.fullCollection.length > collectionsPageSize) {
                    this.paginatorView = ADK.Views.Paginator.create({
                        collection: this.gridOptions.collection,
                        windowSize: 4
                    });
                    this.paginator.show(this.paginatorView);
                }
            } else {
                this.$('#lrDataTableView').removeClass('col-md-5').addClass('col-md-12');
                this.$('#lrGraph').addClass('hidden');

                if (!_.isEmpty(this.leftColumn)) {
                    this.leftColumn.show(this.dataGrid);
                }
            }
        },
        initialize: function(options) {
            this.gridOptions = {
                columns: columns,
                appletConfig: {
                    name: 'vitals_modal',
                    id: 'vitals-modalView',
                    simpleGrid: true
                },
                emptyText: 'No Records Found'
            };

            this.fullScreen = options.fullScreen;
            if (_.isUndefined(this.sharedDateRange)) {
                this.resetSharedModalDateRangeOptions();

                if(!this.fullScreen) {
                    var globalDate = ADK.SessionStorage.getModel('globalDate');
                    this.sharedDateRange.set('fromDate', globalDate.get('customFromDate'));
                    this.sharedDateRange.set('toDate', globalDate.get('customToDate'));
                }
            }

            this.collection = new ADK.UIResources.Fetch.Vitals.Collection.PageableCollection({isClientInfinite: false});

            if (!this.model.get('vitalLongName')) {
                this.modelFetchCollection = new ADK.UIResources.Fetch.Vitals.Collection.Collection();
                this.bindEntityEvents(this.modelFetchCollection, this.modelFetchCollectionEvents);
                this.modelFetchCollection.fetchCollection({uid: this.model.get('uid')}, false);
            } else {
                this.fetchCollection();
            }
        },
        fetchCollection: function() {
            this.fetchName = this.model.get('vitalLongName');
            this.typeName = this.fetchName;
            
            if (!_.isUndefined(this.model.get('displayName')) && this.model.get('displayName').indexOf('BP') >= 0) {
                this.modalDisplayName = 'BP';
            } else {
                this.modalDisplayName = this.model.get('displayName');
            }
            this.gridOptions.appletConfig.gridTitle = 'This table represents the selected vitals, ' + this.model.get('vitalLongName');


            if (this.model.get('vitalLongName').indexOf('Blood') >= 0) {
                this.fetchName = 'Blood Pressure';
            }

            this.criteria = {
                pid: this.model.get('pid'),
                filter: this.buildJdsFilter(this.fetchName, this.sharedDateRange.get('fromDate'), this.sharedDateRange.get('toDate'))
            };

            this.collection.fetchCollection(this.criteria, false);
        },
        buildJdsFilter: function(fetchName, fromDate, toDate) {
            var jdsFilter = 'and(ne(result,Pass),';
            if(fetchName === 'Body Mass Index') {
                jdsFilter += 'or(eq(typeName,"HEIGHT"),eq(typeName,"WEIGHT")))';
            } else {
                jdsFilter += 'eq(typeName,"' + fetchName.toUpperCase() + '"))';
            }

            if(_.isString(fromDate) && _.isString(toDate)) {
                var dateFilter = ADK.Applets.BaseGridApplet.prototype.buildJdsDateFilter.call(null, 'observed', {
                    fromDate: fromDate,
                    toDate: toDate,
                    isOverrideGlobalDate: true
                });
                jdsFilter += (', ' + dateFilter);
            }

            return jdsFilter;
        },
        childEvents: {
            'date:range:collection:fetch': function(filterDateRangeView) {
                this.criteria.filter = this.buildJdsFilter(this.fetchName, this.sharedDateRange.get('fromDate'), this.sharedDateRange.get('toDate'));
                this.collection.fetchCollection(this.criteria, false);
                this.leftColumn.show(ADK.Views.Loading.create());
            }
        },
        regions: {
            leftColumn: '.js-backgrid',
            chart: '#jsChart',
            totalTests: '#totalTests',
            dateRangeFilter: '#dateRangeFilter',
            paginator: '.paginator'
        },
        resetSharedModalDateRangeOptions: function() {
            this.sharedDateRange = new DateRangeModel();
        },
        onRender: function() {
            var dateRange;

            if (!_.isEmpty(this.sharedDateRange) &&
                !_.isEmpty(this.sharedDateRange.get('preSelectedDateRange'))) {
                dateRange = this.sharedDateRange.clone();
            } else {
                dateRange = new DateRangeModel();
            }

            var filterDateRangeView = new FilterDateRangeView({
                model: dateRange,
                fullScreen: this.fullScreen
            });
            filterDateRangeView.setSharedDateRange(this.sharedDateRange);

            this.dateRangeFilter.show(filterDateRangeView);
            this.leftColumn.show(ADK.Views.Loading.create());
            
            if (this.isGraphable()) {
                this.chart.show(ADK.Views.Loading.create());
            }

            this.totalTests.show(new TotalView({
                model: this.totalTestModel
            }));
        },
        onDestroy: function() {
            if (this.modelFetchCollection) {
                this.unbindEntityEvents(this.modelFetchCollection, this.modelFetchCollectionEvents);
            }
        }
    });

    return ModalView;

});