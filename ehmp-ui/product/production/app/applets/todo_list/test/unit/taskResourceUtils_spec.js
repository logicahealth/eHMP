define([
	'test/stubs',
	'jquery',
	'backbone',
	'marionette',
	'jasminejquery',
	'app/resources/fetch/tasks/util'
], function(Stubs, $, Backbone, Marionette, jasminejquery, TaskUtil) {
	'use strict';

	describe('Test task resource utilities - setOverdueText', function() {
		it('Should return overdue text properties', function() {
			var overdueTextObject = TaskUtil.setOverdueText('20150101', '20150130');
			expect(overdueTextObject.dueText).toEqual('Past due');
			expect(overdueTextObject.dueTextClass).toEqual('text-danger');
			expect(overdueTextObject.dueTextValue).toEqual(-1);
		});
	});

	describe('Test task resource utilities - taskComparator', function() {
		it('Should return calculated comparator value', function() {
			var model = new Backbone.Model({
				ACTIVE: true,
				dueTextValue: 1,
				PRIORITY: 10,
				DUE: '20150101',
				earliestDateMilliseconds: 1420088400000
			});
			expect(TaskUtil.taskComparator(model)).toEqual(10221420088400000);
		});
	});

	describe('Test task resource utilities - isActionable', function() {
		it('Should return true for active/due task with permissions', function() {
			expect(TaskUtil.isActionable(true, 0, true, false)).toEqual(true);
		});

		it('Should return true for active/not due task with permissions and before earliest date flag', function() {
			expect(TaskUtil.isActionable(true, 1, true, true)).toEqual(true);
		});

		it('Should return false for inactive task', function() {
			expect(TaskUtil.isActionable(false, 0, true, true)).toEqual(false);
		});

		it('Should return false for insufficient permissions', function() {
			expect(TaskUtil.isActionable(true, 0, false, true)).toEqual(false);
		});

		it('Should return false for not due task and no earliest date override flag', function() {
			expect(TaskUtil.isActionable(true, 1, true, false)).toEqual(false);
		});
	});
});