define([
	'backbone',
	'marionette',
	'jasminejquery',
	'app/resources/fetch/timeline/util'
], function(Backbone, Marionette, jasminejquery, TimelineUtil) {
	'use strict';

    describe('Verify getDisplayType returns the appropriate type value', function() {
		it('should return appointment when the kind is visit and the uid is an appointment uid', function() {
			var response = {
				kind: 'Visit',
				uid: 'urn:va:appointment:SITE:1:101010101'
			};
			expect(TimelineUtil.getDisplayType(response)).toEqual('Appointment');
		});
		it('should return visit when the kind is visit and the uid is a visit uid', function() {
			var response = {
				kind: 'Visit',
				uid: 'urn:va:visit:SITE:1:101010101'
			};
			expect(TimelineUtil.getDisplayType(response)).toEqual('Visit');
		});
		it('should return the kind when the kind is not visit', function() {
			var response = {
				kind: 'Laboratory',
				uid: 'urn:va:lab:SITE:1:101010101'
			};
			expect(TimelineUtil.getDisplayType(response)).toEqual('Laboratory');
		});
	});

	describe('Verify getEnteredBy returns appropriate value', function() {
		it('should return createdByName for visit', function() {
			expect(TimelineUtil.getEnteredBy({displayType: 'visit', createdByName: 'Test,User'})).toEqual('Test,User');
		});

		it('should return providerName for consult', function() {
			expect(TimelineUtil.getEnteredBy({displayType: 'consult', providerName: 'Test,User'})).toEqual('Test,User');
		});

		it('should return provider name from providers array for type other than visit/consult', function() {
			var response = {
				providers: [{
					providerName: 'Test,User'
				}]
			};
			expect(TimelineUtil.getEnteredBy(response)).toEqual('Test,User');
		});

		it('should return primary provider name for type other than visit/consult', function() {
			expect(TimelineUtil.getEnteredBy({primaryProvider: {providerName: 'Test,User'}})).toEqual('Test,User');
		});

		it('should return secondary provider name for type other than visit/consult', function() {
			expect(TimelineUtil.getEnteredBy({secondaryProvider: 'Test,User'})).toEqual('TEST,USER');
		});

		it('should return provider name for type other than visit/consult', function() {
			expect(TimelineUtil.getEnteredBy({providerName: 'Test,User'})).toEqual('TEST,USER');
		});

		it('should return undefined if none of the conditions are met', function() {
			expect(TimelineUtil.getEnteredBy({})).toBeUndefined();
		});
	});
});