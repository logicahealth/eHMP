/* global JSON */
define([
    'underscore',
    'backbone',
    'marionette',
    'jasminejquery',
    'app/applets/lab_results_grid/modal/chartData'
], function(_, Backbone, Marionette, jasminejquery, ChartData) {
    'use strict';

    describe('Numeric Labs Chart Data Creation', function() {
        var options;

        beforeEach(function () {
            var collection = new Backbone.Collection();
            var model = new Backbone.Model({flagTooltip: true});
            var chartOptions = {};


            collection.fullCollection = collection;
            collection.add(model);

            options = {
                collection: collection,
                chartOptions: chartOptions
            };
        });

        describe('Abstract Chart Data Object', function () {
            var Chart = ChartData.AbstractChartData;
            var chart;

            beforeEach(function() {
                chart = new Chart(options);
            });

            describe('getChartOptions', function() {
                it('throws an error when getChartOptions is called', function() {
                    var hasError = false;
                    try {
                        chart.getChartOptions();
                    } catch (e) {
                        hasError = true;
                        expect(e.message).toBe(ChartData.UNIMPLEMENTED_ERROR);
                    }

                    expect(hasError).toBe(true);
                });
            });

            describe('getSeriesOneData', function() {
               it('correctly creates a series object', function() {
                   var highLow = [1, 2, 3];
                   var expected = {
                       name: 'Ref Range',
                       data: highLow,
                       type: 'arearange',
                       lineWidth: 0,
                       linkedTo: ':previous',
                       color: chart.GREEN,
                       fillOpacity: 0.3,
                       zIndex: 0,
                       showInLegend: false
                   };
                   var output = chart.getSeriesOneData(highLow);

                   expect(output).toEqual(expected);
               });
            });

            describe('getToolTipData', function() {
                it('correctly assigns the toolTip data', function() {
                    var units = 'Planck';
                    var expected = {
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

                    var output = chart.getToolTipData(units);
                    expect(output).toEqual(expected);
                });
            });

            describe('createChartLabels', function() {
                it('throws an error when createChartLabel is called', function() {
                    var hasError = false;
                    try {
                        chart.createChartLabels();
                    } catch (e) {
                        hasError = true;
                        expect(e.message).toEqual(ChartData.UNIMPLEMENTED_ERROR);
                    }

                    expect(hasError).toBe(true);
                });
            });

            describe('getSeriesData', function() {
                it('throws an error when getSeriesData is called', function() {
                    var hasError = false;
                    try {
                        chart.getSeriesData(chart.collection);
                    } catch (e) {
                        hasError = true;
                        expect(e.message).toEqual(ChartData.UNIMPLEMENTED_ERROR);
                    }

                    expect(hasError).toBe(true);
                });
            });

            describe('getHighLow', function() {
                it('correctly generates highLow array when high and low are present', function() {
                    var model = new Backbone.Model({
                        high: 2,
                        low: 1
                    });
                    var expected = [2, 1];
                    var output = chart.getHighLow(model);

                    expect(output).toEqual(expected);
                });

                it('correctly generates highLow array when just high is present', function() {
                    var model = new Backbone.Model({
                        high: 2
                    });
                    var expected = [2, null];
                    var output = chart.getHighLow(model);

                    expect(output).toEqual(expected);
                });

                it('correctly generates highLow array when just low is present', function() {
                    var model = new Backbone.Model({
                        low: 1
                    });
                    var expected = [null, 1];
                    var output = chart.getHighLow(model);

                    expect(output).toEqual(expected);
                });

                it('correctly generates highLow array when neither high or low are present', function() {
                    var model = new Backbone.Model({});
                    var expected = [null, null];
                    var output = chart.getHighLow(model);

                    expect(output).toEqual(expected);
                });
            });
        });

        describe('StackedGraphChart Data', function() {
            var Chart = ChartData.StackedGraphChartData;
            var chart;

            beforeEach(function() {
                chart = new Chart(options);
            });

            describe('createChartLabels', function() {
                it('overwrote getChartOptions to no longer throw an error', function() {
                    var hasError = false;
                    try {
                        chart.createChartLabels();
                    } catch (e) {
                        hasError = true;
                    }

                    expect(hasError).toBe(false);
                });

                it('correctly creates labels for stacked graphs', function() {
                    var background = 'red';
                    var text = 'blue';
                    var code = 'TEST';
                    var expected = {
                        enabled: true,
                        useHTML: false,
                        backgroundColor: background,
                        borderRadius: 2.25,
                        y: -6,
                        padding: 2.5,
                        formatter: function () {
                            return code;
                        },
                        style: {
                            color: text,
                            fontSize: '9px'
                        }
                    };
                    var output = chart.createChartLabels(background, text, code);
                    var codeOut = output.formatter();

                    // The function inside makes the non string comparisons fail
                    expect(JSON.stringify(output)).toEqual(JSON.stringify(expected));
                    expect(codeOut).toBe(code);
                });
            });

            describe('afterInitialize', function() {
                it('modifies the chart object to fit stacked graphs', function() {
                    var shouldShowAxes = false;
                    var xAxis = {
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

                    expect(chart.chartOptions.showAxes).toBe(shouldShowAxes);
                    expect(chart.chartOptions.xAxis).toEqual(xAxis);
                });
            });
        });

        describe('ModalView Data', function() {
            var Chart = ChartData.ModalChartData;
            var chart;

            beforeEach(function() {
                chart = new Chart(options);
            });

            describe('createChartLabels', function() {
                it('overwrote getChartOptions to no longer throw an error', function() {
                    var hasError = false;
                    try {
                        chart.createChartLabels();
                    } catch (e) {
                        hasError = true;
                    }

                    expect(hasError).toBe(false);
                });

                it('correctly creates labels for the modal view', function() {
                    var background = 'red';
                    var text = 'blue';
                    var code = 'TEST';
                    var expected = {
                        enabled: true,
                        useHTML: false,
                        backgroundColor: background,
                        borderRadius: 5,
                        formatter: function () {
                            return code;
                        },
                        style: {
                            color: text,
                            fontSize: '11px',
                            padding: '1.8px 5.4px 2.7px 5.4px'
                        }
                    };
                    var output = chart.createChartLabels(background, text, code);
                    var codeOut = output.formatter();

                    expect(JSON.stringify(output)).toEqual(JSON.stringify(expected));
                    expect(codeOut).toBe(code);
                });
            });

            describe('afterInitialize', function() {
                it('modifies the chart object to fit modal view', function() {
                    var Chart_ = Chart.extend({
                        getChartOptions: function() {
                            this.data = {
                                seriesData: true
                            };
                        },
                        getUniqueSeriesData: function(){
                            return 'TEST';
                        },
                        tickPositioner: function(option) {
                            return option;
                        }
                    });
                    chart = new Chart_(options);
                    var expectedMargin = 20;
                    var expectedTickPosition = 'TEST';
                    var outputMargin = _.get(chart, 'chartOptions.chart.marginRight');
                    var outputTickPosition = _.get(chart, 'chartOptions.xAxis.tickPositioner');

                    expect(expectedMargin).toBe(outputMargin);
                    expect(expectedTickPosition).toBe(outputTickPosition());
                });
            });

            describe('tickPositioner', function() {
                it('has no unique data', function() {
                    var expectTickInterval = 1;
                    var expectedOutput = [];
                    var output = chart.tickPositioner([]);

                    expect(chart.tickInterval).toBe(expectTickInterval);
                    expect(output).toEqual(expectedOutput);
                });

                it('has 81 unique data object passed to it', function() {
                    // 81 is used because the best test is over 60
                    var uniqueData = _.map(new Array(81), function(val, i) {
                        return {x: i};
                    });
                    var expectTickInterval = 10;
                    var expectTickLength = 8;
                    var expectTickAmount = 12;

                    chart.tickPositioner(uniqueData);

                    expect(chart.tickInterval).toBe(expectTickInterval);
                    expect(chart.tickLength).toBe(expectTickLength);
                    expect(chart.tickAmount).toBe(expectTickAmount);
                });

                it('has 1 unique data objects passed to it', function() {
                    var data = [{x: 1}];
                    var expected = [1];
                    var output = chart.tickPositioner(data);

                    expect(expected).toEqual(output);
                });
            });

            describe('getUniqueSeriesData', function() {
                it('removes repeated data', function() {
                    var data = [
                        {x: 1, y: 1},
                        {x: 2, y: 1},
                        {x: 1, y: 2}
                    ];
                    var expected = _.cloneDeep(data);

                    // Add a duplicate
                    data.push(_.extend({},data[0]));

                    var output = chart.getUniqueSeriesData(data);

                    expect(output).toEqual(expected);
                });
            });
        });
    });
});