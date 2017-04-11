'use strict';

var _ = require('underscore');
var request = require('request');
var nock = require('nock');
var format = require('util').format;
var querystring = require('querystring');

require('../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var fsUtil = require(global.VX_UTILS + 'fs-utils');
var MviClient = require(global.VX_SUBSYSTEMS + 'mvi/mvi-client');
// log = require('bunyan').createLogger({
//     name: 'test',
//     level: 'debug'
// });

var config = require(global.VX_ROOT + 'worker-config');

var patientFullId = {
    type: 'icn',
    value: '10110V004877'
};

var patientFull = {
    name: 'Ten,Patient',
    ids: [{
        type: 'icn',
        value: '10110V004877'
    }, {
        type: 'edipi',
        value: '10110'
    }, {
        type: 'pid',
        value: 'C877;8'
    }, {
        type: 'pid',
        value: '9E7A;8'
    }]
};
var jds = {}; //not used in unit tests

var url = format('%s://%s:%s', config.mvi.protocol, config.mvi.host, config.mvi.port);

var mviSoapResponse = {
                'PRPA_IN201310UV02': {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: {
                            registrationEvent: {
                                subject1: {
                                    patient: {
                                        id: [{
                                            extension: '3^PI^500^USVHA^A'
                                        }, {
                                            extension: '2^PI^507^USVHA^A'
                                        }, {
                                            extension: '5^PI^600^USVHA^A'
                                        }, {
                                            extension: '0000000003^NI^200DOD^USDOD^P'
                                        }, {
                                            extension: '10108V420871^NI^200M^USVHA^P'
                                        }, {
                                            extension: '1111^PI^742V1^USVHA^A' // VHIC ID Format coming from Global MVI - Active
                                        }, {
                                            extension: '2222^PI^742V1^USVHA^H' // VHIC ID Format coming from Global MVI - Not Active
                                        }]
                                    }
                                }
                            }
                        }
                    }
                }
            };

//mvi(log, config.mvi, patientId, callback)

