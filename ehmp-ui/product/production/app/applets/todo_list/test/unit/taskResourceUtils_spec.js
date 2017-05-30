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

	describe('Test task resource utilities - hasPermissions', function() {
		it('Should return true if permissions is undefined', function() {
			expect(TaskUtil.hasPermissions({})).toEqual(true);
		});

		it('Should return true if permission.ehmp and permission.user are empty', function() {
			var task = {
				PERMISSION: {}
			};
			expect(TaskUtil.hasPermissions(task)).toEqual(true);
		});

		it('Should return true if user is permissions list', function(){
			var task = {
				PERMISSION: {
					ehmp: [],
					user: ['9E7A;1234']
				}
			};

			var userSession = new Backbone.Model({
				site: '9E7A',
				duz: {
					'9E7A': '1234'
				}
			});

			spyOn(ADK.UserService, 'getUserSession').and.returnValue(userSession);
			spyOn(ADK.UserService, 'hasPermissions').and.returnValue(true);
			expect(TaskUtil.hasPermissions(task)).toEqual(true);
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
});