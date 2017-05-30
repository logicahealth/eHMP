'use strict';
require('../../../../env-setup');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var logger = require(global.VX_DUMMIES + 'dummy-logger');
// logger = require('bunyan').createLogger({
//     name: 'pjds-client',
//     level: 'debug'
// });

var pjdsClient = new PjdsClient(logger, logger);

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

    it('removes from the pJDS blacklist', function () {
        var finished;

        runs(function () {
            pjdsClient.removeFromOsyncBlist('ABCD;1', 'ABCD', 'patient', function () {
                finished = true;

                expect(pjdsClient.execute.callCount).toEqual(1);
                expect(pjdsClient.execute).toHaveBeenCalledWith('/osyncBlist/urn:va:patient:ABCD:1:1',
                    null, 'DELETE', jasmine.any(Object), jasmine.any(Function));
            });
        });

        waitsFor(function () {
            return finished;
        });
    });

    it('retrieves the pJDS blacklist', function () {
        var finished;

        runs(function () {
            pjdsClient.getOsyncBlist('patient', function () {
                finished = true;

                expect(pjdsClient.execute.callCount).toEqual(1);
                expect(pjdsClient.execute).toHaveBeenCalledWith('/osyncBlist/index/osyncblist-patient',
                    null, 'GET', jasmine.any(Object), jasmine.any(Function));
            });
        });

        waitsFor(function () {
            return finished;
        });
    });

    describe('clinical object operations', function () {
        it('adds a clinical object to pJDS', function () {
            var finished;
            var doc = {
                'uid': 'urn:va:ehmp-activity:ASDF:8:29f56fb8-f87f-48c2-a8d2-deda0bb3f694',
                'patientUid': 'urn:va:patient:ASDF:8:8',
                'authorUid': 'urn:va:user:ASDF:238',
                'domain': 'ehmp-activity',
                'subDomain': 'request',
                'visit': {
                    'location': 'urn:va:location:ASDF:1',
                    'serviceCategory': 'PSB',
                    'dateTime': 20170201083322
                },
                'ehmpState': 'active',
                'displayName': 'sampleInstance',
                'referenceId': '',
                'data': {
                    'activity': {'text': 'Hey i am sample activity data'},
                    'signals': [
                        {'text': 'Hey i am sample signal data'}
                    ],
                    'requests': [
                        {'text': 'Hey i am sample request json'}
                    ],
                    'responses': [
                        {'text': 'Hey i am sample response json'}
                    ]
                }
            };

            runs(function () {
                pjdsClient.createClinicalObject(doc, function () {
                    finished = true;
                    expect(pjdsClient.execute.callCount).toEqual(1);
                    expect(pjdsClient.execute).toHaveBeenCalledWith('/clinicobj', doc, 'POST', jasmine.any(Object), jasmine.any(Function));
                });
            });

            waitsFor(function () {
                return finished;
            });
        });

        it('updates a clinical object stored in pJDS', function () {
            var finished;
            var doc = {
                'uid': 'urn:va:ehmp-activity:ASDF:8:29f56fb8-f87f-48c2-a8d2-deda0bb3f694',
                'patientUid': 'urn:va:patient:ASDF:8:8',
                'authorUid': 'urn:va:user:ASDF:238',
                'domain': 'ehmp-activity',
                'subDomain': 'request',
                'visit': {
                    'location': 'urn:va:location:ASDF:1',
                    'serviceCategory': 'PSB',
                    'dateTime': 20170201083322
                },
                'ehmpState': 'active',
                'displayName': 'sampleInstance',
                'referenceId': '',
                'data': {
                    'activity': {'text': 'Hey i am sample activity data, with new stuff'},
                    'signals': [
                        {'text': 'Hey i am sample signal data, now with more data!'}
                    ],
                    'requests': [
                        {'text': 'Hey i am sample request json, now with more requests.'}
                    ],
                    'responses': [
                        {'text': 'Hey i am sample response json, now with more responses.'}
                    ]
                }
            };

            runs(function () {
                pjdsClient.updateClinicalObject(doc.uid, doc, function () {
                    finished = true;
                    expect(pjdsClient.execute.callCount).toEqual(1);
                    expect(pjdsClient.execute).toHaveBeenCalledWith('/clinicobj/' + doc.uid, doc, 'POST', jasmine.any(Object), jasmine.any(Function));
                });
            });

            waitsFor(function () {
                return finished;
            });
        });

        it('deletes a clinical object stored in pJDS', function () {
            var finished;
            var uid = 'urn:va:ehmp-activity:ASDF:8:29f56fb8-f87f-48c2-a8d2-deda0bb3f694';

            runs(function () {
                pjdsClient.deleteClinicalObject(uid, function () {
                    finished = true;
                    expect(pjdsClient.execute.callCount).toEqual(1);
                    expect(pjdsClient.execute).toHaveBeenCalledWith('/clinicobj/' + uid, null, 'DELETE', jasmine.any(Object), jasmine.any(Function));
                });
            });

            waitsFor(function () {
                return finished;
            });
        });

        it('retrieves clinical object without a filter', function() {
            var finished;

            runs(function() {
                pjdsClient.getClinicalObject('', function(error) {
                    expect(pjdsClient.execute.callCount).toEqual(0);
                    expect(error).toBeTruthy();

                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });

        it('retrieves clinical object with a filter', function() {
            var finished;

            runs(function() {
                pjdsClient.getClinicalObject('filter=eq(domain, "ehmp-activity")', function() {
                    finished = true;

                    expect(pjdsClient.execute.callCount).toEqual(1);
                    expect(pjdsClient.execute).toHaveBeenCalledWith('/clinicobj/?filter=eq(domain, "ehmp-activity")',
                        null, 'GET', jasmine.any(Object), jasmine.any(Function));
                });
            });

            waitsFor(function() {
                return finished;
            });
        });

        it('retrieves clinical object with an index and filter', function() {
            var finished;

            runs(function () {
                pjdsClient.getClinicalObject('range=urn:va:activity:9E7A:239:29fe0301-14ac-4d8d-95a9-9f538866beba', 'clinicobj_uid', function () {
                    expect(pjdsClient.execute.callCount).toEqual(1);
                    expect(pjdsClient.execute).toHaveBeenCalledWith('/clinicobj/index/clinicobj_uid?range=urn:va:activity:9E7A:239:29fe0301-14ac-4d8d-95a9-9f538866beba',
                        null, 'GET', jasmine.any(Object), jasmine.any(Function));

                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            });
        });
    });
});