describe('mvi-client.js', function() {
    describe('parsing tests', function() {
        it('construct results', function() {
            var mviClient = new MviClient(log, log, config, jds);
            var idList = '3^PI^USVHA^500^A\r\n3^PI^USVHA^507^A\r\n5^PI^USVHA^600^H\r\n0000000003^NI^USDOD^200DOD^A\r\n10108V420871^NI^USVHA^200M^A\r\n1111^PI^USVHA^742V1^A\r\n2222^PI^USVHA^742V1^H';
            mviClient._parseVistaMVIResponse(patientFullId, idList, 1, function(err, result) {
                expect(err).toBeFalsy();
                expect(_.isArray(result.ids)).toBeTruthy();
                expect(result.ids.length).toEqual(6);
                expect(result.ids).toContain({
                    type: 'vhicid',
                    value: '1111',
                    active: true
                });
                expect(result.ids).toContain({
                    type: 'vhicid',
                    value: '2222'
                });


            });
        });
        it('parsing error response', function() {
            var mviClient = new MviClient(log, log, config, jds);
            var idList = '-1^Unknown Authority';
            mviClient._parseVistaMVIResponse(patientFullId, idList, 1, function(err) {
                expect(err).toBeTruthy();
            });
        });
        it('parsing mvi soap response', function() {
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = mviSoapResponse;
            mviClient._parseRealMVIResponse(patientFullId, mviResponse, 1, function(err, result) {
                expect(err).toBeFalsy();
                expect(_.isArray(result.ids)).toBeTruthy();
                expect(result.ids.length).toEqual(6);
                expect(result.ids).toContain({
                    type: 'vhicid',
                    value: '1111',
                    active: true
                });
                expect(result.ids).toContain({
                    type: 'vhicid',
                    value: '2222'
                });
            });
        });

        it('parsing mvi soap response patient not found', function() {
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201310UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'NF'
                            }
                        }
                    }
                }
            };
            mviClient._parseRealMVIResponse(patientFullId, mviResponse, 1, function(err) {
                expect(err).toBeTruthy();
            });
        });

        it('parsing mvi soap response other error', function() {
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201310UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'AE'
                            }
                        }
                    }
                }
            };
            mviClient._parseRealMVIResponse(patientFullId, mviResponse, 1, function(err) {
                expect(err).toBeTruthy();
            });
        });

        xit('parsing mvi soap response incorrect response', function() {
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {};
            mviClient._parseRealMVIResponse(patientFullId, mviResponse, 1, function(err) {
                expect(err).toBeTruthy();
            });
        });

        it('handle real mvi json response - ok', function() {
            var mviClient = new MviClient(log, log, config, jds);
            var okFile = fsUtil.readFileSync('./tests/data/mvi/mviCorrespondingIdsOK.json');
            if (Buffer.isBuffer(okFile)) {
                okFile = okFile.toString('UTF-8');
                okFile = JSON.parse(okFile);
            }

            mviClient._parseRealMVIResponse(patientFullId, okFile, 1, function(err, result) {
                expect(err).toBeFalsy();
                expect(_.isArray(result.ids)).toBeTruthy();
                expect(result.ids.length).toEqual(3);
            });
        });

        it('handle real mvi json response - not found', function() {
            var mviClient = new MviClient(log, log, config, jds);
            var errFile = fsUtil.readFileSync('./tests/data/mvi/mviCorrespondingIdsNotFound.json');
            if (Buffer.isBuffer(errFile)) {
                errFile = errFile.toString('UTF-8');
                errFile = JSON.parse(errFile);
            }

            mviClient._parseRealMVIResponse(patientFullId, errFile, 1, function(err) {
                expect(err).toBeTruthy();
            });
        });
    });

    describe('lookup tests', function() {
        var libGet;

        beforeEach(function() {
            libGet = request.get;
        });

        afterEach(function() {
            request.get = libGet;
        });
        it('Error path: EDIPI: Get error 500 from soap handler mvi request', function() {
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true); // Note that ';' = %3B when encoded.
                return callback('error', {
                    statusCode: 500
                }, null);
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };

            var localError;
            var localStatusCode;
            var completed = false;
            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, statusCode) {
                    localError = error;
                    localStatusCode = statusCode;
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

            runs(function() {
                expect(localError).toBeTruthy();
                expect(localError.type).toEqual('transient-exception');
            });
        });
        it('Error path: ICN: Get response 500 from soap handler mvi request', function() {
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?icn=1234V5$/.test(options.url)).toBe(true);
                return callback('error', {
                    statusCode: 500
                }, null);
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'icn',
                value: '1234V5'
            };

            var localError;
            var localStatusCode;
            var completed = false;
            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, statusCode) {
                    localError = error;
                    localStatusCode = statusCode;
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

            runs(function() {
                expect(localError).toBeTruthy();
                expect(localError.type).toEqual('transient-exception');
            });
        });
        it('Error path: ICN: Get error from soap handler mvi request', function() {
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?icn=1234V5$/.test(options.url)).toBe(true);
                return callback('error', null, null);
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'icn',
                value: '1234V5'
            };

            var localError;
            var localStatusCode;
            var completed = false;
            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, statusCode) {
                    localError = error;
                    localStatusCode = statusCode;
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

            runs(function() {
                expect(localError).toBeTruthy();
                expect(localError.type).toEqual('transient-exception');
            });
        });
        it('Error path: ICN: Get response 400 from soap handler mvi request', function() {
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?icn=1234V5$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 400
                }, null);
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'icn',
                value: '1234V5'
            };

            var localError;
            var localStatusCode;
            var completed = false;
            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, statusCode) {
                    localError = error;
                    localStatusCode = statusCode;
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

            runs(function() {
                expect(localError).toBeTruthy();
                expect(localError.type).toEqual('fatal-exception');
            });
        });
        it('Error path: ICN: Get response 404 from soap handler mvi request', function() {
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?icn=1234V5$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 404
                }, null);
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'icn',
                value: '1234V5'
            };

            var localError;
            var localStatusCode;
            var completed = false;
            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, statusCode) {
                    localError = error;
                    localStatusCode = statusCode;
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

            runs(function() {
                expect(localError).toBeTruthy();
                expect(localError.type).toEqual('fatal-exception');
            });
        });
        it('Error path: ICN: Get response 204 from soap handler mvi request', function() {
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?icn=1234V5$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 404
                }, null);
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'icn',
                value: '1234V5'
            };

            var localError;
            var localStatusCode;
            var completed = false;
            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, statusCode) {
                    localError = error;
                    localStatusCode = statusCode;
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

            runs(function() {
                expect(localError).toBeTruthy();
                expect(localError.type).toEqual('fatal-exception');
            });
        });
        it('Error path: ICN: JSON parse error', function() {
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?icn=1234V5$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, '{bad json: ');
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'icn',
                value: '1234V5'
            };

            var localError;
            var localStatusCode;
            var completed = false;
            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, statusCode) {
                    localError = error;
                    localStatusCode = statusCode;
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

            runs(function() {
                expect(localError).toBeTruthy();
                expect(localError.type).toEqual('fatal-exception');
                expect(localError.message).toEqual('Unable to parse JSON');
            });
        });

        it('Happy path: ICN', function(){
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?icn=1234V5$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mviSoapResponse));
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'icn',
                value: '1234V5'
            };

            var completed = false;
            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, mviResponse) {
                    expect(error).toBeFalsy();
                    expect(mviResponse).toBeTruthy();
                    expect(mviResponse.ids.length).toEqual(6);
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });

        it('Happy path: EDIPI', function(){
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mviSoapResponse));
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };

            var completed = false;
            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, mviResponse) {
                    expect(error).toBeFalsy();
                    expect(mviResponse).toBeTruthy();
                    expect(mviResponse.ids.length).toEqual(6);
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });

        it('Happy path: PID', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var mviClient = new MviClient(log, log, config, jds);

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback(null, '10108V420871^NI^USVHA^200M^A\r\n3^PI^USVHA^500^A\r\n3^PI^USVHA^507^A\r\n32758^PI^USVHA^742V1^A\r\n19^PI^USVHA^536^A\r\n0000000003^NI^USDOD^200DOD^A\r\n38^PI^USVHA^547^A\r\n28^PI^USVHA^551^A');
                }
            };

            mviClient.clientMap['9E7A'] = mockVistaClient;

            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, idsList) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(idsList).toBeTruthy();
                    expect(idsList.ids).toBeTruthy();
                    expect(idsList.ids.length).toEqual(7);
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Happy path: PID (get ICN via JDS demographics)', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback(null, '3^PI^USVHA^500^A\r\n3^PI^USVHA^507^A\r\n32758^PI^USVHA^742V1^A\r\n19^PI^USVHA^536^A\r\n0000000003^NI^USDOD^200DOD^A\r\n38^PI^USVHA^547^A\r\n28^PI^USVHA^551^A');
                }
            };

            var jdsResult = {
                data: {
                    items: [{
                        icn: '10108V420871'
                    }]
                }
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, {
                        statusCode: 200
                    }, jdsResult);
                }
            };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            mviClient.clientMap['9E7A'] = mockVistaClient;

            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, idsList) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(idsList).toBeTruthy();
                    expect(idsList.ids).toBeTruthy();
                    expect(idsList.ids.length).toEqual(7);
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Error path: PID (RPC returns error)', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var mviClient = new MviClient(log, log, config, jds);

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback({
                        error: 'ERROR!'
                    });
                }
            };

            mviClient.clientMap['9E7A'] = mockVistaClient;

            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, idsList) {
                    done = true;
                    expect(error).toBeTruthy();
                    expect(error.type).toEqual('transient-exception');
                    expect(idsList).toBeFalsy();
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Normal path: PID (No ids found after parsing RPC response)', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var mviClient = new MviClient(log, log, config, jds);

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback(null, []);
                }
            };

            mviClient.clientMap['9E7A'] = mockVistaClient;

            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, idsList) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(idsList).toBeTruthy();
                    expect(idsList.ids.length).toEqual(1);
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Error path: PID (Non-400 Error from JDS)', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback(null, '3^PI^USVHA^500^A\r\n3^PI^USVHA^507^A\r\n32758^PI^USVHA^742V1^A\r\n19^PI^USVHA^536^A\r\n0000000003^NI^USDOD^200DOD^A\r\n38^PI^USVHA^547^A\r\n28^PI^USVHA^551^A');
                }
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback({
                        code: 500
                    }, null, null);
                }
            };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            mviClient.clientMap['9E7A'] = mockVistaClient;

            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, idsList) {
                    done = true;
                    expect(error).toBeTruthy();
                    expect(error.type).toEqual('transient-exception');
                    expect(idsList).toBeFalsy();
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Normal path: PID (No demographics found in JDS)', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback(null, '3^PI^USVHA^500^A\r\n3^PI^USVHA^507^A\r\n32758^PI^USVHA^742V1^A\r\n19^PI^USVHA^536^A\r\n0000000003^NI^USDOD^200DOD^A\r\n38^PI^USVHA^547^A\r\n28^PI^USVHA^551^A');
                }
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, {
                        statusCode: 400
                    }, null);
                }
            };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            mviClient.clientMap['9E7A'] = mockVistaClient;

            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, idsList) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(idsList).toBeTruthy();
                    expect(idsList.ids).toBeTruthy();
                    expect(idsList.ids.length).toEqual(6);
                });
            });

            waitsFor(function() {
                return done;
            });
        });
    });

    describe('_retreiveIcnFromJdsDemographics', function() {
        it('Normal path', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var jdsResult = {
                data: {
                    items: [{
                        icn: '10108V420871'
                    }]
                }
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, {
                        statusCode: 200
                    }, jdsResult);
                }
            };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            runs(function() {
                mviClient._retreiveIcnFromJdsDemographics(patientIdentifier, function(error, icn) {
                    expect(error).toBeFalsy();
                    expect(icn).toBeTruthy();
                    expect(icn).toEqual('10108V420871');
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Normal path: no demographics', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, {
                        statusCode: 400
                    }, null);
                }
            };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            runs(function() {
                mviClient._retreiveIcnFromJdsDemographics(patientIdentifier, function(error, icn) {
                    expect(error).toBeFalsy();
                    expect(icn).toBeFalsy();
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Normal path: Empty result', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, {
                        statusCode: 200
                    }, null);
                }
            };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            runs(function() {
                mviClient._retreiveIcnFromJdsDemographics(patientIdentifier, function(error, icn) {
                    expect(error).toBeFalsy();
                    expect(icn).toBeFalsy();
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Error path: Unexpected response', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, {
                        statusCode: 403
                    }, null);
                }
            };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            runs(function() {
                mviClient._retreiveIcnFromJdsDemographics(patientIdentifier, function(error, icn) {
                    expect(error).toBeTruthy();
                    expect(icn).toBeFalsy();
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });

        it('Error path: Null response', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': '9E7A;3'
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, null, null);
                }
            };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            runs(function() {
                mviClient._retreiveIcnFromJdsDemographics(patientIdentifier, function(error, icn) {
                    expect(error).toBeTruthy();
                    expect(icn).toBeFalsy();
                    done = true;
                });
            });

            waitsFor(function() {
                return done;
            });
        });
    });

    //Old mock mvi test suite
    xdescribe('fetch()', function() {
        it('500 code', function() {
            nock(url)
                .get(format('%s?%s', config.mvi.path, querystring.stringify({
                    id: '500',
                    type: 'icn'
                })))
                .reply(500, 'Unknown error');

            var mviError;
            var mviResult;

            new MviClient(log, config).lookup({
                value: '500',
                type: 'icn'
            }, function(error, result) {
                mviError = error;
                mviResult = result;
            });

            waitsFor(function() {
                return mviError || mviResult;
            }, 'should return an error or result that is not undefined', 1000);

            runs(function() {
                expect(mviError).not.toBeUndefined();
            });
        });

        it('400 code', function() {
            nock(url)
                .get(format('%s?%s', config.mvi.path, querystring.stringify({
                    id: '400',
                    type: 'icn'
                })))
                .reply(400, 'No value for id');

            var mviError;
            var mviResult;

            new MviClient(log, config).lookup({
                value: '400',
                type: 'icn'
            }, function(error, result) {
                mviError = error;
                mviResult = result;
            });

            waitsFor(function() {
                return mviError || mviResult;
            }, 'should return an error or result that is not undefined', 1000);

            runs(function() {
                expect(mviError).not.toBeUndefined();
            });
        });

        it('404 code', function() {
            nock(url)
                .get(format('%s?%s', config.mvi.path, querystring.stringify({
                    id: '404',
                    type: 'icn'
                })))
                .reply(404, 'No patient found');

            var mviError;
            var mviResult;

            new MviClient(log, config).lookup({
                value: '404',
                type: 'icn'
            }, function(error, result) {
                mviError = error;
                mviResult = result;
            });

            waitsFor(function() {
                return mviError || mviResult;
            }, 'should return an error or result that is not undefined', 1000);

            runs(function() {
                expect(mviError).not.toBeUndefined();
            });
        });

        it('Bad JSON', function() {
            nock(url)
                .get(format('%s?%s', config.mvi.path, querystring.stringify({
                    id: 'json',
                    type: 'icn'
                })))
                .reply(200, '{ not valid jason');

            var mviError;
            var mviResult;

            new MviClient(log, config).lookup({
                value: 'json',
                type: 'icn'
            }, function(error, result) {
                mviError = error;
                mviResult = result;
            });

            waitsFor(function() {
                return mviError || mviResult;
            }, 'should return an error or result that is not undefined', 1000);

            runs(function() {
                expect(mviError).not.toBeUndefined();
            });
        });

        it('Valid result', function() {
            nock(url)
                .get(format('%s?%s', config.mvi.path, querystring.stringify({
                    id: patientFullId.value,
                    type: patientFullId.type
                })))
                .reply(200, JSON.stringify(patientFull));

            var mviError;
            var mviResult;

            new MviClient(log, config).lookup({
                value: patientFullId.value,
                type: patientFullId.type
            }, function(error, result) {
                mviError = error;
                mviResult = result;
            });

            waitsFor(function() {
                return mviError || mviResult;
            }, 'should return an error or result that is not undefined', 1000);

            runs(function() {
                expect(mviResult).toEqual(patientFull);
            });
        });
    });
});