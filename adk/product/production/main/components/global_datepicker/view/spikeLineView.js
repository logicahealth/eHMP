define([
    'backbone',
    'marionette',
    'underscore',
    'main/components/global_datepicker/util/chartHelper',
    'main/components/global_datepicker/util/chartStyling',
    'main/components/global_datepicker/util/parseEvents',
    'hbs!main/components/global_datepicker/template/spikeLineTemplate',
    'api/SessionStorage',
    'moment',
    'api/Messaging',
    'api/ResourceService'
], function(Backbone, Marionette, _, ChartHelper, ChartStyling, parseEvents, spikeLineTemplate, SessionStorage, moment, Messaging, ResourceService) {
    'use strict';

    var fetchOptions = {
        resourceTitle: 'global-timeline-getTimeline',
        pageable: false,
        cache: true,
        viewModel: {
            parse: parseEvents
        }
    };
    var chart;


    var spikeLineChartOptions = $.extend(true, {}, ChartHelper.chartConfig, ChartStyling.spikeLineChartStyles, {tooltip: {enabled: false}});


    return Backbone.Marionette.ItemView.extend({
        template: spikeLineTemplate,
        initialize: function() {
            var self = this;

            fetchOptions.onSuccess = function(collection) {
                spikeLineChartOptions.series[1].data = self.buildOutpatientArray(collection);
                spikeLineChartOptions.series[0].data = self.buildInpatientArray(collection);
                self.listenTo(Messaging, 'globalDate:selected', self.onDateSelected);
            };
            var collection = ResourceService.patientRecordService.fetchCollection(fetchOptions);

            // This is to replace a "setInterval" which may have been used for a race condition
            // that I could not reproduce.  However, this should ensure that the code is ran at
            // the correct time to prevent any possible race condition.
            this.listenTo(collection, "sync", function() {
                spikeLineChartOptions.chart.renderTo = self.$('#spikeLineChartContainer')[0];
                chart = new Highcharts.Chart(spikeLineChartOptions, self.spikelineEventsChartCallback);
                self.drawAndZoom();
                self.$el.find('#spikeLineChartContainer').tooltip();
            });

        },
        onDateSelected: function(dateModel) {
            var from, to;

            if (dateModel.get('selectedId') === 'all-range-global') {
                from = moment(dateModel.get('firstEventDate')).valueOf();
                to = moment(chart.xAxis[0].getExtremes().dataMax).valueOf();
            } else {
                from = moment(dateModel.get('customFromDate')).valueOf();
                to = moment(dateModel.get('customToDate')).valueOf();
            }
            if (from === null || from === undefined || _.isNaN(from) || $.trim(from) === '') {
                from = moment(chart.xAxis[0].getExtremes().dataMin).valueOf();
            }
            this.updateBarWidth(from, to);
            // chart.xAxis[0].setExtremes(from, to);
            var isAllRange = (dateModel.get('selectedId') === 'all-range-global');
            this.drawAndZoom(isAllRange);
        },
        spikelineEventsChartCallback: function(spikeLine) {
            Highcharts.addEvent(spikeLine.container, 'click', function(e) {
                $('#gdr-spikeline').trigger('click');
            });
        },
        buildOutpatientArray: function(mockCollection) {
            return this._buildArray(mockCollection, 'outpatient');
        },
        buildInpatientArray: function(mockCollection) {
            return this._buildArray(mockCollection, 'inpatient');
        },

        _buildArray: function(mockCollection, getType) {
            var arr = [];
            var model = mockCollection.at(0);
            var inp = model.get(getType);
            inp = this.groupPatientsByTimeSlice(inp);
            _.each(inp, function(value, key) {
                var _num = value.length;
                key = parseInt(key);
                arr.push([key, _num]);
            });
            return arr;
        },


        groupPatientsByTimeSlice: function(patients) {
            var today = Date.now();
            return _.groupBy(patients, function(patient) {
                var time = patient.dateTime + '';
                time = time.slice(0, 8);
                var year = parseInt(time.slice(0, 4), 10);
                var month = parseInt(time.slice(4, 6), 10);
                var day = parseInt(time.slice(6, 8), 10);
                var _date = new Date(year, month - 1, day).valueOf();
                if (_date - today > 0) {
                    // 1-7: (month) 7
                    // 8-14: (month) 14
                    // 15-21: (month) 21
                    // 22-31: (month+1) 1

                    if (day < 8) day = 7;
                    else if(day < 15) day = 14;
                    else if (day < 22) day = 21;
                    else {
                        day = 1;
                        month = month + 1;
                    }
                    return new Date(year, month, day).valueOf();
                }
                else{
                    var quarterlyBinning = (Math.floor((month + 2) / 3) * 3) - 2;
                    return new Date(year, quarterlyBinning -1).valueOf();
                }
            });
        },
        updateBarWidth: function(from, to, redraw) {
            var padding = 1000000000;
            var dateRangeInDays = moment(to).diff(moment(from), 'days');
            var calculatedBarSize = 6 - Math.floor(dateRangeInDays / 1500);
            if (calculatedBarSize < 1) {
                calculatedBarSize = 1;
            }

            chart.series[0].update({
                pointWidth: calculatedBarSize
            }, false);
            chart.series[1].update({
                pointWidth: calculatedBarSize
            }, false);
            if (chart.xAxis[0]) {
                chart.xAxis[0].setExtremes(
                    moment(from).valueOf() - padding, moment(to).valueOf() + padding, false);
            }
            if (chart.xAxis[1]) {
                chart.xAxis[1].setExtremes(
                    moment(from).valueOf() - padding, moment(to).valueOf() + padding, false);
            }
            if (redraw) {
                chart.redraw();
            }
        },
        drawAndZoom: function(isAllRange) {
            var globalDate = SessionStorage.getModel('globalDate');
            var fromDate, toDate;
            
            if (globalDate.get('selectedId') !== undefined && globalDate.get('selectedId') !== null) {
                fromDate = globalDate.get('customFromDate');
                toDate = globalDate.get('customToDate');
            }

            if (fromDate === null || fromDate === undefined || $.trim(fromDate) === '') {
                fromDate = '01/01/1900';
            }

            var In = [];
            var Out = [];

            var firstEncounterDate;
            var lastEncounterDate = moment().valueOf();
            var firstCheck = true;

            var _fromDateValue = moment(fromDate).valueOf();
            var _toDateValue = moment(toDate).valueOf();

            $.each(spikeLineChartOptions.series[0].data, function(i, point) {
                if (!(point instanceof Array)) {
                    point = $.map(point, function(value, index) { return [value]; });
                }

                if (_fromDateValue < point[0] && point[0] < _toDateValue) {
                    In.push([point[0], point[1]]);

                    if(firstCheck) {
                        firstEncounterDate = point[0];
                        firstCheck = false;
                    }
                    if (firstEncounterDate > point[0]) {
                        firstEncounterDate = point[0];
                    }
                    if (lastEncounterDate < point[0]) {
                        lastEncounterDate = point[0];
                    }
                }
            });

            $.each(spikeLineChartOptions.series[1].data, function(i, point) {
                if (!(point instanceof Array)) {
                    point = $.map(point, function(value, index) { return [value]; });
                }

                if (_fromDateValue < point[0] && point[0] < _toDateValue) {
                    Out.push([point[0], point[1]]);

                    if(firstCheck) {
                        firstEncounterDate = point[0];
                        firstCheck = false;
                    }
                    if (firstEncounterDate > point[0]) {
                        firstEncounterDate = point[0];
                    }
                    if (lastEncounterDate < point[0]) {
                        lastEncounterDate = point[0];
                    }
                }
            });

            if (isAllRange) {
                this.updateBarWidth(firstEncounterDate, lastEncounterDate, false);
            } else {
                this.updateBarWidth(fromDate, toDate, false);
            }

            chart.series[0].setData(In, false);
            chart.series[1].setData(Out, false);
            chart.redraw(false);
        },
        onBeforeDestroy: function() {
            this.destroySpikeChart();
        },
        destroySpikeChart: function() {
            if (chart !== undefined && chart !== null) {
                chart.destroy();
                chart = undefined;
            }
        }
    });
});
