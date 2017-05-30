define([
	'jquery',
	'moment',
	'jasminejquery',
	'app/applets/stackedGraph/utils/utils'
], function($, moment, jasminejquery, Utils) {
	'use strict';

	describe('Test utils for stacked graphs applet', function() {
		var xAxisObject = {
			getExtremes: function() {}
		};

		var label;
		var fromDate = moment('09-16-2016', 'MM-DD-YYYY');
		var toDate = moment('12-16-2016', 'MM-DD-YYYY');

		beforeEach(function() {
			label = jasmine.createSpy().and.callFake(function() {
				return {
					attr: function() { return this;},
					css: function() { return this;},
					add: function() {},
					align: function() {},
					getBBox: function() { return {};}
				};
			});
		});

		afterEach(function() {
			label.calls.reset();
		});

		function getChart(graphType, data) {
			var seriesOne = {
				name: 'ref range',
				data: data,
				update: function() {},
				setData: function() {}
			};

			spyOn(seriesOne, 'update').and.callThrough();

			var chart = {
				series: [seriesOne],
				options: {
					series: [seriesOne],
					graphType: graphType
				},
				xAxis: [xAxisObject],
				renderer: {
					label: label
				}
			};

			return chart;
		}

		it('should display the correct message for lab tests', function() {
			var chart = getChart('Lab Tests', []);
			spyOn(chart.series[0], 'setData').and.callThrough();
			spyOn(xAxisObject, 'getExtremes').and.callThrough();
			var message = Utils.findPointsInBetween(chart, fromDate, toDate);
			expect(label).toHaveBeenCalledWith('This panel or test does not support the plotting of data', 0, 0, null, null, null, false, null, 'no-data' );
			expect(message).toEqual('No Records Found');
		});

		it('should display the correct message for no records (non lab tests)', function() {
			var chart = getChart('Vitals', []);
			spyOn(chart.series[0], 'setData').and.callThrough();
			spyOn(xAxisObject, 'getExtremes').and.callThrough();
			var message = Utils.findPointsInBetween(chart, fromDate, toDate);
			expect(label).toHaveBeenCalledWith('No Records Found', 0, 0, null, null, null, false, null, 'no-data' );
			expect(message).toEqual('No Records Found');
		});

		it('should display the correct message for no records in the timeframe', function() {
			var chart = getChart('Vitals', [{x: 1471492800000}]); //08-18-2016
			spyOn(chart.series[0], 'setData').and.callThrough();
			spyOn(xAxisObject, 'getExtremes').and.returnValue({});
			Utils.findPointsInBetween(chart, fromDate, toDate);
			expect(label).toHaveBeenCalledWith('No Records Found within the Time Frame Selected', 0, 0, null, null, null, false, null, 'no-data' );
		});

		it('should destroy the previous "no data" label if it exists', function() {
			var chart = getChart('Vitals', [{x: 1476763200000}]); //10-18-2016
			chart.noDataLabel = {
				message: 'Previous no data label',
				destroy: function() {
					delete chart.noDataLabel;
				}
			};
			spyOn(chart.series[0], 'setData').and.callThrough();
			spyOn(xAxisObject, 'getExtremes').and.returnValue({dataMin: true});
			Utils.findPointsInBetween(chart, fromDate, toDate);
			expect(chart.noDataLabel).toBe(undefined);
		});
	});

});