define([
    'moment',
    'backbone',
    'marionette',
    'underscore',
    'app/applets/global_datepicker/utils/chartHelper',
    'app/applets/global_datepicker/utils/chartStyling',
    'app/applets/global_datepicker/utils/parseEvents',
    'hbs!app/applets/global_datepicker/templates/spikeLineTemplate'
], function(
    moment,
    Backbone,
    Marionette,
    _,
    ChartHelper,
    ChartStyling,
    parseEvents,
    spikeLineTemplate
) {
    'use strict';


    return Backbone.Marionette.ItemView.extend({
        template: spikeLineTemplate,
        initialize: function(options) {

            this.spikeLineChartOptions = $.extend(true, {}, ChartHelper.chartConfig, ChartStyling.spikeLineChartStyles, {tooltip: {enabled: false}});

            this.collection = options.sharedCollection;
            if (this.collection.length > 0) {
                this.onSyncCollection(this.collection);
            } else {
                this.listenToOnce(this.collection, 'sync', this.onSyncCollection);
            }

            this.chart = undefined;
        },
        onSyncCollection: function(collection) {
                this.spikeLineChartOptions.series[1].data = this.buildOutpatientArray(collection);
                this.spikeLineChartOptions.series[0].data = this.buildInpatientArray(collection);

                this.spikeLineChartOptions.chart.renderTo = self.$('#spikeLineChartContainer')[0];
                this.chart = new Highcharts.Chart(this.spikeLineChartOptions, this.spikelineEventsChartCallback);
                this.drawAndZoom();
                this.$el.find('#spikeLineChartContainer').tooltip();
                this.$el.find('svg').attr('focusable', false);
                this.$el.find('svg').attr('aria-hidden', true);
                
                this.listenTo(ADK.Messaging, 'globalDate:selected', this.onDateSelected);
        },
        onDateSelected: function(dateModel) {
            var from, to;

            if (dateModel.get('selectedId') === 'allRangeGlobal') {
                from = moment(dateModel.get('firstEventDate')).valueOf();
                to = moment(this.chart.xAxis[0].getExtremes().dataMax).valueOf();
            } else {
                from = moment(dateModel.get('customFromDate')).valueOf();
                to = moment(dateModel.get('customToDate')).valueOf();
            }
            if (from === null || from === undefined || _.isNaN(from) || $.trim(from) === '') {
                from = moment(this.chart.xAxis[0].getExtremes().dataMin).valueOf();
            }
            this.updateBarWidth(from, to);
            // chart.xAxis[0].setExtremes(from, to);
            var isAllRange = (dateModel.get('selectedId') === 'allRangeGlobal');
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

            this.chart.series[0].update({
                pointWidth: calculatedBarSize
            }, false);
            this.chart.series[1].update({
                pointWidth: calculatedBarSize
            }, false);
            if (this.chart.xAxis[0]) {
                this.chart.xAxis[0].setExtremes(
                    moment(from).valueOf() - padding, moment(to).valueOf() + padding, false);
            }
            if (this.chart.xAxis[1]) {
                this.chart.xAxis[1].setExtremes(
                    moment(from).valueOf() - padding, moment(to).valueOf() + padding, false);
            }
            if (redraw) {
                this.chart.redraw();
            }
        },
        drawAndZoom: function(isAllRange) {
            var globalDate = ADK.SessionStorage.getModel('globalDate');
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

            $.each(this.spikeLineChartOptions.series[0].data, function(i, point) {
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

            $.each(this.spikeLineChartOptions.series[1].data, function(i, point) {
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

            this.chart.series[0].setData(In, false);
            this.chart.series[1].setData(Out, false);
            this.chart.redraw(false);
        },
        onBeforeDestroy: function() {
            this.destroySpikeChart();
        },
        destroySpikeChart: function() {
            if (this.chart !== undefined && this.chart !== null) {
                this.chart.destroy();
                this.chart = undefined;
            }
        }
    });
});
