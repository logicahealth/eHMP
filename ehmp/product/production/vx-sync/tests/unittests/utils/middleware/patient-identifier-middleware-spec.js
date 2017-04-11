'use strict';

require('../../../../env-setup');

var _ = require('underscore');

var DummyRequest = require('../../../frames/dummy-request');
var DummyResponse = require('../../../frames/dummy-response');

var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');

var log = require(global.VX_DUMMIES + 'dummy-logger');
var config = {
    'vistaSites': {
        '9E7A': {
            'name': 'panorama',
            'stationNumber': 500,
        },
        'C877': {
            'name': 'kodak',
            'stationNumber': 500,
        }
    },
    'hdr': {
        'operationMode': 'REQ/RES'
    }
};

// NOTE: be sure next lines are commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'patient-identifier-middleware-spec',
//     level: 'debug'
// });

var options = {
    'log': log,
    'config': config,
    'jdsClient': {}
};

var PatientIdentifierMiddleware = require(global.VX_UTILS + 'middleware/patient-identifier-middleware');

var mockIdentifierData = require(global.VX_ROOT + 'mocks/jds/jds-mock-identifier-data');

var validatePatientIdentifier = PatientIdentifierMiddleware._tests._validatePatientIdentifier;
var getJPID = PatientIdentifierMiddleware._tests._getJPID;
var resolveJPID = PatientIdentifierMiddleware._tests._resolveJPID;
var createJPID = PatientIdentifierMiddleware._tests._createJPID;

var KNOWN_IDENTIFIER = {
    'type': 'pid',
    'value': 'ABCD;0'
};

var UNKNOWN_IDENTIFIER = {
    'type': 'pid',
    'value': 'ABCD;4'
};

var SEPARATED_IDENTIFIER = {
    'type': 'pid',
    'value': 'ABCD;19'
};

