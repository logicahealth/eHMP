define([
	'test/stubs',
	'backbone',
	'marionette',
	'jquery',
	'jasminejquery',
	'app/applets/stackedGraph/list/pickListView'
], function(Stubs, Backbone, Marionette, $, jasminejquery, PickListView) {
	'use strict';

	describe('Stacked graph tests for pickListView', function() {
		var view;
		var mockModel;

		Stubs.bootstrapViewTest();

		beforeEach(function() {
			mockModel = new Backbone.Model();
			view = new PickListView({
				model: mockModel
			});
			Stubs.testRegion.show(view);
		});

		it('should be defined when constructed', function() {
			expect(view).toBeDefined();
		});

		it('should set id property on model', function() {
			expect(view.serializeData().inputId).toEqual('stackedGraph' + mockModel.cid);
		});
	});
});