define([
	'test/stubs',
	'jquery',
	'backbone',
	'marionette',
	'jasminejquery',
	'moment',
	'app/resources/fetch/tasks/model'
], function(Stubs, $, Backbone, Marionette, jasminejquery, moment, TaskModel) {
	'use strict';

	describe('Unit tests for task model parsing', function() {
		it('Should return model properties correctly based on the response', function() {
			var response = {
				STATUS: 'Created',
				TASKNAME: 'Request',
				INSTANCENAME: 'Response',
				DUE: '20161129',
				EXPIRATIONTIME: '201508301001',
				PRIORITY: 0,
				PATIENTNAME: 'BCMA,Eight',
				LAST4: '1234'
			};

			var modifiedResponse = TaskModel.prototype.parse(response);
			expect(modifiedResponse.statusFormatted).toEqual('Active');
			expect(modifiedResponse.TASKNAMEFORMATTED).toEqual('Request - Response');
			expect(modifiedResponse.DUEDATEFORMATTED).toEqual(moment(response.DUE).format('MM/DD/YYYY'));
			expect(modifiedResponse.earliestDateMilliseconds).toEqual(moment(response.DUE).valueOf());
			expect(modifiedResponse.EXPIRATIONTIMEFORMATTED).toEqual('08/30/2015');
			expect(modifiedResponse.dueDateMilliseconds).toEqual(moment(response.EXPIRATIONTIME).valueOf());
			expect(modifiedResponse.priorityFormatted).toEqual('High');
			expect(modifiedResponse.ACTIVE).toEqual(true);
			expect(modifiedResponse.PATIENTNAMESSN).toEqual('BCMA,Eight (1234)');
		});
	});
});