describe('middleware/patient-identifier.js', function() {
    describe('validatePatientIdentifier ()', function() {
        it('Rejects requests without a valid query parameter', function() {
            var response = new DummyResponse();
            validatePatientIdentifier.call(options, new DummyRequest(), response, function() {});
            expect(response.statusCode).toEqual(400);
            expect(response.response).toEqual('Please provide one valid patient identifier.');
        });

        it('Rejects requests with too many parameters', function() {
            var requestParameters = {
                'pid': '9E7A;3',
                'icn': '10108V420871'
            };
            var response = new DummyResponse();
            validatePatientIdentifier.call(options, new DummyRequest(requestParameters), response, function() {});
            expect(response.statusCode).toEqual(400);
            expect(response.response).toEqual('Please limit your request to one patient identifier.');
        });

        it('Rejects empty parameters', function() {
            var requestParameters = {
                'pid': ''
            };
            var response = new DummyResponse();
            validatePatientIdentifier.call(options, new DummyRequest(requestParameters), response, function() {});
            expect(response.statusCode).toEqual(400);
            expect(response.response).toEqual('No value was given for the query parameter pid');
        });

        it('Rejects invalid PIDs', function() {
            var requestParameters = {
                'pid': '10108V420871'
            };
            var response = new DummyResponse();
            validatePatientIdentifier.call(options, new DummyRequest(requestParameters), response, function() {});
            expect(response.statusCode).toEqual(400);
            expect(response.response).toEqual('The value "10108V420871" for patient id type "pid" was not in a valid format');
        });

        it('Rejects invalid ICNs', function() {
            var requestParameters = {
                'icn': '9E7A;3'
            };
            var response = new DummyResponse();
            validatePatientIdentifier.call(options, new DummyRequest(requestParameters), response, function() {});
            expect(response.statusCode).toEqual(400);
            expect(response.response).toEqual('The value "9E7A;3" for patient id type "icn" was not in a valid format');
        });

        it('Appends a PID patientIdentifier json property to valid request objects', function() {
            var request = new DummyRequest({
                'pid': '9E7A;3'
            });
            var response = new DummyResponse();
            validatePatientIdentifier.call(options, request, response, function() {});
            var patientIdentifierObj = request.patientIdentifier;
            expect(patientIdentifierObj.type).toEqual('pid');
            expect(patientIdentifierObj.value).toEqual('9E7A;3');
        });

        xit('Appends an PID patientIdentifier json property to valid request objects when receiving an ICN', function() {
            var request = new DummyRequest({
                'icn': '10108V420871'
            });
            var response = new DummyResponse();
            var next = jasmine.createSpy();
            var opts = _.clone(options);
            opts.jdsClient.getOperationalDataPtSelectByIcn = jasmine.createSpy().andCallFake(function(icn, callback) {
                var retObj = {
                    'data': {
                        'items': [{
                            'pid': '9E7A;3'
                        }, {
                            'pid': 'C877;3'
                        }]
                    }
                };

                callback(null, {
                    'statusCode': 200
                }, retObj);
            });

            validatePatientIdentifier.call(opts, request, response, function() {});
            var patientIdentifierObj = request.patientIdentifier;
            expect(patientIdentifierObj.type).toEqual('pid');
            expect(patientIdentifierObj.value).toEqual('9E7A;3');
        });

        it('Appends an ICN patientIdentifier json property to valid request objects because it fails to look up pid', function() {
            var request = new DummyRequest({
                'icn': '10108V420871'
            });
            var response = new DummyResponse();
            var next = jasmine.createSpy();
            var opts = _.clone(options);
            opts.jdsClient.getOperationalDataPtSelectByIcn = jasmine.createSpy().andCallFake(function(icn, callback) {
                callback('Failed to retrieve patient', {
                    'statusCode': 404
                }, null);
            });

            validatePatientIdentifier.call(opts, request, response, function() {});
            var patientIdentifierObj = request.patientIdentifier;
            expect(patientIdentifierObj.type).toEqual('icn');
            expect(patientIdentifierObj.value).toEqual('10108V420871');
        });

        it('Appends an ICN patientIdentifier json property to valid request objects because no pids are available', function() {
            var request = new DummyRequest({
                'icn': '10108V420871'
            });
            var response = new DummyResponse();
            var next = jasmine.createSpy();
            var opts = _.clone(options);
            opts.jdsClient.getOperationalDataPtSelectByIcn = jasmine.createSpy().andCallFake(function(icn, callback) {
                var retObj = {
                    'data': {
                        'items': []
                    }
                };

                callback(null, {
                    'statusCode': 200
                }, retObj);
            });

            validatePatientIdentifier.call(opts, request, response, function() {});
            var patientIdentifierObj = request.patientIdentifier;
            expect(patientIdentifierObj.type).toEqual('icn');
            expect(patientIdentifierObj.value).toEqual('10108V420871');
        });
    });

    describe('getJPID()', function() {
        it('Appends the JPID for a known patient identifier to the request', function() {
            var request = {
                'patientIdentifier': KNOWN_IDENTIFIER
            };
            var response = new DummyResponse();
            var next = jasmine.createSpy();
            var opts = _.clone(options);
            opts.jdsClient.getPatientIdentifier = jasmine.createSpy().andCallFake(function(job, callback) {
                var retObj = {
                    'jpid': mockIdentifierData.identifierToJpidMap[job.patientIdentifier.value]
                };
                callback(null, {
                    'statusCode': 200
                }, retObj);
            });

            runs(function() {
                getJPID.call(opts, request, response, next);
            });

            waitsFor(function() {
                return next.callCount > 0;
            });

            runs(function() {
                expect(request.jpid).toEqual('21EC2020-3AEA-4069-A2DD-08002B30309D');
            });
        });

        it('Appends false for an unknown patient identifier', function() {
            var request = {
                'patientIdentifier': UNKNOWN_IDENTIFIER
            };
            var response = new DummyResponse();
            var next = jasmine.createSpy();
            var opts = _.clone(options);
            opts.jdsClient.getPatientIdentifier = jasmine.createSpy().andCallFake(function(job, callback) {
                callback(404, {
                    'statusCode': 404
                }, 'Patient not found');
            });

            runs(function() {
                getJPID.call(opts, request, response, next);
            });

            waitsFor(function() {
                return next.callCount > 0;
            });

            runs(function() {
                expect(request.jpid).toBe(false);
            });
        });
    });

    describe('resolveJPID()', function() {
        it('Gets the JPID for a PID that has been disconnected form its ICN via corresponding ICN in pt-select that has already been assigned a JPID in JDS', function() {
            var request = {
                'patientIdentifier': SEPARATED_IDENTIFIER
            };
            var response = {};
            var opts = _.clone(options);
            opts.getJPID = getJPID;

            opts.mviClient = {
                lookup: function(patientIdentifier, callback) {
                    return callback(null, {ids: [{
                        type: 'icn',
                        value: '000000V111111'
                    }, {
                        type: 'pid',
                        value: 'ABCD;19'
                    }, {
                        type: 'pid',
                        value: 'DOD;1111111'
                    }]} );
                }
            };

            var jdsClientDummy = new JdsClientDummy(log, {
                jds: {}
            });

            jdsClientDummy._setResponseData([null, null, null], [{
                statusCode: 404
            }, {
                statusCode: 200
            }, {
                statusCode: 200
            }], [null, {
                jpid: '21EC2020-3AEA-4069-A2DD-DDDDDDDDDDDD',
                patientIdentifiers: ['000000V111111', 'DOD;1111111']
            }, null]);

            opts.jdsClient = jdsClientDummy;
            var done = false;

            runs(function() {
                resolveJPID.call(opts, request, response, function() {
                    expect(request.jpid).toBeTruthy();
                    expect(request.jpid).toEqual('21EC2020-3AEA-4069-A2DD-DDDDDDDDDDDD');
                    expect(request.identifiers).toContain('000000V111111');
                    expect(request.identifiers).toContain('DOD;1111111');
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Calls getJPID normally if a JPID is found the first time', function() {
            var request = {
                'patientIdentifier': SEPARATED_IDENTIFIER
            };
            var response = {};
            var opts = _.clone(options);
            opts.getJPID = getJPID;

            var jdsClientDummy = new JdsClientDummy(log, {
                jds: {}
            });
            jdsClientDummy._setResponseData([null], [{
                statusCode: 200
            }], [{
                jpid: '21EC2020-3AEA-4069-A2DD-DDDDDDDDDDDD',
                patientIdentifiers: ['000000V111111', 'ABCD;19', 'DOD;1111111']
            }]);

            opts.jdsClient = jdsClientDummy;
            var done = false;

            runs(function() {
                resolveJPID.call(opts, request, response, function() {
                    expect(request.jpid).toBeTruthy();
                    expect(request.jpid).toEqual('21EC2020-3AEA-4069-A2DD-DDDDDDDDDDDD');
                    expect(request.identifiers).toContain('000000V111111');
                    expect(request.identifiers).toContain('DOD;1111111');
                    expect(request.identifiers).toContain('ABCD;19');
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });
    });

    describe('createJPID()', function() {
        it('Does not alter a request\'s jpid property if it is not false', function() {
            var request = new DummyRequest({});
            request.jpid = 'TEST VALUE';
            var response = new DummyResponse();
            var next = jasmine.createSpy();

            runs(function() {
                createJPID.call(options, request, response, next);
            });

            waitsFor(function() {
                return next.callCount > 0;
            }, 'The JPID property is not modified', 100);

            runs(function() {
                expect(request.jpid).toEqual('TEST VALUE');
            });
        });

        it('Sets a request\'s jpid property correctly if a known identifier is submitted', function() {
            var request = new DummyRequest();
            request.jpid = false;
            request.patientIdentifier = KNOWN_IDENTIFIER;
            var response = new DummyResponse();
            var next = jasmine.createSpy();
            var opts = _.clone(options);
            opts.jdsClient = {
                'getPatientIdentifier': jasmine.createSpy().andCallFake(function(job, callback) {
                    var retObj = {
                        'jpid': mockIdentifierData.identifierToJpidMap[job.patientIdentifier.value]
                    };
                    callback(null, {
                        'statusCode': 200
                    }, retObj);
                }),
                'storePatientIdentifier': jasmine.createSpy().andCallFake(function(job, callback) {
                    var retObj = {
                        'jpid': '21EC2020-3AEA-4069-A2DD-08002B30309D'
                    };
                    callback(null, {}, retObj);
                })
            };
            opts.getJPID = getJPID;

            runs(function() {
                createJPID.call(opts, request, response, next);
            });

            waitsFor(function() {
                return next.callCount > 0;
            });

            runs(function() {
                expect(request.jpid).toEqual('21EC2020-3AEA-4069-A2DD-08002B30309D');
            });
        });

        it('Sets a request\'s jpid property to a new JPID if an unknown identifier is submitted', function() {
            var request = new DummyRequest();
            request.jpid = false;
            request.patientIdentifier = UNKNOWN_IDENTIFIER;
            var response = new DummyResponse();
            var next = jasmine.createSpy();
            var opts = _.clone(options);
            opts.jdsClient = {
                'getPatientIdentifier': jasmine.createSpy().andCallFake(function(job, callback) {
                    var retObj = {
                        'jpid': '21EC2020-3AEA-4069-A2DD-FFFFFFFFFFFF'
                    };
                    callback(null, {
                        'statusCode': 200
                    }, retObj);
                }),
                'storePatientIdentifier': jasmine.createSpy().andCallFake(function(job, callback) {
                    var retObj = {
                        'jpid': '21EC2020-3AEA-4069-A2DD-FFFFFFFFFFFF'
                    };
                    callback(null, {}, retObj);
                })
            };
            opts.getJPID = getJPID;

            runs(function() {
                createJPID.call(opts, request, response, next);
            });

            waitsFor(function() {
                return next.callCount > 0;
            });

            runs(function() {
                expect(request.jpid).toMatch(/[0-9A-F]{8}(?:-[0-9A-F]{4}){3}-[0-9A-F]{12}/);
                expect(request.jpid).toNotMatch(/21EC2020-3AEA-4069-A2DD-08002B30309D/);
                expect(request.jpid).toNotMatch(/21EC2020-3AEA-4069-A2DD-[A]{12}/);
                expect(request.jpid).toNotMatch(/21EC2020-3AEA-4069-A2DD-[B]{12}/);
                expect(request.jpid).toNotMatch(/21EC2020-3AEA-4069-A2DD-[C]{12}/);
            });
        });
    });
});