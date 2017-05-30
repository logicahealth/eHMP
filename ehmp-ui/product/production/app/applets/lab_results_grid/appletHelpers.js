define([
    "backbone",
    "underscore",
    'moment'
], function (Backbone, _, moment) {
    'use strict';

    // This file is used in several places outside of lab_result_grid
    // It could use more refactoring but because of its outside uses several other applets would need to be updated
    // Therefore it was only minimum-ly changed during f1175 us17626

    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var re = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/;

    function convertDate(str, year, month, day, hours, min) {
        var time = [hours, min].join(':');
        month -= 1;
        month = MONTHS[month];
        return [month, day, year, time].join(' ');
    }

    var appletHelpers = {

        /**
         * Converts the date format for chart.
         *
         * @warning This function has no input validation and expects the date variable to be formatted correctly.
         * @param {string} date Format starts with YYYYMMDDHHmm
         * @returns {string} MMM DD YYYY HH:mm
         */
        getDateForChart: function (date) {
            var data = date + '';
            data = data.slice(0, 12);
            data = data.replace(re, convertDate);
            return data;
        },

        /**
         * Adds information from the collection into high charts chart data.
         * @warning This function is fragile and bad params will cause issues
         * @param {*} chart Highcharts chart data
         * @param {Backbone.Collection} collection
         */
        updateChart: function (chart, collection) {
            var categories = collection.pluck('observed');

            categories = _.map(categories, function (num) {
                return appletHelpers.getDateForChart(num);
            });
            var data = collection.pluck('resultNumber');
            chart.xAxis[0].setCategories(categories);
            chart.series[0].setData(data);
        },
        chartOptions: {
            chart: {
                type: 'line',
                renderTo: 'chartContainer',
                zoomType: "x",
                panning: true,
                panKey: 'shift',
                events: {
                    selection: _.noop
                }
            },
            tooltip: {},
            title: {
                text: null
            },
            plotOptions: {
                series: {
                    dataLabels: {}
                }
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    rotation: -45,
                    formatter: function () {
                        return moment(this.value).format('MMM DD YYYY');
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
        },
        setTimeSince: function (fromDate) {

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
                finalResult = Math.round(days) + lDay;
            } else if (days < 2) {
                finalResult = Math.round(hours) + lHour;
            }

            return finalResult;
        },

        _timeMap: {
            y: 'year',
            m: 'month',
            d: 'day',
            h: 'hour',
            M: 'month'
        },

        /**
         * <em>Note: Though I said I would not refactor these function because other applets use them,
         * the original code here was dead wrong. So I fixed it </em>
         *
         * Converts a short date time frame string to a long date time frame string
         * @example: 1d -> 1 day
         * @example: 5y -> 5 years
         * @example: invalid string -> invalid string
         * @param {string} timeFrame
         * @returns {string|undefined}
         */
        getNumericTime: function (timeFrame) {
            // I do not know why the original function mapped m and M to month, but that is being preserved.

            if (_.isEmpty(timeFrame)) {
                return;
            }
            var key = timeFrame[timeFrame.length - 1];
            var unit = _.get(this._timeMap, key);
            var regExp = /(\d+)/ig;
            var value = timeFrame.match(regExp);

            if (!unit || !value) {
                return timeFrame;
            }

            value = value[0];
            if (value !== '1') {
                unit += 's';
            }
            return value + ' ' + unit;
        },

        /**
         * This prepares the Model for rendering.  In the case of Labs this functionality is handled in the
         * Resources Pool. However, other applets still use this for thier parse.
         * @param {*} response A response item from the RDK
         * @returns {*}
         */
        parseLabResponse: function (response) {

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

        /**
         * Create the modal title from a lab model
         * @param {Backbone.Model} model
         * @returns {String}
         */
        getModalTitle: function (model) {
            var typeName = model.get('typeName');
            var specimen = model.get('specimen');
            if (typeName && specimen) {
                return typeName + ' - ' + specimen;
            } else if (typeName) {
                return typeName;
            } else if (specimen) {
                return (specimen);
            }
            return 'Missing Title Information';
        },

        /**
         * Converts a date string in the format YYYYMMDDHHmmssSSS to the format 'MM/DD/YYYY - HH:mm
         * @warning: does not validate inputs beyond existence
         * @param {String} observed
         * @returns {String}
         */
        getObservedFormatted: function (observed) {
            if (observed) {
                return moment(observed, 'YYYYMMDDHHmmssSSS').format('MM/DD/YYYY - HH:mm');
            }
            return '';
        },

        /**
         * @param {String} categoryCode
         * @return {Boolean}
         * @private
         */
        _isInViewReport: function isInViewReport(categoryCode) {
            var codes = ['EM', 'MI', 'SP', 'CY', 'AP'];
            var suffix = categoryCode.split(':');
            suffix = suffix.pop();

            return _.contains(codes, suffix);
        },

        /**
         * Sets the text and css properties for graphs.
         * @param rawInterpretationCode
         * @returns {{interpretationCode, flagTooltip: string, labelClass: string}}
         * @private
         */
        _getFlagClassAndText: function getFlagClassAndText(rawInterpretationCode) {
            var interpretationCode = rawInterpretationCode.split(':');
            interpretationCode = interpretationCode.pop();

            var flagTooltip = '';
            var labelClass = 'applet-badges label-critical';

            if (interpretationCode === 'HH' || interpretationCode === 'H*') {
                interpretationCode = 'H*';
                flagTooltip = 'Critical High';
            } else if (interpretationCode === 'LL' || interpretationCode === 'L*') {
                interpretationCode = 'L*';
                flagTooltip = 'Critical Low';
            } else if (interpretationCode === 'H') {
                flagTooltip = 'Abnormal High';
                labelClass = 'label-warning';
            } else if (interpretationCode === 'L') {
                flagTooltip = 'Abnormal Low';
                labelClass = 'label-warning';
            }

            return {
                interpretationCode: interpretationCode,
                flagTooltip: flagTooltip,
                labelClass: labelClass
            };
        },

        /**
         * Though this looks a lot like parseLabResponse it was originally written assuming that parseLabResponse
         * has already been ran on the model and works based off that information
         * @param {Backbone.Model} model
         */
        preparePanelForRender: function preparePanel(model) {
            var data = model.toJSON();
            var tempCode = '';
            var tempTooltip = '';
            var label = '';

            var labs = model.get('labs');
            if (!labs) {
                return data;
            }
            labs.each(_.bind(function (lab) {
                var interpretationCode =  '';
                if(lab.has('interpretationCode')) {
                    interpretationCode = this._getFlagClassAndText(lab.get('interpretationCode')).interpretationCode;
                }
                if (interpretationCode === 'H*') {
                    tempCode = 'H*';
                    tempTooltip = 'Critical High';
                    label = 'applet-badges label-critical';
                } else if (interpretationCode === 'L*' && (tempCode === 'H' || tempCode === 'L' || tempCode === '')) {
                    tempCode = 'L*';
                    tempTooltip = 'Critical Low';
                    label = 'applet-badges label-critical';
                } else if (interpretationCode === 'H' && (tempCode === 'L' || tempCode === '')) {
                    tempCode = 'H';
                    tempTooltip = 'Abnormal High';
                    label = 'label-warning';
                } else if (interpretationCode === 'L' && tempCode === '') {
                    tempCode = 'L';
                    tempTooltip = 'Abnormal Low';
                    label = 'label-warning';
                }
            }, this));

            _.set(data, 'interpretationCode', tempCode);
            _.set(data, 'flagTooltip', tempTooltip);
            _.set(data, 'labelClass', label);

            return data;
        },

        /**
         * @param {Backbone.Model} model
         */
        prepareNonPanelForRender: function perpareNonPanel(model) {
            var data = model.toJSON();
            if (data.interpretationCode) {
                var textAndCss = this._getFlagClassAndText(model.get('interpretationCode'));

                _.set(data, 'interpretationCode', textAndCss.interpretationCode);
                _.set(data, 'flagTooltip', textAndCss.flagTooltip);
                _.set(data, 'labelClass', textAndCss.labelClass);
            }

            if (this._isInViewReport(data.categoryCode)) {
                _.set(data, 'result', 'View Report');
                if (!model.get('typeName')) {
                    _.set(data, 'typeName', model.get('categoryName'));
                }
                _.set(data, 'pathology', true);
            }

            return data;
        }
    };

    return appletHelpers;
});
