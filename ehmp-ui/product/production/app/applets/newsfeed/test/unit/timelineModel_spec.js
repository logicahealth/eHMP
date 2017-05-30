define([
	'backbone',
	'marionette',
	'jasminejquery',
	'app/resources/fetch/timeline/model'
], function(Backbone, Marionette, jasminejquery, TimelineModel) {
	'use strict';

	describe('Unit tests for timeline model', function() {
		it('Should parse model response properties correctly', function() {
			var response = {
				kind: 'Lab',
				providerName: 'TEST,PROVIDER',
				activityDateTime: '20161203101922'
			};

			var modifiedResponse = TimelineModel.prototype.parse(response);
			expect(modifiedResponse.displayType).toEqual('Lab');
			expect(modifiedResponse.primaryProviderDisplay).toEqual('TEST,PROVIDER');
			expect(modifiedResponse.activityDateTimeByIso).toEqual('2016-12-03 10:19');
			expect(modifiedResponse.activityDateTimeByIsoWithSlashes).toEqual('2016/12/03 10:19');
		});
	});
});