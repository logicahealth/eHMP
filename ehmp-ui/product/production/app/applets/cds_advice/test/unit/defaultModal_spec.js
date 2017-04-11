/* jshint proto: true */
define([
    'test/stubs',
	'jquery',
	'backbone',
    'marionette',
    'underscore',
    'jasminejquery',
    'app/applets/cds_advice/modal/default/defaultModal'
], function(Stubs, $, Backbone, Marionette, _, jasminejquery, DefaultModal) {
	'use strict';

	describe('Test cds_advice applet default type modal', function() {
		it('should serialize data properly', function() {
			var model = {
				details: {
					detail: 'Test     string with   extra spaces.'
				}
			};
			var modalInstance = DefaultModal.createView();
			modalInstance.__proto__.model = new Backbone.Model(model);
			var serializedData = modalInstance.__proto__.serializeData();
			expect(serializedData.details.detail).toEqual('Test string with extra spaces.');
		});
	});
});