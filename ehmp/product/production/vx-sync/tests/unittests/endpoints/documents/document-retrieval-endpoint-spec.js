'use strict';

require('../../../../env-setup');
var endpoint = require(global.VX_ENDPOINTS + 'documents/document-retrieval-endpoint');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
var config = {
	'documentStorage': {
		'publish': {
			'path': 'test'
		}
	}
};

var res = {
	status: function() { return this; },
	sendFile: jasmine.createSpy()
};

var req = {
	param: function() { return 'test.test'; },
	headers: {
		'x-session-id': 'sessionId',
		'x-request-id': 'requestId'
	}
};

describe('document-retrieval-endpoint.js', function() {
	describe('_getDocument', function() {
		it('uses referenceInfo', function() {
			spyOn(logger, 'child').andCallThrough();
			runs(function() {
				endpoint._getDocument(logger, config, req, res);
			});
			waitsFor(function() {
				return res.sendFile.calls;
			});
			runs(function() {
				expect(logger.child).toHaveBeenCalled();
				expect(logger.child).toHaveBeenCalledWith(jasmine.objectContaining({
					'requestId': 'requestId',
					'sessionId': 'sessionId'
				}));
			});
		});
	});
});