define([
    'backbone',
    'marionette',
    'underscore',
    'moment'
], function (Backbone, Marionette, _, Moment) {
    'use strict';

    var UNIMPLEMENTED_ERROR = 'Unimplemented Function: Override createChartLabels to return the highcharts series.data.dataLabel option';

    //noinspection UnnecessaryLocalVariableJS,JSUnusedLocalSymbols
    var AbstractChartData = Backbone.Marionette.Object.extend({
        WARNING_BACKGROUND: '#FD9827',
        WARNING_TEXT: '#000000',
        DANGER_BACKGROUND: '#EB1700',
        DANGER_TEXT: '#ffffff',
        GREEN: '#5CB85C',
        afterInitialize: _.noop,
        initialize: function initialize(options) {
            this.collection = options.collection;
            this.first = this.collection.first() || new Backbone.Model();

            this.chartOptions = _.extend({}, options.chartOptions);
            this.afterInitialize();
        },
        getChartOptions: function getChartOptions() {
            var collection = this.collection.fullCollection;
            var data = this.data = this.getSeriesData(collection);
            var seriesData = data.seriesData;
            var highLow = data.highLow;
            var units = this.first.get('units') || '';

            _.set(this.chartOptions, 'series[0].data', seriesData);
            _.set(this.chartOptions, 'series[0].zIndex', 1);
            _.set(this.chartOptions, 'yAxis.title.text', units);
            _.set(this.chartOptions, 'tooltip', this.getToolTipData(units));
            _.set(this.chartOptions, 'series[1]', this.getSeriesOneData(highLow));
            return this.chartOptions;
        },
        getSeriesOneData: function getSeriesOneDat(highLow) {
            return {
                name: 'Ref Range',
                data: highLow,
                type: 'arearange',
                lineWidth: 0,
                linkedTo: ':previous',
                color: this.GREEN,
                fillOpacity: 0.3,
                zIndex: 0,
                showInLegend: false
            };
        },
        getToolTipData: function getToolTipData(units) {
            return {
                valueSuffix: ' ' + units,
                crosshairs: true,
                shared: true,
                style: {
                    padding: 10,
                    zIndex: 9999
                },
                useHTML: true,
                xDateFormat: '%m/%d/%Y - %H:%M'
            };
        },
        createChartLabels: function createChartLabels(backgroundColor, textColor, code) {
            throw new Error(UNIMPLEMENTED_ERROR);
        },
        getSeriesData: function getSeriesData(collection) {
            var models = collection.models;

            var highLow = [];
            var seriesData = [];
            _.eachRight(models, function (model) {
                var observed = model.get('observed');
                var result = model.get('result');
                var resultValue = Number(result);
                var yAxis = resultValue ? resultValue : null;

                //noinspection JSUnresolvedFunction
                var date = new Moment.utc(observed, 'YYYYMMDDHHmm');
                var xAxis = date.valueOf();
                var flagToolTip = model.get('flagTooltip');
                var hl = this.getHighLow(model);

                var chartData = {
                    y: yAxis,
                    x: xAxis
                };

                var chartLabel;
                if (flagToolTip) {
                    var label = model.get('labelClass');
                    var isWarning = _.contains(label, 'warning');
                    var background = isWarning ? this.WARNING_BACKGROUND : this.DANGER_BACKGROUND;
                    var text = isWarning ? this.WARNING_TEXT : this.DANGER_TEXT;
                    var interpretationCode = model.get('interpretationCode');

                    chartLabel = this.createChartLabels(background, text, interpretationCode);
                } else {
                    chartLabel = {enabled: false};
                }
                _.set(chartData, 'dataLabels', chartLabel);
                hl.unshift(xAxis);
                highLow.push(hl);
                seriesData.push(chartData);
            }, this);

            return {
                seriesData: seriesData,
                highLow: highLow
            };
        },
        getHighLow: function getHighLow(model) {
            var high = null;
            var low = null;
            if (model.has('high')) {
                var strHigh = model.get('high');
                high = Number(strHigh);
            }
            if (model.has('low')) {
                var strLow = model.get('low');
                low = Number(strLow);
            }
            return [high, low];
        }
    });

    var StackGraphChartData = AbstractChartData.extend({
        afterInitialize: function afterInitialize() {
            this.chartOptions.showAxes = false;
            this.chartOptions.xAxis = {
                type: 'datetime',
                labels: {
                    enabled: false
                },
                title: {
                    text: null
                },
                tickLength: 0,
                lineWidth: 0
            };
            this.WARNING_BACKGROUND = '#f0ad4e';
            this.DANGER_BACKGROUND = '#d9534f';
            this.WARNING_TEXT = '#ffffff';
        },
        createChartLabels: function createChartLabels(backgroundColor, textColor, code) {
            return {
                enabled: true,
                useHTML: false,
                backgroundColor: backgroundColor,
                borderRadius: 2.25,
                y: -6,
                padding: 2.5,
                formatter: function () {
                    return code;
                },
                style: {
                    color: textColor,
                    fontSize: '9px'
                }
            };
        }
    });

    var ModalChartData = StackGraphChartData.extend({
        afterInitialize: function afterInitialize() {
            this.chartOptions = _.merge({}, this.chartOptions, {
                chart: {
                    marginRight: 20
                }
            });
            this.getChartOptions();

            var seriesData = this.data.seriesData;
            var uniqueData = this.getUniqueSeriesData(seriesData);
            var tickPosition = _.partial(this.tickPositioner, uniqueData);
            _.set(this.chartOptions, 'xAxis.tickPositioner', tickPosition);
        },
        tickPositioner: function tickPositioner(uniqueData) {
            this.tickInterval = 1;
            if (uniqueData.length === 0) {
                return [];
            }
            if (uniqueData.length > 60) {
                this.tickInterval = 10;
            } else if (uniqueData.length > 35) {
                this.tickInterval = 7;
            } else if (uniqueData.length > 10) {
                this.tickInterval = 5;
            }
            this.tickLength = Math.round((uniqueData.length - 1) / this.tickInterval);
            var tickPositions = [];
            if (uniqueData.length === 1) {
                tickPositions.push(_.get(uniqueData[0], 'x'));
            } else {
                for (var i = 0; i < uniqueData.length; i += this.tickLength) {
                    tickPositions.push(_.get(uniqueData[i], 'x'));
                }
                var last = uniqueData[uniqueData.length - 1];
                tickPositions.push(_.get(last, 'x'));
            }
            this.tickAmount = tickPositions.length;
            return tickPositions;
        },
        createChartLabels: function createChartLabels(backgroundColor, textColor, code) {
            return {
                enabled: true,
                useHTML: false,
                backgroundColor: backgroundColor,
                borderRadius: 5,
                formatter: function () {
                    return code;
                },
                style: {
                    color: textColor,
                    fontSize: '11px',
                    padding: '1.8px 5.4px 2.7px 5.4px'
                }
            };
        },
        getUniqueSeriesData: function getUniqueSeriesData(seriesData) {
            var exists = {};
            return _.filter(seriesData, function (value) {
                var x = value.x;
                var y = value.y;
                var key = x + '-' + y;
                if (_.has(exists, key)) {
                    return false;
                }
                exists[key] = true;
                return true;
            });
        }
    });

    return {
        AbstractChartData: AbstractChartData,
        StackedGraphChartData: StackGraphChartData,
        ModalChartData: ModalChartData,
        UNIMPLEMENTED_ERROR: UNIMPLEMENTED_ERROR
    };
});