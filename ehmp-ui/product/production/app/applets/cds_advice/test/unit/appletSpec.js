define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'test/stubs', 'app/applets/cds_advice/applet'],
	function ($, Backbone, Marionette, jasminejquery, Stubs, CdsAdviceApplet) {
		'use strict';
		describe('Base tests for cds_advice applet', function (){
			it('Test serializeModel functionality', function (){
				var serializeModel = _.get(CdsAdviceApplet, 'viewTypes[0].view.prototype.DataGrid.prototype.DataGridRow.prototype.serializeModel');
				var mockView = {
					model: new Backbone.Model({
						priority: 90
					})
				};
				var result = serializeModel.call(mockView);
				expect(result.priorityCSS).toEqual('color-red bold-font');
			});
		});
});