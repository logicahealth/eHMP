define([
    'test/stubs',
	'jquery',
	'backbone',
	'marionette',
	'jasminejquery',
	'app/resources/fetch/cds_advice/list/model'
], function(Stubs, $, Backbone, Marionette, jasminejquery, CdsAdviceModel) {
	'use strict';

	describe('Tests for cds_advice list resource pool model', function() {
		it('should parse model properly for type text', function () {
			expect(CdsAdviceModel.prototype.parse({type: 'advice'}).typeText).toEqual('Advice');
        });

        it('should parse model properly for priority values', function () {
            expect(CdsAdviceModel.prototype.parse({priority: 100}).priorityText).toEqual('Critical');
            expect(CdsAdviceModel.prototype.parse({priority: 81}).priorityText).toEqual('Critical');
            expect(CdsAdviceModel.prototype.parse({priority: 80}).priorityText).toEqual('High');
            expect(CdsAdviceModel.prototype.parse({priority: 61}).priorityText).toEqual('High');
            expect(CdsAdviceModel.prototype.parse({priority: 60}).priorityText).toEqual('Moderate');
            expect(CdsAdviceModel.prototype.parse({priority: 41}).priorityText).toEqual('Moderate');
            expect(CdsAdviceModel.prototype.parse({priority: 40}).priorityText).toEqual('Low');
            expect(CdsAdviceModel.prototype.parse({priority: 21}).priorityText).toEqual('Low');
            expect(CdsAdviceModel.prototype.parse({priority: 20}).priorityText).toEqual('Very Low');
            expect(CdsAdviceModel.prototype.parse({priority: 1}).priorityText).toEqual('Very Low');
        });
	});
});