/* jshint proto: true */
define([
    'test/stubs',
	'jquery',
	'backbone',
    'marionette',
    'underscore',
    'jasminejquery',
    'app/applets/cds_advice/modal/advice/adviceModal'
], function(Stubs, $, Backbone, Marionette, _, jasminejquery, AdviceModal) {
	'use strict';

	describe('Test cds_advice applet advice type modal', function() {
		it('should serialize data properly', function() {
			var model = {
				details: {
					detail: 'Test     string with   extra spaces.'
				}
			};
			var modalInstance = AdviceModal.createBodyView();
			modalInstance.__proto__.model = new Backbone.Model(model);
			var serializedData = modalInstance.__proto__.serializeData();
			expect(serializedData.details.detail).toEqual('Test string with extra spaces.');
		});
	});
});