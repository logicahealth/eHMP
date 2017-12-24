define([
    'backbone',
    'marionette',
    'moment',
], function(Backbone, Marionette, moment) {
    "use strict";


    return {

        allEventsChartStyles: {
            chart: {
                backgroundColor: '#F4F4F4',
                height: 125,
                width: 682,
                marginTop: 35,
                marginBottom: 25,
                events: {
                    selection: $.noop
                },
                style: {
                    // cursor: 'col-resize'
                },
                spacingRight: 20

            },
            legend: {
                align: 'left',
                verticalAlign: 'top',
                reversed: true,
                floating: true,
                width: 0,
                y: -12,
                color: '#132F50'
            },
            series: [{
                color: '#9acf09'
            }, {
                color: '#0091cb'

                /**{
                    pattern: '_assets/img//outpatient-diag-pat.svg',
                    width: 5,
                    height: 5
                }**/
            }],
            title: {
                text: null
            },
            xAxis: {
                labels: {
                    style: {
                        color: '#132F50'
                    }
                },
                lineWidth: 2,
                lineColor: '#888888',
                plotLines: [{
                    color: '#FF0000',
                    width: 2,
                    value: moment().valueOf(),
                    zIndex: 99
                }]
            },
            plotOptions: {
                column: {
                    borderColor: '#F4F4F4',
                    borderWidth: 0,
                    pointWidth: 4
                },
                series: {
                    events: {
                        legendItemClick: function(){
                            return false;
                        }
                    }
                }
            }
        },

        spikeLineChartStyles: {
            chart: {
                zoomType: '',
                events: {
                    selection: $.noop
                },
                margin: [0, 0, 0, 0],
                backgroundColor: '#F4F4F4',
                height: 27,
                width: 150
            },
            legend: {
                enabled: false,
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    pointWidth: 6, //default, changes dynamically
                    borderWidth: 0,
                    borderColor: '#F4F4F4'
                }
            },

            series: [{
                color: '#9acf09'
            }, {
                color: '#0091cb'

                /**{
                    pattern: '_assets/img//outpatient-diag-pat.svg',
                    width: 5,
                    height: 5
                }**/
            }],
            xAxis: {
                labels: {
                    enabled: false
                },
                plotLines: [{
                    color: '#FF0000',
                    width: 2,
                    value: moment().valueOf(),
                    zIndex: 99
                }]
            },
            yAxis: {
                maxPadding: 0,
                minPadding: 0,
                endOnTick: false,
                labels: {
                    enabled: false
                }
            },
            tooltip: {
                positioner: function() {
                    return {
                        y: 40
                    };
                },
                dateTimeLabelFormats: {
                    year: '%Y'
                },
                shared: true
            }
        }
    };
});