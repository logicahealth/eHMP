define([
    'moment',
    'backbone',
    'marionette',
    'underscore',
    'app/applets/global_datepicker/utils/chartHelper',
    'app/applets/global_datepicker/utils/chartStyling',
    'app/applets/global_datepicker/utils/parseEvents',
    'hbs!app/applets/global_datepicker/templates/trendHistoryTemplate',
    'highcharts'
], function(
    moment,
    Backbone,
    Marionette,
    _,
    ChartHelper,
    ChartStyling,
    parseEvents,
    trendHistoryTemplate,
    Highcharts
) {
    'use strict';

    // Leaving this alone because they stay constant.
    var handleWidth = 14;
    var handleHeight = 19;
    var handleHalfWidth = handleWidth / 2;

    return Backbone.Marionette.ItemView.extend({
        template: trendHistoryTemplate,
        initialize: function(options) {

            // These variables have been re-scoped to be inside the view
            this._allEventsChart = undefined;
            this._leftHandle = undefined;
            this._rightHandle = undefined;
            this._rect = undefined;
            this._label = undefined;

            this.allEventsChartOptions = $.extend(true, {}, ChartHelper.chartConfig, ChartStyling.allEventsChartStyles);

            this.dateModel = options.dateModel;

            this.collection = options.sharedCollection;
            if (this.collection.length > 0) {
                this.displayCharts(this.collection);
            } else {
                this.listenToOnce(this.collection, 'sync', this.displayCharts);
            }
            
            this.listenTo(ADK.Messaging, 'globalDate:customDateRangeSelected', function(dateModel) {
                var dateRange = this.deriveSelectedDateRange(dateModel);
                this.updateDateSliderPosition(dateRange.from, dateRange.to, dateModel.get('selectedId'));
            });

            this.listenTo(ADK.Messaging, 'resetDateSliderPosition', function(dateRange) {
                this.updateDateSliderPosition(dateRange.from, dateRange.to, dateRange.selectedId);
            });
        },
        deriveSelectedDateRange: function(dateModel) {
            var from = moment(dateModel.get('customFromDate'), 'MM/DD/YYYY').valueOf();

            var to;
            if (this._allEventsChart !== undefined && dateModel.get('selectedId') === 'allRangeGlobal') {
                to = this._allEventsChart.xAxis[0].getExtremes().dataMax;
            } else {
                to = moment(dateModel.get('customToDate'), 'MM/DD/YYYY').valueOf();
            }

            if (from === null || from === undefined || _.isNaN(from) || $.trim(from) === '') {
                from = moment(this._allEventsChart.xAxis[0].getExtremes().dataMin).valueOf();
            }

            if (dateModel.get('selectedId') === '2yrRangeGlobal' && from < this._allEventsChart.xAxis[0].getExtremes().dataMin) {
                from = Math.min(this._allEventsChart.xAxis[0].getExtremes().dataMin, moment(dateModel.get('customFromDate'), 'MM/DD/YYYY'));
            }

            var dateRange = {
                from: from,
                to: to
            };
            ADK.Messaging.trigger('updateGlobalTimelineDateRange', dateRange);

            return dateRange;
        },
        updateDateSliderPosition: function(from, to, selectedId) {

            if ((this._leftHandle !== undefined) && (this._rightHandle !== undefined) && (this._rect !== undefined) && (this._allEventsChart !== undefined)) {

                var axisFrom = from;
                var axisTo = to;
                var highlightFrom = from;
                var extremes = this._allEventsChart.xAxis[0].getExtremes();

                if (selectedId === 'allRangeGlobal') {
                    axisFrom = extremes.dataMin;
                    axisTo = extremes.dataMax;

                    // Ensure a range is selected if there are no data points
                    if (axisFrom === axisTo) {
                        axisFrom = moment(axisFrom).subtract(1, 'd');
                    }
                } else {
                    axisFrom = Math.min(from, extremes.dataMin);
                    axisTo = Math.max(to, extremes.dataMax, moment().valueOf());
                }
                this._allEventsChart.xAxis[0].setExtremes(axisFrom, axisTo);

                if (highlightFrom < axisFrom) {
                    highlightFrom = axisFrom;
                }


                this._leftHandle.attr({
                    x: this._allEventsChart.xAxis[0].toPixels(highlightFrom) - handleHalfWidth
                });

                this._rightHandle.attr({
                    x: this._allEventsChart.xAxis[0].toPixels(axisTo) - handleHalfWidth
                });

                this._rect.attr({
                    width: this._allEventsChart.xAxis[0].toPixels(axisTo) - this._allEventsChart.xAxis[0].toPixels(highlightFrom),
                    x: this._allEventsChart.xAxis[0].toPixels(highlightFrom)
                });
            }
        },
        displayCharts: function(mockCollection) {
            this.allEventsChartOptions.series[1].data = this.buildOutpatientArray(mockCollection);
            this.allEventsChartOptions.series[0].data = this.buildInpatientArray(mockCollection);
            this.allEventsChartOptions.plotOptions.series.pointRange = 1;
            this.allEventsChartOptions.tooltip.enabled = false;
            this.allEventsChartOptions.chart.events.redraw = function() {
                this._label.attr({
                    x: this._allEventsChart.xAxis[0].toPixels(moment().valueOf()) - (this._label.attr('width') / 2)
                });
            }.bind(this);

            this.allEventsChartOptions.chart.renderTo = this.$('#trendHistoryChartContainer')[0];
            this._allEventsChart = new Highcharts.Chart(this.allEventsChartOptions, this.allEventsChartCallback.bind(this));
            this.drawAndZoom();
            this.$el.find('svg').attr('focusable', false);
            this.$el.find('svg').attr('aria-hidden', true);
        },
        allEventsChartCallback: function(allEventsChart) {
            var isDragging = false,
                group = allEventsChart.renderer.g().add(),
                downX,
                optionsX,
                currentX,
                beingDragged;

            this._label = allEventsChart.renderer.label('TODAY', allEventsChart.xAxis[0].toPixels(moment().valueOf()), false)
                .attr({
                    fill: '#FF0000',
                    padding: 2,
                    r: 2,
                    zIndex: 99
                })
                .css({
                    color: '#FFFFFF',
                    fontSize: '8px'
                })
                .add();
            var w = this._label.attr('width');
            var x1 = this._label.attr('x');
            this._label.attr({
                x: x1 - (w / 2),
                y: 20
            });

            group.attr({
                zIndex: 99
            });

            this._rect = allEventsChart.renderer.rect(allEventsChart.plotLeft, allEventsChart.plotTop, allEventsChart.plotWidth, allEventsChart.plotHeight, 0)
                .attr({
                    fill: ChartHelper.selectionColor,
                    zIndex: 98
                })
                .add();

            this._leftHandle = allEventsChart.renderer.image('_assets/img/leftHandle.svg', 0, 0, handleWidth, handleHeight)
                .attr({
                    zIndex: 99
                })
                .css({
                    cursor: 'col-resize',
                    zIndex: 99
                })
                .add();

            this._rightHandle = allEventsChart.renderer.image('_assets/img/rightHandle.svg', 0, 0, handleWidth, handleHeight)
                .attr({
                    zIndex: 99
                })
                .css({
                    cursor: 'col-resize'
                })
                .add();

            Highcharts.addEvent(this._leftHandle.element, 'mousedown', function(e) {
                e = allEventsChart.pointer.normalize(e);
                downX = e.chartX;
                optionsX = this._leftHandle.attr('x');
                currentX = this._leftHandle.attr('x') + handleHalfWidth;
                beingDragged = this._leftHandle;
                isDragging = true;
            }.bind(this));

            Highcharts.addEvent(this._rightHandle.element, 'mousedown', function(e) {
                e = allEventsChart.pointer.normalize(e);
                downX = e.chartX;
                optionsX = this._rightHandle.attr('x');
                currentX = this._rightHandle.attr('x') + handleHalfWidth;
                beingDragged = this._rightHandle;
                isDragging = true;
            }.bind(this));

            Highcharts.addEvent(allEventsChart.container, 'mousemove', function(e) {
                if (isDragging) {
                    e = allEventsChart.pointer.normalize(e);
                    var draggedX = e.chartX - downX;

                    if (beingDragged === this._leftHandle) {

                        if (currentX + draggedX > 0 && currentX + draggedX + this._leftHandle.attr('width') < allEventsChart.xAxis[0].toPixels(moment().valueOf())) {

                            this._leftHandle.attr({
                                x: optionsX + draggedX
                            });

                            this._rect.attr({
                                width: this._rightHandle.attr('x') - this._leftHandle.attr('x'),
                                x: this._leftHandle.attr('x') + handleHalfWidth
                            });
                        }

                    } else if (beingDragged === this._rightHandle) {

                        if (currentX + draggedX > allEventsChart.xAxis[0].toPixels(moment().valueOf()) && currentX + draggedX + this._rightHandle.attr('width') < allEventsChart.chartWidth) {

                            this._rightHandle.attr({
                                x: optionsX + draggedX
                            });

                            this._rect.attr({
                                width: this._rightHandle.attr('x') - this._leftHandle.attr('x'),
                                x: this._leftHandle.attr('x') + handleHalfWidth
                            });
                        }
                    }
                }
            }.bind(this));
            Highcharts.addEvent(document, 'mouseup', function() {
                //if we're reasonably close to today's date in the "to" field, set to date to today's date.  This is for usability purposes
                // since each pixel of dragging represents nearly two weeks.  If users want finer control, they can explicitly specify from/to
                // date in custom fields
                // var from = allEventsChart.xAxis[0].toValue(leftHandle.attr('x') + handleHalfWidth);
                // var to = allEventsChart.xAxis[0].toValue(rightHandle.attr('x') + handleHalfWidth);


                // CHANGE FROM AND TO DATES TO REFLECT RECTTANGLE LOCATION AND WIDTH INSTEAD OF LEFT HANDLE X AND RIGHT HANDLE X
                var from = allEventsChart.xAxis[0].toValue(this._rect.attr('x'));
                var to = allEventsChart.xAxis[0].toValue(this._rect.attr('x') + this._rect.attr('width'));

                var timeDiffFromNow = moment.duration(moment(to).diff(moment().valueOf()));
                var timeDiffInDays = timeDiffFromNow.asDays();
                if (timeDiffInDays < 7) {
                    to = moment().valueOf();
                }

                if (isDragging) {
                    var newDateRange = {
                        from: from,
                        to: to
                    };

                    this.dateModel.set('selectedId', 'customRangeApplyGlobal');

                    ADK.Messaging.trigger('updateGlobalTimelineDateRange', newDateRange);
                }

                beingDragged = null;

                isDragging = false;
            }.bind(this));
        },
        buildOutpatientArray: function(mockCollection) {
            return this._buildArray(mockCollection, 'outpatient');
        },
        buildInpatientArray: function(mockCollection) {
            return this._buildArray(mockCollection, 'inpatient');
        },

        // Since both the inpatient and outpatient where doing the exact same thing
        // With the exception of what they fetched from model I created a single helper
        // function that they both can call.
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
            var globalDate = ADK.SessionStorage.getModel('globalDate');
            var firstEventDate = globalDate.get('firstEventDate');
            var lastEventDate = globalDate.get('lastEventDate');
            if (firstEventDate === undefined || firstEventDate === null) {
                firstEventDate = moment();
                firstEventDate.subtract(1, 'd');
            } else {
                firstEventDate = moment(firstEventDate, 'MM/DD/YYYY');
            }

            if (lastEventDate === undefined || lastEventDate === null) {
                lastEventDate = moment();
            } else {
                lastEventDate = moment(lastEventDate, 'MM/DD/YYYY');
            }


            var today = Date.now();
            var patientGroup = _.groupBy(patients, function(patient) {
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
                    else if (day < 15) day = 14;
                    else if (day < 22) day = 21;
                    else {
                        day = 1;
                        month = month + 1;
                    }
                    return new Date(year, month, day).valueOf();
                } else {
                    var quarterlyBinning = (Math.floor((month + 2) / 3) * 3) - 2;
                    return new Date(year, quarterlyBinning - 1).valueOf();
                }
            });

            globalDate.set('firstEventDate', firstEventDate.format('MM/DD/YYYY'));
            globalDate.set('lastEventDate', lastEventDate.format('MM/DD/YYYY'));

            ADK.SessionStorage.set.sessionModel('globalDate', globalDate);

            return patientGroup;
        },
        addAllEventsChartMouseEvents: function(allEventsChart) {

        },
        drawAndZoom: function() {
            var globalDate = ADK.SessionStorage.getModel('globalDate');
            var selectedId = globalDate.get('selectedId');
            var fromDate, toDate, from, to;

            if (globalDate.get('selectedId') !== undefined && globalDate.get('selectedId') !== null) {
                if (selectedId === 'allRangeGlobal') {
                    fromDate = globalDate.get('firstEventDate');
                    toDate = globalDate.get('lastEventDate');
                } else {
                    fromDate = globalDate.get('fromDate');
                    toDate = globalDate.get('toDate');
                }
            }

            if (fromDate === null || fromDate === undefined || $.trim(fromDate) === '') {
                fromDate = '01/01/1900';
            }

            from = moment(fromDate, 'MM/DD/YYYY').valueOf();
            to = moment(toDate, 'MM/DD/YYYY').valueOf();

            this._leftHandle.attr({
                x: this._allEventsChart.xAxis[0].toPixels(from),
                y: (this._allEventsChart.chartHeight / 2) - (this._leftHandle.attr('height') / 2)
            });

            this._rightHandle.attr({
                x: this._allEventsChart.xAxis[0].toPixels(to),
                y: (this._allEventsChart.chartHeight / 2) - (this._leftHandle.attr('height') / 2)
            });

            this._rect.attr({
                width: this._rightHandle.attr('x') - this._leftHandle.attr('x'),
                x: this._leftHandle.attr('x') + handleHalfWidth
            });

            ADK.Messaging.trigger('updateGlobalTimelineDateRange', {
                from: from,
                to: to
            });
        },
        onBeforeDestroy: function() {
            this.destroyAllEventsChart();
            if (this._leftHandle) {
                $(this._leftHandle.element).off('mousedown');
            }
            if (this._rightHandle) {
                $(this._rightHandle.element).off('mousedown');
            }
        },
        destroyAllEventsChart: function() {
            if (this._allEventsChart !== undefined && this._allEventsChart !== null) {
                $(document).off('mouseup');
                this._allEventsChart.destroy();
                this._allEventsChart = undefined;
            }
        }
    });
});