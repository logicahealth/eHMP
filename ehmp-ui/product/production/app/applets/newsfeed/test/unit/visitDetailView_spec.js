define([
	'backbone',
	'marionette',
	'jasminejquery',
	'app/applets/newsfeed/visitDetail/visitDetailView'
], function(Backbone, Marionette, jasminejquery, VisitDetailView) {
	'use strict';
	describe('Unit tests for newsfeed visit detail view', function() {
		it('Should handle serializeData correctly for complete appointment status', function() {
			var model = new Backbone.Model({appointmentStatus: 'COMPLETE'});
			var visitDetailView = new VisitDetailView({
				model: model
			});
			expect(visitDetailView.serializeData().appointmentStatus).toEqual('Completed');
		});

		it('Should handle serializeData correctly for kept appointment status', function() {
			var model = new Backbone.Model({appointmentStatus: 'KEPT'});
			var visitDetailView = new VisitDetailView({
				model: model
			});
			expect(visitDetailView.serializeData().appointmentStatus).toEqual('Kept');
		});
	});
});