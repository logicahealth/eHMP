'use strict';
require('../../../../env-setup');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');

var pjdsClient = new PjdsClient(null, null);

describe('pjds-client.js', function() {
	beforeEach(function() {
		spyOn(pjdsClient,'execute').andCallFake(function(url, payload, method, metrics, callback) {
			callback();
		});
	});

	it('adds to the pJDS blacklist', function() {
		var finished;

		runs(function() {
			pjdsClient.addToOsyncBlist('ABCD;1', 'ABCD', 'patient', function() {
				finished = true;

				expect(pjdsClient.execute.callCount).toEqual(1);
				expect(pjdsClient.execute).toHaveBeenCalledWith('/osyncBlist',
						jasmine.objectContaining({'id':'ABCD;1'}),
						'POST', jasmine.any(Object), jasmine.any(Function));
			});
		});

		waitsFor(function() {
			return finished;
		});
	});

	it('removes from the pJDS blacklist', function() {
		var finished;

		runs(function() {
			pjdsClient.removeFromOsyncBlist('ABCD;1', 'ABCD', 'patient', function() {
				finished = true;

				expect(pjdsClient.execute.callCount).toEqual(1);
				expect(pjdsClient.execute).toHaveBeenCalledWith('/osyncBlist/urn:va:patient:ABCD:1:1',
						null, 'DELETE', jasmine.any(Object), jasmine.any(Function));
			});
		});

		waitsFor(function() {
			return finished;
		});
	});

	it('retrieves the pJDS blacklist', function() {
		var finished;

		runs(function() {
			pjdsClient.getOsyncBlist('patient', function() {
				finished = true;

				expect(pjdsClient.execute.callCount).toEqual(1);
				expect(pjdsClient.execute).toHaveBeenCalledWith('/osyncBlist/index/osyncblist-patient',
						null, 'GET', jasmine.any(Object), jasmine.any(Function));
			});
		});

		waitsFor(function() {
			return finished;
		});
	});
});