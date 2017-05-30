define([
	'test/stubs',
	'jquery',
	'backbone',
	'marionette',
	'jasminejquery',
	'app/resources/fetch/document/model'
], function(Stubs, $, Backbone, Marionette, jasminejquery, DocumentViewModel) {
	'use strict';

	describe('Unit tests for document view model parsing', function() {
		it('Should parse correctly', function() {
			var response = {
				kind: 'consult',
				activity: [{
					name: 'COMPLETE/UPDATE',
					responsible: 'Test,User'
				}]
			};

			var modifiedResponse = DocumentViewModel.prototype.parse(response);
			expect(modifiedResponse.complexDoc).toEqual(true);
			expect(modifiedResponse.authorDisplayName).toEqual('Test,User');
		});
	});
});