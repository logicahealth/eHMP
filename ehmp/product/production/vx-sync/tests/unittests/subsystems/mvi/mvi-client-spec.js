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
        value: 'SITE;8'
    }, {
        type: 'pid',
        value: 'SITE;8'
    }]
};
var jds = {}; //not used in unit tests
jds.childInstance = function() { return jds; };

var url = format('%s://%s:%s', config.mvi.protocol, config.mvi.host, config.mvi.port);

var mvi1309NotFoundResp  ={
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

var mviSoapResponseSingleId = {
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
                            id: {
                                extension: '3^PI^500^USVHA^A'
                            }
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

        it('parsing mvi soap response with single id', function() {
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = mviSoapResponseSingleId;
            mviClient._parseRealMVIResponse(patientFullId, mviResponse, 1, function(err, result) {
                expect(err).toBeFalsy();
                expect(_.isArray(result.ids)).toBeTruthy();
                expect(result.ids.length).toEqual(1);
                expect(result.ids).toContain({
                    type: 'pid',
                    value: 'SITE;3'
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
                'value': 'SITE;3'
            };

            var mviClient = new MviClient(log, log, config, jds);

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback(null, '10108V420871^NI^USVHA^200M^A\r\n3^PI^USVHA^500^A\r\n3^PI^USVHA^507^A\r\n32758^PI^USVHA^742V1^A\r\n19^PI^USVHA^536^A\r\n0000000003^NI^USDOD^200DOD^A\r\n38^PI^USVHA^547^A\r\n28^PI^USVHA^551^A');
                }
            };
            mockVistaClient.childInstance = function() { return mockVistaClient; };

            mviClient.clientMap['SITE'] = mockVistaClient;

            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, idsList) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(idsList).toBeTruthy();
                    expect(idsList.ids).toBeTruthy();
                    // For HDR PUB/SUB this will be 7
                    expect(idsList.ids.length).toEqual(5);
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
                'value': 'SITE;3'
            };

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback(null, '3^PI^USVHA^500^A\r\n3^PI^USVHA^507^A\r\n32758^PI^USVHA^742V1^A\r\n19^PI^USVHA^536^A\r\n0000000003^NI^USDOD^200DOD^A\r\n38^PI^USVHA^547^A\r\n28^PI^USVHA^551^A');
                }
            };
            mockVistaClient.childInstance = function() { return mockVistaClient; };

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

            mviClient.clientMap['SITE'] = mockVistaClient;

            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, idsList) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(idsList).toBeTruthy();
                    expect(idsList.ids).toBeTruthy();
                    // For HDR PUB/SUB this will be 7
                    expect(idsList.ids.length).toEqual(5);
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
                'value': 'SITE;3'
            };

            var mviClient = new MviClient(log, log, config, jds);

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback({
                        error: 'ERROR!'
                    });
                }
            };
            mockVistaClient.childInstance = function() { return mockVistaClient; };

            mviClient.clientMap['SITE'] = mockVistaClient;

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
                'value': 'SITE;3'
            };

            var mviClient = new MviClient(log, log, config, jds);

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback(null, []);
                }
            };
            mockVistaClient.childInstance = function() { return mockVistaClient; };

            mviClient.clientMap['SITE'] = mockVistaClient;

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
                'value': 'SITE;3'
            };

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback(null, '3^PI^USVHA^500^A\r\n3^PI^USVHA^507^A\r\n32758^PI^USVHA^742V1^A\r\n19^PI^USVHA^536^A\r\n0000000003^NI^USDOD^200DOD^A\r\n38^PI^USVHA^547^A\r\n28^PI^USVHA^551^A');
                }
            };
            mockVistaClient.childInstance = function() { return mockVistaClient; };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback({
                        code: 500
                    }, null, null);
                }
            };
            mockJdsClient.childInstance = function() { return mockJdsClient; };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            mviClient.clientMap['SITE'] = mockVistaClient;

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
                'value': 'SITE;3'
            };

            var mockVistaClient = {
                getIds: function(site, dfn, stationNumber, callback) {
                    callback(null, '3^PI^USVHA^500^A\r\n3^PI^USVHA^507^A\r\n32758^PI^USVHA^742V1^A\r\n19^PI^USVHA^536^A\r\n0000000003^NI^USDOD^200DOD^A\r\n38^PI^USVHA^547^A\r\n28^PI^USVHA^551^A');
                }
            };
            mockVistaClient.childInstance = function() { return mockVistaClient; };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, {
                        statusCode: 400
                    }, null);
                }
            };
            mockJdsClient.childInstance = function() { return mockJdsClient; };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            mviClient.clientMap['SITE'] = mockVistaClient;

            runs(function() {
                mviClient.lookup(patientIdentifier, function(error, idsList) {
                    done = true;
                    expect(error).toBeFalsy();
                    expect(idsList).toBeTruthy();
                    expect(idsList.ids).toBeTruthy();
                    // For HDR PUB/SUB this will be 6
                    expect(idsList.ids.length).toEqual(4);
                });
            });

            waitsFor(function() {
                return done;
            });
        });
    });

    describe('_retrieveIcnFromJdsDemographics', function() {
        it('Normal path', function() {
            var done;

            var patientIdentifier = {
                'type': 'pid',
                'value': 'SITE;3'
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
            mockJdsClient.childInstance = function() { return mockJdsClient; };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            runs(function() {
                mviClient._retrieveIcnFromJdsDemographics(patientIdentifier, function(error, icn) {
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
                'value': 'SITE;3'
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, {
                        statusCode: 400
                    }, null);
                }
            };
            mockJdsClient.childInstance = function() { return mockJdsClient; };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            runs(function() {
                mviClient._retrieveIcnFromJdsDemographics(patientIdentifier, function(error, icn) {
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
                'value': 'SITE;3'
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, {
                        statusCode: 200
                    }, null);
                }
            };
            mockJdsClient.childInstance = function() { return mockJdsClient; };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            runs(function() {
                mviClient._retrieveIcnFromJdsDemographics(patientIdentifier, function(error, icn) {
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
                'value': 'SITE;3'
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, {
                        statusCode: 403
                    }, null);
                }
            };
            mockJdsClient.childInstance = function() { return mockJdsClient; };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            runs(function() {
                mviClient._retrieveIcnFromJdsDemographics(patientIdentifier, function(error, icn) {
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
                'value': 'SITE;3'
            };

            var mockJdsClient = {
                getPtDemographicsByPid: function(pid, callback) {
                    callback(null, null, null);
                }
            };
            mockJdsClient.childInstance = function() { return mockJdsClient; };

            var mviClient = new MviClient(log, log, config, mockJdsClient);

            runs(function() {
                mviClient._retrieveIcnFromJdsDemographics(patientIdentifier, function(error, icn) {
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

    describe('test lookupWithDemographics', function() {
        var libPost;
        var libGet;

        beforeEach(function() {
            libPost = request.post;
            libGet = request.get;
        });

        afterEach(function() {
            request.get = libGet;
            request.post = libPost;
        });

        it('Happy path: ICN 1309 OK, No need for 1305', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) { // this function should never be called
                expect(options).toBeFalsy(); // force failure if it is called
                expect(callback).toBeFalsy();
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?icn=10108V420871$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mviSoapResponse));
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'icn',
                value: '10108V420871'
            };

            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeFalsy();
                    expect(mviResult).toBeTruthy();
                    expect(mviResult.ids.length).toEqual(6);
                    expect(mviResult.skipResyncCheck).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });

        it('Happy path: EDIPI 1309 OK, No need for 1305', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) { // this function should never be called
                expect(options).toBeFalsy();
                expect(callback).toBeFalsy();
            };
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
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeFalsy();
                    expect(mviResult).toBeTruthy();
                    expect(mviResult.ids.length).toEqual(6);
                    expect(mviResult.skipResyncCheck).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: ICN 1309 NF: Not found, No need for 1305', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) { // this function should never be called
                expect(options).toBeFalsy(); // force failure if it is called
                expect(callback).toBeFalsy();
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?icn=10108V420871$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'icn',
                value: '10108V420871'
            };

            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 NF: Not found, No Demographics, No need for 1305', function(){
            request.post = function(options, callback) { // this function should never be called
                expect(options).toBeFalsy();
                expect(callback).toBeFalsy();
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };

            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, null, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 QE: Too many records, No Need for 1305', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
           var mvi1309NotFoundResp  ={
                PRPA_IN201310UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'QE'
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) { // this function should never be called
                expect(options).toBeFalsy(); // force failure if it is called
                expect(callback).toBeFalsy();
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: error', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback('error', null, null);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: statusCode 500', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 500
                }, null);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: statusCode 400', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 400
                }, null);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: statusCode 404', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 404
                }, null);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: statusCode 204', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 204
                }, null);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: bad json', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, '{bad json: ');
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: empty body', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, {});
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: ER: Error', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mvi1305Resp = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'ER'
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 200
                }, mvi1305Resp);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: NF: Not Found', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mvi1305Resp = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'NF'
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 200
                }, mvi1305Resp);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: QE: Too Many Records', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mvi1305Resp = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'QE'
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 200
                }, mvi1305Resp);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: pid does not match', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mvi1305Resp = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: {
                            registrationEvent: {
                                subject1: {
                                    patient:{
                                        id: {
                                            extension: '0000000009^NI^200DOD^USDOD^P'
                                        },
                                        patientPerson: {
                                            name: {
                                                use: 'L',
                                                given: demographics.givenNames,
                                                family: demographics.familyName
                                            },
                                            asOtherIDs: {
                                                id: {
                                                    extension: demographics.ssn
                                                },
                                                classCode: 'SSN'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 200
                }, mvi1305Resp);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: demograpics familyName does not match', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mvi1305Resp = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: {
                            registrationEvent: {
                                subject1: {
                                    patient:{
                                        id: {
                                            extension: '0000000003^NI^200DOD^USDOD^P'
                                        },
                                        patientPerson: {
                                            name: {
                                                use: 'L',
                                                given: demographics.givenNames,
                                                family: demographics.familyName + 'blah'
                                            },
                                            asOtherIDs: {
                                                id: {
                                                    extension: demographics.ssn
                                                },
                                                classCode: 'SSN'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 200
                }, mvi1305Resp);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Error path: EDIPI 1309 Not Found, 1305 response: demograpics givenNames does not match', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mvi1305Resp = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: {
                            registrationEvent: {
                                subject1: {
                                    patient:{
                                        id: {
                                            extension: '0000000003^NI^200DOD^USDOD^P'
                                        },
                                        patientPerson: {
                                            name: {
                                                use: 'L',
                                                given: demographics.givenNames + 'blah',
                                                family: demographics.familyName
                                            },
                                            asOtherIDs: {
                                                id: {
                                                    extension: demographics.ssn
                                                },
                                                classCode: 'SSN'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 200
                }, mvi1305Resp);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };
            var mviClient = new MviClient(log, log, config, jds);
            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeTruthy();
                    expect(mviResult).toBeFalsy();
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
        it('Happy path: EDIPI 1309 No correlation 1305 OK', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mvi1305Resp = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: {
                            registrationEvent: {
                                subject1: {
                                    patient:{
                                        id: {
                                            extension: '0000000003^NI^200DOD^USDOD^P'
                                        },
                                        patientPerson: {
                                            name: {
                                                use: 'L',
                                                given: demographics.givenNames,
                                                family: demographics.familyName
                                            },
                                            asOtherIDs: {
                                                id: {
                                                    extension: demographics.ssn
                                                },
                                                classCode: 'SSN'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {
                    statusCode: 200
                }, mvi1305Resp);
            };
            request.get = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(/\?edipi=DOD%3B0000000003$/.test(options.url)).toBe(true);
                return callback(null, {
                    statusCode: 200
                }, JSON.stringify(mvi1309NotFoundResp));
            };

            var mviClient = new MviClient(log, log, config, jds);
            var patientIdentifier = {
                type: 'pid',
                value: 'DOD;0000000003'
            };

            var completed = false;
            runs(function() {
                mviClient.lookupWithDemographics(patientIdentifier, demographics, function(error, mviResult) {
                    expect(error).toBeFalsy();
                    expect(mviResult).toBeTruthy();
                    expect(mviResult.ids.length).toEqual(1);
                    expect(mviResult.skipResyncCheck).toBe(true);
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'Timed out waiting for lookup to complete.', 2000);

        });
    });
    //tests for mvi 1305 attended search interface
    describe('test _createDemographicsBasedOnMvi', function(){
        it('Error: input undefined, null, empty object', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var result = mviClient._createDemographicsBasedOnMvi(undefined);
            expect(_.isEmpty(result)).toBeTruthy();
        });
        it('Error: input name component missng use L', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var input = {
                name: {
                    given: 'test',
                    family: 'test1'
                }
            };
            var result = mviClient._createDemographicsBasedOnMvi(input);
            expect(_.isEmpty(result)).toBeTruthy();
        });
        it('OK: input name component', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var input = {
                name: {
                    use: 'L',
                    given: 'test',
                    family: 'test1'
                }
            };
            var result = mviClient._createDemographicsBasedOnMvi(input);
            expect(result).toBeTruthy();
            expect(result.givenNames).toEqual('test');
            expect(result.familyName).toEqual('test1');
        });
        it('Error: input SSN component missng use classCode', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var input = {
                asOtherIDs: {
                    id: {
                        extension: '111111234'
                    }
                }
            };
            var result = mviClient._createDemographicsBasedOnMvi(input);
            expect(_.isEmpty(result)).toBeTruthy();
        });
        it('OK: input SSN component', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var input = {
                asOtherIDs: {
                    id: {
                        extension: '111111234'
                    },
                    classCode: 'SSN'
                }
            };
            var result = mviClient._createDemographicsBasedOnMvi(input);
            expect(result).toBeTruthy();
            expect(result.ssn).toEqual('111111234');
        });
        it('OK: input birthDate, gender Code component', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var input = {
                birthTime: {
                    value: '19960707'
                },
                administrativeGenderCode: {
                    code: 'M'
                }
            };
            var result = mviClient._createDemographicsBasedOnMvi(input);
            expect(result).toBeTruthy();
            expect(result.birthDate).toEqual('19960707');
            expect(result.genderCode).toEqual('M');
        });
        it('OK: input address information', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var input = {
                addr: {
                    use: 'PHYS',
                    streetAddressLine: '1111 NOWHERE',
                    city: 'Any Town',
                    state: 'All State',
                    postalCode: '11111'
                }
            };
            var result = mviClient._createDemographicsBasedOnMvi(input);
            expect(result).toBeTruthy();
            expect(result.address).toBeTruthy();
            expect(_.isArray(result.address)).toBeTruthy();
            expect(result.address.length).toEqual(1);
            var address = result.address[0];
            expect(address.line1).toEqual(input.addr.streetAddressLine);
            expect(address.line1).toEqual(input.addr.streetAddressLine);
            expect(address.state).toEqual(input.addr.state);
            expect(address.zip).toEqual(input.addr.postalCode);
            expect(address.city).toEqual(input.addr.city);
        });
        it('OK: input telecom information', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var input = {
                telecom: {
                    use: 'HP',
                    value: '302-222-3334'
                }
            };
            var result = mviClient._createDemographicsBasedOnMvi(input);
            expect(result).toBeTruthy();
            expect(result.telecom).toBeTruthy();
            expect(_.isArray(result.telecom)).toBeTruthy();
            expect(result.telecom.length).toEqual(1);
            var telecom = result.telecom[0];
            expect(telecom.use).toEqual(input.telecom.use);
            expect(telecom.value).toEqual(input.telecom.value);
        });
    });

    describe('test _createPatientIdentifierBasedOnMvi', function(){
        it('Error: input undefined, null, not an string, or an empty string', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var result = mviClient._createPatientIdentifierBasedOnMvi(undefined);
            expect(result).toEqual(undefined);
            result = mviClient._createPatientIdentifierBasedOnMvi(null);
            expect(result).toEqual(undefined);
            result = mviClient._createPatientIdentifierBasedOnMvi({});
            expect(result).toEqual(undefined);
            result = mviClient._createPatientIdentifierBasedOnMvi('');
            expect(result).toEqual(undefined);
        });
        it('Error: invalid string input', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var result = mviClient._createPatientIdentifierBasedOnMvi('undefined');
            expect(result).toEqual(undefined);
            result = mviClient._createPatientIdentifierBasedOnMvi('200^TEST');
            expect(result).toEqual(undefined);
            result = mviClient._createPatientIdentifierBasedOnMvi('-1^TEST');
            expect(result).toEqual(undefined);
        });
        it('Error: PID Patient is not active!', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var result = mviClient._createPatientIdentifierBasedOnMvi('3^PI^500^USVHA');
            expect(result).toEqual(undefined);
        });
        it('OK: EDIPI Patient', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var result = mviClient._createPatientIdentifierBasedOnMvi('423212^NI^200DOD^USDOD^P');
            expect(result).toBeTruthy();
            expect(result.type).toEqual('edipi');
            expect(result.value).toEqual('423212');
        });
        it('OK: ICN Patient', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var result = mviClient._createPatientIdentifierBasedOnMvi('2345V1234^NI^200M^USVHA^P');
            expect(result).toBeTruthy();
            expect(result.type).toEqual('icn');
            expect(result.value).toEqual('2345V1234');
        });
        it('OK: PID Patient', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var result = mviClient._createPatientIdentifierBasedOnMvi('3^PI^500^USVHA^A');
            expect(result).toBeTruthy();
            expect(result.type).toEqual('pid');
            expect(result.value).toEqual('SITE;3');
        });
        it('OK: VHICID Patient Active', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var result = mviClient._createPatientIdentifierBasedOnMvi('1111^PI^742V1^USVHA^A');
            expect(result).toBeTruthy();
            expect(result.type).toEqual('vhicid');
            expect(result.value).toEqual('1111');
            expect(result.active).toBeTruthy();
        });
        it('OK: VHICID Patient Inactive', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var result = mviClient._createPatientIdentifierBasedOnMvi('1111^PI^742V1^USVHA^H');
            expect(result).toBeTruthy();
            expect(result.type).toEqual('vhicid');
            expect(result.value).toEqual('1111');
            expect(result.active).toBeFalsy();
        });
    });

    describe('test _makeAttendedSearchMVIResponse', function(){
        it('Error: input undefined, null, not an array, or an empty array', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse ;
            var result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(_.isEmpty(result)).toBeTruthy();
            mviResponse = null;
            result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(_.isEmpty(result)).toBeTruthy();
            mviResponse = {};
            result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(_.isEmpty(result)).toBeTruthy();
            mviResponse = [];
            result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(_.isEmpty(result)).toBeTruthy();
        });
        it('Error: input array not in valid format', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = [
                {
                    blah: 'blah'
                }
            ];
            var result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(_.isEmpty(result)).toBeTruthy();
            mviResponse =  [
                {
                    registrationEvent: {}
                }
            ];
            result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(_.isEmpty(result)).toBeTruthy();
            mviResponse =  [
                {
                    registrationEvent: {
                        subject1: {}
                    }
                }
            ];
            result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(_.isEmpty(result)).toBeTruthy();
            mviResponse =  [
                {
                    registrationEvent: {
                        subject1: {
                            patient:{}
                        }
                    }
                }
            ];
            result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(_.isEmpty(result)).toBeTruthy();
            mviResponse =  [
                {
                    registrationEvent: {
                        subject1: {
                            patient:{
                                id: {
                                }
                            }
                        }
                    }
                }
            ];
            result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(_.isEmpty(result)).toBeTruthy();
            mviResponse =  [
                {
                    registrationEvent: {
                        subject1: {
                            patient:{
                                id: {
                                    extension: '1234'
                                }
                            }
                        }
                    }
                }
            ];
            result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(_.isEmpty(result)).toBeTruthy();
        });
        it('OK: valid single edipi result input', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = [
                {
                    registrationEvent: {
                        subject1: {
                            patient:{
                                id: {
                                    extension: '0000000003^NI^200DOD^USDOD^P'
                                },
                                patientPerson: {
                                }
                            }
                        }
                    }
                }
            ];
            var nameComp = {
                use: 'L',
                given: 'test',
                family: 'test1'
            };
            var ssnComp = {
                id: {
                    extension: '111111234'
                },
                classCode: 'SSN'
            };
            mviResponse[0].registrationEvent.subject1.patient.patientPerson.name = nameComp;
            mviResponse[0].registrationEvent.subject1.patient.patientPerson.asOtherIDs = ssnComp;
            var result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(result).toBeTruthy();
            expect(_.isArray(result)).toBeTruthy();
            expect(result.length).toEqual(1);
            expect(result[0].patientIdentifier).toBeTruthy();
            expect(result[0].patientIdentifier.type).toEqual('edipi');
            expect(result[0].patientIdentifier.value).toEqual('0000000003');
            var demographics = result[0].demographics;
            expect(demographics).toBeTruthy();
            expect(_.isEmpty(demographics)).toBeFalsy();
            expect(demographics.givenNames).toEqual(nameComp.given);
            expect(demographics.familyName).toEqual(nameComp.family);
            expect(demographics.ssn).toEqual(ssnComp.id.extension);
        });
        it('OK: valid multiple results input', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = [
                {
                    registrationEvent: {
                        subject1: {
                            patient:{
                                id: {
                                    extension: '0000000003^NI^200DOD^USDOD^P'
                                },
                                patientPerson: {
                                }
                            }
                        }
                    }
                },
                {
                    registrationEvent: {
                        subject1: {
                            patient:{
                                id: {
                                    extension: '10108V420871^NI^200M^USVHA^P'
                                },
                                patientPerson: {
                                }
                            }
                        }
                    }
                }
            ];
            var nameComp0 = {
                use: 'L',
                given: 'test',
                family: 'test1'
            };
            var ssnComp0 = {
                id: {
                    extension: '111111234'
                },
                classCode: 'SSN'
            };
            var nameComp1 = {
                use: 'L',
                given: 'test',
                family: 'test2'
            };
            var ssnComp1 = {
                id: {
                    extension: '111111238'
                },
                classCode: 'SSN'
            };
            mviResponse[0].registrationEvent.subject1.patient.patientPerson.name = nameComp0;
            mviResponse[0].registrationEvent.subject1.patient.patientPerson.asOtherIDs = ssnComp0;
            mviResponse[1].registrationEvent.subject1.patient.patientPerson.name = nameComp1;
            mviResponse[1].registrationEvent.subject1.patient.patientPerson.asOtherIDs = ssnComp1;
            var result = mviClient._makeAttendedSearchMVIResponse(mviResponse);
            expect(result).toBeTruthy();
            expect(_.isArray(result)).toBeTruthy();
            expect(result.length).toEqual(2);
            var ids = _.pluck(result, 'patientIdentifier');
            expect(ids).toContain({
                type: 'icn',
                value: '10108V420871'
            });
        });
    });

    describe('test _parseMVIAttendedSearchResponse', function(){
        it('Error: empty response', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {};
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response missing PRPA_IN201306UV02', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                result: {
                    controlActProcess: {
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response missing controlActProcess', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response missing queryAck', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response missing queryResponseCode', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                        }
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response missing code', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {}
                        }
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code ER: Error', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'ER'
                            }
                        }
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code NF: Not found!', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'NF'
                            }
                        }
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code QE: Too many records!', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'QE'
                            }
                        }
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code AE: Application/System Error!', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'AE'
                            }
                        }
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code Unknown:', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'UNKNOWN'
                            }
                        }
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code OK with no result:', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        }
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code OK with empty subject:', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: {}
                    }
                }
            };
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('OK: response code OK with one valid subject:', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: {
                            registrationEvent: {
                                subject1: {
                                    patient:{
                                        id: {
                                            extension: '0000000003^NI^200DOD^USDOD^P'
                                        },
                                        patientPerson: {
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            var nameComp = {
                use: 'L',
                given: 'test',
                family: 'test1'
            };
            var ssnComp = {
                id: {
                    extension: '111111234'
                },
                classCode: 'SSN'
            };
            var patientPerson = mviResponse.PRPA_IN201306UV02.controlActProcess.subject.registrationEvent.subject1.patient.patientPerson;
            patientPerson.name = nameComp;
            patientPerson.asOtherIDs = ssnComp;
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(_.isArray(result)).toBeTruthy();
                expect(result.length).toEqual(1);
                expect(result[0].patientIdentifier).toBeTruthy();
                expect(result[0].patientIdentifier.type).toEqual('edipi');
                expect(result[0].patientIdentifier.value).toEqual('0000000003');
                expect(result[0].demographics.givenNames).toEqual(nameComp.given);
                expect(result[0].demographics.familyName).toEqual(nameComp.family);
                expect(result[0].demographics.ssn).toEqual(ssnComp.id.extension);
            });
        });
        it('OK: response code OK with multiple valid subjects:', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: [{
                            registrationEvent: {
                                subject1: {
                                    patient:{
                                        id: {
                                            extension: '0000000003^NI^200DOD^USDOD^P'
                                        },
                                        patientPerson: {
                                        }
                                    }
                                }
                            }
                        },
                        {
                            registrationEvent: {
                                subject1: {
                                    patient:{
                                        id: {
                                            extension: '5000000126V406128^NI^200M^USVHA^P'
                                        },
                                        patientPerson: {
                                        }
                                    }
                                }
                            }
                        }
                        ]
                    }
                }
            };
            var nameComp0 = {
                use: 'L',
                given: 'test',
                family: 'test1'
            };
            var ssnComp0 = {
                id: {
                    extension: '111111234'
                },
                classCode: 'SSN'
            };
            var nameComp1 = {
                use: 'L',
                given: 'test',
                family: 'test2'
            };
            var ssnComp1 = {
                id: {
                    extension: '111111238'
                },
                classCode: 'SSN'
            };
            var patientPerson0 = mviResponse.PRPA_IN201306UV02.controlActProcess.subject[0].registrationEvent.subject1.patient.patientPerson;
            patientPerson0.name = nameComp0;
            patientPerson0.asOtherIDs = ssnComp0;
            var patientPerson1 = mviResponse.PRPA_IN201306UV02.controlActProcess.subject[1].registrationEvent.subject1.patient.patientPerson;
            patientPerson1.name = nameComp1;
            patientPerson1.asOtherIDs = ssnComp1;
            mviClient._parseMVIAttendedSearchResponse(null, mviResponse, 1, function(err, result){
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(_.isArray(result)).toBeTruthy();
                expect(result.length).toEqual(2);
                expect(result[0].patientIdentifier).toBeTruthy();
                expect(result[0].patientIdentifier.type).toEqual('edipi');
                expect(result[0].patientIdentifier.value).toEqual('0000000003');
                expect(result[0].demographics.givenNames).toEqual(nameComp0.given);
                expect(result[0].demographics.familyName).toEqual(nameComp0.family);
                expect(result[0].demographics.ssn).toEqual(ssnComp0.id.extension);
                expect(result[1].patientIdentifier.type).toEqual('icn');
                expect(result[1].patientIdentifier.value).toEqual('5000000126V406128');
                expect(result[1].demographics.givenNames).toEqual(nameComp1.given);
                expect(result[1].demographics.familyName).toEqual(nameComp1.family);
                expect(result[1].demographics.ssn).toEqual(ssnComp1.id.extension);
            });
        });
    });

    describe('test attendedSearch', function(){
        var libPost;

        beforeEach(function() {
            libPost = request.post;
        });

        afterEach(function() {
            request.post = libPost;
        });
        it('Error: demographics is undefined, null or empty object', function(){
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(undefined, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
            mviClient.attendedSearch(null, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
            mviClient.attendedSearch({}, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: demographics missing required fields', function(){
            var mviClient = new MviClient(log, log, config, jds);
            var demographics = {
                givenNames: 'test'
            };
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
            demographics.familyName = 'test1';
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
            delete demographics.familyName;
            demographics.ssn = '111111234';
            mviClient.attendedSearch({}, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: Get 500 from soap handler mvi request', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                log.debug('options is %j', options);
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback('error', {
                    statusCode: 500
                }, null);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: Get 400 from soap handler mvi request', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback('error', {
                    statusCode: 400
                }, null);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: Get 404 from soap handler mvi request', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback('error', {
                    statusCode: 404
                }, null);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: Get 204 from soap handler mvi request', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback('error', {
                    statusCode: 204
                }, null);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: Get error from soap handler mvi request', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback('error', null, null);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: Get bad json body from soap handler mvi request', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, '{bad json: ');
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: invalid response format', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {}
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, mviResponse);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code ER: Error', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'ER'
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, mviResponse);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code NF: Not found!', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'NF'
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, mviResponse);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code QE: Too many records!', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'QE'
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, mviResponse);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code AE: Application/System Error!', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'AE'
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, mviResponse);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code Unknown:', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'UNKNOWN'
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, mviResponse);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code OK with no result:', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        }
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, mviResponse);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('Error: response code OK with empty subject:', function(){
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: {}
                    }
                }
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, mviResponse);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });
        it('OK: response code OK with one valid subject:', function(){
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: {
                            registrationEvent: {
                                subject1: {
                                    patient:{
                                        id: {
                                            extension: '0000000003^NI^200DOD^USDOD^P'
                                        },
                                        patientPerson: {
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            var nameComp = {
                use: 'L',
                given: 'test',
                family: 'test1'
            };
            var ssnComp = {
                id: {
                    extension: '111111234'
                },
                classCode: 'SSN'
            };
            var patientPerson = mviResponse.PRPA_IN201306UV02.controlActProcess.subject.registrationEvent.subject1.patient.patientPerson;
            patientPerson.name = nameComp;
            patientPerson.asOtherIDs = ssnComp;
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, mviResponse);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(_.isArray(result)).toBeTruthy();
                expect(result.length).toEqual(1);
                expect(result[0].patientIdentifier).toBeTruthy();
                expect(result[0].patientIdentifier.type).toEqual('edipi');
                expect(result[0].patientIdentifier.value).toEqual('0000000003');
                expect(result[0].demographics.givenNames).toEqual(nameComp.given);
                expect(result[0].demographics.familyName).toEqual(nameComp.family);
                expect(result[0].demographics.ssn).toEqual(ssnComp.id.extension);
            });
        });
        it('OK: response code OK with multiple valid subjects:', function(){
            var mviResponse = {
                PRPA_IN201306UV02: {
                    controlActProcess: {
                        queryAck: {
                            queryResponseCode: {
                                code: 'OK'
                            }
                        },
                        subject: [{
                            registrationEvent: {
                                subject1: {
                                    patient:{
                                        id: {
                                            extension: '0000000003^NI^200DOD^USDOD^P'
                                        },
                                        patientPerson: {
                                        }
                                    }
                                }
                            }
                        },
                        {
                            registrationEvent: {
                                subject1: {
                                    patient:{
                                        id: {
                                            extension: '5000000126V406128^NI^200M^USVHA^P'
                                        },
                                        patientPerson: {
                                        }
                                    }
                                }
                            }
                        }
                        ]
                    }
                }
            };
            var nameComp0 = {
                use: 'L',
                given: 'test',
                family: 'test1'
            };
            var ssnComp0 = {
                id: {
                    extension: '111111234'
                },
                classCode: 'SSN'
            };
            var nameComp1 = {
                use: 'L',
                given: 'test',
                family: 'test2'
            };
            var ssnComp1 = {
                id: {
                    extension: '111111238'
                },
                classCode: 'SSN'
            };
            var patientPerson0 = mviResponse.PRPA_IN201306UV02.controlActProcess.subject[0].registrationEvent.subject1.patient.patientPerson;
            patientPerson0.name = nameComp0;
            patientPerson0.asOtherIDs = ssnComp0;
            var patientPerson1 = mviResponse.PRPA_IN201306UV02.controlActProcess.subject[1].registrationEvent.subject1.patient.patientPerson;
            patientPerson1.name = nameComp1;
            patientPerson1.asOtherIDs = ssnComp1;
            var demographics = {
                givenNames: 'test',
                familyName: 'test1',
                ssn: '111111234'
            };
            request.post = function(options, callback) {
                expect(options).toBeTruthy();
                expect(options.url).toBeTruthy();
                expect(options.json).toBeTruthy();
                expect(options.json.firstName).toEqual(demographics.givenNames);
                expect(options.json.lastName).toEqual(demographics.familyName);
                expect(options.json.ssn).toEqual(demographics.ssn);
                return callback(null, {statusCode: 200}, mviResponse);
            };
            var mviClient = new MviClient(log, log, config, jds);
            mviClient.attendedSearch(demographics, function(err, result){
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                expect(_.isArray(result)).toBeTruthy();
                expect(result.length).toEqual(2);
                expect(result[0].patientIdentifier).toBeTruthy();
                expect(result[0].patientIdentifier.type).toEqual('edipi');
                expect(result[0].patientIdentifier.value).toEqual('0000000003');
                expect(result[0].demographics.givenNames).toEqual(nameComp0.given);
                expect(result[0].demographics.familyName).toEqual(nameComp0.family);
                expect(result[0].demographics.ssn).toEqual(ssnComp0.id.extension);
                expect(result[1].patientIdentifier.type).toEqual('icn');
                expect(result[1].patientIdentifier.value).toEqual('5000000126V406128');
                expect(result[1].demographics.givenNames).toEqual(nameComp1.given);
                expect(result[1].demographics.familyName).toEqual(nameComp1.family);
                expect(result[1].demographics.ssn).toEqual(ssnComp1.id.extension);
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
