define([
	'underscore',
	'moment'
], function(_, moment) {
	'use strict';

	// TODO: Is it okay to assume 30 days per month here?
	// (30 days/month)(24 hours/day)(3600 seconds/hour)(1000 milliseconds/second)
	var MILLISECONDS_PER_MONTH = 2592000000;

	var chartUtil = {
		gistOptions: function() {
			return {
				global: {
					useUTC: false,
					timezoneOffset: 5 * 60 // TODO: wth this is a national site!
				},
				chart: {
					animation: true,
					zoomType: '',
					type: 'column',
					spacing: [1, 1, 1, 1],
					backgroundColor: '#F2F2F2',
					events: {
						click: function(e) {
							$(e.target).closest('[data-toggle=popover]').trigger('click');
						}
					}
				},
				credits: {
					enabled: false
				},
				legend: {
					enabled: false
				},
				title: {
					text: ''
				},
				tooltip: {
					enabled: false,
					hideDelay: 10,
					borderWidth: 1,
					formatter: function() {
						return this.point.plotX;
					}
				},
				plotOptions: {
					series: {
						cursor: 'pointer',
						pointWidth: 5,
						pointInterval: MILLISECONDS_PER_MONTH,
						enableMouseTracking: false
					},
					column: {
						grouping: false,
						shadow: false
					}
				},
				xAxis: {
					labels: {
						enabled: false,
						style: {
							color: 'red',
							fontSize: 8
						}
					},
					type: 'datetime',
					tickWidth: 0,
					startOnTick: false,
					endOnTick: false,
					plotLines: [{ // mark for the now
						color: '#F20000',
						value: this.nowChart(),
						dashStyle: 'solid',
						width: 2,
						zIndex: 5
					}]
				},
				yAxis: [{
					labels: {
						enabled: false
					},
					lineWidth: 1,
					title: {
						enabled: false,
						text: 'y Value'
					}
				}, {
					lineWidth: 1,
					opposite: true,
					title: {
						enabled: false,
						text: 'y Value'
					}
				}],
				series: [{
					data: [],
					type: 'column',
					name: '',
					pointRange: MILLISECONDS_PER_MONTH,
					color: 'rgb(124, 181, 236)'
				}, {
					data: [],
					type: 'column',
					color: '#406E7B',
					name: 'now',
					pointRange: MILLISECONDS_PER_MONTH
				}]
			};
		},
		convertChartDate: function(time) {
			if (time.length < 8) {
				time = _.padRight(time, 8, '0');
			}
			var utcdatetime = moment.utc(time, "YYYYMMDD");
			if (!utcdatetime.isValid()) {
				var year = time.substr(0, 4);
				var month = time.substr(4, 2);
				var day = time.substr(6, 2);
				var newutcdatetime;
				if (utcdatetime.invalidAt() === 1) { // incorrect month
					month = "01";
					newutcdatetime = moment.utc([year, month, day], "YYYYMMDD"); // set month to January
					if (newutcdatetime.isValid()) {
						return newutcdatetime.valueOf();
					} else {
						if (newutcdatetime.invalidAt() === 2) { // incorrect day
							day = "01";
							newutcdatetime = moment.utc([year, month, day], "YYYYMMDD"); // set day to 01
							return newutcdatetime.valueOf();
						}
					}
				}
			}
			return utcdatetime.valueOf();
		},
		nowChart: function() {
			var tm = moment().format("YYYYMMDDHHmmssSSS");
			return this.convertChartDate(tm);
		},
		calculateDuration: function(collection) {
			var result = [];
			_.each(collection.filter('stay'), function(model) {
				var stayObj = model.get('stay');
				var start = moment(stayObj.arrivalDateTime, 'YYYYMMDDHHmmssSSS');
				var stop;
				if (stayObj.dischargeDateTime) {
					stop = moment(stayObj.dischargeDateTime, 'YYYYMMDDHHmmssSSS');
				} else {
					stop = moment();
				}

				result.push([start, stop]);
			});
			return result;
		},
		showChart: function(obj) {
			// Reset Chart options
			var chartOptions = _.get(obj.getOption('appletOptions'), 'gistChartOptions');
			chartOptions.series[0].data = [];
			chartOptions.series[0].name = '';
			chartOptions.series[1].data = [];
			chartOptions.xAxis.plotLines[0].width = 0;
			chartOptions.yAxis[0].max = null;
			var $pointer;

			// prepare chart data
			chartOptions.series[0].name = obj.model.get('kind');
			var chartDate = this.convertChartDate(chartOptions.graphStartPoint);
			var maxDate = this.convertChartDate(chartOptions.graphEndPoint);
			var nowMoment = moment(this.nowChart());

			chartOptions.series[1].data.push([chartDate, 0]);

			// Now on the Chart if Now in selected time frame
			if (nowMoment.isBefore(maxDate) && nowMoment.isAfter(chartDate)) {
				chartOptions.xAxis.plotLines[0].width = 2;
			}

			// Right border of chart
			chartOptions.series[1].data.push([maxDate, 0]);

			//  tooltip data&position correction !!!
			chartOptions.plotOptions.column.cropThreshold = obj.model.get('count');

			// Create Chart
			$pointer = obj.$el.find('.graph-container');
			$pointer.highcharts(chartOptions);
			obj.$el.find('.highcharts-background').attr('fill', 'rgba(0,0,0,0)');

			return $pointer;
		},
		chartReflow: function(obj) {
			var pointer;

			pointer = obj.$el.find('.graph-container');

			if (!_.isUndefined(pointer.highcharts())) {
				pointer.highcharts().reflow();
			}
		},
		binning_normal_function: function(val) {
			return Math.log((val * val * val + 1) / 0.1);
		},
		chartDataBinning: function(chartConfig) {
			// ADK Binning & Normalization
			var chartOptions = _.get(chartConfig, 'chartOptions', {});
			var model = chartConfig.model;
			var input = {};
			var chartMap;
			var config = {
				barPadding: 6,
				normal_function: this.binning_normal_function,
				debug: false
			};

			var pointer = chartConfig.graphPointer;
			config.chartWidth = chartConfig.width || pointer.width();
			if (!_.isUndefined(pointer.highcharts())) {

				input.isDuration = model.get('kind') === 'Admission' || false;
				input.oldestDate = this.convertChartDate(chartOptions.graphStartPoint);
				input.newestDate = this.convertChartDate(chartOptions.graphEndPoint);
				input.series = [];

				if (_.isArray(chartConfig.filteredSet)) {
					chartMap = _.countBy(chartConfig.filteredSet, function(model) {
						return model.get('eventDate');
					});
				} else {
					chartMap = model.get('collection').countBy('eventDate');
				}

				if (input.isDuration) {
					var durationCollection = _.get(chartConfig, 'collection', new Backbone.Collection());
					if (chartConfig.durationFilter) durationCollection = new Backbone.Collection(durationCollection.filter(chartConfig.durationFilter));
					input.series = this.calculateDuration(durationCollection);
				} else {
					_.each(chartMap, function(value, key) {
						input.series.push([this.convertChartDate(key), value]);
					}, this);
				}

				var binned = ADK.utils.chartDataBinning(input, config);

				pointer.highcharts().series[0].setData(binned);
			}
		},
		selectStartStopPoint: function(firstDateModel) {
			var formatString = 'YYYYMMDD';
			var globalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
			var filterMode = (firstDateModel) ? globalDate.get('selectedId') : null;
			var fromDate = moment(globalDate.get('fromDate'), 'MM/DD/YYYY').format(formatString);
			var toDate = moment(globalDate.get('toDate'), 'MM/DD/YYYY').format(formatString);
			var maxDate = moment().add(6, 'M');
			var tomorrow = moment().add(1, 'd');

			switch (filterMode) {
				case 'allRangeGlobal':
					return {
						start: moment(firstDateModel.get('dateTime')).format(formatString),
						stop: moment(maxDate).format(formatString)
					};
				case 'customRangeApplyGlobal':
					return {
						start: fromDate,
						stop: toDate
					};
				default:
					return {
						start: fromDate,
						stop: moment(tomorrow).format(formatString)
					};
			}
		}
	};

	return chartUtil;
});