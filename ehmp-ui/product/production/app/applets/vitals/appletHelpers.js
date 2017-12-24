define([
    "backbone",
    "underscore",
    'moment'
], function(Backbone, _, moment) {
    'use strict';

    var appletHelpers = {
        updateChart: function(chart, collection) {

            var categories = collection.pluck('observed');

            categories = _.map(categories, function(num) {
                return appletHelpers.getDateForChart(num);
            });
            var data = collection.pluck('resultNumber');
            chart.xAxis[0].setCategories(categories);
            chart.series[0].setData(data);

        },
        chartOptions: {
            chart: {
                type: 'line',
                renderTo: 'chart-container',
                zoomType: "x"
            },
            tooltip: {
                crosshairs: true
            },
            title: {
                text: null
            },
            xAxis: {
                labels: {
                    rotation: -45
                }
            },
            yAxis: {
                title: {
                    text: ''
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: true
                }
            },
            credits: false,
            series: [{
                    data: [5.5, 10.1, 10.0, 50],
                    name: 'Lab Result',
                    showInLegend: false
                }]
        }
    };

    return appletHelpers;
});