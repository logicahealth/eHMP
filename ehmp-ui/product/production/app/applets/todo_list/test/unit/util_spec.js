define([
	'test/stubs',
	'jasminejquery',
	'app/applets/todo_list/util'
], function(Stubs, Jasmine, Util) {
	'use strict';

	describe('Unit tests for todo_list applet utils', function() {
		function buildMessagingResponse(screenId) {
			return  {
				config: {
					id: screenId
				}
			};
		}

		it('Should return staff view for correct view', function(){
			spyOn(ADK.Messaging, 'request').and.returnValue(buildMessagingResponse('provider-centric-view'));
			expect(Util.isStaffView()).toEqual(true);
		});

		it('Should return staff view for correct view', function(){
			spyOn(ADK.Messaging, 'request').and.returnValue(buildMessagingResponse('summary'));
			expect(Util.isStaffView()).toEqual(false);
		});
	});
});