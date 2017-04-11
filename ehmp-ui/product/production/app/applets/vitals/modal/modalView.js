define([
    "jquery",
    "jquery.inputmask",
    "backbone",
    "marionette",
    "underscore",
    "highcharts",
    'handlebars',
    'moment',
    'app/applets/vitals/util',
    "app/applets/vitals/appletHelpers",
    "app/applets/vitals/modal/filterDateRangeView",
    "hbs!app/applets/vitals/modal/modalTemplate",
    'hbs!app/applets/vitals/modal/detailsFooterTemplate',
    "app/applets/vitals/modal/modalHeaderView"
], function($,
    InputMask,
    Backbone,
    Marionette,
    _,
    Highcharts,
    Handlebars,
    moment,
    Util,
    AppletHelper,
    FilterDateRangeView,
    modalTemplate,
    detailsFooterTemplate,
    modalHeader
) {
    'use strict';

    var gridOptions = {},
        columns, mockData2, DataGridView, DataGridCollection, chartOptions, Chart, categories, data,
        low, high;
    var TotalTestModel;
    var isGraphable;

    DataGridCollection = Backbone.Collection.extend({});

    columns = [{
        name: "observed",
        label: "Date",
        template: Handlebars.compile('{{formatDate observed}}'),
        cell: "handlebars",
        sortable: false
    }, {
        name: "resultUnitsMetricResultUnits",
        label: "Result",
        template: Handlebars.compile('{{resultUnits}}{{#if metricResult}}<span class="color-grey-darker">({{metricResultUnits}})</span>{{/if}}'),
        cell: "handlebars",
        sortable: false
    }, {
        name: "facilityMoniker",
        label: "Facility",
        template: Handlebars.compile('<span>{{facilityMoniker}}</span>'),
        cell: "handlebars",
        sortable: false
    }];

    gridOptions.columns = columns;
    gridOptions.appletConfig = {
        name: 'vitals_modal',
        id: 'vitals-modalView',
        simpleGrid: true
    };

    var DateRangeModel = Backbone.Model.extend({
        defaults: {
            fromDate: moment().subtract('years', 2).format(ADK.utils.dateUtils.defaultOptions().placeholder),
            toDate: moment().format(ADK.utils.dateUtils.defaultOptions().placeholder)
        }
    });

    var sharedDateRange;

    function parseModel(response) {
        response = Util.getObservedFormatted(response);
        response = Util.getFacilityColor(response);
        response = Util.getResultedFormatted(response);
        response = Util.getDisplayName(response);
        response = Util.getTypeName(response);
        response = Util.getNumericDate(response);
        response = Util.getResultUnits(response);
        response = Util.getMetricResultUnits(response);
        response = Util.getResultUnitsMetricResultUnits(response);
        response = Util.getReferenceRange(response);
        response = Util.getFormattedHeight(response);
        response = Util.getFormattedWeight(response);
        ADK.Enrichment.addFacilityMoniker(response);
        return response;
    }

    var ChartView = Backbone.Marionette.ItemView.extend({
        template: '<div></div>',
        id: 'chart-container',
        initialize: function(options) {
            var self = this;
            this.first = this.collection.first();
            this.chartOptions = _.clone(options.chartOptions, {
                deep: true
            });
            this.fullCollection = this.collection.clone();

            low = this.fullCollection.pluck('low');
            high = this.fullCollection.pluck('high');

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
                    if (num !== undefined && num !== null) {
                        bpSplitData = num.split("/");
                        return parseFloat(bpSplitData[bpSplitData.length - 1]);
                    } else {
                        return undefined;
                    }
                });

                high = _.map(high, function(num) {
                    if (num !== undefined && num !== null) {
                        bpSplitData = num.split("/");
                        return parseFloat(bpSplitData[0]);
                    } else {
                        return undefined;
                    }
                });
            }

            categories = this.fullCollection.pluck('observed');

            categories = _.map(categories, function(num) {
                return AppletHelper.getDateForChart(num);
            });

            categories.reverse();

            data = this.fullCollection.pluck('result');
            var units = [];
            units = this.fullCollection.pluck('units');
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
                    if (data[i] !== undefined) {
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

                    if (this.modalDisplayName == 'BP') {
                        var bpDataNumber = parseFloat(bpDiatolicData[i]);
                        if (bpDataNumber !== undefined && !isNaN(bpDataNumber) &&
                            dataNumber !== undefined && !isNaN(dataNumber)) {
                            if (low[i] !== undefined && high[i] !== undefined && !isNaN(low[i]) && !isNaN(high[i])) {
                                highLow.push([low[i], high[i]]);
                            } else {
                                highLow.push([null, null]);
                            }
                        } else {
                            highLow.push([null, null]);
                        }
                    } else {
                        if (dataNumber !== undefined && !isNaN(dataNumber)) {
                            if (low[i] !== undefined && high[i] !== undefined && !isNaN(low[i]) && !isNaN(high[i])) {
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
                if (dataNumber !== undefined && !isNaN(dataNumber) && dataNumber !== null) {
                    onlyNumData.push(dataNumber);
                }
            });
            //If there is chartable data show the chart
            if (this.modalDisplayName !== 'BP') {
                this.setisGraphable(onlyNumData);
            } else {
                this.setisGraphable(bpSystolicData);
            }

            this.chartOptions.series[0].data = [];

            if (this.modalDisplayName !== 'BP') {
                _.forEach(data, function(e, i) {
                    self.chartOptions.series[0].data.push({
                        y: data[i],
                        dataLabels: {
                            enabled: false
                        }
                    });
                });
            } else {
                _.forEach(bpSystolicData, function(e, i) {
                    self.chartOptions.series[0].data.push({
                        y: bpSystolicData[i],
                        dataLabels: {
                            enabled: false
                        }
                    });
                });
            }

            this.chartOptions.xAxis.tickPositioner = function() {
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
                this.tickLength = Math.round((this.categories.length - 1) / this.tickInterval);
                var tickPositions = [];
                var iterator = 0;
                while (this.categories.length >= Math.round(iterator * ((this.categories.length - 1) / this.tickInterval))) {
                    tickPositions.push(Math.round(iterator * ((this.categories.length - 1) / this.tickInterval)));
                    iterator++;
                }
                this.tickAmount = tickPositions.length;
                return tickPositions;
            };

            this.chartOptions.xAxis.startOnTick = false;
            this.chartOptions.xAxis.tickmarkPlacement = 'on';
            this.chartOptions.xAxis.endOnTick = false;
            this.chartOptions.xAxis.categories = categories;
            this.chartOptions.series[0].zIndex = 1;
            this.chartOptions.yAxis.title.text = this.first.get('units');
            if (this.modalDisplayName == 'BP') {
                this.chartOptions.series[0].name = 'SBP';
            } else if (this.modalDisplayName == 'WT') {
                this.chartOptions.series[0].name = 'Weight';
            } else {
                this.chartOptions.series[0].name = this.typeName;
            }

            var graphUnits = [];
            if (this.modalDisplayName !== 'BMI') {
                graphUnits = this.first.get('units');
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

            if (this.modalDisplayName == 'BP') {
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
            Chart = new Highcharts.Chart(this.chartOptions);
            this.$el.find('svg').attr('focusable', false);
            this.$el.find('svg').attr('aria-hidden', true);
        },
        events: {
            'mouseover #data-grid-vitals-modalView tbody tr': 'highLightChartPoint',
            'mouseout #data-grid-vitals-modalView tbody tr': 'removeCrosshair'
        },
        onBeforeDestroy: function() {
            $('body').off('.modalChart');
        },
        removeCrosshair: function() {
            Chart.tooltip.shared = true;
            Chart.xAxis[0].removePlotLine('plot-line');
        },
        highLightChartPoint: function(e) {
            switch (e.type) {
                case 'mouseover':
                    Chart.tooltip.shared = false;
                    Chart.xAxis[0].removePlotLine('plot-line');
                    var $this = $(this),
                        $td3 = $this.find('td:eq(1)'),
                        $td1 = $this.find('td:eq(0)'),
                        index, points = [];
                    if (this.modalDisplayName !== 'BP') {
                        var result = $this.data('model').get('result') * 1,
                            high = $this.data('model').get('high') * 1,
                            low = $this.data('model').get('low') * 1,
                            date = moment($td1.text()).format("MMM DD YYYY");
                        index = Chart.series[0].points.length - $this.data('model').get('index') - 1;
                        $.each(Chart.series[0].points, function(i, point) {
                            if (point.y === result && point.category.name === date && i === index) {
                                points.push(point);
                                return false;
                            }
                        });
                        if (!_.isUndefined(Chart.series[1])) {
                            $.each(Chart.series[1].points, function(i, point) {
                                if (point.high === high && point.low === low && point.category.name === date && i === index) {
                                    points.push(point);
                                    return false;
                                }
                            });
                        }
                    } else {
                        var splitData = $td3.text().split('/'),
                            bpResult = $this.data('model').get('result').split('/'),
                            bpHigh = $this.data('model').get('high').split('/'),
                            bpLow = $this.data('model').get('low').split('/'),
                            bpDate = moment($td1.text()).format("MMM DD YYYY"),
                            bpSystolicResult = parseFloat(bpResult[0]),
                            bpDiatolicResult = parseFloat(bpResult[bpResult.length - 1]),
                            bpHighResult = parseFloat(bpHigh[0]),
                            bpLowResult = parseFloat(bpLow[bpLow.length - 1]);

                        index = Chart.series[0].points.length - $this.data('model').get('index') - 1;
                        $.each(Chart.series[0].points, function(i, point) {
                            if (point.y === bpSystolicResult && point.category.name === bpDate && i === index) {
                                points.push(point);
                                return false;
                            }
                        });
                        $.each(Chart.series[1].points, function(i, point) {
                            if (point.y === bpDiatolicResult && point.category.name === bpDate && i === index) {
                                points.push(point);
                                return false;
                            }
                        });
                        $.each(Chart.series[2].points, function(i, point) {
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
                        Chart.tooltip.shared = true;
                        Chart.tooltip.refresh(points, e);
                        Chart.xAxis[0].addPlotLine({
                            value: points[0].x,
                            color: 'gray',
                            width: 0.6,
                            id: 'plot-line'
                        });
                        return false;
                    }
                    break;
                default:
                    Chart.tooltip.shared = true;
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

    TotalTestModel = Backbone.Model.extend({
        defaults: {
            totalTests: 0
        }
    });

    var totalTestModel = new TotalTestModel();


    var ModalView = Backbone.Marionette.LayoutView.extend({
        template: modalTemplate,
        fetchOptions: {},
        totalTestModel: new TotalTestModel(),
        modelEvents: {
            'change': 'render'
        },
        modelFetchCollectionEvents: {
            'fetch:success': function(collection, resp) {
                this.model.set(_.get(collection.first(), 'attributes'));
            },
            'fetch:error': function(colleciton, resp) {
                this.collection.trigger('fetch:error', collection, resp);
            }
        },
        collectionEvents: {
            'fetch:success': function(collection, resp) {
                var self = this;

                self.$el.find('.vitals-next, .vitals-prev').attr('disabled', false);

                _.each(collection.fullCollection.models, function(element, index, list) {
                    element.set('index', index);
                });

                if (self.showNavHeader) {
                    self.model.attributes.navHeader = true;
                }

                if (self.showNavHeader) {
                    self.model.attributes.navHeader = true;
                }

                if (self.chart !== undefined && self.chart !== null) {
                    self.chart.reset();
                }

                this.gridOptions.collection = collection;
                this.gridOptions.filterDateRangeEnabled = true;

                this.totalTestModel.set({
                    totalTests: this.gridOptions.collection.fullCollection.length
                });

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
        setisGraphable: function(e) {
            this.isGraphable = e.length > 0;
        },
        getisGraphable: function(e) {
            return this.isGraphable;
        },
        postProcess: function() {
            var collection = this.collection;
            var self = this;

            if (collection.length !== 0) {
                var Chart = ChartView.extend({
                    setisGraphable: _.bind(this.setisGraphable, this),
                    modalDisplayName: this.modalDisplayName,
                    typeName: this.typeName,
                });
                var vitalsChart = new Chart({
                    chartOptions: $.extend(true, {}, _.clone(AppletHelper.chartOptions)),
                    model: self.model,
                    data: data,
                    collection: collection,
                });
                if (this.getisGraphable()) {
                    self.$('#lrDataTableView').removeClass('col-md-12').addClass('col-md-5');
                    self.$('#lrGraph').removeClass('hidden');
                    if (self.chart !== undefined && self.chart !== null) {
                        self.chart.show(vitalsChart);
                    }
                } else {
                    self.$('#lrDataTableView').removeClass('col-md-5').addClass('col-md-12');
                    self.$('#lrGraph').addClass('hidden');
                }

                self.dataGrid = ADK.Views.DataGrid.create(this.gridOptions);

                if (self.leftColumn !== undefined && self.leftColumn !== null) {
                    self.leftColumn.reset();
                    self.leftColumn.show(self.dataGrid);
                }
                var collectionsPageSize = _.get(collection, 'state.pageSize', null);
                if (collection.fullCollection.length <= collectionsPageSize) {
                    self.$('.js-backgrid').append('<div class="backgrid-paginator"></div>');
                } else {
                    self.paginatorView = ADK.Views.Paginator.create({
                        collection: this.gridOptions.collection,
                        windowSize: 4
                    });
                    self.$('.js-backgrid').append(self.paginatorView.render().el);
                }
            } else {
                self.$('#lrDataTableView').removeClass('col-md-5').addClass('col-md-12');
                self.$('#lrGraph').addClass('hidden');
                self.dataGrid = ADK.Views.DataGrid.create(this.gridOptions);

                if (self.leftColumn !== undefined && self.leftColumn !== null) {
                    self.leftColumn.show(self.dataGrid);
                }
                //this should just be set on gridOptions.emptyText and shouldn't
                //need to do any DOM manipulation for this
                $('#data-grid-vitals-modalView').find('tbody').append($('<tr><td>No Records Found</td></tr>'));
            }
        },
        initialize: function(options) {
            // Fetch patientrecord data from RDK
            this.dataCollection = options.gridCollection;
            this.fullScreen = options.fullScreen;
            this.instanceId = options.instanceId;
            this.getModals();
            this.gridOptions = _.clone(gridOptions);

            if (this.showNavHeader) {
                this.model.attributes.navHeader = true;
            }

            this.fetchOptions.resourceTitle = "patient-record-vital";

            this.fetchOptions.collectionConfig = {
                collectionParse: _.bind(this.filterCollection, this)
            };

            this.fetchOptions.pageable = true;

            if (!this.collection) this.collection = ADK.PatientRecordService.createEmptyCollection(this.fetchOptions);
        },
        prepareData: function() {
            if (!this.model.get('typeName')) {
                var fetchOptions = {
                    criteria: {
                        "uid": this.model.get('uid')
                    },
                    patient: ADK.PatientRecordService.getCurrentPatient(),
                    resourceTitle: 'patient-record-vital'
                };
                this.modelFetchCollection = ADK.PatientRecordService.createEmptyCollection(fetchOptions);
                this.bindEntityEvents(this.modelFetchCollection, this.modelFetchCollectionEvents);
                ADK.PatientRecordService.fetchCollection(fetchOptions, this.modelFetchCollection);
                return;
            }

            var vitalsTitle;
            if (this.model.get('typeName') === 'Blood Pressure Systolic' || this.model.get('typeName') === 'Blood Pressure Diastolic') {
                vitalsTitle = 'Blood Pressure';
            } else {
                vitalsTitle = this.model.get('typeName');
            }
            this.modalTitle = vitalsTitle;
            this.fetchName = this.model.get('typeName');

            this.typeName = this.fetchName;
            this.model.set('modalTitleName', Util.getVitalLongName(this.typeName), {
                silent: true
            });
            if (!_.isUndefined(this.model.get('displayName')) && this.model.get('displayName').indexOf("BP") >= 0) {
                this.modalDisplayName = 'BP';
            } else {
                this.modalDisplayName = this.model.get('displayName');
            }
            this.gridOptions.appletConfig.gridTitle = 'This table represents the selected vitals, ' + this.model.get('modalTitleName');


            if (this.model.get('typeName').indexOf("Blood") >= 0) this.fetchName = 'Blood Pressure';
            this.fetchOptions.criteria = {
                typeName: this.fetchName,
                pid: this.model.attributes.pid,
                filter: 'ne(result,Pass)',
            };

            var dateRange;

            if (sharedDateRange === undefined || sharedDateRange === null) {
                this.resetSharedModalDateRangeOptions();
            }

            if (sharedDateRange !== undefined && sharedDateRange !== null &&
                sharedDateRange.get('preSelectedDateRange') !== undefined &&
                sharedDateRange.get('preSelectedDateRange') !== null) {
                dateRange = sharedDateRange.clone();
            } else {
                dateRange = new DateRangeModel();
            }

            new DateRangeModel();
            var filterDateRangeView = new FilterDateRangeView({
                model: dateRange,
                collection: this.collection,
                parentView: this,
                fullScreen: this.fullScreen
            });
            filterDateRangeView.setFetchOptions(this.fetchOptions);
            filterDateRangeView.setSharedDateRange(sharedDateRange);

            this.dateRangeFilter.show(filterDateRangeView);

            this.leftColumn.show(ADK.Views.Loading.create());

            if (this.getisGraphable()) {
                this.chart.show(ADK.Views.Loading.create());
            }

            this.totalTests.show(new TotalView({
                model: this.totalTestModel
            }));

            ADK.PatientRecordService.fetchCollection(this.fetchOptions, this.collection);
        },
        events: {
            'click .vitals-next': 'getNextModal',
            'click .vitals-prev': 'getPrevModal',
            'shown.modal-body': function() {
                var Chart = ChartView.extend({
                    setisGraphable: _.bind(this.setisGraphable, this),
                    modalDisplayName: this.modalDisplayName,
                    typeName: this.typeName,
                });
                var vitalsChart = new Chart({
                    chartOptions: $.extend(true, {}, _.clone(AppletHelper.chartOptions)),
                    model: this.model,
                    data: data,
                    collection: this.collection,
                });
                this.chart.show(vitalsChart);
            }
        },
        onAttach: function() {
            this.checkIfModalIsEnd();
        },
        checkIfModalIsEnd: function() {
            var next = _.indexOf(this.modals, this.model) + 1;
            if (next >= this.modals.length) {
                this.$el.closest('.modal').find('#vitalsNext').attr('disabled', true);
            }

            next = _.indexOf(this.modals, this.model) - 1;
            if (next < 0) {
                this.$el.closest('.modal').find('#vitalsPrevious').attr('disabled', true);
            }
        },
        getNextModal: function() {
            var next = _.indexOf(this.modals, this.model) + 1;
            var model = this.modals[next];
            this.setNextPrevModal(model);
        },
        getPrevModal: function() {
            var next = _.indexOf(this.modals, this.model) - 1;
            var model = this.modals[next];
            this.setNextPrevModal(model);
        },
        setNextPrevModal: function(model) {
            if (this.showNavHeader) {
                model.attributes.navHeader = true;
            }
            if (model.get('inAPanel')) {
                var tr = $('#data-grid-' + this.instanceId + ' > tbody>tr.selectable').eq(model.get('parentIndex'));
                if (!tr.data('isOpen')) {
                    tr.trigger('click');
                }
                $('#data-grid-' + this.instanceId + ' > tbody>tr.selectable').not(tr).each(function() {
                    var $this = $(this);
                    if ($this.data('isOpen')) {
                        $this.trigger('click');
                    }
                });
            }

            var siteCode = ADK.UserService.getUserSession().get('site'),
                pidSiteCode = model.get('pid') ? model.get('pid').split(';')[0] : '';

            var view = new ModalView({
                model: model,
                gridCollection: this.dataCollection,
                navHeader: this.showNavHeader,
                fullScreen: this.fullScreen
            });
            var modalOptions = {
                'title': model.get('typeName'),
                'size': 'xlarge',
                'headerView': modalHeader.extend({
                    model: model,
                    theView: view
                }),
                'footerView': Backbone.Marionette.ItemView.extend({
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
                        var vitalEnteredInErrorChannel = ADK.Messaging.getChannel('vitalsEiE');
                        vitalEnteredInErrorChannel.trigger('vitalsEiE:clicked', event, {
                            'collection': this.dataCollection.models,
                            'title': model.attributes.observedFormatted,
                            'checked': model.attributes.localId
                        });
                    }
                }),
                'regionName': 'vitalsDetailsDialog',
                'replaceContents': true
            };
            var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions
            });
            modal.show();
            modal.$el.closest('.modal').focus();
        },
        getModals: function() {
            this.modals = [];
            if (this.dataCollection !== undefined) {
                _.each(this.dataCollection.models, function(m, key) {

                    if (m.get('vitals')) {
                        var outterIndex = this.dataCollection.indexOf(m);
                        _.each(m.get('vitals').models, function(m2, key) {
                            m2.set({
                                'inAPanel': true,
                                'parentIndex': outterIndex,
                                'parentModel': m
                            });
                            this.modals.push(m2);

                        });
                    } else {
                        this.modals.push(m);
                    }
                }, this);
            }
        },

        regions: {
            leftColumn: '.js-backgrid',
            chart: '#jsChart',
            totalTests: '#totalTests',
            dateRangeFilter: '#dateRangeFilter'
        },
        resetSharedModalDateRangeOptions: function() {
            sharedDateRange = new DateRangeModel();
        },
        onRender: function() {
            if (_.isFunction(_.get(this, 'collection.isEmpty')) && this.collection.isEmpty())
                this.prepareData();
        },
        onDestroy: function() {
            if (this.modelFetchCollection) {
                this.unbindEntityEvents(this.modelFetchCollection, this.modelFetchCollectionEvents);
            }
        },
        filterCollection: function(coll) {
            coll.models.forEach(function(model) {
                model.attributes = parseModel(model.attributes);
            });

            var resultColl = [];
            var allTypes = $.unique(coll.pluck('displayName'));
            var knownTypes = ['BP', 'P', 'R', 'T', 'PO2', 'PN', 'WT', 'HT', 'BMI', 'CG'];
            var displayTypes = knownTypes.filter(function(el) {
                return allTypes.indexOf(el) != -1;
            });

            var newColl = new Backbone.Collection(coll.where({
                displayName: this.modalDisplayName
            }));

            var toDateMoment = moment(sharedDateRange.attributes.toDate).format("YYYYMMDD");
            var fromDateMoment = moment(sharedDateRange.attributes.fromDate).format("YYYYMMDD");

            newColl.each(function(column) {
                if (column.attributes.numericDate <= toDateMoment && (column.attributes.numericDate >= fromDateMoment || sharedDateRange.attributes.fromDate === null)) {
                    resultColl.push(column);
                }
            });

            return resultColl;
        }
    });

    return ModalView;

});
