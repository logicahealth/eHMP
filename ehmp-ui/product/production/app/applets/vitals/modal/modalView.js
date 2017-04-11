define([
    "jquery",
    "jquery.inputmask",
    "backbone",
    "marionette",
    "underscore",
    "highcharts",
    'handlebars',
    'app/applets/vitals/util',
    "app/applets/vitals/appletHelpers",
    "hbs!app/applets/vitals/list/dateTemplate",
    "app/applets/vitals/modal/filterDateRangeView",
    'hbs!app/applets/vitals/list/resultTemplate',
    "hbs!app/applets/vitals/modal/modalTemplate",
    'hbs!app/applets/vitals/modal/detailsFooterTemplate',
    "app/applets/vitals/modal/modalHeaderView"
], function($, InputMask, Backbone, Marionette, _, Highcharts, Handlebars, Util, AppletHelper, dateTemplate, FilterDateRangeView, resultTemplate, modalTemplate, detailsFooterTemplate, modalHeader) {
    'use strict';

    var currentModel, currentCollection, gridOptions = {},
        columns, mockData2, DataGridView, DataGridCollection, chartOptions, Chart, categories, data, fetchCollection = {},
        low, high;
    var TotalTestModel;
    var trsForShowingModal = [],
        modals = [],
        panelModals = [],
        modalDisplayName, isGraphable, typeName,
        dataCollection;

    DataGridCollection = Backbone.Collection.extend({});

    columns = [{
        name: "observed",
        label: "Date",
        template: dateTemplate,
        cell: "handlebars",
        sortable: false
    }, {
        name: "resultUnitsMetricResultUnits",
        label: "Result",
        template: resultTemplate,
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

    function setisGraphable(e) {
        isGraphable = e.length > 0;
    }

    function getisGraphable(e) {
        return isGraphable;
    }

    var ChartView = Backbone.Marionette.ItemView.extend({
        template: '<div></div>',
        id: 'chart-container',
        initialize: function(options) {
            var self = this;
            this.collection = options.collection;
            this.first = this.collection.first();
            this.chartOptions = $.extend(true, {}, options.chartOptions);
            this.fullCollection = this.collection.fullCollection;

            low = this.fullCollection.pluck('low');
            high = this.fullCollection.pluck('high');

            if (modalDisplayName !== 'BP') {
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
                if (modalDisplayName !== 'BP') {
                    if (_.isNaN(data[i] * 1)) {
                        cleanData.push(null);
                    } else {
                        if (modalDisplayName === 'PN' && e === '99') {
                            cleanData.push(null);
                        } else if (modalDisplayName !== 'HT') {
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
            });

            var highLow = [];

            //Parsing out bad data
            if (modalDisplayName !== 'WT' && modalDisplayName !== 'HT' && modalDisplayName !== 'PN' && modalDisplayName !== 'BMI') {
                _.each(cleanData, function(e, i) {
                    var dataNumber = parseFloat(cleanData[i]);

                    if (modalDisplayName == 'BP') {
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
                });
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
            if (modalDisplayName !== 'BP') {
                setisGraphable(onlyNumData);
            } else {
                setisGraphable(bpSystolicData);
            }

            this.chartOptions.series[0].data = [];

            if (modalDisplayName !== 'BP') {
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
            if (modalDisplayName == 'BP') {
                this.chartOptions.series[0].name = 'SBP';
            } else if (modalDisplayName == 'WT') {
                this.chartOptions.series[0].name = 'Weight';
            } else {
                this.chartOptions.series[0].name = typeName;
            }

            var graphUnits = [];
            if (modalDisplayName !== 'BMI') {
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

            if (modalDisplayName == 'BP') {
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
        onShow: function() {
            Chart = new Highcharts.Chart(this.chartOptions);
            this.$el.find('svg').attr('focusable', false);
            this.$el.find('svg').attr('aria-hidden', true);

            var $tableView = this.$('#lrDataTableView');
            $tableView.on('mouseover', '#data-grid-vitals-modalView tbody tr', this.highLightChartPoint);
            $tableView.on('mouseout', '#data-grid-vitals-modalView tbody tr', this.removeCrosshair);
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
                    if (modalDisplayName !== 'BP') {
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
        initialize: function(options) {
            // Fetch patientrecord data from RDK
            this.loadingView = ADK.Views.Loading.create();
            this.loadingView2 = ADK.Views.Loading.create();
            dataCollection = options.gridCollection;
            this.fullScreen = options.fullScreen;
            this.instanceId = options.instanceId;
            this.getModals();

            if (this.showNavHeader) {
                this.model.attributes.navHeader = true;
            }

            this.fetchOptions.resourceTitle = "patient-record-vital";
            var fetchName = this.model.attributes.typeName;
            if (this.model.attributes.typeName.indexOf("Blood") >= 0) fetchName = 'Blood Pressure';
            this.fetchOptions.criteria = {
                typeName: fetchName,
                pid: this.model.attributes.pid,
                filter: 'ne(result,Pass)'
            };

            typeName = fetchName;
            this.model.attributes.modalTitleName = Util.getVitalLongName(typeName);
            if (!_.isUndefined(this.model.get('displayName')) && this.model.get('displayName').indexOf("BP") >= 0) {
                modalDisplayName = 'BP';
            } else {
                modalDisplayName = this.model.get('displayName');
            }

            var self = this;

            this.fetchOptions.collectionConfig = {
                collectionParse: self.filterCollection
            };

            this.fetchOptions.pageable = true;

            gridOptions.appletConfig.gridTitle = 'This table represents the selected vitals, ' + this.model.attributes.modalTitleName;

            this.fetchOptions.onSuccess = function(collection, response) {
                self.collection = collection;
                self.$el.find('.vitals-next, .vitals-prev').attr('disabled', false);

                _.each(self.collection.fullCollection.models, function(element, index, list) {
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

                if (collection.length !== 0) {
                    var vitalsChart = new ChartView({
                        chartOptions: $.extend(true, {}, AppletHelper.chartOptions),
                        model: self.model,
                        data: data,
                        collection: self.collection
                    });
                    if (getisGraphable()) {
                        self.$('#lrDataTableView').removeClass('col-md-12').addClass('col-md-5');
                        self.$('#lrGraph').removeClass('hidden');
                        if (self.chart !== undefined && self.chart !== null) {
                            self.chart.show(vitalsChart);
                        }
                    } else {
                        self.$('#lrDataTableView').removeClass('col-md-5').addClass('col-md-12');
                        self.$('#lrGraph').addClass('hidden');
                    }
                } else {
                    self.$('#lrDataTableView').removeClass('col-md-5').addClass('col-md-12');
                    self.$('#lrGraph').addClass('hidden');
                }

                gridOptions.collection = self.collection;
                gridOptions.filterDateRangeEnabled = true;

                currentModel = options.model;
                self.model = options.model;
                currentCollection = options.collection;

                totalTestModel.set({
                    totalTests: gridOptions.collection.fullCollection.length
                });

                self.dataGrid = ADK.Views.DataGrid.create(gridOptions);

                if (self.leftColumn !== undefined && self.leftColumn !== null) {
                    self.leftColumn.reset();
                    self.leftColumn.show(self.dataGrid);
                }

                gridOptions.collection = self.collection;
                if (collection.length !== 0) {

                    self.paginatorView = ADK.Views.Paginator.create({
                        collection: gridOptions.collection,
                        windowSize: 4
                    });
                    self.$('.js-backgrid').append(self.paginatorView.render().el);
                } else {
                    //this should just be set on gridOptions.emptyText and shouldn't 
                    //need to do any DOM manipulation for this
                    $('#data-grid-vitals-modalView').find('tbody').append($('<tr><td>No Records Found</td></tr>'));
                }
            };

            this.fetchOptions.onError = function(resp) {
              var errorModel = new Backbone.Model(resp);
              self.leftColumn.show(ADK.Views.Error.create({
                model: errorModel
              }));
              self.chart.show(ADK.Views.Error.create({
                model: errorModel
              }));
            };
        },
        events: {
            'click .vitals-next': 'getNextModal',
            'click .vitals-prev': 'getPrevModal'
        },
        getNextModal: function(id) {
            var next = _.indexOf(modals, this.model) + 1;
            if (next >= modals.length) {
                next = 0;
            }
            var model = modals[next];
            this.setNextPrevModal(model, id);
        },
        getPrevModal: function(id) {
            var next = _.indexOf(modals, this.model) - 1;
            if (next < 0) {
                next = modals.length - 1;
            }
            var model = modals[next];

            this.setNextPrevModal(model, id);
        },
        setNextPrevModal: function(model, id) {

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
                gridCollection: dataCollection,
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
                            'collection': dataCollection.models,
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
            modal.$el.closest('.modal').find('#' + id).focus();
        },
        getModals: function() {
            modals = [];
            panelModals = [];
            if (dataCollection !== undefined) {
                _.each(dataCollection.models, function(m, key) {

                    if (m.get('vitals')) {
                        var outterIndex = dataCollection.indexOf(m);
                        _.each(m.get('vitals').models, function(m2, key) {
                            m2.set({
                                'inAPanel': true,
                                'parentIndex': outterIndex,
                                'parentModel': m
                            });
                            modals.push(m2);

                        });
                    } else {
                        modals.push(m);
                    }
                });
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
                parentView: this,
                fullScreen: this.fullScreen
            });
            filterDateRangeView.setFetchOptions(this.fetchOptions);
            filterDateRangeView.setSharedDateRange(sharedDateRange);

            this.dateRangeFilter.show(filterDateRangeView);

            this.leftColumn.show(this.loadingView);
            if (getisGraphable()) {
                this.chart.show(this.loadingView2);
            }

            this.totalTests.show(new TotalView({
                model: totalTestModel
            }));

            self.collection = ADK.PatientRecordService.fetchCollection(this.fetchOptions);
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
                displayName: modalDisplayName
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
