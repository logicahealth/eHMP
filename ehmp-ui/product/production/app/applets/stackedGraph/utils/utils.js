define([
    'underscore'
], function (_) {
    'use strict';

    var Utils = {
        findPointsInBetween: function isBetween(chart, fromDate, toDate) /* fromDate and toDate should be instances of moment */ {

            function displayNoData(message) {
                if (!chart.noDataLabel) {
                    chart.noDataLabel = chart.renderer.label(message, 0, 0, null, null, null, false, null, 'no-data');
                    chart.noDataLabel.attr({}).css({
                        fontWeight: 'bold',
                        fontSize: '12px',
                        color: '#60606a'
                    }).add();
                    chart.noDataLabel.align(_.extend(chart.noDataLabel.getBBox(), {
                        x: 0,
                        y: 0,
                        align: 'center',
                        verticalAlign: 'middle'
                    }), !1, 'plotBox');
                }
            }

            function checkForOneDate(data) {
                var theDate = data[0].x;
                var dataCopy = data.slice();
                var moreThanOneDate;
                dataCopy.shift();
                moreThanOneDate = _.find(dataCopy, function (obj) {
                    return obj.x !== theDate;
                });

                return moreThanOneDate;
            }

            var s = [];

            _.each(chart.series, function (series, index) {
                if (series.name.toLowerCase() === 'ref range') {
                    series.update(chart.options.series[index]);
                }
            });

            _.each(chart.options.series, function (series, index1) {
                s.push([]);
                _.each(series.data, function (point) {
                    if (_.isArray(point) && point[0] >= fromDate.valueOf() && point[0] < toDate.valueOf()) {
                        s[index1].push(point);
                    } else {
                        if (point.x >= fromDate.valueOf() && point.x <= toDate.valueOf()) {
                            s[index1].push(point);
                        }
                    }
                });

                chart.series[index1].setData(s[index1]);
            });

            _.each(chart.series, function (series) {
                if (series.name.toLowerCase() === 'ref range' && series.data.length > 0 && checkForOneDate(series.data) === undefined) {
                    var sampleData = series.data[0];
                    var x = sampleData.x;
                    var high = sampleData.high;
                    var low = sampleData.low;
                    var newOptions = {
                        type: 'line',
                        color: 'rgba(94,182,94,.30)',
                        linecap: 'square',
                        dataLabels: {
                            enabled: false
                        },
                        marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: false
                                },
                                select: {
                                    enabled: false
                                }
                            }
                        },
                        lineWidth: 8,
                        data: [{
                            x: x,
                            y: high
                        }, {
                            x: x,
                            y: low
                        }]
                    };
                    series.update(newOptions);
                }
            });

            var extremes = chart.xAxis[0].getExtremes();

            if (chart.options.series[0].data.length === 0) {
                if (chart.options.graphType.toLowerCase() === 'lab tests') {
                    displayNoData('This panel or test does not support the plotting of data');
                } else {
                    displayNoData('No Records Found');
                }

                return 'No Records Found';
            } else if (!extremes.dataMin && !extremes.dataMax) {
                displayNoData('No Records Found within the Time Frame Selected');
            } else if (chart.noDataLabel) {
                chart.noDataLabel = chart.noDataLabel.destroy();
            }
        }
    };

    return Utils;
});
