define([
    "backbone",
    "underscore",
    'moment'
], function(Backbone, _, Moment) {
    'use strict';

    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var re = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/;

    function convertDate(str, year, month, day, hours, min) {
        var time = [hours, min].join(':');
        month -= 1;
        month = MONTHS[month];
        return [month, day, year, time].join(' ');
    }

    var appletHelpers = {
        getDateForChart: function(date) {
            // The following works, but I don't know how to get the unit test to be able to use the ADK.
            // return new ADK.utils.dateUtils.StringFormatter(data, 'YYYYMMDDHHmm').format('MMM DD YYYY HH:mm');
            var data = date + '';
            data = data.slice(0, 12);
            data = data.replace(re, convertDate);
            return data;
        },
        updateChart: function(chart, collection) {

            var categories = collection.pluck('observed');

            categories = _.map(categories, function(num) {
                return appletHelpers.getDateForChart(num);
            });
            var data = collection.pluck('resultNumber');
            chart.xAxis[0].setCategories(categories);
            chart.series[0].setData(data);


        },// DO NOT MAKE CHANGES TO THE  CHARTOPTIONS OBJ BELOW,
        // IT IS BEING USED IN A COUPLE OF PLACES. USE JQUERY DEEP EXTEND TO EXTEND THE OBJECT WHERE YOU NEED IT.

        chartOptions: {
            chart: {
                type: 'line',
                renderTo: 'chartContainer',
                zoomType: "x",
                panning: true,
                panKey: 'shift',
                // marginRight: 20,
                events: {
                    selection: function(e) {
                        // var originalY = this.xAxis[0].options.labels.y;
                        // if(event.xAxis){
                        //     var selection = event.xAxis[0].axis;
                        //     console.log(this.xAxis[0].options.labels.rotation = 45);
                        //     this.xAxis[0].options.labels.y = 30;
                        //     this.redraw();

                        // } else {
                        //     this.xAxis[0].options.labels.rotation = 0;
                        //     this.xAxis[0].options.labels.y = originalY;
                        // }

                        // this.xAxis[0].update({labels:{rotation:90}});
                    }
                }
            },
            tooltip: {
                // crosshairs: true,
                // shared: true
            },
            title: {
                text: null
            },
            plotOptions: {
                series: {
                    dataLabels: {}
                }
            },
            /*subtitle: {
            text: 'Source: WorldClimate.com'
        },*/
            xAxis: {
                type: 'datetime',
                labels: {
                    rotation: -45,
                    formatter: function() {
                        return new Moment(this.value).format('MMM DD YYYY');
                    }
                },
                maxPadding: 0.05,
                minPadding: 0.05,
                startOnTick: false,
                endOnTick: false,
                tickmarkPlacement: 'on'
            },
            yAxis: {
                title: {
                    text: 'Temperature (°C)'
                }
            },
            credits: false,
            series: [{
                    data: [],
                    name: 'Lab Result',
                    showInLegend: false
                }]
                //end of chartOptions
        },
        setTimeSince: function(fromDate) {

            if (fromDate === undefined || fromDate === "") return undefined;
            var startDate = moment(fromDate, 'YYYYMMDDHHmmssSSS');
            var endDate = moment();

            var duration = moment.duration(endDate.diff(startDate));

            var years = parseFloat(duration.asYears());
            var days = parseFloat(duration.asDays());
            var months = parseFloat(duration.asMonths());
            var hours = parseFloat(duration.asHours());
            var min = parseFloat(duration.asMinutes());

            if (min > 0 && min < 60) {
                hours = 1;
            }
            //console.log(hours1);

            var lYear = "y";
            var lMonth = "m";
            var lDay = "d";
            var lHour = "h";
            var finalResult = "";
            if (months >= 24) {
                finalResult = Math.round(years) + lYear;
            } else if ((months < 24) && (days > 60)) {
                finalResult = Math.round(months) + lMonth;
            } else if ((days >= 2) && (days <= 60)) {
                finalResult = Math.round(days) + lMonth;
            } else if (days < 2) {
                finalResult = Math.round(hours) + lHour;
            }

            return finalResult;
        },
        getNumericTime: function(response) {
            if (response === undefined) return response;
            var str = response;
            var reg = /(\d+)/ig;
            var strReg = str.match(reg);
            str = str.substr(str.length - 1);
            switch (str) {
                case 'y':
                    if (strReg == 1) {
                        str = 'year';
                    } else str = 'years';
                    break;

                case 'm':
                    if (strReg == 1) {
                        str = 'month';
                    } else str = 'months';
                    break;

                case 'M':
                    if (strReg == 1) {
                        str = 'month';
                    } else str = 'months';
                    break;

                case 'd':
                    if (strReg == 1) {
                        str = 'month';
                    } else str = 'months';
                    break;

                case 'h':
                    if (strReg == 1) {
                        str = 'day';
                    } else str = 'days';
                    break;
            }
            response = strReg + ' ' + str;
            return response;
        },
        parseLabResponse: function(response) {

            // Check 'codes' for LOINC codes and Standard test name.
            var low = response.low,
                high = response.high;

            if (low && high) {
                response.referenceRange = low + '-' + high;
            }

            if (response.interpretationCode) {
                var temp = response.interpretationCode.split(":").pop();

                var flagTooltip = "";
                var labelClass = "applet-badges label-critical";

                if (temp === "HH") {
                    temp = "H*";
                    flagTooltip = "Critical High";
                }
                if (temp === "LL") {
                    temp = "L*";
                    flagTooltip = "Critical Low";
                }
                if (temp === "H") {
                    flagTooltip = "Abnormal High";
                    labelClass = "label-warning";
                }
                if (temp === "L") {
                    flagTooltip = "Abnormal Low";
                    labelClass = "label-warning";
                }

                response.interpretationCode = temp;
                response.flagTooltip = flagTooltip;
                response.labelClass = labelClass;
            }

            if (response.categoryCode) {
                var categoryCode = response.categoryCode.slice(response.categoryCode.lastIndexOf(':') + 1);

                switch (categoryCode) {
                    case 'EM':
                    case 'MI':
                    case 'SP':
                    case 'CY':
                    case 'AP':
                        response.result = 'View Report';
                        if (!response.typeName) {
                            response.typeName = response.categoryName;
                        }
                        response.pathology = true;
                        break;
                }

            }

            return response;
        },
        getModalTitle: function(model) {
            return model.get('typeName') + ' - ' + model.get('specimen');
        },
        getObservedFormatted: function(observed) {
            var convert = function(str, year, month, day, hour, min) {
                var date = [month, day, year].join('/');
                var time = [hour, min].join(':');
                return [date, time].join(' ');
            };

            if (observed)
                return observed.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, convert);
            return '';
        }
    };

    return appletHelpers;
});
